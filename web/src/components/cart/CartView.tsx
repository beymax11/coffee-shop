"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { PageTransition } from "@/components/animations";
import Link from "next/link";

export function CartView() {
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);

  // Promo code logic
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    const code = promoCode.toUpperCase().trim();
    if (code === "GOLD15") {
      setDiscountPercent(15);
      setPromoSuccess("15% off L'OR GOLD discount applied.");
    } else if (code === "NOIR10") {
      setDiscountPercent(10);
      setPromoSuccess("10% off L'OR NOIR discount applied.");
    } else {
      setPromoError("Invalid promotional code.");
      setDiscountPercent(0);
    }
  };

  const subtotal = getCartSubtotal();
  const discountAmount = subtotal * (discountPercent / 100);
  
  // Free Shipping Threshold
  const shippingThreshold = 75;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingCost = cart.length === 0 ? 0 : (isFreeShipping ? 0 : 8.50);
  const taxAmount = (subtotal - discountAmount) * 0.08875; // NYC sales tax rate
  const grandTotal = subtotal - discountAmount + shippingCost + taxAmount;

  // Calculate percentage of shipping progress
  const progressPercent = Math.min((subtotal / shippingThreshold) * 100, 100);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0B0B0B] py-16 md:py-24 text-[#F5F5F0]">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          
          <h1 className="type-h2 text-white mb-12">
            Shopping Cart
          </h1>

          {cart.length === 0 ? (
            <div className="text-center py-24 rounded-2xl border border-white/5 bg-[#141414] max-w-2xl mx-auto p-10">
              <div className="rounded-full bg-white/5 border border-white/5 p-6 text-zinc-600 mb-6 w-fit mx-auto">
                <ShoppingBag size={48} className="stroke-[1.5]" />
              </div>
              <h2 className="type-h2 text-white">Your Cart is Empty</h2>
              <p className="mt-3 type-body-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Add our signature coffees, artisanal desserts, and exclusive lifestyle accessories to your cart.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link
                  href="/menu"
                  className="rounded-full bg-brand-gold px-8 py-3 type-ui text-black hover:bg-brand-gold-hover transition-colors shadow"
                >
                  Browse Menu
                </Link>
                <Link
                  href="/shop"
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-3 type-ui text-white hover:bg-white/10 transition-colors"
                >
                  Shop Boutique
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              
              {/* Left 2 Columns: Items List */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Free Shipping Alert */}
                <div className="rounded-xl border border-white/5 bg-[#141414] p-6 space-y-3">
                  <div className="flex justify-between type-body-sm font-sans">
                    <span className="text-zinc-400 font-medium">
                      {isFreeShipping 
                        ? "Congratulations! You qualify for complimentary luxury shipping." 
                        : `Spend $${(shippingThreshold - subtotal).toFixed(2)} more for complimentary shipping.`
                      }
                    </span>
                    <span className="font-bold text-brand-gold">${subtotal.toFixed(2)} / $${shippingThreshold}.00</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-gold rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Items Container */}
                <div className="rounded-xl border border-white/5 bg-[#141414] p-6 divide-y divide-white/5">
                  {cart.map((item) => (
                    <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      
                      {/* Image + Title */}
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-20 w-20 rounded-lg object-cover border border-white/10 shrink-0" 
                        />
                        <div>
                          <h3 className="type-card-title font-bold text-white">{item.name}</h3>
                          <span className="type-caption text-zinc-500 type-micro block mt-0.5">{item.category} Sourced</span>
                          {item.selectedOption && (
                            <span className="type-eyebrow mt-1 block">
                              {item.selectedOption}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity + Math */}
                      <div className="flex items-center justify-between sm:justify-end gap-12">
                        {/* Price per unit */}
                        <div className="text-right">
                          <span className="type-caption text-zinc-500 block">Unit Price</span>
                          <span className="type-body-sm font-semibold">${item.price.toFixed(2)}</span>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center rounded-full border border-white/10 bg-black/40 px-3 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 text-zinc-400 hover:text-white font-bold"
                          >
                            -
                          </button>
                          <span className="w-6 text-center type-body-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 text-zinc-400 hover:text-white font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right w-24">
                          <span className="type-caption text-zinc-500 block">Total</span>
                          <span className="type-body-sm font-bold text-brand-gold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>

                        {/* Delete Action */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

              </div>

              {/* Right Column: Summary Card */}
              <div className="space-y-6">
                
                {/* Summary Details */}
                <div className="rounded-xl border border-white/5 bg-[#141414] p-6 space-y-6 shadow-md">
                  <h3 className="type-card-title font-bold text-white border-b border-white/5 pb-4">Order Summary</h3>

                  <div className="space-y-3 type-body text-zinc-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white">${subtotal.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Tag size={12} /> Discount ({discountPercent}%)
                        </span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Est. Shipping & Handling</span>
                      <span className="text-white">
                        {shippingCost === 0 ? "Complimentary" : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Est. Taxes (8.875%)</span>
                      <span className="text-white">${taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex justify-between type-body-sm font-bold mt-4">
                      <span className="text-white">Est. Total</span>
                      <span className="type-price text-brand-gold">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Promo Input */}
                  <form onSubmit={handleApplyPromo} className="border-t border-white/5 pt-6 space-y-2">
                    <label className="type-label block">Promotional Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="GOLD15 or NOIR10"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 rounded bg-[#181818] border border-white/10 px-3 py-2 type-body-sm text-[#F5F5F0] outline-none uppercase placeholder:text-zinc-700"
                      />
                      <button
                        type="submit"
                        className="rounded bg-zinc-800 border border-white/5 px-4 py-2 type-ui hover:bg-zinc-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && <span className="type-error block">{promoError}</span>}
                    {promoSuccess && <span className="type-success text-green-400 block">{promoSuccess}</span>}
                  </form>

                  {/* Checkout Button */}
                  <div className="pt-2">
                    <Link
                      href="/checkout"
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-gold py-3.5 type-ui text-black hover:bg-brand-gold-hover transition-colors gold-glow active:scale-95"
                    >
                      Proceed to Checkout
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Trust Seal */}
                <div className="rounded-xl border border-white/5 bg-black/40 p-4 type-caption text-zinc-500 flex items-start gap-3">
                  <ShieldCheck className="text-brand-gold mt-0.5 shrink-0" size={16} />
                  <div>
                    <span className="block font-bold text-zinc-400">SSL Encrypted Checkout</span>
                    All credit card transactions are fully secure and authenticated. Orders are packed with extreme sanitary care inside signature L&apos;OR NOIR cases.
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
