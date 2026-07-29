import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { cancelPendingOrderForUser } from "@/lib/commerce/orders";

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

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ message: "Please sign in to cancel this checkout." }, { status: 401 });
  }

  const { id } = await params;
  const cancelled = await cancelPendingOrderForUser(id, userId);
  return NextResponse.json({ cancelled });
}
