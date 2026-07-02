"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Award, MapPin } from "lucide-react";
import { FadeUp } from "@/components/animations";

export const RoastingExperience: React.FC = () => {
  return (
    <section className="py-24 bg-background text-foreground border-t border-card-border relative transition-colors duration-500">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Col: Cinematic Photo Stack */}
          <FadeUp className="relative h-[480px] rounded-2xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop"
              alt="Coffee Beans Selection"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Overlay Glass Card */}
            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-xl bg-black/70 border border-card-border backdrop-blur-md">
              <span className="type-eyebrow">Microlot Sourcing</span>
              <h4 className="type-card-title text-white mt-1">Geisha Boquete Reserve</h4>
              <p className="type-caption text-zinc-400 mt-1">
                Slow-dry natural fermentation at 1,850 meters elevation, roasted precisely to release notes of jasmine flower and stone peach.
              </p>
            </div>
          </FadeUp>

          {/* Right Col: Details */}
          <div className="space-y-6">
            <FadeUp>
              <span className="type-eyebrow">Artisanal Dedication</span>
              <h2 className="type-h2 text-foreground mt-2 leading-snug">
                The Roasting Art: Crafted Without Compromise
              </h2>
            </FadeUp>

            <FadeUp delay={0.1}>
              <p className="type-body text-neutral-500 dark:text-zinc-400">
                At L&apos;OR NOIR, roasting is treated as an aesthetic translation. We trace each bean back to single-family microlots across Panama, Ethiopia, and Japan. Our master roasters monitor air pressure, temperature, and moisture millisecond by millisecond, extracting the pure floral and cacao notes native to the volcanic soils.
              </p>
              <p className="type-body text-neutral-500 dark:text-zinc-400 mt-4">
                We invite you to participate in this daily ritual: coffee brewed under gravity, served in hand-thrown clay mugs, designed to slow time.
              </p>
            </FadeUp>

            <FadeUp delay={0.2} className="pt-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-brand-gold/10 p-2 text-brand-gold">
                  <Award size={18} />
                </div>
                <div>
                  <h5 className="type-label text-foreground">Award-Winning Blends</h5>
                  <p className="type-caption text-neutral-500 dark:text-zinc-500">Cup of Excellence Gold</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-brand-gold/10 p-2 text-brand-gold">
                  <MapPin size={18} />
                </div>
                <div>
                  <h5 className="type-label text-foreground">Direct Sourcing</h5>
                  <p className="type-caption text-neutral-500 dark:text-zinc-500">Ethical Fair-Trade Microlots</p>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.3} className="pt-6">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 type-eyebrow text-brand-gold hover:text-brand-gold-hover group"
              >
                Discover Our Sourcing Journey
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  );
};
