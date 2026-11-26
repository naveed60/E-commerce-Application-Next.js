import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GUEST_CHECKOUT_COOKIE, guestTokenHash, type OrderAccess } from "./order-access";

export async function checkoutIdentity(): Promise<OrderAccess> {
  const [session, cookieStore] = await Promise.all([getServerSession(authOptions), cookies()]);
  return {
    userId: session?.user?.id || null,
    guestAccessHash: guestTokenHash(cookieStore.get(GUEST_CHECKOUT_COOKIE)?.value),
  };
}
