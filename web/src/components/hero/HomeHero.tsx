"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
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

const headlineLine = {
  hidden: { opacity: 0, y: 32, clipPath: "inset(100% 0 0 0)" },
  show: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const ctaHover = { scale: 1.03, transition: { duration: 0.25, ease: EASE } };
const ctaTap = { scale: 0.97 };

export const HomeHero: React.FC = () => {
  return (
    <section className="relative h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background with slow Ken Burns */}
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

      {/* Light overlays — keeps text readable without crushing the photo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_45%,transparent_35%,rgba(11,11,11,0.45)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/90 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15" />
      {/* Soft scrim behind headline only */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_42%,rgba(0,0,0,0.35)_0%,transparent_70%)]" />

      {/* Ambient gold glow */}
      <motion.div
        className="absolute top-[20%] left-[18%] w-[320px] h-[320px] bg-brand-gold/8 blur-[110px] rounded-full"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[22%] right-[16%] w-[280px] h-[280px] bg-brand-gold/6 blur-[100px] rounded-full"
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [1.04, 1, 1.04] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        variants={heroStagger}
        initial="hidden"
        animate="show"
      >
        {/* Eyebrow badge */}
        <motion.div
          variants={heroItem}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          <span className="type-eyebrow tracking-[0.25em] text-xs font-semibold text-brand-gold/90">
            Welcome to the Golden Ritual
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="type-display text-white max-w-4xl mx-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] font-serif leading-[1.12] tracking-tight"
          variants={heroItem}
        >
          Redefining the{" "}
          <span className="hero-gradient-text block sm:inline-block">
            Coffee Experience
          </span>
        </motion.h1>

        {/* Subcopy */}
        <motion.p
          variants={heroItem}
          className="type-body mt-6 text-zinc-300/90 max-w-2xl mx-auto drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)] leading-relaxed text-base md:text-[1.05rem]"
        >
          Indulge in our carefully curated, slow-roasted single-origin coffees and custom artisan
          patisserie. Set in a sensory lounge designed for tranquility.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={heroItem}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-9 w-full max-w-md mx-auto sm:max-w-none"
        >
          <motion.div whileHover={ctaHover} whileTap={ctaTap} className="w-full sm:w-auto">
            <Link
              href="/menu"
              className="type-ui group relative w-full sm:w-auto flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-brand-gold px-8 py-4 text-black font-semibold transition-all duration-300 hover:bg-brand-gold-hover hover:shadow-[0_0_30px_rgba(197,168,128,0.25)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
              <span className="relative flex items-center gap-2">
                Explore Salon Menu
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>

          <motion.div whileHover={ctaHover} whileTap={ctaTap} className="w-full sm:w-auto">
            <Link
              href="/reservations"
              className="type-ui group w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-8 py-4 text-white backdrop-blur-md transition-all duration-300 hover:border-brand-gold/40 hover:bg-white/8 hover:shadow-[0_0_25px_rgba(255,255,255,0.03)]"
            >
              <Calendar
                size={15}
                className="text-brand-gold transition-transform duration-300 group-hover:scale-110"
              />
              Reserve Event Cart
            </Link>
          </motion.div>
        </motion.div>

        {/* Tertiary CTA - Clean & Subtitle-like */}
        <motion.div variants={heroItem} className="pt-6">
          <Link
            href="/loyalty"
            className="type-ui inline-flex items-center gap-2 text-zinc-400 hover:text-brand-gold transition-colors duration-300 text-xs tracking-wider"
          >
            <span>Digital Loyalty Card</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.55, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8, ease: EASE }}
      >
        <div className="w-5 h-8 rounded-full border border-zinc-600/80 flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 10, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-1 h-1.5 rounded-full bg-brand-gold"
          />
        </div>
        <span className="type-micro">Scroll</span>
      </motion.div>
    </section>
  );
};
