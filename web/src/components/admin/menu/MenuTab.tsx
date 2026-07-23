"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Star,
  Eye,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Coffee,
  SlidersHorizontal,
  RefreshCw,
  Tag,
} from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<string>("name");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Available categories calculation
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

  // Filtered & Sorted items computation
  const filteredMenuItems = useMemo(() => {
    let result = menuItems.filter((item) => {
      // 1. Search Query
      if (menuSearch.trim()) {
        const q = menuSearch.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
        if (!matchName && !matchDesc && !matchCat && !matchTags) {
          return false;
        }
      }

      // 2. Category Filter
      if (menuCatFilter !== "All" && item.category !== menuCatFilter) {
        return false;
      }

      return true;
    });

    // Sort logic
    result = [...result].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return (b.rating ?? 5.0) - (a.rating ?? 5.0);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [menuItems, menuSearch, menuCatFilter, sortBy]);

  // Reset pagination when search, category filter, or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [menuSearch, menuCatFilter, sortBy, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMenuItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMenuItems.slice(start, start + itemsPerPage);
  }, [filteredMenuItems, currentPage, itemsPerPage]);

  const hasActiveFilters = Boolean(menuSearch.trim() || menuCatFilter !== "All" || sortBy !== "name");

  const resetAllFilters = () => {
    setMenuSearch("");
    setMenuCatFilter("All");
    setSortBy("name");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* 1. SEARCH, FILTERS & ACTION TOOLBAR (AUDIT LOGS STYLE) */}
      <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md p-4 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search coffee, pastries, descriptions, or tags..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-brand-green transition-all"
            />
            {menuSearch && (
              <button
                onClick={() => setMenuSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground text-xs font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Toolbar: View Mode Toggle & Add Item Button */}
          <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 dark:bg-background-alt border border-neutral-200 dark:border-card-border rounded-xl p-1">
              <div className="relative group">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-colors ${
                    viewMode === "table" ? "bg-brand-green text-white" : "text-neutral-600 dark:text-neutral-400 hover:text-foreground"
                  }`}
                  aria-label="Table View"
                >
                  <List size={15} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                  Table View
                </div>
              </div>

              <div className="relative group">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-colors ${
                    viewMode === "grid" ? "bg-brand-green text-white" : "text-neutral-600 dark:text-neutral-400 hover:text-foreground"
                  }`}
                  aria-label="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                  Grid View
                </div>
              </div>
            </div>

            {/* Reset Filters / Refresh Button */}
            {hasActiveFilters && (
              <div className="relative group">
                <button
                  onClick={resetAllFilters}
                  className="p-2.5 rounded-xl border border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt hover:bg-neutral-100 dark:hover:bg-neutral-800/30 text-neutral-700 dark:text-neutral-400 hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Reset Filters"
                >
                  <RefreshCw size={15} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                  Reset Filters
                </div>
              </div>
            )}

            {/* Add Item Primary Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green/90 text-white text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Categories & Sorting Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-200/60 dark:border-card-border/60">
          {/* Category Pill Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => {
              const isActive = menuCatFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setMenuCatFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-brand-green text-white shadow-sm font-semibold"
                      : "bg-neutral-100 dark:bg-background-alt text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-card-border"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal size={13} className="text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground focus:outline-none focus:border-brand-green cursor-pointer"
            >
              <option value="name">Sort by Name (A-Z)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Active Filter Pills Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200/60 dark:border-card-border/40 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Filter size={12} className="text-brand-green" />
              Active Filters:
            </span>

            {menuSearch.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Keyword: "{menuSearch}"
                <button onClick={() => setMenuSearch("")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            {menuCatFilter !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Category: {menuCatFilter}
                <button onClick={() => setMenuCatFilter("All")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            {sortBy !== "name" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Sorted: {sortBy === "price-asc" ? "Price ↑" : sortBy === "price-desc" ? "Price ↓" : "Rating"}
                <button onClick={() => setSortBy("name")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            <button
              onClick={resetAllFilters}
              className="text-[11px] text-amber-500 hover:text-amber-600 dark:text-amber-400 font-semibold underline underline-offset-2 ml-auto cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* 2. MENU ITEMS DISPLAY (TABLE OR GRID VIEW) */}
      <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        {filteredMenuItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
              <Coffee size={24} />
            </div>
            <h3 className="type-h3 text-foreground font-serif text-lg">No Menu Items Found</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md">
              There are no menu offerings matching your search query or selected category filter. Try clearing your filters or creating a new item.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="mt-2 text-xs font-semibold text-brand-green hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-background-alt border-b border-neutral-200 dark:border-card-border uppercase text-[10px] tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Item Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4 text-right">Price</th>
                  <th className="py-3.5 px-4 text-center w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/70 dark:divide-card-border">
                {paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors group cursor-pointer"
                    onClick={() => setViewingItem(item)}
                  >
                    {/* Details: Image, Name, Description, Tags */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-12 rounded-lg overflow-hidden border border-neutral-200 dark:border-card-border bg-neutral-100 dark:bg-background-alt shrink-0 relative shadow-inner">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground font-serif text-sm truncate">{item.name}</div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate max-w-xs md:max-w-md">{item.description}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20">
                        {item.category}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs">
                        <Star size={12} className="fill-amber-500 text-amber-500" />
                        <span className="font-semibold text-foreground">{item.rating?.toFixed(1) ?? "5.0"}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-serif text-brand-green dark:text-emerald-400 text-sm font-bold">
                        ₱{item.price.toFixed(2)}
                      </span>
                    </td>

                    {/* Operations */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingItem(item)}
                          className="p-1.5 rounded-lg bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-neutral-500 dark:text-neutral-400 hover:text-brand-green hover:border-brand-green/30 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => onEditItem(item)}
                          className="p-1.5 rounded-lg bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-neutral-500 dark:text-neutral-400 hover:text-brand-green hover:border-brand-green/30 transition-colors cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setViewingItem(item)}
                className="rounded-xl border border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt overflow-hidden hover:border-brand-green/40 transition-all shadow-sm flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="relative h-36 w-full overflow-hidden bg-neutral-100 dark:bg-background">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/90 dark:bg-neutral-900/90 text-brand-green border border-brand-green/20 backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-serif font-bold text-foreground text-base truncate">{item.name}</h4>
                      <span className="font-serif text-brand-green dark:text-emerald-400 font-bold text-sm shrink-0">
                        ₱{item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">{item.description}</p>
                  </div>
                </div>
                <div
                  className="p-3.5 pt-2 flex items-center justify-between border-t border-neutral-200/50 dark:border-card-border/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1 text-xs">
                    <Star size={13} className="fill-amber-500 text-amber-500" />
                    <span className="font-semibold text-foreground text-xs">{item.rating?.toFixed(1) ?? "5.0"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingItem(item)}
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-card-border text-neutral-500 hover:text-brand-green transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-card-border text-neutral-500 hover:text-brand-green transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. PAGINATION FOOTER */}
        {filteredMenuItems.length > 0 && (
          <div className="p-4 border-t border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <span>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMenuItems.length)} of {filteredMenuItems.length} items
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-white dark:bg-card border border-neutral-200 dark:border-card-border text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-card-border bg-white dark:bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-card text-foreground cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 font-mono text-foreground font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-card-border bg-white dark:bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-card text-foreground cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ITEM DETAILS MODAL */}
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

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[92vh] overflow-y-auto"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              {/* Glow Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-[25px] rounded-full pointer-events-none" />

              {/* Close Overlay Button */}
              <button
                onClick={() => setViewingItem(null)}
                className="absolute top-4 right-4 z-20 text-white bg-black/50 hover:bg-black/70 transition-colors duration-200 p-2 rounded-full cursor-pointer backdrop-blur-sm"
              >
                <X size={14} />
              </button>

              {/* Image Banner */}
              <div className="relative h-56 w-full bg-neutral-100 dark:bg-background-alt shrink-0">
                <img
                  src={viewingItem.image}
                  alt={viewingItem.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute bottom-4 left-6">
                  <span className="rounded-xl bg-brand-green px-3 py-1 text-[10px] uppercase font-mono font-bold tracking-wider text-white shadow-lg shadow-brand-green/20 border border-white/20">
                    {viewingItem.category}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-foreground font-serif font-bold text-2xl tracking-tight leading-tight">
                    {viewingItem.name}
                  </h3>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const currentRating = viewingItem.rating ?? 5.0;
                        return (
                          <Star
                            key={i}
                            size={13}
                            fill={i < Math.round(currentRating) ? "currentColor" : "none"}
                            className={i < Math.round(currentRating) ? "text-amber-500" : "text-neutral-300 dark:text-neutral-600"}
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
                      {(viewingItem.rating ?? 5.0).toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex justify-between items-center rounded-xl bg-neutral-50 dark:bg-background-alt border border-neutral-200 dark:border-card-border p-4 shadow-sm">
                  <span className="text-[10px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                    Price
                  </span>
                  <span className="font-serif text-brand-green dark:text-emerald-400 text-2xl font-bold">
                    ₱{viewingItem.price.toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                    Description
                  </h4>
                  <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-background-alt/60 rounded-xl p-3.5 border border-neutral-200/70 dark:border-card-border/50">
                    {viewingItem.description}
                  </p>
                </div>

                {/* Tags */}
                {viewingItem.tags && viewingItem.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase flex items-center gap-1">
                      <Tag size={12} /> Tags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingItem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-neutral-100 dark:bg-background-alt border border-neutral-200 dark:border-card-border px-2.5 py-1 text-[10px] font-medium text-neutral-600 dark:text-neutral-300"
                        >
                          #{tag}
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
