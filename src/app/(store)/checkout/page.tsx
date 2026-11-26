import { getServerSession } from "next-auth";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { authOptions } from "@/lib/auth";
import { StorefrontShell } from "@/components/landing/storefront-shell";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  return <StorefrontShell><CheckoutClient customerName={session?.user?.name ?? ""} customerEmail={session?.user?.email ?? ""} /></StorefrontShell>;
}
