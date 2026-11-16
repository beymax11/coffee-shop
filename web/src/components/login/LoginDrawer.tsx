"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, Eye, EyeOff, LogIn, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/utils/db";
import { supabase } from "@/utils/supabase";
import { setCookie, eraseCookie } from "@/utils/cookies";
import {
  clearAdminSessionState,
  persistCustomerLoginSession,
  persistStaffLoginSession,
  resolveLoginEmail,
} from "@/utils/login-client";

export interface LoginDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (isStaff: boolean) => void;
}

export function LoginDrawer({ isOpen, onClose, onAuthSuccess }: LoginDrawerProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") {
      onClose();
      router.push("/signup");
    }
  }, [isOpen, router, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !email) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setIsSuccess(false);

    const loginEmail = await resolveLoginEmail(email);

    // --- FALLBACK MOCK AUTHENTICATION (if Supabase is not configured) ---
    if (!supabase) {
      setTimeout(async () => {
        // Email mock flow
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@coffee.com";
        const isAdmin = loginEmail.toLowerCase() === adminEmail.toLowerCase() && password === "admin123";
        const isBarista = loginEmail.toLowerCase() === "barista@coffee.com" && password === "barista123";

        const mockUsers = db.getMockUsers();
        const matchedMockUser = mockUsers.find(
          (u) => u.email.toLowerCase() === loginEmail.toLowerCase()
        );
        const isCustomStaff = matchedMockUser && (matchedMockUser.role === "admin" || matchedMockUser.role === "barista") && password === "staff123";

        if (isAdmin || isBarista || isCustomStaff) {
          const userRole = isAdmin ? "admin" : isBarista ? "barista" : (matchedMockUser?.role || "customer");
          const userName = isAdmin ? "Antonioni Grounds Admin" : isBarista ? "Barista Staff" : (matchedMockUser?.name || "Staff");
          const userEmail = isAdmin ? adminEmail : isBarista ? "barista@coffee.com" : (matchedMockUser?.email || "");

          await persistStaffLoginSession({
            userId: "mock-admin-id",
            email: userEmail,
            role: userRole as "admin" | "barista",
            name: userName,
          });
          setSuccessMessage("Access granted. Redirecting to admin panel (Mock)...");
          setIsSuccess(true);
          if (onAuthSuccess) {
            onAuthSuccess(true);
          } else {
            onClose();
            window.location.replace("/admin");
          }
        } else if (matchedMockUser && password === "customer123") {
          clearAdminSessionState();
          localStorage.setItem("customer_session", matchedMockUser.email);
          setCookie("customer_session", "true", 7);
          eraseCookie("sb-access-token");
          window.dispatchEvent(new Event("storage"));
          setSuccessMessage("Welcome back. Redirecting to Good Cup account...");
          setIsSuccess(true);
          if (onAuthSuccess) {
            onAuthSuccess(false);
          } else {
            onClose();
          }
        } else {
          setIsSubmitting(false);
          setErrorMsg("Invalid credentials (Mock). Try 'admin' / 'admin123' or 'customer123'.");
        }
      }, 900);
      return;
    }

    // --- REAL SUPABASE AUTHENTICATION ---
    try {
      // Sign In with Supabase using resolved loginEmail
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error("No user returned from authentication.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, loyalty_cards(*)")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error retrieving user profile from Supabase:", profileError);
      }

      const role = profile?.role || "customer";
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@coffee.com";
      const isStaff = role === "admin" || role === "barista" || (user.email && user.email.toLowerCase() === adminEmail.toLowerCase());

      if (isStaff) {
        const actualRole = (role === "admin" || (user.email && user.email.toLowerCase() === adminEmail.toLowerCase())) ? "admin" : "barista";
        const adminName = profile?.name || user.user_metadata?.name || (actualRole === "admin" ? "Admin User" : "Barista Staff");
        await persistStaffLoginSession({
          userId: user.id,
          email: user.email || "",
          role: actualRole,
          name: adminName,
          accessToken: data.session?.access_token,
        });
        setSuccessMessage("Access granted. Redirecting to Antonioni Grounds Admin Panel...");
        setIsSuccess(true);
        if (onAuthSuccess) {
          onAuthSuccess(true);
        } else {
          onClose();
          window.location.replace("/admin");
        }
      } else {
        // Customer Sign In
        persistCustomerLoginSession({
          user,
          profile,
          accessToken: data.session?.access_token,
        });
        setSuccessMessage("Welcome back. Redirecting to Good Cup account...");
        setIsSuccess(true);
        if (onAuthSuccess) {
          onAuthSuccess(false);
        } else {
          onClose();
        }
      }
    } catch (err: unknown) {
      console.error("Auth process error:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred during authentication.";
      setIsSuccess(false);
      setErrorMsg(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Drawer Body - Full Height, Right Side */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-md h-full glassmorphism border-l border-card-border/60 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Decorative brand glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#2E5A44]/[0.10] to-transparent" />
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#2E5A44]/[0.08] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#2E5A44]/[0.05] blur-3xl" />

            <div className="relative z-10 flex flex-col h-full p-8 md:p-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="border-b border-card-border/60 pb-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="type-eyebrow text-emerald-600 dark:text-emerald-400">
                      The Good Cup
                    </span>
                    <h2 className="type-h2 text-foreground mt-0.5">
                      Sign In
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full border border-card-border bg-background/60 dark:bg-zinc-900/50 p-2 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 hover:rotate-90 active:scale-95 transition-all duration-300 cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={16} strokeWidth={1.75} />
                  </button>
                </div>
                <div className="h-px w-12 bg-gradient-to-r from-[#2E5A44] to-transparent mt-5" />
                <p className="type-body-sm text-neutral-500 dark:text-zinc-400 mt-4 leading-relaxed">
                  Enter your credentials to access your Good Cup account.
                </p>
              </motion.div>

              {/* Login Form Only */}
              <motion.form
                onSubmit={handleSubmit}
                className="flex-1 flex flex-col justify-center space-y-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                  {!supabase && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 type-caption text-amber-500 dark:text-amber-400 leading-normal">
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

                  {/* Email / Username Field */}
                  <div className="space-y-2">
                    <label htmlFor="drawer-login-email" className="type-label block text-xs">
                      Email Address or Username
                    </label>
                    <div className="group relative">
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                        size={16}
                      />
                      <input
                        id="drawer-login-email"
                        type="text"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting || isSuccess}
                        className="w-full rounded-lg border border-card-border bg-background-alt/50 py-3 pl-11 pr-3 type-field text-foreground outline-none transition-all duration-300 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 focus:bg-background-alt font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="drawer-login-password" className="type-label block text-xs">
                      Password
                    </label>
                    <div className="group relative">
                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                        size={16}
                      />
                      <input
                        id="drawer-login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting || isSuccess}
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

                  {/* Remember Me & Forgot Password (sign-in only) */}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isSubmitting || isSuccess}
                        className="h-4 w-4 rounded border-card-border bg-background-alt accent-[#2E5A44] text-emerald-600 focus:ring-emerald-500/40 focus:ring-offset-0 disabled:opacity-50"
                      />
                      <span className="type-caption text-neutral-500 dark:text-zinc-400 group-hover:text-foreground transition-colors select-none text-xs">
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      disabled={isSubmitting || isSuccess}
                      onClick={() => {
                        onClose();
                        router.push("/login/forgot");
                      }}
                      className="type-caption text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-xs disabled:opacity-50 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className="type-ui group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#2E5A44] py-4 text-white font-sans font-bold tracking-wider border border-[#2E5A44]/30 transition-all duration-300 hover:bg-[#234533] shadow-[0_0_20px_rgba(46,90,68,0.25)] hover:shadow-[0_0_30px_rgba(46,90,68,0.4)] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none mt-4 cursor-pointer"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
                    <span className="relative flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <LogIn size={15} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                          <span>Sign In</span>
                        </>
                      )}
                    </span>
                  </button>

                  {/* Redirect to Sign Up page */}
                  <div className="text-center pt-3">
                    <p className="type-caption text-neutral-400 dark:text-zinc-500 text-xs">
                      New to Antonioni Grounds?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          router.push("/signup");
                        }}
                        disabled={isSubmitting || isSuccess}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Create your account
                      </button>
                    </p>
                  </div>
                </motion.form>

              {/* Footer Notice */}
              <div className="border-t border-card-border/60 pt-6">
                <p className="type-caption text-neutral-400 dark:text-zinc-500 text-center text-[10px] leading-relaxed">
                  Antonioni Grounds Reserve Membership.<br />
                  By signing in you agree to our terms of service.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
