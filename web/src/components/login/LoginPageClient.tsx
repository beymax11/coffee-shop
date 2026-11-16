"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginDrawer } from "@/components/login/LoginDrawer";
import { Mail, Lock, Eye, EyeOff, Loader2, Check, LogIn } from "lucide-react";
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
import { toast } from "sonner";

/**
 * Full-page host for the LoginDrawer.
 * If ?view=page query is present, it renders a dedicated, borderless full-page
 * Sign In layout styling matching the Sign Up screen.
 */
export function LoginPageClient() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"drawer" | "page">("drawer");
  const [loadingView, setLoadingView] = useState(true);

  // Sign In Page States (for view === "page")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // Pre-login banners (e.g. email verified, password reset) must not lock the form via isSuccess
  const [noticeMessage, setNoticeMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const hasAuthPageParam =
      params.get("view") === "page" ||
      params.get("verified") === "true" ||
      params.get("reset") === "success" ||
      Boolean(params.get("error"));
    if (hasAuthPageParam || isMobile) {
      setViewMode("page");
    } else {
      setViewMode("drawer");
    }
    
    if (params.get("verified") === "true") {
      setNoticeMessage("Email verified successfully! Please sign in below to access your account.");
      toast.success("Email verified! You can now log in.", {
        id: "email-verified-toast",
        duration: 5000,
      });
    }

    if (params.get("reset") === "success") {
      setNoticeMessage("Password reset successfully! Please sign in below with your new password.");
      toast.success("Password reset successfully! You can now log in.", {
        id: "password-reset-toast",
        duration: 5000,
      });
    }

    const errorParam = params.get("error");
    if (errorParam) {
      if (errorParam === "no_session_found") {
        setErrorMsg("Verification link expired or session not found. Please try signing in or request a new confirmation link.");
      } else if (errorParam === "auth_callback_failed") {
        setErrorMsg("Authentication callback encountered an issue. Please try signing in directly.");
      }
    }
    
    setLoadingView(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !email) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setIsSuccess(false);
    setNoticeMessage("");
    setSuccessMessage("");

    const loginEmail = await resolveLoginEmail(email);

    // --- FALLBACK MOCK AUTHENTICATION (if Supabase is not configured) ---
    if (!supabase) {
      setTimeout(async () => {
        // Email mock flow
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@coffee.com";
        const isAdmin = loginEmail.toLowerCase() === adminEmail.toLowerCase() && password === "admin123";
        const isBarista = loginEmail.toLowerCase() === "barista@coffee.com" && password === "barista123";

        // Find custom mock profile role updates (from Users tab)
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
          window.location.replace("/admin");
        } else if (matchedMockUser && password === "customer123") {
          clearAdminSessionState();
          localStorage.setItem("customer_session", matchedMockUser.email);
          setCookie("customer_session", "true", 7);
          eraseCookie("sb-access-token");
          window.dispatchEvent(new Event("storage"));
          setSuccessMessage("Welcome back. Redirecting to Good Cup account...");
          setIsSuccess(true);
          window.location.replace("/");
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

      // Fetch profile containing their role & loyalty data
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
        window.location.replace("/admin");
      } else {
        // Customer Sign In: persist session synchronously and navigate home immediately
        persistCustomerLoginSession({
          user,
          profile,
          accessToken: data.session?.access_token,
        });
        setSuccessMessage("Welcome back. Redirecting to Good Cup account...");
        setIsSuccess(true);
        window.location.replace("/");
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

  if (loadingView) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  if (viewMode === "drawer") {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
        <LoginDrawer
          isOpen
          onClose={() => router.replace("/")}
          onAuthSuccess={(isStaff) => window.location.replace(isStaff ? "/admin" : "/")}
        />
      </div>
    );
  }

  const bannerMessage = isSuccess ? successMessage : noticeMessage;

  return (
    <div className="w-full flex-1 min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-80px)] bg-background text-foreground flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 relative overflow-x-hidden touch-pan-y transition-colors duration-500">
      {/* Decorative brand glow - strictly contained to avoid horizontal drag/scroll on mobile */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#2E5A44]/[0.03] via-transparent to-[#2E5A44]/[0.02]" />
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#2E5A44]/[0.06] blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#2E5A44]/[0.04] blur-3xl" />
      </div>

      {/* Main Wrapper - Centered, Steady on Mobile */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl flex flex-col my-auto py-2 sm:py-6"
      >
        {/* Header Block */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-card-border/40 relative">
          <span className="type-eyebrow text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-[10px] font-bold">
            Antonioni Grounds
          </span>
          <h1 className="text-foreground text-3xl font-serif mt-1 font-bold">
            The Good Cup
          </h1>
          <p className="type-body-sm text-neutral-500 dark:text-zinc-400 mt-2 max-w-md leading-relaxed">
            Enter your credentials to access your Good Cup account.
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
            {bannerMessage && (
              <motion.div
                key="login-status-banner"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 type-success text-emerald-600 dark:text-emerald-400 flex items-center gap-2 overflow-hidden"
              >
                <Check size={16} className="shrink-0" />
                <span className="text-sm font-sans">{bannerMessage}</span>
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                key="login-error-banner"
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
          <div className="space-y-1">
            <label htmlFor="login-page-email" className="type-label block text-xs">
              Email Address or Username
            </label>
            <div className="group relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                size={16}
              />
              <input
                id="login-page-email"
                type="text"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="w-full rounded-lg border border-card-border bg-background-alt/50 py-2.5 pl-11 pr-3 type-field text-foreground outline-none transition-all duration-300 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 focus:bg-background-alt font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 text-base sm:text-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label htmlFor="login-page-password" className="type-label block text-xs">
              Password
            </label>
            <div className="group relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500"
                size={16}
              />
              <input
                id="login-page-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="w-full rounded-lg border border-card-border bg-background-alt/50 py-2.5 pl-11 pr-11 type-field text-foreground outline-none transition-all duration-300 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 focus:bg-background-alt font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 text-base sm:text-sm disabled:opacity-50"
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

          {/* Remember Me & Forgot Password */}
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
            className="type-ui group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#2E5A44] py-3.5 text-white font-sans font-bold tracking-wider border border-[#2E5A44]/30 transition-all duration-300 hover:bg-[#234533] shadow-[0_0_20px_rgba(46,90,68,0.25)] hover:shadow-[0_0_30px_rgba(46,90,68,0.4)] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none mt-2 cursor-pointer"
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
        </form>

        {/* Footer Notice & Toggle Link */}
        <div className="mt-8 pt-6 border-t border-card-border/45 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="type-caption text-neutral-400 dark:text-zinc-500 text-[10px] leading-relaxed w-full sm:max-w-[280px]">
            Antonioni Grounds Reserve Membership.<br />
            By signing in you agree to our terms of service.
          </p>
          <p className="type-caption text-neutral-400 dark:text-zinc-500 text-xs">
            New to Antonioni Grounds?{" "}
            <button
              type="button"
              onClick={() => router.replace("/signup")}
              disabled={isSubmitting || isSuccess}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-semibold cursor-pointer disabled:opacity-50"
            >
              Create account
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
