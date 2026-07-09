"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { Toaster } from "@/components/ui/sonner";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        {children}
        <Toaster position="top-center" closeButton />
      </main>
    );
  }

  return (
    <>
      {/* Navigation header bar */}
      <Navbar />

      {/* Main application page content */}
      <main className="flex-1 flex flex-col pt-[72px] md:pt-[80px]">
        {children}
      </main>

      {/* Brand footer */}
      <Footer />
      <Toaster position="top-center" closeButton />
    </>
  );
}
