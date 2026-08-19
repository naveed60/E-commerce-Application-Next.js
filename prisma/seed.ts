import {
  OrderStatus,
  PaymentStatus,
  PrismaClient,
  Role,
} from "@prisma/client";
import bcrypt from "bcrypt";
import { featuredProducts } from "@/data/products";

const prisma = new PrismaClient();

async function main() {
  const rawPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const password = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nextshop.dev" },
    update: {
      role: Role.ADMIN,
      password,
    },
    create: {
      email: "admin@nextshop.dev",
      name: "Design Lead",
      password,
      role: Role.ADMIN,
    },
  });

  for (const product of featuredProducts) {
    const data = {
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      tags: product.tags,
      rating: product.rating,
      featured: product.badge === "New Arrival" || product.badge === "Bestseller",
    };

    await prisma.product.upsert({
      where: { id: product.id },
      update: data,
      create: { id: product.id, ...data },
    });
  }

  const sampleOrderNumber = "DEMO-ORDER-001";
  const existingSampleOrder = await prisma.order.findUnique({
    where: { orderNumber: sampleOrderNumber },
    select: { id: true },
  });

  if (existingSampleOrder) {
    await prisma.$transaction([
      prisma.emailOutbox.deleteMany({ where: { orderId: existingSampleOrder.id } }),
      prisma.paymentAttempt.deleteMany({ where: { orderId: existingSampleOrder.id } }),
      prisma.orderItem.deleteMany({ where: { orderId: existingSampleOrder.id } }),
      prisma.order.delete({ where: { id: existingSampleOrder.id } }),
    ]);
  }

  const firstProduct = featuredProducts[0];
  const secondProduct = featuredProducts[1];
  const total = firstProduct.price + secondProduct.price * 2;

  await prisma.order.create({
    data: {
      userId: admin.id,
      orderNumber: sampleOrderNumber,
      total,
      totalMinor: Math.round(total * 100),
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.PAID,
      paidAt: new Date(),
      customerEmail: admin.email,
      customerName: admin.name,
      items: {
        create: [
          {
            productId: firstProduct.id,
            quantity: 1,
            price: firstProduct.price,
            name: firstProduct.name,
            image: firstProduct.image,
            lineTotalMinor: Math.round(firstProduct.price * 100),
          },
          {
            productId: secondProduct.id,
            quantity: 2,
            price: secondProduct.price,
            name: secondProduct.name,
            image: secondProduct.image,
            lineTotalMinor: Math.round(secondProduct.price * 2 * 100),
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
