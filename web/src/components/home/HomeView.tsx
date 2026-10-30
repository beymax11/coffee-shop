"use client";

import React, { useState } from "react";
import { PageTransition } from "@/components/animations";
import { HomeHero } from "@/components/hero/HomeHero";
import { RoastingExperience } from "@/components/sections/RoastingExperience";
import { LoyaltyPreviewSection } from "@/components/sections/LoyaltyPreviewSection";
import { SignatureShowcase } from "@/components/sections/SignatureShowcase";
import { EventShowcase } from "@/components/sections/EventShowcase";
import { EventsUpdates } from "@/components/sections/EventsUpdates";
import { LifestyleGrid } from "@/components/sections/LifestyleGrid";
import { ClosingBand } from "@/components/sections/ClosingBand";
import { QuickViewModal } from "@/components/menu/QuickViewModal";
import { MenuItem } from "@/types";

const SHOW_EXTRA_SECTIONS = false;

export function HomeView() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = (item: MenuItem) => {
    setSelectedItem(item);
    setIsQuickViewOpen(true);
  };

  return (
    <PageTransition>
      <HomeHero />
      <RoastingExperience />
      <LoyaltyPreviewSection />
      {SHOW_EXTRA_SECTIONS && (
        <div className="hidden">
          <SignatureShowcase onQuickView={handleQuickView} />
          <EventShowcase />
          <EventsUpdates />
          <LifestyleGrid />
        </div>
      )}
      <ClosingBand />
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        item={selectedItem}
      />
    </PageTransition>
  );
}

