import { create } from "zustand";
import { CartItem } from "@/types";

interface CartState {
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  orderDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    items: CartItem[];
    subtotal: number;
    total: number;
    promoCode?: string;
    date: string;
    orderId: string;
  } | null;
  
  // Actions
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
  setOrderDetails: (order: CartState["orderDetails"]) => void;
  
  // Calculations
  getCartSubtotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  wishlist: [],
  isCartOpen: false,
  orderDetails: null,

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  addItem: (newItem) => {
    set((state) => {
      const compositeId = newItem.id;
      const existingItemIndex = state.cart.findIndex((item) => item.id === compositeId);

      let newCart = [...state.cart];
      if (existingItemIndex > -1) {
        newCart[existingItemIndex].quantity += newItem.quantity || 1;
      } else {
        newCart.push({
          ...newItem,
          quantity: newItem.quantity || 1,
        } as CartItem);
      }
      
      return { cart: newCart, isCartOpen: true };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => set({ cart: [] }),

  toggleWishlist: (itemId) => {
    set((state) => {
      const isAlreadyIn = state.wishlist.includes(itemId);
      const newWishlist = isAlreadyIn
        ? state.wishlist.filter((id) => id !== itemId)
        : [...state.wishlist, itemId];
      return { wishlist: newWishlist };
    });
  },

  isInWishlist: (itemId) => {
    return get().wishlist.includes(itemId);
  },

  setOrderDetails: (order) => set({ orderDetails: order }),

  getCartSubtotal: () => {
    return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getCartCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },
}));
