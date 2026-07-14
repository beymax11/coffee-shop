"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ChevronLeft, CheckCircle2, Check, CreditCard, Hash, Upload, QrCode } from "lucide-react";
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
  status: "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed";
  paymentMethod?: string;
  referenceNumber?: string;
  proofOfPayment?: string;
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
        console.warn("Supabase upload failed:", err);
      }

      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, referenceNumber, proofOfPayment: finalProofUrl }),
      });
      if (!res.ok) throw new Error("Failed to submit payment");
      onSuccess({ paymentMethod, referenceNumber, proofOfPayment: finalProofUrl });
    } catch {
      setErrors({ submit: "Failed to submit payment. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { id: "GCash" as const, title: "GCash E-Wallet", desc: "Fast downpayment via mobile wallet.", icon: "⚡" },
    { id: "Bank Transfer" as const, title: "Bank Transfer (BPI)", desc: "Direct deposit to our bank account.", icon: CreditCard },
    { id: "QRPh" as const, title: "QRPh Instant Pay", desc: "Scan from any bank or wallet app.", icon: QrCode },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-white/5 pb-4 mb-2">
        <h3 className="text-xl font-serif text-foreground tracking-wide">Submit Downpayment</h3>
        <p className="text-xs text-zinc-500 mt-1 font-light">Required: ₱{pricing.downpayment.toLocaleString()}</p>
      </div>

      {/* Payment Method */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => {
          const isSelected = paymentMethod === method.id;
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setPaymentMethod(method.id)}
              className={`rounded-xl border p-5 text-left transition-all duration-300 flex flex-col justify-between min-h-[120px] select-none outline-none ${
                isSelected
                  ? "bg-gradient-to-br from-[#ECF7F2] to-[#D8ECE1] border-emerald-600/50 dark:from-[#07130E]/95 dark:to-[#0F261B]/95 dark:border-emerald-500/80"
                  : "bg-card border-card-border text-neutral-500 hover:border-emerald-600/30"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border text-sm ${
                  isSelected ? "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-[#2E5A44]/20 dark:text-emerald-400 dark:border-emerald-500/40" : "bg-zinc-100 dark:bg-white/5 text-zinc-500 border-zinc-200 dark:border-white/5"
                }`}>
                  {typeof Icon === "string" ? <span>{Icon}</span> : <Icon size={16} />}
                </div>
                {isSelected && <Check size={16} className="text-emerald-600 dark:text-emerald-400" />}
              </div>
              <div className="mt-3">
                <h4 className="font-sans font-bold text-xs text-foreground tracking-wide">{method.title}</h4>
                <p className="font-sans text-[10px] text-zinc-500 dark:text-zinc-400 font-light mt-1">{method.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="p-4 border border-card-border bg-[#0D1D16]/45 dark:bg-[#07130E]/65 rounded-xl text-xs text-zinc-400 space-y-1 font-light leading-relaxed">
        {paymentMethod === "GCash" && (
          <><p>1. Send the downpayment to GCash account: <strong className="text-foreground font-mono">0917-123-4567 (ANTONIONI G.)</strong></p><p>2. Enter the reference number and upload your screenshot below.</p></>
        )}
        {paymentMethod === "Bank Transfer" && (
          <><p>1. Transfer to BPI — Account Name: <strong className="text-foreground">Antonioni Grounds Café</strong>, Account No: <strong className="text-foreground font-mono">1234-5678-9012</strong></p><p>2. Enter the transaction number and upload your receipt below.</p></>
        )}
        {paymentMethod === "QRPh" && (
          <p>Scan the QRPh code using your bank app or e-wallet (GCash, Maya, BPI, BDO). Enter the reference number and upload your screenshot below.</p>
        )}
      </div>

      {/* Reference Number */}
      <div className="space-y-2">
        <label className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-500 block pl-1">
          Reference / Transaction Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <Hash size={14} />
          </div>
          <input
            type="text"
            placeholder="e.g. 5001 1234 5678"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-mono text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-600"
          />
        </div>
        {errors.referenceNumber && <span className="text-xs text-red-500 block">{errors.referenceNumber}</span>}
      </div>

      {/* Proof Upload */}
      <div className="space-y-2">
        <label className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-500 block pl-1">
          Screenshot Proof of Payment
        </label>
        <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all ${
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

  useEffect(() => { fetchReservation(); }, [fetchReservation]);

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
              {isPaid ? "Booking Secured" : reservation.status === "Cancelled" ? "Booking Cancelled" : "Reservation Confirmed"}
            </h1>
            <p className="text-sm text-zinc-500 font-light mt-2 leading-relaxed max-w-sm mx-auto">
              {isPaid ? (
                <>Your downpayment has been received. Your booking is now <strong className="text-emerald-500">fully secured</strong>. We look forward to hosting you!</>
              ) : canPay ? (
                <>Your booking is <strong className="text-amber-500">pre-approved</strong>! Click <strong className="text-foreground">Pay Now</strong> below to submit your downpayment and fully secure your slot.</>
              ) : reservation.status === "Cancelled" ? (
                <>Your booking has been <strong className="text-red-500">cancelled</strong>. Contact us if you think this is an error.</>
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
                    setReservation((prev) => prev ? { ...prev, ...data } : prev);
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
                    {reservation.notes && (
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">Special Requests</span>
                        <span className="text-foreground font-semibold italic">{reservation.notes}</span>
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
                  {isPaid && paidData && (
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
                <div className="flex justify-center gap-3.5">
                  <a
                    href="/menu"
                    className="rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                  >
                    Explore Menu
                  </a>
                  {isPaid ? (
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <Check size={14} className="stroke-[2.5]" />
                      Paid & Secured
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
    </PageTransition>
  );
}
