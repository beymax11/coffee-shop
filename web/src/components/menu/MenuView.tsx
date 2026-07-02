"use client";

import React, { useState, useMemo, useEffect } from "react";
import { db } from "@/utils/db";
import { Star, Eye, Search, Compass, Coffee, CupSoda, Sparkles, Leaf, Cookie, Cake, ArrowRight } from "lucide-react";
import { QuickViewModal } from "@/components/shared/QuickViewModal";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";
import { MenuItem } from "@/types";

// Category Icons mapping
const categoryIcons: Record<string, React.ComponentType<any>> = {
  "All": Compass,
  "Hot Coffee": Coffee,
  "Cold Coffee": CupSoda,
  "Signature Drinks": Sparkles,
  "Non-Coffee": Leaf,
  "Pastries": Cookie,
  "Desserts": Cake
};

export function MenuView() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Sync menu items from local database on mount & on storage update
  useEffect(() => {
    setItems(db.getMenuItems());
    const handleStorage = () => {
      setItems(db.getMenuItems());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const handleQuickView = (item: MenuItem) => {
    setSelectedItem(item);
    setIsQuickViewOpen(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-16 md:py-24 text-foreground relative overflow-hidden transition-colors duration-500">
        {/* Subtle Decorative Golden Aura Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-brand-gold/[0.03] blur-[120px]" />
          <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-brand-gold/[0.02] blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
          
          {/* Header Title */}
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
            {/* Elegant Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-gold/5 px-4 py-1.5 mb-4 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gold gold-glow animate-pulse" />
              <span className="type-eyebrow text-brand-gold tracking-widest text-[11px] uppercase">
                L'OR NOIR Salon
              </span>
            </div>

            <h1 className="type-h1 text-foreground tracking-tight">
              The <span className="text-brand-gold italic font-serif">Curated</span> Menu
            </h1>
            
            {/* Premium Divider */}
            <div className="flex items-center justify-center gap-3 mt-4 mb-6">
              <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-brand-gold/60" />
              <span className="h-1 w-1 rotate-45 bg-brand-gold gold-glow" />
              <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-brand-gold/60" />
            </div>

            <p className="type-body text-neutral-500 dark:text-zinc-400 max-w-lg">
              Explore our master-crafted hot brews, cold tonics, zero-proof signature cocktail pairings, and freshly baked luxury desserts.
            </p>
          </div>

          {/* Unified Filter Deck */}
          <div className="relative max-w-5xl mx-auto mb-16 rounded-2xl border border-card-border bg-card p-6 backdrop-blur-md shadow-2xl glassmorphism-gold">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="Search our pourings and pastries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-card-border bg-background-alt/50 py-3 pl-12 pr-6 type-field text-foreground outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/20 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-600 shadow-inner"
                />
              </div>

              {/* Quick Summary */}
              <div className="hidden lg:block text-right">
                <span className="type-caption text-neutral-500 dark:text-zinc-500">Showing</span>
                <span className="type-body-sm font-semibold text-brand-gold ml-1.5">{filteredItems.length}</span>
                <span className="type-caption text-neutral-500 dark:text-zinc-500 ml-1">exquisite creations</span>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="border-t border-card-border mt-6 pt-6">
              <div className="flex overflow-x-auto pb-2 scrollbar-none -mx-6 px-6 lg:mx-0 lg:px-0">
                <div className="flex gap-2.5 mx-auto">
                  {categories.map((category) => {
                    const IconComponent = categoryIcons[category] || Compass;
                    const isSelected = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 type-ui border transition-all whitespace-nowrap ${
                          isSelected
                            ? "bg-brand-gold border-brand-gold text-black shadow-lg gold-glow font-medium scale-[1.02]"
                            : "bg-card border-card-border text-neutral-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white hover:border-brand-gold/30 hover:bg-background"
                        }`}
                      >
                        <IconComponent size={14} className={isSelected ? "text-black" : "text-brand-gold"} />
                        <span>{category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="type-body-sm text-neutral-500 dark:text-zinc-500 font-medium">No items found matching your filters.</p>
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
                return (
                  <StaggerItem key={item.id}>
                    <div
                      onClick={() => handleQuickView(item)}
                      className="group relative flex flex-col justify-between rounded-2xl border border-card-border bg-card p-4 transition-all hover:border-brand-gold/30 hover:bg-card/90 gold-glow-hover cursor-pointer h-full"
                    >
                      {/* Item Image with Overlay controls */}
                      <div className="relative h-60 w-full overflow-hidden rounded-xl bg-zinc-900 mb-6">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                        
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                        
                        {/* Hover action overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <span className="flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-black hover:scale-105 active:scale-95 transition-all shadow-lg font-medium type-ui gold-glow">
                            <Eye size={14} />
                            View Details
                          </span>
                        </div>
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
                              <span className="type-caption font-medium text-neutral-600 dark:text-zinc-300">{item.rating}</span>
                            </div>
                          </div>

                          <h3 className="type-card-title font-bold text-foreground mt-2 group-hover:text-brand-gold transition-colors">
                            {item.name}
                          </h3>
                          
                          <p className="type-body-sm text-neutral-500 dark:text-zinc-400 mt-2 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-card-border pt-4 mt-6">
                          <span className="type-price text-brand-gold font-semibold">
                            ${item.price.toFixed(2)}
                          </span>
                          
                          <span
                            className="type-ui text-neutral-500 group-hover:text-foreground dark:text-zinc-400 dark:group-hover:text-white flex items-center gap-1.5 transition-all font-medium"
                          >
                            View Details
                            <ArrowRight size={12} className="text-brand-gold transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
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
