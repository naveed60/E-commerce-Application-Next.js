import { CheckoutReturnClient } from "@/components/checkout/checkout-return-client";

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return <CheckoutReturnClient orderId={order ?? null} />;
}
