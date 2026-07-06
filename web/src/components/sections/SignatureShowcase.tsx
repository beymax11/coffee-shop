"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star, Eye, Film, Sparkles } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { db } from "@/utils/db";
import { MenuItem } from "@/types";

interface SignatureShowcaseProps {
  onQuickView: (item: MenuItem) => void;
}

export const SignatureShowcase: React.FC<SignatureShowcaseProps> = ({ onQuickView }) => {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    setItems(db.getMenuItems());
    const handleStorage = () => {
      setItems(db.getMenuItems());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Extract signature items
  const signatures = items.filter((item) => item.category === "Signature Drinks").slice(0, 3);

  return (
    <section className="py-28 bg-background-alt dark:bg-[#0a0a0a] text-foreground dark:text-white relative border-y border-card-border dark:border-zinc-900 transition-colors duration-500 overflow-hidden">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#2E5A44]/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Large Backdrop Watermark Text */}
      <div className="absolute -bottom-10 left-10 text-[10rem] font-serif font-black text-zinc-300/10 dark:text-zinc-900/10 pointer-events-none select-none tracking-wider hidden lg:block uppercase">
        Antonioni
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-20 gap-8">
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
              Every extraction is a meticulously directed scene. Experience our three curated espresso masterpieces, crafted with cinematic precision, premium single-origin beans, and rare botanicals.
            </p>
          </div>
          
          <Link
            href="/menu"
            className="group flex items-center gap-2 rounded-full border border-card-border dark:border-zinc-800 bg-card/50 dark:bg-zinc-900/50 hover:bg-background dark:hover:bg-zinc-900 px-6 py-3 text-xs font-bold tracking-wider uppercase text-zinc-700 dark:text-zinc-200 hover:border-emerald-500/50 transition-all duration-300"
          >
            <span>View Full Menu</span>
            <ArrowRight size={14} className="text-emerald-500 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Cards Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {signatures.map((item) => {
            return (
              <StaggerItem 
                key={item.id} 
                className="group relative flex flex-col justify-between rounded-xl border border-card-border dark:border-zinc-900 bg-card dark:bg-zinc-950 p-5 transition-all duration-500 hover:border-emerald-500/30 hover:bg-background/40 dark:hover:bg-zinc-900/40 hover:shadow-[0_0_40px_rgba(46,90,68,0.05)] dark:hover:shadow-[0_0_40px_rgba(46,90,68,0.08)]"
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
                    <span className="flex items-center gap-2 rounded-full bg-[#2E5A44] px-5 py-2.5 text-white hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(46,90,68,0.4)]">
                      <Eye size={14} />
                      Inspect Scene
                    </span>
                  </div>
                </div>

                {/* Details Container */}
                <div 
                  onClick={() => onQuickView(item)}
                  className="flex-1 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Category & Rating Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Sparkles size={10} className="text-emerald-500" />
                        <span className="text-[10px] font-sans font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-background dark:bg-zinc-900/80 px-2 py-0.5 rounded border border-card-border dark:border-zinc-800">
                        <Star size={10} className="fill-emerald-500 text-emerald-500" />
                        <span className="text-[10px] font-mono font-medium text-zinc-600 dark:text-zinc-300">
                          {item.rating.toFixed(1)}
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

                    {/* Curated Tasting Profile Notes */}
                    {item.notes && (
                      <div className="mt-4 pt-4 border-t border-card-border dark:border-zinc-900 flex flex-col gap-1.5 bg-background-alt/30 dark:bg-zinc-950/20 rounded-md">
                        <span className="text-[9px] uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                          Director's Notes
                        </span>
                        <p className="text-[11px] italic text-zinc-600 dark:text-zinc-400 leading-normal">
                          "{item.notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Price & Action Row */}
                  <div className="flex items-center justify-between border-t border-card-border dark:border-zinc-900 pt-4 mt-6">
                    <span className="text-lg font-serif text-emerald-600 dark:text-emerald-400 font-semibold">
                      ${item.price.toFixed(2)}
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
    </section>
  );
};
