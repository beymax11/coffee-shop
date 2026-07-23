"use client";

import React, { useState, useEffect } from "react";
import { LogOut, Wrench, RefreshCw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Image from "next/image";
import { invalidateCache } from "@/utils/cache";

export function MaintenanceView() {
  const [hasCustomerSession, setHasCustomerSession] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasCustomerSession(!!localStorage.getItem("customer_session"));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customer_session");
    setHasCustomerSession(false);
    window.dispatchEvent(new Event("storage"));
    toast.success("Signed out successfully");
  };

  const handleManualRefresh = () => {
    setIsChecking(true);
    invalidateCache("maintenance_mode");
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("maintenance_mode_changed"));
    setTimeout(() => {
      setIsChecking(false);
      toast.info("Checked maintenance status");
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-background text-foreground transition-colors duration-300 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-green/10 blur-[130px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full text-center bg-card/70 backdrop-blur-xl border border-card-border rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-green to-transparent" />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-brand-green/15 text-brand-green border border-brand-green/30 mb-6 shadow-sm">
          <Wrench size={13} className="animate-spin text-brand-green" style={{ animationDuration: "6s" }} />
          <span>System Maintenance</span>
        </div>

        {/* Logo / Stamp */}
        <div className="mx-auto mb-6 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-brand-green/20 blur-xl rounded-full scale-110" />
          <Image
            src="/maintenance_stamp.png"
            width={115}
            height={75}
            className="object-contain relative z-10 drop-shadow-md brightness-0 invert"
            alt="Antonioni Grounds Maintenance"
          />
        </div>

        {/* Brand/Heading */}
        <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground mb-3">
          Brewing Improvements
        </h2>
        
        <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-brand-green to-transparent mx-auto mb-5" />

        {/* Maintenance Message */}
        <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-8">
          Antonioni Grounds is currently undergoing scheduled maintenance to upgrade your table reservations, digital loyalty rewards, and lounge experience. We will be back online shortly!
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleManualRefresh}
            disabled={isChecking}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider uppercase bg-brand-green text-white hover:bg-brand-green-hover transition-all duration-300 rounded-xl shadow-lg shadow-brand-green/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isChecking ? "animate-spin" : ""} />
            <span>{isChecking ? "Checking Status..." : "Check System Status"}</span>
          </button>

          {hasCustomerSession && (
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase border border-brand-green/30 hover:bg-brand-green/10 text-brand-green transition-all duration-300 rounded-xl cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out of Account</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}


