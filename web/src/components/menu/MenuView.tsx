"use client";

import React, { useState, useMemo } from "react";
import { menuItems } from "@/data/menu";
import { Star, Heart, ShoppingBag, Eye, Search } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { QuickViewModal } from "@/components/shared/QuickViewModal";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";
import { MenuItem } from "@/types";

export function MenuView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const wishlist = useCartStore((state) => state.wishlist);
  const addItem = useCartStore((state) => state.addItem);

  const categories = [
    "All",
    "Hot Coffee",
    "Cold Coffee",
    "Signature Drinks",
    "Non-Coffee",
    "Pastries",
    "Desserts"
  ];

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleQuickView = (item: MenuItem) => {
    setSelectedItem(item);
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (item: MenuItem) => {
    const isCoffee = item.category.toLowerCase().includes("coffee");
    addItem({
      id: `${item.id}-default`,
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: "Menu",
      selectedOption: isCoffee ? "Regular" : undefined,
      quantity: 1,
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0B0B0B] py-16 md:py-24 text-[#F5F5F0]">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          
          {/* Header Title */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="type-eyebrow">L'OR NOIR Salon</span>
            <h1 className="type-h1 text-white mt-2">
              The Curated Menu
            </h1>
            <div className="h-[1px] w-12 bg-brand-gold mx-auto mt-4" />
            <p className="type-body text-zinc-400 mt-4">
              Explore our master-crafted hot brews, cold tonics, zero-proof signature cocktail pairings, and freshly baked luxury desserts.
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="space-y-8 mb-12">
            {/* Search Input */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="Search our pourings and pastries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-[#141414] py-3 pl-12 pr-6 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 transition-all placeholder:text-zinc-600 shadow-md"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-5 py-2.5 type-ui border transition-all ${
                    selectedCategory === category
                      ? "bg-brand-gold border-brand-gold text-black shadow-md gold-glow"
                      : "bg-[#141414] border-white/5 text-zinc-400 hover:text-white hover:border-brand-gold/30"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="type-body-sm text-zinc-500 font-medium">No items found matching your filters.</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="mt-4 type-ui text-brand-gold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Items Grid */
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => {
                const isFavorited = wishlist.includes(item.id);
                return (
                  <StaggerItem
                    key={item.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-[#141414] p-4 transition-all hover:border-brand-gold/30 hover:bg-[#181818] gold-glow-hover"
                  >
                    {/* Item Image with Overlay controls */}
                    <div className="relative h-60 w-full overflow-hidden rounded-xl bg-zinc-900 mb-6">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                      
                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleQuickView(item)}
                          className="rounded-full bg-white text-black p-3 hover:scale-110 active:scale-95 transition-all shadow"
                          title="Quick Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="rounded-full bg-brand-gold text-black p-3 hover:scale-110 active:scale-95 transition-all shadow"
                          title="Add to Cart"
                        >
                          <ShoppingBag size={16} />
                        </button>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleWishlist(item.id)}
                        className={`absolute top-3 right-3 rounded-full border p-2 transition-all backdrop-blur bg-black/40 ${
                          isFavorited
                            ? "border-red-500/20 text-red-500"
                            : "border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Heart size={14} className={isFavorited ? "fill-red-500" : ""} />
                      </button>
                    </div>

                    {/* Content details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="type-eyebrow">
                            {item.category}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <Star size={12} className="fill-brand-gold text-brand-gold" />
                            <span className="type-caption font-medium text-zinc-300">{item.rating}</span>
                          </div>
                        </div>

                        <h3 className="type-card-title font-bold text-white mt-2 group-hover:text-brand-gold transition-colors">
                          {item.name}
                        </h3>
                        
                        <p className="type-body-sm text-zinc-400 mt-2 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                        <span className="type-price text-brand-gold">
                          ${item.price.toFixed(2)}
                        </span>
                        
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="type-ui text-zinc-400 hover:text-white flex items-center gap-1.5 transition-all"
                        >
                          Add To Order
                          <ShoppingBag size={12} className="text-brand-gold" />
                        </button>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedItem && (
        <QuickViewModal
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          item={selectedItem}
        />
      )}
    </PageTransition>
  );
}
