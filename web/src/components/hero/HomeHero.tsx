"use client";

import React from "react";
import Link from "next/link";
import { Calendar, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const heroStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.2,
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE },
  },
};

const ctaHover = { scale: 1.03, transition: { duration: 0.25, ease: EASE } };
const ctaTap = { scale: 0.97 };

export const HomeHero: React.FC = () => {
  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] w-full flex items-center overflow-hidden bg-[#0B0B0B] py-16 sm:py-0">
      {/* Background with slow Ken Burns */}
      <div className="absolute inset-0 opacity-100 dark:opacity-80 transition-opacity duration-500">
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/hero.png')",
          }}
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: [1.08, 1.12, 1.08], opacity: 1 }}
          transition={{
            opacity: { duration: 1.4, ease: EASE },
            scale: { duration: 22, repeat: Infinity, ease: "linear" },
          }}
        />
      </div>

      {/* Overlays — left scrim for readable copy, photo stays visible on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/95 via-[#0B0B0B]/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/80 via-transparent to-black/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_45%,rgba(0,0,0,0.4)_0%,transparent_65%)]" />

      {/* Ambient gold glow — anchored near left content */}
      <motion.div
        className="absolute top-[18%] left-[8%] w-[280px] h-[280px] bg-brand-green/10 dark:bg-brand-green/15 blur-[100px] rounded-full hidden dark:block"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[12%] w-[320px] h-[320px] bg-brand-green/5 dark:bg-brand-green/8 blur-[110px] rounded-full hidden dark:block"
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1.04, 1, 1.04] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Film grain */}
      <div
        aria-hidden="true"
        className="film-grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
      />

      {/* Cinematic vertical edge lines */}
      <div className="pointer-events-none absolute inset-y-0 left-12 w-px bg-white/[0.06] hidden xl:block" />
      <div className="pointer-events-none absolute inset-y-0 right-12 w-px bg-white/[0.06] hidden xl:block" />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 text-center md:text-left"
        variants={heroStagger}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-xl md:max-w-2xl mx-auto md:mx-0">
          {/* Eyebrow badge */}
          <motion.div
            variants={heroItem}
            className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#2E5A44]/10 px-3 py-1 sm:px-4 sm:py-1.5 backdrop-blur-md max-w-full"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="type-eyebrow tracking-[0.12em] sm:tracking-[0.25em] font-semibold text-emerald-400 text-[8.5px] sm:text-[10px]">
              Welcome to Antonioni Grounds
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="type-display text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] font-serif leading-[1.12] tracking-tight"
            variants={heroItem}
          >
            Where Every Cup{" "}
            <span className="text-emerald-400 italic block sm:inline-block">
              Finds Its Story
            </span>
          </motion.h1>

          {/* Subcopy */}
          <motion.p
            variants={heroItem}
            className="type-body mt-4 sm:mt-6 text-zinc-300/90 max-w-lg mx-auto md:mx-0 drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)] leading-relaxed text-sm sm:text-base md:text-[1.05rem]"
          >
            Experience handcrafted coffee, thoughtfully prepared with quality beans, warm hospitality, and a space made for meaningful moments.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={heroItem}
            className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 pt-6 sm:pt-9"
          >
            <motion.div whileHover={ctaHover} whileTap={ctaTap}>
              <Link
                href="/loyalty"
                className="type-ui group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#2E5A44] px-6 sm:px-8 py-3.5 sm:py-4 text-white font-semibold transition-all duration-300 hover:bg-[#234533] hover:shadow-[0_0_30px_rgba(46,90,68,0.25)] text-xs"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
                <span className="relative flex items-center gap-2">
                  Digital Loyalty Card
                  <CreditCard size={14} className="transition-transform duration-300 group-hover:scale-110" />
                </span>
              </Link>
            </motion.div>

            <motion.div whileHover={ctaHover} whileTap={ctaTap}>
              <Link
                href="/reservations"
                className="type-ui group flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-6 sm:px-8 py-3.5 sm:py-4 text-white backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:bg-white/8 hover:shadow-[0_0_25px_rgba(255,255,255,0.03)] text-xs"
              >
                <Calendar
                  size={14}
                  className="text-emerald-500 transition-transform duration-300 group-hover:scale-110"
                />
                Reserve Event Cart
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom blend into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 md:h-40 bg-gradient-to-t from-background to-transparent hidden dark:block" />

      {/* Seam hairline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none hidden sm:flex"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.55, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8, ease: EASE }}
      >
        <div className="w-5 h-8 rounded-full border border-zinc-600/80 flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 10, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-1 h-1.5 rounded-full bg-emerald-400"
          />
        </div>
        <span className="type-micro">Scroll</span>
      </motion.div>
    </section>
  );
};
