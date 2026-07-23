"use client";

import React from "react";
import { Check, X, Mail, Phone, Calendar, Users, MapPin, MessageSquare, Clock, CreditCard, FileText, RefreshCw, Eye } from "lucide-react";
import { Reservation } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmModal } from "../common/ConfirmModal";

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  reservationStatuses: Record<string, "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested">;
  onUpdateStatus: (res: Reservation, newStatus: "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested") => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  isOpen,
  onClose,
  reservation,
  reservationStatuses,
  onUpdateStatus,
}) => {
  const [showProofPanel, setShowProofPanel] = React.useState(false);
  const [updatingStatus, setUpdatingStatus] = React.useState<"Completed" | "Cancelled" | "Approved" | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{
    type: "Complete" | "Cancel" | "ApproveCancellation" | "RejectCancellation";
    targetStatus: "Completed" | "Cancelled" | "Approved";
  } | null>(null);

  const handleConfirmAction = async () => {
    if (!confirmAction || !reservation) return;
    const targetStatus = confirmAction.targetStatus;
    setConfirmAction(null);
    setUpdatingStatus(targetStatus);
    try {
      await onUpdateStatus(reservation, targetStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(null);
    }
  };
  const [isFetchingProof, setIsFetchingProof] = React.useState(false);
  const [livePaymentData, setLivePaymentData] = React.useState<{
    referenceNumber?: string;
    proofOfPayment?: string;
    paymentMethod?: string;
  } | null>(null);
  const [proofFetchError, setProofFetchError] = React.useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = React.useState<string | null>(null);

  const handleRefreshProof = async () => {
    if (!reservation?.id) return;
    setShowProofPanel(true);
    setIsFetchingProof(true);
    setProofFetchError(null);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const r = data.reservation;
      setLivePaymentData({
        referenceNumber: r.referenceNumber || "",
        proofOfPayment: r.proofOfPayment || "",
        paymentMethod: r.paymentMethod || "",
      });
    } catch {
      setProofFetchError("Could not load payment data. Please try again.");
    } finally {
      setIsFetchingProof(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      setShowProofPanel(false);
      setLightboxImage(null);
    }
  }, [isOpen]);

  if (!reservation) return null;

  const parseNotesAndFlavors = (notesText: string = "") => {
    let notes = notesText;
    let coffeeFlavor1 = reservation.coffeeFlavor1 || "";
    let coffeeFlavor2 = reservation.coffeeFlavor2 || "";
    let nonCoffeeFlavor1 = reservation.nonCoffeeFlavor1 || "";
    let nonCoffeeFlavor2 = reservation.nonCoffeeFlavor2 || "";

    if (notesText.includes("Coffee Flavor 1:")) {
      const parts = notesText.split(" | ");
      const notesPart = parts.find(p => p.startsWith("Notes: "));
      const cf1Part = parts.find(p => p.startsWith("Coffee Flavor 1: "));
      const cf2Part = parts.find(p => p.startsWith("Coffee Flavor 2: "));
      const ncf1Part = parts.find(p => p.startsWith("Non-Coffee Flavor 1: "));
      const ncf2Part = parts.find(p => p.startsWith("Non-Coffee Flavor 2: "));

      if (notesPart) notes = notesPart.replace("Notes: ", "");
      else notes = "";

      if (cf1Part) coffeeFlavor1 = cf1Part.replace("Coffee Flavor 1: ", "");
      if (cf2Part) coffeeFlavor2 = cf2Part.replace("Coffee Flavor 2: ", "");
      if (ncf1Part) nonCoffeeFlavor1 = ncf1Part.replace("Non-Coffee Flavor 1: ", "");
      if (ncf2Part) nonCoffeeFlavor2 = ncf2Part.replace("Non-Coffee Flavor 2: ", "");
    }

    return { notes, coffeeFlavor1, coffeeFlavor2, nonCoffeeFlavor1, nonCoffeeFlavor2 };
  };

  const { notes, coffeeFlavor1, coffeeFlavor2, nonCoffeeFlavor1, nonCoffeeFlavor2 } = parseNotesAndFlavors(reservation.notes || "");

  const compositeKey = `${reservation.fullName}-${reservation.date}-${reservation.time}`;
  const currentStatus = (reservation.id && reservationStatuses[reservation.id]) || reservationStatuses[compositeKey] || reservation.status || "Pending";

  const calculateAmount = () => {
    const fee = Number((reservation as any).transpoFee ?? (reservation as any).transpo_fee ?? 0);
    if (reservation.eventType === "Coffee Cart Booking") {
      const pax = reservation.guestCount;
      let base = 5500;
      if (pax === 100) base = 11000;
      if (pax === 150) base = 16500;
      if (pax === 200) base = 22000;
      const total = base + fee;
      const dp = Math.round(base * 0.10) + fee;
      return `₱${total.toLocaleString()}.00 (Downpayment = ₱${dp.toLocaleString()}.00${fee > 0 ? ` incl. ₱${fee.toLocaleString()} Transpo Fee` : ''})`;
    } else {
      return "₱3,500.00 (Consumable Table Fee)";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="max-w-lg w-full relative z-10 flex justify-center">
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="w-full max-w-lg rounded-2xl border border-card-border bg-card p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto font-sans"
            >
              {/* Glow Background */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full pointer-events-none opacity-20 transition-all duration-500 ${currentStatus === "Completed" ? "bg-blue-500" : currentStatus === "Approved" ? "bg-emerald-500" : currentStatus === "Pre-Approved" ? "bg-amber-500" : currentStatus === "Cancelled" ? "bg-red-500" : currentStatus === "Cancellation Requested" ? "bg-orange-500" : "bg-zinc-500"
                }`} />

              {currentStatus === "Pre-Approved" && (
                <button
                  type="button"
                  onClick={() => {
                    if (!showProofPanel) {
                      handleRefreshProof();
                    } else {
                      setShowProofPanel(false);
                      setLivePaymentData(null);
                    }
                  }}
                  className={`absolute top-5 right-12 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-all duration-300 p-1.5 rounded-full cursor-pointer ${showProofPanel ? "text-brand-green dark:text-emerald-400" : ""}`}
                  title="View Proof of Payment"
                >
                  <Eye size={16} />
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors duration-300 p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <span className="type-eyebrow text-[9px] text-brand-green dark:text-emerald-400 tracking-[0.2em] font-bold">
                    {reservation.eventType}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-[8px] font-bold type-ui tracking-wider border transition-all ${currentStatus === "Completed"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        : currentStatus === "Approved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : currentStatus === "Pre-Approved"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : currentStatus === "Cancellation Requested"
                              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                              : currentStatus === "Cancelled"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                                : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20"
                      }`}
                  >
                    {currentStatus}
                  </span>
                </div>
                <h3 className="type-h3 text-foreground font-serif font-bold text-2xl tracking-tight pr-8">
                  {reservation.fullName}
                </h3>
                {reservation.id && (
                  <p className="text-xs text-neutral-500 dark:text-zinc-400 font-mono mt-1.5 select-all">
                    ID: {reservation.id}
                  </p>
                )}
              </div>

              {/* Details Section */}
              <div className="space-y-5">
                {/* Grid for Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-card-border bg-foreground/[0.02] p-3 flex flex-col gap-1">
                    <span className="text-[9px] text-neutral-500 dark:text-zinc-500 uppercase tracking-wider font-bold">Date & Time</span>
                    <div className="flex items-center gap-1.5 text-xs text-foreground mt-1">
                      <Calendar size={13} className="text-brand-green shrink-0" />
                      <span>{reservation.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-foreground/80 font-mono mt-0.5">
                      <Clock size={13} className="text-brand-green shrink-0" />
                      <span>{reservation.time}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-card-border bg-foreground/[0.02] p-3 flex flex-col gap-1">
                    <span className="text-[9px] text-neutral-500 dark:text-zinc-500 uppercase tracking-wider font-bold">Guests</span>
                    <div className="flex items-center gap-1.5 text-xs text-foreground mt-2">
                      <Users size={13} className="text-brand-green shrink-0" />
                      <span className="font-semibold">{reservation.guestCount} Guest{reservation.guestCount > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2.5">
                  <h4 className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-zinc-500 font-bold">Contact Info</h4>
                  <div className="rounded-xl border border-card-border bg-foreground/[0.02] p-3.5 space-y-2 text-xs text-foreground">
                    <div className="flex items-center gap-3">
                      <Mail size={13} className="text-neutral-500 dark:text-zinc-500 shrink-0" />
                      <span className="select-all">{reservation.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={13} className="text-neutral-500 dark:text-zinc-500 shrink-0" />
                      <span className="select-all">{reservation.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Location / Address */}
                {reservation.location && (
                  <div className="space-y-2.5">
                    <h4 className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-zinc-500 font-bold">Event Location</h4>
                    <div className="rounded-xl border border-card-border bg-foreground/[0.02] p-3.5 flex items-start gap-2.5 text-xs text-foreground">
                      <MapPin size={14} className="text-brand-green shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{reservation.location}</span>
                    </div>
                  </div>
                )}

                {/* Notes / Special Instructions */}
                {notes && (
                  <div className="space-y-2.5">
                    <h4 className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-zinc-500 font-bold">Customer Notes</h4>
                    <div className="rounded-xl border border-card-border bg-foreground/[0.02] p-3.5 flex items-start gap-2.5 text-xs text-neutral-500 dark:text-zinc-400 italic">
                      <MessageSquare size={13} className="text-brand-green shrink-0 mt-0.5" />
                      <p className="leading-relaxed">"{notes}"</p>
                    </div>
                  </div>
                )}

                {/* Selected Package Flavors */}
                {(coffeeFlavor1 || nonCoffeeFlavor1) && (
                  <div className="space-y-2.5">
                    <h4 className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-zinc-500 font-bold">Selected Package Flavors</h4>
                    <div className="rounded-xl border border-card-border bg-foreground/[0.02] p-3.5 grid grid-cols-2 gap-4 text-xs text-foreground">
                      <div>
                        <span className="text-[9px] text-neutral-500 dark:text-zinc-500 uppercase block font-bold">Coffee Flavors</span>
                        <span className="mt-1 block font-semibold">
                          1. {coffeeFlavor1 || "—"}<br />
                          2. {coffeeFlavor2 || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-500 dark:text-zinc-500 uppercase block font-bold">Non-Coffee Flavors</span>
                        <span className="mt-1 block font-semibold">
                          1. {nonCoffeeFlavor1 || "—"}<br />
                          2. {nonCoffeeFlavor2 || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Box */}
                {currentStatus !== "Pre-Approved" && (reservation.referenceNumber || reservation.proofOfPayment) && (
                  <div className="space-y-2.5">
                    <h4 className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Payment Verification</h4>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4 text-xs space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[9px] text-neutral-500 dark:text-zinc-500 uppercase block font-bold">Payment Method</span>
                          <span className="text-foreground font-semibold flex items-center gap-1.5 mt-0.5">
                            <CreditCard size={12} className="text-emerald-500" />
                            {reservation.paymentMethod || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-500 dark:text-zinc-500 uppercase block font-bold">Reference Number</span>
                          <span className="text-foreground font-mono font-semibold block mt-0.5 select-all">
                            {reservation.referenceNumber || "—"}
                          </span>
                        </div>
                      </div>
                      {reservation.proofOfPayment && (
                        <div className="border-t border-emerald-500/10 pt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText size={13} className="text-emerald-500 shrink-0" />
                            <div className="truncate flex-1 text-xs">
                              <span className="text-[9px] text-neutral-500 dark:text-zinc-500 block font-bold">Proof Receipt File</span>
                              <button
                                type="button"
                                onClick={() => setLightboxImage(reservation.proofOfPayment!)}
                                className="text-foreground/90 italic truncate block mt-0.5 text-left hover:text-emerald-500 hover:underline cursor-pointer outline-none"
                              >
                                {reservation.proofOfPayment.startsWith("http")
                                  ? reservation.proofOfPayment.split("/").pop()
                                  : reservation.proofOfPayment}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setLightboxImage(reservation.proofOfPayment!)}
                              className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold underline shrink-0 cursor-pointer outline-none"
                            >
                              View Receipt
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLightboxImage(reservation.proofOfPayment!)}
                            className="rounded-lg overflow-hidden border border-card-border/80 max-h-40 bg-black/20 flex items-center justify-center cursor-pointer w-full hover:border-emerald-500/30 transition-all outline-none"
                          >
                            {reservation.proofOfPayment.startsWith("http") ? (
                              <img
                                src={reservation.proofOfPayment}
                                alt="Proof of payment receipt"
                                className="max-h-40 w-auto object-contain"
                              />
                            ) : (
                              <div className="py-6 text-center text-[10px] text-neutral-500 font-light">
                                📄 Click to View Mock Receipt
                              </div>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Action buttons */}
                <div className="border-t border-card-border/40 pt-5 space-y-3" onClick={(e) => e.stopPropagation()}>
                  <h4 className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-zinc-500 font-bold">Manage Status</h4>

                  {/* Cancellation Requested — Admin Review Panel */}
                  {currentStatus === "Cancellation Requested" && (() => {
                    const bookingDate = new Date(reservation.date);
                    const now = new Date();
                    const diffMs = bookingDate.getTime() - now.getTime();
                    const diffHours = diffMs / (1000 * 60 * 60);
                    const diffDays = diffHours / 24;
                    const isTable = reservation.eventType === "Table Reservation";
                    // Table: full refund if >= 24h before; Cart: full refund if >= 7 days before
                    const isEligibleForRefund = isTable ? diffHours >= 24 : diffDays >= 7;
                    const policyThreshold = isTable ? "24 hours" : "1 week";

                    return (
                      <div className="space-y-3">
                        {/* Cancellation Request Info */}
                        <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.03] p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-orange-500/15 flex items-center justify-center">
                              <span className="text-orange-500 text-[10px]">!</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-wider font-bold text-orange-600 dark:text-orange-400">Cancellation Request</span>
                          </div>

                          {/* Customer Reason */}
                          {reservation.cancellationReason && (
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-zinc-500 font-bold">Customer Reason</span>
                              <p className="text-xs text-foreground/90 italic leading-relaxed rounded-lg bg-foreground/[0.03] border border-card-border/40 p-3">
                                "{reservation.cancellationReason}"
                              </p>
                            </div>
                          )}

                          {/* Refund Eligibility */}
                          <div className={`rounded-lg p-3 border text-xs ${
                            isEligibleForRefund
                              ? "bg-emerald-500/[0.05] border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/[0.05] border-red-500/20 text-red-600 dark:text-red-400"
                          }`}>
                            <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider mb-1">
                              {isEligibleForRefund ? (
                                <><Check size={11} /> Full Refund Eligible</>
                              ) : (
                                <><X size={11} /> Downpayment Non-Refundable</>
                              )}
                            </div>
                            <p className="text-[10px] opacity-80 leading-relaxed">
                              {isEligibleForRefund
                                ? `Booking is ${isTable ? `${Math.floor(diffHours)}h` : `${Math.floor(diffDays)}d`} away — qualifies for a full refund (threshold: ${policyThreshold}).`
                                : `Booking is ${isTable ? `${Math.max(0, Math.floor(diffHours))}h` : `${Math.max(0, Math.floor(diffDays))}d`} away — downpayment is non-refundable (threshold: ${policyThreshold}).`
                              }
                            </p>
                          </div>
                        </div>

                        {/* Approve / Reject Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => setConfirmAction({ type: "ApproveCancellation", targetStatus: "Cancelled" })}
                            disabled={updatingStatus !== null}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 py-2.5 type-ui text-[10px] font-bold tracking-wider transition-all duration-300 hover:border-red-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStatus === "Cancelled" ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              <X size={12} />
                            )}
                            {updatingStatus === "Cancelled" ? "Processing..." : "Approve Cancellation"}
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: "RejectCancellation", targetStatus: "Approved" })}
                            disabled={updatingStatus !== null}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 py-2.5 type-ui text-[10px] font-bold tracking-wider transition-all duration-300 hover:border-emerald-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStatus === "Approved" ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}
                            {updatingStatus === "Approved" ? "Processing..." : "Reject Cancellation"}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex gap-3">
                    {currentStatus === "Pending" && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(reservation, "Pre-Approved")}
                          disabled={updatingStatus !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 py-2.5 type-ui text-[10px] font-bold tracking-wider transition-all duration-300 hover:border-amber-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={12} /> Pre-Approve
                        </button>
                        <button
                          onClick={() => setConfirmAction({ type: "Cancel", targetStatus: "Cancelled" })}
                          disabled={updatingStatus !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 py-2.5 type-ui text-[10px] font-bold tracking-wider transition-all duration-300 hover:border-red-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus === "Cancelled" ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <X size={12} />
                          )}
                          {updatingStatus === "Cancelled" ? "Cancelling..." : "Cancel"}
                        </button>
                      </>
                    )}

                    {currentStatus === "Pre-Approved" && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(reservation, "Approved")}
                          disabled={updatingStatus !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 py-2.5 type-ui text-[10px] font-bold tracking-wider transition-all duration-300 hover:border-emerald-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={12} /> Approve & Paid
                        </button>
                        <button
                          onClick={() => setConfirmAction({ type: "Cancel", targetStatus: "Cancelled" })}
                          disabled={updatingStatus !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 py-2.5 type-ui text-[10px] font-bold tracking-wider transition-all duration-300 hover:border-red-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus === "Cancelled" ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <X size={12} />
                          )}
                          {updatingStatus === "Cancelled" ? "Cancelling..." : "Cancel"}
                        </button>
                      </>
                    )}

                    {currentStatus === "Approved" && (
                      <>
                        <button
                          onClick={() => setConfirmAction({ type: "Complete", targetStatus: "Completed" })}
                          disabled={updatingStatus !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 py-2.5 type-ui text-[10px] font-bold tracking-wider transition-all duration-300 hover:border-blue-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus === "Completed" ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Check size={12} />
                          )}
                          {updatingStatus === "Completed" ? "Completing..." : "Complete"}
                        </button>
                        <button
                          onClick={() => setConfirmAction({ type: "Cancel", targetStatus: "Cancelled" })}
                          disabled={updatingStatus !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 py-2.5 type-ui text-[10px] font-bold tracking-wider transition-all duration-300 hover:border-red-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingStatus === "Cancelled" ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <X size={12} />
                          )}
                          {updatingStatus === "Cancelled" ? "Cancelling..." : "Cancel"}
                        </button>
                      </>
                    )}

                    {currentStatus === "Completed" && (
                      <button
                        onClick={() => onUpdateStatus(reservation, "Approved")}
                        disabled={updatingStatus !== null}
                        className="w-full flex items-center justify-center gap-1.5 rounded-full bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 py-2.5 type-ui text-[10px] font-bold tracking-wider transition-all duration-300 hover:border-zinc-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Restore to Active (Approved)
                      </button>
                    )}

                    {currentStatus === "Cancelled" && (
                      <button
                        onClick={() => onUpdateStatus(reservation, "Pending")}
                        disabled={updatingStatus !== null}
                        className="w-full flex items-center justify-center gap-1.5 rounded-full bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 py-2.5 type-ui text-[10px] font-bold tracking-wider transition-all duration-300 hover:border-zinc-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Restore to Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Proof Panel as absolute overlay inside Modal Card */}
              <AnimatePresence>
                {showProofPanel && (
                  <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-0 bg-card p-6 sm:p-8 z-20 flex flex-col justify-between overflow-y-auto font-sans rounded-2xl border border-card-border"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-card-border/40 pb-3">
                        <h4 className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                          <CreditCard size={12} /> Proof of Payment
                        </h4>
                        <button
                          onClick={() => { setShowProofPanel(false); setLivePaymentData(null); }}
                          className="text-neutral-500 hover:text-foreground dark:text-zinc-500 dark:hover:text-white transition-colors duration-300 p-0.5 rounded-full cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Loading state */}
                      {isFetchingProof && (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                          <RefreshCw size={20} className="text-emerald-500 animate-spin" />
                          <span className="text-[11px] text-zinc-500">Fetching latest data...</span>
                        </div>
                      )}

                      {/* Error state */}
                      {!isFetchingProof && proofFetchError && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
                          <p className="text-xs text-red-400">{proofFetchError}</p>
                          <button
                            onClick={handleRefreshProof}
                            className="mt-3 text-[10px] text-emerald-500 hover:underline font-bold"
                          >
                            Try Again
                          </button>
                        </div>
                      )}

                      {/* Not yet submitted */}
                      {!isFetchingProof && !proofFetchError && livePaymentData && !livePaymentData.referenceNumber && !livePaymentData.proofOfPayment && (
                        <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                          <div className="w-10 h-10 rounded-full bg-zinc-500/10 flex items-center justify-center">
                            <CreditCard size={18} className="text-zinc-500" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">No Payment Yet</p>
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            The customer has not submitted a downpayment yet. Ask them to visit their reservation link.
                          </p>
                        </div>
                      )}

                      {/* Live payment data */}
                      {!isFetchingProof && !proofFetchError && livePaymentData && (livePaymentData.referenceNumber || livePaymentData.proofOfPayment) && (
                        <div className="space-y-2">
                          <span className="text-[8px] text-neutral-500 dark:text-zinc-500 uppercase tracking-wider block">Payment Receipt</span>

                          <div className="rounded-xl overflow-hidden border border-emerald-500/20 bg-emerald-500/[0.01] shadow-lg relative p-4 space-y-4">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#005B94]" />

                            <div className="flex flex-col items-center justify-center text-center space-y-1 pt-1">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-lg">
                                ✓
                              </div>
                              <span className="text-[8px] text-[#005B94] font-bold uppercase tracking-widest mt-1">Payment Submitted</span>
                              <p className="text-lg font-bold text-foreground mt-0.5">{calculateAmount()}</p>
                            </div>

                            <div className="space-y-2 text-[10px] border-t border-dashed border-card-border/60 pt-3">
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Method</span>
                                <span className="font-semibold text-foreground">{livePaymentData.paymentMethod || "—"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Sender</span>
                                <span className="font-semibold text-foreground truncate max-w-[150px]">{reservation.fullName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Ref. Number</span>
                                <span className="font-mono font-semibold text-foreground">{livePaymentData.referenceNumber || "—"}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-neutral-500">Proof File</span>
                                {livePaymentData.proofOfPayment ? (
                                  <button
                                    type="button"
                                    onClick={() => setLightboxImage(livePaymentData.proofOfPayment!)}
                                    className="font-sans italic text-emerald-500 hover:text-emerald-400 hover:underline truncate max-w-[120px] font-semibold cursor-pointer block text-left outline-none"
                                    title="Click to view file"
                                  >
                                    {livePaymentData.proofOfPayment.startsWith("http")
                                      ? livePaymentData.proofOfPayment.split("/").pop()
                                      : livePaymentData.proofOfPayment}
                                  </button>
                                ) : (
                                  <span className="text-zinc-500">—</span>
                                )}
                              </div>
                            </div>

                            {livePaymentData.proofOfPayment && (
                              <div className="mt-3 border-t border-dashed border-card-border/60 pt-3">
                                <span className="text-[8px] text-neutral-500 dark:text-zinc-500 block font-bold mb-1.5 uppercase">Receipt Image Preview</span>
                                <button
                                  type="button"
                                  onClick={() => setLightboxImage(livePaymentData.proofOfPayment!)}
                                  className="w-full rounded-lg overflow-hidden border border-emerald-500/20 bg-black/10 hover:border-emerald-500/40 transition-all flex items-center justify-center max-h-44 group cursor-pointer block outline-none"
                                >
                                  {livePaymentData.proofOfPayment.startsWith("http") ? (
                                    <img
                                      src={livePaymentData.proofOfPayment}
                                      alt="Receipt attachment"
                                      className="max-h-44 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="py-8 text-center text-[10px] text-neutral-500 font-light flex flex-col items-center gap-1.5 justify-center w-full">
                                      <span>📄 {livePaymentData.proofOfPayment}</span>
                                      <span className="text-emerald-500 font-bold underline">Click to View Receipt</span>
                                    </div>
                                  )}
                                </button>
                              </div>
                            )}

                            <div className="text-[8px] text-center text-neutral-500 dark:text-zinc-500 pt-2 border-t border-card-border/20">
                              Live data from Supabase
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-card-border/40 pt-4 mt-4 flex gap-2">
                      <button
                        onClick={handleRefreshProof}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-foreground/[0.04] border border-card-border hover:bg-foreground/[0.08] text-neutral-500 hover:text-foreground py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 cursor-pointer"
                      >
                        <RefreshCw size={10} /> Refresh
                      </button>
                      <button
                        onClick={() => { setShowProofPanel(false); setLivePaymentData(null); }}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-foreground/[0.04] border border-card-border hover:bg-foreground/[0.08] text-neutral-500 hover:text-foreground py-2 type-ui text-[9px] font-bold tracking-wider transition-all duration-300 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Lightbox Modal */}
            <AnimatePresence>
              {lightboxImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  {/* Lightbox Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setLightboxImage(null)}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                  />
                  {/* Lightbox Content */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 max-w-3xl w-full max-h-[85vh] flex flex-col items-center gap-4"
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => setLightboxImage(null)}
                      className="absolute -top-12 right-0 text-white hover:text-neutral-300 p-2 rounded-full cursor-pointer bg-white/10 hover:bg-white/20 transition-all outline-none"
                    >
                      <X size={20} />
                    </button>
 
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center p-2 shadow-2xl">
                      {lightboxImage.startsWith("http") || lightboxImage.startsWith("data:image") ? (
                        <img
                          src={lightboxImage}
                          alt="Proof of payment attachment"
                          className="max-h-[75vh] w-auto object-contain"
                        />
                      ) : (
                        /* Clean status info instead of mock transaction */
                        <div className="bg-zinc-900 border border-card-border p-6 rounded-lg text-center w-80 text-white space-y-4 font-sans">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xl mx-auto">
                            ⚠
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">Filename Record Only</h4>
                            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                              This reservation was created with a filename record only, but no image data is stored in the database.
                            </p>
                          </div>
                          <div className="border-t border-card-border/60 pt-4 text-left text-xs font-mono bg-black/20 p-3 rounded space-y-1">
                            <p className="text-zinc-500">File: <span className="text-zinc-300">{lightboxImage}</span></p>
                            <p className="text-zinc-500">Sender: <span className="text-zinc-300">{reservation.fullName}</span></p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <ConfirmModal
              isOpen={confirmAction !== null}
              onClose={() => setConfirmAction(null)}
              title={
                confirmAction?.type === "Complete" ? "Complete Booking"
                  : confirmAction?.type === "ApproveCancellation" ? "Approve Cancellation"
                  : confirmAction?.type === "RejectCancellation" ? "Reject Cancellation"
                  : "Cancel Booking"
              }
              message={
                confirmAction?.type === "Complete"
                  ? `Are you sure you want to mark ${reservation.fullName}'s reservation as completed? This will update their status and send a thank you email.`
                  : confirmAction?.type === "ApproveCancellation"
                    ? `Approve ${reservation.fullName}'s cancellation request? This will set the status to CANCELLED and process any applicable refund.`
                    : confirmAction?.type === "RejectCancellation"
                      ? `Reject the cancellation request from ${reservation.fullName}? Their reservation status will revert to APPROVED & PAID.`
                      : `Are you sure you want to cancel ${reservation.fullName}'s reservation? This action cannot be undone.`
              }
              confirmText={
                confirmAction?.type === "Complete" ? "Complete"
                  : confirmAction?.type === "ApproveCancellation" ? "Approve Cancellation"
                  : confirmAction?.type === "RejectCancellation" ? "Reject Cancellation"
                  : "Cancel Reservation"
              }
              variant={confirmAction?.type === "Complete" || confirmAction?.type === "RejectCancellation" ? "warning" : "danger"}
              onConfirm={handleConfirmAction}
            />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
