"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export function VerifiedView() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(4);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Redirect trigger effect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      router.replace("/login?view=page&verified=true");
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute w-[400px] h-[400px] bg-brand-green/10 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay" />

      {/* Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 text-center relative z-10 shadow-2xl"
      >
        {/* Animated Checkmark Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="mx-auto w-16 h-16 bg-[#2E5A44]/20 border border-[#2E5A44]/50 rounded-full flex items-center justify-center mb-6 relative shadow-[0_0_20px_rgba(46,90,68,0.15)]"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 10 }}
          >
            <Check className="text-brand-green h-8 w-8" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Text Details */}
        <p className="type-eyebrow text-brand-gold text-[10px] tracking-[0.3em] uppercase mb-2">
          Antonioni Grounds
        </p>
        <h1 className="text-2xl font-bold text-white mb-3 font-serif tracking-tight">
          Email Verified
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          Thank you for confirming your email address. Your reserve account is now fully active.
        </p>

        {/* Action Button */}
        <button
          onClick={() => router.replace("/login?view=page&verified=true")}
          className="w-full bg-[#2E5A44] hover:bg-[#234533] text-white py-3 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(46,90,68,0.2)] border border-[#376b51] cursor-pointer"
        >
          Proceed to Sign In
        </button>

        {/* Countdown redirect */}
        <p className="text-zinc-500 text-[11px] mt-6 font-sans">
          Auto-redirecting in <span className="text-zinc-400 font-semibold font-mono">{countdown}</span> seconds...
        </p>
      </motion.div>
    </div>
  );
}
