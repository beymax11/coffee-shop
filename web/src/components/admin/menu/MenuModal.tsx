"use client";

import React from "react";
import { X, Sparkles, UploadCloud, Trash2, Image as ImageIcon } from "lucide-react";
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
  const [customCategory, setCustomCategory] = React.useState("");
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">COFFEE NAME</label>
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
                  <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">PRICE (₱ PHP)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="250.00"
                    value={menuForm.price || ""}
                    onChange={(e) => setMenuForm({ ...menuForm, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs"
                  />
                </div>                <div className={`space-y-1.5 ${isAddingNew ? "col-span-full" : ""}`}>
                  {isAddingNew ? (
                    <>
                      <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">NEW CATEGORY NAME</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Seasonal Brews"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="flex-1 rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleSaveCategory}
                          className="px-4 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold transition-all duration-300 shadow-md shadow-brand-green/10 flex items-center justify-center cursor-pointer shrink-0"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelAddCategory}
                          className="px-4 py-2.5 rounded-xl bg-foreground/[0.05] border border-card-border hover:bg-foreground/[0.08] text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white text-xs font-bold transition-all duration-300 flex items-center justify-center cursor-pointer shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">CATEGORY</label>
                      <select
                        value={menuForm.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "new") {
                            setIsAddingNew(true);
                          } else {
                            setMenuForm((prev) => ({ ...prev, category: val }));
                          }
                        }}
                        className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="new">+ Add New Category</option>
                      </select>
                    </>
                  )}
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
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">IMAGE UPLOAD</label>
                {menuForm.image ? (
                  <div className="relative rounded-xl overflow-hidden border border-card-border group h-40 flex items-center justify-center bg-background/30">
                    <img
                      src={menuForm.image}
                      alt="Preview"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-1.5 text-xs text-white transition-all font-bold flex items-center gap-1.5 cursor-pointer border border-white/25"
                      >
                        <UploadCloud size={14} /> Replace
                      </button>
                       <button
                        type="button"
                        onClick={() => setMenuForm((prev) => ({ ...prev, image: "", imageFile: null }))}
                        className="rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md px-3.5 py-1.5 text-xs text-red-300 border border-red-500/30 transition-all font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full rounded-xl border-2 border-dashed py-8 px-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                      isDragActive
                        ? "border-brand-green bg-brand-green/5 scale-[0.99]"
                        : "border-card-border bg-background/30 hover:border-brand-green/50 hover:bg-background/50"
                    }`}
                  >
                    <UploadCloud
                      size={28}
                      className={`mb-3 transition-colors duration-300 ${
                        isDragActive ? "text-brand-green" : "text-neutral-500 dark:text-zinc-500"
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
                  className="hidden"
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
