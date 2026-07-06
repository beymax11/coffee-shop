"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Flame, Coffee, Info, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp } from "@/components/animations";

interface Step {
  id: string;
  number: string;
  label: string;
  title: string;
  description: string;
  image: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  metrics: {
    label: string;
    value: string;
  }[];
  notes: string;
}

const STEPS: Step[] = [
  {
    id: "sourcing",
    number: "01",
    label: "Sourcing",
    title: "The Reserve Selection",
    description:
      "Every lot in the Antonioni Reserve is hand-picked after cupping 300+ samples each season. We work directly with family estates in Boquete and Sidama—paying well above Fair Trade so growers can invest in shade canopy and slow cherry drying. Only microlots scoring 88+ on the SCA scale earn a place on our menu.",
    image:
      "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=1200&auto=format&fit=crop",
    icon: Compass,
    metrics: [
      { label: "Cupping Score", value: "88+ SCA Minimum" },
      { label: "Partner Farms", value: "12 Direct Estates" },
      { label: "Annual Samples", value: "300+ Cupped" },
    ],
    notes:
      "Panama Geisha and Ethiopian heirloom varieties arrive as fully traceable microlots—never blended for volume.",
  },
  {
    id: "roasting",
    number: "02",
    label: "Roasting",
    title: "Brooklyn Copper Roastery",
    description:
      "Our roasting headquarters in Brooklyn houses custom copper drum roasters built for 5kg micro-batches. Each profile is roasted to first crack only—preserving fruit sugars and floral aromatics that mass roasting burns away. High-frequency sensors log every degree, so no two harvests are treated the same.",
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop",
    icon: Flame,
    metrics: [
      { label: "Roast Style", value: "Light, First Crack" },
      { label: "Batch Size", value: "5kg Micro-lots" },
      { label: "Roaster", value: "Custom Copper Drums" },
    ],
    notes:
      "Beans rest 48 hours post-roast in our climate-controlled cellar before shipping to Tokyo, New York, and Reserve members.",
  },
  {
    id: "shop",
    number: "03",
    label: "Coffee Shop",
    title: "Antonioni Grounds Coffee Shop",
    description:
      "Antonioni Grounds coffee shops are designed as sensory sanctuaries. Blending Japanese minimalism with warm lighting and matte surfaces, our spaces offer a deliberate quietude to appreciate coffee. Baristas pour each Reserve lot by hand—water at 92°C, a 1:16 ratio, and pulse pours timed to the second, paired with our in-house artisanal patisserie.",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop",
    icon: Coffee,
    metrics: [
      { label: "Water Temp", value: "92°C Extraction" },
      { label: "Brew Ratio", value: "1:16 Golden Ratio" },
      { label: "Locations", value: "Tokyo · Brooklyn · NY" },
    ],
    notes:
      "Reserve a table or book our bespoke coffee service for private events across New York, Paris, and Tokyo.",
  },
];

export const RoastingExperience: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = STEPS[activeStepIndex];

  return (
    <section className="py-24 bg-background text-foreground border-t border-card-border relative transition-colors duration-500 overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Left Col: Cinematic Image and Glass Card */}
          <div className="relative">
            {/* Glowing background container */}
            <div className="absolute -inset-4 bg-[#2E5A44]/5 rounded-3xl filter blur-xl opacity-75 pointer-events-none" />
            
            <FadeUp className="relative h-[540px] md:h-[600px] rounded-2xl overflow-hidden border border-card-border shadow-2xl group bg-neutral-900">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeStep.id}
                  src={activeStep.image}
                  alt={activeStep.label}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </AnimatePresence>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

              {/* Overlay Glass Card */}
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-xl glassmorphism border border-black/5 dark:border-white/10 shadow-lg text-neutral-900 dark:text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] tracking-[0.2em] font-sans font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    {activeStep.label} metrics
                  </span>
                  <div className="h-[1px] w-12 bg-emerald-500/40" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {activeStep.metrics.map((metric, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans tracking-wide uppercase">{metric.label}</p>
                      <p className="text-sm font-semibold font-serif text-neutral-900 dark:text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>

          {/* Right Col: Details & Interactive Steps */}
          <div className="space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <FadeUp>
                <div className="flex items-center gap-2">
                  <span className="type-eyebrow text-emerald-600 dark:text-emerald-400">The Antonioni Reserve</span>
                  <div className="h-[1px] w-8 bg-[#2E5A44]/30" />
                </div>
                <h2 className="type-h2 text-foreground mt-2 leading-snug">
                  From Volcanic Soil to the Coffee Shop
                </h2>
              </FadeUp>
            </div>

            {/* Interactive Step Navigator */}
            <div className="border-b border-card-border pb-2">
              <div className="flex justify-between md:justify-start gap-4 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth">
                {STEPS.map((step, index) => {
                  const isActive = index === activeStepIndex;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStepIndex(index)}
                      className={`relative pb-4 flex items-center gap-2 text-left cursor-pointer transition-all duration-300 group outline-none shrink-0`}
                    >
                      <span
                        className={`font-serif text-lg md:text-xl transition-all duration-300 ${
                          isActive ? "text-emerald-600 dark:text-emerald-400 scale-105 font-bold" : "text-neutral-400 dark:text-zinc-500 hover:text-foreground"
                        }`}
                      >
                        {step.number}
                      </span>
                      <div className="flex flex-col">
                        <span
                          className={`font-sans text-[10px] tracking-widest font-bold uppercase transition-all duration-300 ${
                            isActive ? "text-foreground" : "text-neutral-400 dark:text-zinc-500 hover:text-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      
                      {/* Active Indicator Underline */}
                      {isActive && (
                        <motion.div
                          layoutId="activeStepIndicator"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step Description & Custom Info */}
            <div className="min-h-[220px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <h3 className="type-h3 text-foreground font-serif tracking-tight text-xl md:text-2xl">
                    {activeStep.title}
                  </h3>
                  <p className="type-body text-neutral-500 dark:text-zinc-400 leading-relaxed">
                    {activeStep.description}
                  </p>

                  {/* Informational Callout */}
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-card-border bg-card/50 backdrop-blur-sm">
                    <Info size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <p className="type-caption text-xs text-neutral-500 dark:text-zinc-400">
                      {activeStep.notes}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* CTA Button */}
            <FadeUp delay={0.1} className="pt-4 border-t border-card-border">
              <div className="flex items-center justify-between">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 type-ui font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 group transition-colors duration-300"
                >
                  Explore Our Heritage
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveStepIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length)}
                    className="p-2 rounded-full border border-card-border hover:border-emerald-500 hover:text-emerald-500 transition-all duration-300 text-neutral-400 dark:text-zinc-500 cursor-pointer flex items-center justify-center"
                  >
                    <ChevronRight size={16} className="rotate-180" />
                  </button>
                  <button 
                    onClick={() => setActiveStepIndex((prev) => (prev + 1) % STEPS.length)}
                    className="p-2 rounded-full border border-card-border hover:border-emerald-500 hover:text-emerald-500 transition-all duration-300 text-neutral-400 dark:text-zinc-500 cursor-pointer flex items-center justify-center"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  );
};
