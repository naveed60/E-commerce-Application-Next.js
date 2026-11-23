import { CheckoutCancelClient } from "@/components/checkout/checkout-cancel-client";

export default async function CheckoutCancelOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <CheckoutCancelClient orderId={orderId} />;
}
