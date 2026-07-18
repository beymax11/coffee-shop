"use client";

import React from "react";
import { Check, X, Mail, Phone, Calendar, Users, MapPin, MessageSquare, Search, RefreshCw } from "lucide-react";
import { Reservation } from "@/types";
import { motion } from "framer-motion";
import { ConfirmModal } from "../common/ConfirmModal";

interface ReservationsTabProps {
  reservations: Reservation[];
  reservationStatuses: Record<string, "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested">;
  reservationFilter: "All" | "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested";
  setReservationFilter: (filter: "All" | "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested") => void;
  onUpdateStatus: (res: Reservation, newStatus: "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested") => void;
  reservationSearch: string;
  setReservationSearch: (search: string) => void;
  onOpenDetails: (res: Reservation) => void;
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
  reservationSearch,
  setReservationSearch,
  onOpenDetails,
}) => {
  const [updatingKey, setUpdatingKey] = React.useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = React.useState<"Completed" | "Cancelled" | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{
    res: Reservation;
    type: "Complete" | "Cancel";
    targetStatus: "Completed" | "Cancelled";
  } | null>(null);

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { res, targetStatus } = confirmAction;
    const key = `${res.fullName}-${res.date}-${res.time}`;
    setConfirmAction(null);
    setUpdatingKey(key);
    setUpdatingStatus(targetStatus);
    try {
      await onUpdateStatus(res, targetStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingKey(null);
      setUpdatingStatus(null);
    }
  };

  // Filtered reservations
  const filteredReservations = reservations.filter((res) => {
    const key = `${res.fullName}-${res.date}-${res.time}`;
    const status = reservationStatuses[key] || "Pending";
    
    // Status filter match
    const matchesFilter = reservationFilter === "All" || status === reservationFilter;

    // Search query match (fullname, email, phone)
    const matchesSearch =
      !reservationSearch ||
      res.fullName.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      res.email.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      res.phone.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      (res.location && res.location.toLowerCase().includes(reservationSearch.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const filterStates: Array<"All" | "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested"> = [
    "All",
    "Pending",
    "Pre-Approved",
    "Approved",
    "Completed",
    "Cancellation Requested",
    "Cancelled",
  ];

  return (
    <div className="space-y-6">
      {/* Filter Deck */}
      <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card/50 backdrop-blur-sm p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="Search by name, email, phone, or location..."
              value={reservationSearch}
              onChange={(e) => setReservationSearch(e.target.value)}
              className="w-full rounded-full border border-card-border bg-background/40 py-2.5 pl-10 pr-4 type-caption text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background/60 focus:ring-1 focus:ring-brand-green/20 text-xs font-sans"
            />
          </div>

          {/* Filter options */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-3 flex-wrap">
            <span className="type-body-sm text-neutral-500 dark:text-zinc-400 font-semibold text-xs whitespace-nowrap pl-1">Filter by status:</span>
            <div className="flex gap-1.5 flex-wrap">
              {filterStates.map((status) => {
                const isActive = reservationFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setReservationFilter(status)}
                    className={`rounded-full px-3 sm:px-4 py-1.5 type-ui text-[9px] tracking-wider border cursor-pointer transition-all duration-300 min-h-[36px] ${
                      isActive
                        ? "bg-brand-green border-brand-green text-white font-semibold shadow-[0_2px_10px_rgba(46,90,68,0.2)]"
                        : "bg-foreground/[0.02] border-card-border/50 text-neutral-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white dark:hover:border-white/20"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
      >
        {filteredReservations.map((res, index) => {
          const key = `${res.fullName}-${res.date}-${res.time}`;
          const status = reservationStatuses[key] || "Pending";
          const isCardUpdating = updatingKey === key;
          return (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => onOpenDetails(res)}
              className="rounded-2xl border border-card-border bg-card/40 backdrop-blur-sm p-6 shadow-xl flex flex-col justify-between gap-5 relative overflow-hidden transition-all duration-300 hover:border-card-border hover:shadow-2xl cursor-pointer"
            >
              {/* Highlight background glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 blur-[35px] rounded-full pointer-events-none opacity-20 ${
                status === "Completed" ? "bg-blue-500" : status === "Approved" ? "bg-emerald-500" : status === "Pre-Approved" ? "bg-amber-500" : status === "Cancellation Requested" ? "bg-orange-500" : status === "Cancelled" ? "bg-red-500" : "bg-zinc-500"
              }`} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="type-eyebrow text-[8px] text-brand-green dark:text-emerald-400 tracking-[0.2em] font-bold">{res.eventType}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[8px] font-bold type-ui tracking-wider border transition-all ${
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

                <h4 className="type-body font-bold text-foreground text-base font-serif">{res.fullName}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] type-caption text-neutral-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors">
                    <Mail size={12} className="text-neutral-500 dark:text-zinc-500 shrink-0" />
                    <span className="truncate">{res.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-colors">
                    <Phone size={12} className="text-neutral-500 dark:text-zinc-500 shrink-0" />
                    <span>{res.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-zinc-400">
                    <Calendar size={12} className="text-brand-green shrink-0" />
                    <span>{res.date} at <span className="font-mono text-neutral-500 dark:text-zinc-300">{res.time}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-zinc-400">
                    <Users size={12} className="text-brand-green shrink-0" />
                    <span>{res.guestCount} Guest{res.guestCount > 1 ? "s" : ""}</span>
                  </div>
                </div>

                {res.location && (
                  <div className="flex items-center gap-2 text-[11px] type-caption text-neutral-500 dark:text-zinc-400 border-t border-card-border/40 pt-3">
                    <MapPin size={12} className="text-neutral-500 dark:text-zinc-500 shrink-0" />
                    <span>Location: <span className="text-neutral-500 dark:text-zinc-300 font-medium">{res.location}</span></span>
                  </div>
                )}

                {res.notes && (
                  <div className="flex gap-2.5 rounded-lg border border-card-border bg-foreground/[0.03] p-3 text-[11px] type-caption text-neutral-500 dark:text-zinc-400 relative">
                    <MessageSquare size={11} className="text-brand-green shrink-0 mt-0.5" />
                    <p className="italic text-neutral-500 dark:text-zinc-400">"{res.notes}"</p>
                  </div>
                )}

                {/* Settle payment details display for verification */}
                {(res.referenceNumber || res.proofOfPayment) && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-3.5 text-xs text-neutral-500 dark:text-zinc-400 relative space-y-1">
                    <span className="font-sans text-[8px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block mb-1">Payment Verified</span>
                    <div className="space-y-0.5 text-[11px]">
                      <p>Method: <strong className="text-foreground">{res.paymentMethod || "—"}</strong></p>
                      <p>Ref No: <strong className="text-foreground font-mono">{res.referenceNumber || "—"}</strong></p>
                      <p className="truncate">Proof File: <strong className="text-foreground italic">{res.proofOfPayment || "—"}</strong></p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 border-t border-card-border/40 pt-4" onClick={(e) => e.stopPropagation()}>
                {status === "Pending" && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(res, "Pre-Approved")}
                      disabled={updatingKey !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 hover:border-amber-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={11} /> Pre-Approve
                    </button>
                    <button
                      onClick={() => setConfirmAction({ res, type: "Cancel", targetStatus: "Cancelled" })}
                      disabled={updatingKey !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 hover:border-red-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCardUpdating && updatingStatus === "Cancelled" ? (
                        <RefreshCw size={11} className="animate-spin" />
                      ) : (
                        <X size={11} />
                      )}
                      {isCardUpdating && updatingStatus === "Cancelled" ? "Cancelling..." : "Cancel"}
                    </button>
                  </>
                )}

                {status === "Pre-Approved" && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(res, "Approved")}
                      disabled={updatingKey !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 hover:border-emerald-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={11} /> Approve & Paid
                    </button>
                    <button
                      onClick={() => setConfirmAction({ res, type: "Cancel", targetStatus: "Cancelled" })}
                      disabled={updatingKey !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 hover:border-red-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCardUpdating && updatingStatus === "Cancelled" ? (
                        <RefreshCw size={11} className="animate-spin" />
                      ) : (
                        <X size={11} />
                      )}
                      {isCardUpdating && updatingStatus === "Cancelled" ? "Cancelling..." : "Cancel"}
                    </button>
                  </>
                )}

                {status === "Approved" && (
                  <>
                    <button
                      onClick={() => setConfirmAction({ res, type: "Complete", targetStatus: "Completed" })}
                      disabled={updatingKey !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 hover:border-blue-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCardUpdating && updatingStatus === "Completed" ? (
                        <RefreshCw size={11} className="animate-spin" />
                      ) : (
                        <Check size={11} />
                      )}
                      {isCardUpdating && updatingStatus === "Completed" ? "Completing..." : "Complete"}
                    </button>
                    <button
                      onClick={() => setConfirmAction({ res, type: "Cancel", targetStatus: "Cancelled" })}
                      disabled={updatingKey !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 hover:border-red-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCardUpdating && updatingStatus === "Cancelled" ? (
                        <RefreshCw size={11} className="animate-spin" />
                      ) : (
                        <X size={11} />
                      )}
                      {isCardUpdating && updatingStatus === "Cancelled" ? "Cancelling..." : "Cancel"}
                    </button>
                  </>
                )}

                {status === "Cancellation Requested" && (
                  <button
                    onClick={() => onOpenDetails(res)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 hover:border-orange-500/40 cursor-pointer"
                  >
                    Review Cancellation Request
                  </button>
                )}

                {status === "Completed" && (
                  <button
                    onClick={() => onUpdateStatus(res, "Approved")}
                    disabled={updatingKey !== null}
                    className="w-full flex items-center justify-center gap-1.5 rounded-full bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 hover:border-zinc-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Restore to Active (Approved)
                  </button>
                )}

                {status === "Cancelled" && (
                  <button
                    onClick={() => onUpdateStatus(res, "Pending")}
                    disabled={updatingKey !== null}
                    className="w-full flex items-center justify-center gap-1.5 rounded-full bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 hover:border-zinc-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Restore to Pending
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
        {filteredReservations.length === 0 && (
          <div className="col-span-2 py-16 text-center text-neutral-500 italic type-body-sm bg-foreground/[0.03] border border-dashed border-card-border rounded-2xl">
            No experience bookings found matching this filter.
          </div>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === "Complete" ? "Complete Booking" : "Cancel Booking"}
        message={
          confirmAction?.type === "Complete"
            ? `Are you sure you want to mark ${confirmAction.res.fullName}'s reservation as completed? This will update their status and send a thank you email.`
            : `Are you sure you want to cancel ${confirmAction?.res.fullName}'s reservation? This action cannot be undone.`
        }
        confirmText={confirmAction?.type === "Complete" ? "Complete" : "Cancel Reservation"}
        variant={confirmAction?.type === "Complete" ? "warning" : "danger"}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};
