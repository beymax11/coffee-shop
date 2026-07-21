"use client";

import React, { useState, useMemo, useEffect } from "react";
import { db } from "@/utils/db";
import { supabase } from "@/utils/supabase";
import { getCachedData } from "@/utils/cache";
import {
  Star,
  Eye,
  Search,
  Compass,
  Coffee,
  CupSoda,
  Sparkles,
  Leaf,
  Cookie,
  Cake,
  ArrowRight,
  Film,
  Award,
  Layers,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

// Curated Category Descriptions
const categoryDescriptions: Record<string, string> = {
  "All": "Browse our complete archive of master-crafted brews, chilled tonics, and baked luxuries.",
  "Hot Coffee": "Pure espresso extracted at precise pressure, paired with perfectly textured microfoam.",
  "Cold Coffee": "Chilled elixirs, slow-steeped cold brews, and cold foam concoctions crafted for refreshing energy.",
  "Signature Drinks": "Exclusive, house-crafted signature pairings blending rare single-origin beans with botanical infusions.",
  "Non-Coffee": "Ceremonial-grade Japanese matcha, organic loose-leaf teas, and calming botanical blends.",
  "Pastries": "Flaky pastries baked fresh daily using premium French butter.",
  "Desserts": "Sophisticated desserts and gourmet sweet pairings, designed to complement our roast profiles."
};


export function MenuView() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Sync menu items from local database on mount & on storage update
  const fetchMenuItems = async () => {
    try {
      const data = await getCachedData("menu_items", async () => {
        if (supabase) {
          const { data: dbData, error } = await supabase
            .from("menu_items")
            .select("*")
            .order("name");
          if (!error && dbData) {
            return dbData as MenuItem[];
          } else if (error) {
            console.error("Supabase select error:", error);
          }
        }
        return db.getMenuItems();
      });
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
      setItems(db.getMenuItems());
    }
  };

  useEffect(() => {
    fetchMenuItems();
    const handleStorage = (e: Event) => {
      const storageEvent = e as StorageEvent;
      if (storageEvent.key === undefined || storageEvent.key === "menu_items" || storageEvent.key === null) {
        fetchMenuItems();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const categories = useMemo(() => {
    const defaultCats = [
      "All",
      "Hot Coffee",
      "Cold Coffee",
      "Signature Drinks",
      "Non-Coffee",
      "Pastries",
      "Desserts"
    ];
    const customCats = items
      .map((item) => item.category)
      .filter((cat): cat is string => !!cat && !defaultCats.includes(cat));
    return [...defaultCats, ...Array.from(new Set(customCats))];
  }, [items]);

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
      <div className="min-h-screen bg-background pt-10 md:pt-16 pb-16 md:pb-24 text-foreground relative overflow-hidden transition-colors duration-500">

        {/* Cinematic Vertical & Horizontal Framing Lines */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2E5A44]/20 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-12 w-px bg-[#2E5A44]/[0.04] hidden xl:block pointer-events-none" />
        <div className="absolute inset-y-0 right-12 w-px bg-[#2E5A44]/[0.04] hidden xl:block pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#2E5A44]/[0.05] blur-[130px]" />
          <div className="absolute top-[15%] right-[5%] w-[450px] h-[450px] rounded-full bg-[#2E5A44]/[0.04] blur-[110px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">

          {/* Header Title Block */}
          <div className="text-center max-w-3xl mx-auto mb-10 flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl font-sans font-black text-foreground tracking-tight leading-tight uppercase mb-3">
              Freshly Brewed Selections
            </h1>
            <p className="type-body text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
              Explore our master-crafted hot brews, cold tonics, zero-proof signature cocktail pairings, and freshly baked luxury desserts, directed with absolute precision.
            </p>
          </div>

          {/* Main Grid Layout: Sidebar on Left, Menu Items on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-8">

            {/* Sidebar Filters */}
            <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4 lg:space-y-6 bg-card/65 dark:bg-zinc-950/60 p-4 sm:p-5 md:p-6 rounded-2xl border border-card-border backdrop-blur-md shadow-xl glassmorphism-green mb-6 lg:mb-0">

              {/* Optional Sidebar Title/Summary */}
              <div className="hidden lg:flex lg:flex-col lg:border-b lg:border-card-border lg:dark:border-zinc-900/40 lg:pb-3 lg:mb-2">
                <span className="text-[10px] font-sans font-bold tracking-widest text-[#2E5A44] dark:text-emerald-450 uppercase">
                  Categories
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                  Showing {filteredItems.length} of {items.length} options
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative w-full">
                <div className="relative group">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 transition-colors duration-300 group-focus-within:text-emerald-650 dark:group-focus-within:text-emerald-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search cellar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-card-border dark:border-zinc-800 bg-background-alt/30 dark:bg-zinc-900/35 py-3 pl-12 pr-12 type-field text-foreground outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-655 shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-foreground dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Tabs Wrapper with Left/Right Fades on Mobile */}
              <div className="relative border-t border-card-border/50 dark:border-zinc-900/40 pt-4 mt-1 lg:border-t-0 lg:pt-0 lg:mt-0">
                <div className="absolute -left-4 top-0 bottom-0 w-8 bg-gradient-to-r from-card/95 dark:from-zinc-950/90 to-transparent pointer-events-none z-10 lg:hidden" />
                <div className="absolute -right-4 top-0 bottom-0 w-8 bg-gradient-to-l from-card/95 dark:from-zinc-950/90 to-transparent pointer-events-none z-10 lg:hidden" />

                <div className="flex overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible">
                  <div className="flex gap-2 mx-auto min-w-max px-2 lg:px-0 lg:flex-col lg:w-full lg:gap-1.5">
                    {categories.map((category) => {
                      const isSelected = selectedCategory === category;
                      return (
                        <motion.button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`relative flex items-center gap-2 rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 lg:px-4 lg:py-2.5 type-ui border text-[10px] tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer z-10 lg:w-full lg:justify-start ${isSelected
                            ? "border-transparent text-white font-bold"
                            : "border-card-border bg-background-alt/20 dark:border-zinc-900 dark:bg-zinc-900/20 text-zinc-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white hover:border-emerald-500/30 hover:bg-background"
                            }`}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Sliding Pill Background */}
                          {isSelected && (
                            <motion.span
                              layoutId="activeCategory"
                              className="absolute inset-0 bg-[#2E5A44] dark:bg-[#2E5A44]/95 rounded-xl -z-10 shadow-md shadow-[#2E5A44]/25"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span>{category}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reset Filters Option for Desktop */}
              {(searchQuery !== "" || selectedCategory !== "All") && (
                <div className="hidden lg:block border-t border-card-border dark:border-zinc-900/40 pt-4">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="w-full text-center py-2.5 rounded-xl border border-dashed border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 type-ui text-[10px] tracking-wider transition-all duration-300 cursor-pointer"
                  >
                    Reset Active Filters
                  </button>
                </div>
              )}
            </div>

            {/* Menu Items Grid */}
            <div className="lg:col-span-3">
              {/* Empty State */}
              {filteredItems.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-card-border dark:border-zinc-900 rounded-3xl max-w-md mx-auto">
                  <Film size={28} className="text-emerald-500/45 mx-auto mb-4 animate-pulse" />
                  <p className="type-body-sm text-zinc-500 dark:text-zinc-500 font-medium">No items found matching your filters.</p>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                    className="mt-4 type-ui text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors font-bold underline decoration-emerald-500/30"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                /* Items Grid */
                <StaggerContainer className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                  {filteredItems.map((item) => {
                    const isSignature = item.category === "Signature Drinks" || item.tags?.includes("Exclusive");
                    return (
                      <StaggerItem key={item.id}>
                        <div
                          onClick={() => handleQuickView(item)}
                          className="group relative flex flex-col justify-between rounded-2xl border border-card-border dark:border-zinc-900 bg-card dark:bg-zinc-950/40 p-3.5 sm:p-5 md:p-6 transition-all duration-500 hover:border-emerald-500/35 hover:bg-card/90 dark:hover:bg-zinc-900/30 hover:shadow-[0_0_35px_rgba(46,90,68,0.06)] dark:hover:shadow-[0_0_40px_rgba(46,90,68,0.08)] cursor-pointer h-full"
                        >
                          {/* Premium Image Container */}
                          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-900 dark:bg-zinc-950 mb-3 sm:mb-5 border border-card-border dark:border-zinc-900">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-[0.5deg]"
                              loading="lazy"
                            />

                            {/* Film Aspect Vignette Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                            {/* Lens Shutter Focus Marks (Cinematic Hover Touch) */}
                            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-emerald-500/30 transition-colors duration-300 group-hover:border-emerald-500/80" />
                            <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-emerald-500/30 transition-colors duration-300 group-hover:border-emerald-500/80" />
                            <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-emerald-500/30 transition-colors duration-300 group-hover:border-emerald-500/80" />
                            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-emerald-500/30 transition-colors duration-300 group-hover:border-emerald-500/80" />

                            {/* Shutter Overlay on Hover */}
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                              <span className="flex items-center justify-center rounded-full bg-[#2E5A44] p-3 text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(46,90,68,0.4)]">
                                <Eye size={16} />
                              </span>
                            </div>
                          </div>

                          {/* Content details */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>

                              {/* Category Row */}
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] sm:text-[9px] font-sans font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                                  {item.category}
                                </span>
                              </div>

                              {/* Item Name */}
                              <h3 className="text-xs sm:text-base font-sans font-extrabold tracking-tight text-foreground mt-1 sm:mt-2.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 line-clamp-1 sm:line-clamp-none">
                                {item.name}
                              </h3>

                              {/* Tags block */}
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[7px] sm:text-[8px] font-sans font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Description */}
                              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 sm:mt-3 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            {/* Price & Action Footer */}
                            <div className="flex items-center justify-between border-t border-card-border dark:border-zinc-900 pt-2.5 mt-3 sm:pt-4 sm:mt-5">
                              <span className="text-xs sm:text-base font-sans font-extrabold text-[#2E5A44] dark:text-emerald-400">
                                ₱{item.price.toFixed(2)}
                              </span>

                              <span
                                className="text-[8px] sm:text-[10px] font-sans font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400 group-hover:text-foreground dark:group-hover:text-white flex items-center gap-1 transition-colors duration-300"
                              >
                                View
                                <ArrowRight size={10} className="text-emerald-500 transition-transform duration-300 group-hover:translate-x-1" />
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
