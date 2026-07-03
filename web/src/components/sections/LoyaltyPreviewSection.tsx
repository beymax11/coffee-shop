"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Coffee, Gift, ArrowRight, Sparkles } from "lucide-react";
import { FadeUp } from "@/components/animations";
import { db } from "@/utils/db";

export function LoyaltyPreviewSection() {
  const [memberName, setMemberName] = useState<string>("Alexander Vance");
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [stamps, setStamps] = useState<number>(1);
  const [points, setPoints] = useState<number>(720);

  useEffect(() => {
    const syncFromDb = () => {
      const sessionEmail = localStorage.getItem("customer_session");
      const members = db.getLoyaltyMembers();

      let current = members.find((m) => m.id === "LN-882-901"); // default fallback
      let guestState = true;

      if (sessionEmail) {
        const found = members.find((m) => m.email.toLowerCase() === sessionEmail.toLowerCase());
        if (found) {
          current = found;
          guestState = false;
        }
      }

      if (current) {
        let currentStamps = current.stamps;
        if (current.id === "LN-882-901") {
          currentStamps = 1;
        }
        setMemberName(current.name);
        setStamps(currentStamps);
        setPoints(current.points);
        setIsGuest(guestState);
      }
    };

    syncFromDb();
    window.addEventListener("storage", syncFromDb);
    return () => window.removeEventListener("storage", syncFromDb);
  }, []);

  const tier = points >= 1500 ? "Platinum" : points >= 500 ? "Gold" : "Bronze";

  return (
    <section className="py-20 bg-background text-foreground border-t border-card-border relative transition-colors duration-500 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, var(--card-border) 1px, transparent 1px), linear-gradient(to bottom, var(--card-border) 1px, transparent 1px)`,
          backgroundSize: '45px 45px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
        }}
      />

      <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Loyalty Details & Program Description */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-4">
              <FadeUp>
                <div className="flex items-center gap-2">
                  <span className="type-eyebrow">Digital Membership</span>
                  <div className="h-[1px] w-8 bg-brand-gold/30" />
                </div>
                <h2 className="type-h2 text-foreground mt-2 leading-snug">
                  The Antonioni Reserve Club
                </h2>
                <p className="type-body text-neutral-500 dark:text-zinc-400 leading-relaxed max-w-xl">
                  {isGuest 
                    ? "Step into a world of curated coffee luxury. Sign up to receive your digital loyalty card, earn stamps on every pour, and unlock access to rare micro-lots and tasting masterclasses."
                    : `Welcome back, ${memberName.split(' ')[0]}. Here is your current membership status. Scan your digital QR code at any of our flagship locations to claim and add your active stamps.`
                  }
                </p>
              </FadeUp>
            </div>

            {/* Loyalty CTAs */}
            <FadeUp delay={0.1} className="pt-4 border-t border-card-border">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {isGuest ? (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold hover:bg-brand-gold-hover text-black px-6 py-3 font-semibold text-sm transition-all duration-300 gold-glow active:scale-95 cursor-pointer"
                    >
                      Join Loyalty Club
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      href="/loyalty"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-card-border bg-card hover:bg-zinc-100 dark:hover:bg-white/5 text-foreground px-6 py-3 font-medium text-sm transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                      Explore Rewards Program
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/loyalty"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gold hover:bg-brand-gold-hover text-black px-6 py-3 font-semibold text-sm transition-all duration-300 gold-glow active:scale-95 cursor-pointer"
                    >
                      Manage My Loyalty Card
                      <ArrowRight size={14} />
                    </Link>
                  </>
                )}
              </div>
            </FadeUp>
          </div>

          {/* Right Column: Dynamic Status / Progress Widget */}
          <div className="lg:col-span-5 w-full">
            <FadeUp delay={0.05}>
              <div className="p-6 rounded-2xl border border-brand-gold/15 bg-gradient-to-br from-[#FCF9F5] to-[#EADBC8]/40 dark:from-[#1c1a16] dark:to-[#121212] glassmorphism-gold shadow-xl gold-glow space-y-5">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-zinc-500 tracking-wider uppercase">Active Progress</p>
                    <p className="text-xl font-bold font-serif text-foreground">{stamps} / 10 Stamps</p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-[10px] text-zinc-500 tracking-wider uppercase">Member Level</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                      <Sparkles size={10} />
                      {tier} Tier
                    </span>
                  </div>
                </div>

                {/* Micro Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-zinc-200 dark:bg-white/5 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-gold h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_#C5A880]" 
                      style={{ width: `${(stamps / 10) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>{stamps} coffees purchased</span>
                    <span>{10 - stamps} stamps left to free Geisha</span>
                  </div>
                </div>

                {/* User Perks list */}
                <div className="border-t border-card-border/80 pt-4 mt-2 space-y-3">
                  <p className="text-[10px] text-zinc-500 tracking-wider uppercase">Current Privileges</p>
                  <div className="space-y-2 text-xs text-neutral-600 dark:text-zinc-400">
                    <div className="flex items-center gap-3">
                      <Coffee size={14} className="text-brand-gold shrink-0" />
                      <span>Complimentary Geisha pour at 10 stamps</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles size={14} className="text-brand-gold shrink-0" />
                      <span>Earn {points} points toward tier upgrades</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Gift size={14} className="text-brand-gold shrink-0" />
                      <span>Exclusive invitations to coffee tasting masterclasses</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  );
}
