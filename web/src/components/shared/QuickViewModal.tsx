"use client";

import React from "react";
import { MenuItem } from "@/types";
import { X, Star, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!item) return null;

  const imageSrc = item.image;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-card-border dark:border-white/10 bg-card dark:bg-[#121212] text-foreground dark:text-[#F5F5F0] shadow-2xl glassmorphism-green"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 rounded-full border border-card-border dark:border-white/10 bg-background/50 dark:bg-black/40 p-2 text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-all hover:bg-background/80 dark:hover:bg-black/60"
              aria-label="Close details"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Column: Image Area */}
              <div className="relative h-72 w-full md:h-full min-h-[350px]">
                <img
                  src={imageSrc}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card dark:from-[#121212] via-transparent to-transparent md:bg-gradient-to-r" />
                
                {/* Floating Tags */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {item.tags?.map((tag) => (
                    <span key={tag} className="rounded bg-[#2E5A44] px-2 py-0.5 type-ui text-white">
                      {tag}
                    </span>
                  ))}
                  <span className="rounded bg-background dark:bg-[#1c1c1c] border border-card-border dark:border-white/10 px-2 py-0.5 type-eyebrow text-zinc-700 dark:text-zinc-300">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Right Column: Information Area */}
              <div className="flex flex-col justify-between p-8 md:p-10">
                <div>
                  <h2 className="type-h2 text-foreground dark:text-white">
                    {item.name}
                  </h2>

                  {/* Rating & Price */}
                  <div className="mt-4 flex items-center justify-between border-b border-card-border dark:border-white/5 pb-4">
                    <span className="type-h3 text-emerald-600 dark:text-emerald-400 font-serif">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-emerald-500 text-emerald-500" />
                      <span className="type-body-sm font-semibold">{item.rating}</span>
                      <span className="type-caption text-zinc-500">/ 5.0</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-4 type-body-sm text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>

                  {/* Barista Notes */}
                  {item.notes && (
                    <div className="mt-6 rounded-lg bg-background-alt/50 dark:bg-white/5 p-3 border border-card-border dark:border-white/5 flex items-start gap-2">
                      <Coffee size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      <div className="type-body-sm text-zinc-600 dark:text-zinc-400">
                        <strong className="text-emerald-600 dark:text-emerald-400 block font-semibold mb-0.5">Barista Note</strong>
                        {item.notes}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-end border-t border-card-border dark:border-white/5 pt-6">
                  <button
                    onClick={onClose}
                    className="rounded-full border border-[#2E5A44]/30 bg-[#2E5A44]/5 px-6 py-2.5 type-ui text-emerald-600 dark:text-emerald-400 transition-all hover:bg-[#2E5A44] hover:text-white active:scale-95 shadow-md"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
