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
            "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop')",
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
        <motion.div variants={heroItem} className="flex items-center justify-center gap-4 mb-8">
          <span className="hidden sm:block h-px w-12 bg-gradient-to-r from-transparent to-brand-gold/50" />
          <span className="type-eyebrow bg-brand-gold/[0.08] border border-brand-gold/25 rounded-full px-5 py-2 backdrop-blur-sm shadow-[0_0_30px_rgba(197,168,128,0.08)]">
            Welcome to the Golden Ritual
          </span>
          <span className="hidden sm:block h-px w-12 bg-gradient-to-l from-transparent to-brand-gold/50" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="type-display text-white max-w-4xl mx-auto drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
          variants={heroStagger}
        >
          <motion.span className="block" variants={headlineLine}>
            Redefining the
          </motion.span>
          <motion.span className="block mt-1 sm:mt-2" variants={headlineLine}>
            <span className="hero-gradient-text">Coffee Experience</span>
          </motion.span>
        </motion.h1>

        {/* Subcopy */}
        <motion.p
          variants={heroItem}
          className="type-body mt-7 text-zinc-300 max-w-lg mx-auto drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)]"
        >
          Indulge in our carefully curated, slow-roasted single-origin coffees and custom artisan
          patisserie. Set in a sensory lounge designed for tranquility.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={heroItem}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-9"
        >
          <motion.div whileHover={ctaHover} whileTap={ctaTap}>
            <Link
              href="/menu"
              className="type-ui group relative w-full sm:w-auto flex items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-gold px-8 py-3.5 text-black transition-colors duration-300 hover:bg-brand-gold-hover gold-glow"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:animate-hero-shine" />
              <span className="relative flex items-center gap-2">
                Explore Salon Menu
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </motion.div>

          <motion.div whileHover={ctaHover} whileTap={ctaTap}>
            <Link
              href="/reservations"
              className="type-ui group w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-8 py-3.5 text-white backdrop-blur-sm transition-all duration-300 hover:border-brand-gold/40 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(197,168,128,0.12)]"
            >
              <Calendar
                size={14}
                className="text-brand-gold transition-transform duration-300 group-hover:scale-110"
              />
              Reserve Event Cart
            </Link>
          </motion.div>

          <motion.div whileHover={ctaHover} whileTap={ctaTap}>
            <Link
              href="/shop"
              className="type-ui w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-transparent px-8 py-3.5 text-zinc-500 transition-all duration-300 hover:text-zinc-200 hover:border-white/10 hover:bg-white/[0.04]"
            >
              Shop Merchandise
            </Link>
          </motion.div>
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
