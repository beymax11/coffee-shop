"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Film, Sparkles } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations";
import { db } from "@/utils/db";
import { MenuItem } from "@/types";
import { supabase } from "@/utils/supabase";
import { getCachedData } from "@/utils/cache";

interface SignatureShowcaseProps {
  onQuickView: (item: MenuItem) => void;
}

export const SignatureShowcase: React.FC<SignatureShowcaseProps> = ({ onQuickView }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      } else {
        setScrollProgress(0);
      }
    }
  };

  const fetchMenuItems = async () => {
    try {
      const data = await getCachedData("menu_items", async () => {
        if (supabase) {
          const { data: dbData, error } = await supabase
            .from("menu_items")
            .select("*")
            .order("name");
          if (!error && dbData) {
            return dbData as MenuItem[];
          } else if (error) {
            console.error("Supabase select error:", error);
          }
        }
        return db.getMenuItems();
      });
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
      setItems(db.getMenuItems());
    }
  };

  useEffect(() => {
    fetchMenuItems();
    const handleStorage = (e: Event) => {
      const storageEvent = e as StorageEvent;
      if (storageEvent.key === undefined || storageEvent.key === "menu_items" || storageEvent.key === null) {
        fetchMenuItems();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === "left"
        ? scrollLeft - clientWidth * 0.75
        : scrollLeft + clientWidth * 0.75;

      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth"
      });
    }
  };

  // Extract signature items filtering by tags (Best Seller or Signature)
  const signatures = items.filter((item) => {
    if (!item.tags) return false;
    return item.tags.some(tag => {
      const lower = tag.toLowerCase();
      return lower === "best seller" || lower === "signature";
    });
  });

  return (
    <section className="py-12 md:py-20 bg-background dark:bg-black text-foreground dark:text-white relative border-y border-card-border dark:border-zinc-900 transition-colors duration-500 overflow-hidden">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none dark:hidden" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none dark:hidden" />

      <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">

        {/* Header Block */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-8 md:mb-14 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Film size={12} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-sans font-bold tracking-[0.25em] text-emerald-600 dark:text-emerald-400 uppercase">
                Antonioni Grounds · Special Reserve
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground dark:text-zinc-100 tracking-tight leading-tight">
              Our Signature Pourings
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-4 text-sm md:text-base leading-relaxed">
              Every extraction is a meticulously directed scene. Experience our curated espresso masterpieces, crafted with cinematic precision, premium single-origin beans, and rare botanicals.
            </p>
          </div>

          <div>
            <Link
              href="/menu"
              className="group flex items-center gap-2 rounded-full border border-card-border dark:border-zinc-800 bg-card/50 dark:bg-zinc-900/50 hover:bg-background dark:hover:bg-zinc-900 px-6 py-3 text-xs font-bold tracking-wider uppercase text-zinc-700 dark:text-zinc-200 hover:border-emerald-500/50 transition-all duration-300"
            >
              <span>View Full Menu</span>
              <ArrowRight size={14} className="text-emerald-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Cards Grid / Carousel */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <StaggerContainer className="flex gap-6 w-full">
            {signatures.map((item) => {
              return (
                <StaggerItem
                  key={item.id}
                  className="w-[85%] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] snap-start flex-shrink-0 flex flex-col"
                >
                  <div
                    onClick={() => onQuickView(item)}
                    className="group relative flex flex-col justify-between rounded-2xl border border-card-border dark:border-zinc-900 bg-card dark:bg-zinc-950/40 overflow-hidden transition-all duration-500 hover:border-emerald-500/35 hover:bg-card/90 dark:hover:bg-zinc-900/30 hover:shadow-[0_0_35px_rgba(46,90,68,0.06)] dark:hover:shadow-[0_0_40px_rgba(46,90,68,0.08)] cursor-pointer h-full"
                  >
                    {/* Widescreen Photo Area */}
                    <div className="relative aspect-square w-full overflow-hidden bg-zinc-900 dark:bg-zinc-950 border-b border-card-border dark:border-zinc-900">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-[0.5deg]"
                        loading="lazy"
                      />

                      {/* Dark Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                      {/* Lens Shutter Focus Marks */}
                      <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-emerald-500/30 transition-colors duration-300 group-hover:border-emerald-500/80" />
                      <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-emerald-500/30 transition-colors duration-300 group-hover:border-emerald-500/80" />
                      <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-emerald-500/30 transition-colors duration-300 group-hover:border-emerald-500/80" />
                      <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-emerald-500/30 transition-colors duration-300 group-hover:border-emerald-500/80" />

                      {/* Interactive Shutter Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <span className="flex items-center justify-center rounded-full bg-[#2E5A44] p-3 text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(46,90,68,0.4)]">
                          <Eye size={16} />
                        </span>
                      </div>
                    </div>

                    {/* Details Container */}
                    <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-5 md:p-6">
                      <div>
                        {/* Drink Title */}
                        <h3 className="text-xs sm:text-base font-sans font-extrabold tracking-tight text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 line-clamp-1 sm:line-clamp-2">
                          {item.name}
                        </h3>

                        {/* Category */}
                        <div className="mt-1">
                          <span className="text-[8px] sm:text-[9px] font-sans font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                            {item.category}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Price & Action Row */}
                      <div className="flex items-center justify-between border-t border-card-border dark:border-zinc-900 pt-2.5 mt-3 sm:pt-4 sm:mt-4">
                        <span className="text-xs sm:text-base font-sans font-extrabold text-[#2E5A44] dark:text-emerald-400">
                          ₱{item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        {/* Sleek Horizontal Scroll Progress Indicator Bar */}
        {signatures.length > 4 && (
          <div className="mt-6 flex flex-col items-center justify-center gap-2">
            <div
              onClick={(e) => {
                if (scrollContainerRef.current) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const { scrollWidth, clientWidth } = scrollContainerRef.current;
                  scrollContainerRef.current.scrollTo({
                    left: percentage * (scrollWidth - clientWidth),
                    behavior: "smooth"
                  });
                }
              }}
              className="relative h-2 w-48 sm:w-64 bg-emerald-500/10 dark:bg-zinc-800/80 rounded-full overflow-hidden cursor-pointer backdrop-blur-md border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 shadow-inner group"
            >
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#2E5A44] via-emerald-500 to-[#489871] rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(46,90,68,0.6)]"
                style={{ width: `${Math.max(25, scrollProgress)}%` }}
              />
            </div>
            <span className="text-[9px] font-sans font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
              Scroll to explore
            </span>
          </div>
        )}

      </div>
    </section>
  );
};
