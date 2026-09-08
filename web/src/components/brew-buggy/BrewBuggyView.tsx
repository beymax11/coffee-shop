"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Check, Coffee } from "lucide-react";
import { PageTransition } from "@/components/animations";

export function BrewBuggyView() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-16 md:py-24 text-foreground transition-colors duration-500 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-3xl px-6 md:px-8 text-center relative z-10 space-y-16">
          {/* Header Section */}
          <div className="space-y-4">
            <span className="type-eyebrow text-emerald-600 dark:text-emerald-400 font-bold block">
              Antonioni Grounds on Wheels
            </span>
            <h1 className="type-h1 text-foreground leading-tight">
              Meet Brew Buggy
            </h1>
            <div className="w-12 h-[1.5px] bg-[#2E5A44] dark:bg-emerald-500/60 mx-auto mt-4" />
            <p className="type-body text-neutral-600 dark:text-zinc-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto pt-2">
              The open-top coffee carriage of Antonioni Grounds. Created to bring freshly brewed coffee, good energy, and meaningful moments to your special occasions.
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-serif italic max-w-lg mx-auto">
              Behind every cup is a story of love and remembrance.
            </p>
          </div>

          {/* Where It Started Section */}
          <div className="pt-10 border-t border-card-border space-y-6 max-w-2xl mx-auto text-left sm:text-center">
            <span className="text-[10px] tracking-[0.25em] font-sans font-bold uppercase text-emerald-600 dark:text-emerald-400 block text-center">
              December 2020
            </span>
            <h2 className="type-h2 text-foreground text-center">
              Where it started
            </h2>

            <div className="space-y-4 text-neutral-600 dark:text-zinc-300 type-body text-base leading-relaxed">
              <p>
                Antonioni Grounds began as a passion project inspired by a beloved son, brother, and friend, Maru “Antonioni.” It was a fine, breezy day in December 2020. He was browsing online, sipping a fresh cup of coffee, when the idea hit him: a personalized Christmas gift, a gift box packed with fresh coffee beans, made in a way that felt like him. Thinking about the people he wanted to give to, what they loved, and what he loved too, he found their common ground: coffee.
              </p>
              <p>
                He shared the idea with his brothers and sisters, the way he always spoke his mind. It didn’t happen that year. He had a full time job he was just as passionate about, and the idea got buried under everything else he was building. But it never really faded.
              </p>
              <p>
                Every day started the same way for him: a fresh cup of coffee, made by his mom. Every single day. Sometimes twice. Sometimes three times.
              </p>
            </div>
          </div>

          {/* Where the Name Comes From Section */}
          <div className="pt-10 border-t border-card-border space-y-6 max-w-2xl mx-auto text-left sm:text-center">
            <span className="text-[10px] tracking-[0.25em] font-sans font-bold uppercase text-emerald-600 dark:text-emerald-400 block text-center">
              The Origin
            </span>
            <h2 className="type-h2 text-foreground text-center">
              Where the name comes from
            </h2>

            {/* Names banner */}
            <div className="py-2 text-center">
              <span className="font-serif italic text-lg sm:text-xl text-emerald-700 dark:text-emerald-400 tracking-wider">
                Maru · Boogie · Bugoy · Bugy
              </span>
            </div>

            <div className="space-y-4 text-neutral-600 dark:text-zinc-300 type-body text-base leading-relaxed">
              <p>
                The names the people who loved him knew him by. Those names became part of the inspiration behind Brew Buggy, a little piece of Antonioni that now travels from one gathering to another, brewing coffee along the way.
              </p>
              <p>
                Because Brew Buggy is meant to be more than a coffee carriage. It’s a way of carrying forward his love for people, his passion for coffee, and the memories he left with everyone who knew him.
              </p>
              <p className="font-medium text-foreground">
                On January 1, 2024, Antonioni Grounds was unveiled to his friends and family. His love for coffee, and for the people around him, was too good to keep buried in an idea.
              </p>
            </div>
          </div>

          {/* Book Brew Buggy Section */}
          <div className="pt-10 border-t border-card-border space-y-6 max-w-2xl mx-auto text-center">
            <span className="text-[10px] tracking-[0.25em] font-sans font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
              Bring Us To Your Event
            </span>
            <h2 className="type-h2 text-foreground">
              Book Brew Buggy
            </h2>

            <p className="type-body text-neutral-600 dark:text-zinc-300 text-base leading-relaxed">
              We’d be honored to be part of your celebrations, milestones, and gatherings. School fairs, sports days, block parties, birthdays, company events, wherever people are pausing to connect over a cup.
            </p>

            {/* Specs List (Clean, unboxed) */}
            <div className="space-y-3 pt-4 text-left max-w-lg mx-auto">
              <div className="flex items-start gap-3 text-neutral-600 dark:text-zinc-300 type-body-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2E5A44]/10 text-[#2E5A44] dark:text-emerald-400 border border-emerald-500/20 mt-0.5">
                  <Check size={11} className="stroke-[3]" />
                </span>
                <span>
                  <strong className="text-foreground">What we need:</strong> A 2500W outlet, and a date.
                </span>
              </div>
              <div className="flex items-start gap-3 text-neutral-600 dark:text-zinc-300 type-body-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2E5A44]/10 text-[#2E5A44] dark:text-emerald-400 border border-emerald-500/20 mt-0.5">
                  <Check size={11} className="stroke-[3]" />
                </span>
                <span>
                  <strong className="text-foreground">What we bring:</strong> The cart, the drinks, and custom cups + stickers for your event if you’d like them.
                </span>
              </div>
              <div className="flex items-start gap-3 text-neutral-600 dark:text-zinc-300 type-body-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2E5A44]/10 text-[#2E5A44] dark:text-emerald-400 border border-emerald-500/20 mt-0.5">
                  <Check size={11} className="stroke-[3]" />
                </span>
                <span>
                  <strong className="text-foreground">Anywhere you are:</strong> No fixed cart location. If you want us there, book us on the website or by DM on Instagram.
                </span>
              </div>
            </div>

            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-serif italic pt-2">
              With every brew, we hope to carry a little love, passion, and memory with us.
            </p>

            {/* CTA Button */}
            <div className="pt-6 flex justify-center">
              <Link
                href="/reservations"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-7 py-3.5 font-sans text-xs uppercase font-bold tracking-widest text-white border border-[#2E5A44]/40 shadow-[0_4px_20px_rgba(46,90,68,0.25)] hover:shadow-[0_4px_25px_rgba(46,90,68,0.4)] transition-all duration-300 active:scale-95"
              >
                <Calendar size={14} className="stroke-[2.5]" />
                <span>Book the Brew Buggy</span>
                <span className="inline-flex items-center max-w-0 opacity-0 overflow-hidden group-hover:max-w-[20px] group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300">
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </span>
              </Link>
            </div>
          </div>

          {/* Sign-off without top line */}
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
