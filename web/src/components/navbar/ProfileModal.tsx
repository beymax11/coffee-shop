"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Loader2,
  LogOut,
  User,
  Mail,
  Phone,
  AtSign,
  UserCheck,
} from "lucide-react";
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

const EASE = [0.16, 1, 0.3, 1] as const;

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  isLoggingOut,
  onLogout,
  onUpdateCustomer,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(customer.name);
  const [editUsername, setEditUsername] = useState(customer.username || customer.email.split("@")[0]);
  const [editEmail, setEditEmail] = useState(customer.email);
  const [editPhone, setEditPhone] = useState(customer.phone || "");
  const [settingsMsg, setSettingsMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  const handleClose = useCallback(() => {
    if (!isLoggingOut) {
      setIsEditing(false);
      onClose();
    }
  }, [isLoggingOut, onClose]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setEditName(customer.name);
    setEditUsername(customer.username || customer.email.split("@")[0]);
    setEditEmail(customer.email);
    setEditPhone(customer.phone || "");
  }, [customer]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editUsername.trim()) {
      setIsSuccess(false);
      setSettingsMsg("Name, username, and email are required.");
      return;
    }
    const updated: LoyaltyMember = {
      ...customer,
      name: editName,
      username: editUsername,
      email: editEmail,
      phone: editPhone,
    };
    db.saveLoyaltyMember(updated);
    localStorage.setItem("customer_session", editEmail.toLowerCase());
    onUpdateCustomer(updated);
    setIsSuccess(true);
    setSettingsMsg("Profile updated successfully!");
    setIsEditing(false);
    setTimeout(() => setSettingsMsg(""), 3000);
    window.dispatchEvent(new Event("storage"));
  };

  const infoFields = [
    {
      label: "Username",
      value: editUsername,
      setter: setEditUsername,
      type: "text",
      icon: <AtSign size={16} className="text-brand-gold" />,
    },
    {
      label: "Full Name",
      value: editName,
      setter: setEditName,
      type: "text",
      icon: <User size={16} className="text-brand-gold" />,
    },
    {
      label: "Email Address",
      value: editEmail,
      setter: setEditEmail,
      type: "email",
      icon: <Mail size={16} className="text-brand-gold" />,
    },
    {
      label: "Phone Number",
      value: editPhone,
      setter: setEditPhone,
      type: "tel",
      icon: <Phone size={16} className="text-brand-gold" />,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative w-full sm:max-w-md h-auto max-h-[90dvh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-brand-green/20 dark:border-brand-gold/15 bg-card dark:bg-[#0B0B0B] text-foreground shadow-2xl glassmorphism-green dark:glassmorphism-gold flex flex-col"
            style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
          >
            {/* Cinematic Overlay & Glowing Orbs */}
            <div className="pointer-events-none absolute inset-0 film-grain opacity-[0.03] dark:opacity-[0.05]" />
            <div className="pointer-events-none absolute top-[-10%] right-[-10%] w-48 h-48 bg-brand-gold/10 dark:bg-brand-gold/5 blur-[40px] rounded-full" />
            <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-brand-green/10 dark:bg-brand-green/5 blur-[40px] rounded-full" />

            <button
              onClick={handleClose}
              disabled={isLoggingOut}
              aria-label="Close profile"
              className="absolute top-5 right-5 z-10 rounded-full border border-card-border dark:border-white/10 bg-background/50 dark:bg-black/40 p-2 text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-all hover:rotate-90 hover:scale-105 duration-300 cursor-pointer disabled:opacity-40"
            >
              <X size={16} />
            </button>

            {/* Profile Header */}
            <div className="relative px-6 pt-10 pb-5 text-center shrink-0 border-b border-card-border/40 dark:border-white/5 bg-white/[0.01] backdrop-blur-[2px]">
              <h4
                id="profile-modal-title"
                className="type-h2 text-foreground font-serif tracking-tight max-w-full truncate"
              >
                {customer.name}
              </h4>
            </div>

            {/* Info Fields Content */}
            <form
              id="profile-info-form"
              onSubmit={handleSave}
              className="px-6 py-6 space-y-4 overflow-y-auto"
            >
              {infoFields.map((field, idx) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3, ease: EASE }}
                  className="flex items-center gap-4 p-3.5 rounded-2xl border border-card-border/50 dark:border-white/5 bg-background/30 dark:bg-white/[0.01]"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/10 dark:bg-brand-gold/5 border border-brand-gold/25 flex items-center justify-center shrink-0">
                    {field.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
                      {field.label}
                    </span>
                    {isEditing ? (
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        required={field.label !== "Phone Number"}
                        placeholder={field.label === "Phone Number" ? "Enter phone number" : ""}
                        className="w-full bg-transparent border-b border-card-border dark:border-white/10 text-sm font-medium text-foreground py-0.5 px-0 outline-none focus:border-brand-green/60 dark:focus:border-brand-gold/60 transition-colors"
                      />
                    ) : (
                      <span className="text-sm font-medium text-foreground block truncate">
                        {field.label === "Username" ? `@${field.value}` : field.value || "—"}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}

              <AnimatePresence mode="wait">
                {settingsMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    aria-live="polite"
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs text-center font-medium border ${
                      isSuccess
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isSuccess ? (
                      <UserCheck size={13} className="shrink-0 text-emerald-500 animate-pulse" />
                    ) : (
                      <X size={13} className="shrink-0 text-red-500" />
                    )}
                    <span>{settingsMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Footer actions */}
            <div className="px-6 py-5 border-t border-card-border/60 dark:border-white/5 shrink-0 bg-white/[0.01]">
              {isEditing ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(customer.name);
                      setEditUsername(customer.username || customer.email.split("@")[0]);
                      setEditEmail(customer.email);
                      setEditPhone(customer.phone || "");
                      setSettingsMsg("");
                    }}
                    className="flex-1 flex items-center justify-center py-2.5 rounded-full border border-card-border dark:border-white/10 bg-background/50 dark:bg-black/20 text-xs font-semibold text-foreground dark:text-zinc-200 hover:bg-foreground/5 dark:hover:bg-white/5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="profile-info-form"
                    className="flex-1 flex items-center justify-center py-2.5 rounded-full bg-brand-green dark:bg-brand-gold text-xs font-semibold text-white dark:text-brand-espresso hover:bg-brand-green-hover dark:hover:bg-brand-gold-hover transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center py-2.5 rounded-full bg-brand-green dark:bg-brand-gold text-xs font-semibold text-white dark:text-brand-espresso hover:bg-brand-green-hover dark:hover:bg-brand-gold-hover transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-1.5 rounded-full border border-red-500/20 dark:border-red-500/10 bg-red-500/5 hover:bg-red-500 hover:text-white py-2.5 text-xs font-semibold text-red-500 transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <LogOut size={13} />
                    )}
                    <span>{isLoggingOut ? "Signing Out…" : "Sign Out Account"}</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
