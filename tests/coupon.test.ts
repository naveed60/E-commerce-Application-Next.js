import assert from "node:assert/strict";
import test from "node:test";
import { couponDiscount } from "../src/lib/commerce/coupon";

const now = new Date("2026-11-23T12:00:00Z");
const valid = { active: true, startsAt: null, expiresAt: null, minimumMinor: 10000, percentOff: 15 };
test("calculates a percentage discount in minor units and rounds down", () => {
  assert.equal(couponDiscount(valid, 10001, now), 1500);
});
test("rejects disabled, out of date, or below-minimum coupons", () => {
  assert.equal(couponDiscount({ ...valid, active: false }, 20000, now), null);
  assert.equal(couponDiscount({ ...valid, startsAt: new Date("2026-11-24T00:00:00Z") }, 20000, now), null);
  assert.equal(couponDiscount({ ...valid, expiresAt: now }, 20000, now), null);
  assert.equal(couponDiscount(valid, 9999, now), null);
});
test("rejects invalid or missing discount rules", () => {
  assert.equal(couponDiscount(null, 20000, now), null);
  assert.equal(couponDiscount({ ...valid, percentOff: 100 }, 20000, now), null);
});
