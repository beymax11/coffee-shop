"use client";

import React, { useRef, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { X, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export const CartDrawer: React.FC = () => {
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);
  const getCartCount = useCartStore((state) => state.getCartCount);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isCartOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeCart();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCartOpen, closeCart]);

  // Disable scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  const subtotal = getCartSubtotal();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0d0d0d] text-[#F5F5F0] shadow-2xl glassmorphism"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-gold" />
                <h3 className="type-h3">Your Cart</h3>
                <span className="rounded-full bg-brand-gold/10 border border-brand-gold/30 px-2.5 py-0.5 type-body-sm font-semibold text-brand-gold">
                  {getCartCount()}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="rounded-full border border-white/5 bg-white/5 p-2 text-zinc-400 hover:text-white transition-all"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-white/5 border border-white/5 p-6 text-zinc-600 mb-4">
                    <ShoppingBag size={48} className="stroke-[1.5]" />
                  </div>
                  <h4 className="type-card-title text-white">Your cart is empty</h4>
                  <p className="mt-2 type-caption text-zinc-500 max-w-[200px] leading-relaxed">
                    Indulge in our exquisite coffees and lifestyle accessories.
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-6 rounded-full bg-brand-gold px-6 py-2 type-ui text-black transition-all hover:bg-brand-gold-hover"
                  >
                    Browse the Menu
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    className="flex items-center gap-4 border-b border-white/5 pb-6 last:border-0"
                  >
                    {/* Item Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover border border-white/10 shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="type-card-title truncate text-white">
                        {item.name}
                      </h4>
                      {item.selectedOption && (
                        <p className="type-eyebrow mt-0.5">
                          {item.selectedOption}
                        </p>
                      )}
                      
                      {/* Price & Counter */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="type-body-sm font-semibold text-zinc-300">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        
                        {/* Quantity Counter */}
                        <div className="flex items-center rounded-full border border-white/5 bg-black/40 px-2 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 text-zinc-400 hover:text-white font-bold"
                          >
                            -
                          </button>
                          <span className="w-5 text-center type-body-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 text-zinc-400 hover:text-white font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Trash Action */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-600 hover:text-red-500 p-2 transition-colors shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="border-t border-white/5 bg-black/40 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="type-body-sm text-zinc-400">Subtotal</span>
                  <span className="type-price text-brand-gold text-lg">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="type-caption text-zinc-500">
                  Taxes, shipping, and promotional codes calculated at checkout.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="flex items-center justify-center rounded-full border border-white/10 px-4 py-3 type-ui transition-all hover:bg-white/5"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-brand-gold px-4 py-3 type-ui text-black transition-all hover:bg-brand-gold-hover gold-glow"
                  >
                    Checkout
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
