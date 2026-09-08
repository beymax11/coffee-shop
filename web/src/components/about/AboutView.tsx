"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Coffee } from "lucide-react";
import { PageTransition } from "@/components/animations";

export function AboutView() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-16 md:py-24 text-foreground transition-colors duration-500 relative overflow-hidden">
        {/* Subtle ambient glows */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-3xl px-6 md:px-8 text-center relative z-10 space-y-16">
          {/* Header Section */}
          <div className="space-y-4">
            <span className="type-eyebrow text-emerald-600 dark:text-emerald-400 font-bold block">
              Antonioni Grounds
            </span>
            <h1 className="type-h1 text-foreground leading-tight">
              Nice to meet you!
            </h1>
            <div className="w-12 h-[1.5px] bg-[#2E5A44] dark:bg-emerald-500/60 mx-auto mt-4" />
          </div>

          {/* Maru Legacy & Connection */}
          <div className="space-y-6 text-neutral-600 dark:text-zinc-300 type-body text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            <p>
              Antonioni Grounds is named after Maru “Antonioni,” a beloved son, brother, and friend. Each cup made from these beans is a testament to his legacy, and his undying love for brewed coffee.
            </p>
            <p>
              A cup of coffee is more than a morning pick me up. It’s an experience meant to be savored, shared, and celebrated. At Antonioni Grounds, we believe a shared cup of coffee brings people together. Connection first, coffee second. Or maybe it’s the other way around. Either way, tara, kape.
            </p>
          </div>

          {/* What we're about Section */}
          <div className="pt-10 border-t border-card-border space-y-6 max-w-2xl mx-auto">
            <span className="text-[10px] tracking-[0.25em] font-sans font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
              Our Philosophy
            </span>
            <h2 className="type-h2 text-foreground">
              What we’re about
            </h2>

            <p className="type-body text-neutral-600 dark:text-zinc-300 text-base leading-relaxed">
              We do not craft coffee, we craft connection. That’s the whole philosophy, really. A barista remembering your tumbler, your order, your face when you walk in, that says more about us than anything we could write here.
            </p>

            {/* Beans Highlight (Clean, unboxed) */}
            <div className="py-6 space-y-2">
              <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400">

                <span className="font-serif italic font-medium text-base">Batangas Robusta + Excelsa</span>
              </div>
              <p className="type-body-sm text-neutral-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Our beans come from Batangas. Robusta + Excelsa. Antonioni’s favorite blend, still the one we pour today.
              </p>
            </div>

            {/* Tiaong & Mobile Cart Presence */}
            <p className="type-body text-neutral-600 dark:text-zinc-300 text-base leading-relaxed">
              Today, that’s a coffee shop in Tiaong, and a mobile cart, the Brew Buggy, that goes wherever the community needs us.
            </p>
          </div>

          {/* Call to Action: Meet the Brew Buggy */}
          <div className="pt-8 space-y-3 flex flex-col items-center">
            <Link
              href="/brew-buggy"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-7 py-3.5 font-sans text-xs uppercase font-bold tracking-widest text-white border border-[#2E5A44]/40 shadow-[0_4px_20px_rgba(46,90,68,0.25)] hover:shadow-[0_4px_25px_rgba(46,90,68,0.4)] transition-all duration-300 active:scale-95"
            >
              <Coffee size={14} className="stroke-[2.5]" />
              <span>Meet the Brew Buggy</span>
              <span className="inline-flex items-center max-w-0 opacity-0 overflow-hidden group-hover:max-w-[20px] group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300">
                <ArrowRight size={14} className="stroke-[2.5]" />
              </span>
            </Link>
            <span className="text-xs text-neutral-400 dark:text-zinc-500 italic">
              (for the full story of how this all started)
            </span>
          </div>

          {/* Sign-off */}
          <div className="pt-4">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">
              Tara, kape!
            </h3>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
