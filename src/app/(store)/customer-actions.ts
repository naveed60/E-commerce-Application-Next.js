"use server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Result = { message: string; success: boolean };
export async function submitReview(_previous: Result, data: FormData): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Please sign in to submit a review." };
  const parsed = z.object({ productId: z.string().min(1).max(128), orderNumber: z.string().trim().min(1).max(128), rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().min(5).max(2000) }).safeParse({ productId: data.get("productId"), orderNumber: data.get("orderNumber"), rating: data.get("rating"), comment: data.get("comment") });
  if (!parsed.success) return { success: false, message: "Enter an order number, rating, and a review of at least 5 characters." };
  const { productId, orderNumber, rating, comment } = parsed.data;
  const order = await prisma.order.findFirst({ where: { userId: session.user.id, orderNumber, paymentStatus: "PAID", items: { some: { productId } } }, select: { id: true } });
  if (!order) return { success: false, message: "No paid order for this product was found in your account." };
  try { await prisma.productReview.create({ data: { userId: session.user.id, orderId: order.id, productId, rating, comment } }); }
  catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { success: false, message: "You have already reviewed this product for that order." }; throw error; }
  revalidatePath(`/products/${productId}`);
  return { success: true, message: "Thank you. Your review has been submitted for moderation." };
}
export async function submitRefund(_previous: Result, data: FormData): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Please sign in to request a refund." };
  const parsed = z.object({ orderNumber: z.string().trim().min(1).max(128), reason: z.string().trim().min(10).max(2000) }).safeParse({ orderNumber: data.get("orderNumber"), reason: data.get("reason") });
  if (!parsed.success) return { success: false, message: "Enter an order number and a reason of at least 10 characters." };
  const order = await prisma.order.findFirst({ where: { userId: session.user.id, orderNumber: parsed.data.orderNumber, paymentStatus: "PAID" }, select: { id: true } });
  if (!order) return { success: false, message: "No paid order with that number was found in your account." };
  await prisma.refundRequest.create({ data: { userId: session.user.id, orderId: order.id, reason: parsed.data.reason } });
  revalidatePath("/admin/refunds");
  return { success: true, message: "Your request has been submitted for review. This does not issue a refund automatically." };
}
