import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toMinorUnits } from "@/lib/commerce/money";
import { couponDiscount } from "@/lib/commerce/coupon";

import { checkoutLineSchema, collapseLines, resolveCartLine } from "@/lib/commerce/cart-lines";

const schema = z.object({ code: z.string().trim().min(1).max(40).regex(/^[a-zA-Z0-9_-]+$/), items: z.array(checkoutLineSchema).min(1).max(20) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Invalid coupon or cart." }, { status: 400 });
  let lines;
  try { lines = collapseLines(parsed.data.items); }
  catch (error) { return NextResponse.json({ message: (error as Error).message }, { status: 400 }); }
  const [coupon, products] = await Promise.all([
    prisma.coupon.findUnique({ where: { code: parsed.data.code.toUpperCase() } }),
    prisma.product.findMany({ where: { id: { in: lines.map((line) => line.productId) }, archived: false }, include: { variants: true, colors: true } }),
  ]);
  let subtotal = 0;
  try {
    for (const line of lines) {
      const product = products.find((p) => p.id === line.productId);
      if (!product) throw new Error("One or more products are unavailable.");
      subtotal += toMinorUnits(resolveCartLine(product, line).price) * line.quantity;
    }
  } catch (error) { return NextResponse.json({ message: (error as Error).message }, { status: 409 }); }
  const discount = couponDiscount(coupon, subtotal);
  if (discount === null) return NextResponse.json({ message: "This coupon is invalid, expired, or does not meet the minimum order amount." }, { status: 400 });
  return NextResponse.json({ subtotalMinor: subtotal, discountMinor: discount, totalMinor: subtotal - discount }, { headers: { "Cache-Control": "no-store" } });
}
