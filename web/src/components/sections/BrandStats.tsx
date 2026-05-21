"use client";

import React from "react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { CountUp } from "@/components/animations";

export const BrandStats: React.FC = () => {
  const stats = [
    { value: 12, suffix: "+", label: "Roasting Awards Won" },
    { value: 100, suffix: "%", label: "Single-Origin Certified" },
    { value: 4, suffix: "", label: "Global Salons" },
    { value: 15, suffix: "k+", label: "Ritual Club Members" }
  ];

  return (
    <section className="py-20 bg-[#0B0B0B] border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[100px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {stats.map((stat, idx) => (
            <StaggerItem key={idx} className="space-y-2">
              <h3 className="type-stat text-brand-gold">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </h3>
              <p className="type-micro text-zinc-500">
                {stat.label}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
