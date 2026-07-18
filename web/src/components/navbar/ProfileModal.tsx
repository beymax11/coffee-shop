"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  AtSign,
  UserCheck,
  Calendar,
  ShieldCheck,
  Loader2,
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

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Loyalty Member";
  try {
    const date = new Date(dateStr);
    return `Member since ${date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`;
  } catch {
    return "Loyalty Member";
  }
};

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
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState(customer.name);
  const [editUsername, setEditUsername] = useState(
    customer.username || customer.email.split("@")[0]
  );
  const [editEmail, setEditEmail] = useState(customer.email);
  const [editPhone, setEditPhone] = useState(customer.phone || "");
  const [settingsMsg, setSettingsMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  const handleClose = useCallback(() => {
    if (!isLoggingOut && !isSaving) {
      setIsEditing(false);
      onClose();
    }
  }, [isLoggingOut, isSaving, onClose]);

  // Reset modal state when open/close status changes
  useEffect(() => {
    setSettingsMsg("");
    setIsEditing(false);
    setIsSaving(false);
  }, [isOpen]);

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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editName.trim() || !editUsername.trim()) {
      setIsSuccess(false);
      setSettingsMsg("Name and username are required.");
      return;
    }

    setIsSaving(true);
    // Premium simulated delay to display loader beautifully
    await new Promise((resolve) => setTimeout(resolve, 800));

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
    setIsSaving(false);
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
      editable: true,
      icon: <AtSign size={16} className="text-brand-green dark:text-emerald-400" />,
    },
    {
      label: "Full Name",
      value: editName,
      setter: setEditName,
      type: "text",
      editable: true,
      icon: <User size={16} className="text-brand-green dark:text-emerald-400" />,
    },
    {
      label: "Email Address",
      value: editEmail,
      setter: setEditEmail,
      type: "email",
      editable: false,
      icon: <Mail size={16} className="text-brand-green dark:text-emerald-400" />,
    },
    {
      label: "Phone Number",
      value: editPhone,
      setter: setEditPhone,
      type: "tel",
      editable: false,
      icon: <Phone size={16} className="text-brand-green dark:text-emerald-400" />,
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
            className="relative w-full sm:max-w-md h-auto max-h-[90dvh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-brand-green/20 dark:border-emerald-500/15 bg-card dark:bg-[#0B0B0B] text-foreground shadow-2xl glassmorphism-green flex flex-col"
            style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
          >
            {/* Cinematic Overlay & Glowing Orbs */}
            <div className="pointer-events-none absolute inset-0 film-grain opacity-[0.03] dark:opacity-[0.05]" />
            <div className="pointer-events-none absolute top-[-10%] right-[-10%] w-48 h-48 bg-brand-green/10 dark:bg-emerald-500/5 blur-[40px] rounded-full" />
            <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-emerald-500/10 dark:bg-brand-green/5 blur-[40px] rounded-full" />

            <button
              onClick={handleClose}
              disabled={isLoggingOut || isSaving}
              aria-label="Close profile"
              className="absolute top-5 right-5 z-10 rounded-full border border-card-border dark:border-white/10 bg-background/50 dark:bg-black/40 p-2 text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-all hover:rotate-90 hover:scale-105 duration-300 cursor-pointer disabled:opacity-40"
            >
              <X size={16} />
            </button>

            {/* Profile Header with Avatar on the Left */}
            <div className="relative px-6 pt-8 pb-5 flex items-center gap-4.5 shrink-0 border-b border-card-border/40 dark:border-white/5 bg-white/[0.01] backdrop-blur-[2px]">
              {/* Initials Avatar (Left side) */}
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-brand-green to-[#234533] dark:from-[#2E5A44] dark:to-[#14281E] shadow-[0_4px_16px_rgba(46,90,68,0.2)] border border-brand-green/30 group transition-transform duration-500 hover:scale-105 shrink-0">
                <span className="text-xl font-serif font-bold text-white tracking-wide">
                  {(isEditing ? editUsername || editName : customer.username || customer.name)
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase() || "U"}
                </span>
                {/* Small Green Verification Shield Badge */}
                <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 dark:bg-emerald-600 text-white rounded-full p-0.5 border-2 border-card dark:border-[#0B0B0B] shadow-md flex items-center justify-center">
                  <ShieldCheck size={11} className="text-white" />
                </div>
              </div>

              {/* Header Text Details (Right side) */}
              <div className="min-w-0 flex-1 flex flex-col items-start">
                <h4
                  id="profile-modal-title"
                  className="type-h3 text-foreground font-serif tracking-tight font-bold truncate w-full text-left"
                >
                  {isEditing 
                    ? (editUsername || editName) 
                    : (customer.username || customer.name)}
                </h4>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1 font-medium tracking-wide">
                  <Calendar size={12} className="text-brand-green dark:text-emerald-400" />
                  {formatDate(customer.joinedAt)}
                </span>

                {/* Member ID Badge */}
                <div className="mt-2 px-2.5 py-0.5 rounded-full bg-brand-green/10 dark:bg-emerald-500/10 border border-brand-green/20 dark:border-emerald-500/15 text-[9px] font-mono font-bold tracking-wider text-brand-green dark:text-emerald-400">
                  MEMBER ID: {customer.id}
                </div>
              </div>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Info Fields Content */}
              <form
                id="profile-info-form"
                onSubmit={handleSave}
                className="px-6 py-6 space-y-4"
              >
                {infoFields.map((field, idx) => (
                  <motion.div
                    key={field.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3, ease: EASE }}
                    className="flex items-center gap-4 p-3.5 rounded-2xl border border-card-border/50 dark:border-white/5 bg-background/30 dark:bg-white/[0.01]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-green/10 dark:bg-emerald-500/10 border border-brand-green/20 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                      {field.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
                        {field.label}
                      </span>
                      {isEditing && field.editable ? (
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          required={field.label !== "Phone Number"}
                          disabled={isSaving}
                          placeholder={
                            field.label === "Phone Number"
                              ? "Enter phone number"
                              : ""
                          }
                          className="w-full bg-transparent border-b border-card-border dark:border-white/10 text-sm font-medium text-foreground py-0.5 px-0 outline-none focus:border-brand-green/60 dark:focus:border-emerald-500/60 transition-colors disabled:opacity-50"
                        />
                      ) : (
                        <span className="text-sm font-medium text-foreground block truncate">
                          {field.value || "—"}
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
                        <UserCheck
                          size={13}
                          className="shrink-0 text-emerald-500 animate-pulse"
                        />
                      ) : (
                        <X size={13} className="shrink-0 text-red-500" />
                      )}
                      <span>{settingsMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-5 border-t border-card-border/60 dark:border-white/5 shrink-0 bg-white/[0.01]">
              {isEditing ? (
                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(customer.name);
                      setEditUsername(
                        customer.username || customer.email.split("@")[0]
                      );
                      setEditEmail(customer.email);
                      setEditPhone(customer.phone || "");
                      setSettingsMsg("");
                    }}
                    className="px-5 py-2.5 rounded-full border border-card-border dark:border-white/10 bg-background/50 dark:bg-black/20 text-xs font-semibold text-foreground dark:text-zinc-200 hover:bg-foreground/5 dark:hover:bg-white/5 transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-full bg-brand-green dark:bg-emerald-600 text-xs font-semibold text-white dark:text-white hover:bg-brand-green-hover dark:hover:bg-emerald-500 transition-all duration-300 shadow-md shadow-brand-green/10 hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-full border border-card-border dark:border-white/10 bg-background/50 dark:bg-black/20 text-xs font-semibold text-foreground dark:text-zinc-200 hover:bg-foreground/5 dark:hover:bg-white/5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsMsg("");
                      setIsEditing(true);
                    }}
                    className="px-5 py-2.5 rounded-full bg-brand-green dark:bg-emerald-600 text-xs font-semibold text-white dark:text-white hover:bg-brand-green-hover dark:hover:bg-emerald-500 transition-all duration-300 shadow-md shadow-brand-green/10 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    Edit Profile
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
