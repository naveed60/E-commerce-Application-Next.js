import { NextResponse } from "next/server";
import { checkoutIdentity } from "@/lib/commerce/checkout-identity";
import { getOrderStatusForCustomer } from "@/lib/commerce/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await checkoutIdentity();
  const { id } = await params;
  const order = await getOrderStatusForCustomer(id, access);
  if (!order) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  return NextResponse.json(
    {
      ...order,
      paidAt: order.paidAt?.toISOString() ?? null,
      checkoutExpiresAt: order.checkoutExpiresAt?.toISOString() ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
