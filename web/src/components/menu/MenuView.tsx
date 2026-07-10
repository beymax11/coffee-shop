"use client";

import React, { useState, useMemo, useEffect } from "react";
import { db } from "@/utils/db";
import { supabase } from "@/utils/supabase";
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
  Layers
} from "lucide-react";
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
  const fetchMenuItems = async () => {
    if (supabase) {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("name");
      if (!error && data) {
        setItems(data as MenuItem[]);
        return;
      } else if (error) {
        console.error("Supabase select error:", error);
      }
    }
    setItems(db.getMenuItems());
  };

  useEffect(() => {
    fetchMenuItems();
    const handleStorage = () => {
      fetchMenuItems();
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
            <h1 className="type-h1 text-foreground tracking-tight leading-tight">
              The <span className="text-emerald-600 dark:text-emerald-400 italic font-serif font-normal">Curated</span> Menu
            </h1>
            
            {/* Premium Director's Line */}
            <div className="flex items-center justify-center gap-3 mt-5 mb-6">
              <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-emerald-500/50" />
              <Film size={10} className="text-emerald-500/80 rotate-12" />
              <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-emerald-500/50" />
            </div>

            <p className="type-body text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
              Explore our master-crafted hot brews, cold tonics, zero-proof signature cocktail pairings, and freshly baked luxury desserts, directed with absolute precision.
            </p>
          </div>

          {/* Unified Filter Deck */}
          <div className="relative max-w-5xl mx-auto mb-10 rounded-2xl border border-card-border bg-card/65 dark:bg-zinc-950/60 p-6 backdrop-blur-md shadow-2xl glassmorphism-green">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" size={16} />
                <input
                  type="text"
                  placeholder="Search pourings, roasts, or pastries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-card-border dark:border-zinc-800 bg-background-alt/30 dark:bg-zinc-900/35 py-3 pl-12 pr-6 type-field text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-inner"
                />
              </div>

              {/* Quick Summary */}
              <div className="text-left lg:text-right flex items-center lg:justify-end gap-2.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="type-caption text-zinc-500 dark:text-zinc-400">
                  Showing <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{filteredItems.length}</strong> of {items.length} artisan selections
                </span>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="border-t border-card-border dark:border-zinc-900/60 mt-6 pt-6">
              <div className="flex overflow-x-auto pb-2 scrollbar-none -mx-6 px-6 lg:mx-0 lg:px-0">
                <div className="flex gap-2.5 mx-auto">
                  {categories.map((category) => {
                    const IconComponent = categoryIcons[category] || Compass;
                    const isSelected = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 type-ui border transition-all duration-300 whitespace-nowrap ${
                          isSelected
                            ? "bg-[#2E5A44] border-[#2E5A44] text-white shadow-lg font-bold scale-[1.02]"
                            : "bg-background-alt/20 border-card-border text-zinc-600 hover:text-foreground dark:bg-zinc-900/20 dark:border-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:border-emerald-500/30 hover:bg-background"
                        }`}
                      >
                        <IconComponent size={14} className={isSelected ? "text-white" : "text-emerald-500"} />
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
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => {
                const isSignature = item.category === "Signature Drinks" || item.tags?.includes("Exclusive");
                return (
                  <StaggerItem key={item.id}>
                    <div
                      onClick={() => handleQuickView(item)}
                      className="group relative flex flex-col justify-between rounded-2xl border border-card-border dark:border-zinc-900 bg-card dark:bg-zinc-950/40 p-5 transition-all duration-500 hover:border-emerald-500/35 hover:bg-card/90 dark:hover:bg-zinc-900/30 hover:shadow-[0_0_35px_rgba(46,90,68,0.06)] dark:hover:shadow-[0_0_40px_rgba(46,90,68,0.08)] cursor-pointer h-full"
                    >
                      {/* Premium Image Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-900 dark:bg-zinc-950 mb-5 border border-card-border dark:border-zinc-900">
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

                        {/* Floating Cinematic Scene tag */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 text-[8px] bg-black/60 backdrop-blur-md rounded border border-zinc-800/80 text-zinc-400 font-mono tracking-widest uppercase">
                          Scene {item.id.replace("m-", "").slice(0, 3)}
                        </div>

                        {/* Top Right Award/Exclusive overlay */}
                        {isSignature && (
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded bg-[#2E5A44] px-1.5 py-0.5 shadow-md">
                            <Award size={8} className="text-white" />
                            <span className="text-[7.5px] font-sans font-bold tracking-wider text-white uppercase">RESERVE</span>
                          </div>
                        )}
                        
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
                            <div className="flex items-center gap-1">
                              <Sparkles size={10} className="text-emerald-500 animate-pulse" />
                              <span className="text-[9px] font-sans font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                                {item.category}
                              </span>
                            </div>
                          </div>

                          {/* Item Name */}
                          <h3 className="text-lg font-serif font-bold text-foreground mt-2.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                            {item.name}
                          </h3>
                          
                          {/* Tags block */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.tags.map((tag) => (
                                <span 
                                  key={tag} 
                                  className="text-[8px] font-sans font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Description */}
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Price & Action Footer */}
                        <div className="flex items-center justify-between border-t border-card-border dark:border-zinc-900 pt-4 mt-5">
                          <span className="text-lg font-serif text-emerald-600 dark:text-emerald-400 font-semibold">
                            ₱{item.price.toFixed(2)}
                          </span>
                          
                          <span
                            className="text-[10px] font-sans font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400 group-hover:text-foreground dark:group-hover:text-white flex items-center gap-1.5 transition-colors duration-300"
                          >
                            Explore
                            <ArrowRight size={12} className="text-emerald-500 transition-transform duration-300 group-hover:translate-x-1" />
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
