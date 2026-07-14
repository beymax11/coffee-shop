"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp } from "@/components/animations";

interface CoffeeExperience {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  metrics: { label: string; value: string }[];
}

const EXPERIENCES: CoffeeExperience[] = [
  {
    id: "table",
    eyebrow: "Table Reservation",
    title: "Lounge Table Reservation",
    description:
      "Reserve a private table in our luxury matte-black café. Perfect for premium coffee tastings, quiet meetings, or personal coffee rituals. Includes full access to our curated single-origin pour-overs and artisanal patisserie collections.",
    features: [
      "1 - 4 guests capacity per lounge table",
      "₱3,500 fully consumable reservation fee",
      "3 hours table booking duration",
      "100% refundable up to 24 hours prior",
    ],
    image: "/res.jpg",
    metrics: [
      { label: "Capacity", value: "1 to 4 Guests" },
      { label: "Pricing", value: "₱3,500 / 3 Hours" },
      { label: "Type", value: "Fully Consumable" },
    ],
  },
  {
    id: "cart",
    eyebrow: "Coffee Cart Booking",
    title: '"Brew Buggy" Mobile Coffee Cart',
    description:
      "Sponsor Antonioni Ground's exclusive Brew Buggy coffee cart, designed exclusively for special occasions. Featuring professional mobile setups serving our premium iced/hot lattes, Americanos, and specialty flavored and non-coffee selections.",
    features: [
      "Brew Buggy Cart, 2 baristas, 3 hours service",
      "Flavors: Latte, Americano, +2 Flavors, +2 Non-Coffee",
      "Price list: 50 Pax (₱5,500) to 200 Pax (₱22,000)",
      "10% Downpayment required to secure booking",
      "100% Refundable up to 1 week before booking date",
    ],
    image: "/cart.jpg",
    metrics: [
      { label: "Baristas", value: "2 Certified" },
      { label: "Service Time", value: "3 Hours Limit" },
      { label: "Pricing", value: "₱5,500 - ₱22,000" },
    ],
  },
];

export const EventShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeExp = EXPERIENCES[activeIndex];

  return (
    <section className="py-24 bg-background relative transition-colors duration-500 overflow-hidden">
      {/* Decorative ambient gold glows */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="type-eyebrow">Bespoke Bookings</span>
          <h2 className="type-h2 text-foreground mt-2">
            Curated Coffee Experiences
          </h2>
          <p className="type-body-sm text-neutral-500 dark:text-zinc-500 mt-2">
            Elevate your events with our custom espresso bars, private masterclasses, and hands-on roasting workshops.
          </p>
        </div>

        {/* Tab Buttons Selector */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-full border border-card-border p-1 bg-card/60 backdrop-blur-md shadow-sm">
            {EXPERIENCES.map((exp, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={exp.id}
                  onClick={() => setActiveIndex(index)}
                  className={`relative rounded-full px-5 py-2 type-ui transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "text-white font-bold z-10"
                      : "text-neutral-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {exp.eyebrow}
                  {isActive && (
                    <motion.div
                      layoutId="activeEventTab"
                      className="absolute inset-0 bg-[#2E5A44] rounded-full -z-10 shadow-md"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Showcase Container */}
        <div className="rounded-2xl border border-card-border bg-card p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 glassmorphism-green shadow-2xl">
          {/* Internal background glowing ball */}
          <div className="absolute -top-1/4 -right-1/4 w-[350px] h-[350px] bg-[#2E5A44]/5 blur-[100px] rounded-full pointer-events-none" />

          {/* Left Content Column */}
          <div className="flex-1 space-y-6 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeExp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div>
                  <span className="type-eyebrow text-emerald-600 dark:text-emerald-400 font-bold">
                    {activeExp.eyebrow} Experience
                  </span>
                  <h3 className="type-h2 text-foreground leading-tight mt-1">
                    {activeExp.title}
                  </h3>
                </div>

                <p className="type-body-sm text-neutral-600 dark:text-zinc-300 leading-relaxed">
                  {activeExp.description}
                </p>

                {/* Event Features */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] tracking-[0.2em] font-sans font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
                    Experience Highlights
                  </span>
                  <ul className="space-y-2.5">
                    {activeExp.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-neutral-500 dark:text-zinc-400 type-body-sm">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2E5A44]/10 text-[#2E5A44] dark:text-emerald-400 border border-emerald-500/20 mt-0.5">
                          <Check size={11} className="stroke-[3]" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Event Metrics Table */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-card-border">
                  {activeExp.metrics.map((metric, i) => (
                    <div key={i} className="space-y-1">
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-sans tracking-wider uppercase block">
                        {metric.label}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href={`/reservations?type=${activeExp.id}`}
                    className="type-ui group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#2E5A44] px-8 py-3.5 text-white font-semibold transition-all duration-300 hover:bg-[#234533] hover:shadow-[0_0_30px_rgba(46,90,68,0.25)] active:scale-95 cursor-pointer"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
                    <span className="relative flex items-center gap-2">
                      Configure Experience
                      <Calendar size={13} className="transition-transform duration-300 group-hover:scale-110" />
                    </span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Image Column */}
          <div className="w-full lg:w-[450px] shrink-0 relative">
            <div className="absolute -inset-2 bg-[#2E5A44]/5 rounded-2xl filter blur-md pointer-events-none" />
            
            <div className="relative h-[340px] md:h-[400px] w-full rounded-xl overflow-hidden border border-card-border bg-neutral-900 shadow-lg">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeExp.id}
                  src={activeExp.image}
                  alt={activeExp.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </AnimatePresence>
              
              {/* Dark overlay and subtle gold lighting */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

