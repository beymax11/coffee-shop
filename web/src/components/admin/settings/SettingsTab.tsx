"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Check,
  Loader2,
  Wrench,
  AlertTriangle,
  X,
  Store,
  Clock,
  Bell,
  Receipt,
  Server,
  Zap,
  Activity,
  Sliders,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Lock,
  Key,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";
import { getMaintenanceMode, setMaintenanceMode } from "@/utils/settings";
import { getHeroConfig, setHeroConfig, DEFAULT_HERO_CONFIG } from "@/utils/heroSettings";
import { auditLogger } from "@/utils/auditLogger";

export const SettingsTab: React.FC = () => {
  const [adminInfo, setAdminInfo] = useState({
    name: "Antonioni Grounds Admin",
    email: "admin@coffee.com",
    initials: "AG",
    role: "admin",
  });

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Dynamic Home Hero Customization States
  const [heroEyebrow, setHeroEyebrow] = useState(DEFAULT_HERO_CONFIG.eyebrowText);
  const [heroHeadlineMain, setHeroHeadlineMain] = useState(DEFAULT_HERO_CONFIG.headlineMain);
  const [heroHeadlineHighlight, setHeroHeadlineHighlight] = useState(DEFAULT_HERO_CONFIG.headlineHighlight);
  const [heroSubcopy, setHeroSubcopy] = useState(DEFAULT_HERO_CONFIG.subcopy);
  const [heroBgImageUrl, setHeroBgImageUrl] = useState(DEFAULT_HERO_CONFIG.bgImageUrl);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Drag and drop image upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setHeroBgImageUrl(e.target.result as string);
        toast.success("Hero image loaded from file upload!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Load configuration on mount
  useEffect(() => {
    // 1. Admin Profile details
    const savedProfile = localStorage.getItem("admin_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        const name = parsed.name || "Antonioni Grounds Admin";
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
      const active = await getMaintenanceMode(true);
      setIsMaintenanceActive(active);
    };
    loadMaintenance();

    // 3. Home Hero dynamic config
    const loadHero = async () => {
      const cfg = await getHeroConfig(true);
      setHeroEyebrow(cfg.eyebrowText);
      setHeroHeadlineMain(cfg.headlineMain);
      setHeroHeadlineHighlight(cfg.headlineHighlight);
      setHeroSubcopy(cfg.subcopy);
      setHeroBgImageUrl(cfg.bgImageUrl);
    };
    loadHero();

    // Listen to storage changes to keep synced
    const handleStorageChange = () => {
      loadMaintenance();
      loadHero();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("maintenance_mode_changed", handleStorageChange);
    window.addEventListener("hero_config_changed", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("maintenance_mode_changed", handleStorageChange);
      window.removeEventListener("hero_config_changed", handleStorageChange);
    };
  }, []);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHero(true);

    try {
      const updatedConfig = {
        eyebrowText: heroEyebrow,
        headlineMain: heroHeadlineMain,
        headlineHighlight: heroHeadlineHighlight,
        subcopy: heroSubcopy,
        bgImageUrl: heroBgImageUrl,
      };

      await setHeroConfig(updatedConfig);

      auditLogger.log({
        action: "UPDATE",
        category: "settings",
        target: "Home Hero Configuration",
        details: `Updated Home Hero text & background image (${heroBgImageUrl}).`,
        severity: "info",
        metadata: updatedConfig,
      });

      toast.success("Home Hero settings updated successfully!");
    } catch (err: any) {
      console.error("Error saving Home Hero settings:", err);
      toast.error(err.message || "Failed to save Home Hero settings.");
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSavingPassword(true);

    try {
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (error) {
            throw new Error(error.message);
          }
        }
      }

      localStorage.setItem("admin_password", newPassword);

      auditLogger.log({
        action: "UPDATE",
        category: "settings",
        target: "Admin Security Credentials",
        details: "Administrator account password changed successfully.",
        severity: "warning",
      });

      toast.success("Administrator password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Error updating password:", err);
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

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

      auditLogger.log({
        action: "TOGGLE",
        category: "settings",
        target: "Maintenance Mode",
        details: active 
          ? "Activated system maintenance mode. Restricted customer website access."
          : "Deactivated maintenance mode. Restored full customer website access.",
        severity: active ? "warning" : "info",
        metadata: { maintenanceActive: active }
      });

      if (active) {
        toast.warning("Maintenance Mode Activated", {
          description: "Customer website access is now restricted to the maintenance screen.",
        });
      } else {
        toast.success("Maintenance Mode Deactivated", {
          description: "Customer access to reservations and digital loyalty cards has been fully restored.",
        });
      }
    } catch (err) {
      console.error("Failed to toggle maintenance mode:", err);
      toast.error("Failed to update maintenance mode status.");
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

      auditLogger.log({
        action: "UPDATE",
        category: "settings",
        target: `Console Profile (${editName})`,
        details: `Updated administrator profile details (Name: ${editName}, Email: ${editEmail}).`,
        severity: "info",
        metadata: updatedInfo
      });

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
    <div className="space-y-8 max-w-6xl animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Admin Profile Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-card-border bg-card/60 backdrop-blur-xl p-6 md:p-7 relative overflow-hidden shadow-md flex flex-col">
            <div className="absolute top-0 right-0 w-36 h-36 bg-brand-green/5 blur-[45px] rounded-full pointer-events-none" />

            <div>
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-card-border">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-green to-emerald-700 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-brand-green/20 shrink-0">
                    {adminInfo.initials}
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 bg-background border-2 border-card border-emerald-500 rounded-full flex items-center justify-center">
                    <Check size={10} className="text-emerald-500" />
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="type-h3 text-foreground font-serif tracking-tight font-bold text-lg">
                    {adminInfo.name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                    <span className="type-caption text-neutral-500 dark:text-zinc-400 text-xs">{adminInfo.email}</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-green/15 text-brand-green border border-brand-green/20">
                      <Shield size={10} />
                      {adminInfo.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <form id="profile-settings-form" onSubmit={handleSaveProfile} className="space-y-5 pt-6">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500 flex items-center gap-2">
                  <User size={13} className="text-brand-green" />
                  Administrator Profile Credentials
                </h4>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="fullname" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                      Console Display Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-zinc-500" size={14} />
                      <input
                        id="fullname"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        placeholder="Enter full name"
                        className="w-full bg-white dark:bg-background-alt border border-card-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-neutral-500 dark:placeholder:text-zinc-500 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                      Admin Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-zinc-500" size={14} />
                      <input
                        id="email"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                        placeholder="Enter email address"
                        className="w-full bg-white dark:bg-background-alt border border-card-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-neutral-500 dark:placeholder:text-zinc-500 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end pt-6 border-t border-card-border/60 mt-6">
              <button
                type="submit"
                form="profile-settings-form"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-xs font-semibold text-white shadow-md shadow-brand-green/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>

          {/* Security & Change Password Card */}
          <div className="rounded-3xl border border-card-border bg-card/60 backdrop-blur-xl p-6 md:p-7 relative overflow-hidden shadow-md flex flex-col space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-card-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-foreground">
                    Security & Password
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-zinc-400">
                    Update administrator access credentials.
                  </p>
                </div>
              </div>
            </div>

            <form id="change-password-form" onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-zinc-500" size={14} />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full bg-white dark:bg-background-alt border border-card-border rounded-xl py-2.5 pl-10 pr-10 text-xs text-foreground placeholder:text-neutral-500 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-zinc-500" size={14} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="w-full bg-white dark:bg-background-alt border border-card-border rounded-xl py-2.5 pl-10 pr-10 text-xs text-foreground placeholder:text-neutral-500 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-zinc-500" size={14} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Re-enter new password"
                    className="w-full bg-white dark:bg-background-alt border border-card-border rounded-xl py-2.5 pl-10 pr-10 text-xs text-foreground placeholder:text-neutral-500 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-card-border/60 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white shadow-md shadow-amber-600/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isSavingPassword ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Key size={14} />
                  )}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Maintenance Control & Store Preferences (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Maintenance Mode Card */}
          <div className={`rounded-3xl border transition-all duration-300 p-6 md:p-7 relative overflow-hidden shadow-md ${
            isMaintenanceActive 
              ? "bg-gradient-to-br from-amber-500/10 via-card/70 to-card/90 border-amber-500/30" 
              : "bg-card/60 border-card-border"
          }`}>
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-card-border">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${isMaintenanceActive ? "bg-amber-500/20 text-amber-500" : "bg-neutral-500/10 text-neutral-500"}`}>
                  <Wrench size={20} className={isMaintenanceActive ? "animate-pulse text-amber-500" : ""} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    System Maintenance Switch
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-zinc-400">
                    Control frontend customer access for reservations & loyalty cards.
                  </p>
                </div>
              </div>

              {/* Live Switch Status Indicator */}
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isMaintenanceActive
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              }`}>
                {isMaintenanceActive ? "Mode Active" : "Operational"}
              </span>
            </div>

            <div className="py-5 space-y-4">
              <p className="text-xs text-neutral-600 dark:text-zinc-300 leading-relaxed">
                When activated, logged-in customers will be presented with a stylish <strong>Brewing Improvements</strong> maintenance screen when accessing reservation or loyalty card features. Administrators retain full access to the admin console.
              </p>

              <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
                isMaintenanceActive
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
                  : "bg-background-alt/60 border-card-border text-neutral-500 dark:text-zinc-400"
              }`}>
                <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${isMaintenanceActive ? "text-amber-500" : "text-neutral-400"}`} />
                <div>
                  <span className="font-semibold block mb-0.5">
                    {isMaintenanceActive ? "Client Access Restricted" : "Client Site Operational"}
                  </span>
                  <span>
                    {isMaintenanceActive
                      ? "Customers attempting to access reservations or digital loyalty cards will see the maintenance notice until deactivated."
                      : "All customer reservation services and loyalty card features are operating normally."
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-card-border/60 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 dark:text-zinc-500">
                Instant sync across client tabs
              </span>

              <button
                type="button"
                onClick={handleMaintenanceToggle}
                disabled={isTogglingMaintenance}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 ${
                  isMaintenanceActive
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                    : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                }`}
              >
                {isTogglingMaintenance ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Wrench size={14} />
                )}
                <span>
                  {isMaintenanceActive ? "Deactivate Maintenance Mode" : "Activate Maintenance Mode"}
                </span>
              </button>
            </div>
          </div>

          {/* Dynamic Homepage Hero Customization Panel */}
          <div className="rounded-3xl border border-card-border bg-card/60 backdrop-blur-xl p-6 md:p-7 relative overflow-hidden shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-card-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-brand-green/15 text-brand-green">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-foreground">
                    Homepage Hero Customization
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-zinc-400">
                    Dynamically update hero text copy and background images.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20 px-2.5 py-1 rounded-full">
                Live Banner
              </span>
            </div>

            <form id="hero-settings-form" onSubmit={handleSaveHero} className="space-y-4">
              {/* Eyebrow Badge */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500 flex items-center justify-between">
                  <span>Eyebrow Badge Text</span>
                  <span className="text-[9px] font-normal text-neutral-400">Small top pill text</span>
                </label>
                <input
                  type="text"
                  value={heroEyebrow}
                  onChange={(e) => setHeroEyebrow(e.target.value)}
                  placeholder="Welcome to Antonioni Grounds"
                  className="w-full bg-white dark:bg-background-alt border border-card-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-neutral-500 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-all"
                />
              </div>

              {/* Headline Main & Highlight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                    Main Headline (White Text)
                  </label>
                  <input
                    type="text"
                    value={heroHeadlineMain}
                    onChange={(e) => setHeroHeadlineMain(e.target.value)}
                    placeholder="Where Every Cup"
                    className="w-full bg-white dark:bg-background-alt border border-card-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-neutral-500 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                    Headline Highlight (Green Italic)
                  </label>
                  <input
                    type="text"
                    value={heroHeadlineHighlight}
                    onChange={(e) => setHeroHeadlineHighlight(e.target.value)}
                    placeholder="Finds Its Story"
                    className="w-full bg-white dark:bg-background-alt border border-card-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-neutral-500 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-all"
                  />
                </div>
              </div>

              {/* Subcopy */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                  Subcopy Description Paragraph
                </label>
                <textarea
                  rows={2}
                  value={heroSubcopy}
                  onChange={(e) => setHeroSubcopy(e.target.value)}
                  placeholder="Experience handcrafted coffee..."
                  className="w-full bg-white dark:bg-background-alt border border-card-border rounded-xl py-2.5 px-3.5 text-xs text-foreground placeholder:text-neutral-500 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-all resize-none"
                />
              </div>

              {/* Hero Background Image */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500 flex items-center justify-between">
                  <span>Hero Background Image (Drag & Drop or Select)</span>
                  <span className="text-[9px] font-normal text-neutral-400">Drag image file or choose preset</span>
                </label>

                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer overflow-hidden ${
                    isDragActive
                      ? "border-brand-green bg-brand-green/10 scale-[1.01]"
                      : "border-card-border hover:border-brand-green/60 bg-white/50 dark:bg-background-alt/50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />

                  {heroBgImageUrl ? (
                    <div className="relative h-36 w-full rounded-xl overflow-hidden group">
                      <img
                        src={heroBgImageUrl}
                        alt="Hero Background Preview"
                        className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-3">
                        <Upload size={20} className="text-emerald-400 animate-bounce" />
                        <span className="text-xs font-semibold text-white">
                          Drag & drop new image here, or click to replace
                        </span>
                        <span className="text-[10px] text-zinc-300">
                          Supports PNG, JPG, WebP
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center gap-2">
                      <div className="p-3 rounded-2xl bg-brand-green/15 text-brand-green">
                        <Upload size={22} />
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        Drag & drop your Hero image here
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Or click anywhere to browse files on your computer
                      </p>
                    </div>
                  )}
                </div>

                {/* Custom URL Input */}
                <input
                  type="text"
                  value={heroBgImageUrl}
                  onChange={(e) => setHeroBgImageUrl(e.target.value)}
                  placeholder="/hero.png or https://..."
                  className="w-full bg-white dark:bg-background-alt border border-card-border rounded-xl py-2 px-3.5 text-xs text-foreground placeholder:text-neutral-500 outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 transition-all font-mono"
                />
              </div>

              <div className="pt-3 border-t border-card-border/60 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">
                  CTA Action buttons remain fixed
                </span>
                <button
                  type="submit"
                  disabled={isSavingHero}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-xs font-semibold text-white shadow-md shadow-brand-green/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isSavingHero ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  )}
                  <span>Save Hero Settings</span>
                </button>
              </div>
            </form>
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
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-md rounded-3xl border border-card-border bg-card p-8 shadow-2xl relative z-10 overflow-hidden text-foreground"
            >
              {/* Glow Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[30px] rounded-full pointer-events-none" />

              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-foreground hover:bg-neutral-500/10 transition-colors p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-500">
                  <Wrench size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-lg">
                    Activate Maintenance Mode?
                  </h3>
                  <p className="text-xs text-neutral-400">Antonioni Grounds System Control</p>
                </div>
              </div>

              <p className="text-neutral-600 dark:text-zinc-300 text-xs leading-relaxed mb-6 bg-background-alt/60 p-4 rounded-2xl border border-card-border">
                Activating maintenance mode will immediately lock public customer access across the website and present visitors with the <strong>Brewing Improvements</strong> notice. Admin & barista console accounts will remain unaffected.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold tracking-wider uppercase border border-card-border hover:bg-neutral-500/10 transition-colors rounded-xl cursor-pointer text-neutral-500 hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmToggleMaintenance(true)}
                  className="px-5 py-2.5 text-xs font-semibold tracking-wider uppercase bg-amber-500 hover:bg-amber-600 text-white transition-colors rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Activate Maintenance
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

