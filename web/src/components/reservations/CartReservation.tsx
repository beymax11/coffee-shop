import React, { useState, useEffect } from "react";
import { Users, MapPin, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FormData } from "./ReservationsView";
import { createPortal } from "react-dom";

interface AddressDetails {
  landmark: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
}

interface CartReservationFormProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  updateField: (field: keyof FormData, value: any) => void;
  labelAccent: string;
  addressDetails: AddressDetails;
  setAddressDetails: React.Dispatch<React.SetStateAction<AddressDetails>>;
  isAddressExpanded: boolean;
  setIsAddressExpanded: (expanded: boolean) => void;
  handleSaveAddress: () => void;
  isPackageModalOpen: boolean;
  setIsPackageModalOpen: (open: boolean) => void;
}

export function CartReservationForm({
  formData,
  errors,
  updateField,
  labelAccent,
  addressDetails,
  setAddressDetails,
  isAddressExpanded,
  setIsAddressExpanded,
  handleSaveAddress,
  isPackageModalOpen,
  setIsPackageModalOpen,
}: CartReservationFormProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-zinc-200 dark:border-white/5">
        {/* Guest Count (Package Select Modal trigger) for Brew Buggy */}
        <div className="space-y-2 col-span-1">
          <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
            Select Guest Package
          </label>
          <button
            type="button"
            onClick={() => setIsPackageModalOpen(true)}
            className="w-full text-left rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 relative hover:bg-background-alt/80 flex items-center justify-between group"
          >
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-hover:text-emerald-500 transition-colors">
              <Users size={14} />
            </div>
            <span>
              {formData.guestCount === 50 && "50 Pax Package (₱5,500)"}
              {formData.guestCount === 100 && "100 Pax Package (₱11,000)"}
              {formData.guestCount === 150 && "150 Pax Package (₱16,500)"}
              {formData.guestCount === 200 && "200 Pax Package (₱22,000)"}
            </span>
            <ChevronRight size={14} className="text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <span className="text-[9px] text-zinc-500 pl-1 font-sans block">Required downpayment: 10%</span>
          {errors.guestCount && <span className="type-error block mt-1 text-xs text-red-500 font-sans">{errors.guestCount}</span>}
        </div>

        {/* Venue / Location Address */}
        <div className="space-y-2 col-span-1">
          <label className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600/90 dark:text-emerald-400/90 block pl-1">
            Location
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-500">
              <MapPin size={14} className="text-zinc-500 group-focus-within:text-emerald-500" />
            </div>
            <input
              type="text"
              required
              readOnly
              onClick={() => setIsAddressExpanded(true)}
              placeholder="Click to enter address details..."
              value={formData.location}
              className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700 cursor-pointer"
            />
          </div>
          {errors.location && <span className="type-error block mt-1 text-xs text-red-500 font-sans">{errors.location}</span>}
        </div>

        {/* Address Details Editor Dropdown */}
        <div className="col-span-1 md:col-span-2">
          <AnimatePresence>
            {isAddressExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-5 border border-card-border bg-[#0D1D16]/45 dark:bg-[#07130E]/65 rounded-xl space-y-4 overflow-hidden relative"
              >
                <div className="flex items-center justify-between border-b border-zinc-200/10 pb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">Specify Sourcing Venue Address</span>
                  <span className="text-[8px] uppercase text-zinc-500 font-sans tracking-wide">All Fields Required</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Street */}
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-bold text-zinc-400 pl-1 tracking-wider block">Street Address</label>
                    <input
                      type="text"
                      required
                      value={addressDetails.street}
                      onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                      placeholder="e.g. 123 Rizal St."
                      className="w-full bg-card border border-card-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Barangay */}
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-bold text-zinc-400 pl-1 tracking-wider block">Barangay</label>
                    <input
                      type="text"
                      required
                      value={addressDetails.barangay}
                      onChange={(e) => setAddressDetails({ ...addressDetails, barangay: e.target.value })}
                      placeholder="e.g. Brgy. Lalig"
                      className="w-full bg-card border border-card-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* City / Municipality */}
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-bold text-zinc-400 pl-1 tracking-wider block">City / Municipality</label>
                    <input
                      type="text"
                      required
                      value={addressDetails.city}
                      onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                      placeholder="e.g. Tiaong"
                      className="w-full bg-card border border-card-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Province */}
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase font-bold text-zinc-400 pl-1 tracking-wider block">Province</label>
                    <input
                      type="text"
                      required
                      value={addressDetails.province}
                      onChange={(e) => setAddressDetails({ ...addressDetails, province: e.target.value })}
                      placeholder="e.g. Quezon"
                      className="w-full bg-card border border-card-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Landmark */}
                  <div className="space-y-1 col-span-1 md:col-span-2">
                    <label className="text-[8px] uppercase font-bold text-zinc-400 pl-1 tracking-wider block">Notable Landmark (Optional)</label>
                    <input
                      type="text"
                      value={addressDetails.landmark}
                      onChange={(e) => setAddressDetails({ ...addressDetails, landmark: e.target.value })}
                      placeholder="e.g. Near Tiaong Elementary School"
                      className="w-full bg-card border border-card-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-[9px] uppercase font-bold tracking-wider text-white transition-all shadow-md active:scale-95 border border-emerald-600/30"
                  >
                    Save Address
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Brew Buggy Package Selection Modal */}
      {mounted && typeof document !== "undefined" ? createPortal(
        <AnimatePresence>
          {isPackageModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPackageModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card border border-card-border rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative overflow-hidden z-10"
                style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
              >
                {/* Decorative glows */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 block font-sans">
                        Brew Buggy Mobile Cart
                      </span>
                      <h3 className="text-xl font-serif text-foreground font-semibold mt-1">Select Guest Package</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPackageModalOpen(false)}
                      className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-zinc-400 hover:text-foreground"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { pax: 50, price: 5500, desc: "Perfect for intimate gatherings, small birthdays, or private office events." },
                      { pax: 100, price: 11000, desc: "Great for medium weddings, corporate seminars, and product launch previews." },
                      { pax: 150, price: 16500, desc: "Designed for large celebrations, school events, or company anniversaries." },
                      { pax: 200, price: 22000, desc: "Ideal for massive festival crowds, major corporate galas, and concert receptions." }
                    ].map((pkg) => {
                      const isSelected = formData.guestCount === pkg.pax;
                      const dp = pkg.price * 0.10;
                      return (
                        <button
                          key={pkg.pax}
                          type="button"
                          onClick={() => {
                            updateField("guestCount", pkg.pax);
                            setIsPackageModalOpen(false);
                          }}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 ${isSelected
                            ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            : "bg-background-alt/30 border-card-border hover:border-emerald-500/40 hover:bg-background-alt/50"
                            }`}
                        >
                          <div className={`mt-1.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-emerald-500" : "border-zinc-400"}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <span className="font-sans font-bold text-sm text-foreground">{pkg.pax} Pax Package</span>
                              <span className="font-sans font-bold text-base text-emerald-600 dark:text-emerald-400">₱{pkg.price.toLocaleString()}</span>
                            </div>
                            <p className="text-[11px] text-zinc-500 font-light mt-1 leading-normal pr-4">{pkg.desc}</p>
                            <div className="flex gap-4 mt-2 text-[9px] font-sans text-zinc-400 dark:text-zinc-500">
                              <span>Downpayment (10%): ₱{dp.toLocaleString()}</span>
                              <span>•</span>
                              <span>Refundable up to 1 week prior</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      ) : null}
    </>
  );
}

export function CartReservationPolicy() {
  return (
    <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10 mt-6 space-y-2">
      <h4 className="text-xs font-serif font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mb-1">
        Brew Buggy Coffee Cart Sourcing Details & Policies
      </h4>
      <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
        <strong>Flavor Options included:</strong> Iced Latte, Iced/Hot Americano, 2 Any Flavored (Iced or Hot), and 2 Non-Coffee Over Ice. Package includes the mobile cart, 2 baristas, and a service duration of exactly <strong>3 hours</strong>.
      </p>
      <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
        <strong>Payment & Refund:</strong> Booking requires a <strong>10% downpayment</strong>. 100% refundable up to <strong>1 week before</strong> the scheduled booking date. Downpayment is <strong>non-refundable</strong> if cancelled less than 24 hours prior.
      </p>
    </div>
  );
}

interface CartReservationReceiptProps {
  formData: FormData;
  ticketId: string;
  endTime: string;
  totalPrice: number;
  downpayment: number;
}

export function CartReservationReceipt({
  formData,
  ticketId,
  endTime,
  totalPrice,
  downpayment,
}: CartReservationReceiptProps) {
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
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block">"Brew Buggy" Mobile Coffee Cart</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Schedule</span>
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block">{formData.date} at {formData.time} - {endTime}</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Total Package Cost</span>
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block">₱{totalPrice.toLocaleString()}</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Transportation Fee</span>
        <span className="font-sans text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">
          {(formData.transpoFee || 0) === 0
            ? "FREE (within 6km)"
            : `₱${(formData.transpoFee || 0).toLocaleString()} (${formData.distanceKm || 0} km)`}
        </span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Downpayment (Required)</span>
        <span className="font-sans text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">₱{downpayment.toLocaleString()}</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Venue / Sourced Location</span>
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block">{formData.location || "Not specified"}</span>
      </div>
      <div>
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Special Requests</span>
        <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-0.5 block italic">{formData.notes || "None"}</span>
      </div>
      {formData.coffeeFlavor1 && (
        <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-zinc-200/10 dark:border-white/5 pt-3">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Selected Coffee Flavors</span>
            <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-1 block">
              1. {formData.coffeeFlavor1}<br />
              2. {formData.coffeeFlavor2}
            </span>
          </div>
          <div>
            <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Selected Non-Coffee Flavors</span>
            <span className="font-sans text-xs text-foreground print:text-black font-semibold mt-1 block">
              1. {formData.nonCoffeeFlavor1}<br />
              2. {formData.nonCoffeeFlavor2}
            </span>
          </div>
        </div>
      )}
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
        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Brew Buggy Coffee Cart Terms & Policies</span>
        <span className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 print:text-zinc-700 font-light leading-relaxed block mt-1">
          A 10% downpayment of ₱{downpayment.toLocaleString()} is required. 100% refundable if cancelled at least 1 week before the scheduled booking date. Downpayment is non-refundable if cancelled less than 24 hours prior. Service duration is 3 hours.
        </span>
      </div>
    </div>
  );
}
