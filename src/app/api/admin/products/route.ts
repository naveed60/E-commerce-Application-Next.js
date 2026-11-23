import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORY_VALUES } from "@/lib/product-categories";

const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  price: z.coerce.number().positive(),
  category: z.enum(PRODUCT_CATEGORY_VALUES),
  tags: z.array(z.string()).optional().default([]),
  inventory: z.coerce.number().int().min(0).default(25),
  featured: z.boolean().default(false),
  rating: z.coerce.number().min(0).max(5).default(4.5),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { archived: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      priceLabel: `PKR ${new Intl.NumberFormat("en-PK").format(Math.round(product.price.toNumber()))}`,
      priceValue: product.price.toNumber(),
      featured: product.featured,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      category: (product as any).category ?? "",
      description: product.description,
      image: product.image,
      tags: product.tags,
      inventory: product.inventory,
      rating: product.rating,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const productData = productCreateSchema.parse(body);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.product.create as any)({
      data: {
        name: productData.name,
        description: productData.description,
        image: productData.image,
        price: new Prisma.Decimal(productData.price),
        category: productData.category,
        tags: productData.tags,
        inventory: productData.inventory,
        featured: productData.featured,
        rating: productData.rating,
      },
    });

    return NextResponse.json({ message: "Product created" }, { status: 201 });
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", "),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Unable to create product" },
      { status: 500 },
    );
  }
}
