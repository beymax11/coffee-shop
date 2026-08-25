"use client";

import React, { useEffect } from "react";
import {
  LayoutDashboard,
  Coffee,
  Calendar,
  CreditCard,
  Camera,
  Megaphone,
  Users,
  History,
  Wrench,
  HelpCircle,
  LogOut,
  X,
  Sun,
  Moon,
  Shield,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type AdminTabType =
  | "dashboard"
  | "menu"
  | "reservations"
  | "loyalty"
  | "users"
  | "lifestyle"
  | "events"
  | "settings"
  | "audit";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AdminTabType;
  onSelectTab: (tab: AdminTabType) => void;
  currentUserRole?: "admin" | "barista";
  adminInfo: {
    name: string;
    email: string;
    initials: string;
  };
  onLogout: () => void;
  onOpenHelp: () => void;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

interface NavSectionItem {
  id: AdminTabType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  badge?: number;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavSectionItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Operations & Core",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        description: "Metrics & live stream",
        icon: LayoutDashboard,
      },
      {
        id: "menu",
        label: "Menu Offerings",
        description: "Items, prices & inventory",
        icon: Coffee,
        adminOnly: true,
      },
      {
        id: "reservations",
        label: "Bookings",
        description: "Table & experience reservations",
        icon: Calendar,
      },
      {
        id: "loyalty",
        label: "Digital Loyalty",
        description: "Member directory & stamps",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Content & Showcase",
    items: [
      {
        id: "lifestyle",
        label: "Lifestyle Posts",
        description: "Bento grid & social feeds",
        icon: Camera,
        adminOnly: true,
      },
      {
        id: "events",
        label: "Events & News",
        description: "Announcements & schedules",
        icon: Megaphone,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Management & System",
    items: [
      {
        id: "users",
        label: "User Accounts",
        description: "Roles & permissions",
        icon: Users,
        adminOnly: true,
      },
      {
        id: "audit",
        label: "Audit Trail",
        description: "Security & activity logs",
        icon: History,
        adminOnly: true,
      },
      {
        id: "settings",
        label: "Console Settings",
        description: "System & profile controls",
        icon: Wrench,
        adminOnly: true,
      },
    ],
  },
];

const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  currentUserRole = "admin",
  adminInfo,
  onLogout,
  onOpenHelp,
  theme = "dark",
  onThemeChange,
}) => {
  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleTabClick = (tabId: AdminTabType) => {
    onSelectTab(tabId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: SMOOTH_EASE }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
          />

          {/* Slide-in Drawer Container */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.36, ease: SMOOTH_EASE }}
            style={{ willChange: "transform", transform: "translate3d(0, 0, 0)" }}
            className="fixed top-0 bottom-0 left-0 w-[86vw] max-w-[340px] bg-card border-r border-card-border shadow-2xl flex flex-col justify-between overflow-hidden z-10 select-none"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation drawer"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-brand-green/10 blur-[50px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/3 left-0 w-32 h-32 bg-[#2E5A44]/10 blur-[50px] rounded-full pointer-events-none" />

            {/* Top Header */}
            <div className="p-4 sm:p-5 border-b border-card-border flex items-center justify-between relative bg-background/40 backdrop-blur-md shrink-0">
              <div className="flex items-center">
                <img
                  src="/logo.png"
                  alt="ANTONIONI GROUNDS"
                  className="h-8 w-auto object-contain invert dark:invert-0"
                />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation"
                className="h-8 w-8 rounded-full border border-card-border bg-card hover:bg-background-alt flex items-center justify-center text-neutral-500 hover:text-foreground active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <X size={16} />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="px-4 py-3 border-b border-card-border/60 bg-foreground/[0.01] shrink-0">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-card border border-card-border/70 shadow-sm">
                <div className="h-9 w-9 rounded-full bg-brand-green/15 border border-brand-green/30 flex items-center justify-center text-brand-green font-bold text-xs shadow-inner shrink-0">
                  {adminInfo.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="type-body-sm font-semibold text-foreground truncate text-xs">
                      {adminInfo.name}
                    </p>
                    <span className="type-eyebrow text-[7.5px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-400 font-mono uppercase">
                      {currentUserRole}
                    </span>
                  </div>
                  <p className="type-caption text-neutral-500 dark:text-zinc-500 truncate text-[10px] tracking-wide mt-0.5">
                    {adminInfo.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation List */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-none">
              {NAV_SECTIONS.map((section, idx) => {
                const visibleItems = section.items.filter((item) => {
                  if (currentUserRole === "barista" && item.adminOnly) {
                    return false;
                  }
                  return true;
                });

                if (visibleItems.length === 0) return null;

                return (
                  <div key={idx} className="space-y-1.5">
                    <span className="type-eyebrow text-[8.5px] text-neutral-400 dark:text-zinc-500 tracking-[0.18em] font-semibold uppercase px-2.5 block">
                      {section.title}
                    </span>

                    <div className="space-y-1">
                      {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleTabClick(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative group cursor-pointer ${isActive
                                ? "text-white font-semibold shadow-md shadow-brand-green/20"
                                : "text-neutral-600 dark:text-zinc-300 hover:text-foreground dark:hover:text-white hover:bg-foreground/[0.04] dark:hover:bg-white/[0.04]"
                              }`}
                          >
                            {/* Active background pill */}
                            {isActive && (
                              <motion.div
                                layoutId="mobileDrawerActiveTab"
                                className="absolute inset-0 bg-brand-green rounded-xl"
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 32,
                                }}
                              />
                            )}

                            <div className="relative z-10 flex items-center justify-center h-7 w-7 rounded-lg bg-foreground/[0.04] dark:bg-white/[0.04] group-hover:scale-105 transition-transform shrink-0">
                              <Icon
                                size={15}
                                className={isActive ? "text-white" : "text-neutral-500 dark:text-zinc-400 group-hover:text-foreground dark:group-hover:text-white"}
                              />
                            </div>

                            <div className="relative z-10 min-w-0 flex-1">
                              <p className={`text-xs font-semibold tracking-wide truncate ${isActive ? "text-white" : "text-foreground"}`}>
                                {item.label}
                              </p>
                              <p className={`text-[9.5px] truncate mt-0.2 ${isActive ? "text-emerald-100" : "text-neutral-400 dark:text-zinc-500"}`}>
                                {item.description}
                              </p>
                            </div>

                            {item.badge && item.badge > 0 && (
                              <span
                                className={`relative z-10 font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${isActive
                                    ? "bg-white text-brand-green"
                                    : "bg-brand-green text-white"
                                  }`}
                              >
                                {item.badge}
                              </span>
                            )}

                            <ChevronRight
                              size={13}
                              className={`relative z-10 ml-1 transition-transform opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 shrink-0 ${isActive ? "text-white" : "text-neutral-400 dark:text-zinc-500"
                                }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Footer */}
            <div
              className="p-3.5 border-t border-card-border bg-background/50 backdrop-blur-md space-y-2 shrink-0"
              style={{ paddingBottom: "calc(14px + env(safe-area-inset-bottom))" }}
            >
              {/* Theme Toggle & Help Row */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle Button */}
                {onThemeChange && (
                  <button
                    type="button"
                    onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-card-border bg-card hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03] text-neutral-600 dark:text-zinc-300 hover:text-foreground text-xs font-medium transition-all cursor-pointer shadow-sm"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun size={14} className="text-amber-400" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon size={14} className="text-brand-green" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                )}

                {/* Help Guide Button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenHelp();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-card-border bg-card hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03] text-neutral-600 dark:text-zinc-300 hover:text-foreground text-xs font-medium transition-all cursor-pointer shadow-sm"
                >
                  <HelpCircle size={14} className="text-brand-green" />
                  <span>Admin Help</span>
                </button>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/20 text-xs font-semibold transition-all cursor-pointer border border-red-500/20"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
