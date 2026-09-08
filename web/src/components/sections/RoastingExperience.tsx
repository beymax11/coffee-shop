"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp } from "@/components/animations";

interface Step {
  id: string;
  number: string;
  label: string;
  title: string;
  description: string;
  image: string;
  ctaLink: string;
  ctaLabel: string;
}

const STEPS: Step[] = [
  {
    id: "story",
    number: "01",
    label: "Who We Are",
    title: "Nice to meet you!",
    description:
      "Antonioni Grounds is named after Maru “Antonioni,” a beloved son, brother, and friend. Every cup we make carries his love for brewed coffee, and the idea he always had: that coffee is best when it’s shared.",
    image: "/kape.jpg",
    ctaLink: "/brew-buggy",
    ctaLabel: "Meet the Brew Buggy",
  },
  {
    id: "blend",
    number: "02",
    label: "What We Pour",
    title: "Batangas Robusta + Excelsa",
    description:
      "Our beans come from Batangas. Robusta + Excelsa. Antonioni’s favorite blend, still the one we use today.",
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop",
    ctaLink: "/about",
    ctaLabel: "About us",
  },
];

export const RoastingExperience: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = STEPS[activeStepIndex];

  return (
    <section className="py-12 md:py-20 bg-background dark:bg-black text-foreground border-t border-card-border relative transition-colors duration-500 overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-3xl pointer-events-none dark:hidden" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-3xl pointer-events-none dark:hidden" />

      <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left Col: Cinematic Image */}
          <div className="hidden lg:block relative">
            {/* Glowing background container */}
            <div className="absolute -inset-4 bg-[#2E5A44]/5 rounded-3xl filter blur-xl opacity-75 pointer-events-none dark:hidden" />

            <FadeUp className="relative h-[460px] md:h-[520px] rounded-2xl overflow-hidden border border-card-border shadow-2xl group bg-neutral-900">
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
            </FadeUp>
          </div>

          {/* Right Col: Details & Interactive Steps */}
          <div className="space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <FadeUp>
                <div className="flex items-center gap-2">
                  <span className="type-eyebrow text-emerald-600 dark:text-emerald-400">Our Story</span>

                </div>
                <h2 className="type-h2 text-2xl sm:text-4xl text-foreground mt-2 leading-snug">
                  Behind Every Cup We Pour
                </h2>
              </FadeUp>
            </div>

            {/* Interactive Step Navigator (Maximized 2-column layout) */}
            <div className="border-b border-card-border pb-2">
              <div className="grid grid-cols-2 gap-4">
                {STEPS.map((step, index) => {
                  const isActive = index === activeStepIndex;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStepIndex(index)}
                      className={`relative pb-4 flex items-center gap-3 text-left cursor-pointer transition-all duration-300 group outline-none`}
                    >
                      <span
                        className={`font-serif text-xl md:text-2xl transition-all duration-300 ${isActive ? "text-emerald-600 dark:text-emerald-400 scale-105 font-bold" : "text-neutral-400 dark:text-zinc-500 hover:text-foreground"
                          }`}
                      >
                        {step.number}
                      </span>
                      <div className="flex flex-col">
                        <span
                          className={`font-sans text-xs sm:text-sm tracking-wider font-bold uppercase transition-all duration-300 ${isActive ? "text-foreground" : "text-neutral-400 dark:text-zinc-500 hover:text-foreground"
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

            {/* Step Description */}
            <div className="min-h-[140px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  <h3 className="type-h3 text-foreground font-serif tracking-tight text-xl md:text-2xl">
                    {activeStep.title}
                  </h3>
                  <p className="type-body text-neutral-500 dark:text-zinc-400 leading-relaxed text-sm md:text-base">
                    {activeStep.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* CTA Button */}
            <FadeUp delay={0.1} className="pt-4 border-t border-card-border">
              <Link
                href={activeStep.ctaLink}
                className="inline-flex items-center gap-2 type-ui font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 group transition-colors duration-300"
              >
                {activeStep.ctaLabel}
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  );
};
