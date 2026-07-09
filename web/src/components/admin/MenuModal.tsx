"use client";

import React from "react";
import { X, Sparkles } from "lucide-react";
import { MenuItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

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

const EASE = [0.16, 1, 0.3, 1] as const;

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  editingMenuItem,
  menuForm,
  setMenuForm,
  onSubmit,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-card-border bg-card p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden max-h-[92dvh] overflow-y-auto"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            {/* Ambient Green Glow inside modal */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 blur-[25px] rounded-full pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors duration-300 p-1.5 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-brand-green animate-pulse" />
              <h3 className="type-h3 text-foreground font-serif font-bold tracking-tight">
                {editingMenuItem ? "Edit Menu Creation" : "Add Menu Creation"}
              </h3>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">CREATION NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saffron Gold Brew"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">PRICE ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="8.50"
                    value={menuForm.price || ""}
                    onChange={(e) => setMenuForm({ ...menuForm, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">CATEGORY</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, category: e.target.value as MenuItem["category"] })
                    }
                    className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs cursor-pointer"
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
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">DESCRIPTION</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Infused with premium cardamom, hints of raw honey, and gold flakes..."
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 resize-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">IMAGE URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={menuForm.image}
                  onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                  className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">TAGS (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Signature, Award Winner, Seasonal"
                  value={menuForm.tags}
                  onChange={(e) => setMenuForm({ ...menuForm, tags: e.target.value })}
                  className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">BARISTA NOTE (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Best paired with our Pistachio Tartlet"
                  value={menuForm.notes}
                  onChange={(e) => setMenuForm({ ...menuForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-brand-green py-3.5 type-ui text-xs text-white hover:bg-brand-green-hover transition-all duration-300 font-bold shadow-lg shadow-brand-green/15 mt-2 cursor-pointer green-glow hover:shadow-brand-green-hover/20"
              >
                {editingMenuItem ? "Apply Showcase Changes" : "Create Menu Offering"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
