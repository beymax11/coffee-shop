"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, Loader2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db, LoyaltyMember } from "@/utils/db";

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: LoyaltyMember;
  isLoggingOut: boolean;
  onLogout: () => void;
  onUpdateCustomer: (updated: LoyaltyMember) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  isLoggingOut,
  onLogout,
  onUpdateCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "loyalty" | "reservations" | "settings">("profile");
  const [editName, setEditName] = useState(customer.name);
  const [editEmail, setEditEmail] = useState(customer.email);
  const [copied, setCopied] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => {
    setEditName(customer.name);
    setEditEmail(customer.email);
  }, [customer]);

  useEffect(() => {
    if (isOpen && customer) {
      const allRes = db.getReservations();
      const filtered = allRes.filter(
        (r) => r.email.toLowerCase() === customer.email.toLowerCase()
      );
      setReservations(filtered);
    }
  }, [isOpen, customer]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      setSettingsMsg("Name and email are required.");
      return;
    }
    const updated: LoyaltyMember = {
      ...customer,
      name: editName,
      email: editEmail,
    };
    db.saveLoyaltyMember(updated);
    localStorage.setItem("customer_session", editEmail.toLowerCase());
    onUpdateCustomer(updated);
    setSettingsMsg("Changes saved successfully.");
    setTimeout(() => setSettingsMsg(""), 3000);
    window.dispatchEvent(new Event("storage"));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "June 2026";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Body */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 shadow-2xl border border-card-border/60 bg-card/95 backdrop-blur-md flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isLoggingOut}
              className="absolute right-4 top-4 rounded-full border border-card-border bg-background/50 dark:bg-zinc-900/50 p-1.5 text-zinc-400 hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close Profile"
            >
              <X size={14} />
            </button>

            {/* Profile Summary Header */}
            <div className="flex flex-col items-center mt-3 mb-5">
              {/* Double-Ring Minimalist Avatar */}
              <div className="w-14 h-14 rounded-full border border-brand-gold/20 bg-brand-gold/5 flex items-center justify-center text-brand-gold text-xl font-serif font-semibold shadow-sm select-none mb-3.5 relative group">
                <div className="absolute inset-0 rounded-full border border-brand-gold/10 scale-110 group-hover:scale-100 transition-transform duration-500" />
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <h4 className="text-base font-bold text-foreground font-serif tracking-wide text-center">
                {customer.name}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-0.5 text-center font-sans">
                {customer.email}
              </p>
            </div>

            {/* Modern Minimalist Navigation Tabs */}
            <div className="flex border-b border-card-border/50 mb-5 text-[9px] uppercase tracking-wider font-sans font-bold">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 pb-2 border-b-2 text-center transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "border-brand-gold text-foreground"
                    : "border-transparent text-zinc-400 hover:text-foreground"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("loyalty")}
                className={`flex-1 pb-2 border-b-2 text-center transition-all cursor-pointer ${
                  activeTab === "loyalty"
                    ? "border-brand-gold text-foreground"
                    : "border-transparent text-zinc-400 hover:text-foreground"
                }`}
              >
                Loyalty
              </button>
              <button
                onClick={() => setActiveTab("reservations")}
                className={`flex-1 pb-2 border-b-2 text-center transition-all cursor-pointer ${
                  activeTab === "reservations"
                    ? "border-brand-gold text-foreground"
                    : "border-transparent text-zinc-400 hover:text-foreground"
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 pb-2 border-b-2 text-center transition-all cursor-pointer ${
                  activeTab === "settings"
                    ? "border-brand-gold text-foreground"
                    : "border-transparent text-zinc-400 hover:text-foreground"
                }`}
              >
                Settings
              </button>
            </div>

            {/* Tab Contents */}
            <div className="mb-6 flex-1">
              {activeTab === "profile" && (
                <div className="space-y-4 text-xs font-sans animate-fade-in">
                  <div className="flex justify-between items-center pb-3 border-b border-card-border/30">
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Registered Since</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-mono">{formatDate(customer.joinedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-card-border/30">
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Member Serial ID</span>
                    <button
                      onClick={() => handleCopy(customer.id)}
                      className="group flex items-center gap-1.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-300 hover:text-brand-gold transition-colors cursor-pointer"
                    >
                      <span>{customer.id}</span>
                      {copied ? (
                        <Check size={11} className="text-emerald-500 animate-scale" />
                      ) : (
                        <Copy size={11} className="opacity-45 group-hover:opacity-80 transition-opacity" />
                      )}
                    </button>
                  </div>
                  <div className="text-center py-4 px-2 bg-background/30 rounded-xl border border-card-border/40 text-[10px] italic font-serif text-zinc-500 dark:text-zinc-400">
                    "Thank you for being a part of Antonioni Grounds. Enjoy fresh roasts and exclusive reservation privileges."
                  </div>
                </div>
              )}

              {activeTab === "loyalty" && (
                <div className="space-y-4 text-xs font-sans animate-fade-in">
                  <div className="flex justify-between items-center pb-1.5">
                    <span className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Points Balance</span>
                    <span className="font-bold text-foreground text-sm font-mono">
                      {customer.points} <span className="text-[10px] text-brand-gold font-sans font-normal uppercase">pts</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 font-bold">
                      <span>Stamp Card</span>
                      <span className="font-mono text-foreground">{customer.stamps} / 9</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: 9 }).map((_, idx) => {
                        const isEarned = idx < customer.stamps;
                        return (
                          <div
                            key={idx}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                              isEarned
                                ? "bg-brand-gold shadow-[0_0_8px_rgba(197,168,128,0.25)]"
                                : "bg-neutral-100 dark:bg-zinc-800/60"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Benefits Card */}
                  <div className="bg-background/40 p-3 rounded-xl border border-card-border/50 text-[10px] text-zinc-500 dark:text-zinc-400 space-y-1.5">
                    <p className="font-bold uppercase tracking-wider text-[8px] text-brand-gold mb-1">Club Benefits</p>
                    <div className="flex items-start gap-1">
                      <span className="text-brand-gold">•</span>
                      <span>Redeem 9 stamps for a free hand-brewed specialty cup.</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-brand-gold">•</span>
                      <span>Earn points on every dine-in and bean retail purchase.</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reservations" && (
                <div className="space-y-3 animate-fade-in max-h-48 overflow-y-auto pr-1">
                  {reservations.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-400 dark:text-zinc-500 font-sans">
                      No reservation history found.
                    </div>
                  ) : (
                    reservations.map((res: any, idx: number) => (
                      <div key={idx} className="bg-background/40 p-2.5 rounded-xl border border-card-border/50 text-xs flex justify-between items-start font-sans">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground truncate max-w-[155px]">{res.eventType}</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{res.date} • {res.time}</p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[155px]">{res.location}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 shrink-0">
                          <span className="font-mono font-semibold text-[9px] bg-neutral-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-neutral-600 dark:text-zinc-300">
                            {res.guestCount} pax
                          </span>
                          <span className="text-[8px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Confirmed
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <form onSubmit={handleSaveSettings} className="space-y-3 font-sans animate-fade-in">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-background border border-card-border/80 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-brand-gold transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-background border border-card-border/80 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-brand-gold transition-colors"
                      required
                    />
                  </div>
                  {settingsMsg && (
                    <p className={`text-[10px] text-center font-medium mt-1 ${
                      settingsMsg.includes("successfully") ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                    }`}>
                      {settingsMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-brand-gold hover:bg-brand-gold-hover text-black py-2 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer font-sans"
                  >
                    Save Changes
                  </button>
                </form>
              )}
            </div>

            {/* Close Button / Bottom Actions */}
            <div className="space-y-2 mt-auto">
              <button
                onClick={onClose}
                disabled={isLoggingOut}
                className="w-full rounded-xl bg-brand-espresso text-[#FAF7F2] dark:bg-[#FAF7F2] dark:text-[#1C1917] py-2.5 text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-50 font-sans tracking-wide shadow-sm"
              >
                Close Profile
              </button>
              {activeTab === "settings" && (
                <button
                  type="button"
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className="w-full py-2 text-xs font-medium text-red-500 hover:text-red-600 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader2 size={12} className="animate-spin text-zinc-400" />
                  ) : (
                    <LogOut size={12} />
                  )}
                  <span>{isLoggingOut ? "Signing Out..." : "Sign Out of Account"}</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
