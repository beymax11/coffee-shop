import { useCartStore } from "@/store/cart-store";
import { TAX_RATE, FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST, PROMO_CODES } from "@/lib/constants";
import { useState, useMemo } from "react";

export function useCart() {
  const cart = useCartStore((state) => state.cart);
  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);
  const getCartCount = useCartStore((state) => state.getCartCount);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const [promoCode, setPromoCode] = useState("");
  const [activeDiscount, setActiveDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState("");

  const count = getCartCount();
  const subtotal = getCartSubtotal();

  const discountAmount = useMemo(() => {
    if (!activeDiscount) return 0;
    return subtotal * activeDiscount.percent;
  }, [subtotal, activeDiscount]);

  const discountedSubtotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const isFreeShipping = useMemo(() => {
    return discountedSubtotal >= FREE_SHIPPING_THRESHOLD;
  }, [discountedSubtotal]);

  const shippingCost = useMemo(() => {
    if (cart.length === 0) return 0;
    return isFreeShipping ? 0 : DEFAULT_SHIPPING_COST;
  }, [cart.length, isFreeShipping]);

  const taxAmount = useMemo(() => {
    return discountedSubtotal * TAX_RATE;
  }, [discountedSubtotal]);

  const total = useMemo(() => {
    if (cart.length === 0) return 0;
    return discountedSubtotal + taxAmount + shippingCost;
  }, [cart.length, discountedSubtotal, taxAmount, shippingCost]);

  // Free shipping tracking metrics
  const freeShippingProgress = useMemo(() => {
    return Math.min(100, (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  }, [discountedSubtotal]);

  const freeShippingRemaining = useMemo(() => {
    return Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);
  }, [discountedSubtotal]);

  const applyPromo = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode in PROMO_CODES) {
      const percent = PROMO_CODES[cleanCode as keyof typeof PROMO_CODES];
      setActiveDiscount({ code: cleanCode, percent });
      setPromoError("");
      return true;
    } else {
      setPromoError("Invalid promo code. Try 'GOLD15' or 'NOIR10'.");
      return false;
    }
  };

  const removePromo = () => {
    setActiveDiscount(null);
    setPromoCode("");
    setPromoError("");
  };

  return {
    cart,
    count,
    subtotal,
    discountAmount,
    discountedSubtotal,
    isFreeShipping,
    shippingCost,
    taxAmount,
    total,
    freeShippingProgress,
    freeShippingRemaining,
    promoCode,
    setPromoCode,
    activeDiscount,
    promoError,
    applyPromo,
    removePromo,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
