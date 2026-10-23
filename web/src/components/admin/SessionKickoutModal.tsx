"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogIn, Clock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SessionKickoutModalProps {
  isOpen: boolean;
  isHardExpiry?: boolean;
  reason?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function SessionKickoutModal({
  isOpen,
  isHardExpiry = false,
  reason,
}: SessionKickoutModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleRedirect = () => {
    router.replace(
      "/login?view=page&reason=" +
        (isHardExpiry ? "session_expired" : "session_kicked")
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop matching Admin View modals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card p-7 shadow-2xl relative z-10 overflow-hidden"
        >
          {/* Ambient Glow Accent */}
          <div
            className={`absolute top-0 right-0 w-32 h-32 blur-[35px] rounded-full pointer-events-none ${
              isHardExpiry
                ? "bg-amber-500/10 dark:bg-amber-500/15"
                : "bg-rose-500/10 dark:bg-rose-500/15"
            }`}
          />

          {/* Top Decorative Gradient Line */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
              isHardExpiry
                ? "from-amber-600 via-amber-400 to-amber-600"
                : "from-brand-gold via-rose-500 to-brand-gold"
            }`}
          />

          <div className="flex flex-col">
            {/* Header with Icon and Badge */}
            <div className="flex items-center gap-3.5 mb-4">
              <div
                className={`p-3 rounded-xl border flex items-center justify-center ${
                  isHardExpiry
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                }`}
              >
                {isHardExpiry ? (
                  <Clock className="w-5 h-5 animate-pulse" />
                ) : (
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                )}
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border mb-1 ${
                    isHardExpiry
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isHardExpiry ? "bg-amber-500" : "bg-rose-500"
                    }`}
                  />
                  {isHardExpiry ? "Session Expired" : "Security Notice"}
                </span>
                <h3 className="text-xl text-foreground font-serif font-bold tracking-tight">
                  {isHardExpiry ? "7-Day Session Ended" : "Session Terminated"}
                </h3>
              </div>
            </div>

            {/* Explanation Message */}
            <p className="text-neutral-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
              {reason ||
                (isHardExpiry
                  ? "Your 7-day administrative session limit has ended. For security reasons, please re-authenticate."
                  : "Another active session was established on a different device or browser. Only one active administrator session is permitted at a time.")}
            </p>

            {/* Security Policy Card matching Admin View details style */}
            <div className="w-full bg-neutral-50 dark:bg-black/40 rounded-xl p-3.5 border border-neutral-200 dark:border-card-border mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Policy Enforced:
                </span>
                <span className="text-foreground font-semibold tracking-wide">
                  Single Active Session
                </span>
              </div>
            </div>

            {/* Primary Action Button styled identically to Admin Panel Primary CTA */}
            <button
              onClick={handleRedirect}
              className="w-full py-3 px-5 text-xs tracking-wider uppercase font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-all rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" />
              Return to Login
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
