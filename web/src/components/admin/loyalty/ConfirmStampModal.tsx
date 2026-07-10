"use client";

import React from "react";
import { X, Check, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoyaltyMember } from "@/utils/db";

interface ConfirmStampModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember: LoyaltyMember | null;
  onAwardStamp: (member: LoyaltyMember) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const ConfirmStampModal: React.FC<ConfirmStampModalProps> = ({
  isOpen,
  onClose,
  selectedMember,
  onAwardStamp,
}) => {
  if (!selectedMember) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="confirm-modal-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
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
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-card-border bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-[40px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-xl bg-brand-green/10 text-brand-green">
                <ShieldCheck size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="type-h3 text-foreground font-serif font-bold text-base">Confirm Stamp Award</h3>
                <p className="type-caption text-[10px] text-neutral-500 dark:text-zinc-400">Review member details before issuing stamp</p>
              </div>
            </div>

            {/* Premium Mini loyalty card design preview */}
            <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-[#ECF7F2]/80 to-[#D8ECE1]/20 dark:from-[#07130E]/90 dark:to-[#0F261B]/60 p-5 shadow-inner mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-0.5">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-[#2E5A44] dark:text-emerald-400 font-bold font-sans">Antonioni Grounds Reserve</span>
                  <h4 className="type-body text-sm font-bold text-foreground tracking-wide font-serif mt-0.5">{selectedMember.name}</h4>
                  <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[9px] tracking-wider block">ID: {selectedMember.id}</span>
                </div>

                {/* Miniature progress pill */}
                <span className="bg-[#2E5A44]/10 dark:bg-emerald-500/10 text-brand-green dark:text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border border-brand-green/20">
                  {selectedMember.stamps} / 9
                </span>
              </div>

              {/* Stamp visual slot preview grid */}
              <div className="grid grid-cols-9 gap-1 sm:gap-1.5 pt-2 border-t border-card-border/40">
                {Array.from({ length: 9 }).map((_, idx) => {
                  const isStamped = idx < selectedMember.stamps;
                  const isNextToStamp = idx === selectedMember.stamps;

                  return (
                    <div
                      key={idx}
                      className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full border flex items-center justify-center text-[8px] transition-all duration-300 ${isStamped
                          ? "bg-brand-green/20 border-brand-green text-brand-green font-bold scale-105 shadow-sm shadow-brand-green/10"
                          : isNextToStamp
                            ? "bg-brand-green border-brand-green text-white font-extrabold animate-pulse scale-110 shadow-md shadow-brand-green/30"
                            : "border-card-border bg-background/50 text-neutral-400 dark:text-zinc-600 dark:bg-black/40 font-semibold"
                        }`}
                      title={isNextToStamp ? "Next stamp to be added" : ""}
                    >
                      {isStamped ? (
                        <Check size={9} className="stroke-[3]" />
                      ) : isNextToStamp ? (
                        "+1"
                      ) : (
                        idx + 1
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Summary and Details */}
            <div className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Stamps Progress</span>
                  <span className="text-foreground font-bold font-mono">
                    {selectedMember.stamps} stamps &rarr; <span className="text-brand-green dark:text-emerald-400 font-extrabold">{selectedMember.stamps + 1} stamps</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-foreground/[0.05] rounded-full overflow-hidden border border-card-border/30">
                  <div
                    className="h-full bg-gradient-to-r from-brand-green to-emerald-500 transition-all duration-500"
                    style={{ width: `${((selectedMember.stamps + 1) / 9) * 100}%` }}
                  />
                </div>
                {selectedMember.stamps + 1 === 9 && (
                  <p className="text-[10px] text-brand-green dark:text-emerald-400 font-bold flex items-center gap-1 animate-pulse pt-1">
                    <Zap size={11} /> This stamp will unlock a complimentary drink reward!
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
              <button
                onClick={onClose}
                className="w-full sm:flex-1 rounded-full border border-card-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-neutral-500 dark:text-zinc-300 hover:text-white py-3 text-xs font-bold transition-all cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onAwardStamp(selectedMember);
                  onClose();
                }}
                disabled={selectedMember.stamps >= 9}
                className="w-full sm:flex-1 rounded-full bg-brand-green py-3 text-xs text-white hover:bg-brand-green-hover transition-all duration-300 font-bold disabled:opacity-40 disabled:pointer-events-none cursor-pointer green-glow shadow-md shadow-brand-green/20 min-h-[44px]"
              >
                {selectedMember.stamps >= 9 ? "Card Full (9/9)" : "Award 1 Stamp"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
