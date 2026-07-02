"use client";

import React from "react";
import { Coffee, Award, ShieldCheck, Heart, ArrowRight, Eye, Leaf } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";
import Link from "next/link";

export function AboutView() {
  const values = [
    {
      title: "Direct Sourcing Ethics",
      desc: "We skip intermediate auctions, dealing directly with individual family growers. Paying up to 80% above standard Fair Trade rates ensures sustainable livelihoods and exceptional bean care.",
      icon: Leaf,
    },
    {
      title: "Micro-Lot Roasting",
      desc: "Each crop is roasted in small 5kg batches inside our custom copper roasters. High-frequency sensors track temperature adjustments, highlighting subtle floral profiles.",
      icon: Coffee,
    },
    {
      title: "Aesthetic Quietude",
      desc: "Our global salons are designed as sensory sanctuaries. Blending Japanese minimalism with matte-black glassmorphism, we provide a silent space to appreciate coffee.",
      icon: ShieldCheck,
    }
  ];

  const timeline = [
    {
      year: "2023",
      title: "Salon Zero: Tokyo",
      desc: "Established our initial coffee studio in Aoyama, Tokyo, focusing exclusively on hand-poured geisha microlots."
    },
    {
      year: "2024",
      title: "The Roastery: Brooklyn",
      desc: "Launched our state-of-the-art roasting headquarters, housing our custom sensory cupping lab."
    },
    {
      year: "2025",
      title: "L'OR Privé Launch",
      desc: "Introduced our bespoke mobile coffee cart catering services for gala events across New York, Paris, and Tokyo."
    },
    {
      year: "2026",
      title: "Boutique Expansion",
      desc: "Releasing our signature Obsidian lifestyle merchandise and launching our global online bean reserve."
    }
  ];

  const processes = [
    {
      step: "01",
      title: "Micro-Lot Selection",
      desc: "We cup over 300 samples annually, selecting only the top 1% scoring 88+ on the Specialty Coffee Association scale."
    },
    {
      step: "02",
      title: "Acoustic Cracking",
      desc: "Our roasters roast strictly to the 'first crack', preserving fruit sugars and preventing any bitter carbon notes."
    },
    {
      step: "03",
      title: "Spherical Chilling",
      desc: "Signature iced beverages are poured over artisanal spherical slow-melt ice, preserving espresso concentration."
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-16 md:py-24 text-foreground transition-colors duration-500">

        {/* Cinematic Header Section */}
        <div className="relative h-[400px] w-full flex items-center justify-center overflow-hidden mb-20">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1600&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/60 transition-colors duration-500" />

          <div className="relative z-10 text-center max-w-2xl px-6 space-y-4">
            <span className="type-eyebrow">Antonioni Grounds Story</span>
            <h1 className="type-h1 text-foreground leading-tight">
              Our Heritage & Philosophy
            </h1>
            <p className="type-body text-neutral-500 dark:text-zinc-400 max-w-md mx-auto">
              Coffee as a translation of volcanic soil. Handcrafted roasting executed with culinary precision and architectural restraint.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 md:px-8 space-y-28">

          {/* Section 1: The Ritual Sourcing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="type-eyebrow">Origin Matters</span>
              <h2 className="type-h2 text-foreground leading-snug">
                Tracing Volcanoes & Single-Family Farms
              </h2>
              <p className="type-body text-neutral-500 dark:text-zinc-400">
                Every bean has a coordinates footprint. We source our coffee from single-family microlots nestled on high-altitude volcanic mountains. In Boquete, Panama, we partner with the Altieri family, whose Geisha crops benefit from dense volcanic soil and mist breezes. In Sidama, Ethiopia, we work with smallholder collectives who slow-dry cherries on raised bamboo beds.
              </p>
              <p className="type-body text-neutral-500 dark:text-zinc-400">
                By purchasing direct and avoiding bulk trade, we preserve the unique genetic flavors of each estate—bringing you cup experiences that resemble orange jasmine blossom and sweet peach honey.
              </p>
            </div>

            <div className="relative h-[380px] rounded-2xl overflow-hidden border border-card-border shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=800&auto=format&fit=crop"
                alt="Coffee plantation cherry picking"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Section 2: Values Cards */}
          <div className="space-y-12">
            <div className="text-center max-w-xl mx-auto">
              <span className="type-eyebrow font-sans">Corporate Ethics</span>
              <h2 className="type-h2 text-foreground mt-1">Our Core Pillars</h2>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <StaggerItem key={i} className="rounded-xl border border-card-border bg-card p-8 space-y-4 hover:border-brand-gold/20 transition-all">
                    <div className="rounded-full bg-brand-gold/10 p-3 text-brand-gold w-fit">
                      <Icon size={20} />
                    </div>
                    <h3 className="type-subheading text-foreground">{v.title}</h3>
                    <p className="type-body text-neutral-500 dark:text-zinc-400">{v.desc}</p>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>

          {/* Section 3: The Roasting Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6 lg:sticky lg:top-28">
              <span className="type-eyebrow">The Chronicles</span>
              <h2 className="type-h2 text-foreground">Chronological Growth</h2>
              <p className="type-body text-neutral-500 dark:text-zinc-400">
                From a private 4-seat espresso counter in Aoyama, Tokyo, to private fashion galas across Paris and a global roasting lab. Our path has always prioritized premium, slow curation over mass expansion.
              </p>

              <div className="pt-4">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold px-6 py-2.5 type-ui text-black hover:bg-brand-gold-hover transition-all gold-glow"
                >
                  Explore Current Menu
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="border-l border-card-border pl-8 space-y-12">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative space-y-2">
                  {/* Dot */}
                  <div className="absolute -left-[37px] top-1 h-3.5 w-3.5 rounded-full border-2 border-brand-gold bg-background" />

                  <span className="type-eyebrow">{item.year}</span>
                  <h4 className="type-subheading text-foreground">{item.title}</h4>
                  <p className="type-body text-neutral-500 dark:text-zinc-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Roasting Process steps */}
          <div className="rounded-2xl border border-card-border bg-card p-8 md:p-12 relative overflow-hidden glassmorphism-gold">
            <div className="absolute -bottom-1/4 -left-1/4 w-80 h-80 bg-brand-gold/5 blur-[90px] rounded-full pointer-events-none" />

            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="type-eyebrow">Sensory Science</span>
              <h2 className="type-h2-alt text-foreground mt-1">The Coffee Ceremony</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {processes.map((p, idx) => (
                <div key={idx} className="space-y-3 relative">
                  <span className="type-step text-brand-gold/20 block">{p.step}</span>
                  <h4 className="type-label text-foreground">{p.title}</h4>
                  <p className="type-caption text-neutral-500 dark:text-zinc-500">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
