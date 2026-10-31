"use client";

import React, { useState, useMemo, useEffect } from "react";
import { db } from "@/utils/db";
import { supabase } from "@/utils/supabase";
import { getCachedData } from "@/utils/cache";
import { Eye, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QuickViewModal } from "@/components/menu/QuickViewModal";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";
import { MenuItem } from "@/types";

const SHOW_AVAILABLE_SOON = true;

const LEGACY_MOCK_CATEGORIES = [
  "Hot Coffee",
  "Cold Coffee",
  "Signature Drinks",
  "Non-Coffee",
  "Pastries",
  "Desserts",
];

export function MenuView() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Sync menu categories from Supabase database (menu_categories table)
  const fetchCategories = async () => {
    try {
      const data = await getCachedData("menu_categories", async () => {
        if (supabase) {
          const { data: dbData, error } = await supabase
            .from("menu_categories")
            .select("name")
            .order("created_at", { ascending: true });
          if (!error && dbData && dbData.length > 0) {
            return dbData
              .map((c: any) => c.name?.trim())
              .filter((c: string) => !!c && !LEGACY_MOCK_CATEGORIES.includes(c));
          } else if (error) {
            console.warn("Supabase select menu_categories error:", error);
          }
        }
        // Fallback to /api/menu/categories endpoint
        const res = await fetch("/api/menu/categories");
        if (res.ok) {
          const json = await res.json();
          if (json.categories && Array.isArray(json.categories)) {
            return json.categories
              .map((c: any) => (typeof c === "string" ? c : c?.name)?.trim())
              .filter((c: string) => !!c && !LEGACY_MOCK_CATEGORIES.includes(c));
          }
        }
        return [];
      });

      if (data && data.length > 0) {
        setDbCategories(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("menu_categories", JSON.stringify(data));
        }
      }
    } catch (err) {
      console.warn("Failed to fetch menu categories:", err);
    }
  };

  // Sync menu items strictly from Supabase (no mock data fallback)
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
            console.error("Supabase select menu_items error:", error);
          }
        }
        return [];
      });
      setItems(data || []);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
      setItems([]);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedCats = localStorage.getItem("menu_categories");
        if (storedCats) {
          const parsedCats = JSON.parse(storedCats);
          if (Array.isArray(parsedCats)) {
            const cleanedCats = parsedCats
              .map((c: any) => (typeof c === "string" ? c : c?.name)?.trim())
              .filter((c: string) => !!c && !LEGACY_MOCK_CATEGORIES.includes(c));
            if (cleanedCats.length > 0) {
              setDbCategories(cleanedCats);
            }
            if (cleanedCats.length !== parsedCats.length) {
              localStorage.setItem("menu_categories", JSON.stringify(cleanedCats));
            }
          }
        }
      } catch (_) { }
    }

    fetchMenuItems();
    fetchCategories();

    const handleStorage = (e: Event) => {
      const storageEvent = e as StorageEvent;
      if (
        storageEvent.key === undefined ||
        storageEvent.key === "menu_items" ||
        storageEvent.key === null
      ) {
        fetchMenuItems();
      }
      if (
        storageEvent.key === undefined ||
        storageEvent.key === "menu_categories" ||
        storageEvent.key === null
      ) {
        fetchCategories();
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("menu_categories_updated", fetchCategories);
    window.addEventListener("menu_items_updated", fetchMenuItems);

    // Live realtime sync with Supabase for menu_categories and menu_items
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel("public:menu_categories_and_items")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "menu_categories" },
          () => {
            fetchCategories();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "menu_items" },
          () => {
            fetchMenuItems();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("menu_categories_updated", fetchCategories);
      window.removeEventListener("menu_items_updated", fetchMenuItems);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Compute categories prioritizing Supabase menu_categories table
  const categories = useMemo(() => {
    const list: string[] = ["All"];
    const seen = new Set<string>(["all"]);

    // 1. First add categories from Supabase menu_categories table (in order)
    dbCategories.forEach((cat) => {
      const trimmed = cat.trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && !seen.has(lower)) {
        seen.add(lower);
        list.push(trimmed);
      }
    });

    // 2. Also include any category from existing items that may not be in menu_categories
    items.forEach((item) => {
      const trimmed = item.category?.trim();
      if (trimmed) {
        const lower = trimmed.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push(trimmed);
        }
      }
    });

    return list;
  }, [dbCategories, items]);

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        item.category?.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const handleQuickView = (item: MenuItem) => {
    setSelectedItem(item);
    setIsQuickViewOpen(true);
  };

  if (SHOW_AVAILABLE_SOON) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background py-16 md:py-24 text-foreground relative overflow-hidden transition-colors duration-500">
          {/* Subtle decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Glowing green blobs */}
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(46,90,68,0.08)_0%,transparent_70%)] blur-[120px]" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(46,90,68,0.06)_0%,transparent_70%)] blur-[120px]" />
            <div className="absolute top-[30%] left-[40%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(46,90,68,0.04)_0%,transparent_70%)] blur-[100px]" />

            {/* Fine luxury grid lines overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, var(--card-border) 1px, transparent 1px), linear-gradient(to bottom, var(--card-border) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
                maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
            <FadeUp className="max-w-lg mx-auto text-center flex flex-col items-center py-8 sm:py-12">
              <span className="type-eyebrow text-emerald-600 dark:text-emerald-400 font-bold block mb-2">
                Menu
              </span>
              <h2 className="type-h2 text-foreground font-serif leading-tight">
                This feature is available soon.
              </h2>
              <p className="text-base font-medium text-emerald-600 dark:text-emerald-400 mt-2">
                Curating our digital coffee &amp; pastry catalog.
              </p>
              <p className="type-body text-neutral-600 dark:text-zinc-400 mt-3 mb-8 max-w-md leading-relaxed text-sm sm:text-base">
                We&apos;re finalizing our handcrafted beverage and pastry lineup to bring you a seamless browsing experience. Check back soon to explore what&apos;s pouring.
              </p>
              <div className="w-full max-w-xs space-y-3">
                <div className="type-ui group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#2E5A44] py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#234533] hover:shadow-[0_0_25px_rgba(46,90,68,0.3)] select-none">
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
                  <span className="relative flex items-center gap-1.5">
                    <span>Tara, kape!</span>
                  </span>
                </div>
                <p className="inline-block text-xs font-medium text-neutral-500 dark:text-zinc-400 pt-2">
                  Antonioni Grounds Digital Menu
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </PageTransition>
    );
  }

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
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12 flex flex-col items-center">
            <span className="text-[11px] font-sans font-bold tracking-[0.25em] text-[#2E5A44] dark:text-emerald-400 uppercase mb-2">
              Antonioni Grounds
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black text-foreground tracking-tight leading-tight uppercase mb-3">
              Menu
            </h1>
            <p className="type-body text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed text-sm sm:text-base">
              Here’s what’s pouring. Hot, iced, or somewhere in between. Modest and Grand are our size names, “medium” and “large” felt like someone else’s menu.
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
                    placeholder="Search menu..."
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
                          className={`relative flex items-center justify-center lg:justify-start rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 lg:px-4 lg:py-2.5 type-ui border text-[10px] tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer z-10 lg:w-full ${isSelected
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
                  <p className="type-body-sm text-zinc-500 dark:text-zinc-500 font-medium">
                    {items.length === 0
                      ? "No menu items available at the moment."
                      : "No items found matching your filters."}
                  </p>
                  {(searchQuery !== "" || selectedCategory !== "All") && (
                    <button
                      onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                      className="mt-4 type-ui text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors font-bold underline decoration-emerald-500/30"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                /* Items Grid */
                <StaggerContainer className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                  {filteredItems.map((item) => {
                    return (
                      <StaggerItem key={item.id}>
                        <div
                          onClick={() => handleQuickView(item)}
                          className="group relative flex flex-col justify-between rounded-2xl border border-card-border dark:border-zinc-900 bg-card dark:bg-zinc-950/40 overflow-hidden transition-all duration-500 hover:border-emerald-500/35 hover:bg-card/90 dark:hover:bg-zinc-900/30 hover:shadow-[0_0_35px_rgba(46,90,68,0.06)] dark:hover:shadow-[0_0_40px_rgba(46,90,68,0.08)] cursor-pointer h-full"
                        >
                          {/* Premium Image Container */}
                          <div className="relative aspect-square w-full overflow-hidden bg-zinc-900 dark:bg-zinc-950 border-b border-card-border dark:border-zinc-900">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-[0.5deg]"
                              loading="lazy"
                              decoding="async"
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
                          <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-5 md:p-6">
                            <div>
                              {/* Item Name */}
                              <h3 className="text-xs sm:text-base font-sans font-extrabold tracking-tight text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 line-clamp-1 sm:line-clamp-2">
                                {item.name}
                              </h3>

                              {/* Category */}
                              <div className="mt-1">
                                <span className="text-[8px] sm:text-[9px] font-sans font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                                  {item.category}
                                </span>
                              </div>

                              {/* Description */}
                              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between border-t border-card-border dark:border-zinc-900 pt-2.5 mt-3 sm:pt-4 sm:mt-4">
                              <span className="text-xs sm:text-base font-sans font-extrabold text-[#2E5A44] dark:text-emerald-400">
                                {item.price != null
                                  ? `₱${Number(item.price).toFixed(2)}`
                                  : item.modest != null
                                    ? `₱${Number(item.modest).toFixed(2)}`
                                    : item.hot != null
                                      ? `₱${Number(item.hot).toFixed(2)}`
                                      : item.grand != null
                                        ? `₱${Number(item.grand).toFixed(2)}`
                                        : "—"}
                              </span>

                              {(item.modest != null || item.grand != null || item.hot != null) && (
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                                  {item.modest != null && item.grand != null
                                    ? "Modest / Grand"
                                    : item.hot != null
                                      ? "Hot / Iced"
                                      : "Sizes available"}
                                </span>
                              )}
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
