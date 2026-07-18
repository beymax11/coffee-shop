"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, UserRound, UserPlus, AtSign, Phone, Check, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/utils/db";
import { supabase } from "@/utils/supabase";
import { formatPhoneNumber } from "@/utils/phone";

export function SignUpPageClient() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setIsSuccess(false);

    try {
      const activeEmail = authMethod === "email" ? email.trim() : "";
      const activePhone = authMethod === "phone" ? formatPhoneNumber(phone) : "";

      // 1. Validation
      if (authMethod === "email") {
        if (!activeEmail) throw new Error("Email address is required.");
        if (!name.trim()) throw new Error("Full name is required.");
        if (!username.trim()) throw new Error("Username is required.");
      } else {
        if (!activePhone) throw new Error("Phone number is required.");
        if (!activePhone.startsWith("+") || activePhone.length < 10) {
          throw new Error("Invalid phone number format. Please start with country code (e.g., +639171234567).");
        }
        if (!name.trim()) throw new Error("Full name is required.");
        if (!username.trim()) throw new Error("Username is required.");
      }

      // Check username syntax
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3) {
        throw new Error("Username must be at least 3 characters long.");
      }
      if (!/^[a-zA-Z0-9_.]+$/.test(trimmedUsername)) {
        throw new Error("Username can only contain alphanumeric characters, underscores, and dots.");
      }

      const randomId = `AG-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

      // 2. Suppress trigger warnings or mock DB handling
      if (!supabase) {
        // Mock registrations
        db.saveLoyaltyMember({
          id: randomId,
          name: name.trim(),
          username: trimmedUsername,
          email: activeEmail,
          phone: activePhone,
          stamps: 0,
          points: 0,
          joinedAt: new Date().toISOString().split("T")[0],
        });

        setSuccessMessage("Account created successfully! Redirecting to sign in...");
        setIsSuccess(true);
        
        setTimeout(() => {
          router.replace("/login?view=page");
        }, 1500);
        return;
      }

      // Route registrations based on authMethod
      if (authMethod === "phone") {
        const { data, error } = await supabase.auth.signUp({
          phone: activePhone,
          password,
          options: {
            data: {
              name: name.trim(),
              username: username.trim().toLowerCase(),
              role: "customer",
            },
          },
        });

        if (error) throw error;

        const user = data.user;
        if (user) {
          const userPhone = user.phone || activePhone;
          const members = db.getLoyaltyMembers();
          const existingMember = members.find((m) => m.phone && userPhone && m.phone.trim() === userPhone.trim());

          if (!existingMember) {
            db.saveLoyaltyMember({
              id: randomId,
              name: name.trim(),
              username: username.trim().toLowerCase(),
              email: user.email || "",
              phone: userPhone,
              stamps: 0,
              points: 0,
              joinedAt: new Date().toISOString().split("T")[0],
            });
          }
        }

        setSuccessMessage("Account created successfully! Redirecting to sign in...");
        setIsSuccess(true);
        setTimeout(() => {
          router.replace("/login?view=page");
        }, 1500);
        return;
      }

      // Email Auth Method -> Route through custom API
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: activeEmail,
          password,
          name: name.trim(),
          username: username.trim().toLowerCase(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to register account.");
      }

      const resData = await res.json();

      // Sync with local mock loyalty database for dashboard consistency
      const members = db.getLoyaltyMembers();
      const existingMember = members.find(
        (m) => m.email && activeEmail && m.email.toLowerCase() === activeEmail.toLowerCase()
      );

      if (!existingMember) {
        db.saveLoyaltyMember({
          id: randomId,
          name: name.trim(),
          username: username.trim().toLowerCase(),
          email: activeEmail,
          phone: activePhone,
          stamps: 0,
          points: 0,
          joinedAt: new Date().toISOString().split("T")[0],
        });
      }

      if (resData.emailConfirmRequired) {
        setSuccessMessage(
          "Registration successful! A verification link has been sent to your email. Please check your inbox and verify your account before logging in."
        );
        setIsSuccess(true);
      } else {
        setSuccessMessage("Account created successfully! Redirecting to sign in...");
        setIsSuccess(true);
        setTimeout(() => {
          router.replace("/login?view=page");
        }, 1500);
      }
    } catch (err: unknown) {
      console.error("Sign up error:", err);
      let errorMessage = err instanceof Error ? err.message : "An error occurred during registration.";
      if (
        errorMessage.toLowerCase().includes("already registered") ||
        errorMessage.toLowerCase().includes("already exists") ||
        errorMessage.toLowerCase().includes("email_exists") ||
        errorMessage.toLowerCase().includes("email already in use") ||
        errorMessage.toLowerCase().includes("user_already_exists")
      ) {
        errorMessage = "This account was already pre-registered at the store. Please go to 'Sign In' and claim your card via 'Forgot Password'.";
      }
      setErrorMsg(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-y-auto transition-colors duration-500">
      {/* Decorative brand glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#2E5A44]/[0.03] via-transparent to-[#2E5A44]/[0.02]" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#2E5A44]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#2E5A44]/[0.04] blur-3xl" />

      {/* Main Wrapper - Centered, Borderless, Direct Placement */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl flex flex-col py-8 md:py-12"
      >
        {/* Header Block */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-card-border/40 relative">
          
          <span className="type-eyebrow text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-[10px] font-bold">
            Antonioni Grounds
          </span>
          <h1 className="text-foreground text-3xl font-serif mt-1 font-bold">
            The Reserve
          </h1>
          <p className="type-body-sm text-neutral-500 dark:text-zinc-400 mt-2 max-w-md leading-relaxed">
            Create your reserve credentials to track stamps and redeem loyalty rewards.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-8">
          {!supabase && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 type-caption text-amber-500 dark:text-amber-400 leading-normal text-xs">
              <strong>Notice:</strong> Operating in mock auth mode.
            </div>
          )}

          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 type-success text-emerald-600 dark:text-emerald-400 flex items-center gap-2 overflow-hidden"
              >
                <Check size={16} className="shrink-0" />
                <span className="text-sm font-sans">{successMessage}</span>
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 type-error text-red-500 dark:text-red-400 text-sm overflow-hidden"
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auth Method Selector */}
          <div className="flex p-1 rounded-full bg-background-alt/50 border border-card-border/60 relative">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("email");
                setErrorMsg("");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all duration-300 relative z-10 cursor-pointer ${
                authMethod === "email"
                  ? "text-white"
                  : "text-zinc-400 hover:text-foreground"
              }`}
            >
              Email Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("phone");
                setErrorMsg("");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all duration-300 relative z-10 cursor-pointer ${
                authMethod === "phone"
                  ? "text-white"
                  : "text-zinc-400 hover:text-foreground"
              }`}
            >
              Phone Sign Up
            </button>
            
            {/* Background slide element */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#2E5A44] rounded-full transition-all duration-300 ease-[0.16,1,0.3,1] ${
                authMethod === "email" ? "left-1" : "left-[calc(50%+2px)]"
              }`}
            />
          </div>

          {/* Full Name Field */}
          <div className="space-y-1">
            <label htmlFor="signup-name" className="type-label block text-xs">
              Full Name
            </label>
            <div className="group relative">
              <UserRound
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                size={16}
              />
              <input
                id="signup-name"
                type="text"
                required
                placeholder="Juan Dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="w-full rounded-lg border border-card-border bg-background-alt/50 py-2.5 pl-11 pr-3 type-field text-foreground outline-none transition-all duration-300 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 focus:bg-background-alt font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-1">
            <label htmlFor="signup-username" className="type-label block text-xs">
              Username
            </label>
            <div className="group relative">
              <AtSign
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                size={16}
              />
              <input
                id="signup-username"
                type="text"
                required
                placeholder="juandelacruz"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="w-full rounded-lg border border-card-border bg-background-alt/50 py-2.5 pl-11 pr-3 type-field text-foreground outline-none transition-all duration-300 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 focus:bg-background-alt font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email (Email mode only) */}
          <AnimatePresence initial={false}>
            {authMethod === "email" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 overflow-hidden"
              >
                <label htmlFor="signup-email" className="type-label block text-xs">
                  Email Address
                </label>
                <div className="group relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                    size={16}
                  />
                  <input
                    id="signup-email"
                    type="email"
                    required={authMethod === "email"}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting || isSuccess}
                    className="w-full rounded-lg border border-card-border bg-background-alt/50 py-2.5 pl-11 pr-3 type-field text-foreground outline-none transition-all duration-300 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 focus:bg-background-alt font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 text-sm disabled:opacity-50"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phone (Phone mode only) */}
          <AnimatePresence initial={false}>
            {authMethod === "phone" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 overflow-hidden"
              >
                <label htmlFor="signup-phone" className="type-label block text-xs">
                  Phone Number
                </label>
                <div className="group relative">
                  <Phone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                    size={16}
                  />
                  <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm font-sans font-semibold text-zinc-400 select-none group-focus-within:text-foreground transition-colors">
                    +63
                  </span>
                  <span className="absolute left-16 top-[28%] bottom-[28%] w-px bg-card-border/60 group-focus-within:bg-emerald-500/40 transition-colors" />
                  <input
                    id="signup-phone"
                    type="tel"
                    required={authMethod === "phone"}
                    placeholder="9171234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting || isSuccess}
                    className="w-full rounded-lg border border-card-border bg-background-alt/50 py-2.5 pl-[4.75rem] pr-3 type-field text-foreground outline-none transition-all duration-300 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 focus:bg-background-alt font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 text-sm disabled:opacity-50"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password Fields in Side-by-Side (or stacked on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="signup-password" className="type-label block text-xs">
                Password
              </label>
              <div className="group relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                  size={16}
                />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting || isSuccess}
                  className="w-full rounded-lg border border-card-border bg-background-alt/50 py-2.5 pl-11 pr-11 type-field text-foreground outline-none transition-all duration-300 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 focus:bg-background-alt font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 text-sm disabled:opacity-50"
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
            <div className="space-y-1">
              <label htmlFor="signup-confirm-password" className="type-label block text-xs">
                Confirm Password
              </label>
              <div className="group relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                  size={16}
                />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting || isSuccess}
                  className="w-full rounded-lg border border-card-border bg-background-alt/50 py-2.5 pl-11 pr-11 type-field text-foreground outline-none transition-all duration-300 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 focus:bg-background-alt font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 text-sm disabled:opacity-50"
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="type-ui group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#2E5A44] py-3.5 text-white font-sans font-bold tracking-wider border border-[#2E5A44]/30 transition-all duration-300 hover:bg-[#234533] shadow-[0_0_20px_rgba(46,90,68,0.25)] hover:shadow-[0_0_30px_rgba(46,90,68,0.4)] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none mt-2 cursor-pointer"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
            <span className="relative flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                  <span>Create Account</span>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Footer Notice & Toggle Link */}
        <div className="mt-8 pt-6 border-t border-card-border/45 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="type-caption text-neutral-400 dark:text-zinc-500 text-[10px] leading-relaxed max-w-[280px]">
            Antonioni Grounds Reserve Membership.<br />
            By creating an account you agree to our terms of service.
          </p>
          <p className="type-caption text-neutral-400 dark:text-zinc-500 text-xs">
              Already a member?{" "}
            <button
              type="button"
              onClick={() => router.replace("/login?view=page")}
              disabled={isSubmitting || isSuccess}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-semibold cursor-pointer disabled:opacity-50"
            >
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
