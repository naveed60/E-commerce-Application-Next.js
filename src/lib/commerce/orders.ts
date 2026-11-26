import { randomBytes } from "node:crypto";
import {
  EmailType,
  OrderStatus,
  PaymentAttemptStatus,
  PaymentStatus,
  Prisma,
  WebhookProvider,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fromMinorUnits, toMinorUnits } from "./money";
import { couponDiscount } from "./coupon";
import { orderAccessWhere, type OrderAccess } from "./order-access";
import {
  createSafepayCheckout,
  createSafepayHostedUrl,
  SafepayRequestError,
} from "./safepay";

const CHECKOUT_LIFETIME_MS = 55 * 60 * 1_000;
const COMMERCE_TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 20_000,
} as const;

import { collapseLines, resolveCartLine, type CheckoutLineInput } from "./cart-lines";
export type { CheckoutLineInput } from "./cart-lines";

export type ShippingAddressInput = {
  line1: string;
  line2?: string;
  city: string;
  province?: string;
  postalCode?: string;
  country: "PK";
};

export type CheckoutInput = {
  idempotencyKey: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: ShippingAddressInput;
  items: CheckoutLineInput[];
  couponCode?: string;
};

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

class RetryableWebhookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableWebhookError";
  }
}

type CreatedOrder = {
  id: string;
  orderNumber: string;
  totalMinor: number;
  paymentAttemptId: string;
};

