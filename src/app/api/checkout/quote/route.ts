import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toMinorUnits } from "@/lib/commerce/money";
import { couponDiscount } from "@/lib/commerce/coupon";

const schema = z.object({ code: z.string().trim().min(1).max(40).regex(/^[a-zA-Z0-9_-]+$/), items: z.array(z.object({ productId: z.string().min(1).max(128), quantity: z.number().int().min(1).max(10) })).min(1).max(20) });
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Please sign in." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Invalid coupon or cart." }, { status: 400 });
  const quantities = new Map<string, number>();
  for (const item of parsed.data.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  if ([...quantities.values()].some((quantity) => quantity > 10)) return NextResponse.json({ message: "Maximum 10 units per product." }, { status: 400 });
  const [coupon, products] = await Promise.all([prisma.coupon.findUnique({ where: { code: parsed.data.code.toUpperCase() } }), prisma.product.findMany({ where: { id: { in: [...quantities.keys()] }, archived: false }, select: { id: true, inventory: true, price: true } })]);
  if (products.length !== quantities.size || products.some((product) => product.inventory < quantities.get(product.id)!)) return NextResponse.json({ message: "One or more products are unavailable in the requested quantity." }, { status: 409 });
  const subtotal = products.reduce((sum, product) => sum + toMinorUnits(product.price) * quantities.get(product.id)!, 0);
  const discount = couponDiscount(coupon, subtotal);
  if (discount === null) return NextResponse.json({ message: "This coupon is invalid, expired, or does not meet the minimum order amount." }, { status: 400 });
  return NextResponse.json({ subtotalMinor: subtotal, discountMinor: discount, totalMinor: subtotal - discount }, { headers: { "Cache-Control": "no-store" } });
}
