"use client";

import React from "react";
import { Coffee, Calendar, CreditCard, Plus, ArrowRight, Users, FileText } from "lucide-react";
import { MenuItem, Reservation } from "@/types";
import { motion } from "framer-motion";

interface DashboardTabProps {
  menuItemsCount: number;
  reservationsCount: number;
  loyaltyMembersCount: number;
  recentReservations: Reservation[];
  reservationStatuses: Record<string, "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested">;
  onNavigate: (tab: "dashboard" | "menu" | "reservations" | "loyalty" | "users" | "lifestyle" | "events" | "settings" | "audit") => void;
  onNewMenuItemClick: () => void;
  onRegisterLoyaltyClick: () => void;
  currentUserRole?: "admin" | "barista";
}

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export const DashboardTab: React.FC<DashboardTabProps> = ({
  menuItemsCount,
  reservationsCount,
  loyaltyMembersCount,
  recentReservations,
  reservationStatuses,
  onNavigate,
  onNewMenuItemClick,
  onRegisterLoyaltyClick,
  currentUserRole = "admin",
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Stats Deck */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${currentUserRole === "admin" ? "md:grid-cols-3" : "sm:grid-cols-2"} gap-4 md:gap-6`}>
        {/* Menu Offerings Card */}
        {currentUserRole === "admin" && (
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-2xl p-6 glassmorphism-green hover:border-brand-green/40 transition-all duration-300 shadow-xl relative overflow-hidden group cursor-pointer"
            onClick={() => onNavigate("menu")}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 blur-[30px] rounded-full pointer-events-none" />
            <span className="type-eyebrow text-zinc-500 block text-[9px] tracking-[0.2em] font-semibold">MENU OFFERINGS</span>
            <span className="type-stat text-brand-green dark:text-emerald-400 font-serif block mt-2 font-bold tracking-tight">{menuItemsCount}</span>
            <span className="type-caption text-zinc-500 block mt-2">Active house blends & delicacies</span>
            <Coffee className="absolute right-6 bottom-6 text-brand-green/10 group-hover:text-brand-green/20 transition-colors duration-300" size={40} />
          </motion.div>
        )}

        {/* Active Experiences Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          className="rounded-2xl p-6 glassmorphism-green hover:border-[#2E5A44]/40 transition-all duration-300 shadow-xl relative overflow-hidden group cursor-pointer"
          onClick={() => onNavigate("reservations")}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#2E5A44]/5 blur-[30px] rounded-full pointer-events-none" />
          <span className="type-eyebrow text-zinc-500 block text-[9px] tracking-[0.2em] font-semibold">ACTIVE EXPERIENCES</span>
          <span className="type-stat text-brand-green dark:text-white font-serif block mt-2 font-bold tracking-tight">{reservationsCount}</span>
          <span className="type-caption text-zinc-500 block mt-2">Upcoming table & event bookings</span>
          <Calendar className="absolute right-6 bottom-6 text-[#2E5A44]/15 group-hover:text-[#2E5A44]/30 transition-colors duration-300" size={40} />
        </motion.div>

        {/* Loyalty Club Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          className="rounded-2xl p-6 glassmorphism-green hover:border-brand-green/40 transition-all duration-300 shadow-xl relative overflow-hidden group cursor-pointer"
          onClick={() => onNavigate("loyalty")}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 blur-[30px] rounded-full pointer-events-none" />
          <span className="type-eyebrow text-zinc-500 block text-[9px] tracking-[0.2em] font-semibold">LOYALTY CLUB</span>
          <span className="type-stat text-brand-green dark:text-emerald-400 font-serif block mt-2 font-bold tracking-tight">{loyaltyMembersCount}</span>
          <span className="type-caption text-zinc-500 block mt-2">Registered digital card holders</span>
          <CreditCard className="absolute right-6 bottom-6 text-brand-green/10 group-hover:text-brand-green/20 transition-colors duration-300" size={40} />
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
        {/* Recent Bookings column */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 rounded-2xl border border-card-border bg-card/60 backdrop-blur-sm p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/[0.01] blur-[40px] rounded-full pointer-events-none" />
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="type-eyebrow text-[8px] text-brand-green dark:text-emerald-400 tracking-[0.2em]">Live Bookings</span>
                <h3 className="type-h3 text-foreground font-serif font-bold tracking-tight mt-0.5">Upcoming Experiences</h3>
              </div>
              <button
                onClick={() => onNavigate("reservations")}
                className="type-ui text-[10px] text-brand-green hover:text-brand-green-hover transition-colors flex items-center gap-1 group font-bold tracking-wider"
              >
                View All
                <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {recentReservations.slice(0, 4).map((res, idx) => {
                const compositeKey = `${res.fullName}-${res.date}-${res.time}`;
                const status = (res.id && reservationStatuses[res.id]) || reservationStatuses[compositeKey] || res.status || "Pending";
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl border border-card-border bg-foreground/[0.01] hover:bg-foreground/[0.03] hover:border-card-border transition-all duration-300 group"
                  >
                    <div className="min-w-0">
                      <p className="type-body-sm font-semibold text-foreground truncate">{res.fullName}</p>
                      <p className="type-caption text-neutral-500 dark:text-zinc-500 text-[11px] mt-1 truncate">
                        <span className="text-brand-green/90 dark:text-emerald-400/90 font-serif italic">{res.eventType}</span> • {res.guestCount} guest{res.guestCount > 1 ? "s" : ""} • {res.date} at <span className="font-mono text-neutral-500 dark:text-zinc-400">{res.time}</span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[8px] font-bold type-ui tracking-wider border shrink-0 transition-all ${
                        status === "Completed"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          : status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : status === "Pre-Approved"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : status === "Cancellation Requested"
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 animate-pulse"
                          : status === "Cancelled"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                          : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
              {recentReservations.length === 0 && (
                <div className="text-center py-10 rounded-xl border border-dashed border-card-border bg-foreground/[0.03]">
                  <p className="text-neutral-500 dark:text-zinc-500 italic text-sm">No reservations logged in database.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Operations Panel */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-card-border bg-card/60 backdrop-blur-sm p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden h-full"
        >
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-green/5 blur-[40px] rounded-full pointer-events-none" />
          
          <div>
            <span className="type-eyebrow text-[9px] text-brand-green dark:text-emerald-400 tracking-[0.2em] font-semibold">ADMIN CONTROLS</span>
            <h3 className="type-h3 text-foreground font-serif font-bold tracking-tight mt-0.5 mb-2">Quick Operations</h3>
            <p className="type-caption text-neutral-500 dark:text-zinc-400 leading-relaxed text-[11px] mb-5">
              Perform common management tasks, update menu offerings, register customer loyalty cards, or navigate to key sections.
            </p>
          </div>

          <div className="space-y-4 mt-auto">
            <div>
              <span className="type-eyebrow text-[8px] text-neutral-400 dark:text-zinc-500 tracking-[0.15em] font-semibold uppercase block mb-2">Create & Register</span>
              <div className="space-y-2.5">
                {currentUserRole === "admin" && (
                  <button
                    onClick={onNewMenuItemClick}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white type-ui text-[11px] font-bold tracking-wide transition-all duration-300 cursor-pointer shadow-md shadow-brand-green/15 group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Plus size={14} className="text-emerald-200" />
                      New Menu Item
                    </span>
                    <ArrowRight size={12} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
                )}

                <button
                  onClick={onRegisterLoyaltyClick}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-card-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-foreground type-ui text-[11px] font-bold tracking-wide transition-all duration-300 cursor-pointer hover:border-brand-green/40 group"
                >
                  <span className="flex items-center gap-2.5">
                    <CreditCard size={14} className="text-brand-green dark:text-emerald-400" />
                    Register Loyalty Card
                  </span>
                  <ArrowRight size={12} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-card-border/60">
              <span className="type-eyebrow text-[8px] text-neutral-400 dark:text-zinc-500 tracking-[0.15em] font-semibold uppercase block mb-2">Shortcuts</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigate("reservations")}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-card-border/60 bg-foreground/[0.01] hover:bg-foreground/[0.04] text-[10px] font-medium text-neutral-600 dark:text-zinc-400 hover:text-foreground transition-all cursor-pointer group"
                >
                  <Calendar size={12} className="text-brand-green dark:text-emerald-400 shrink-0" />
                  <span className="truncate group-hover:text-brand-green dark:group-hover:text-emerald-400 transition-colors">Reservations</span>
                </button>

                {currentUserRole === "admin" && (
                  <button
                    onClick={() => onNavigate("users")}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-card-border/60 bg-foreground/[0.01] hover:bg-foreground/[0.04] text-[10px] font-medium text-neutral-600 dark:text-zinc-400 hover:text-foreground transition-all cursor-pointer group"
                  >
                    <Users size={12} className="text-brand-green dark:text-emerald-400 shrink-0" />
                    <span className="truncate group-hover:text-brand-green dark:group-hover:text-emerald-400 transition-colors">Users & Roles</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate("loyalty")}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-card-border/60 bg-foreground/[0.01] hover:bg-foreground/[0.04] text-[10px] font-medium text-neutral-600 dark:text-zinc-400 hover:text-foreground transition-all cursor-pointer group"
                >
                  <CreditCard size={12} className="text-brand-green dark:text-emerald-400 shrink-0" />
                  <span className="truncate group-hover:text-brand-green dark:group-hover:text-emerald-400 transition-colors">Loyalty Club</span>
                </button>

                {currentUserRole === "admin" && (
                  <button
                    onClick={() => onNavigate("audit")}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-card-border/60 bg-foreground/[0.01] hover:bg-foreground/[0.04] text-[10px] font-medium text-neutral-600 dark:text-zinc-400 hover:text-foreground transition-all cursor-pointer group"
                  >
                    <FileText size={12} className="text-brand-green dark:text-emerald-400 shrink-0" />
                    <span className="truncate group-hover:text-brand-green dark:group-hover:text-emerald-400 transition-colors">Audit Logs</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

