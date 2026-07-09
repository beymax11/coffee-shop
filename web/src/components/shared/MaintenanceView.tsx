"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Image from "next/image";

export function MaintenanceView() {
  const handleLogout = () => {
    localStorage.removeItem("customer_session");
    // Dispatch storage event to notify LayoutWrapper and Navbar immediately
    window.dispatchEvent(new Event("storage"));
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-background text-foreground transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full text-center bg-card/45 backdrop-blur-md border border-card-border rounded-2xl p-8 md:p-10 shadow-xl"
      >
        {/* Icon Container */}
        <div className="mx-auto mb-8 flex items-center justify-center">
          <Image src="/maintenance_stamp.png" width={96} height={60} className="object-contain" alt="Stamp Logo" />
        </div>

        {/* Brand/Heading */}
        <h2 className="font-serif text-3xl font-medium tracking-wide text-foreground mb-4">
          Brewing Improvements
        </h2>
        
        <div className="h-0.5 w-12 bg-brand-gold mx-auto mb-6" />

        {/* Maintenance Message */}
        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-8">
          Our digital lounge is currently undergoing scheduled maintenance to improve your ordering and loyalty stamp experience. We will be back shortly with fresh updates. Thank you for your patience!
        </p>

        {/* Action Button: Sign Out */}
        <button
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium tracking-wider uppercase border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-espresso transition-all duration-300 rounded-lg cursor-pointer"
        >
          <LogOut size={14} />
          Sign Out of Account
        </button>
      </motion.div>
    </div>
  );
}
