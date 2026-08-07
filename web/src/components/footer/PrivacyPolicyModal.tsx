"use client";

import React, { useEffect } from "react";
import { Shield, X, Lock, Eye, Server, UserCheck, Mail } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
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
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 block font-sans">
                RA 10173 • Data Privacy Act Compliant
              </span>
              <h3 className="text-xl font-serif font-semibold text-foreground mt-0.5">
                Privacy Policy
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
          <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/15 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">
                Our Commitment to Your Privacy
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                At Antonioni Grounds, we value the trust you place in us when sharing your personal information. This Privacy Policy details how we collect, safeguard, and utilize your personal data in accordance with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-500" />
              1. Information We Collect
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300">
              When you interact with Antonioni Grounds—whether booking a lounge table reservation, reserving our Brew Buggy mobile coffee cart, or registering for our loyalty program—we collect specific personal details including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-300">
              <li><strong>Contact Information:</strong> Full name, primary email address, phone/mobile number.</li>
              <li><strong>Booking & Event Details:</strong> Date, time, party size, event venue address, special dietary requests, and event notes.</li>
              <li><strong>Transaction Data:</strong> Payment reference numbers (GCash, Maya, Bank Transfer receipts). We do not store raw payment credentials on our servers.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and essential cookies required for session stability.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-500" />
              2. How We Use Your Data
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300">
              We process your personal information strictly for legitimate business purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-300">
              <li>Processing, confirming, and updating your table and mobile cart reservations.</li>
              <li>Verifying downpayments and generating digital reservation dockets/e-receipts.</li>
              <li>Communicating critical updates regarding your bookings or event logistics.</li>
              <li>Managing your digital loyalty points, rewards, and tier progressions.</li>
              <li>Improving our website performance, customer experience, and menu offerings.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              3. Data Protection & Storage Security
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300">
              We implement enterprise-grade technical and organizational security measures to prevent unauthorized access, disclosure, modification, or destruction of your data. All database interactions are encrypted in transit via SSL/TLS and backed by secure cloud architecture (Supabase). Access to personal data is strictly restricted to authorized staff.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              4. Data Subject Rights
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300">
              Under the Data Privacy Act of 2012, you possess full rights regarding your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-300">
              <li><strong>Right to be Informed:</strong> Know how your data is collected and processed.</li>
              <li><strong>Right to Access:</strong> Request a copy of your personal data stored in our system.</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or outdated information.</li>
              <li><strong>Right to Erasure / Blocking:</strong> Request deletion of your personal records from our database.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="p-4 bg-background-alt/60 rounded-xl border border-card-border flex items-start gap-3">
            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">
                Data Protection Contact
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                For any privacy concerns, data subject requests, or inquiries regarding our privacy practices, please contact our Data Protection Office at <strong>privacy@antonionigrounds.com</strong> or visit us at Poblacion 3, Tiaong, Quezon.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-card-border bg-background-alt/50 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-zinc-400 font-sans">
            Effective Date: August 2026
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Close Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};