function createOrderNumber(): string {
  return `NS-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function publicAppUrl(): string {
  const configured = process.env.APP_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (!configured) {
    throw new Error("APP_URL or NEXTAUTH_URL must be configured.");
  }
  try {
    // Safepay appends its own query parameter, so use the configured origin
    // without a pathname or query string.
    return new URL(configured).origin;
  } catch {
    throw new Error("APP_URL or NEXTAUTH_URL must be a valid absolute URL.");
  }
}

function checkoutUrls(orderId: string): { redirectUrl: string; cancelUrl: string } {
  const baseUrl = publicAppUrl();
  return {
    // Safepay appends `?tracker=...` itself, so keep the supplied URLs free
    // of query strings and encode our order id in the path instead.
    redirectUrl: `${baseUrl}/checkout/return/${encodeURIComponent(orderId)}`,
    cancelUrl: `${baseUrl}/checkout/cancel/${encodeURIComponent(orderId)}`,
  };
}

export async function createPendingOrder(
  access: OrderAccess,
  email: string,
  input: CheckoutInput,
): Promise<CreatedOrder> {
  if (!access.userId && !access.guestAccessHash) {
    throw new CheckoutError("Checkout identity is missing. Please try again.", 403, "CHECKOUT_IDENTITY_REQUIRED");
  }
  let lines: CheckoutLineInput[];
  try { lines = collapseLines(input.items); }
  catch (error) { throw new CheckoutError((error as Error).message, 400, "QUANTITY_LIMIT"); }
  if (!lines.length) {
    throw new CheckoutError("Your cart is empty.", 400, "EMPTY_CART");
  }

  // Neon adds network latency to each round trip. This block reserves stock,
  // creates the order, and records the idempotent payment attempt atomically,
  // so it needs a bounded timeout above Prisma's five-second default.
  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: lines.map((line) => line.productId) }, archived: false },
      include: { variants: true, colors: true },
    });
    const productById = new Map(products.map((product) => [product.id, product]));

    if (productById.size !== new Set(lines.map((line) => line.productId)).size) {
      throw new CheckoutError("One or more products are no longer available.", 409, "PRODUCT_UNAVAILABLE");
    }

    let totalMinor = 0;
    for (const line of lines) {
      const product = productById.get(line.productId);
      if (!product) {
        throw new CheckoutError("One or more products are no longer available.", 409, "PRODUCT_UNAVAILABLE");
      }

      let resolved: ReturnType<typeof resolveCartLine>;
      try { resolved = resolveCartLine(product, line); }
      catch (error) { throw new CheckoutError((error as Error).message, 409, "VARIANT_UNAVAILABLE"); }
      const reserved = await tx.product.updateMany({
        where: { id: product.id, archived: false, ...(product.hasVariants !== undefined ? { hasVariants: product.hasVariants } : {}), inventory: { gte: line.quantity } },
        data: { inventory: { decrement: line.quantity } },
      });
      if (reserved.count !== 1) {
        throw new CheckoutError(`${product.name} is no longer in stock.`, 409, "OUT_OF_STOCK");
      }

      if (resolved.variant) {
        const reservedVariant = await tx.productVariant.updateMany({
          where: { id: resolved.variant.id, productId: product.id, active: true, inventory: { gte: line.quantity } },
          data: { inventory: { decrement: line.quantity } },
        });
        if (reservedVariant.count !== 1) throw new CheckoutError(`${product.name}: the selected variant is no longer in stock.`, 409, "OUT_OF_STOCK");
      }
      totalMinor += toMinorUnits(resolved.price) * line.quantity;
      if (!Number.isSafeInteger(totalMinor)) {
        throw new CheckoutError("The order total is outside the supported range.", 400, "AMOUNT_OUT_OF_RANGE");
      }
    }

    let couponId: string | undefined;
    let discountMinor = 0;
    if (input.couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } });
      const discount = couponDiscount(coupon, totalMinor);
      if (!coupon || discount === null) {
        throw new CheckoutError("This coupon is invalid, expired, or does not meet the minimum order amount.", 400, "INVALID_COUPON");
      }
      couponId = coupon.id;
      discountMinor = discount;
      totalMinor -= discountMinor;
    }

    const order = await tx.order.create({
      data: {
        orderNumber: createOrderNumber(),
        userId: access.userId,
        guestAccessHash: access.userId ? null : access.guestAccessHash,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        total: fromMinorUnits(totalMinor),
        totalMinor,
        couponId,
        discountMinor,
        currency: "PKR",
        customerEmail: email,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        shippingAddress: input.shippingAddress,
        checkoutExpiresAt: new Date(Date.now() + CHECKOUT_LIFETIME_MS),
        items: {
          create: lines.map((line) => {
            const product = productById.get(line.productId)!;
            const resolved = resolveCartLine(product, line);
            const unitMinor = toMinorUnits(resolved.price);
            return {
              productId: product.id,
              quantity: line.quantity,
              price: resolved.price,
              name: product.name,
              image: resolved.image,
              ...(resolved.variant ? { variantId: resolved.variant.id, color: resolved.color?.name ?? null, size: resolved.variant.size || null, sku: resolved.variant.sku } : {}),
              lineTotalMinor: unitMinor * line.quantity,
            };
          }),
        },
      },
    });

    const attempt = await tx.paymentAttempt.create({
      data: {
        orderId: order.id,
        amountMinor: totalMinor,
        currency: "PKR",
        idempotencyKey: input.idempotencyKey,
        status: PaymentAttemptStatus.CREATING,
      },
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      totalMinor,
      paymentAttemptId: attempt.id,
    };
  }, COMMERCE_TRANSACTION_OPTIONS);
}

export async function releaseOrderInventory(orderId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return false;
    }

    const released = await tx.order.updateMany({
      where: {
        id: orderId,
        inventoryReleasedAt: null,
        paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED, PaymentStatus.EXPIRED] },
      },
      data: { inventoryReleasedAt: new Date() },
    });

    if (released.count !== 1) {
      return false;
    }

    for (const item of order.items) {
      // Take the product lock first, matching checkout and catalog edits.
      await tx.product.update({ where: { id: item.productId }, data: { updatedAt: new Date() } });
      if (item.variantId) {
        const variant = await tx.productVariant.update({ where: { id: item.variantId }, data: { inventory: { increment: item.quantity } } });
        if (variant.active) await tx.product.updateMany({ where: { id: item.productId, hasVariants: true }, data: { inventory: { increment: item.quantity } } });
      } else {
        await tx.product.updateMany({ where: { id: item.productId, hasVariants: false }, data: { inventory: { increment: item.quantity } } });
      }
    }
    return true;
  }, COMMERCE_TRANSACTION_OPTIONS);
}

async function markCheckoutSetupFailure(
  orderId: string,
  paymentAttemptId: string,
  error: SafepayRequestError,
): Promise<void> {
  if (!error.receivedResponse) {
    await prisma.$transaction([
      prisma.paymentAttempt.update({
        where: { id: paymentAttemptId },
        data: {
          status: PaymentAttemptStatus.REVIEW,
          failureMessage: error.message,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.REVIEW },
      }),
    ]);
    return;
  }

  await prisma.$transaction([
    prisma.paymentAttempt.update({
      where: { id: paymentAttemptId },
      data: {
        status: PaymentAttemptStatus.FAILED,
        failureCode: String(error.status ?? "SAFEPAY_SETUP_ERROR"),
        failureMessage: error.message,
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.FAILED },
    }),
  ]);
  await releaseOrderInventory(orderId);
}

export async function createCheckoutSession(
  access: OrderAccess,
  email: string,
  input: CheckoutInput,
): Promise<{ orderId: string; orderNumber: string; checkoutUrl: string; expiresAt: Date }> {
  if (!access.userId && !access.guestAccessHash) {
    throw new CheckoutError("Checkout identity is missing. Please try again.", 403, "CHECKOUT_IDENTITY_REQUIRED");
  }
  const existing = await prisma.paymentAttempt.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    include: { order: true },
  });

  if (existing) {
    const ownsOrder = existing.order.userId
      ? existing.order.userId === access.userId
      : Boolean(access.guestAccessHash && existing.order.guestAccessHash === access.guestAccessHash);
    if (!ownsOrder) {
      throw new CheckoutError("This checkout request is not available.", 409, "IDEMPOTENCY_CONFLICT");
    }
    if (existing.status === PaymentAttemptStatus.PENDING && existing.tracker) {
      if (existing.order.checkoutExpiresAt && existing.order.checkoutExpiresAt <= new Date()) {
        throw new CheckoutError("This checkout session has expired. Start a new checkout to try again.", 409, "CHECKOUT_EXPIRED");
      }
      const { redirectUrl, cancelUrl } = checkoutUrls(existing.orderId);
      const checkoutUrl = await createSafepayHostedUrl({
        tracker: existing.tracker,
        redirectUrl,
        cancelUrl,
      });
      return {
        orderId: existing.orderId,
        orderNumber: existing.order.orderNumber,
        checkoutUrl,
        expiresAt: existing.order.checkoutExpiresAt ?? new Date(Date.now() + CHECKOUT_LIFETIME_MS),
      };
    }
    if (existing.status === PaymentAttemptStatus.CREATING || existing.status === PaymentAttemptStatus.REVIEW) {
      throw new CheckoutError(
        "This payment session is still being reconciled. Please contact support if it does not appear shortly.",
        409,
        "CHECKOUT_RECONCILING",
      );
    }
    throw new CheckoutError("This checkout request has already finished. Start a new checkout to try again.", 409, "CHECKOUT_FINISHED");
  }

  let created: CreatedOrder;
  try {
    created = await createPendingOrder(access, email, input);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // A double-click can race before the first transaction is visible. The
      // unique idempotency key means it is safe to resolve through the first.
      return createCheckoutSession(access, email, input);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2028") {
      // Prisma rolled back the entire transaction, so the browser can safely
      // submit again with a fresh idempotency key.
      throw new CheckoutError(
        "Checkout is taking longer than expected. Please try again.",
        503,
        "CHECKOUT_DATABASE_TIMEOUT",
      );
    }
    throw error;
  }
  const { redirectUrl, cancelUrl } = checkoutUrls(created.id);

  try {
    const session = await createSafepayCheckout({
      amountMinor: created.totalMinor,
      orderId: created.id,
      redirectUrl,
      cancelUrl,
    });

    const updated = await prisma.paymentAttempt.update({
      where: { id: created.paymentAttemptId },
      data: {
        status: PaymentAttemptStatus.PENDING,
        tracker: session.tracker,
        providerPayload: { tracker: session.tracker },
      },
      include: { order: true },
    });

    return {
      orderId: updated.orderId,
      orderNumber: updated.order.orderNumber,
      checkoutUrl: session.checkoutUrl,
      expiresAt: updated.order.checkoutExpiresAt ?? new Date(Date.now() + CHECKOUT_LIFETIME_MS),
    };
  } catch (error) {
    if (error instanceof SafepayRequestError) {
      await markCheckoutSetupFailure(created.id, created.paymentAttemptId, error);
      if (error.receivedResponse) {
        throw new CheckoutError("Unable to start Safepay checkout. Please try again.", 502, "SAFEPAY_SETUP_FAILED");
      }
      throw new CheckoutError(
        "Safepay did not respond. This order is being reconciled to prevent an accidental duplicate charge.",
        503,
        "SAFEPAY_RECONCILIATION_REQUIRED",
      );
    }
    throw error;
  }
}

type SafepayWebhookPayload = {
  token: string;
  type: string;
  merchant_api_key: string;
  data: {
    tracker?: string;
    amount?: number;
    currency?: string;
    metadata?: {
      order_id?: string;
      payment_attempt_id?: string;
    };
    reference?: string;
    code?: string | number;
    message?: string;
  };
};

function createConfirmationPayload(order: {
  orderNumber: string;
  customerName: string | null;
  currency: string;
  totalMinor: number;
  discountMinor: number;
  items: Array<{ name: string | null; color?: string | null; size?: string | null; sku?: string | null; quantity: number; lineTotalMinor: number | null }>;
}) {
  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName ?? "Customer",
    currency: order.currency,
    totalMinor: order.totalMinor,
    discountMinor: order.discountMinor,
    items: order.items.map((item) => ({
      name: [item.name ?? "Product", item.color, item.size, item.sku].filter(Boolean).join(" / "),
      quantity: item.quantity,
      lineTotalMinor: item.lineTotalMinor ?? 0,
    })),
  };
}

function isSafepayWebhookPayload(value: unknown): value is SafepayWebhookPayload {
  if (!value || typeof value !== "object") {
    return false;
  }
  const payload = value as Partial<SafepayWebhookPayload>;
  return (
    typeof payload.token === "string" &&
    typeof payload.type === "string" &&
    typeof payload.merchant_api_key === "string" &&
    Boolean(payload.data) &&
    typeof payload.data === "object"
  );
}

export async function processSafepayWebhookEvent(input: {
  eventId: string;
  type: string;
  payload: unknown;
}): Promise<void> {
  if (!isSafepayWebhookPayload(input.payload)) {
    throw new CheckoutError("Invalid Safepay webhook payload.", 400, "INVALID_WEBHOOK_PAYLOAD");
  }

  const event = input.payload;
  if (!event.type.startsWith("payment.")) {
    await prisma.webhookEvent.update({
      where: { id: input.eventId },
      data: { processedAt: new Date(), processingError: null },
    });
    return;
  }
  if (!event.data.tracker) {
    throw new CheckoutError("Payment webhook does not contain a tracker.", 400, "INVALID_PAYMENT_WEBHOOK");
  }
  const attempt = await prisma.paymentAttempt.findFirst({
    where: {
      OR: [
        { tracker: event.data.tracker },
        ...(event.data.metadata?.payment_attempt_id
          ? [{ id: event.data.metadata.payment_attempt_id }]
          : []),
        ...(event.data.metadata?.order_id
          ? [{ orderId: event.data.metadata.order_id }]
          : []),
      ],
    },
    include: {
      order: {
        include: { items: true },
      },
    },
  });

  if (!attempt) {
    throw new RetryableWebhookError("Payment tracker is not available locally yet.");
  }

  await prisma.$transaction(async (tx) => {
    const eventRecord = await tx.webhookEvent.findUnique({ where: { id: input.eventId } });
    if (!eventRecord || eventRecord.processedAt) {
      return;
    }

    const payment = await tx.paymentAttempt.findUnique({
      where: { id: attempt.id },
      include: { order: { include: { items: true } } },
    });
    if (!payment) {
      throw new RetryableWebhookError("Payment attempt disappeared during webhook processing.");
    }

    const metadata = event.data.metadata;
    const hasMatchingMetadata =
      (!metadata?.order_id || metadata.order_id === payment.orderId) &&
      (!metadata?.payment_attempt_id || metadata.payment_attempt_id === payment.id);
    const trackerMatches = payment.tracker
      ? event.data.tracker === payment.tracker
      : metadata?.order_id === payment.orderId;
    const hasMatchingPayment =
      trackerMatches &&
      (!event.data.currency || event.data.currency === payment.currency) &&
      (event.data.amount === undefined || event.data.amount === payment.amountMinor) &&
      hasMatchingMetadata;

    if (!hasMatchingPayment) {
      await tx.paymentAttempt.update({
        where: { id: payment.id },
        data: {
          status: PaymentAttemptStatus.REVIEW,
          failureMessage: "Safepay webhook did not match the local payment amount, currency, tracker, or metadata.",
        },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: PaymentStatus.REVIEW },
      });
      await tx.webhookEvent.update({
        where: { id: eventRecord.id },
        data: { processedAt: new Date(), processingError: "Payment mismatch; manual review required." },
      });
      return;
    }

    if (event.type === "payment.succeeded") {
      if (payment.order.paymentStatus === PaymentStatus.EXPIRED || payment.order.status === OrderStatus.CANCELLED) {
        await tx.paymentAttempt.update({
          where: { id: payment.id },
          data: { status: PaymentAttemptStatus.REVIEW, failureMessage: "Payment succeeded after the order expired." },
        });
        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: PaymentStatus.REVIEW },
        });
        await tx.webhookEvent.update({
          where: { id: eventRecord.id },
          data: { processedAt: new Date(), processingError: "Payment succeeded after expiry; manual review required." },
        });
        return;
      }

      const paidAt = new Date();
      await tx.paymentAttempt.update({
        where: { id: payment.id },
        data: {
          status: PaymentAttemptStatus.PAID,
          tracker: payment.tracker ?? event.data.tracker,
          paidAt,
          providerReference: event.data.reference ?? null,
          failureCode: null,
          failureMessage: null,
        },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAID, paymentStatus: PaymentStatus.PAID, paidAt },
      });

      if (payment.order.customerEmail) {
        await tx.emailOutbox.upsert({
          where: {
            orderId_type: {
              orderId: payment.orderId,
              type: EmailType.ORDER_CONFIRMATION,
            },
          },
          create: {
            orderId: payment.orderId,
            type: EmailType.ORDER_CONFIRMATION,
            recipient: payment.order.customerEmail,
            payload: createConfirmationPayload(payment.order),
            idempotencyKey: `order-confirmation/${payment.orderId}/v1`,
          },
          update: {},
        });
      }
    } else if (event.type === "payment.failed") {
      // Safepay can emit payment.failed before a customer retries successfully
      // with the same tracker. Keep the reservation until the session expires.
      if (payment.status !== PaymentAttemptStatus.PAID) {
        await tx.paymentAttempt.update({
          where: { id: payment.id },
          data: {
            tracker: payment.tracker ?? event.data.tracker,
            failureCode: event.data.code ? String(event.data.code) : null,
            failureMessage: event.data.message ?? "Payment failed at Safepay.",
          },
        });
      }
    } else if (event.type === "payment.refunded") {
      await tx.paymentAttempt.update({
        where: { id: payment.id },
        data: { status: PaymentAttemptStatus.REFUNDED },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: PaymentStatus.REFUNDED },
      });
    }

    await tx.webhookEvent.update({
      where: { id: eventRecord.id },
      data: { processedAt: new Date(), processingError: null },
    });
  }, COMMERCE_TRANSACTION_OPTIONS);
}

export async function persistSafepayWebhookEvent(input: {
  providerEventId: string;
  payloadHash: string;
  type: string;
  payload: Prisma.InputJsonValue;
}): Promise<{ id: string; processedAt: Date | null }> {
  const existing = await prisma.webhookEvent.findFirst({
    where: {
      provider: WebhookProvider.SAFEPAY,
      OR: [{ providerEventId: input.providerEventId }, { payloadHash: input.payloadHash }],
    },
  });
  if (existing) {
    return { id: existing.id, processedAt: existing.processedAt };
  }

  try {
    const created = await prisma.webhookEvent.create({
      data: {
        provider: WebhookProvider.SAFEPAY,
        providerEventId: input.providerEventId,
        payloadHash: input.payloadHash,
        type: input.type,
        payload: input.payload,
      },
    });
    return { id: created.id, processedAt: created.processedAt };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const duplicate = await prisma.webhookEvent.findFirst({
        where: {
          provider: WebhookProvider.SAFEPAY,
          OR: [{ providerEventId: input.providerEventId }, { payloadHash: input.payloadHash }],
        },
      });
      if (duplicate) {
        return { id: duplicate.id, processedAt: duplicate.processedAt };
      }
    }
    throw error;
  }
}

export function isRetryableWebhookError(error: unknown): boolean {
  return error instanceof RetryableWebhookError;
}

export async function getOrderStatusForCustomer(orderId: string, access: OrderAccess) {
  return prisma.order.findFirst({
    where: { AND: [orderAccessWhere(access), { OR: [{ id: orderId }, { orderNumber: orderId }] }] },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalMinor: true,
      currency: true,
      paidAt: true,
      checkoutExpiresAt: true,
    },
  });
}

export async function cancelPendingOrderForCustomer(orderId: string, access: OrderAccess): Promise<boolean> {
  const cancelled = await prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: {
        id: orderId,
        ...orderAccessWhere(access),
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
      data: { status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.FAILED },
    });
    if (result.count !== 1) {
      return false;
    }
    await tx.paymentAttempt.updateMany({
      where: { orderId, status: PaymentAttemptStatus.PENDING },
      data: { status: PaymentAttemptStatus.FAILED, failureMessage: "Customer cancelled checkout." },
    });
    return true;
  }, COMMERCE_TRANSACTION_OPTIONS);

  if (cancelled) {
    await releaseOrderInventory(orderId);
  }
  return cancelled;
}

export async function expireOutstandingCheckouts(limit = 100): Promise<number> {
  const expired = await prisma.order.findMany({
    where: {
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      checkoutExpiresAt: { lt: new Date() },
    },
    select: { id: true },
    take: limit,
    orderBy: { checkoutExpiresAt: "asc" },
  });

  let count = 0;
  for (const order of expired) {
    const updated = await prisma.order.updateMany({
      where: {
        id: order.id,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
      data: { status: OrderStatus.CANCELLED, paymentStatus: PaymentStatus.EXPIRED },
    });
    if (updated.count === 1) {
      await prisma.paymentAttempt.updateMany({
        where: { orderId: order.id, status: PaymentAttemptStatus.PENDING },
        data: { status: PaymentAttemptStatus.EXPIRED },
      });
      await releaseOrderInventory(order.id);
      count += 1;
    }
  }
  return count;
}

export function isCheckoutError(error: unknown): error is CheckoutError {
  return error instanceof CheckoutError;
}
