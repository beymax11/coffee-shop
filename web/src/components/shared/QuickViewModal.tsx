"use client";

import React, { useState } from "react";
import { MenuItem, Product } from "@/types";
import { useCartStore } from "@/store/cart-store";
import { X, Star, ShoppingBag, Heart, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | Product | null;
  showCommerceControls?: boolean;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  isOpen,
  onClose,
  item,
  showCommerceControls = true,
}) => {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const wishlist = useCartStore((state) => state.wishlist);
  const [quantity, setQuantity] = useState(1);
  const [selectedGrind, setSelectedGrind] = useState("Whole Bean");
  const [selectedCupSize, setSelectedCupSize] = useState("Regular");

  if (!item) return null;

  const isProduct = "category" in item && 
    (item.category === "Merchandise" || item.category === "Coffee Beans" || item.category === "Coffee Accessories");
  
  const isCoffeeBeans = isProduct && (item as Product).category === "Coffee Beans";
  const isMenuItemCoffee = !isProduct && (item as MenuItem).category.toLowerCase().includes("coffee");

  const imageSrc = isProduct ? (item as Product).images[0] : (item as MenuItem).image;
  const isFavorited = wishlist.includes(item.id);

  const handleAddToCart = () => {
    const selectedOption = isCoffeeBeans 
      ? selectedGrind 
      : (isMenuItemCoffee ? selectedCupSize : undefined);

    addItem({
      id: `${item.id}-${selectedOption || "default"}`,
      productId: item.id,
      name: item.name,
      price: item.price,
      image: imageSrc,
      category: isProduct ? "Shop" : "Menu",
      selectedOption: selectedOption,
      quantity: quantity,
    });
    
    // Reset quantity and close
    setQuantity(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#121212] text-[#F5F5F0] shadow-2xl glassmorphism-gold"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 rounded-full border border-white/10 bg-black/40 p-2 text-zinc-400 hover:text-white transition-all hover:bg-black/60"
              aria-label="Close details"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Column: Image Area */}
              <div className="relative h-72 w-full md:h-full min-h-[350px]">
                <img
                  src={imageSrc}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent md:bg-gradient-to-r" />
                
                {/* Floating Tags */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {"tags" in item && item.tags?.map((tag) => (
                    <span key={tag} className="rounded bg-brand-gold/90 px-2 py-0.5 type-ui text-black">
                      {tag}
                    </span>
                  ))}
                  {isProduct && (
                    <span className="rounded bg-[#1c1c1c] border border-white/10 px-2 py-0.5 type-eyebrow">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Information Area */}
              <div className="flex flex-col justify-between p-8 md:p-10">
                <div>
                  <h2 className="type-h2 text-white">
                    {item.name}
                  </h2>

                  {/* Rating & Price */}
                  <div className="mt-4 flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="type-h3 text-brand-gold">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-brand-gold text-brand-gold" />
                      <span className="type-body-sm font-semibold">{item.rating}</span>
                      <span className="type-caption text-zinc-500">/ 5.0</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-4 type-body-sm text-zinc-400">
                    {item.description}
                  </p>

                  {/* Details/Attributes */}
                  {isProduct ? (
                    <div className="mt-6 space-y-2">
                      <h4 className="type-label text-brand-gold">Specifications</h4>
                      <ul className="grid grid-cols-1 gap-1 type-body-sm text-zinc-400">
                        {(item as Product).details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-brand-gold">•</span> {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    "notes" in item && item.notes && (
                      <div className="mt-6 rounded-lg bg-white/5 p-3 border border-white/5 flex items-start gap-2">
                        <Coffee size={16} className="text-brand-gold mt-0.5 shrink-0" />
                        <div className="type-body-sm text-zinc-400">
                          <strong className="text-brand-gold block font-semibold mb-0.5">Barista Note</strong>
                          {item.notes}
                        </div>
                      </div>
                    )
                  )}

                  {/* Configurable Options */}
                  {showCommerceControls && (
                    <div className="mt-6 space-y-4">
                      {/* Coffee Bean Grind Selection */}
                      {isCoffeeBeans && (
                        <div>
                          <label className="block type-label text-zinc-400 mb-2">Grind Preference</label>
                          <div className="flex flex-wrap gap-2">
                            {["Whole Bean", "Filter / V60", "Espresso", "Cold Brew"].map((grind) => (
                              <button
                                  key={grind}
                                  onClick={() => setSelectedGrind(grind)}
                                  className={`rounded-full px-3 py-1.5 type-ui font-medium border transition-all ${
                                    selectedGrind === grind
                                      ? "bg-brand-gold border-brand-gold text-black"
                                      : "bg-[#1c1c1c] border-white/10 text-zinc-300 hover:border-brand-gold/50"
                                  }`}
                                >
                                  {grind}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Drink Size Selection */}
                      {isMenuItemCoffee && (
                        <div>
                          <label className="block type-label text-zinc-400 mb-2">Cup Size</label>
                          <div className="flex gap-2">
                            {["Regular", "Large (+ $1.00)"].map((size) => (
                              <button
                                  key={size}
                                  onClick={() => setSelectedCupSize(size)}
                                  className={`rounded-full px-3 py-1.5 type-ui font-medium border transition-all ${
                                    selectedCupSize === size
                                      ? "bg-brand-gold border-brand-gold text-black"
                                      : "bg-[#1c1c1c] border-white/10 text-zinc-300 hover:border-brand-gold/50"
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions & Quantity */}
                {showCommerceControls ? (
                  <div className="mt-8 flex items-center gap-4 border-t border-white/5 pt-6">
                    {/* Quantity Counter */}
                    <div className="flex items-center rounded-full border border-white/10 bg-black/40 px-2 py-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="type-qty-btn px-2 text-zinc-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="w-8 text-center type-body-sm font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="type-qty-btn px-2 text-zinc-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={handleAddToCart}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-gold px-6 py-3 type-ui text-black transition-all hover:bg-brand-gold-hover active:scale-95 shadow-md gold-glow-hover"
                    >
                      <ShoppingBag size={16} />
                      Add to Cart
                    </button>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className={`rounded-full border p-3 transition-all ${
                        isFavorited
                          ? "bg-red-500/10 border-red-500/30 text-red-500"
                          : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-brand-gold/50"
                      }`}
                      aria-label="Add to wishlist"
                    >
                      <Heart size={16} className={isFavorited ? "fill-red-500" : ""} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 flex items-center justify-end border-t border-white/5 pt-6">
                    <button
                      onClick={onClose}
                      className="rounded-full border border-brand-gold/30 bg-brand-gold/5 px-6 py-2.5 type-ui text-brand-gold transition-all hover:bg-brand-gold hover:text-black active:scale-95 shadow-md hover:gold-glow"
                    >
                      Close Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
