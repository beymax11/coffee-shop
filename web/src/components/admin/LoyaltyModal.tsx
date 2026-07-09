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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="w-full max-w-md rounded-2xl border border-brand-gold/15 bg-gradient-to-b from-[#121212] to-[#0A0A0A] p-8 glassmorphism shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Ambient Gold Glow inside modal */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 blur-[25px] rounded-full pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors duration-300 p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-brand-gold animate-pulse" />
              <h3 className="type-h3 text-white font-serif font-bold tracking-tight">
                Register Member Loyalty Card
              </h3>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-zinc-400 font-bold">CUSTOMER NAME</label>
                <input
                  type="text"
                  required
                  placeholder="Alexander Mercer"
                  value={loyaltyForm.name}
                  onChange={(e) => setLoyaltyForm({ ...loyaltyForm, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#161616]/60 py-3 px-4 type-field text-white outline-none transition-all duration-300 focus:border-brand-gold/60 focus:bg-[#161616] focus:ring-1 focus:ring-brand-gold/20 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-zinc-400 font-bold">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  placeholder="alexander@mercer.com"
                  value={loyaltyForm.email}
                  onChange={(e) => setLoyaltyForm({ ...loyaltyForm, email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#161616]/60 py-3 px-4 type-field text-white outline-none transition-all duration-300 focus:border-brand-gold/60 focus:bg-[#161616] focus:ring-1 focus:ring-brand-gold/20 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-zinc-400 font-bold">INITIAL STAMPS (0 - 9)</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  required
                  placeholder="0"
                  value={loyaltyForm.stamps}
                  onChange={(e) => setLoyaltyForm({ ...loyaltyForm, stamps: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-[#161616]/60 py-3 px-4 type-field text-white outline-none transition-all duration-300 focus:border-brand-gold/60 focus:bg-[#161616] focus:ring-1 focus:ring-brand-gold/20 font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-brand-gold py-3.5 type-ui text-xs text-black hover:bg-brand-gold-hover transition-all duration-300 font-bold shadow-lg shadow-brand-gold/15 mt-2 cursor-pointer gold-glow hover:shadow-brand-gold-hover/20"
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
