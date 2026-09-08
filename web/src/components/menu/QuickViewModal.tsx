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
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!item) return null;

  const hasVariants = item.hot != null || item.modest != null || item.grand != null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg md:max-w-3xl max-h-[92vh] overflow-hidden rounded-3xl border border-card-border/80 dark:border-white/10 bg-card dark:bg-[#121413] text-foreground dark:text-zinc-100 shadow-2xl glassmorphism-green flex flex-col md:grid md:grid-cols-12 z-10"
          >
            {/* Top Right Floating Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 z-30 rounded-full border border-white/20 dark:border-white/10 bg-black/50 dark:bg-black/60 p-2 text-white/90 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md shadow-md active:scale-90 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Left Column (Desktop) / Top Area (Mobile): Image Showcase */}
            <div className="md:col-span-5 relative w-full h-56 sm:h-72 md:h-full min-h-[220px] md:min-h-[440px] shrink-0 overflow-hidden bg-zinc-900">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/30 pointer-events-none" />

              {/* Mobile Category Badge Over Image */}
              <div className="absolute bottom-3 left-3 md:hidden">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-sans font-extrabold tracking-widest text-emerald-400 uppercase border border-white/15">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Right Column: Details & Pricing */}
            <div className="md:col-span-7 flex flex-col justify-between p-5 sm:p-7 md:p-8 overflow-y-auto max-h-[55vh] md:max-h-[92vh]">
              <div className="space-y-4">
                {/* Category & Tags Header (Desktop) */}
                <div className="hidden md:flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-[#2E5A44] dark:text-emerald-400 uppercase">
                    {item.category}
                  </span>
                  {item.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-sans font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-foreground dark:text-white uppercase leading-tight">
                    {item.name}
                  </h2>
                  {/* Mobile Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex md:hidden flex-wrap gap-1.5 mt-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] font-sans font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Display */}
                <div className="rounded-2xl bg-neutral-100/70 dark:bg-white/[0.04] border border-card-border/60 dark:border-white/[0.08] p-3.5 sm:p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-neutral-500 dark:text-zinc-400 uppercase">
                      Pricing
                    </span>
                    {item.price != null && hasVariants && (
                      <span className="text-xs text-neutral-400 dark:text-zinc-500">
                        Base: ₱{Number(item.price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* If item has size variants (Hot, Modest, Grand) */}
                  {hasVariants ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {item.hot != null && (
                        <div className="rounded-xl border border-card-border/70 dark:border-white/[0.08] bg-background/70 dark:bg-black/30 p-2.5 flex flex-col items-center text-center transition-all hover:border-emerald-500/30">
                          <span className="text-[9px] font-bold tracking-wider text-neutral-500 dark:text-zinc-400 uppercase">
                            Hot
                          </span>
                          <span className="text-sm font-extrabold text-foreground dark:text-white mt-1">
                            ₱{Number(item.hot).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {item.modest != null && (
                        <div className="rounded-xl border border-card-border/70 dark:border-white/[0.08] bg-background/70 dark:bg-black/30 p-2.5 flex flex-col items-center text-center transition-all hover:border-emerald-500/30">
                          <span className="text-[9px] font-bold tracking-wider text-neutral-500 dark:text-zinc-400 uppercase">
                            Modest
                          </span>
                          <span className="text-sm font-extrabold text-foreground dark:text-white mt-1">
                            ₱{Number(item.modest).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {item.grand != null && (
                        <div className="rounded-xl border border-card-border/70 dark:border-white/[0.08] bg-background/70 dark:bg-black/30 p-2.5 flex flex-col items-center text-center transition-all hover:border-emerald-500/30">
                          <span className="text-[9px] font-bold tracking-wider text-neutral-500 dark:text-zinc-400 uppercase">
                            Grand
                          </span>
                          <span className="text-sm font-extrabold text-foreground dark:text-white mt-1">
                            ₱{Number(item.grand).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Lone Price */
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-sans font-black text-[#2E5A44] dark:text-emerald-400">
                        {item.price != null ? `₱${Number(item.price).toFixed(2)}` : "—"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {item.description && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-zinc-500 uppercase">
                      About this brew
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Barista Notes */}
                {item.notes && (
                  <div className="rounded-xl bg-[#2E5A44]/[0.06] dark:bg-emerald-500/[0.08] p-3.5 border border-[#2E5A44]/20 dark:border-emerald-500/20 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-[#2E5A44]/10 dark:bg-emerald-500/20 text-[#2E5A44] dark:text-emerald-400 shrink-0 mt-0.5">
                      <Coffee size={15} />
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      <strong className="text-[#2E5A44] dark:text-emerald-400 block font-bold mb-0.5 text-[10px] uppercase tracking-wider">
                        Barista Recommendation
                      </strong>
                      {item.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
