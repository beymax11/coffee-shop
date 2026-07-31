"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText: string;
  variant: "danger" | "warning";
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText,
  variant,
  onConfirm,
  isLoading: externalIsLoading,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const loading = externalIsLoading || isSubmitting;

  const handleConfirm = async () => {
    if (loading) return;
    try {
      setIsSubmitting(true);
      await onConfirm();
    } catch (err) {
      console.error("ConfirmModal onConfirm error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
            className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card p-8 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Ambient Glow */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 blur-[25px] rounded-full pointer-events-none ${
                variant === "danger" ? "bg-rose-500/5" : "bg-amber-500/5"
              }`}
            />

            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors duration-300 p-1.5 rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              {variant === "danger" ? (
                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500">
                  <Trash2 size={20} className={loading ? "animate-bounce" : "animate-pulse"} />
                </div>
              ) : (
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                  <AlertTriangle size={20} className="animate-pulse" />
                </div>
              )}
              <h3 className="text-xl text-foreground font-serif font-bold tracking-tight">
                {title}
              </h3>
            </div>

            <p className="text-neutral-500 dark:text-zinc-400 text-sm leading-relaxed mb-8">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 text-xs tracking-wider uppercase border border-card-border hover:bg-foreground/5 transition-colors duration-300 rounded-lg cursor-pointer text-neutral-500 hover:text-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`px-4 py-2.5 text-xs tracking-wider uppercase text-white transition-all duration-300 rounded-lg shadow-md font-semibold flex items-center justify-center gap-2 ${
                  loading ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                } ${
                  variant === "danger"
                    ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/10"
                    : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10"
                }`}
              >
                {loading && <Loader2 size={14} className="animate-spin shrink-0" />}
                <span>
                  {loading
                    ? confirmText.toLowerCase().includes("delete")
                      ? "Deleting..."
                      : "Processing..."
                    : confirmText}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
