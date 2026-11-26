import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORY_VALUES } from "@/lib/product-categories";

import { variantConfigurationSchema } from "@/lib/product-variants";
import { saveProductVariants } from "@/lib/save-product-variants";

const productUpdateSchema = z
  .object({
    hasVariants: z.boolean().optional(),
    colors: variantConfigurationSchema.shape.colors.optional(),
    variants: variantConfigurationSchema.shape.variants.optional(),
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    image: z.string().min(1).optional(),
    price: z.coerce.number().positive().optional(),
    category: z.enum(PRODUCT_CATEGORY_VALUES).optional(),
    tags: z.array(z.string()).optional(),
    inventory: z.coerce.number().int().min(0).optional(),
    featured: z.boolean().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id?: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const productId = resolvedParams?.id;

  if (!productId) {
    return NextResponse.json({ message: "Missing product id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const productData = productUpdateSchema.parse(body);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (typeof productData.name === "string") {
      updateData.name = productData.name;
    }

    if (typeof productData.description === "string") {
      updateData.description = productData.description;
    }

    if (typeof productData.image === "string") {
      updateData.image = productData.image;
    }

    if (typeof productData.price === "number") {
      updateData.price = new Prisma.Decimal(productData.price);
    }

    if (typeof productData.category === "string") {
      updateData.category = productData.category;
    }

    if (typeof productData.tags !== "undefined") {
      updateData.tags = productData.tags;
    }

    if (typeof productData.inventory === "number") {
      updateData.inventory = productData.inventory;
    }

    if (typeof productData.featured === "boolean") {
      updateData.featured = productData.featured;
    }

    if (typeof productData.rating === "number") {
      updateData.rating = productData.rating;
    }

    const configuration = productData.hasVariants !== undefined || productData.colors !== undefined || productData.variants !== undefined
      ? variantConfigurationSchema.parse(productData) : undefined;
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { id: productId, archived: false } });
      if (!existing) return { count: 0 };
      if (!configuration && existing.hasVariants) delete updateData.inventory;
      const result = await tx.product.updateMany({ where: { id: productId, archived: false }, data: { ...updateData, ...(configuration ? { hasVariants: configuration.hasVariants } : {}) } });
      if (configuration) await saveProductVariants(tx, productId, configuration);
      return result;
    }, { timeout: 20000 });
    if (updated.count === 0) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    return NextResponse.json({ message: "Product updated" }, { status: 200 });
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "A SKU or combination already exists. Use unique SKUs." }, { status: 409 });
    }
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
      { message: "Unable to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id?: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const productId = resolvedParams?.id;

  if (!productId) {
    return NextResponse.json({ message: "Missing product id" }, { status: 400 });
  }

  try {
    const archived = await prisma.product.updateMany({
      where: { id: productId, archived: false },
      data: { archived: true },
    });
    if (archived.count === 0) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product removed from the catalog" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Unable to delete product" },
      { status: 500 },
    );
  }
}
