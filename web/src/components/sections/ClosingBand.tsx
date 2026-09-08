"use client";

import React from "react";
import Link from "next/link";
import { ClipboardList, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const ClosingBand: React.FC = () => {
  return (
    <section className="py-10 md:py-14 bg-background dark:bg-black border-t border-card-border transition-colors duration-500 relative overflow-hidden">
      {/* Dynamic Background accents matching LifestyleGrid */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-[#2E5A44]/5 rounded-full filter blur-3xl pointer-events-none dark:hidden" />
      <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-[#2E5A44]/5 rounded-full filter blur-3xl pointer-events-none dark:hidden" />

      <div className="relative max-w-5xl mx-auto px-6 md:px-8 text-center z-10">

        {/* Big Bold Headline */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-foreground tracking-tight leading-tight mb-3">
          Tara, kape!
        </h2>

        {/* Subhead */}
        <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg text-neutral-600 dark:text-zinc-400 leading-relaxed mb-6">
          A coffee shop in Tiaong. A cart that comes to you. Same care either way.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Button 1: Tara, kape! (→ Menu) */}
          <Link
            href="/menu"
            className="type-ui group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#2E5A44] px-8 py-4 text-white font-semibold transition-all duration-300 hover:bg-[#234533] hover:shadow-[0_0_35px_rgba(46,90,68,0.3)] active:scale-95 cursor-pointer w-full sm:w-auto"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
            <span className="relative flex items-center gap-2">
              <ClipboardList size={16} className="shrink-0 transition-transform duration-300 group-hover:scale-110 text-emerald-200" />
              <span>Tara, kape!</span>
              <span className="max-w-0 -translate-x-2 opacity-0 overflow-hidden transition-all duration-300 ease-out group-hover:max-w-[20px] group-hover:translate-x-0 group-hover:opacity-100 flex items-center">
                <ArrowRight size={14} className="shrink-0 ml-1" />
              </span>
            </span>
          </Link>

          {/* Button 2: Book the Brew Buggy (→ Reservations) */}
          <Link
            href="/reservations?type=cart"
            className="type-ui group relative inline-flex items-center justify-center gap-2.5 rounded-full border border-card-border bg-card/80 backdrop-blur-md px-8 py-4 text-foreground font-semibold transition-all duration-300 hover:border-emerald-500/40 hover:bg-neutral-100 dark:hover:bg-zinc-800/80 active:scale-95 cursor-pointer shadow-sm w-full sm:w-auto"
          >
            <Calendar size={16} className="text-[#2E5A44] dark:text-emerald-400 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span>Book the Brew Buggy</span>
            <span className="max-w-0 -translate-x-2 opacity-0 overflow-hidden transition-all duration-300 ease-out group-hover:max-w-[20px] group-hover:translate-x-0 group-hover:opacity-100 flex items-center text-[#2E5A44] dark:text-emerald-400">
              <ArrowRight size={14} className="shrink-0 ml-1" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
