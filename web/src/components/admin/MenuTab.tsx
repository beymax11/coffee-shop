"use client";

import React, { useMemo, useState } from "react";
import { Search, Plus, Edit3, Trash2, Star, Eye, X } from "lucide-react";
import { MenuItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface MenuTabProps {
  menuItems: MenuItem[];
  menuSearch: string;
  setMenuSearch: (search: string) => void;
  menuCatFilter: string;
  setMenuCatFilter: (cat: string) => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenAddModal: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

export const MenuTab: React.FC<MenuTabProps> = ({
  menuItems,
  menuSearch,
  setMenuSearch,
  menuCatFilter,
  setMenuCatFilter,
  onEditItem,
  onDeleteItem,
  onOpenAddModal,
}) => {
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);

  // Filtered lists
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCat = menuCatFilter === "All" || item.category === menuCatFilter;
    return matchesSearch && matchesCat;
  });

  const categories = useMemo(() => {
    const defaultCats = [
      "All",
      "Hot Coffee",
      "Cold Coffee",
      "Signature Drinks",
      "Non-Coffee",
      "Pastries",
      "Desserts",
    ];
    const customCats = menuItems
      .map((item) => item.category)
      .filter((cat): cat is string => !!cat && !defaultCats.includes(cat));
    return [...defaultCats, ...Array.from(new Set(customCats))];
  }, [menuItems]);

  return (
    <div className="space-y-6">
      {/* Filter Deck */}
      <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card/50 backdrop-blur-sm p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="Search coffee or pastries..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full rounded-full border border-card-border bg-background/40 py-2.5 pl-10 pr-4 type-caption text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background/60 focus:ring-1 focus:ring-brand-green/20"
            />
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-1.5 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-5 py-2.5 type-ui text-[9px] text-white transition-all duration-300 font-bold shadow-lg shadow-[#2E5A44]/10 hover:shadow-[#234533]/25 cursor-pointer sm:shrink-0 min-h-[44px]"
          >
            <Plus size={13} />
            Add Item
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          {categories.map((cat) => {
            const isActive = menuCatFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setMenuCatFilter(cat)}
                className={`rounded-full px-3.5 py-1.5 type-ui text-[9px] tracking-wider border cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-brand-green border-brand-green text-white font-semibold shadow-[0_2px_10px_rgba(46,90,68,0.2)]"
                    : "bg-foreground/[0.02] border-card-border/50 text-neutral-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white dark:hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* List Table */}
      <div className="rounded-2xl border border-card-border bg-card/40 backdrop-blur-sm overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-card-border bg-background-alt/30 type-label text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400">
                <th className="p-4 pl-6">Item Details</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 pr-6 text-center w-28">Operations</th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-card-border/50"
            >
              {filteredMenuItems.map((item) => (
                <motion.tr
                  key={item.id}
                  variants={rowVariants}
                  className="hover:bg-foreground/[0.015] transition-colors group"
                >
                  <td className="p-4 pl-6 flex items-center gap-4">
                    <div className="h-10 w-14 rounded-lg overflow-hidden border border-card-border bg-background-alt shrink-0 relative shadow-inner">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="type-body-sm font-semibold text-foreground truncate font-serif text-sm">{item.name}</p>
                      <p className="type-caption text-neutral-500 dark:text-zinc-500 truncate text-[11px] max-w-xs mt-0.5">{item.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="type-caption text-neutral-500 dark:text-zinc-400 text-xs">{item.category}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="type-price font-serif text-brand-green dark:text-emerald-400 text-[15px] font-bold">₱{item.price.toFixed(2)}</span>
                  </td>
                  <td className="p-4 pr-6 text-center">
                    <div className="inline-flex gap-1.5">
                      <button
                        onClick={() => setViewingItem(item)}
                        className="p-2 rounded-lg hover:bg-foreground/[0.04] dark:hover:bg-white/5 text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-all duration-300 cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => onEditItem(item)}
                        className="p-2 rounded-lg hover:bg-brand-green/10 text-neutral-500 dark:text-zinc-400 hover:text-brand-green transition-all duration-300 cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 dark:text-zinc-400 hover:text-red-400 transition-all duration-300 cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}

              {filteredMenuItems.length === 0 && (
                <motion.tr variants={rowVariants}>
                  <td colSpan={5} className="p-12 text-center text-neutral-500 italic type-body-sm bg-background-alt/10">
                    No menu items found matching filters.
                  </td>
                </motion.tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingItem(null)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-card-border bg-card overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[92vh] overflow-y-auto"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              {/* Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 blur-[25px] rounded-full pointer-events-none" />

              {/* Close Button overlay */}
              <button
                onClick={() => setViewingItem(null)}
                className="absolute top-4 right-4 z-20 text-white bg-black/40 hover:bg-black/60 transition-colors duration-300 p-2 rounded-full cursor-pointer backdrop-blur-sm"
              >
                <X size={14} />
              </button>

              {/* Hero Image */}
              <div className="relative h-56 w-full bg-background-alt shrink-0">
                <img
                  src={viewingItem.image}
                  alt={viewingItem.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                
                {/* Category Badge on image */}
                <div className="absolute bottom-4 left-6">
                  <span className="rounded-full bg-brand-green px-3 py-1 text-[9px] uppercase tracking-wider font-bold text-white shadow-lg shadow-brand-green/20">
                    {viewingItem.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-2xl tracking-tight leading-tight">
                    {viewingItem.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const currentRating = viewingItem.rating ?? 5.0;
                        return (
                          <Star
                            key={i}
                            size={12}
                            fill={i < Math.round(currentRating) ? "currentColor" : "none"}
                            className={i < Math.round(currentRating) ? "text-amber-500" : "text-neutral-300 dark:text-zinc-600"}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[11px] text-neutral-500 dark:text-zinc-400 font-medium">
                      {(viewingItem.rating ?? 5.0).toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>

                {/* Pricing Info */}
                <div className="flex justify-between items-center rounded-xl bg-background/50 border border-card-border p-4">
                  <span className="text-[10px] font-bold tracking-wider text-neutral-500 dark:text-zinc-400 uppercase">
                    Price
                  </span>
                  <span className="type-price font-serif text-brand-green dark:text-emerald-400 text-2xl font-bold">
                    ₱{viewingItem.price.toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold tracking-wider text-neutral-500 dark:text-zinc-400 uppercase">
                    Description
                  </h4>
                  <p className="text-xs leading-relaxed text-neutral-600 dark:text-zinc-300 bg-background/30 rounded-xl p-3.5 border border-card-border/50">
                    {viewingItem.description}
                  </p>
                </div>

                {/* Tags */}
                {viewingItem.tags && viewingItem.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold tracking-wider text-neutral-500 dark:text-zinc-400 uppercase">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingItem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-foreground/[0.03] border border-card-border/50 px-3 py-1 text-[10px] text-neutral-600 dark:text-zinc-400 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
