import { EmailStatus, Prisma } from "@prisma/client";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { formatMinorPkr } from "./money";

type ConfirmationEmailPayload = {
  orderNumber: string;
  customerName: string;
  currency: string;
  totalMinor: number;
  items: Array<{
    name: string;
    quantity: number;
    lineTotalMinor: number;
  }>;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isConfirmationPayload(value: Prisma.JsonValue): value is ConfirmationEmailPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const payload = value as Partial<ConfirmationEmailPayload>;
  return (
    typeof payload.orderNumber === "string" &&
    typeof payload.customerName === "string" &&
    typeof payload.totalMinor === "number" &&
    Array.isArray(payload.items)
  );
}

function renderConfirmationEmail(payload: ConfirmationEmailPayload): { html: string; text: string } {
  const items = payload.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; color: #18181b;">${escapeHtml(item.name)}</td>
          <td style="padding: 10px 0; color: #52525b; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 0; color: #18181b; text-align: right;">${formatMinorPkr(item.lineTotalMinor)}</td>
        </tr>`,
    )
    .join("");
  const total = formatMinorPkr(payload.totalMinor);
  const textItems = payload.items
    .map((item) => `${item.name} × ${item.quantity} — ${formatMinorPkr(item.lineTotalMinor)}`)
    .join("\n");

  return {
    html: `<!doctype html>
      <html lang="en">
        <body style="margin: 0; background: #f4f4f5; color: #18181b; font-family: Arial, sans-serif;">
          <main style="max-width: 600px; margin: 32px auto; background: #ffffff; padding: 36px; border-radius: 20px;">
            <p style="margin: 0 0 8px; color: #71717a; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">NextShop</p>
            <h1 style="margin: 0 0 16px; font-size: 26px;">Thanks for your order, ${escapeHtml(payload.customerName)}.</h1>
            <p style="margin: 0 0 28px; color: #52525b; line-height: 1.5;">Your Safepay payment has been confirmed. We’ll let you know when your order is on its way.</p>
            <p style="margin: 0 0 20px; font-weight: 700;">Order ${escapeHtml(payload.orderNumber)}</p>
            <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #e4e4e7; border-bottom: 1px solid #e4e4e7;">
              <tbody>${items}</tbody>
            </table>
            <p style="margin: 20px 0 0; font-size: 18px; font-weight: 700; text-align: right;">Total: ${total}</p>
            <p style="margin: 28px 0 0; color: #71717a; font-size: 13px; line-height: 1.5;">Keep this email for your records. If you need help, reply to this message and include your order number.</p>
          </main>
        </body>
      </html>`,
    text: `Thanks for your order, ${payload.customerName}.\n\nYour Safepay payment has been confirmed.\nOrder ${payload.orderNumber}\n\n${textItems}\n\nTotal: ${total}`,
  };
}

function maxRetries(): number {
  const configured = Number(process.env.RESEND_MAX_RETRIES ?? "5");
  return Number.isInteger(configured) && configured >= 1 && configured <= 10 ? configured : 5;
}

function retryAt(attempt: number): Date {
  const delayMs = Math.min(15 * 60 * 1_000, 60_000 * 2 ** Math.max(0, attempt - 1));
  return new Date(Date.now() + delayMs);
}

async function sendOutboxEmail(job: {
  recipient: string;
  payload: Prisma.JsonValue;
  idempotencyKey: string;
}): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and EMAIL_FROM must be configured before sending order email.");
  }
  if (!isConfirmationPayload(job.payload)) {
    throw new Error("Order confirmation email payload is invalid.");
  }

  const content = renderConfirmationEmail(job.payload);
  const resend = new Resend(apiKey);
  const response = await resend.emails.send(
    {
      from,
      to: [job.recipient],
      subject: `Order confirmed — ${job.payload.orderNumber}`,
      html: content.html,
      text: content.text,
    },
    { idempotencyKey: job.idempotencyKey },
  );

  if (response.error) {
    throw new Error(response.error.message);
  }
  if (!response.data?.id) {
    throw new Error("Resend did not return an email identifier.");
  }
  return response.data.id;
}

/** Processes queued emails. It is safe to invoke from cron or a job worker. */
export async function processEmailOutbox(limit = 20): Promise<{ sent: number; retried: number; failed: number }> {
  const now = new Date();
  const staleProcessingBefore = new Date(Date.now() - 10 * 60 * 1_000);
  const jobs = await prisma.emailOutbox.findMany({
    where: {
      OR: [
        { status: EmailStatus.PENDING, nextAttemptAt: { lte: now } },
        { status: EmailStatus.PROCESSING, updatedAt: { lte: staleProcessingBefore } },
      ],
    },
    orderBy: { nextAttemptAt: "asc" },
    take: limit,
  });

  let sent = 0;
  let retried = 0;
  let failed = 0;

  for (const job of jobs) {
    const claimed = await prisma.emailOutbox.updateMany({
      where: {
        id: job.id,
        OR: [
          { status: EmailStatus.PENDING, nextAttemptAt: { lte: now } },
          { status: EmailStatus.PROCESSING, updatedAt: { lte: staleProcessingBefore } },
        ],
      },
      data: {
        status: EmailStatus.PROCESSING,
        attemptCount: { increment: 1 },
      },
    });
    if (claimed.count !== 1) {
      continue;
    }

    const attempt = job.attemptCount + 1;
    try {
      const providerMessageId = await sendOutboxEmail(job);
      await prisma.emailOutbox.update({
        where: { id: job.id },
        data: {
          status: EmailStatus.SENT,
          providerMessageId,
          sentAt: new Date(),
          lastError: null,
        },
      });
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 1_000) : "Unknown email delivery error.";
      const terminal = attempt >= maxRetries();
      await prisma.emailOutbox.update({
        where: { id: job.id },
        data: {
          status: terminal ? EmailStatus.FAILED : EmailStatus.PENDING,
          nextAttemptAt: terminal ? new Date() : retryAt(attempt),
          lastError: message,
        },
      });
      if (terminal) {
        failed += 1;
      } else {
        retried += 1;
      }
    }
  }

  return { sent, retried, failed };
}
