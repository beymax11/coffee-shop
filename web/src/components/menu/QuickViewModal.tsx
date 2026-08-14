"use client";

import React, { useEffect } from "react";
import { MenuItem } from "@/types";
import { X, Coffee } from "lucide-react";
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
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!item) return null;

  const imageSrc = item.image;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center p-0 md:p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container: Fullscreen 50/50 on mobile, 50/50 Centered Card on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-3xl overflow-hidden rounded-none md:rounded-2xl border-0 md:border border-card-border dark:border-white/10 bg-card dark:bg-[#121212] text-foreground dark:text-[#F5F5F0] shadow-2xl glassmorphism-green flex flex-col md:grid md:grid-cols-2"
          >
            {/* Close Button (Floating on top right) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 rounded-full border border-white/20 dark:border-white/15 bg-black/60 md:bg-background/60 dark:bg-black/50 p-2.5 md:p-2 text-white md:text-zinc-500 md:dark:text-zinc-400 hover:text-white md:hover:text-foreground dark:hover:text-white transition-all hover:bg-black/80 md:hover:bg-background/90 dark:hover:bg-black/80 backdrop-blur-md shadow-lg active:scale-95 cursor-pointer"
              aria-label="Close details"
            >
              <X size={18} />
            </button>

            {/* Top 50% on Mobile / Left 50% on Desktop: Image Area (Fitted Width) */}
            <div className="relative w-full h-[50dvh] md:h-full md:min-h-[420px] shrink-0 overflow-hidden bg-zinc-900 dark:bg-zinc-950">
              <img
                src={imageSrc}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom 50% on Mobile / Right 50% on Desktop: Details Area */}
            <div className="w-full h-[50dvh] md:h-full flex flex-col justify-between p-6 sm:p-8 md:p-10 overflow-y-auto">
              <div className="space-y-3">
                {/* Category & Tags Row */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] sm:text-xs font-sans font-extrabold tracking-widest text-[#2E5A44] dark:text-emerald-450 uppercase">
                    {item.category}
                  </span>
                  {item.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] sm:text-[9px] font-sans font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-black tracking-tight text-foreground dark:text-white uppercase leading-tight">
                  {item.name}
                </h2>

                {/* Price */}
                <div className="flex items-center justify-between border-b border-card-border dark:border-white/10 pb-3">
                  <span className="text-lg sm:text-xl md:text-2xl font-sans font-extrabold text-[#2E5A44] dark:text-emerald-400">
                    ₱{item.price.toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <p className="type-body text-zinc-600 dark:text-zinc-300 leading-relaxed text-xs sm:text-sm">
                  {item.description}
                </p>

                {/* Barista Notes */}
                {item.notes && (
                  <div className="mt-4 rounded-xl bg-background-alt/60 dark:bg-white/5 p-3.5 border border-card-border dark:border-white/5 flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Coffee size={15} />
                    </div>
                    <div className="type-body-sm text-zinc-600 dark:text-zinc-300 text-xs">
                      <strong className="text-emerald-600 dark:text-emerald-400 block font-bold mb-0.5 text-[10px] uppercase tracking-wider">
                        Barista Note
                      </strong>
                      {item.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Action */}
              <div className="mt-6 pt-4 border-t border-card-border dark:border-white/10 flex items-center justify-end pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0 shrink-0">
                <button
                  onClick={onClose}
                  className="w-full md:w-auto text-center justify-center rounded-full border border-[#2E5A44]/30 bg-[#2E5A44]/10 dark:bg-[#2E5A44]/20 px-8 py-3 md:py-2.5 type-ui text-emerald-700 dark:text-emerald-300 font-bold transition-all hover:bg-[#2E5A44] hover:text-white active:scale-95 shadow-md cursor-pointer text-xs"
                >
                  Close Details
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
