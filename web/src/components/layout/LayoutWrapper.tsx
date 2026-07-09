"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { Toaster } from "@/components/ui/sonner";
import { MaintenanceView } from "@/components/shared/MaintenanceView";
import { getMaintenanceMode } from "@/utils/settings";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const [isCustomer, setIsCustomer] = useState(false);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const hasCustomer = !!localStorage.getItem("customer_session");
      const hasAdmin = !!localStorage.getItem("admin_session");
      const active = await getMaintenanceMode();

      console.log("[LayoutWrapper debug] checkStatus called:", {
        customerSession: localStorage.getItem("customer_session"),
        adminSession: localStorage.getItem("admin_session"),
        maintenanceMode: active,
        hasCustomer,
        hasAdmin,
        active,
        finalIsCustomer: hasCustomer && !hasAdmin
      });

      setIsCustomer(hasCustomer && !hasAdmin);
      setIsMaintenanceActive(active);
    };

    // Evaluate session status on client-side mount
    checkStatus();

    // Poll every 5 seconds to sync state changes across different profiles/browsers
    const interval = setInterval(checkStatus, 5000);

    window.addEventListener("storage", checkStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkStatus);
    };
  }, []);

  console.log("[LayoutWrapper debug] Render states:", {
    isCustomer,
    isMaintenanceActive,
    isAdmin,
    pathname
  });

  if (isAdmin) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        {children}
        <Toaster position="top-center" closeButton />
      </main>
    );
  }

  if (isCustomer && isMaintenanceActive) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 justify-center">
        <MaintenanceView />
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
