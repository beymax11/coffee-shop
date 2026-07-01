"use client";

import React from "react";
import { Coffee, Calendar, Sparkles, Plus } from "lucide-react";
import { MenuItem, Reservation } from "@/types";

interface DashboardTabProps {
  menuItemsCount: number;
  reservationsCount: number;
  loyaltyMembersCount: number;
  recentReservations: Reservation[];
  reservationStatuses: Record<string, "Pending" | "Approved" | "Cancelled">;
  onNavigate: (tab: "dashboard" | "menu" | "reservations" | "loyalty") => void;
  onNewMenuItemClick: () => void;
  onRegisterLoyaltyClick: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  menuItemsCount,
  reservationsCount,
  loyaltyMembersCount,
  recentReservations,
  reservationStatuses,
  onNavigate,
  onNewMenuItemClick,
  onRegisterLoyaltyClick,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stats Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 hover:border-brand-gold/20 transition-all shadow-lg relative group">
          <span className="type-label text-zinc-500 block">Menu Offerings</span>
          <span className="type-stat text-brand-gold font-serif block mt-2">{menuItemsCount}</span>
          <span className="text-[10px] text-zinc-400 block mt-2">Active food & drinks</span>
          <Coffee className="absolute right-6 top-6 text-zinc-800" size={32} />
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 hover:border-brand-gold/20 transition-all shadow-lg relative group">
          <span className="type-label text-zinc-500 block">Active Experiences</span>
          <span className="type-stat text-white font-serif block mt-2">{reservationsCount}</span>
          <span className="text-[10px] text-zinc-400 block mt-2">Table & event reservations</span>
          <Calendar className="absolute right-6 top-6 text-zinc-800" size={32} />
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 hover:border-brand-gold/20 transition-all shadow-lg relative group">
          <span className="type-label text-zinc-500 block">Loyalty Club</span>
          <span className="type-stat text-brand-gold font-serif block mt-2">{loyaltyMembersCount}</span>
          <span className="text-[10px] text-zinc-400 block mt-2">Active card holders</span>
          <Sparkles className="absolute right-6 top-6 text-zinc-800" size={32} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings column */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="type-h3 text-white font-serif font-bold">Upcoming Experiences</h3>
            <button
              onClick={() => onNavigate("reservations")}
              className="type-ui text-[10px] text-brand-gold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentReservations.slice(0, 4).map((res, idx) => {
              const key = `${res.fullName}-${res.date}-${res.time}`;
              const status = reservationStatuses[key] || "Pending";
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/30 hover:border-white/10 transition-colors"
                >
                  <div>
                    <p className="type-body-sm font-semibold text-white">{res.fullName}</p>
                    <p className="type-caption text-zinc-500 text-[11px] mt-0.5">
                      {res.eventType} • {res.guestCount} guests • {res.date} at {res.time}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-[9px] font-semibold type-ui tracking-wider ${
                      status === "Approved"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : status === "Cancelled"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
            {recentReservations.length === 0 && (
              <p className="text-zinc-500 text-center py-6 italic text-sm">No reservations logged.</p>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="rounded-2xl border border-white/5 bg-[#121212] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="type-h3 text-white font-serif font-bold mb-4">Quick Operations</h3>
            <p className="type-caption text-zinc-500 leading-relaxed mb-6">
              Easily add coffee blends, teas, and desserts to the public menu, or inspect active table reservations.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onNewMenuItemClick}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 type-ui text-[11px] text-black hover:bg-brand-gold-hover transition-colors font-semibold"
            >
              <Plus size={14} />
              New Menu Item
            </button>

            <button
              onClick={onRegisterLoyaltyClick}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 type-ui text-[11px] text-white hover:bg-white/10 transition-colors"
            >
              <Plus size={14} />
              Register Loyalty Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
