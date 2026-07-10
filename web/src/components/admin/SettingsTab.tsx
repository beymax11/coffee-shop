"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Check, Loader2, Wrench, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";
import { getMaintenanceMode, setMaintenanceMode } from "@/utils/settings";

export const SettingsTab: React.FC = () => {
  const [adminInfo, setAdminInfo] = useState({
    name: "Maître D' Admin",
    email: "admin@coffee.com",
    initials: "AD",
    role: "admin",
  });

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    // 1. Admin Profile details
    const savedProfile = localStorage.getItem("admin_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        const name = parsed.name || "Maître D' Admin";
        const email = parsed.email || "admin@coffee.com";
        const role = parsed.role || "admin";

        // Generate initials
        const nameParts = name.trim().split(/\s+/);
        let initials = "AD";
        if (nameParts.length > 0) {
          if (nameParts.length >= 2) {
            initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
          } else if (nameParts[0].length > 0) {
            initials = nameParts[0].slice(0, 2).toUpperCase();
          }
        }

        const info = { name, email, initials, role };
        setAdminInfo(info);
        setEditName(name);
        setEditEmail(email);
      } catch (err) {
        console.error("Error parsing saved admin profile:", err);
      }
    }

    // 2. Maintenance mode status
    const loadMaintenance = async () => {
      const active = await getMaintenanceMode();
      setIsMaintenanceActive(active);
    };
    loadMaintenance();

    // Listen to storage changes to keep synced
    const handleStorageChange = () => {
      loadMaintenance();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleMaintenanceToggle = () => {
    if (isMaintenanceActive) {
      // Deactivating does not need confirmation
      confirmToggleMaintenance(false);
    } else {
      // Activating needs confirmation
      setShowConfirmModal(true);
    }
  };

  const confirmToggleMaintenance = async (active: boolean) => {
    setIsTogglingMaintenance(true);
    setShowConfirmModal(false);
    try {
      await setMaintenanceMode(active);
      setIsMaintenanceActive(active);

      // Dispatch storage event so headers/views get it
      window.dispatchEvent(new Event("storage"));

      if (active) {
        toast.error("Maintenance mode activated. Customer access is restricted.", {
          description: "Customers will see a maintenance message after logging in.",
        });
      } else {
        toast.success("Maintenance mode deactivated. Customer access restored.");
      }
    } catch (err) {
      console.error("Failed to toggle maintenance mode:", err);
      toast.error("Failed to toggle maintenance mode.");
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    setIsSaving(true);

    try {
      // Generate new initials
      const nameParts = editName.trim().split(/\s+/);
      let initials = "AD";
      if (nameParts.length > 0) {
        if (nameParts.length >= 2) {
          initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        } else if (nameParts[0].length > 0) {
          initials = nameParts[0].slice(0, 2).toUpperCase();
        }
      }

      // Update Supabase if authenticated
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from("profiles")
            .update({
              name: editName,
              email: editEmail,
            })
            .eq("id", user.id);

          if (error) throw error;
        }
      }

      const updatedInfo = {
        name: editName,
        email: editEmail,
        initials,
        role: adminInfo.role,
      };

      localStorage.setItem("admin_profile", JSON.stringify(updatedInfo));
      setAdminInfo(updatedInfo);

      // Dispatch storage event to make sure sidebar and header reflect change
      window.dispatchEvent(new Event("storage"));
      toast.success("Profile settings updated successfully!");
    } catch (err: any) {
      console.error("Error saving admin profile settings:", err);
      toast.error(err.message || "Failed to save profile settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in slide-in-from-bottom-2 duration-300">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left Column: Admin Profile Settings */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-card-border bg-card/60 backdrop-blur-md p-6 relative overflow-hidden shadow-sm h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 blur-[40px] rounded-full pointer-events-none" />

            <div>
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-card-border">
                <div className="h-16 w-16 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green text-xl font-bold shadow-[0_0_20px_rgba(46,90,68,0.15)] shrink-0">
                  {adminInfo.initials}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="type-h3 text-foreground font-serif tracking-tight">{adminInfo.name}</h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                    <span className="type-caption text-neutral-500 dark:text-zinc-500 text-[10px] tracking-wide">{adminInfo.email}</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-green/15 text-brand-green border border-brand-green/20">
                      <Shield size={10} />
                      {adminInfo.role}
                    </span>
                  </div>
                </div>
              </div>

              <form id="profile-settings-form" onSubmit={handleSaveProfile} className="space-y-5 pt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="fullname" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={14} />
                      <input
                        id="fullname"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        placeholder="Enter full name"
                        className="w-full bg-background-alt border border-card-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-neutral-500 dark:placeholder:text-zinc-500 outline-none focus:border-brand-green/60 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={14} />
                      <input
                        id="email"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                        placeholder="Enter email address"
                        className="w-full bg-background-alt border border-card-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-neutral-500 dark:placeholder:text-zinc-500 outline-none focus:border-brand-green/60 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end pt-6 border-t border-card-border/40 mt-6">
              <button
                type="submit"
                form="profile-settings-form"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-brand-green hover:bg-brand-green-hover text-xs font-semibold text-white shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: System Controls */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-card-border bg-card/60 backdrop-blur-md p-6 relative overflow-hidden shadow-sm h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/[0.02] blur-[40px] rounded-full pointer-events-none" />

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-1.5 pb-3 border-b border-card-border">
                <Wrench size={12} className="text-neutral-500" />
                System Controls
              </h4>

              <div className="space-y-4">
                <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed">
                  Enable maintenance mode to restrict client booking access and display a temporary warning banner. This will lock standard customer access to the frontend website.
                </p>

                <div className={`p-4 rounded-xl border text-[11px] leading-relaxed ${isMaintenanceActive
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 flex gap-2.5"
                    : "bg-zinc-500/5 border-card-border text-neutral-500 dark:text-zinc-500 flex gap-2.5"
                  }`}>
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>
                    {isMaintenanceActive
                      ? "Maintenance Mode is currently ACTIVE. Regular client website access is restricted."
                      : "Maintenance Mode is currently INACTIVE. Client site is operational."
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-card-border/40 mt-6">
              <button
                type="button"
                onClick={handleMaintenanceToggle}
                disabled={isTogglingMaintenance}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 ${isMaintenanceActive
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "bg-foreground/[0.03] hover:bg-foreground/[0.06] text-foreground dark:bg-white/[0.03] dark:hover:bg-white/[0.06] border border-card-border"
                  }`}
              >
                {isTogglingMaintenance ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Wrench size={13} />
                )}
                <span>
                  {isMaintenanceActive ? "Deactivate Maintenance" : "Activate Maintenance"}
                </span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full max-w-md rounded-2xl border border-card-border bg-card p-8 shadow-2xl relative z-10 overflow-hidden text-foreground"
            >
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-[25px] rounded-full pointer-events-none" />

              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors duration-300 p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <Wrench size={16} className="text-rose-500 animate-pulse" />
                <h3 className="type-h3 text-foreground font-serif font-bold tracking-tight">
                  Activate Maintenance Mode?
                </h3>
              </div>

              <p className="text-neutral-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                Are you sure you want to activate maintenance mode? This will restrict access for all logged-in customer accounts across the website and show them the maintenance screen. Admins and baristas will retain full access.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2.5 text-xs tracking-wider uppercase border border-card-border hover:bg-foreground/5 transition-colors duration-300 rounded-lg cursor-pointer text-neutral-500 hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmToggleMaintenance(true)}
                  className="px-4 py-2.5 text-xs tracking-wider uppercase bg-rose-500 hover:bg-rose-600 text-white transition-colors duration-300 rounded-lg shadow-md cursor-pointer animate-pulse"
                >
                  Activate Mode
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
