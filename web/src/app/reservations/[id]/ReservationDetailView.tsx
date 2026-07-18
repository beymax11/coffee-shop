"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, ChevronLeft, CheckCircle2, Check, CreditCard, Hash, Upload, QrCode, X, AlertTriangle } from "lucide-react";
import { PageTransition } from "@/components/animations";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReservationData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  date: string;
  time: string;
  guestCount: number;
  location: string;
  notes?: string;
  status: "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested";
  paymentMethod?: string;
  referenceNumber?: string;
  proofOfPayment?: string;
  cancellationReason?: string;
  created_at?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPaymentInfo(eventType: string, guestCount: number) {
  if (eventType === "Table Reservation") {
    return { total: 3500, downpayment: 1000, balance: 2500 };
  }
  const packages: Record<number, number> = { 50: 5500, 100: 11000, 150: 16500, 200: 22000 };
  const total = packages[guestCount] || 5500;
  const dp = Math.round(total * 0.1);
  return { total, downpayment: dp, balance: total - dp };
}

function getEndTime(timeStr: string) {
  if (!timeStr) return "";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  h = (h + 3) % 24;
  const endAmPm = h >= 12 ? "PM" : "AM";
  let endH = h % 12;
  if (endH === 0) endH = 12;
  return `${String(endH).padStart(2, "0")}:${m} ${endAmPm}`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({
  status,
  isPaid,
}: {
  status: ReservationData["status"];
  isPaid: boolean;
}) {
  if (status === "Cancelled")
    return (
      <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
        CANCELLED
      </span>
    );
  if (status === "Completed")
    return (
      <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
        COMPLETED
      </span>
    );
  if (status === "Cancellation Requested") {
    return (
      <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded font-bold shadow-[0_0_10px_rgba(249,115,22,0.1)]">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
        CANCELLATION REQUESTED
      </span>
    );
  }
  if (status === "Approved") {
    return (
      <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-[#2E5A44]/10 border border-[#2E5A44]/30 px-2.5 py-1 rounded font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        APPROVED & PAID
      </span>
    );
  }
  if (isPaid) {
    return (
      <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        PENDING VERIFICATION
      </span>
    );
  }
  if (status === "Pre-Approved") {
    return (
      <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        PRE-APPROVED
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-500/10 border border-zinc-500/30 px-2.5 py-1 rounded font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400 animate-pulse shadow-[0_0_8px_rgba(113,113,122,0.8)]" />
      PENDING APPROVAL
    </span>
  );
}

// ─── Payment Form (inline PaymentMethod) ─────────────────────────────────────

function PaymentForm({
  reservationId,
  pricing,
  onSuccess,
}: {
  reservationId: string;
  pricing: { downpayment: number };
  onSuccess: (data: { paymentMethod: string; referenceNumber: string; proofOfPayment: string }) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"GCash" | "Bank Transfer" | "QRPh">("GCash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!referenceNumber.trim()) errs.referenceNumber = "Reference number is required";
    if (!proofFile) errs.proofFile = "Please upload your proof of payment";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    const file = proofFile;
    if (!file) return;

    setErrors({});
    setIsSubmitting(true);
    try {
      let finalProofUrl = file.name;

      // Base64 conversion as local testing fallback
      const getBase64 = (f: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(f);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      };
      try {
        finalProofUrl = await getBase64(file);
      } catch (err) {
        console.warn("Base64 conversion failed:", err);
      }

      // Try uploading to Supabase
      try {
        const { supabase } = await import("@/utils/supabase");
        if (supabase) {
          const fileExt = file.name.split(".").pop();
          const fileName = `proof-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("menu-images")
            .upload(fileName, file, { cacheControl: "3600", upsert: true });

          if (uploadError) {
            console.error("Supabase Storage upload error for proof:", uploadError);
          } else if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from("menu-images")
              .getPublicUrl(fileName);
            finalProofUrl = publicUrl;
          }
        }
      } catch (err) {
        console.error("Failed to upload proof of payment file:", err);
      }

      // Update via DB API
      const patchRes = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          referenceNumber,
          proofOfPayment: finalProofUrl,
        }),
      });

      if (!patchRes.ok) throw new Error("Failed to submit payment reference.");

      // Locally update mock storage
      if (typeof window !== "undefined") {
        try {
          const reservations = JSON.parse(localStorage.getItem("reservations") || "[]");
          const idx = reservations.findIndex((r: any) => r.id === reservationId);
          if (idx >= 0) {
            reservations[idx] = {
              ...reservations[idx],
              paymentMethod,
              referenceNumber,
              proofOfPayment: finalProofUrl,
            };
            localStorage.setItem("reservations", JSON.stringify(reservations));
            window.dispatchEvent(new Event("storage"));
          }
        } catch { /* ignore fallback write errors */ }
      }

      onSuccess({ paymentMethod, referenceNumber, proofOfPayment: finalProofUrl });
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Submission failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-white/5 pb-4">
        <h3 className="text-lg font-serif text-foreground font-semibold">Select Downpayment Method</h3>
        <p className="text-xs text-zinc-500 mt-1">Please transfer the downpayment to confirm your booking reservation slot.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["GCash", "Bank Transfer", "QRPh"] as const).map((method) => {
          const active = paymentMethod === method;
          return (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentMethod(method)}
              className={`rounded-xl border p-4 text-center cursor-pointer transition-all duration-300 ${
                active
                  ? "bg-[#2E5A44]/10 border-[#2E5A44] text-emerald-500 font-bold"
                  : "bg-background border-card-border hover:bg-foreground/[0.02] text-zinc-400"
              }`}
            >
              <CreditCard size={18} className="mx-auto mb-2 text-inherit" />
              <span className="text-[10px] uppercase tracking-wider block">{method}</span>
            </button>
          );
        })}
      </div>

      {/* Payment details container */}
      <div className="rounded-xl border border-card-border bg-[#2E5A44]/[0.02] p-4 text-xs space-y-4">
        <div className="flex justify-between items-center border-b border-card-border/40 pb-2">
          <span className="text-zinc-500">Downpayment Amount</span>
          <span className="text-emerald-500 font-bold font-mono text-sm">₱{pricing.downpayment.toLocaleString()}</span>
        </div>

        {paymentMethod === "GCash" && (
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold text-foreground">GCash Transfer Details:</p>
            <p className="text-zinc-400">Account Name: <strong className="text-foreground">ANTONIONI G.</strong></p>
            <p className="text-zinc-400">Account Number: <strong className="text-foreground font-mono">0917-123-4567</strong></p>
          </div>
        )}

        {paymentMethod === "Bank Transfer" && (
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold text-foreground">Bank Account Details (BDO):</p>
            <p className="text-zinc-400">Account Name: <strong className="text-foreground">Antonioni Grounds Inc.</strong></p>
            <p className="text-zinc-400">Account Number: <strong className="text-foreground font-mono">0012-3456-7890</strong></p>
          </div>
        )}

        {paymentMethod === "QRPh" && (
          <div className="space-y-3 leading-relaxed flex flex-col items-center">
            <p className="font-bold text-foreground self-start">Scan QRPh Code to pay:</p>
            <div className="w-32 h-32 bg-white rounded-lg p-2 border border-zinc-200 flex items-center justify-center relative">
              <QrCode size={110} className="text-black" />
            </div>
            <p className="text-[10px] text-zinc-500 text-center">Scan with GCash, PayMaya, BDO, or any banking app.</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#2E5A44] block pl-1">Reference Number</label>
          <div className="relative">
            <Hash className="absolute left-3 top-3.5 text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="Enter payment reference ID code"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full rounded-lg border border-card-border bg-background/50 pl-9 pr-4 py-3 text-xs text-foreground outline-none focus:border-emerald-500 transition-all font-mono"
            />
          </div>
          {errors.referenceNumber && <span className="text-xs text-red-500 block pl-1">{errors.referenceNumber}</span>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#2E5A44] block pl-1">Upload Receipt Screenshot</label>
          <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
            proofFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-card-border hover:border-emerald-500/30 hover:bg-foreground/[0.02]"
          }`}>
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
            {proofFile ? (
              <><Check size={24} className="text-emerald-500" /><span className="text-sm font-medium text-emerald-500">{proofFile.name}</span></>
            ) : (
              <><Upload size={24} className="text-zinc-500" /><div className="text-center"><p className="text-sm text-zinc-400">Click to upload screenshot</p><p className="text-xs text-zinc-600 mt-0.5">PNG, JPG, PDF accepted</p></div></>
            )}
          </label>
          {errors.proofFile && <span className="text-xs text-red-500 block">{errors.proofFile}</span>}
        </div>

        {errors.submit && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">{errors.submit}</div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-[#2E5A44] hover:bg-[#234533] text-white py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(46,90,68,0.3)] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Check size={14} /> Confirm Downpayment</>}
        </button>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function ReservationDetailView({ reservationId }: { reservationId: string }) {
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paidData, setPaidData] = useState<{ paymentMethod: string; referenceNumber: string } | null>(null);

  // Cancellation States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchReservation = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Reservation not found");
      }
      const data = await res.json();
      const r = data.reservation as ReservationData;
      setReservation(r);
      if (r.referenceNumber || r.proofOfPayment) {
        setIsPaid(true);
        setPaidData({ paymentMethod: r.paymentMethod ?? "", referenceNumber: r.referenceNumber ?? "" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reservation");
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    fetchReservation();
    const interval = setInterval(() => {
      fetchReservation();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchReservation]);

  const handleSubmitCancellation = async () => {
    if (!cancelReason.trim()) {
      setCancelReasonError("Please provide a reason for cancellation.");
      return;
    }
    setCancelReasonError("");
    setIsSubmittingCancel(true);

    try {
      const patchRes = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Cancellation Requested",
          cancellationReason: cancelReason.trim(),
        }),
      });

      if (!patchRes.ok) throw new Error("Failed to submit cancellation request");

      // Locally update mock storage
      if (typeof window !== "undefined") {
        try {
          const reservations = JSON.parse(localStorage.getItem("reservations") || "[]");
          const idx = reservations.findIndex((r: any) => r.id === reservationId);
          if (idx >= 0) {
            reservations[idx] = {
              ...reservations[idx],
              status: "Cancellation Requested",
              cancellationReason: cancelReason.trim(),
            };
            localStorage.setItem("reservations", JSON.stringify(reservations));
            window.dispatchEvent(new Event("storage"));
          }
        } catch { /* ignore fallback errors */ }
      }

      setReservation((prev) => prev ? { ...prev, status: "Cancellation Requested", cancellationReason: cancelReason.trim() } : prev);
      setShowCancelModal(false);
      setCancelReason("");
    } catch (err) {
      console.error("Cancellation submission error:", err);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 font-sans">Loading your reservation...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-serif text-foreground">Reservation Not Found</h2>
          <p className="text-sm text-zinc-500 font-sans">{error || "We couldn't find this reservation."}</p>
          <a href="/reservations" className="inline-block mt-4 rounded-full bg-[#2E5A44] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5">
            Make a New Booking
          </a>
        </div>
      </div>
    );
  }

  const pricing = getPaymentInfo(reservation.eventType, reservation.guestCount);
  const endTime = getEndTime(reservation.time);
  const canPay = (reservation.status === "Pre-Approved" || reservation.status === "Approved") && !isPaid;

  const parseNotesAndFlavors = (notesText: string = "") => {
    let notes = notesText;
    let coffeeFlavor1 = "";
    let coffeeFlavor2 = "";
    let nonCoffeeFlavor1 = "";
    let nonCoffeeFlavor2 = "";

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

  // Cancellation Policy computation
  const isTable = reservation.eventType === "Table Reservation";
  const policyTitle = isTable ? "Table Reservation Cancellation Policy" : "Mobile Cart Reservation Cancellation Policy";
  const fullRefundLine = isTable 
    ? "Reservations cancelled at least 24 hours before the scheduled booking date are eligible for a full refund." 
    : "Reservations cancelled at least 1 week before the scheduled booking date are eligible for a full refund.";
  const nonRefundLine = isTable 
    ? "Downpayment is non-refundable if cancelled less than 24 hours before the scheduled booking date." 
    : "Downpayment is non-refundable if cancelled less than 1 week before the scheduled booking date.";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-8 pb-20 md:pt-16 text-foreground font-sans relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#2E5A44]/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#2E5A44]/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-xl px-4 md:px-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-emerald-500 block mb-3">
              Antonioni Grounds
            </span>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2E5A44]/10 border border-[#2E5A44]/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(46,90,68,0.2)] mb-4">
              <CheckCircle2 size={36} className="stroke-[1.5]" />
            </div>
            <h1 className="text-3xl font-serif text-foreground tracking-tight font-semibold">
              {reservation.status === "Cancelled" ? "Booking Cancelled" : reservation.status === "Approved" ? "Booking Secured" : reservation.status === "Cancellation Requested" ? "Cancellation Requested" : isPaid ? "Payment Pending Verification" : "Reservation Confirmed"}
            </h1>
            <p className="text-sm text-zinc-500 font-light mt-2 leading-relaxed max-w-sm mx-auto">
              {reservation.status === "Cancelled" ? (
                <>Your booking has been <strong className="text-red-500">cancelled</strong>. Contact us if you think this is an error.</>
              ) : reservation.status === "Approved" ? (
                <>Your downpayment has been received. Your booking is now <strong className="text-emerald-500">fully secured</strong>. We look forward to hosting you!</>
              ) : reservation.status === "Cancellation Requested" ? (
                <>Your cancellation request is submitted and <strong className="text-orange-500">pending admin review</strong>.</>
              ) : isPaid ? (
                <>Your payment information has been submitted successfully. We are now <strong className="text-amber-500">verifying your downpayment receipt</strong>. We will notify you once approved.</>
              ) : canPay ? (
                <>Your booking is <strong className="text-amber-500">pre-approved</strong>! Click <strong className="text-foreground">Pay Now</strong> below to submit your downpayment and fully secure your slot.</>
              ) : reservation.status === "Completed" ? (
                <>Thank you for visiting Antonioni Grounds! We hope you had a wonderful experience.</>
              ) : (
                <>Your booking has been received and is <strong>pending review</strong>. You'll receive an email once pre-approved.</>
              )}
            </p>
          </motion.div>

          {/* Payment Form OR Docket */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {canPay && showPayment ? (
              /* Payment Form */
              <div className="bg-card border border-card-border p-6 rounded-2xl shadow-xl text-left relative">
                <button
                  type="button"
                  onClick={() => setShowPayment(false)}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-foreground mb-6 transition-colors font-bold uppercase tracking-wider"
                >
                  <ChevronLeft size={14} /> Back to Reservation
                </button>
                <PaymentForm
                  reservationId={reservation.id}
                  pricing={pricing}
                  onSuccess={(data) => {
                    setIsPaid(true);
                    setPaidData(data);
                    setShowPayment(false);
                    setReservation((prev) => prev ? { ...prev, ...data, status: "Approved" } : prev);
                  }}
                />
              </div>
            ) : (
              /* Reservation Docket */
              <>
                {/* Receipt Card */}
                <div
                  id="reservation-ticket"
                  className="rounded-xl border border-card-border bg-card p-8 text-left space-y-6 relative border-t-4 border-t-[#2E5A44] shadow-2xl overflow-hidden font-sans mb-6"
                >
                  {/* Header row */}
                  <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-3">
                    <div>
                      <span className="font-sans text-[9px] uppercase tracking-widest text-zinc-500 block">Reservation ID</span>
                      <h4 className="font-mono text-sm text-foreground mt-1 tracking-wider">#{reservation.id}</h4>
                    </div>
                    <StatusBadge status={reservation.status} isPaid={isPaid} />
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Guest Name</span>
                      <span className="text-foreground font-semibold">{reservation.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Contact Phone</span>
                      <span className="text-foreground font-semibold">{reservation.phone}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Experience</span>
                      <span className="text-foreground font-semibold">{reservation.eventType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Schedule</span>
                      <span className="text-foreground font-semibold">{reservation.date} at {reservation.time}{endTime ? ` - ${endTime}` : ""}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Package Price</span>
                      <span className="text-foreground font-semibold">₱{pricing.total.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Downpayment (Required)</span>
                      <span className="text-emerald-500 font-bold">₱{pricing.downpayment.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Store Location</span>
                      <span className="text-foreground font-semibold">{reservation.location}</span>
                    </div>
                    {notes && (
                      <div className="col-span-2">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Special Requests</span>
                        <span className="text-foreground font-semibold italic">{notes}</span>
                      </div>
                    )}
                    {coffeeFlavor1 && (
                      <div className="col-span-2 border-t border-zinc-200 dark:border-white/5 pt-3 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Coffee Flavors</span>
                          <span className="text-foreground font-semibold text-xs leading-relaxed block mt-0.5">
                            1. {coffeeFlavor1}<br />
                            2. {coffeeFlavor2}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Non-Coffee Flavors</span>
                          <span className="text-foreground font-semibold text-xs leading-relaxed block mt-0.5">
                            1. {nonCoffeeFlavor1}<br />
                            2. {nonCoffeeFlavor2}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing policy */}
                  {reservation.eventType === "Table Reservation" ? (
                    <div className="border-t border-zinc-200 dark:border-white/5 pt-4">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Consumable Policy & Refund Terms</p>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        The ₱3,500 fee is fully consumable for food & drinks during your 3-hour slot (₱1,000 downpayment required). Orders exceeding ₱3,500 are charged extra. No refund for orders under ₱3,500. Cancel up to 24 hours before the booking date for a full refund.
                      </p>
                    </div>
                  ) : (
                    <div className="border-t border-zinc-200 dark:border-white/5 pt-4">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Brew Buggy Booking Policy</p>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        10% downpayment required to secure your booking. Fully refundable up to 1 week before booking date. Non-refundable if cancelled less than 24h prior.
                      </p>
                    </div>
                  )}

                  {/* Paid confirmation */}
                  {(isPaid || reservation.status === "Approved" || reservation.status === "Cancellation Requested") && paidData && (
                    <div className="border-t border-emerald-500/20 pt-4 bg-emerald-500/[0.03] rounded-b-xl -mx-8 -mb-8 px-8 pb-6">
                      <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider mb-2">✓ Downpayment Submitted</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-zinc-500 block">Method</span>
                          <span className="text-foreground font-semibold">{paidData.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Reference No.</span>
                          <span className="text-foreground font-mono font-semibold">{paidData.referenceNumber}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex justify-center gap-3.5 flex-wrap">
                  <a
                    href="/menu"
                    className="rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                  >
                    Explore Menu
                  </a>
                  {reservation.status === "Cancelled" ? (
                    <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-red-600 dark:text-red-400 border border-red-500/20">
                      <X size={14} className="stroke-[2.5]" />
                      Cancelled
                    </div>
                  ) : isPaid || reservation.status === "Approved" || reservation.status === "Cancellation Requested" ? (
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Check size={14} className="stroke-[2.5]" />
                        Paid & Secured
                      </div>
                      
                      {reservation.status !== "Cancellation Requested" && (
                        <button
                          type="button"
                          onClick={() => setShowCancelModal(true)}
                          className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/5 px-5 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all active:scale-95 cursor-pointer"
                        >
                          <X size={13} className="stroke-[2.5]" />
                          Cancel Reservation
                        </button>
                      )}

                      {reservation.status === "Cancellation Requested" && (
                        <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-5 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-orange-600 dark:text-orange-400 border border-orange-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                          Cancellation Requested
                        </div>
                      )}
                    </div>
                  ) : canPay ? (
                    <button
                      type="button"
                      onClick={() => setShowPayment(true)}
                      className="flex items-center gap-1.5 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-white border border-[#2E5A44]/30 shadow-[0_0_20px_rgba(46,90,68,0.25)] hover:shadow-[0_0_25px_rgba(46,90,68,0.4)] active:scale-95 cursor-pointer transition-all"
                    >
                      Pay Now
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-1.5 rounded-full px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-600 bg-zinc-500/15 border border-zinc-500/10 cursor-not-allowed"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
                {!canPay && !isPaid && reservation.status === "Pending" && (
                  <p className="text-center text-[10px] text-zinc-500 font-light mt-2 animate-pulse">
                    Pay Now becomes active once booking is pre-approved by Admin
                  </p>
                )}

                <div className="text-center mt-6">
                  <a
                    href="/reservations"
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-500 transition-colors font-semibold uppercase tracking-wider"
                  >
                    Make Another Booking →
                  </a>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowCancelModal(false); setCancelReason(""); setCancelReasonError(""); }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-card-border bg-card p-6 shadow-2xl font-sans"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => { setShowCancelModal(false); setCancelReason(""); setCancelReasonError(""); }}
                className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-500 hover:text-foreground hover:bg-foreground/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="space-y-1.5 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground font-semibold tracking-tight">Cancel Reservation</h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light leading-relaxed pl-[2.6rem]">
                  Please read the cancellation policy before proceeding.
                </p>
              </div>

              {/* Policy Card */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 mb-5 space-y-2.5">
                <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-amber-600 dark:text-amber-400">{policyTitle}</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <p className="text-foreground leading-relaxed">{fullRefundLine}</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <p className="text-foreground leading-relaxed">{nonRefundLine}</p>
                  </div>
                </div>
              </div>

              {/* Reason Field */}
              <div className="space-y-2 mb-5">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-red-600 dark:text-red-400 block">
                  Reason for Cancellation <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Please describe why you are cancelling this reservation..."
                  value={cancelReason}
                  onChange={(e) => { setCancelReason(e.target.value); if (cancelReasonError) setCancelReasonError(""); }}
                  className="w-full rounded-lg border border-card-border bg-background-alt/50 px-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20 transition-all resize-none placeholder:text-neutral-400 dark:placeholder:text-zinc-600 min-h-[90px]"
                />
                {cancelReasonError && (
                  <p className="text-xs text-red-500 font-sans">{cancelReasonError}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCancelModal(false); setCancelReason(""); setCancelReasonError(""); }}
                  disabled={isSubmittingCancel}
                  className="flex-1 rounded-full border border-card-border bg-card hover:bg-background-alt px-4 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-zinc-500 hover:text-foreground transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  onClick={handleSubmitCancellation}
                  disabled={isSubmittingCancel}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-red-600 hover:bg-red-700 px-4 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-white border border-red-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_12px_rgba(239,68,68,0.25)]"
                >
                  {isSubmittingCancel ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <X size={13} className="stroke-[2.5]" />
                  )}
                  {isSubmittingCancel ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
