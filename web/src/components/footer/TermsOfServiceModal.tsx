"use client";

import React, { useEffect } from "react";
import { FileText, X, CheckCircle2, ShieldAlert, CreditCard, Scale, HelpCircle } from "lucide-react";

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-600 dark:text-amber-400 block font-sans">
                User Agreement & Store Policies
              </span>
              <h3 className="text-xl font-serif font-semibold text-foreground mt-0.5">
                Terms of Service
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
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-sans">
          <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/15 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">
                Welcome to Antonioni Grounds
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                By accessing our platform, placing menu orders, or reserving lounge tables and mobile coffee cart packages, you agree to bound by these Terms of Service.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              1. Bookings, Orders & Payments
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300">
              All table lounge reservations and Brew Buggy mobile cart bookings require valid proof of payment (GCash, Maya, or direct Bank Transfer) to confirm:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-300">
              <li>Bookings remain in a <em>Pending Verification</em> status until downpayment receipts are validated by management.</li>
              <li>Downpayment requirements: ₱1,000 for Lounge Tables; 10% for Brew Buggy Mobile Coffee Cart packages.</li>
              <li>Valid reference numbers and accurate contact credentials must be submitted during checkout.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              2. Guest Conduct & Sanctuary Rules
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300">
              Antonioni Grounds is designed as a refined sensory sanctuary. To preserve our peaceful environment:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-300">
              <li>Guests are expected to treat staff and fellow patrons with courtesy and respect.</li>
              <li>Disruptive behavior, intentional damage to property, or harassment of staff will result in immediate termination of service without refund.</li>
              <li>Outside food and beverages are strictly prohibited inside the coffee shop lounge unless authorized by management.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500" />
              3. Intellectual Property & Brand Assets
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300">
              All logos, brand graphics, menu designs, signature blend names, and digital content displayed on this web application are the exclusive intellectual property of Antonioni Grounds. Unauthorized copying, redistribution, or commercial use is strictly prohibited.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              4. Limitation of Liability
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300">
              Antonioni Grounds is not liable for indirect or consequential losses resulting from severe weather events, power outages, or municipal road closures during off-site Brew Buggy coffee cart events. We will make all reasonable efforts to provide alternative scheduling where possible.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-card-border bg-background-alt/50 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-zinc-400 font-sans">
            Jurisdiction: Quezon Province, Philippines
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Close Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
};
