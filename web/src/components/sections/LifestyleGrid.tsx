"use client";

import React from "react";
import { FadeUp } from "@/components/animations";

export const LifestyleGrid: React.FC = () => {
  const images = [
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop"
  ];

  return (
    <section className="py-24 bg-background border-t border-card-border transition-colors duration-500">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="type-eyebrow">Social Curation</span>
          <h2 className="type-h2 text-foreground mt-2">
            L&apos;OR NOIR Lifestyle
          </h2>
          <p className="type-caption text-neutral-500 dark:text-zinc-500 mt-2">Tag @LORNOIR_CAFE to be featured in our monthly selection.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url, idx) => (
            <FadeUp key={idx} delay={idx * 0.1} className="relative h-64 rounded-xl overflow-hidden group border border-card-border">
              <img
                src={url}
                alt={`Instagram Showcase ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                <span className="type-eyebrow border border-brand-gold/30 rounded px-3 py-1 bg-black/40">
                  View Post
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
};
