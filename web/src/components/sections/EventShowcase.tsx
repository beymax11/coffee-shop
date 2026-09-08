"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Check } from "lucide-react";

export const EventShowcase: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-background dark:bg-black relative transition-colors duration-500 overflow-hidden">
      {/* Decorative ambient green glows */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none dark:hidden" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none dark:hidden" />

      <div className="mx-auto max-w-3xl px-6 md:px-8 text-center relative z-10">
        <div>
          <span className="type-eyebrow text-emerald-600 dark:text-emerald-400 font-bold block mb-2">
            Antonioni Grounds on Wheels
          </span>
          <h2 className="type-h2 text-foreground leading-tight">
            Brew Buggy
          </h2>
        </div>

        <p className="type-body-sm text-neutral-600 dark:text-zinc-300 leading-relaxed text-base mt-4 max-w-2xl mx-auto">
          Antonioni Grounds on wheels. School fairs, block parties, birthdays, company events, wherever the outlet reaches. Bring a 2500W outlet, we’ll bring the rest.
        </p>

        <p className="text-xs text-neutral-500 dark:text-zinc-400 italic mt-3 max-w-xl mx-auto">
          Behind every cup is a story of love and remembrance. Created to bring freshly brewed coffee, good energy, and meaningful moments to your special occasions.
        </p>

        {/* Feature Highlights */}
        <div className="mt-8 pt-6 border-t border-card-border max-w-xl mx-auto">
          <span className="text-[10px] tracking-[0.2em] font-sans font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-4">
            What We Bring + What We Need
          </span>
          <ul className="space-y-3 text-left inline-block w-full">
            <li className="flex items-start gap-3 text-neutral-600 dark:text-zinc-300 type-body-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2E5A44]/10 text-[#2E5A44] dark:text-emerald-400 border border-emerald-500/20 mt-0.5">
                <Check size={11} className="stroke-[3]" />
              </span>
              <span>
                <strong className="text-foreground">What we need:</strong> A 2500W outlet, and a date.
              </span>
            </li>
            <li className="flex items-start gap-3 text-neutral-600 dark:text-zinc-300 type-body-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2E5A44]/10 text-[#2E5A44] dark:text-emerald-400 border border-emerald-500/20 mt-0.5">
                <Check size={11} className="stroke-[3]" />
              </span>
              <span>
                <strong className="text-foreground">What we bring:</strong> The cart, the drinks, and custom cups + stickers for your event if you’d like them.
              </span>
            </li>
            <li className="flex items-start gap-3 text-neutral-600 dark:text-zinc-300 type-body-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2E5A44]/10 text-[#2E5A44] dark:text-emerald-400 border border-emerald-500/20 mt-0.5">
                <Check size={11} className="stroke-[3]" />
              </span>
              <span>
                <strong className="text-foreground">Anywhere you are:</strong> No fixed cart location. If you want us there, book us on the website or by DM on Instagram.
              </span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-8 flex justify-center">
          <Link
            href="/reservations?type=cart"
            className="type-ui group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#2E5A44] px-8 py-3.5 text-white font-semibold transition-all duration-300 hover:bg-[#234533] hover:shadow-[0_0_30px_rgba(46,90,68,0.25)] active:scale-95 cursor-pointer"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
            <span className="relative flex items-center gap-2">
              <Calendar size={15} className="shrink-0 transition-transform duration-300 group-hover:scale-110 text-emerald-200" />
              <span>Book the Brew Buggy</span>
              <span className="max-w-0 -translate-x-2 opacity-0 overflow-hidden transition-all duration-300 ease-out group-hover:max-w-[20px] group-hover:translate-x-0 group-hover:opacity-100 flex items-center">
                <ArrowRight size={14} className="shrink-0 ml-1" />
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

