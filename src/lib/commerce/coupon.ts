type CouponRules = { active: boolean; startsAt: Date | null; expiresAt: Date | null; minimumMinor: number; percentOff: number };
export function couponDiscount(coupon: CouponRules | null, subtotalMinor: number, now = new Date()): number | null {
  if (!coupon || !coupon.active || (coupon.startsAt && coupon.startsAt > now) || (coupon.expiresAt && coupon.expiresAt <= now) || subtotalMinor < coupon.minimumMinor || coupon.percentOff < 1 || coupon.percentOff > 99) return null;
  return Math.floor(subtotalMinor * coupon.percentOff / 100);
}
