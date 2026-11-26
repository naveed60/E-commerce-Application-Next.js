import { checkoutLineSchema } from "@/lib/commerce/cart-lines";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { createGuestToken, guestTokenHash, GUEST_CHECKOUT_COOKIE, GUEST_CHECKOUT_MAX_AGE } from "@/lib/commerce/order-access";
import { createCheckoutSession, isCheckoutError } from "@/lib/commerce/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  idempotencyKey: z.string().min(16).max(128),
  customerEmail: z.string().trim().email().max(254),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().regex(/^\+?[0-9]{8,15}$/, "Use an international phone number."),
  couponCode: z.string().trim().max(40).regex(/^[a-zA-Z0-9_-]*$/).optional(),
  shippingAddress: z.object({
    line1: z.string().trim().min(4).max(150),
    line2: z.string().trim().max(150).optional(),
    city: z.string().trim().min(2).max(80),
    province: z.string().trim().max(80).optional(),
    postalCode: z.string().trim().max(20).optional(),
    country: z.literal("PK"),
  }),
  items: z
    .array(
      checkoutLineSchema,
    )
    .min(1)
    .max(20),
});

function requestOriginIsTrusted(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  const allowed = new Set([new URL(request.url).origin]);
  const configuredAppUrl = process.env.APP_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (configuredAppUrl) {
    try {
      allowed.add(new URL(configuredAppUrl).origin);
    } catch {
      // Environment validation happens when checkout creates its Safepay URLs.
    }
  }
  return allowed.has(origin);
}

export async function POST(request: Request) {
  if (!requestOriginIsTrusted(request)) {
    return NextResponse.json({ message: "Invalid checkout origin." }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid checkout details.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const [session, cookieStore] = await Promise.all([getServerSession(authOptions), cookies()]);
  const userId = session?.user?.id || null;
  let token = cookieStore.get(GUEST_CHECKOUT_COOKIE)?.value;
  if (!userId && !guestTokenHash(token)) token = createGuestToken();
  if (!userId && token) {
    // Set before creating the order, including on recoverable payment failures,
    // so a retry remains bound to the same guest and idempotency key.
    cookieStore.set(GUEST_CHECKOUT_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: GUEST_CHECKOUT_MAX_AGE,
    });
  }
  const access = { userId, guestAccessHash: guestTokenHash(token) };

  try {
    const checkout = await createCheckoutSession(access, parsed.data.customerEmail, parsed.data);
    return NextResponse.json(
      {
        orderId: checkout.orderId,
        orderNumber: checkout.orderNumber,
        checkoutUrl: checkout.checkoutUrl,
        expiresAt: checkout.expiresAt.toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (isCheckoutError(error)) {
      return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
    }

    console.error("[checkout] Unable to create Safepay checkout session", error);
    return NextResponse.json(
      { message: "Unable to start checkout. Please try again shortly." },
      { status: 500 },
    );
  }
}
