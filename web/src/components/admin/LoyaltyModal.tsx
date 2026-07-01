"use client";

import React from "react";
import { X } from "lucide-react";

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

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  isOpen,
  onClose,
  loyaltyForm,
  setLoyaltyForm,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] p-8 glassmorphism shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="type-h3 text-white font-serif font-bold mb-6">
          Register Member Loyalty Card
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="type-label block text-[10px] text-zinc-400">Customer Name</label>
            <input
              type="text"
              required
              placeholder="Alexander Mercer"
              value={loyaltyForm.name}
              onChange={(e) => setLoyaltyForm({ ...loyaltyForm, name: e.target.value })}
              className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="type-label block text-[10px] text-zinc-400">Email Address</label>
            <input
              type="email"
              required
              placeholder="alexander@mercer.com"
              value={loyaltyForm.email}
              onChange={(e) => setLoyaltyForm({ ...loyaltyForm, email: e.target.value })}
              className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="type-label block text-[10px] text-zinc-400">Initial Stamps (0 - 9)</label>
            <input
              type="number"
              min="0"
              max="9"
              required
              placeholder="0"
              value={loyaltyForm.stamps}
              onChange={(e) => setLoyaltyForm({ ...loyaltyForm, stamps: Number(e.target.value) })}
              className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 font-mono text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-brand-gold py-3.5 type-ui text-black hover:bg-brand-gold-hover transition-colors font-bold shadow-md gold-glow mt-2"
          >
            Register Card
          </button>
        </form>
      </div>
    </div>
  );
};
