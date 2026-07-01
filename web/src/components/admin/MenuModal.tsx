"use client";

import React from "react";
import { X } from "lucide-react";
import { MenuItem } from "@/types";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMenuItem: MenuItem | null;
  menuForm: {
    name: string;
    description: string;
    price: number;
    category: MenuItem["category"];
    image: string;
    tags: string;
    notes: string;
  };
  setMenuForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      price: number;
      category: MenuItem["category"];
      image: string;
      tags: string;
      notes: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  editingMenuItem,
  menuForm,
  setMenuForm,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121212] p-8 glassmorphism shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="type-h3 text-white font-serif font-bold mb-6">
          {editingMenuItem ? "Edit Menu Creation" : "Add Menu Creation"}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="type-label block text-[10px] text-zinc-400">Creation Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Gold Leaf Latte"
              value={menuForm.name}
              onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
              className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="type-label block text-[10px] text-zinc-400">Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="8.50"
                value={menuForm.price || ""}
                onChange={(e) => setMenuForm({ ...menuForm, price: Number(e.target.value) })}
                className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="type-label block text-[10px] text-zinc-400">Category</label>
              <select
                value={menuForm.category}
                onChange={(e) =>
                  setMenuForm({ ...menuForm, category: e.target.value as MenuItem["category"] })
                }
                className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 text-xs text-zinc-400"
              >
                <option value="Hot Coffee">Hot Coffee</option>
                <option value="Cold Coffee">Cold Coffee</option>
                <option value="Signature Drinks">Signature Drinks</option>
                <option value="Non-Coffee">Non-Coffee</option>
                <option value="Pastries">Pastries</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="type-label block text-[10px] text-zinc-400">Description</label>
            <textarea
              rows={2}
              required
              placeholder="Elegant notes of saffron and caramel..."
              value={menuForm.description}
              onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
              className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 resize-none text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="type-label block text-[10px] text-zinc-400">Image URL</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={menuForm.image}
              onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
              className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="type-label block text-[10px] text-zinc-400">Tags (Comma-separated)</label>
            <input
              type="text"
              placeholder="Signature, Award Winner, New"
              value={menuForm.tags}
              onChange={(e) => setMenuForm({ ...menuForm, tags: e.target.value })}
              className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="type-label block text-[10px] text-zinc-400">Barista Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Best paired with our Madagascar Croissant"
              value={menuForm.notes}
              onChange={(e) => setMenuForm({ ...menuForm, notes: e.target.value })}
              className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-brand-gold py-3.5 type-ui text-black hover:bg-brand-gold-hover transition-colors font-bold shadow-md gold-glow mt-2"
          >
            {editingMenuItem ? "Apply Changes" : "Create Menu Offering"}
          </button>
        </form>
      </div>
    </div>
  );
};
