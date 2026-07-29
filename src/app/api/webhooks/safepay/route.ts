import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  isCheckoutError,
  isRetryableWebhookError,
  persistSafepayWebhookEvent,
  processSafepayWebhookEvent,
} from "@/lib/commerce/orders";
import {
  validateSafepayWebhookMerchantKey,
  verifySafepayWebhookSignature,
} from "@/lib/commerce/safepay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_WEBHOOK_BYTES = 1_000_000;

type WebhookEnvelope = {
  token?: unknown;
  type?: unknown;
  merchant_api_key?: unknown;
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_BYTES) {
    return NextResponse.json({ message: "Webhook payload is too large." }, { status: 413 });
  }

  if (!verifySafepayWebhookSignature(rawBody, request.headers.get("x-sfpy-signature"))) {
    return NextResponse.json({ message: "Invalid Safepay webhook signature." }, { status: 400 });
  }

  let payload: WebhookEnvelope & Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as WebhookEnvelope & Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Invalid webhook JSON." }, { status: 400 });
  }

  if (
    typeof payload.token !== "string" ||
    typeof payload.type !== "string" ||
    !validateSafepayWebhookMerchantKey(payload.merchant_api_key)
  ) {
    return NextResponse.json({ message: "Invalid Safepay webhook payload." }, { status: 400 });
  }

  const payloadHash = createHash("sha256").update(rawBody, "utf8").digest("hex");
  try {
    const event = await persistSafepayWebhookEvent({
      providerEventId: payload.token,
      payloadHash,
      type: payload.type,
      payload: payload as unknown as Prisma.InputJsonValue,
    });

    if (event.processedAt) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    await processSafepayWebhookEvent({
      eventId: event.id,
      type: payload.type,
      payload,
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    if (isRetryableWebhookError(error)) {
      console.error(
        "[safepay-webhook] Retrying webhook after local tracker race",
        error instanceof Error ? error.message : "Unknown retryable webhook error",
      );
      return NextResponse.json({ message: "Webhook will be retried." }, { status: 500 });
    }
    if (isCheckoutError(error)) {
      console.error("[safepay-webhook] Rejected webhook payload", error.code);
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("[safepay-webhook] Unable to process webhook", error);
    return NextResponse.json({ message: "Webhook processing failed." }, { status: 500 });
  }
}
