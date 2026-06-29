"use client";

import React, { useState } from "react";
import { PageTransition } from "@/components/animations";
import { HomeHero } from "@/components/hero/HomeHero";
import { RoastingExperience } from "@/components/sections/RoastingExperience";
import { SignatureShowcase } from "@/components/sections/SignatureShowcase";
import { EventShowcase } from "@/components/sections/EventShowcase";
import { LifestyleGrid } from "@/components/sections/LifestyleGrid";
import { QuickViewModal } from "@/components/shared/QuickViewModal";
import { MenuItem, Product } from "@/types";

export function HomeView() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = (item: MenuItem | Product) => {
    setSelectedItem(item);
    setIsQuickViewOpen(true);
  };

  return (
    <PageTransition>
      <HomeHero />
      <RoastingExperience />
      <SignatureShowcase onQuickView={handleQuickView} />
      <EventShowcase />
      <LifestyleGrid />
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        item={selectedItem}
      />
    </PageTransition>
  );
}
