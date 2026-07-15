"use client";

import React, { useState } from "react";
import { X, Eye, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoyaltyMember } from "@/utils/db";
import { formatDisplayPhone } from "@/utils/phone";

interface LoyaltyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember: LoyaltyMember | null;
  onRevokeStamp: (member: LoyaltyMember) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const LoyaltyDetailsModal: React.FC<LoyaltyDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedMember,
  onRevokeStamp,
}) => {
  const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);

  if (!selectedMember) return null;

  return (
    <>
      {/* Member Details Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="details-modal-wrapper"
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
              className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-card-border bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden max-h-[92dvh] overflow-y-auto"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-[40px] rounded-full pointer-events-none" />

              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-all p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 rounded-xl bg-brand-green/10 text-brand-green">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-base">Customer Account Profile</h3>
                  <p className="type-caption text-[10px] text-neutral-500 dark:text-zinc-400">View information and manage loyalty points</p>
                </div>
              </div>

              {/* Account Details Sheet */}
              <div className="rounded-xl bg-foreground/[0.02] border border-card-border p-5 space-y-4 mb-6 shadow-inner">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Customer Name</span>
                  <span className="text-foreground font-bold">{selectedMember.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Email Address</span>
                  <span className="text-foreground font-semibold">{selectedMember.email || "n/a"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Phone Number</span>
                  <span className="text-foreground font-semibold">{formatDisplayPhone(selectedMember.phone)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Member ID</span>
                  <span className="text-brand-green dark:text-emerald-400 font-mono font-bold bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/15 text-[11px] shadow-sm">
                    {selectedMember.id}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Joined Date</span>
                  <span className="text-foreground font-semibold">{selectedMember.joinedAt}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-card-border/40 pt-4">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Stamps Collected</span>
                  <span className="text-foreground font-mono font-bold text-sm bg-neutral-100 dark:bg-zinc-800/60 px-2.5 py-0.5 rounded-full border border-card-border/60">
                    {selectedMember.stamps} / 10
                  </span>
                </div>
              </div>

              {/* Stamps slot preview grid inside the details modal */}
              <div className="mb-6 space-y-2.5">
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-zinc-400 font-bold block">Visual Stamp Progress</span>
                <div className="grid grid-cols-10 gap-1 p-3.5 bg-foreground/[0.01] rounded-xl border border-card-border/40">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const isStamped = idx < selectedMember.stamps;
                    return (
                      <div
                        key={idx}
                        className={`h-6 w-6 rounded-full border flex items-center justify-center text-[8px] transition-all duration-300 ${isStamped
                            ? "bg-brand-green/20 border-brand-green text-brand-green font-bold scale-105 shadow-sm shadow-brand-green/10"
                            : "border-card-border bg-background/50 text-neutral-400 dark:text-zinc-600 dark:bg-black/40 font-semibold"
                          }`}
                      >
                        {isStamped ? <Check size={9} className="stroke-[3]" /> : idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-full border border-card-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-neutral-500 dark:text-zinc-300 hover:text-white py-3 text-xs font-bold transition-all cursor-pointer"
                >
                  Close Profile
                </button>
                <button
                  onClick={() => setIsRevokeConfirmOpen(true)}
                  disabled={selectedMember.stamps <= 0}
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-700 py-3 text-xs text-white transition-all duration-300 font-bold disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md shadow-red-600/10"
                >
                  Revoke 1 Stamp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revoke Confirmation Modal */}
      <AnimatePresence>
        {isRevokeConfirmOpen && (
          <motion.div
            key="revoke-confirm-modal-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRevokeConfirmOpen(false)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-red-500/20 bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              {/* Decorative Red Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-[30px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                  <AlertTriangle size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-base">Confirm Revocation</h3>
                  <p className="type-caption text-[10px] text-neutral-500 dark:text-zinc-400">This action will deduct 1 stamp</p>
                </div>
              </div>

              {/* Confirmation Details Card */}
              <div className="rounded-xl border border-card-border bg-foreground/[0.02] p-4 space-y-2.5 mb-6 text-xs shadow-inner">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-zinc-400">Customer</span>
                  <span className="text-foreground font-bold">{selectedMember.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-zinc-400">Member ID</span>
                  <span className="text-foreground font-mono font-semibold">{selectedMember.id}</span>
                </div>
                <div className="flex justify-between border-t border-card-border/40 pt-2.5 mt-1">
                  <span className="text-neutral-500 dark:text-zinc-400">Current Stamps</span>
                  <span className="text-foreground font-bold font-mono">{selectedMember.stamps} / 10</span>
                </div>
                <div className="flex justify-between text-red-500 dark:text-red-400 font-bold">
                  <span>New Stamp Count</span>
                  <span className="font-mono">{selectedMember.stamps - 1} / 10</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsRevokeConfirmOpen(false)}
                  className="flex-1 rounded-full border border-card-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-neutral-500 dark:text-zinc-300 hover:text-white py-3 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onRevokeStamp(selectedMember);
                    setIsRevokeConfirmOpen(false);
                    onClose();
                  }}
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-700 py-3 text-xs text-white transition-all duration-300 font-bold cursor-pointer shadow-lg shadow-red-600/20"
                >
                  Yes, Revoke
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
