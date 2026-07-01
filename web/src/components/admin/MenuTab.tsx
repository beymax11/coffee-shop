"use client";

import React from "react";
import { Search, Plus, Edit3, Trash2 } from "lucide-react";
import { MenuItem } from "@/types";

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
  // Filtered lists
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCat = menuCatFilter === "All" || item.category === menuCatFilter;
    return matchesSearch && matchesCat;
  });

  const categories = [
    "All",
    "Hot Coffee",
    "Cold Coffee",
    "Signature Drinks",
    "Non-Coffee",
    "Pastries",
    "Desserts",
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Filter Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#121212] p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          <input
            type="text"
            placeholder="Search coffee or pastries..."
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-4 type-caption text-[#F5F5F0] outline-none focus:border-brand-gold/60"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setMenuCatFilter(cat)}
              className={`rounded px-3 py-1.5 type-ui text-[10px] border transition-colors ${
                menuCatFilter === cat
                  ? "bg-brand-gold border-brand-gold text-black font-semibold"
                  : "bg-[#161616] border-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 rounded-full bg-brand-gold px-4 py-2 type-ui text-[10px] text-black hover:bg-brand-gold-hover transition-colors font-bold shadow shrink-0"
        >
          <Plus size={12} />
          Add Item
        </button>
      </div>

      {/* List Table */}
      <div className="rounded-xl border border-white/5 bg-[#121212] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5 bg-black/35 type-label text-[10px] text-zinc-400">
                <th className="p-4">Item Details</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Rating</th>
                <th className="p-4 text-center">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMenuItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-14 object-cover rounded border border-white/5 bg-zinc-900 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="type-body-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="type-caption text-zinc-500 truncate text-[11px] max-w-xs">{item.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="type-caption text-zinc-400">{item.category}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="type-body-sm font-semibold text-brand-gold">${item.price.toFixed(2)}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="type-caption text-white">⭐ {item.rating}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => onEditItem(item)}
                        className="p-2 rounded hover:bg-white/5 text-zinc-400 hover:text-brand-gold transition-colors"
                        title="Edit Item"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 rounded hover:bg-white/5 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMenuItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 italic type-body-sm">
                    No menu items found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
