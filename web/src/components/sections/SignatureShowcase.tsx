"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star, Eye } from "lucide-react";
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
    <section className="py-24 bg-[#111111] relative border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="type-eyebrow">Curated Masterpieces</span>
            <h2 className="type-h2 text-white mt-2">
              Our Signature Pourings
            </h2>
          </div>
          <Link
            href="/menu"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 type-ui text-white hover:border-brand-gold/50 hover:bg-white/10 transition-all"
          >
            View Full Menu
            <ArrowRight size={14} className="text-brand-gold" />
          </Link>
        </div>

        {/* Cards Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {signatures.map((item) => {
            return (
              <StaggerItem key={item.id} className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-[#161616] p-4 transition-all hover:border-brand-gold/30 hover:bg-[#1c1c1c] gold-glow-hover">
                
                {/* Photo area */}
                <div 
                  onClick={() => onQuickView(item)}
                  className="relative h-60 w-full overflow-hidden rounded-xl bg-zinc-900 mb-6 cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Dark gradient overlap */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161616]/40 to-transparent" />
                  
                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <span className="flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-black hover:scale-105 active:scale-95 transition-all shadow-lg font-medium type-ui gold-glow">
                      <Eye size={14} />
                      View Details
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div 
                  onClick={() => onQuickView(item)}
                  className="flex-1 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="type-eyebrow">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Star size={12} className="fill-brand-gold text-brand-gold" />
                        <span className="type-caption font-medium text-zinc-300">{item.rating}</span>
                      </div>
                    </div>

                    <h3 className="type-card-title font-bold text-white mt-2 group-hover:text-brand-gold transition-colors">
                      {item.name}
                    </h3>
                    
                    <p className="type-body-sm text-zinc-400 mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                    <span className="type-price text-brand-gold font-semibold">
                      ${item.price.toFixed(2)}
                    </span>
                    
                    <span
                      className="type-ui text-zinc-400 group-hover:text-white flex items-center gap-1.5 transition-colors font-medium"
                    >
                      View Details
                      <ArrowRight size={12} className="text-brand-gold transition-transform group-hover:translate-x-1" />
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
