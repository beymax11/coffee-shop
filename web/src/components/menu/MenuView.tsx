"use client";

import React, { useState, useMemo, useEffect } from "react";
import { db } from "@/utils/db";
import { supabase } from "@/utils/supabase";
import { getCachedData } from "@/utils/cache";
import { Eye, Search, X, SlidersHorizontal } from "lucide-react";
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFilterOpen]);

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
      <div className="min-h-screen bg-background text-foreground pt-8 sm:pt-12 md:pt-16 pb-16 md:pb-24 relative overflow-hidden transition-colors duration-500">

        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 10%, rgba(46, 90, 68, 0.05) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(46, 90, 68, 0.03) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 relative z-10">

          {/* Header Title Block */}
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12 flex flex-col items-center">
            <span className="text-[11px] font-sans font-bold tracking-[0.25em] text-[#2E5A44] dark:text-emerald-400 uppercase mb-2">
              Antonioni Grounds
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black text-foreground tracking-tight leading-tight uppercase mb-3">
              Menu
            </h1>
            <p className="type-body text-neutral-600 dark:text-zinc-400 max-w-xl leading-relaxed text-sm sm:text-base">
              Here’s what’s pouring. Hot, iced, or somewhere in between. Modest and Grand are our size names, “medium” and “large” felt like someone else’s menu.
            </p>
          </div>

          {/* Mobile Search & Filter Toolbar (< lg only) */}
          <div className="flex items-center gap-2.5 mb-5 lg:hidden">
            <div className="relative flex-1 group">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors duration-300 group-focus-within:text-[#2E5A44] dark:group-focus-within:text-emerald-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-card-border dark:border-white/15 bg-card dark:bg-zinc-950/70 py-2.5 pl-10 pr-9 text-xs text-foreground dark:text-white outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/15 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className={`relative flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border text-xs font-sans font-bold tracking-wider uppercase transition-all duration-300 shadow-sm cursor-pointer shrink-0 ${selectedCategory !== "All"
                ? "border-emerald-500/50 bg-[#2E5A44] text-white shadow-md shadow-[#2E5A44]/20"
                : "border-card-border dark:border-white/15 bg-card dark:bg-zinc-950/70 text-foreground dark:text-zinc-200 hover:border-emerald-500/40"
                }`}
            >
              <SlidersHorizontal size={15} />
              <span className="truncate max-w-[100px]">{selectedCategory === "All" ? "Filter" : selectedCategory}</span>
              {selectedCategory !== "All" && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>

          {/* Main Layout: Sidebar on Left, Products on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 items-start">

            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 space-y-4 lg:space-y-6 bg-card dark:bg-zinc-950/70 p-4 sm:p-5 rounded-lg border border-card-border dark:border-white/10 shadow-sm backdrop-blur-md mb-2 lg:mb-0">

              {/* Sidebar Header */}
              <div className="hidden lg:flex lg:flex-col border-b border-card-border dark:border-white/10 pb-3 mb-2">
                <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#2E5A44] dark:text-emerald-400 uppercase">
                  Categories
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-zinc-400 mt-1">
                  Showing {filteredItems.length} of {items.length} options
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative w-full">
                <div className="relative group">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors duration-300 group-focus-within:text-[#2E5A44] dark:group-focus-within:text-emerald-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-card-border dark:border-white/15 bg-background-alt/50 dark:bg-black/40 py-2.5 sm:py-3 pl-11 pr-11 text-xs sm:text-sm text-foreground dark:text-white outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/15 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Tabs Wrapper */}
              <div className="relative border-t border-card-border dark:border-white/10 pt-3 lg:border-t-0 lg:pt-0">
                <div className="flex overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible">
                  <div className="flex gap-2 mx-auto min-w-max px-2 lg:px-0 lg:flex-col lg:w-full lg:gap-1.5">
                    {categories.map((category) => {
                      const isSelected = selectedCategory === category;
                      return (
                        <motion.button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`relative flex items-center justify-center lg:justify-start rounded-lg px-4 py-2 sm:px-5 sm:py-2.5 lg:px-4 lg:py-2.5 font-sans text-xs tracking-wider uppercase transition-all duration-300 whitespace-nowrap cursor-pointer z-10 lg:w-full ${isSelected
                            ? "border border-emerald-500/40 bg-[#2E5A44] text-white font-bold shadow-md shadow-[#2E5A44]/25"
                            : "border border-card-border dark:border-white/10 bg-card dark:bg-white/[0.03] text-neutral-600 dark:text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-background-alt/50 dark:hover:bg-white/[0.06] hover:border-emerald-500/30"
                            }`}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="flex items-center gap-2">
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                            <span>{category}</span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              {(searchQuery !== "" || selectedCategory !== "All") && (
                <div className="border-t border-card-border dark:border-white/10 pt-3">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="w-full text-center py-2.5 rounded-lg border border-dashed border-[#2E5A44]/40 text-[#2E5A44] dark:text-emerald-400 hover:bg-emerald-500/10 text-xs tracking-wider uppercase font-semibold transition-all cursor-pointer"
                  >
                    Reset Active Filters
                  </button>
                </div>
              )}
            </div>

            {/* Menu Items Grid */}
            <div className="lg:col-span-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-card-border dark:border-white/10 rounded-xl max-w-md mx-auto">
                  <p className="text-sm text-neutral-500 dark:text-zinc-400 font-medium">
                    {items.length === 0
                      ? "No menu items available at the moment."
                      : "No items found matching your filters."}
                  </p>
                  {(searchQuery !== "" || selectedCategory !== "All") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                      }}
                      className="mt-4 text-xs font-bold text-[#2E5A44] dark:text-emerald-400 hover:underline uppercase tracking-wider"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <StaggerContainer className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5 lg:gap-6">
                  {filteredItems.map((item) => {
                    const isColdOrFrappe =
                      item.category?.toLowerCase().includes("cold") ||
                      item.category?.toLowerCase().includes("coffee-free") ||
                      item.category?.toLowerCase().includes("frappe") ||
                      item.category?.toLowerCase().includes("soda");

                    return (
                      <StaggerItem key={item.id}>
                        <div
                          onClick={() => handleQuickView(item)}
                          className="group relative flex flex-col justify-between rounded-lg border border-card-border dark:border-white/10 bg-card dark:bg-zinc-950/60 hover:bg-card/95 dark:hover:bg-zinc-900/80 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(46,90,68,0.1)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] cursor-pointer h-full overflow-hidden backdrop-blur-sm"
                        >
                          {/* Drink / Product Image Container (Fitted directly to the Card Box) */}
                          <div className="relative aspect-square w-full overflow-hidden bg-background-alt/50 dark:bg-black/40 border-b border-card-border dark:border-white/10">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />

                            {/* Lens Focus Marks (Artisan Detail) */}
                            <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-neutral-300 dark:border-white/30 pointer-events-none" />
                            <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-neutral-300 dark:border-white/30 pointer-events-none" />
                            <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b border-l border-neutral-300 dark:border-white/30 pointer-events-none" />
                            <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-neutral-300 dark:border-white/30 pointer-events-none" />

                            {/* Hover Quick View Eye */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <span className="flex items-center justify-center rounded-full bg-[#2E5A44] p-2.5 sm:p-3 text-white shadow-lg">
                                <Eye size={15} />
                              </span>
                            </div>
                          </div>

                          {/* Details & Pricing */}
                          <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 md:p-4.5">
                            <div>
                              {/* Item Name */}
                              <h3 className="text-xs sm:text-sm md:text-base font-sans font-bold tracking-tight text-foreground dark:text-white group-hover:text-[#2E5A44] dark:group-hover:text-emerald-400 transition-colors duration-300 text-center line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">
                                {item.name}
                              </h3>

                              {/* Category Note */}
                              <span className="text-[8px] sm:text-[9px] font-sans font-semibold tracking-wider text-neutral-500 dark:text-zinc-400 uppercase text-center block mt-0.5">
                                {item.category}
                              </span>
                            </div>

                            {/* Antonioni 3-Tier Price Block */}
                            <div className="mt-2.5 pt-2 sm:mt-3 sm:pt-2.5 border-t border-card-border dark:border-white/10 w-full">
                              {item.hot != null && item.modest != null && item.grand != null ? (
                                <div className="flex items-center justify-center divide-x divide-card-border dark:divide-white/20 text-center w-full">
                                  <div className="flex-1 px-0.5 flex flex-col items-center">
                                    <span className="text-[11px] sm:text-xs md:text-sm font-extrabold text-[#2E5A44] dark:text-emerald-400 tracking-tight">
                                      ₱{Math.round(Number(item.hot))}
                                    </span>
                                    <span className="text-[7px] sm:text-[8px] font-sans font-bold text-[#2E5A44] dark:text-emerald-400 uppercase tracking-wider">
                                      {isColdOrFrappe ? "MINI" : "HOT"}
                                    </span>
                                  </div>
                                  <div className="flex-1 px-0.5 flex flex-col items-center">
                                    <span className="text-[11px] sm:text-xs md:text-sm font-extrabold text-foreground dark:text-white tracking-tight">
                                      ₱{Math.round(Number(item.modest))}
                                    </span>
                                    <span className="text-[7px] sm:text-[8px] font-sans font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">
                                      MODEST
                                    </span>
                                  </div>
                                  <div className="flex-1 px-0.5 flex flex-col items-center">
                                    <span className="text-[11px] sm:text-xs md:text-sm font-extrabold text-foreground dark:text-white tracking-tight">
                                      ₱{Math.round(Number(item.grand))}
                                    </span>
                                    <span className="text-[7px] sm:text-[8px] font-sans font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">
                                      GRAND
                                    </span>
                                  </div>
                                </div>
                              ) : item.modest != null && item.grand != null ? (
                                <div className="flex items-center justify-center divide-x divide-card-border dark:divide-white/20 text-center w-full">
                                  <div className="flex-1 px-1 flex flex-col items-center">
                                    <span className="text-[11px] sm:text-xs md:text-sm font-extrabold text-[#2E5A44] dark:text-emerald-400 tracking-tight">
                                      ₱{Math.round(Number(item.modest))}
                                    </span>
                                    <span className="text-[7px] sm:text-[8px] font-sans font-bold text-[#2E5A44] dark:text-emerald-400 uppercase tracking-wider">
                                      MODEST
                                    </span>
                                  </div>
                                  <div className="flex-1 px-1 flex flex-col items-center">
                                    <span className="text-[11px] sm:text-xs md:text-sm font-extrabold text-foreground dark:text-white tracking-tight">
                                      ₱{Math.round(Number(item.grand))}
                                    </span>
                                    <span className="text-[7px] sm:text-[8px] font-sans font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">
                                      GRAND
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-0.5">
                                  <span className="text-xs sm:text-base font-extrabold text-foreground dark:text-white tracking-tight">
                                    ₱{Math.round(Number(item.price ?? item.modest ?? item.hot ?? item.grand ?? 0))}
                                  </span>
                                </div>
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

      {/* Mobile Categories Bottom Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Bottom Drawer Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-h-[82vh] flex flex-col bg-card dark:bg-[#141615] rounded-t-2xl border-t border-card-border dark:border-white/15 shadow-2xl overflow-hidden"
            >
              {/* Drag Handle */}
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-white/20" />
              </div>

              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-card-border dark:border-white/10">
                <div>
                  <h3 className="text-sm font-sans font-bold tracking-tight text-foreground dark:text-white uppercase">
                    Categories
                  </h3>
                  <span className="text-[10px] text-neutral-500 dark:text-zinc-400">
                    Showing {filteredItems.length} of {items.length} options
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-full hover:bg-background-alt dark:hover:bg-white/10 text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Close filter drawer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Categories List */}
              <div className="p-4 sm:p-5 overflow-y-auto max-h-[52vh] space-y-1.5">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-sans text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer ${isSelected
                        ? "bg-[#2E5A44] text-white font-bold shadow-md shadow-[#2E5A44]/25"
                        : "border border-card-border dark:border-white/10 bg-background-alt/30 dark:bg-white/[0.03] text-neutral-700 dark:text-zinc-300 hover:border-emerald-500/40 hover:bg-background-alt/60"
                        }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-emerald-400" : "bg-neutral-400/40"}`} />
                        <span>{category}</span>
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-sans font-bold text-emerald-400 tracking-wider">ACTIVE</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-card-border dark:border-white/10 bg-background-alt/40 dark:bg-black/30 flex gap-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {selectedCategory !== "All" && (
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setIsMobileFilterOpen(false);
                    }}
                    className="flex-1 py-3 rounded-lg border border-card-border dark:border-white/15 bg-card dark:bg-white/5 text-xs font-sans font-bold uppercase tracking-wider text-neutral-600 dark:text-zinc-300 hover:text-foreground transition-all cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 rounded-lg bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-md shadow-[#2E5A44]/25 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
