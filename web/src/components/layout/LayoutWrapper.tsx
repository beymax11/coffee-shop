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

  const [isLoggedInCustomer, setIsLoggedInCustomer] = useState(false);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (pathname?.startsWith("/admin")) return;

      const getCookie = (name: string): string | null => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          const val = parts.pop()?.split(";").shift();
          return val && val !== "false" && val !== "" ? val : null;
        }
        return null;
      };

      const localCustomer = typeof window !== "undefined" ? localStorage.getItem("customer_session") : null;
      const cookieCustomer = getCookie("customer_session");
      const hasCustomer = !!localCustomer || !!cookieCustomer;
      const hasAdmin = !!localStorage.getItem("admin_session");
      const active = await getMaintenanceMode(true);

      // Maintenance view will ONLY trigger for logged-in customer accounts
      setIsLoggedInCustomer(hasCustomer && !hasAdmin);
      setIsMaintenanceActive(active);
    };

    // Evaluate session status on client-side mount
    checkStatus();

    // Poll every 2 seconds to ensure rapid synchronization upon login/logout
    const interval = setInterval(checkStatus, 2000);

    const handleMaintenanceChange = () => {
      checkStatus();
    };

    window.addEventListener("storage", handleMaintenanceChange);
    window.addEventListener("maintenance_mode_changed", handleMaintenanceChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleMaintenanceChange);
      window.removeEventListener("maintenance_mode_changed", handleMaintenanceChange);
    };
  }, [pathname]);

  if (isAdmin) {
    return (
      <main className="flex-1 flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        {children}
        <Toaster position="top-center" closeButton />
      </main>
    );
  }

  // Display Maintenance Screen ONLY if Maintenance Mode is ON AND customer is logged in
  if (isLoggedInCustomer && isMaintenanceActive) {
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
