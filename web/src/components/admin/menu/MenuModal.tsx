"use client";

import React from "react";
import { X, Sparkles, UploadCloud, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
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
    category: string;
    image: string;
    tags: string;
    imageFile?: File | null;
  };
  setMenuForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      price: number;
      category: string;
      image: string;
      tags: string;
      imageFile?: File | null;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  isLoading?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  editingMenuItem,
  menuForm,
  setMenuForm,
  onSubmit,
  isLoading: externalIsLoading,
}) => {
  const [customCategory, setCustomCategory] = React.useState("");
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const loading = externalIsLoading || isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    try {
      setIsSubmitting(true);
      await onSubmit(e);
    } catch (err) {
      console.error("MenuModal submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultCategories = React.useMemo(() => [
    "Hot Coffee",
    "Cold Coffee",
    "Signature Drinks",
    "Non-Coffee",
    "Pastries",
    "Desserts",
  ], []);

  const [categories, setCategories] = React.useState<string[]>(defaultCategories);

  React.useEffect(() => {
    if (isOpen) {
      const initialCats = [...defaultCategories];
      const currentCat = menuForm.category;
      if (currentCat && !initialCats.includes(currentCat)) {
        initialCats.push(currentCat);
      }
      setCategories(initialCats);
      setIsAddingNew(false);
      setCustomCategory("");
    }
  }, [isOpen, menuForm.category, defaultCategories]);

  const handleSaveCategory = () => {
    const trimmed = customCategory.trim();
    if (!trimmed) {
      alert("Please enter a category name.");
      return;
    }

    if (!categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed]);
    }

    setMenuForm(prev => ({ ...prev, category: trimmed }));
    setIsAddingNew(false);
    setCustomCategory("");
  };

  const handleCancelAddCategory = () => {
    setIsAddingNew(false);
    setCustomCategory("");
    if (!menuForm.category) {
      setMenuForm(prev => ({ ...prev, category: categories[0] || "Hot Coffee" }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setMenuForm((prev) => ({
          ...prev,
          image: e.target!.result as string,
          imageFile: file
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
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
              disabled={loading}
              className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors duration-300 p-1.5 rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-6">

              <h3 className="type-h3 text-foreground font-serif font-bold tracking-tight">
                {editingMenuItem ? "Edit Menu Creation" : "Add Menu Creation"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">COFFEE NAME</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  placeholder="e.g. Spanish Latté"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">PRICE (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    disabled={loading}
                    placeholder="180.00"
                    value={menuForm.price || ""}
                    onChange={(e) => setMenuForm({ ...menuForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">CATEGORY</label>

                  {!isAddingNew ? (
                    <div className="flex gap-2">
                      <select
                        value={menuForm.category}
                        disabled={loading}
                        onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                        className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-3 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs disabled:opacity-50 cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat} className="bg-card text-foreground">
                            {cat}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setIsAddingNew(true)}
                        className="rounded-xl border border-card-border bg-background/50 px-3 py-3 text-neutral-500 hover:text-brand-green hover:border-brand-green/50 transition-all duration-300 shrink-0 cursor-pointer disabled:opacity-40"
                        title="Add custom category"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        disabled={loading}
                        placeholder="New category..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full rounded-xl border border-brand-green/60 bg-background/50 py-3 px-3 type-field text-foreground outline-none text-xs"
                      />
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleSaveCategory}
                        className="rounded-xl bg-brand-green text-white px-2.5 py-3 text-[10px] font-bold shrink-0 hover:bg-brand-green-hover transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleCancelAddCategory}
                        className="rounded-xl border border-card-border bg-background/50 text-neutral-500 px-2 py-3 text-xs shrink-0 hover:text-foreground transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">DESCRIPTION</label>
                <textarea
                  rows={2}
                  required
                  disabled={loading}
                  placeholder="Rich dark espresso layered with velvety microfoam..."
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs resize-none disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">MENU ITEM IMAGE</label>
                {menuForm.image ? (
                  <div className="relative rounded-xl overflow-hidden border border-card-border h-32 group bg-neutral-900/50">
                    <img src={menuForm.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <ImageIcon size={12} /> Change
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setMenuForm((prev) => ({ ...prev, image: "", imageFile: null }))}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !loading && fileInputRef.current?.click()}
                    className={`w-full rounded-xl border-2 border-dashed py-8 px-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${isDragActive
                      ? "border-brand-green bg-brand-green/5 scale-[0.99]"
                      : "border-card-border bg-background/30 hover:border-brand-green/50 hover:bg-background/50"
                      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <UploadCloud
                      size={28}
                      className={`mb-3 transition-colors duration-300 ${isDragActive ? "text-brand-green" : "text-neutral-500 dark:text-zinc-500"
                        }`}
                    />
                    <p className="type-ui text-xs font-bold text-foreground">
                      Drag & drop image here
                    </p>
                    <p className="text-[10px] text-neutral-500 dark:text-zinc-500 mt-1">
                      or click to browse from device (JPG, PNG, WEBP)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept="image/*"
                  disabled={loading}
                  className="hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">TAGS (Comma-separated)</label>
                <input
                  type="text"
                  disabled={loading}
                  placeholder="Signature, Award Winner, Seasonal"
                  value={menuForm.tags}
                  onChange={(e) => setMenuForm({ ...menuForm, tags: e.target.value })}
                  className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-full bg-brand-green py-3.5 type-ui text-xs text-white hover:bg-brand-green-hover transition-all duration-300 font-bold shadow-lg shadow-brand-green/15 mt-2 flex items-center justify-center gap-2 ${loading ? "opacity-75 cursor-not-allowed" : "cursor-pointer green-glow hover:shadow-brand-green-hover/20"
                  }`}
              >
                {loading && <Loader2 size={15} className="animate-spin shrink-0" />}
                <span>
                  {loading
                    ? editingMenuItem
                      ? "Saving Changes..."
                      : "Adding Menu..."
                    : editingMenuItem
                      ? "Apply Changes"
                      : "Add Menu"}
                </span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
