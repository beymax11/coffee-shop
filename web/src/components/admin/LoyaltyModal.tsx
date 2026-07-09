"use client";

import React from "react";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  loyaltyForm: {
    name: string;
    email: string;
    stamps: number;
  };
  setLoyaltyForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      stamps: number;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  isOpen,
  onClose,
  loyaltyForm,
  setLoyaltyForm,
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
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-card-border bg-card p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden max-h-[92dvh] overflow-y-auto"
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
                Register Member Loyalty Card
              </h3>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">CUSTOMER NAME</label>
                <input
                  type="text"
                  required
                  placeholder="Alexander Mercer"
                  value={loyaltyForm.name}
                  onChange={(e) => setLoyaltyForm({ ...loyaltyForm, name: e.target.value })}
                  className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  placeholder="alexander@mercer.com"
                  value={loyaltyForm.email}
                  onChange={(e) => setLoyaltyForm({ ...loyaltyForm, email: e.target.value })}
                  className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-brand-green py-3.5 type-ui text-xs text-white hover:bg-brand-green-hover transition-all duration-300 font-bold shadow-lg shadow-brand-green/15 mt-2 cursor-pointer green-glow hover:shadow-brand-green-hover/20"
              >
                Register Card
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
