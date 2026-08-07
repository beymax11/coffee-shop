"use client";

import React, { useEffect } from "react";
import { Calendar, X, Coffee, Truck, Clock, RefreshCw, AlertCircle } from "lucide-react";

interface ReservationPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationPolicyModal: React.FC<ReservationPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card border border-card-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-card-border flex items-center justify-between bg-background-alt/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 block font-sans">
                Antonioni Booking Guidelines
              </span>
              <h3 className="text-xl font-serif font-semibold text-foreground mt-0.5">
                Reservation Policy
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 hover:text-foreground transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm leading-relaxed font-sans">
          {/* Card 1: Lounge Table */}
          <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs">
              <Coffee className="w-4 h-4" />
              1. Lounge Table Reservation Policy
            </div>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm">
              <li>
                <strong>Pricing & Duration:</strong> Lounge table reservations are <strong>₱3,500 for a 3-hour duration</strong>.
              </li>
              <li>
                <strong>Downpayment:</strong> A <strong>₱1,000 downpayment</strong> is required upon booking to secure your reserved lounge slot.
              </li>
              <li>
                <strong>Fully Consumable:</strong> The entire ₱3,500 rate is 100% consumable for any food, artisanal beverages, and specialty items from our menu. Orders exceeding ₱3,500 will be billed separately. Unused balances are non-refundable.
              </li>
              <li>
                <strong>Cancellation & Refunds:</strong> Cancellations submitted at least <strong>24 hours before</strong> your scheduled booking time receive a 100% full refund of the downpayment.
              </li>
              <li>
                <strong>Grace Period:</strong> Reserved tables are held for up to 15 minutes past your scheduled reservation time. Please notify us if you are running late.
              </li>
            </ul>
          </div>

          {/* Card 2: Brew Buggy */}
          <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs">
              <Truck className="w-4 h-4" />
              2. Brew Buggy Mobile Coffee Cart Policy
            </div>
            <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm">
              <li>
                <strong>Inclusions:</strong> Includes the mobile coffee cart setup, 2 professional baristas, complete drink wares, specialty beans, and 3 hours of active serving time.
              </li>
              <li>
                <strong>Downpayment:</strong> A <strong>10% downpayment</strong> based on your selected package size (50, 100, 150, or 200 Pax) is required upon booking submission.
              </li>
              <li>
                <strong>Cancellation Terms:</strong> 100% full refund if cancelled at least <strong>1 week prior</strong> to the event date. Downpayments are non-refundable for cancellations made less than 24 hours before event commencement.
              </li>
              <li>
                <strong>Venue Location & Travel Fee:</strong> Detailed venue address coordinates must be provided. Transportation fees are calculated dynamically based on distance from Poblacion 3, Tiaong, Quezon.
              </li>
            </ul>
          </div>

          {/* Card 3: Notice & Rescheduling */}
          <div className="p-4 bg-background-alt/60 rounded-xl border border-card-border flex items-start gap-3">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">
                Rescheduling & Support
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                To reschedule a booking or inquire about custom event packages, please contact our concierge team at <strong>+63 (917) 123-4567</strong> or email <strong>reservations@antonionigrounds.com</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-card-border bg-background-alt/50 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-zinc-400 font-sans">
            Updated: August 2026
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Close Policy
          </button>
        </div>
      </div>
    </div>
  );
};
