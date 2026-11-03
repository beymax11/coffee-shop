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

  const isColdOrFrappe =
    item.category?.toLowerCase().includes("cold") ||
    item.category?.toLowerCase().includes("coffee-free") ||
    item.category?.toLowerCase().includes("frappe") ||
    item.category?.toLowerCase().includes("soda");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center p-0 md:p-6 lg:p-8 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-[100dvh] md:h-auto md:max-w-4xl md:max-h-[88vh] overflow-hidden rounded-none md:rounded-xl border-0 md:border border-card-border dark:border-white/10 bg-card dark:bg-[#121413] text-foreground dark:text-zinc-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col md:grid md:grid-cols-12 z-10"
          >
            {/* Top Right Floating Close Button */}
            <button
              onClick={onClose}
              className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-30 rounded-full border border-card-border/60 dark:border-white/20 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 p-2.5 md:p-2 text-foreground dark:text-white transition-all backdrop-blur-md shadow-md active:scale-90 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Left Column (Desktop) / Top Area 60% (Mobile): Image Showcase (Fitted to Box) */}
            <div className="md:col-span-5 relative w-full h-[60dvh] md:h-full min-h-[260px] md:min-h-[460px] shrink-0 overflow-hidden bg-background-alt/40 dark:bg-zinc-950">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
              />

              {/* Cinematic Vignettes */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none md:bg-gradient-to-r md:from-transparent md:to-black/30 z-10" />

              {/* Lens Shutter Focus Marks (Artisan Touch) */}
              <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-white/60 dark:border-white/40 pointer-events-none z-20" />
              <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-white/60 dark:border-white/40 pointer-events-none md:block hidden z-20" />
              <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-white/60 dark:border-white/40 pointer-events-none z-20" />
              <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-white/60 dark:border-white/40 pointer-events-none z-20" />
            </div>

            {/* Right Column (Desktop) / Bottom Area 40% (Mobile): Details & Pricing */}
            <div className="md:col-span-7 flex flex-col justify-between overflow-y-auto h-[40dvh] md:h-auto md:max-h-[88vh] bg-card dark:bg-[#121413]">
              <div className="p-4 sm:p-6 md:p-8 space-y-3.5">
                {/* Title & Tags Block (Title on left, Tags on right) */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {/* Category Label */}
                    <span className="text-[10px] font-sans font-bold tracking-[0.22em] text-[#2E5A44] dark:text-emerald-400 uppercase block mb-1">
                      {item.category}
                    </span>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold tracking-tight text-foreground dark:text-white leading-tight">
                      {item.name}
                    </h2>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end shrink-0 pt-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] sm:text-[9px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[#2E5A44] dark:text-emerald-400 shrink-0"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Display */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-neutral-500 dark:text-zinc-400 uppercase">
                      {hasVariants ? "Pricing & Sizes" : "Price"}
                    </span>
                    {item.price != null && hasVariants && (
                      <span className="text-xs text-neutral-500 dark:text-zinc-400 font-sans">
                        Base: <strong className="text-foreground dark:text-white">₱{Number(item.price).toFixed(2)}</strong>
                      </span>
                    )}
                  </div>

                  {/* Size Variants (Hot/Mini, Modest, Grand in 1 row) */}
                  {hasVariants ? (
                    <div className="grid grid-flow-col auto-cols-fr gap-2 sm:gap-2.5">
                      {item.hot != null && (
                        <div className="group relative rounded-lg border border-emerald-500/30 bg-emerald-500/[0.05] p-2.5 sm:p-3 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/[0.08]">
                          <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-[0.14em] text-[#2E5A44] dark:text-emerald-400 uppercase">
                            {isColdOrFrappe ? "Mini" : "Hot"}
                          </span>
                          <span className="text-sm sm:text-base lg:text-lg font-sans font-extrabold text-[#2E5A44] dark:text-emerald-400 mt-0.5 sm:mt-1 whitespace-nowrap">
                            ₱{Number(item.hot).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {item.modest != null && (
                        <div className="group relative rounded-lg border border-card-border dark:border-white/10 bg-background-alt/30 dark:bg-white/[0.03] p-2.5 sm:p-3 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-foreground/20 dark:hover:border-white/30 hover:bg-background-alt/60 dark:hover:bg-white/[0.06]">
                          <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-[0.14em] text-neutral-500 dark:text-zinc-400 uppercase">
                            Modest
                          </span>
                          <span className="text-sm sm:text-base lg:text-lg font-sans font-extrabold text-foreground dark:text-white mt-0.5 sm:mt-1 whitespace-nowrap">
                            ₱{Number(item.modest).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {item.grand != null && (
                        <div className="group relative rounded-lg border border-card-border dark:border-white/10 bg-background-alt/30 dark:bg-white/[0.03] p-2.5 sm:p-3 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-foreground/20 dark:hover:border-white/30 hover:bg-background-alt/60 dark:hover:bg-white/[0.06]">
                          <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-[0.14em] text-neutral-500 dark:text-zinc-400 uppercase">
                            Grand
                          </span>
                          <span className="text-sm sm:text-base lg:text-lg font-sans font-extrabold text-foreground dark:text-white mt-0.5 sm:mt-1 whitespace-nowrap">
                            ₱{Number(item.grand).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Lone Price */
                    <div className="rounded-lg border border-card-border dark:border-white/10 bg-background-alt/30 dark:bg-white/[0.03] p-3 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-sans font-black text-foreground dark:text-white">
                        {item.price != null ? `₱${Number(item.price).toFixed(2)}` : "—"}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-zinc-400">Regular serving</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {item.description && (
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-neutral-500 dark:text-zinc-400 uppercase">
                      About this brew
                    </span>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-zinc-300 leading-relaxed font-sans font-normal">
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Barista Recommendation */}
                {item.notes && (
                  <div className="rounded-lg bg-[#2E5A44]/[0.06] dark:bg-emerald-500/[0.08] p-3.5 border border-[#2E5A44]/20 dark:border-emerald-500/20 relative overflow-hidden">
                    <div className="flex items-start gap-2.5 relative z-10">
                      <div className="w-7 h-7 rounded-lg bg-[#2E5A44] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#2E5A44]/25 mt-0.5">
                        <Coffee size={14} />
                      </div>
                      <div className="space-y-0.5">
                        <strong className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#2E5A44] dark:text-emerald-400 block">
                          Barista Recommendation
                        </strong>
                        <p className="text-xs text-neutral-700 dark:text-zinc-300 leading-relaxed italic">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action on Mobile */}
              <div className="sticky bottom-0 left-0 right-0 p-3 bg-card/95 dark:bg-[#121413]/95 backdrop-blur-xl border-t border-card-border dark:border-white/10 md:hidden mt-auto pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-sans font-bold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-[#2E5A44]/25 active:scale-[0.98] cursor-pointer"
                >
                  <span>Close Details</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
