import { CheckoutCancelClient } from "@/components/checkout/checkout-cancel-client";

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return <CheckoutCancelClient orderId={order ?? null} />;
}
