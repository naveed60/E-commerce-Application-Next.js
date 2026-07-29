import { CheckoutReturnClient } from "@/components/checkout/checkout-return-client";

export default async function CheckoutReturnOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <CheckoutReturnClient orderId={orderId} />;
}
