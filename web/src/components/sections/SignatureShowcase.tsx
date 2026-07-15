"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Film, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations";
import { db } from "@/utils/db";
import { MenuItem } from "@/types";
import { supabase } from "@/utils/supabase";

interface SignatureShowcaseProps {
  onQuickView: (item: MenuItem) => void;
}

export const SignatureShowcase: React.FC<SignatureShowcaseProps> = ({ onQuickView }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const fetchMenuItems = async () => {
    if (supabase) {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("name");
      if (!error && data) {
        setItems(data as MenuItem[]);
        return;
      } else if (error) {
        console.error("Supabase select error:", error);
      }
    }
    setItems(db.getMenuItems());
  };

  useEffect(() => {
    fetchMenuItems();
    const handleStorage = () => {
      fetchMenuItems();
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
    <section className="py-12 md:py-20 bg-background-alt dark:bg-[#0a0a0a] text-foreground dark:text-white relative border-y border-card-border dark:border-zinc-900 transition-colors duration-500 overflow-hidden">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Large Backdrop Watermark Text */}
      <div className="absolute -bottom-10 left-10 text-[10rem] font-serif font-black text-zinc-300/10 dark:text-zinc-900/10 pointer-events-none select-none tracking-wider hidden lg:block uppercase">
        Antonioni
      </div>

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
          
          <div className="flex items-center gap-4">
            {signatures.length > 3 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => scroll("left")}
                  className="p-2.5 rounded-full border border-card-border dark:border-zinc-800 bg-card/60 dark:bg-zinc-900/60 hover:bg-background dark:hover:bg-zinc-900 text-zinc-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white transition-all duration-300 cursor-pointer flex items-center justify-center"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => scroll("right")}
                  className="p-2.5 rounded-full border border-card-border dark:border-zinc-800 bg-card/60 dark:bg-zinc-900/60 hover:bg-background dark:hover:bg-zinc-900 text-zinc-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white transition-all duration-300 cursor-pointer flex items-center justify-center"
                  aria-label="Scroll Right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            
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
          className="overflow-x-auto pb-8 scrollbar-none scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <StaggerContainer className="flex gap-6 w-full">
            {signatures.map((item) => {
              return (
                <StaggerItem 
                  key={item.id} 
                  className="group relative flex flex-col justify-between rounded-xl border border-card-border dark:border-zinc-900 bg-card dark:bg-zinc-950 p-5 transition-all duration-500 hover:border-emerald-500/30 hover:bg-background/40 dark:hover:bg-zinc-900/40 hover:shadow-[0_0_40px_rgba(46,90,68,0.05)] dark:hover:shadow-[0_0_40px_rgba(46,90,68,0.08)] w-[85%] md:w-[calc((100%-3rem)/3)] snap-start flex-shrink-0"
                >
                  
                  {/* Widescreen Photo Area */}
                  <div 
                    onClick={() => onQuickView(item)}
                    className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-zinc-900 dark:bg-zinc-950 mb-6 cursor-pointer border border-card-border dark:border-zinc-900"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-[0.5deg]"
                    />
                    
                    {/* Dark Vignette Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                    
                    {/* Lens Shutter Focus Marks */}
                    <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-emerald-500/40 transition-colors duration-300 group-hover:border-emerald-500" />
                    <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-emerald-500/40 transition-colors duration-300 group-hover:border-emerald-500" />
                    <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-emerald-500/40 transition-colors duration-300 group-hover:border-emerald-500" />
                    <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-emerald-500/40 transition-colors duration-300 group-hover:border-emerald-500" />
                    
                    {/* Aspect Ratio Tag */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[8px] bg-black/60 backdrop-blur-md rounded border border-zinc-800/80 text-zinc-400 font-mono tracking-widest uppercase">
                      Scene {item.id.replace("m-", "").slice(0, 3)}
                    </div>
                    
                    {/* Interactive Shutter Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <span className="flex items-center justify-center rounded-full bg-[#2E5A44] p-3 text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(46,90,68,0.4)]">
                        <Eye size={16} />
                      </span>
                    </div>
                  </div>

                  {/* Details Container */}
                  <div 
                    onClick={() => onQuickView(item)}
                    className="flex-1 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Category Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Sparkles size={10} className="text-emerald-500" />
                          <span className="text-[10px] font-sans font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Drink Title */}
                      <h3 className="text-xl font-serif font-semibold text-foreground dark:text-zinc-100 mt-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                        {item.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-3 leading-relaxed font-sans">
                        {item.description}
                      </p>

                    </div>

                    {/* Price & Action Row */}
                    <div className="flex items-center justify-between border-t border-card-border dark:border-zinc-900 pt-4 mt-6">
                      <span className="text-lg font-serif text-emerald-600 dark:text-emerald-400 font-semibold">
                        ₱{item.price.toFixed(2)}
                      </span>
                      
                      <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400 group-hover:text-foreground dark:group-hover:text-zinc-200 flex items-center gap-1.5 transition-colors duration-300">
                        View Scene
                        <ArrowRight size={12} className="text-emerald-500 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>

                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

      </div>
    </section>
  );
};
