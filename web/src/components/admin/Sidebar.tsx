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
  X,
  BookOpen,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";

interface SidebarProps {
  activeTab: "dashboard" | "menu" | "reservations" | "loyalty" | "users" | "lifestyle" | "events" | "settings";
  setActiveTab: (tab: "dashboard" | "menu" | "reservations" | "loyalty" | "users" | "lifestyle" | "events" | "settings") => void;
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState<"guide" | "faqs" | "support">("guide");
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
          } catch (_) {}
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

          <button
            onClick={onLogout}
            title={isCollapsed ? "Exit Console" : undefined}
            className={`w-full flex items-center justify-center gap-2 rounded-xl border border-card-border bg-foreground/[0.03] py-2.5 type-ui text-[10px] text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white hover:bg-foreground/[0.06] transition-all duration-300 group hover:border-card-border ${isCollapsed ? "px-0" : ""}`}
          >
            <LogOut size={12} className="transition-transform group-hover:-translate-x-0.5" />
            {!isCollapsed && <span className="whitespace-nowrap">Exit Console</span>}
          </button>

          {/* Overlay Backdrop to close menu when clicking outside */}
          {showProfileMenu && (
            <div 
              className="fixed inset-0 z-40 bg-transparent cursor-default"
              onClick={() => setShowProfileMenu(false)}
            />
          )}

          {/* Profile Popover Menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-[calc(100%+12px)] bottom-4 w-48 bg-card/95 border border-card-border backdrop-blur-md p-2 rounded-2xl shadow-xl z-50 flex flex-col gap-1 text-foreground"
              >
                <div className="px-3 py-2 border-b border-card-border/40 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Console Account
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("settings");
                    setShowProfileMenu(false);
                  }}
                  className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-brand-green/10 hover:text-brand-green transition-colors duration-200 cursor-pointer font-medium ${
                    activeTab === "settings" ? "text-brand-green bg-brand-green/10" : "text-neutral-500 dark:text-zinc-400"
                  }`}
                >
                  <Wrench size={13} />
                  <span>Settings Tab</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowHelpModal(true);
                    setActiveHelpTab("guide");
                    setShowProfileMenu(false);
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-brand-green/10 hover:text-brand-green text-neutral-500 dark:text-zinc-400 transition-colors duration-200 cursor-pointer font-medium"
                >
                  <HelpCircle size={13} />
                  <span>Help</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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

    {/* Help & System Guide Modal */}
    <AnimatePresence>
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelpModal(false)}
            className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full max-w-2xl rounded-2xl border border-card-border bg-card p-6 md:p-8 shadow-2xl relative z-10 overflow-hidden text-foreground flex flex-col max-h-[85vh]"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 blur-[35px] rounded-full pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors duration-300 p-1.5 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-brand-green/10 rounded-xl text-brand-green">
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 className="text-xl text-foreground font-serif font-bold tracking-tight">
                  System Help & Guide
                </h3>
                <p className="text-xs text-neutral-400 dark:text-zinc-500">
                  Antonioni Grounds Admin Management Console
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-card-border/60 mb-6">
              {[
                { id: "guide" as const, label: "System Guide", icon: BookOpen },
                { id: "faqs" as const, label: "FAQs", icon: HelpCircle },
                { id: "support" as const, label: "Support & Diagnostics", icon: Info },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isTabActive = activeHelpTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveHelpTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                      isTabActive
                        ? "border-brand-green text-brand-green font-bold"
                        : "border-transparent text-neutral-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white"
                    }`}
                  >
                    <TabIcon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-sm scrollbar-thin">
              {activeHelpTab === "guide" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                      Dashboard Overview
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Provides quick-glance statistics of total menu items, pending reservations, active loyalty members, and recent actions. Useful for monitoring daily operations at a glance.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                      Menu Offerings
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Create, view, update, or remove menu items. Toggle the availability state of drinks or food (e.g. mark out-of-stock to temporarily hide it from customers).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                      Experience Bookings / Reservations
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Review details of customers booking tables or events. You can approve pending slot requests, toggle check-ins, or cancel reservations directly.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                      Digital Loyalty Directory
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Manage digital stamp cards for registered customers. Staff can manually award stamps for walk-in orders, revoke accidental stamps, or redeem complete reward cards (resets cards to 0 stamps).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                      User Accounts & Roles
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Adjust permissions by promoting or demoting users (e.g., to Admin, Barista, or Customer). Admin access grants full customization, whereas Baristas get a streamlined view focused only on execution.
                    </p>
                  </div>
                </div>
              )}

              {activeHelpTab === "faqs" && (
                <div className="space-y-4">
                  <div className="border-b border-card-border/40 pb-3">
                    <p className="font-bold text-foreground text-xs">Q: How do customers get stamps?</p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1">
                      Every time a customer makes a purchase, the barista/admin can search their email or phone number in the Loyalty Directory and click the "+" button to award a stamp.
                    </p>
                  </div>

                  <div className="border-b border-card-border/40 pb-3">
                    <p className="font-bold text-foreground text-xs">Q: What happens when 9 stamps are completed?</p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1">
                      The customer is eligible for a free reward drink. Use the "Redeem" action in the Loyalty tab to reset their stamp card to 0 after giving them the drink.
                    </p>
                  </div>

                  <div className="border-b border-card-border/40 pb-3">
                    <p className="font-bold text-foreground text-xs">Q: What can a Barista role access?</p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1">
                      A Barista can view the dashboard summary, review and change reservation statuses, and award/redeem loyalty stamps. Baristas cannot edit menu items, manage users, or post news.
                    </p>
                  </div>

                  <div className="pb-3">
                    <p className="font-bold text-foreground text-xs">Q: How do we upload images for Menu or Events?</p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1">
                      When adding or editing items, you can drop an image file or type a direct URL. Files are automatically uploaded and optimized via Supabase Storage.
                    </p>
                  </div>
                </div>
              )}

              {activeHelpTab === "support" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-brand-green/5 border border-brand-green/20 flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 animate-pulse shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground text-xs">System Connected</h4>
                      <p className="text-neutral-500 dark:text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                        The admin console is successfully synchronized with Supabase cloud infrastructure and Local Storage database.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border border-card-border bg-foreground/[0.01]">
                      <span className="text-[10px] text-neutral-400 dark:text-zinc-500 block uppercase font-bold tracking-wider">Console Version</span>
                      <span className="font-mono text-xs text-foreground font-semibold">v1.4.0 (Stable)</span>
                    </div>
                    <div className="p-3 rounded-lg border border-card-border bg-foreground/[0.01]">
                      <span className="text-[10px] text-neutral-400 dark:text-zinc-500 block uppercase font-bold tracking-wider">API Latency</span>
                      <span className="font-mono text-xs text-foreground font-semibold">Optimal (&lt; 80ms)</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-card-border/40 pt-4">
                    <h4 className="font-bold text-foreground text-xs">Need Assistance?</h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs">
                      For technical issues, system outages, or custom features, contact the developers:
                    </p>
                    <div className="font-mono text-[11px] text-neutral-500 dark:text-zinc-400 space-y-1 bg-foreground/[0.02] p-3 rounded-lg border border-card-border/40">
                      <div>Email: <a href="mailto:support@coffee.com" className="text-brand-green hover:underline">support@coffee.com</a></div>
                      <div>Phone Support: Ext. 404 / +1 (555) 404-COFFEE</div>
                      <div>Working Hours: 08:00 AM - 10:00 PM (PST)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="mt-6 pt-4 border-t border-card-border/60 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2.5 text-xs tracking-wider uppercase text-white bg-brand-green hover:brightness-95 transition-all duration-300 rounded-xl shadow-md font-semibold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};
