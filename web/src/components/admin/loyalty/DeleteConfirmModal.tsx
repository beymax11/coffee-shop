"use client";

import React from "react";
import { X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoyaltyMember } from "@/utils/db";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToDelete: LoyaltyMember | null;
  onDeleteLoyalty: (id: string) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  memberToDelete,
  onDeleteLoyalty,
}) => {
  if (!memberToDelete) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="delete-confirm-modal-wrapper"
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
            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-red-500/20 bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            {/* Decorative Red Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-[30px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                <Trash2 size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="type-h3 text-foreground font-serif font-bold text-base">Delete Loyalty Card</h3>
                <p className="type-caption text-[10px] text-red-500/80 dark:text-red-400/80 font-semibold uppercase tracking-wider">Warning: This action is permanent</p>
              </div>
            </div>

            {/* Warning explanation */}
            <p className="type-caption text-xs text-neutral-500 dark:text-zinc-400 mb-5 leading-relaxed">
              Are you sure you want to delete the loyalty card for <span className="font-bold text-foreground">{memberToDelete.name}</span>? All stamps and rewards earned will be permanently lost.
            </p>

            {/* Confirmation Details Card */}
            <div className="rounded-xl border border-card-border bg-foreground/[0.02] p-4 space-y-2.5 mb-6 text-xs shadow-inner">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-zinc-400">Customer</span>
                <span className="text-foreground font-bold">{memberToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-zinc-400">Email</span>
                <span className="text-foreground font-semibold">{memberToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-zinc-400">Member ID</span>
                <span className="text-foreground font-mono font-semibold">{memberToDelete.id}</span>
              </div>
              <div className="flex justify-between border-t border-card-border/40 pt-2.5 mt-1">
                <span className="text-neutral-500 dark:text-zinc-400">Stamps Collected</span>
                <span className="text-red-500 dark:text-red-400 font-bold font-mono">{memberToDelete.stamps} / 9</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-full border border-card-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-neutral-500 dark:text-zinc-300 hover:text-white py-3 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteLoyalty(memberToDelete.id);
                  onClose();
                }}
                className="flex-1 rounded-full bg-red-600 hover:bg-red-700 py-3 text-xs text-white transition-all duration-300 font-bold cursor-pointer shadow-lg shadow-red-600/20"
              >
                Yes, Delete Card
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
