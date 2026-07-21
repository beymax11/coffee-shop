"use client";

import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoyaltyMember } from "@/utils/db";

interface ManualIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFindMember: (member: LoyaltyMember) => void;
  loyaltyMembers: LoyaltyMember[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const ManualIdModal: React.FC<ManualIdModalProps> = ({
  isOpen,
  onClose,
  onFindMember,
  loyaltyMembers,
}) => {
  const [manualInputId, setManualInputId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVal = manualInputId.trim().toUpperCase();
    if (!cleanVal) {
      setErrorMsg("Please enter a Member ID.");
      return;
    }

    const normalizeId = (id: string) => {
      let clean = id.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (clean.startsWith("LN") || clean.startsWith("AG")) {
        clean = clean.substring(2);
      }
      return clean;
    };

    const normalizedInput = normalizeId(cleanVal);

    const member = loyaltyMembers.find((m) => {
      const normalizedMemberId = normalizeId(m.id);
      return (
        m.id.toUpperCase() === cleanVal ||
        normalizedMemberId === normalizedInput
      );
    });

    if (member) {
      onFindMember(member);
      setManualInputId("");
      setErrorMsg(null);
    } else {
      setErrorMsg("Member not found. Please scan again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="enter-id-modal-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-card-border bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/10 blur-[35px] rounded-full pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors p-1.5 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 rounded-xl bg-[#2E5A44]/10 text-brand-green">
                <Plus size={18} />
              </div>
              <div>
                <h3 className="type-h3 text-foreground font-serif font-bold text-base">Enter Member ID</h3>
                <p className="type-caption text-[10px] text-neutral-500 dark:text-zinc-400">Type customer card serial number</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold uppercase">
                  Member ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="AG-XXX-XXX"
                  value={manualInputId}
                  onChange={(e) => {
                    setManualInputId(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 font-mono text-xs uppercase"
                />
              </div>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 mt-2 bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg"
                >
                  <X size={14} className="stroke-[3] bg-red-500/20 rounded-full p-0.5 text-red-500" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-[#2E5A44] py-3.5 type-ui text-xs text-white hover:bg-[#234533] transition-all duration-300 font-bold shadow-lg shadow-[#2E5A44]/15 cursor-pointer font-semibold"
              >
                Find Member
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
