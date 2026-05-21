"use client";

import React, { useState, useMemo } from "react";
import { useCartStore } from "@/store/cart-store";
import { CreditCard, ShieldCheck, CheckCircle2, ChevronRight, ShoppingBag } from "lucide-react";
import { PageTransition } from "@/components/animations";
import { motion } from "framer-motion";
import Link from "next/link";

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

export function CheckoutView() {
  const cart = useCartStore((state) => state.cart);
  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const setOrderDetails = useCartStore((state) => state.setOrderDetails);
  const orderDetails = useCartStore((state) => state.orderDetails);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cart calculations
  const subtotal = getCartSubtotal();
  const shippingThreshold = 75;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingCost = cart.length === 0 ? 0 : (isFreeShipping ? 0 : 8.50);
  const taxAmount = subtotal * 0.08875;
  const grandTotal = subtotal + shippingCost + taxAmount;

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zip.trim() || formData.zip.length < 5) newErrors.zip = "ZIP code is required";

    // Card validation
    const cleanCard = formData.cardNumber.replace(/\s+/g, "");
    if (cleanCard.length < 16) newErrors.cardNumber = "Card number must be 16 digits";
    if (!formData.cardName.trim()) newErrors.cardName = "Cardholder name is required";
    if (!formData.expiry.includes("/")) newErrors.expiry = "MM/YY is required";
    if (formData.cvv.length < 3) newErrors.cvv = "CVV must be 3 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CheckoutFormData, val: string) => {
    setFormData({ ...formData, [field]: val });
    setErrors({ ...errors, [field]: undefined });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsProcessing(true);
      
      // Simulate luxury banking response
      setTimeout(() => {
        setIsProcessing(false);
        setSuccess(true);
        
        // Save details to store for receipt rendering
        setOrderDetails({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.zip}`,
          items: [...cart],
          subtotal: subtotal,
          total: grandTotal,
          date: new Date().toLocaleDateString("en-US", { dateStyle: "long" }),
          orderId: `LN-${Math.floor(1000000 + Math.random() * 9000000)}`
        });

        // Clear cart
        clearCart();
      }, 2500);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0B0B0B] py-16 md:py-24 text-[#F5F5F0]">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          
          {success && orderDetails ? (
            /* SUCCESS CONFIRMATION RECEIPT SCREEN */
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)] animate-bounce">
                <CheckCircle2 size={36} className="stroke-[1.5]" />
              </div>

              <div className="space-y-2">
                <h1 className="type-h2 text-white">Order Confirmed</h1>
                <p className="type-body text-zinc-400 max-w-md mx-auto">
                  Thank you for shopping at our boutique. An elegant receipt and tracking code have been emailed to <strong className="text-zinc-200">{orderDetails.email}</strong>.
                </p>
              </div>

              {/* Receipt Body */}
              <div className="rounded-xl border border-white/5 bg-[#141414] p-8 text-left space-y-6 relative overflow-hidden shadow-2xl glassmorphism-gold">
                <div className="absolute right-4 bottom-4 text-white/5 pointer-events-none type-watermark-lg">L&apos;O</div>

                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <span className="type-micro text-zinc-500">Order Reference</span>
                    <h4 className="type-ui text-white mt-0.5">{orderDetails.orderId}</h4>
                  </div>
                  <span className="type-body-sm text-zinc-400 font-semibold">{orderDetails.date}</span>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <span className="type-eyebrow block">Purchased Items</span>
                  <div className="space-y-3 font-sans type-body-sm">
                    {orderDetails.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-zinc-300">
                        <span>{item.name} <strong className="type-caption text-zinc-500">x{item.quantity}</strong></span>
                        <span className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipment Logistics */}
                <div className="border-t border-white/5 pt-4 space-y-2 font-sans type-body-sm">
                  <div>
                    <span className="type-micro text-zinc-500 block">Deliver To</span>
                    <span className="text-white font-semibold">{orderDetails.fullName}</span>
                    <span className="text-zinc-400 block mt-0.5">{orderDetails.address}</span>
                  </div>
                </div>

                {/* Financial Math */}
                <div className="border-t border-white/5 pt-4 space-y-2 font-sans type-body-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>${orderDetails.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping</span>
                    <span>Complimentary</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Taxes</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-3 type-body-sm font-bold text-brand-gold mt-2">
                    <span>Grand Total Paid</span>
                    <span className="type-price text-brand-gold">${orderDetails.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <Link
                  href="/"
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-3 type-ui text-white hover:bg-white/10 transition-colors active:scale-95"
                >
                  Return Home
                </Link>
                <Link
                  href="/shop"
                  className="rounded-full bg-brand-gold px-8 py-3 type-ui text-black hover:bg-brand-gold-hover transition-colors gold-glow active:scale-95"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* PREVENT ACCESS IF CART EMPTY */
            <div className="text-center py-20 max-w-md mx-auto space-y-6">
              <ShoppingBag className="mx-auto text-zinc-600" size={48} />
              <h2 className="type-h2 text-white">No items in checkout</h2>
              <p className="type-body-sm text-zinc-400">Please add items to your cart before proceeding to shipping options.</p>
              <Link href="/shop" className="inline-block rounded-full bg-brand-gold px-8 py-3 type-ui text-black hover:bg-brand-gold-hover transition-colors">
                Return to Shop
              </Link>
            </div>
          ) : (
            /* STANDARD CHECKOUT FORM WORKSPACE */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
              
              {/* Form columns */}
              <form onSubmit={handlePay} className="lg:col-span-2 space-y-8">
                
                {/* 1. SHIPPING INFO */}
                <div className="rounded-xl border border-white/5 bg-[#141414] p-8 space-y-6">
                  <h3 className="type-card-title font-bold text-white border-b border-white/5 pb-3">Shipping Address</h3>

                  <div className="space-y-4 font-sans type-body-sm">
                    <div className="space-y-1.5">
                      <label className="type-label block">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60"
                      />
                      {errors.fullName && <span className="type-error">{errors.fullName}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="type-label block">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60"
                        />
                        {errors.email && <span className="type-error">{errors.email}</span>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="type-label block">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="+1 (555) 012-3456"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60"
                        />
                        {errors.phone && <span className="type-error">{errors.phone}</span>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="type-label block">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="123 Luxury Lane"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60"
                      />
                      {errors.address && <span className="type-error">{errors.address}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="type-label block">City</label>
                        <input
                          type="text"
                          required
                          placeholder="New York"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60"
                        />
                        {errors.city && <span className="type-error">{errors.city}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="type-label block">ZIP Code</label>
                        <input
                          type="text"
                          required
                          placeholder="10001"
                          value={formData.zip}
                          onChange={(e) => handleInputChange("zip", e.target.value)}
                          className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60"
                        />
                        {errors.zip && <span className="type-error">{errors.zip}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. PAYMENT METHOD & WIDGET */}
                <div className="rounded-xl border border-white/5 bg-[#141414] p-8 space-y-6">
                  <h3 className="type-card-title font-bold text-white border-b border-white/5 pb-3">Payment details</h3>
                  
                  {/* Virtual Credit Card Display */}
                  <div className="relative mx-auto h-48 w-full max-w-sm rounded-xl border border-brand-gold/20 bg-gradient-to-br from-[#1c1c1c] to-[#0c0c0c] p-6 text-[#F5F5F0] shadow-xl overflow-hidden">
                    {/* Metallic gold chip */}
                    <div className="h-8 w-11 rounded bg-gradient-to-r from-brand-gold via-brand-beige to-brand-gold/70" />
                    
                    {/* Monogram background */}
                    <div className="absolute right-4 top-4 type-h3st text-zinc-700">L&apos;N</div>
                    
                    {/* Card number */}
                    <div className="mt-8 font-mono type-body tracking-[0.2em]">
                      {formData.cardNumber || "•••• •••• •••• ••••"}
                    </div>

                    {/* Expiry and Name footer */}
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end font-sans type-body-sm">
                      <div>
                        <span className="type-micro text-zinc-500 block">Cardholder</span>
                        <span className="type-body-sm font-semibold truncate block max-w-[150px]">
                          {formData.cardName.toUpperCase() || "YOUR NAME"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="type-micro text-zinc-500 block">Expires</span>
                        <span className="font-semibold">{formData.expiry || "MM/YY"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 font-sans type-body-sm">
                    <div className="space-y-1.5">
                      <label className="type-label block">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.cardName}
                        onChange={(e) => handleInputChange("cardName", e.target.value)}
                        className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60"
                      />
                      {errors.cardName && <span className="type-error">{errors.cardName}</span>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="type-label block">Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4000 1234 5678 9010"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                        className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60"
                      />
                      {errors.cardNumber && <span className="type-error">{errors.cardNumber}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="type-label block">Expiration Date</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={(e) => handleInputChange("expiry", formatExpiry(e.target.value))}
                          className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60"
                        />
                        {errors.expiry && <span className="type-error">{errors.expiry}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="type-label block">CVV / CVN</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          placeholder="•••"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value.replace(/[^0-9]/gi, ""))}
                          className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60"
                        />
                        {errors.cvv && <span className="type-error">{errors.cvv}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-gold py-4 type-ui text-black hover:bg-brand-gold-hover transition-colors gold-glow active:scale-95 disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Authenticating Secure Transaction...
                      </span>
                    ) : (
                      <>
                        <span>Authorize Payment of ${grandTotal.toFixed(2)}</span>
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Right Order Summary Column */}
              <div className="space-y-6">
                <div className="rounded-xl border border-white/5 bg-[#141414] p-6 space-y-6">
                  <h3 className="type-card-title font-bold text-white border-b border-white/5 pb-3">Your Order</h3>

                  {/* Products summary list */}
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-2 divide-y divide-white/5">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center pt-3 first:pt-0">
                        <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover border border-white/10 shrink-0" />
                        <div className="flex-1 min-w-0 font-sans type-body-sm">
                          <h4 className="type-card-title font-bold text-white truncate">{item.name}</h4>
                          <span className="text-zinc-500">Qty: {item.quantity}</span>
                          {item.selectedOption && <span className="text-brand-gold type-eyebrow block">{item.selectedOption}</span>}
                        </div>
                        <span className="type-body-sm font-semibold text-zinc-300">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Math summary */}
                  <div className="border-t border-white/5 pt-4 space-y-2 type-body text-zinc-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-white">{shippingCost === 0 ? "Complimentary" : `$${shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Taxes</span>
                      <span className="text-white">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-white/5 pt-4 flex justify-between type-body-sm font-bold text-brand-gold mt-2">
                      <span>Total Amount</span>
                      <span className="type-price text-brand-gold">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Secure Seal */}
                <div className="rounded-xl border border-white/5 bg-black/40 p-4 type-caption text-zinc-500 flex items-start gap-3">
                  <ShieldCheck className="text-brand-gold mt-0.5 shrink-0" size={16} />
                  <div>
                    <span className="block font-bold text-zinc-400 type-caption mb-0.5">Luxury Care Packaging</span>
                    All coffee orders are vacuum-sealed at roasting peak and packaged in heavy obsidian boxes. Baristas wear certified gloves and masks during item preparation.
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
