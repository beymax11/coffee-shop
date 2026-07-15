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
              <div className="h-72 w-full md:h-full min-h-[350px]">
                <img
                  src={imageSrc}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Right Column: Information Area */}
              <div className="flex flex-col justify-between p-8 md:p-10">
                <div>
                  {/* Category & Tags Row */}
                  <div className="flex flex-wrap gap-2 mb-3 items-center">
                    <span className="text-[10px] font-sans font-extrabold tracking-widest text-[#2E5A44] dark:text-emerald-450 uppercase">
                      {item.category}
                    </span>
                    {item.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] font-sans font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-2xl font-sans font-black tracking-tight text-foreground dark:text-white uppercase">
                    {item.name}
                  </h2>

                  {/* Rating & Price */}
                  <div className="mt-4 flex items-center justify-between border-b border-card-border dark:border-white/5 pb-4">
                    <span className="text-lg font-sans font-extrabold text-[#2E5A44] dark:text-emerald-400">
                      ₱{item.price.toFixed(2)}
                    </span>
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
