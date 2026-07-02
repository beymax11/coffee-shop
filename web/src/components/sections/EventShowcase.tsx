"use client";

import React from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { FadeUp } from "@/components/animations";

export const EventShowcase: React.FC = () => {
  return (
    <section className="py-24 bg-background relative transition-colors duration-500">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="rounded-2xl border border-card-border bg-card p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 glassmorphism-gold shadow-2xl">
          {/* Background glowing ball */}
          <div className="absolute -top-1/4 -right-1/4 w-[350px] h-[350px] bg-brand-gold/5 blur-[100px] rounded-full pointer-events-none" />

          {/* Left Content */}
          <div className="flex-1 space-y-6">
            <span className="type-eyebrow">L&apos;OR NOIR Privé</span>
             <h2 className="type-h2 text-foreground leading-tight">
              Luxury Mobile Coffee Cart Booking
            </h2>
            <p className="type-body-sm text-neutral-500 dark:text-zinc-400">
              Bring our elite coffee catering setup directly to your private gala, corporate event, or boutique launch. Our bespoke mobile cart features a matte black and brass copper build, staffed by two certified master baristas serving our full espresso, signature mocktail, and patisserie collections.
            </p>
            <ul className="space-y-2 type-body-sm text-neutral-500 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-brand-gold font-bold">•</span> Complete customized beverage menu branding.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-gold font-bold">•</span> Single-origin geisha and signature cold smoked drinks.
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-gold font-bold">•</span> Full-grain leather, walnut wood, and gold plated fittings.
              </li>
            </ul>
            
            <div className="pt-4">
              <Link
                href="/reservations"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold px-8 py-3.5 type-ui text-black hover:bg-brand-gold-hover transition-all shadow gold-glow active:scale-95 animate-shimmer"
              >
                Configure Event Reservation
                <Calendar size={14} />
              </Link>
            </div>
          </div>

          {/* Right Photo */}
          <div className="w-full md:w-[400px] h-80 rounded-xl overflow-hidden border border-card-border shrink-0">
            <img
              src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop"
              alt="Mobile Coffee Cart Setup"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
