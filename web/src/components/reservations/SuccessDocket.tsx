import React from "react";
import { ChevronLeft, CheckCircle2, Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FormData } from "./ReservationsView";
import { TableReservationReceipt } from "./TableReservation";
import { CartReservationReceipt } from "./CartReservation";
import { PaymentMethod } from "./PaymentMethod";

interface SuccessDocketProps {
  step: number;
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  updateField: (field: keyof FormData, value: any) => void;
  labelAccent: string;
  ticketId: string;
  reservationStatus: "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Cancellation Requested";
  isPaid: boolean;
  showPaymentForm: boolean;
  setShowPaymentForm: (show: boolean) => void;
  handleConfirmPayment: () => void;
  getEndTimeString: (startTimeStr: string) => string;
  getPricingDetails: () => {
    totalPrice: number;
    downpayment: number;
    label: string;
    notes: string;
  };
  onFileSelect?: (file: File) => void;
}

export function SuccessDocket({
  step,
  formData,
  errors,
  updateField,
  labelAccent,
  ticketId,
  reservationStatus,
  isPaid,
  showPaymentForm,
  setShowPaymentForm,
  handleConfirmPayment,
  getEndTimeString,
  getPricingDetails,
  onFileSelect,
}: SuccessDocketProps) {
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [cancelReasonError, setCancelReasonError] = React.useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = React.useState(false);
  const [hasCancellationRequested, setHasCancellationRequested] = React.useState(
    reservationStatus === "Cancellation Requested"
  );

  // Sync from prop changes (e.g. interval polling)
  React.useEffect(() => {
    if (reservationStatus === "Cancellation Requested") {
      setHasCancellationRequested(true);
    }
  }, [reservationStatus]);

  const handleSubmitCancellation = async () => {
    if (!cancelReason.trim()) {
      setCancelReasonError("Please provide a reason for cancellation.");
      return;
    }
    setCancelReasonError("");
    setIsSubmittingCancel(true);

    try {
      // Update in Supabase via API
      await fetch(`/api/reservations/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Cancellation Requested",
          cancellationReason: cancelReason.trim(),
        }),
      });

      // Update localStorage too
      if (typeof window !== "undefined") {
        try {
          const reservations = JSON.parse(localStorage.getItem("reservations") || "[]");
          const idx = reservations.findIndex((r: any) => r.id === ticketId);
          if (idx >= 0) {
            reservations[idx] = {
              ...reservations[idx],
              status: "Cancellation Requested",
              cancellationReason: cancelReason.trim(),
            };
            localStorage.setItem("reservations", JSON.stringify(reservations));
            window.dispatchEvent(new Event("storage"));
          }
        } catch { /* non-blocking */ }
      }

      setHasCancellationRequested(true);
      setShowCancelModal(false);
      setCancelReason("");
    } catch (err) {
      console.error("Failed to submit cancellation request:", err);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Compute refund eligibility message based on policy
  const getCancellationPolicyInfo = () => {
    const isTable = formData.eventType === "Table Reservation";
    if (isTable) {
      return {
        title: "Table Reservation Cancellation Policy",
        refundWindow: "24 hours",
        fullRefundLine: "Reservations cancelled at least 24 hours before the scheduled booking date are eligible for a full refund.",
        nonRefundLine: "Downpayment is non-refundable if cancelled less than 24 hours before the scheduled booking date.",
      };
    }
    return {
      title: "Mobile Cart Reservation Cancellation Policy",
      refundWindow: "1 week",
      fullRefundLine: "Reservations cancelled at least 1 week before the scheduled booking date are eligible for a full refund.",
      nonRefundLine: "Downpayment is non-refundable if cancelled less than 1 week before the scheduled booking date.",
    };
  };

  const policyInfo = getCancellationPolicyInfo();

  return (
    <div className="max-w-xl mx-auto py-8 print:py-0 print:max-w-none">
      {/* STEP 3: SUCCESS CONFIRMATION SCREEN */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 print:space-y-0"
        >
          {showPaymentForm ? (
            <div className="bg-card border border-card-border p-6 rounded-2xl shadow-xl max-w-xl mx-auto text-left relative">
              <PaymentMethod
                formData={formData}
                errors={errors}
                updateField={updateField}
                labelAccent={labelAccent}
                onFileSelect={onFileSelect}
              />
              <div className="flex justify-between pt-6 border-t border-zinc-200 dark:border-white/5 mt-8">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-600/5 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/10 transition-all active:scale-95 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="flex items-center gap-1.5 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-8 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-white border border-[#2E5A44]/30 transition-all shadow-[0_0_20px_rgba(46,90,68,0.3)] hover:shadow-[0_0_25px_rgba(46,90,68,0.5)] active:scale-95 cursor-pointer"
                >
                  Confirm Payment
                  <CheckCircle2 size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2E5A44]/10 border border-[#2E5A44]/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(46,90,68,0.2)] print:hidden">
                <CheckCircle2 size={36} className="stroke-[1.5]" />
              </div>

              <div className="space-y-2 print:hidden">
                <h3 className="text-3xl font-serif text-foreground tracking-wide font-semibold">
                  {reservationStatus === "Cancelled" ? "Booking Cancelled" : reservationStatus === "Approved" ? "Booking Secured" : hasCancellationRequested || reservationStatus === "Cancellation Requested" ? "Cancellation Requested" : isPaid ? "Payment Pending Verification" : "Reservation Confirmed"}
                </h3>
                <p className="font-sans text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed max-w-md mx-auto">
                  {reservationStatus === "Cancelled" ? (
                    <>
                      We regret to inform you that your booking request has been <strong className="text-red-500">cancelled</strong>. Please contact support if you believe this was an error.
                    </>
                  ) : reservationStatus === "Approved" && !hasCancellationRequested ? (
                    <>
                      Your downpayment has been received. Your booking with Antonioni Grounds is now <strong className="text-emerald-500">fully secured and approved</strong>. We look forward to hosting you!
                    </>
                  ) : hasCancellationRequested || reservationStatus === "Cancellation Requested" ? (
                    <>
                      Your cancellation request has been submitted. Our team will review it and <strong className="text-amber-500">process your request shortly</strong>. You will be notified of the outcome.
                    </>
                  ) : isPaid ? (
                    <>
                      Your payment information has been submitted successfully. We are now <strong className="text-amber-500">verifying your downpayment receipt</strong>. We will notify you once approved.
                    </>
                  ) : reservationStatus === "Pre-Approved" ? (
                    <>
                      Your booking has been <strong className="text-amber-500">pre-approved</strong>! Click <strong className="text-foreground font-semibold">Pay Now</strong> below to submit your downpayment and fully secure your slot.
                    </>
                  ) : (
                    <>
                      Your booking has been received. Please wait for review and pre-approval from our administration. The Pay Now button will activate once approved.
                    </>
                  )}
                </p>
              </div>

              {/* Visual Receipt Card */}
              <div
                id="reservation-ticket"
                className="max-w-md mx-auto rounded-xl border border-card-border bg-card p-8 text-left space-y-6 relative border-t-4 border-t-[#2E5A44] shadow-2xl overflow-hidden font-sans print:bg-white print:text-black print:border-t-black print:border print:border-zinc-300 print:shadow-none print:max-w-none"
              >
                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-3">
                  <div>
                    <span className="font-sans text-[9px] uppercase tracking-widest text-zinc-500 print:text-zinc-500 block">Reservation ID</span>
                    <h4 className="font-mono text-sm text-foreground print:text-black mt-1 tracking-wider">#{ticketId || "LN-XXXXXX"}</h4>
                  </div>

                  {reservationStatus === "Cancelled" ? (
                    <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded font-bold shadow-[0_0_10px_rgba(239,68,68,0.1)] print:text-black print:bg-zinc-100 print:border-zinc-300 print:shadow-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 print:bg-zinc-500" />
                      CANCELLED
                    </span>
                  ) : reservationStatus === "Approved" && !hasCancellationRequested ? (
                    <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-[#2E5A44]/10 border border-[#2E5A44]/30 px-2.5 py-1 rounded font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)] print:text-black print:bg-zinc-100 print:border-zinc-300 print:shadow-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] print:bg-zinc-500" />
                      APPROVED & PAID
                    </span>
                  ) : hasCancellationRequested || reservationStatus === "Cancellation Requested" ? (
                    <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded font-bold shadow-[0_0_10px_rgba(249,115,22,0.1)] print:text-black print:bg-zinc-100 print:border-zinc-300 print:shadow-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)] print:bg-zinc-500 print:animate-none print:shadow-none" />
                      CANCELLATION REQUESTED
                    </span>
                  ) : isPaid ? (
                    <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)] print:text-black print:bg-zinc-100 print:border-zinc-300 print:shadow-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)] print:bg-zinc-500 print:animate-none print:shadow-none" />
                      PENDING VERIFICATION
                    </span>
                  ) : reservationStatus === "Pre-Approved" ? (
                    <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)] print:text-black print:bg-zinc-100 print:border-zinc-300 print:shadow-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)] print:bg-zinc-500 print:animate-none print:shadow-none" />
                      PRE-APPROVED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-500/10 border border-zinc-500/30 px-2.5 py-1 rounded font-bold shadow-[0_0_10px_rgba(113,113,122,0.1)] print:text-black print:bg-zinc-100 print:border-zinc-300 print:shadow-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400 animate-pulse shadow-[0_0_8px_rgba(113,113,122,0.8)] print:bg-zinc-500 print:animate-none print:shadow-none" />
                      PENDING APPROVAL
                    </span>
                  )}
                </div>

                {formData.eventType === "Table Reservation" ? (
                  <TableReservationReceipt
                    formData={formData}
                    ticketId={ticketId}
                    endTime={getEndTimeString(formData.time)}
                    totalPrice={getPricingDetails().totalPrice}
                    downpayment={getPricingDetails().downpayment}
                  />
                ) : (
                  <CartReservationReceipt
                    formData={formData}
                    ticketId={ticketId}
                    endTime={getEndTimeString(formData.time)}
                    totalPrice={getPricingDetails().totalPrice}
                    downpayment={getPricingDetails().downpayment}
                  />
                )}
              </div>

              <div className="pt-6 flex flex-col items-center gap-2 print:hidden">
                <div className="flex justify-center gap-3.5 w-full flex-wrap">
                  <a
                    href="/menu"
                    className="rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                  >
                    Explore Menu
                  </a>
                  {reservationStatus === "Cancelled" ? (
                    <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-red-600 dark:text-red-400 border border-red-500/20">
                      <X size={14} className="stroke-[2.5]" />
                      Cancelled
                    </div>
                  ) : isPaid || reservationStatus === "Approved" ? (
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {/* Paid & Secured badge */}
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Check size={14} className="stroke-[2.5]" />
                        Paid & Secured
                      </div>

                      {/* Cancel Reservation button — only if not yet requested */}
                      {!hasCancellationRequested && reservationStatus !== "Cancellation Requested" && (
                        <button
                          type="button"
                          onClick={() => setShowCancelModal(true)}
                          className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/5 px-5 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all active:scale-95 cursor-pointer"
                        >
                          <X size={13} className="stroke-[2.5]" />
                          Cancel Reservation
                        </button>
                      )}

                      {/* Cancellation Requested badge */}
                      {(hasCancellationRequested || reservationStatus === "Cancellation Requested") && (
                        <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-5 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-orange-600 dark:text-orange-400 border border-orange-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                          Cancellation Requested
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={reservationStatus !== "Pre-Approved"}
                      onClick={() => setShowPaymentForm(true)}
                      className={`flex items-center gap-1.5 rounded-full px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-white border transition-all ${
                        reservationStatus === "Pre-Approved"
                          ? "bg-[#2E5A44] hover:bg-[#234533] border-[#2E5A44]/30 shadow-[0_0_20px_rgba(46,90,68,0.25)] hover:shadow-[0_0_25px_rgba(46,90,68,0.4)] active:scale-95 cursor-pointer"
                          : "bg-zinc-500/15 border-zinc-500/10 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      Pay Now
                    </button>
                  )}
                </div>
                {reservationStatus === "Pending" && (
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-light mt-1 animate-pulse">
                    Pay Now becomes active once booking is approved by Admin
                  </span>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}

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
                <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-amber-600 dark:text-amber-400">{policyInfo.title}</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <p className="text-foreground leading-relaxed">{policyInfo.fullRefundLine}</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <p className="text-foreground leading-relaxed">{policyInfo.nonRefundLine}</p>
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
    </div>
  );
}
