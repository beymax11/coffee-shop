"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  AtSign,
  Calendar,
  Loader2,
  Copy,
  Check,
  LogOut,
  Edit3,
  Lock,
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

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Member";
  try {
    const date = new Date(dateStr);
    return `Member since ${date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })}`;
  } catch {
    return "Member";
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
  const [copiedId, setCopiedId] = useState(false);


  // Form states
  const [editName, setEditName] = useState(customer.name);
  const [editUsername, setEditUsername] = useState(
    customer.username || customer.email.split("@")[0]
  );
  const [editEmail, setEditEmail] = useState(customer.email);
  const [editPhone, setEditPhone] = useState(customer.phone || "");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  const handleClose = useCallback(() => {
    if (!isLoggingOut && !isSaving) {
      setIsEditing(false);

      onClose();
    }
  }, [isLoggingOut, isSaving, onClose]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      setMessage("");

      setIsEditing(false);
      setCopiedId(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setEditName(customer.name);
    setEditUsername(customer.username || customer.email.split("@")[0]);
    setEditEmail(customer.email);
    setEditPhone(customer.phone || "");
  }, [customer]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Escape key and scroll lock
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

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(customer.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editName.trim() || !editUsername.trim()) {
      setIsSuccess(false);
      setMessage("Name and username are required.");
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const updated: LoyaltyMember = {
      ...customer,
      name: editName.trim(),
      username: editUsername.trim().replace(/^@/, ""),
      email: editEmail,
      phone: editPhone.trim(),
    };

    db.saveLoyaltyMember(updated);
    localStorage.setItem("customer_session", editEmail.toLowerCase());
    onUpdateCustomer(updated);
    setIsSuccess(true);
    setMessage("Profile updated successfully!");
    setIsSaving(false);
    setIsEditing(false);
    setTimeout(() => setMessage(""), 3000);
    window.dispatchEvent(new Event("storage"));
  };

  const getInitials = (nameStr: string) => {
    return (
      nameStr
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "U"
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.25 }}
            className="relative w-full sm:max-w-md h-auto max-h-[90dvh] overflow-hidden rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141414] text-zinc-900 dark:text-zinc-100 shadow-xl flex flex-col"
            style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={isLoggingOut || isSaving}
              aria-label="Close profile"
              className="absolute top-4 right-4 z-10 rounded-full p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
            >
              <X size={18} />
            </button>

            {/* Header: User Info (Plain Solid Colors) */}
            <div className="px-6 pt-6 pb-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-4">
                {/* Initials Avatar (Plain solid background) */}
                <div className="w-14 h-14 rounded-full bg-[#2E5A44] dark:bg-[#2E5A44] text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {getInitials(isEditing ? editName : customer.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    id="profile-modal-title"
                    className="text-lg font-bold text-zinc-900 dark:text-white truncate"
                  >
                    {isEditing ? editName || "Your Name" : customer.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    @{isEditing ? editUsername || "username" : customer.username || customer.email.split("@")[0]}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-zinc-400" />
                      {formatDate(customer.joinedAt)}
                    </span>

                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-[10px] font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                      title="Copy Member ID"
                    >
                      <span>ID: {customer.id}</span>
                      {copiedId ? (
                        <Check size={10} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy size={10} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Body Content / Form Fields */}
            <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
              <form id="profile-form" onSubmit={handleSave} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1.5">
                    Full Name
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        disabled={isSaving}
                        placeholder="Enter your name"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-[#2E5A44] dark:focus:border-[#489871] focus:outline-none transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      <User size={15} className="text-zinc-400 shrink-0" />
                      <span className="truncate">{customer.name}</span>
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1.5">
                    Username
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        required
                        disabled={isSaving}
                        placeholder="username"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-[#2E5A44] dark:focus:border-[#489871] focus:outline-none transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      <AtSign size={15} className="text-zinc-400 shrink-0" />
                      <span className="truncate">@{customer.username || customer.email.split("@")[0]}</span>
                    </div>
                  )}
                </div>

                {/* Email Address (Read-only) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Email Address
                    </label>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Lock size={10} /> Locked
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-100/70 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
                    <Mail size={15} className="text-zinc-400 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1.5">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        disabled={isSaving}
                        placeholder="+63 900 000 0000"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-[#2E5A44] dark:focus:border-[#489871] focus:outline-none transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      <Phone size={15} className="text-zinc-400 shrink-0" />
                      <span className="truncate">{customer.phone || "Not provided"}</span>
                    </div>
                  )}
                </div>

                {/* Message Alert */}
                <AnimatePresence mode="wait">
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-center flex items-center justify-center gap-1.5 ${
                        isSuccess
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                          : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {isSuccess ? <Check size={13} /> : <X size={13} />}
                      <span>{message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Footer Actions (Plain Solid Colors) */}
            <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
              {isEditing ? (
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setEditName(customer.name);
                      setEditUsername(
                        customer.username || customer.email.split("@")[0]
                      );
                      setEditPhone(customer.phone || "");
                      setMessage("");
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={13} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {/* Logout Action */}
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={14} />
                        <span>Log Out</span>
                      </>
                    )}
                  </button>

                  {/* Edit & Close */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMessage("");
                        setIsEditing(true);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 rounded-lg bg-[#2E5A44] hover:bg-[#234533] text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
