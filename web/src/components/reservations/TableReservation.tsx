import React from "react";
import { Users, MapPin } from "lucide-react";
import { FormData } from "./ReservationsView";

interface TableReservationFormProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  updateField: (field: keyof FormData, value: any) => void;
  labelAccent: string;
}

export function TableReservationForm({
  formData,
  errors,
  updateField,
  labelAccent,
}: TableReservationFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-zinc-200 dark:border-white/5">
      {/* Guest Count Input Field */}
      <div className="space-y-2 col-span-1">
        <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
          Guest Count
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
            <Users size={14} />
          </div>
          <input
            type="number"
            required
            min={1}
            max={4}
            value={formData.guestCount || ""}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              updateField("guestCount", isNaN(val) ? "" : Math.min(4, Math.max(1, val)));
            }}
            className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="e.g. 2"
          />
        </div>
        <span className="text-[9px] text-zinc-500 pl-1 font-sans block">Capacity: 1 - 4 guests</span>
        {errors.guestCount && <span className="type-error block mt-1 text-xs text-red-500 font-sans">{errors.guestCount}</span>}
      </div>

      {/* Venue / Location Address (Disabled for Table Reservation) */}
      <div className="space-y-2 col-span-1">
        <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
          Location
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <MapPin size={14} className="text-zinc-500" />
          </div>
          <input
            type="text"
            disabled
            value="Antonioni Grounds - Tiaong"
            className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-zinc-500 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}

export function TableReservationPolicy() {
  return (
    <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10 mt-6 space-y-2">
      <h4 className="text-xs font-serif font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mb-1">
        Antonioni Grounds - Tiaong Lounge Reserve Policy
      </h4>
      <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
        Lounge table reservations require a fee of <strong>₱3,500 for a 3-hour duration</strong> (with a <strong>₱1,000 downpayment required</strong> to secure your reservation). This amount is <strong>fully consumable</strong> for any orders of food and drinks.
      </p>
      <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
        <strong>Consumable Terms:</strong> Any order exceeding ₱3,500 will be subject to an additional charge. If the total order value is less than ₱3,500, no refund or credit will be issued for the difference.
      </p>
      <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
        <strong>Cancellation & Refund:</strong> Cancellations made at least <strong>24 hours before</strong> the scheduled booking date are eligible for a full refund.
      </p>
    </div>
  );
}


interface TableReservationReceiptProps {
  formData: FormData;
  ticketId: string;
  endTime: string;
  totalPrice: number;
  downpayment: number;
}

export function TableReservationReceipt({
  formData,
  ticketId,
  endTime,
  totalPrice,
  downpayment,
}: TableReservationReceiptProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2 font-sans text-zinc-600 dark:text-zinc-400 print:text-zinc-800">
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Guest Name</span>
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block">{formData.fullName}</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Contact Phone</span>
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block">{formData.phone}</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Experience</span>
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block">Lounge Table Reservation</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Schedule</span>
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block">{formData.date} at {formData.time} - {endTime}</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Package Price</span>
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block">₱{totalPrice.toLocaleString()}</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Downpayment (Required)</span>
        <span className="font-sans text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">₱{downpayment.toLocaleString()}</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Store Location</span>
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block">Antonioni Grounds - Tiaong</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Special Requests</span>
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block italic">{formData.notes || "None"}</span>
      </div>
      {formData.referenceNumber && (
        <>
          <div>
            <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Payment Method</span>
            <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block">{formData.paymentMethod}</span>
          </div>
          <div>
            <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Reference Number</span>
            <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block font-mono">{formData.referenceNumber}</span>
          </div>
          <div>
            <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Proof Uploaded</span>
            <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block truncate max-w-[150px]">{formData.proofOfPayment}</span>
          </div>
        </>
      )}
      <div className="col-span-2 border-t border-zinc-200 dark:border-white/5 print:border-zinc-200 pt-3">
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Consumable Policy & Refund terms</span>
        <span className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 print:text-zinc-700 font-light leading-relaxed block mt-1">
          The ₱3,500 fee is fully consumable for food & drinks during your 3-hour slot (₱1,000 downpayment required). Orders exceeding ₱3,500 are charged extra. No refund for orders under ₱3,500. Cancel up to 24 hours before the booking date for a full refund.
        </span>
      </div>
    </div>
  );
}
