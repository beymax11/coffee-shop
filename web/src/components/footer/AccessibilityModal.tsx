"use client";

import React, { useEffect } from "react";
import { Accessibility, X, Monitor, MapPin, HeartHandshake, PhoneCall } from "lucide-react";

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Accessibility className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-blue-600 dark:text-blue-400 block font-sans">
                Inclusive Design & Experience
              </span>
              <h3 className="text-xl font-serif font-semibold text-foreground mt-0.5">
                Accessibility Statement
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
          <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/15 flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">
                Universal Accessibility Commitment
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Antonioni Grounds is committed to providing an inclusive, barrier-free digital and physical experience for all guests, regardless of physical or cognitive abilities.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-500" />
              1. Digital Accessibility Standards
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300">
              We continually work to align our web application with Web Content Accessibility Guidelines (WCAG 2.1 Level AA) standards:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-300">
              <li><strong>High Contrast Design:</strong> Rich contrast modes supporting both light and dark aesthetics for enhanced readability.</li>
              <li><strong>Screen Reader Ready:</strong> Structured HTML5 semantic elements and aria-label attributes across interactive components.</li>
              <li><strong>Keyboard Navigation:</strong> Fully operable navigation and modal controls without requiring a mouse.</li>
              <li><strong>Responsive Typography:</strong> Scalable font sizes that adapt seamlessly to custom zoom levels and mobile viewports.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              2. Physical Lounge Accessibility
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300">
              Our sensory lounge location at J.P Rizal Street, Poblacion 3, Tiaong, Quezon features:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-300">
              <li>Ramp access for wheelchair users and guests with mobility aids.</li>
              <li>Spacious aisle ways and flexible table arrangements to accommodate wheelchair seating.</li>
              <li>Dedicated accessible parking spaces located near the main entrance.</li>
              <li>Staff trained to assist guests needing extra physical support or custom ordering assistance.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="p-4 bg-background-alt/60 rounded-xl border border-card-border flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">
                Feedback & Assistance Request
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                If you encounter any accessibility barriers on our website or require specific accommodations during your visit, please reach out to our accessibility coordinator at <strong>accessibility@antonionigrounds.com</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-card-border bg-background-alt/50 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-zinc-400 font-sans">
            WCAG 2.1 Level AA Guidelines
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Close Statement
          </button>
        </div>
      </div>
    </div>
  );
};
