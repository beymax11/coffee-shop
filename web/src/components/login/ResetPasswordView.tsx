"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/utils/supabase";

export function ResetPasswordView() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    // --- MOCK MODE (Supabase not configured) ---
    if (!supabase) {
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1000);
      return;
    }

    // --- REAL SUPABASE UPDATE ---
    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (err: unknown) {
      console.error("Password update error:", err);
      const message =
        err instanceof Error ? err.message : "Unable to update password. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-500 px-6 py-16 overflow-hidden">
      {/* Decorative brand glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#2E5A44]/[0.08] to-transparent" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#2E5A44]/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#2E5A44]/[0.05] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-card-border glassmorphism shadow-2xl p-8 md:p-10"
      >
        {/* Header */}
        <div className="border-b border-card-border/60 pb-6">
          <span className="type-eyebrow text-emerald-600 dark:text-emerald-400">
            Account Security
          </span>
          <h1 className="type-h2 text-foreground mt-0.5">New Password</h1>
          <div className="h-px w-12 bg-gradient-to-r from-[#2E5A44] to-transparent mt-5" />
          <p className="type-body-sm text-neutral-500 dark:text-zinc-400 mt-4 leading-relaxed">
            Please enter your new secure password below to regain full access to your reserve account.
          </p>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center py-8"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#2E5A44]/30 bg-gradient-to-br from-[#2E5A44]/20 to-[#2E5A44]/[0.05] text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(46,90,68,0.2)]">
              <CheckCircle2 size={24} strokeWidth={1.75} />
            </div>
            <h2 className="type-h3 text-foreground mt-5">Password updated</h2>
            <p className="type-body-sm text-neutral-500 dark:text-zinc-400 mt-2 leading-relaxed max-w-xs">
              Your password has been successfully reset. You can now use your new credentials to sign in.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="type-ui group relative mt-8 flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#2E5A44] px-8 py-3.5 text-white font-sans font-bold tracking-wider border border-[#2E5A44]/30 transition-all duration-300 hover:bg-[#234533] shadow-[0_0_20px_rgba(46,90,68,0.25)] hover:shadow-[0_0_30px_rgba(46,90,68,0.4)] active:scale-[0.98] cursor-pointer"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
              <span className="relative flex items-center gap-2">
                <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                <span>Go to Sign In</span>
              </span>
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-6">
            {!supabase && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 type-caption text-amber-500 dark:text-amber-400 leading-normal">
                <strong>Notice:</strong> Operating in mock auth mode. Password will be updated locally only.
              </div>
            )}

            {errorMsg && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 type-error text-red-500 dark:text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="reset-password" className="type-label block text-xs">
                New Password
              </label>
              <div className="group relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                  size={16}
                />
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-card-border bg-background-alt/50 py-3 pl-11 pr-11 type-field text-foreground outline-none transition-all duration-300 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 focus:bg-background-alt font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500 transition-colors duration-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirm-reset-password" className="type-label block text-xs">
                Confirm New Password
              </label>
              <div className="group relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                  size={16}
                />
                <input
                  id="confirm-reset-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-card-border bg-background-alt/50 py-3 pl-11 pr-11 type-field text-foreground outline-none transition-all duration-300 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 focus:bg-background-alt font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500 transition-colors duration-300"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="type-ui group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#2E5A44] py-4 text-white font-sans font-bold tracking-wider border border-[#2E5A44]/30 transition-all duration-300 hover:bg-[#234533] shadow-[0_0_20px_rgba(46,90,68,0.25)] hover:shadow-[0_0_30px_rgba(46,90,68,0.4)] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none mt-2 cursor-pointer"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
              <span className="relative flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </span>
            </button>

            {/* Back to Sign In */}
            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => router.push("/login")}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 type-caption text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-semibold cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft size={13} />
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
