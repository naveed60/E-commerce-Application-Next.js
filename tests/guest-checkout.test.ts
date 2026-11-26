import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { Prisma, PaymentAttemptStatus } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { createGuestToken, guestTokenHash, orderAccessWhere } from "../src/lib/commerce/order-access";
import { createPendingOrder, createCheckoutSession, getOrderStatusForCustomer, cancelPendingOrderForCustomer, CheckoutError } from "../src/lib/commerce/orders";

function replaceMethod(target: object, key: string, implementation: unknown, t: TestContext) {
  const previous = Reflect.get(target, key);
  Reflect.set(target, key, implementation);
  const restore = () => { Reflect.set(target, key, previous); };
  t.after(restore);
  return restore;
}

const guest = { userId: null, guestAccessHash: guestTokenHash(createGuestToken()) };
const input = {
  idempotencyKey: "guest-checkout-test-key",
  customerName: "Guest Customer",
  customerPhone: "+923001234567",
  shippingAddress: { line1: "12 Test Street", city: "Lahore", country: "PK" as const },
  items: [{ productId: "product-1", quantity: 2 }],
};

test("guest tokens are random, hashed, and invalid cookies authorize no orders", () => {
  const token = createGuestToken();
  assert.notEqual(token, createGuestToken());
  assert.notEqual(guestTokenHash(token), token);
  assert.equal(guestTokenHash("invalid"), null);
  assert.equal(guestTokenHash(undefined), null);
  assert.deepEqual(orderAccessWhere({ userId: null, guestAccessHash: null }), { OR: [] });
  assert.deepEqual(orderAccessWhere(guest), { OR: [{ userId: null, guestAccessHash: guest.guestAccessHash }] });
});

test("guest and account orders save contact, delivery and item snapshots with server prices", async (t) => {
  for (const access of [guest, { userId: "account-1", guestAccessHash: null }]) {
    let saved: Prisma.OrderUncheckedCreateInput | undefined;
    let reservation: unknown;
    const tx = {
      product: {
        findMany: async () => [{ id: "product-1", name: "Test Product", image: "/test.jpg", price: new Prisma.Decimal(125) }],
        updateMany: async (args: unknown) => { reservation = args; return { count: 1 }; },
      },
      order: { create: async ({ data }: { data: Prisma.OrderUncheckedCreateInput }) => { saved = data; return { id: "order-1", orderNumber: "NS-TEST", totalMinor: data.totalMinor }; } },
      paymentAttempt: { create: async () => ({ id: "attempt-1" }) },
    };
    const restore = replaceMethod(prisma, "$transaction", async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx), t);
    await createPendingOrder(access, "guest@example.com", input);
    assert.ok(saved);
    assert.equal(saved.userId, access.userId);
    assert.equal(saved.guestAccessHash, access.guestAccessHash);
    assert.equal(saved.customerName, input.customerName);
    assert.equal(saved.customerEmail, "guest@example.com");
    assert.equal(saved.customerPhone, input.customerPhone);
    assert.deepEqual(saved.shippingAddress, input.shippingAddress);
    assert.equal(saved.totalMinor, 25000);
    assert.deepEqual(saved.items?.create, [{ productId: "product-1", quantity: 2, price: new Prisma.Decimal(125), name: "Test Product", image: "/test.jpg", lineTotalMinor: 25000 }]);
    assert.deepEqual(reservation, { where: { id: "product-1", archived: false, inventory: { gte: 2 } }, data: { inventory: { decrement: 2 } } });
    restore();
  }
});

test("a guest cannot reuse another guest's or account's checkout key", async (t) => {
  let owner: { userId: string | null; guestAccessHash: string | null } = guest;
  replaceMethod(prisma.paymentAttempt, "findUnique", async () => ({ status: PaymentAttemptStatus.CREATING, order: owner }), t);
  await assert.rejects(createCheckoutSession({ userId: null, guestAccessHash: guestTokenHash(createGuestToken()) }, "other@example.com", input), (error: unknown) => error instanceof CheckoutError && error.code === "IDEMPOTENCY_CONFLICT");
  await assert.rejects(createCheckoutSession(guest, "guest@example.com", input), (error: unknown) => error instanceof CheckoutError && error.code === "CHECKOUT_RECONCILING");
  owner = { userId: "account-1", guestAccessHash: null };
  await assert.rejects(createCheckoutSession(guest, "guest@example.com", input), (error: unknown) => error instanceof CheckoutError && error.code === "IDEMPOTENCY_CONFLICT");
  await assert.rejects(createCheckoutSession({ userId: null, guestAccessHash: null }, "guest@example.com", input), (error: unknown) => error instanceof CheckoutError && error.code === "CHECKOUT_IDENTITY_REQUIRED");
});

test("status lookup and cancellation both constrain the order to its owner", async (t) => {
  let statusArgs: unknown;
  replaceMethod(prisma.order, "findFirst", async (args: unknown) => { statusArgs = args; return null; }, t);
  await getOrderStatusForCustomer("NS-TEST", guest);
  const where = (statusArgs as { where: unknown }).where;
  assert.deepEqual(where, { AND: [orderAccessWhere(guest), { OR: [{ id: "NS-TEST" }, { orderNumber: "NS-TEST" }] }] });
  let cancellationArgs: unknown;
  const tx = { order: { updateMany: async (args: unknown) => { cancellationArgs = args; return { count: 0 }; } } };
  replaceMethod(prisma, "$transaction", async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx), t);
  assert.equal(await cancelPendingOrderForCustomer("order-1", guest), false);
  assert.deepEqual(cancellationArgs, { where: { id: "order-1", ...orderAccessWhere(guest), status: "PENDING", paymentStatus: "PENDING" }, data: { status: "CANCELLED", paymentStatus: "FAILED" } });
});
