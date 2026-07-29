"use client";

import { useCart } from "@/components/providers/cart-provider";
import { cn, formatPrice } from "@/lib/utils";
import { X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { items, total, isOpen, removeItem, closeCart } = useCart();
  const router = useRouter();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeCart}
      />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h3 className="text-lg font-semibold">Shopping Cart</h3>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full border border-transparent p-2 text-zinc-500 transition hover:border-zinc-200 hover:text-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex h-[calc(100%-180px)] flex-col gap-4 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-zinc-100 p-4 shadow-sm"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-zinc-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-zinc-900">{item.name}</p>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.id);
                        toast.success(`${item.name} removed from cart`);
                      }}
                      className="text-xs text-zinc-500 underline-offset-2 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm text-zinc-500">
                    Qty {item.quantity} · {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-zinc-100 px-6 py-5">
          <div className="flex items-center justify-between text-base font-semibold text-zinc-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button
            variant="primary"
            className="mt-4 w-full"
            disabled={!items.length}
            onClick={() => {
              closeCart();
              router.push("/nextshop/checkout");
            }}
          >
            Checkout
          </Button>
        </div>
      </div>
    </>
  );
}
