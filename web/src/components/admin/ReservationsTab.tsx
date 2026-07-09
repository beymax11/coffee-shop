"use client";

import React from "react";
import { Check, X, Mail, Phone, Calendar, Users, MapPin, MessageSquare } from "lucide-react";
import { Reservation } from "@/types";
import { motion } from "framer-motion";

interface ReservationsTabProps {
  reservations: Reservation[];
  reservationStatuses: Record<string, "Pending" | "Approved" | "Cancelled">;
  reservationFilter: "All" | "Pending" | "Approved" | "Cancelled";
  setReservationFilter: (filter: "All" | "Pending" | "Approved" | "Cancelled") => void;
  onUpdateStatus: (res: Reservation, newStatus: "Pending" | "Approved" | "Cancelled") => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export const ReservationsTab: React.FC<ReservationsTabProps> = ({
  reservations,
  reservationStatuses,
  reservationFilter,
  setReservationFilter,
  onUpdateStatus,
}) => {
  // Filtered reservations
  const filteredReservations = reservations.filter((res) => {
    const key = `${res.fullName}-${res.date}-${res.time}`;
    const status = reservationStatuses[key] || "Pending";
    if (reservationFilter === "All") return true;
    return status === reservationFilter;
  });

  const filterStates: Array<"All" | "Pending" | "Approved" | "Cancelled"> = [
    "All",
    "Pending",
    "Approved",
    "Cancelled",
  ];

  return (
    <div className="space-y-6">
      {/* Filter Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#0A0A0A]/50 backdrop-blur-sm p-4 shadow-xl">
        <span className="type-body-sm text-zinc-400 font-semibold pl-2">Filter bookings by status:</span>

        <div className="flex gap-1.5 flex-wrap">
          {filterStates.map((status) => {
            const isActive = reservationFilter === status;
            return (
              <button
                key={status}
                onClick={() => setReservationFilter(status)}
                className={`rounded-full px-4 py-1.5 type-ui text-[9px] tracking-wider border cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-brand-gold border-brand-gold text-black font-semibold shadow-[0_2px_10px_rgba(197,168,128,0.2)]"
                    : "bg-[#121212]/40 border-white/5 text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {filteredReservations.map((res, index) => {
          const key = `${res.fullName}-${res.date}-${res.time}`;
          const status = reservationStatuses[key] || "Pending";
          return (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-2xl border border-white/[0.06] bg-[#0A0A0A]/40 backdrop-blur-sm p-6 shadow-xl flex flex-col justify-between gap-5 relative overflow-hidden transition-all duration-300 hover:border-white/[0.15]"
            >
              {/* Highlight background glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 blur-[35px] rounded-full pointer-events-none opacity-20 ${
                status === "Approved" ? "bg-emerald-500" : status === "Cancelled" ? "bg-red-500" : "bg-amber-500"
              }`} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="type-eyebrow text-[8px] text-brand-gold tracking-[0.2em] font-bold">{res.eventType}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[8px] font-bold type-ui tracking-wider border transition-all ${
                      status === "Approved"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : status === "Cancelled"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <h4 className="type-body font-bold text-white text-base font-serif">{res.fullName}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] type-caption text-zinc-400">
                  <div className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                    <Mail size={12} className="text-zinc-500 shrink-0" />
                    <span className="truncate">{res.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                    <Phone size={12} className="text-zinc-500 shrink-0" />
                    <span>{res.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar size={12} className="text-brand-gold shrink-0" />
                    <span>{res.date} at <span className="font-mono text-zinc-300">{res.time}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Users size={12} className="text-brand-gold shrink-0" />
                    <span>{res.guestCount} Guest{res.guestCount > 1 ? "s" : ""}</span>
                  </div>
                </div>

                {res.location && (
                  <div className="flex items-center gap-2 text-[11px] type-caption text-zinc-400 border-t border-white/[0.04] pt-3">
                    <MapPin size={12} className="text-zinc-500 shrink-0" />
                    <span>Location: <span className="text-zinc-300 font-medium">{res.location}</span></span>
                  </div>
                )}

                {res.notes && (
                  <div className="flex gap-2.5 rounded-lg border border-white/[0.05] bg-black/20 p-3 text-[11px] type-caption text-zinc-400 relative">
                    <MessageSquare size={11} className="text-brand-gold shrink-0 mt-0.5" />
                    <p className="italic text-zinc-400">"{res.notes}"</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 border-t border-white/[0.04] pt-4">
                {status !== "Approved" && (
                  <button
                    onClick={() => onUpdateStatus(res, "Approved")}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] cursor-pointer"
                  >
                    <Check size={11} /> Approve
                  </button>
                )}

                {status !== "Cancelled" && (
                  <button
                    onClick={() => onUpdateStatus(res, "Cancelled")}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] cursor-pointer"
                  >
                    <X size={11} /> Cancel
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
        {filteredReservations.length === 0 && (
          <div className="col-span-2 py-16 text-center text-zinc-500 italic type-body-sm bg-black/10 border border-dashed border-white/[0.06] rounded-2xl">
            No experience bookings found matching this filter.
          </div>
        )}
      </motion.div>
    </div>
  );
};
