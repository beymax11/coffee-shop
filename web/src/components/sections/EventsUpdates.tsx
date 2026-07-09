"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations";
import { EventItem } from "@/types";
import { db } from "@/utils/db";
import { supabase } from "@/utils/supabase";


export const EventsUpdates: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from("events_updates")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          const mapped = data.map((event: {
            id: string;
            category: string;
            title: string;
            description: string;
            highlight: string;
            image: string;
            link: string;
            link_label?: string;
            linkLabel?: string;
          }) => ({
            id: event.id,
            category: event.category,
            title: event.title,
            description: event.description,
            highlight: event.highlight,
            image: event.image,
            link: event.link,
            linkLabel: event.link_label || event.linkLabel || "Explore More"
          }));
          setEvents(mapped);
          setLoading(false);
          return;
        } else if (error) {
          console.error("Supabase select error for events updates section:", error);
        }
      }
    } catch (err) {
      console.error("Exception loading events updates section from Supabase:", err);
    }
    
    // Fallback to local storage db
    setEvents(db.getEvents());
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchEvents());
    const handleStorageChange = () => {
      fetchEvents();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-background border-t border-card-border relative overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
          <p className="text-xs text-neutral-500 font-sans tracking-widest uppercase">Loading happenings...</p>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null; // Don't render anything if there are no events
  }

  return (
    <section className="py-24 bg-background border-t border-card-border relative transition-colors duration-500 overflow-hidden">
      {/* Decorative ambient gold glows */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />

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
          {events.map((event) => {
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
                    
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] tracking-[0.25em] font-sans font-bold uppercase text-emerald-600 dark:text-emerald-400">
                          {event.category}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-zinc-700 hidden sm:inline" />
                        <span className="text-[11px] font-sans text-neutral-400 dark:text-zinc-500">
                          {event.highlight}
                        </span>
                      </div>
                      
                      <h3 className="type-h3 text-foreground font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                        {event.title}
                      </h3>
                      
                      <p className="type-body text-neutral-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-card-border/50">
                      <Link
                        href={event.link}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-foreground hover:text-emerald-500 transition-colors duration-300 group/link"
                      >
                        {event.linkLabel}
                        <ArrowUpRight
                          size={14}
                          className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 text-emerald-500"
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
