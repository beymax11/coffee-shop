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
  Wrench,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/utils/supabase";
import { AdminHelpModal } from "./AdminHelpModal";

interface SidebarTabItem {
  id: "dashboard" | "menu" | "reservations" | "loyalty" | "users" | "lifestyle" | "events" | "settings";
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

interface SidebarProps {
  activeTab: "dashboard" | "menu" | "reservations" | "loyalty" | "users" | "lifestyle" | "events" | "settings";
  setActiveTab: (tab: "dashboard" | "menu" | "reservations" | "loyalty" | "users" | "lifestyle" | "events" | "settings") => void;
  onLogout: () => void;
  currentUserRole?: "admin" | "barista";
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  currentUserRole = "admin",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
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
          // Preserve existing role when saving profile to avoid losing it on refresh
          const existingSaved = localStorage.getItem("admin_profile");
          let existingRole: string | undefined;
          try {
            if (existingSaved) existingRole = JSON.parse(existingSaved)?.role;
          } catch (_) { }
          localStorage.setItem("admin_profile", JSON.stringify({ name, email, role: existingRole }));
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

    const handleStorageChange = () => {
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
          console.error("Error parsing saved admin profile in Sidebar storage listener:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
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
            {(
              [
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "menu", label: "Menu Offerings", icon: Coffee },
                { id: "reservations", label: "Reservations", icon: Calendar },
                { id: "loyalty", label: "Loyalty Logs", icon: CreditCard },
                { id: "lifestyle", label: "Lifestyle Posts", icon: Camera },
                { id: "events", label: "Events & Updates", icon: Megaphone },
                { id: "users", label: "Users & Roles", icon: Users },
              ] as SidebarTabItem[]
            ).filter(tab => {
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
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl type-ui text-[11px] tracking-wider transition-all duration-300 relative group overflow-hidden ${isActive
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
                    <div className="relative w-fit h-fit">
                      <Icon size={15} className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                      {tab.badge && tab.badge > 0 && isCollapsed && (
                        <span className={`absolute -top-2 -right-2.5 font-mono text-[7.5px] min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center border border-card scale-90 whitespace-nowrap ${isActive ? "bg-white text-brand-green font-bold" : "bg-brand-green text-white font-bold"
                          }`}>
                          {tab.badge}
                        </span>
                      )}
                    </div>
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
                    {tab.badge && tab.badge > 0 && !isCollapsed && (
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full transition-colors ml-auto ${isActive ? "bg-white/20 text-white font-bold" : "bg-foreground/10 text-neutral-500 dark:bg-white/10 dark:text-zinc-300"
                        }`}>
                        {tab.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col relative overflow-visible">
          {/* Admin User Section */}
          <div className="p-4 border-t border-card-border bg-background-alt/90 flex flex-col gap-4 overflow-visible relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(prev => !prev)}
              className="flex items-center gap-3 w-full text-left cursor-pointer hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03] p-1.5 -m-1.5 rounded-xl transition-all duration-200 select-none group/profile"
              title="Account Menu"
            >
              <div className="h-9 w-9 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green text-xs font-bold shadow-[0_0_15px_rgba(46,90,68,0.1)] shrink-0 transition-transform group-hover/profile:scale-105">
                {adminInfo.initials}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="type-body-sm font-semibold text-foreground truncate text-xs group-hover/profile:text-brand-green transition-colors">{adminInfo.name}</p>
                  <p className="type-caption text-neutral-500 dark:text-zinc-500 truncate text-[9px] tracking-wide mt-0.5">{adminInfo.email}</p>
                </div>
              )}
            </button>

            {/* Profile Expandable Quick Action Overlay Menu */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowProfileMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`absolute bottom-16 z-40 bg-card border border-card-border rounded-xl shadow-2xl p-2.5 space-y-1 ${isCollapsed ? "left-20 w-48" : "left-4 right-4"
                    }`}
                >
                  {currentUserRole !== "barista" && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveTab("settings");
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[10px] uppercase font-bold text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 transition-all text-left"
                    >
                      <Wrench size={13} />
                      Settings
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowHelpModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[10px] uppercase font-bold text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 transition-all text-left"
                  >
                    <HelpCircle size={13} />
                    Help
                  </button>

                  <div className="h-px bg-card-border/60 my-1" />

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[10px] uppercase font-bold text-red-500 hover:bg-red-500/10 transition-all text-left"
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Floating Bottom Nav for Mobile Screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-card-border/80 flex items-center justify-around py-3 px-2 shadow-2xl" style={{ paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}>
        {(
          [
            { id: "dashboard", label: "Overview", icon: LayoutDashboard },
            { id: "menu", label: "Menu", icon: Coffee },
            { id: "reservations", label: "Bookings", icon: Calendar },
            { id: "loyalty", label: "Loyalty", icon: CreditCard },
            { id: "users", label: "Users", icon: Users },
          ] as SidebarTabItem[]
        ).filter(tab => {
          if (currentUserRole === "barista") {
            return tab.id !== "menu" && tab.id !== "users";
          }
          return true;
        }).map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors duration-300 relative ${isActive ? "text-brand-green" : "text-neutral-500 dark:text-zinc-400"}`}
            >
              <div className="relative w-fit h-fit mx-auto">
                <Icon size={18} className={isActive ? "scale-110" : ""} />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 font-mono text-[7.5px] bg-brand-green text-white font-bold min-w-[14px] h-3.5 px-0.5 rounded-full flex items-center justify-center scale-90 border border-card shadow-sm whitespace-nowrap">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[8px] font-medium tracking-wide uppercase">{tab.label}</span>
            </button>
          );
        })}
        {/* Help Quick Link for Mobile */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="flex flex-col items-center gap-1 cursor-pointer text-neutral-500 dark:text-zinc-400"
        >
          <HelpCircle size={18} />
          <span className="text-[8px] font-medium tracking-wide uppercase">Help</span>
        </button>
      </div>

      {/* Admin Help Modal Component */}
      <AdminHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </>
  );
};
