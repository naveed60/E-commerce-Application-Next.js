import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getOrderStatusForUser } from "@/lib/commerce/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ message: "Please sign in to view this order." }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderStatusForUser(id, userId);
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
