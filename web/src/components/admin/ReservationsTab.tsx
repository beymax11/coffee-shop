"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { Reservation } from "@/types";

interface ReservationsTabProps {
  reservations: Reservation[];
  reservationStatuses: Record<string, "Pending" | "Approved" | "Cancelled">;
  reservationFilter: "All" | "Pending" | "Approved" | "Cancelled";
  setReservationFilter: (filter: "All" | "Pending" | "Approved" | "Cancelled") => void;
  onUpdateStatus: (res: Reservation, newStatus: "Pending" | "Approved" | "Cancelled") => void;
}

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
    <div className="space-y-6 animate-fadeIn">
      {/* Filter Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#121212] p-4">
        <span className="type-body-sm text-zinc-400 font-semibold">Filter bookings by status:</span>

        <div className="flex gap-1.5">
          {filterStates.map((status) => (
            <button
              key={status}
              onClick={() => setReservationFilter(status)}
              className={`rounded px-3.5 py-1.5 type-ui text-[10px] border transition-colors ${
                reservationFilter === status
                  ? "bg-brand-gold border-brand-gold text-black font-semibold"
                  : "bg-[#161616] border-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReservations.map((res, index) => {
          const key = `${res.fullName}-${res.date}-${res.time}`;
          const status = reservationStatuses[key] || "Pending";
          return (
            <div
              key={index}
              className="rounded-xl border border-white/5 bg-[#121212] p-6 shadow-md hover:border-white/10 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="type-eyebrow text-[9px] text-brand-gold">{res.eventType}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-semibold type-ui tracking-wider ${
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

                <h4 className="type-body font-bold text-white text-base">{res.fullName}</h4>

                <div className="grid grid-cols-2 gap-2 text-[11px] type-caption text-zinc-400">
                  <div>📧 {res.email}</div>
                  <div>📞 {res.phone}</div>
                  <div>📅 {res.date} at {res.time}</div>
                  <div>👥 {res.guestCount} Guest(s)</div>
                </div>

                {res.location && (
                  <p className="type-caption text-zinc-500 text-[11px] border-t border-white/5 pt-2">
                    📍 Location: {res.location}
                  </p>
                )}

                {res.notes && (
                  <div className="rounded border border-white/5 bg-black/20 p-2.5 type-caption text-zinc-500 text-[11px] italic">
                    "{res.notes}"
                  </div>
                )}
              </div>

              <div className="flex gap-2 border-t border-white/5 pt-3">
                {status !== "Approved" && (
                  <button
                    onClick={() => onUpdateStatus(res, "Approved")}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 py-2 type-ui text-[9px] font-bold transition-all"
                  >
                    <Check size={10} /> Approve
                  </button>
                )}

                {status !== "Cancelled" && (
                  <button
                    onClick={() => onUpdateStatus(res, "Cancelled")}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 type-ui text-[9px] font-bold transition-all"
                  >
                    <X size={10} /> Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredReservations.length === 0 && (
          <div className="col-span-2 py-16 text-center text-zinc-500 italic type-body-sm">
            No experience bookings found.
          </div>
        )}
      </div>
    </div>
  );
};
