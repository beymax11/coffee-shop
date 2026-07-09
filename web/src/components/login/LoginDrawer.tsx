"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, Eye, EyeOff, LogIn, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/utils/db";
import { supabase } from "@/utils/supabase";

export interface LoginDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginDrawer: React.FC<LoginDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setIsSuccess(false);

    const trimmedEmail = email.trim();
    let loginEmail = trimmedEmail;

    // --- RESOLVE USERNAME TO EMAIL (if using Supabase) ---
    if (supabase) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", trimmedEmail)
          .single();

        if (profile?.email) {
          loginEmail = profile.email;
        }
      } catch (err) {
        // Fall back to input text if no matching username profile found
      }
    } else {
      // Mock mode fallback for 'admin' username
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@coffee.com";
      if (trimmedEmail.toLowerCase() === "admin") {
        loginEmail = adminEmail;
      }
    }

    // --- FALLBACK MOCK AUTHENTICATION (if Supabase is not configured) ---
    if (!supabase) {
      setTimeout(() => {
        setIsSubmitting(false);

        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@coffee.com";
        const isAdmin = loginEmail.toLowerCase() === adminEmail.toLowerCase() && password === "admin123";
        
        if (isAdmin) {
          setSuccessMessage("Access granted. Redirecting to admin panel (Mock)...");
          setIsSuccess(true);
          localStorage.setItem("admin_session", "true");
          localStorage.removeItem("customer_session");
          window.dispatchEvent(new Event("storage"));
          setTimeout(() => {
            router.push("/admin");
            onClose();
          }, 1200);
        } else {
          setSuccessMessage("Welcome back. Logging you in...");
          setIsSuccess(true);
          localStorage.removeItem("admin_session");

          // Find or create mock member
          const members = db.getLoyaltyMembers();
          const existingMember = members.find(
            (m) => m.email.toLowerCase() === loginEmail.toLowerCase()
          );

          if (existingMember) {
            localStorage.setItem("customer_session", existingMember.email);
          } else {
            const namePart = loginEmail.split("@")[0];
            const autoName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            const randomId = `LN-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

            const newMember = {
              id: randomId,
              name: autoName,
              email: loginEmail,
              stamps: 0,
              points: 0,
              joinedAt: new Date().toISOString().split("T")[0]
            };

            db.saveLoyaltyMember(newMember);
            localStorage.setItem("customer_session", loginEmail);
          }

          window.dispatchEvent(new Event("storage"));
          setTimeout(() => {
            onClose();
          }, 1200);
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
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error retrieving user profile from Supabase:", profileError);
      }

      const role = profile?.role || "customer";
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@coffee.com";
      const isAdmin = role === "admin" || loginEmail.toLowerCase() === adminEmail.toLowerCase();

      if (isAdmin) {
        setSuccessMessage("Access granted. Redirecting to admin panel...");
        setIsSuccess(true);
        localStorage.setItem("admin_session", "true");
        localStorage.removeItem("customer_session");
        window.dispatchEvent(new Event("storage"));
        setTimeout(() => {
          router.push("/admin");
          onClose();
        }, 1200);
      } else {
        setSuccessMessage("Welcome back. Logging you in...");
        setIsSuccess(true);
        localStorage.removeItem("admin_session");

        // Sync data from profiles back to local storage loyalty DB
        const members = db.getLoyaltyMembers();
        const existingMember = members.find(
          (m) => m.email.toLowerCase() === loginEmail.toLowerCase()
        );

        if (existingMember) {
          if (profile) {
            existingMember.stamps = profile.stamps ?? existingMember.stamps;
            existingMember.points = profile.points ?? existingMember.points;
            existingMember.name = profile.name ?? existingMember.name;
            db.saveLoyaltyMember(existingMember);
          }
          localStorage.setItem("customer_session", existingMember.email);
        } else {
          const displayName = profile?.name || loginEmail.split("@")[0];
          const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
          db.saveLoyaltyMember({
            id: profile?.id || `LN-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
            name: capitalizedName,
            email: loginEmail,
            stamps: profile?.stamps || 0,
            points: profile?.points || 0,
            joinedAt: profile?.created_at
              ? new Date(profile.created_at).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          });
          localStorage.setItem("customer_session", loginEmail);
        }

        window.dispatchEvent(new Event("storage"));
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: unknown) {
      console.error("Auth process error:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred during authentication.";
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Body - Full Height, Right Side */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-md h-full bg-card border-l border-card-border/60 p-8 md:p-10 shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-card-border/50 pb-5 mb-8">
                <div>
                  <span className="type-eyebrow">Access Reserve</span>
                  <h2 className="type-h2 text-foreground mt-1">Sign In</h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full border border-card-border bg-background/50 dark:bg-zinc-900/50 p-2 text-zinc-400 hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-none"
                  aria-label="Close Sign In"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Login Form Only */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!supabase && (
                  <div className="rounded border border-amber-500/20 bg-amber-500/10 p-3 type-caption text-amber-400 leading-normal">
                    <strong>Notice:</strong> Operating in mock auth mode.
                  </div>
                )}

                {isSuccess && (
                  <div className="rounded border border-green-500/20 bg-green-500/10 p-4 type-success text-green-400 flex items-center gap-2">
                    <Check size={16} className="shrink-0" />
                    <span className="text-sm font-sans">{successMessage}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="rounded border border-red-500/20 bg-red-500/10 p-4 type-error text-red-400 text-sm">
                    {errorMsg}
                  </div>
                )}

                {/* Email / Username Field */}
                <div className="space-y-1.5">
                  <label htmlFor="drawer-login-email" className="type-label block text-xs">
                    Email Address or Username
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
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
                      className="w-full rounded border border-card-border bg-background-alt/50 py-3 pl-10 pr-3 type-field text-foreground outline-none focus:border-brand-gold/60 font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="drawer-login-password" className="type-label block text-xs">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
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
                      className="w-full rounded border border-card-border bg-background-alt/50 py-3 pl-10 pr-11 type-field text-foreground outline-none focus:border-brand-gold/60 font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
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
                      className="h-4 w-4 rounded border-white/20 bg-[#181818] text-brand-gold focus:ring-brand-gold/40 focus:ring-offset-0 disabled:opacity-50"
                    />
                    <span className="type-caption text-zinc-400 group-hover:text-zinc-300 transition-colors select-none text-xs">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    disabled={isSubmitting || isSuccess}
                    className="type-caption text-brand-gold hover:text-brand-gold-hover transition-colors text-xs disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-gold py-3.5 type-ui text-black font-sans font-bold tracking-wider hover:bg-brand-gold-hover transition-colors gold-glow active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none mt-4 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-black" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <LogIn size={15} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
                
                {/* Sign Up Link */}
                <div className="text-center pt-3">
                  <p className="type-caption text-neutral-400 dark:text-zinc-500 text-xs">
                    New to Antonioni Grounds?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push("/login?mode=signup");
                      }}
                      className="text-brand-gold hover:text-brand-gold-hover transition-colors font-semibold cursor-pointer"
                    >
                      Request a membership invitation
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Footer Notice */}
            <div className="border-t border-card-border/50 pt-6 mt-8">
              <p className="type-caption text-zinc-500 text-center text-[10px] leading-relaxed">
                Antonioni Grounds Reserve Membership.<br />
                By signing in you agree to our terms of service.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
