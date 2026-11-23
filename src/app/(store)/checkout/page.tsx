import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { authOptions } from "@/lib/auth";
import { StorefrontShell } from "@/components/landing/storefront-shell";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?redirect=/checkout");
  }

  return <StorefrontShell><CheckoutClient customerName={session.user.name ?? ""} /></StorefrontShell>;
}
