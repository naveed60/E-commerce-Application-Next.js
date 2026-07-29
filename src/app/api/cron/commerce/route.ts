import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processEmailOutbox } from "@/lib/commerce/email";
import { expireOutstandingCheckouts } from "@/lib/commerce/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasValidCronSecret(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization");
  if (!expected || !authorization?.startsWith("Bearer ")) {
    return false;
  }
  const received = authorization.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function GET(request: Request) {
  if (!hasValidCronSecret(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [expiredOrders, emails] = await Promise.all([
      expireOutstandingCheckouts(),
      processEmailOutbox(),
    ]);
    return NextResponse.json({ ok: true, expiredOrders, emails });
  } catch (error) {
    console.error("[commerce-cron] Processing failed", error);
    return NextResponse.json({ message: "Commerce job failed." }, { status: 500 });
  }
}
