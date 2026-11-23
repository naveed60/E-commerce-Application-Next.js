"use server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Unauthorized");
}
const couponSchema = z.object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{2,40}$/), percent: z.coerce.number().int().min(1).max(99), minimum: z.coerce.number().int().min(0).max(20000000), starts: z.string(), expires: z.string() });
export async function createCoupon(data: FormData) {
  await requireAdmin();
  const parsed = couponSchema.safeParse({ code: data.get("code"), percent: data.get("percent"), minimum: data.get("minimum"), starts: data.get("starts"), expires: data.get("expires") });
  if (!parsed.success) redirect("/admin/coupons?error=invalid");
  const startsAt = parsed.data.starts ? new Date(`${parsed.data.starts}Z`) : null;
  const expiresAt = parsed.data.expires ? new Date(`${parsed.data.expires}Z`) : null;
  if ((startsAt && Number.isNaN(startsAt.valueOf())) || (expiresAt && Number.isNaN(expiresAt.valueOf())) || (startsAt && expiresAt && expiresAt <= startsAt)) redirect("/admin/coupons?error=dates");
  try {
    await prisma.coupon.create({ data: { code: parsed.data.code, percentOff: parsed.data.percent, minimumMinor: parsed.data.minimum * 100, startsAt, expiresAt } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") redirect("/admin/coupons?error=duplicate");
    throw error;
  }
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}
export async function setCouponActive(data: FormData) {
  await requireAdmin();
  const parsed = z.object({ id: z.string().min(1), active: z.enum(["true", "false"]) }).parse({ id: data.get("id"), active: data.get("active") });
  await prisma.coupon.update({ where: { id: parsed.id }, data: { active: parsed.active === "true" } });
  revalidatePath("/admin/coupons");
}
export async function setReviewVisibility(data: FormData) {
  await requireAdmin();
  const parsed = z.object({ id: z.string().min(1), visible: z.enum(["true", "false"]) }).parse({ id: data.get("id"), visible: data.get("visible") });
  const review = await prisma.productReview.update({ where: { id: parsed.id }, data: { visible: parsed.visible === "true" }, select: { productId: true } });
  revalidatePath("/admin/reviews"); revalidatePath(`/products/${review.productId}`);
}
export async function setRefundStatus(data: FormData) {
  await requireAdmin();
  const parsed = z.object({ id: z.string().min(1), status: z.enum(["PENDING", "REVIEWED", "CLOSED"]) }).parse({ id: data.get("id"), status: data.get("status") });
  await prisma.refundRequest.update({ where: { id: parsed.id }, data: { status: parsed.status } });
  revalidatePath("/admin/refunds");
}
export async function fulfillOrder(data: FormData) {
  await requireAdmin();
  const id = z.string().min(1).max(128).parse(data.get("id"));
  await prisma.order.updateMany({ where: { id, status: "PAID", paymentStatus: "PAID" }, data: { status: "FULFILLED" } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin/overview");
  revalidatePath("/admin/analytics");
}
