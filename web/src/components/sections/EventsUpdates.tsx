"use client";

import React from "react";
import Link from "next/link";
import { Coffee, Music, Sparkles, Calendar, ArrowUpRight } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations";

interface EventItem {
  id: string;
  category: string;
  title: string;
  description: string;
  highlight: string;
  image: string;
  link: string;
  linkLabel: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const EVENTS_DATA: EventItem[] = [
  {
    id: "new-drinks",
    category: "Seasonal Menu",
    title: "The Summer Alchemy Collection",
    description: "Indulge in our new curated seasonal creations: the Smoked Rosemary Honey Latte, Yuzu Nitro Cold Brew, and Cardamom Espresso Tonic. Crafted by our master baristas to elevate your summer palette.",
    highlight: "Available starting today",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800&auto=format&fit=crop",
    link: "/menu",
    linkLabel: "Explore Seasonal Menu",
    icon: Coffee,
  },
  {
    id: "acoustic-night",
    category: "Live Music Lounge",
    title: "Saturday Sunset Sessions",
    description: "Sip under the warm lights as local indie-acoustic acts perform live in our lounge. Unwind with our exclusive espresso cocktails and a signature patisserie tasting board.",
    highlight: "Every Saturday, 6:00 PM - 9:00 PM",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop",
    link: "/reservations?type=table",
    linkLabel: "Reserve Lounge Table",
    icon: Music,
  },
  {
    id: "limited-beans",
    category: "Microlot Release",
    title: "Yirgacheffe Kochere Anaerobic",
    description: "An extremely rare, double-fermented microlot from Gedeo, Ethiopia. Notes of wild jasmine, white peach, and a sparkling citrus acidity. Hand-roasted in 5kg micro-batches.",
    highlight: "Only 50 bags roasted weekly",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop",
    link: "/menu",
    linkLabel: "View Coffee Menu",
    icon: Sparkles,
  },
  {
    id: "holiday-hours",
    category: "Operating Hours",
    title: "Upcoming Holiday Schedule",
    description: "Please note our modified hours for the upcoming holidays. We want our hard-working baristas to spend time with their families, so we will operate on a half-day schedule.",
    highlight: "Holidays: 8:00 AM - 4:00 PM",
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=800&auto=format&fit=crop",
    link: "/contact",
    linkLabel: "Contact & Locations",
    icon: Calendar,
  },
];

export const EventsUpdates: React.FC = () => {
  return (
    <section className="py-24 bg-background border-t border-card-border relative transition-colors duration-500 overflow-hidden">
      {/* Decorative ambient gold glows */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-brand-gold/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-brand-gold/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="type-eyebrow">Events & Announcements</span>
          <h2 className="type-h2 text-foreground mt-2">
            Latest Happenings & Updates
          </h2>
          <p className="type-body-sm text-neutral-500 dark:text-zinc-500 mt-2">
            Discover our upcoming live experiences, seasonal sensory releases, and news from our roasteries.
          </p>
        </div>

        {/* Staggered Grid of Events */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {EVENTS_DATA.map((event) => {
            const Icon = event.icon;
            return (
              <StaggerItem key={event.id}>
                <div className="group rounded-2xl border border-card-border bg-card overflow-hidden glassmorphism shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col sm:flex-row h-full gold-glow-hover">
                  
                  {/* Image Column */}
                  <div className="w-full sm:w-[200px] h-[220px] sm:h-auto shrink-0 relative overflow-hidden bg-neutral-900 border-b sm:border-b-0 sm:border-r border-card-border">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:bg-gradient-to-r pointer-events-none" />
                    
                    {/* Floating Icon Badge */}
                    <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-brand-gold">
                      <Icon size={18} />
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] tracking-[0.25em] font-sans font-bold uppercase text-brand-gold">
                          {event.category}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-zinc-700 hidden sm:inline" />
                        <span className="text-[11px] font-sans text-neutral-400 dark:text-zinc-500">
                          {event.highlight}
                        </span>
                      </div>
                      
                      <h3 className="type-h3 text-foreground font-bold group-hover:text-brand-gold transition-colors duration-300">
                        {event.title}
                      </h3>
                      
                      <p className="type-body text-neutral-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-card-border/50">
                      <Link
                        href={event.link}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-foreground hover:text-brand-gold transition-colors duration-300 group/link"
                      >
                        {event.linkLabel}
                        <ArrowUpRight
                          size={14}
                          className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 text-brand-gold"
                        />
                      </Link>
                    </div>
                  </div>

                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

      </div>
    </section>
  );
};
