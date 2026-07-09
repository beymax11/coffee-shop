"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Coffee,
  Calendar,
  CreditCard,
  Users,
  LogOut,
  ChevronLeft,
  Camera,
  Megaphone,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/utils/supabase";

interface SidebarProps {
  activeTab: "dashboard" | "menu" | "reservations" | "loyalty" | "users" | "lifestyle" | "events";
  setActiveTab: (tab: "dashboard" | "menu" | "reservations" | "loyalty" | "users" | "lifestyle" | "events") => void;
  reservationsCount: number;
  onLogout: () => void;
  currentUserRole?: "admin" | "barista";
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  reservationsCount,
  onLogout,
  currentUserRole = "admin",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminInfo, setAdminInfo] = useState({
    name: "Maître D' Admin",
    email: "admin@coffee.com",
    initials: "AD",
  });

  // Sync state with localStorage on client mount
  useEffect(() => {
    // Load from localStorage if present (for mock and instant load cache)
    const savedProfile = localStorage.getItem("admin_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name && parsed.email) {
          const nameParts = parsed.name.trim().split(/\s+/);
          let initials = "AD";
          if (nameParts.length > 0) {
            if (nameParts.length >= 2) {
              initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
            } else if (nameParts[0].length > 0) {
              initials = nameParts[0].slice(0, 2).toUpperCase();
            }
          }
          setAdminInfo({
            name: parsed.name,
            email: parsed.email,
            initials
          });
        }
      } catch (err) {
        console.error("Error parsing saved admin profile:", err);
      }
    }

    // Fetch logged in admin info if Supabase is active
    const fetchAdminInfo = async () => {
      if (!supabase) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          let name = "Admin User";
          let email = user.email || "admin@coffee.com";
          
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("name, username, email")
              .eq("id", user.id)
              .single();

            if (profile) {
              name = profile.name || profile.username || name;
              email = profile.email || email;
            } else if (user.user_metadata) {
              name = user.user_metadata.name || user.user_metadata.username || name;
            }
          } catch (profileErr) {
            // Profile table might not have this user, fallback to user_metadata
            if (user.user_metadata) {
              name = user.user_metadata.name || user.user_metadata.username || name;
            }
          }
          
          // Generate initials from name
          const nameParts = name.trim().split(/\s+/);
          let initials = "AD";
          if (nameParts.length > 0) {
            if (nameParts.length >= 2) {
              initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
            } else if (nameParts[0].length > 0) {
              initials = nameParts[0].slice(0, 2).toUpperCase();
            }
          }
          
          setAdminInfo({ name, email, initials });
          localStorage.setItem("admin_profile", JSON.stringify({ name, email }));
        }
      } catch (err) {
        console.error("Error fetching admin profile in Sidebar:", err);
      }
    };

    fetchAdminInfo();
    // 1. Sidebar collapse state
    const savedCollapse = localStorage.getItem("admin_sidebar_collapsed");
    if (savedCollapse === "true") {
      setIsCollapsed(true);
    }

  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("admin_sidebar_collapsed", String(nextState));
  };

  return (
    <>
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden md:flex h-full border-r border-card-border bg-card/95 backdrop-blur-md flex-col justify-between shrink-0 relative z-20 overflow-visible"
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute top-6 -right-4 h-8 w-8 rounded-full border border-card-border bg-card hover:bg-background-alt flex items-center justify-center text-neutral-500 hover:text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.15)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] cursor-pointer z-50 transition-colors"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft size={16} />
        </motion.div>
      </button>

      <div className="w-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-6 border-b border-card-border flex flex-col gap-1.5 relative overflow-hidden h-[77px] justify-center">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-green/5 blur-[20px] rounded-full pointer-events-none" />
          {!isCollapsed ? (
            <div className="flex items-start">
              <img
                src="/logo.png"
                alt="ANTONIONI GROUNDS"
                className="h-10 w-auto object-contain invert dark:invert-0"
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <img
                src="/stamps-transparent.png"
                alt="ANTONIONI GROUNDS"
                className="h-11 w-auto object-contain brightness-0 dark:invert"
              />
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {[
            { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
            { id: "menu" as const, label: "Menu Offerings", icon: Coffee },
            { id: "reservations" as const, label: "Reservations", icon: Calendar, badge: reservationsCount },
            { id: "loyalty" as const, label: "Loyalty Logs", icon: CreditCard },
            { id: "users" as const, label: "Users & Roles", icon: Users },
            { id: "lifestyle" as const, label: "Lifestyle Posts", icon: Camera },
            { id: "events" as const, label: "Events & Updates", icon: Megaphone },
          ].filter(tab => {
            if (currentUserRole === "barista") {
              return tab.id !== "menu" && tab.id !== "users" && tab.id !== "lifestyle" && tab.id !== "events";
            }
            return true;
          }).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={isCollapsed ? tab.label : undefined}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl type-ui text-[11px] tracking-wider transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? "text-white font-semibold shadow-[0_4px_20px_rgba(46,90,68,0.25)]"
                    : "text-neutral-500 hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03] hover:text-foreground dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {/* Glowing background for active */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-brand-green"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <span className={`relative z-10 flex items-center gap-3.5 w-full ${isCollapsed ? "justify-center" : ""}`}>
                  <Icon size={15} className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                  {tab.badge && tab.badge > 0 && (
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full transition-colors ${
                      isActive ? "bg-white/20 text-white font-bold" : "bg-foreground/10 text-neutral-500 dark:bg-white/10 dark:text-zinc-300"
                    } ${isCollapsed ? "absolute -top-1.5 -right-1.5 scale-90 border border-card" : "ml-auto"}`}>
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col">

        {/* Admin User Section */}
        <div className="p-4 border-t border-card-border bg-background-alt/90 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green text-xs font-bold shadow-[0_0_15px_rgba(46,90,68,0.1)] shrink-0">
              {adminInfo.initials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="type-body-sm font-semibold text-foreground truncate text-xs">{adminInfo.name}</p>
                <p className="type-caption text-neutral-500 dark:text-zinc-500 truncate text-[9px] tracking-wide mt-0.5">{adminInfo.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            title={isCollapsed ? "Exit Console" : undefined}
            className={`w-full flex items-center justify-center gap-2 rounded-xl border border-card-border bg-foreground/[0.03] py-2.5 type-ui text-[10px] text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-foreground/[0.06] transition-all duration-300 group hover:border-card-border ${isCollapsed ? "px-0" : ""}`}
          >
            <LogOut size={12} className="transition-transform group-hover:-translate-x-0.5" />
            {!isCollapsed && <span className="whitespace-nowrap">Exit Console</span>}
          </button>
        </div>
      </div>
    </motion.aside>

    {/* Mobile Bottom Navigation Bar — visible only on mobile (md:hidden) */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-card-border bg-card/95 backdrop-blur-xl flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {[
        { id: "dashboard" as const, label: "Home", icon: LayoutDashboard },
        { id: "menu" as const, label: "Menu", icon: Coffee },
        { id: "reservations" as const, label: "Bookings", icon: Calendar, badge: reservationsCount },
        { id: "loyalty" as const, label: "Loyalty", icon: CreditCard },
        { id: "users" as const, label: "Users", icon: Users },
        { id: "lifestyle" as const, label: "Lifestyle", icon: Camera },
        { id: "events" as const, label: "Events", icon: Megaphone },
      ].filter(tab => {
        if (currentUserRole === "barista") {
          return tab.id !== "menu" && tab.id !== "users" && tab.id !== "lifestyle" && tab.id !== "events";
        }
        return true;
      }).map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 relative transition-colors ${
              isActive
                ? "text-brand-green"
                : "text-neutral-500 dark:text-zinc-500"
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-brand-green" />
            )}
            <div className="relative">
              <Icon size={18} />
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 h-3.5 w-3.5 rounded-full bg-brand-green text-white text-[7px] font-bold flex items-center justify-center">
                  {tab.badge > 9 ? "9+" : tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[9px] tracking-wide font-medium ${
              isActive ? "text-brand-green" : "text-neutral-500 dark:text-zinc-500"
            }`}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
    </>
  );
};
