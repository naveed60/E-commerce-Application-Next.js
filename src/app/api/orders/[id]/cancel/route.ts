import { NextResponse } from "next/server";
import { checkoutIdentity } from "@/lib/commerce/checkout-identity";
import { cancelPendingOrderForCustomer } from "@/lib/commerce/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function originMatchesRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!originMatchesRequest(request)) {
    return NextResponse.json({ message: "Invalid cancellation origin." }, { status: 403 });
  }

  const access = await checkoutIdentity();
  const { id } = await params;
  const cancelled = await cancelPendingOrderForCustomer(id, access);
  return NextResponse.json({ cancelled });
}
