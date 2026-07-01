"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Coffee, Eye, EyeOff, Lock, LogIn, Mail, UserRound } from "lucide-react";
import { FadeUp, PageTransition } from "@/components/animations";
import { db } from "@/utils/db";

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      const trimmedEmail = email.trim();
      const isAdmin = trimmedEmail === "admin@coffee.com" && password === "admin123";
      if (isAdmin) {
        setSuccessMessage("Access granted. Redirecting to admin panel...");
        localStorage.setItem("admin_session", "true");
        localStorage.removeItem("customer_session");
        window.dispatchEvent(new Event("storage"));
        setTimeout(() => {
          router.push("/admin");
        }, 1200);
      } else {
        setSuccessMessage("Welcome back. Redirecting to your salon...");
        localStorage.removeItem("admin_session");
        
        // Find existing loyalty member
        const members = db.getLoyaltyMembers();
        const existingMember = members.find(
          (m) => m.email.toLowerCase() === trimmedEmail.toLowerCase()
        );

        if (existingMember) {
          localStorage.setItem("customer_session", existingMember.email);
        } else {
          // Auto-register new loyalty member
          const namePart = trimmedEmail.split("@")[0];
          const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          const randomId = `LN-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
          
          const newMember = {
            id: randomId,
            name,
            email: trimmedEmail,
            stamps: 0,
            points: 0,
            joinedAt: new Date().toISOString().split("T")[0]
          };
          
          db.saveLoyaltyMember(newMember);
          localStorage.setItem("customer_session", trimmedEmail);
        }

        window.dispatchEvent(new Event("storage"));
        setTimeout(() => {
          router.push("/");
        }, 1200);
      }
    }, 900);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0B0B0B] py-16 md:py-24 text-[#F5F5F0]">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
            {/* Brand panel */}
            <FadeUp className="flex flex-col justify-between rounded-2xl border border-white/5 bg-[#141414] p-10 glassmorphism-gold shadow-xl">
              <div>
                <span className="type-eyebrow">Member Access</span>
                <h1 className="type-h1 text-white mt-2">L&apos;OR NOIR Reserve</h1>
                <div className="h-[1px] w-12 bg-brand-gold mt-4" />
                <p className="type-body text-zinc-400 mt-6 leading-relaxed">
                  Sign in to manage your bean subscriptions, view order history, and access exclusive salon reservations.
                </p>
              </div>

              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 type-body-sm">
                  <Coffee className="text-brand-gold shrink-0" size={18} />
                  <span>Priority Geisha reserve allocations</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400 type-body-sm">
                  <Coffee className="text-brand-gold shrink-0" size={18} />
                  <span>Private event booking & concierge chat</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400 type-body-sm">
                  <Coffee className="text-brand-gold shrink-0" size={18} />
                  <span>Complimentary salon tastings at all locations</span>
                </div>
              </div>

              <p className="type-caption text-zinc-600 mt-10">
                New to L&apos;OR NOIR?{" "}
                <Link href="/contact" className="text-brand-gold hover:text-brand-gold-hover transition-colors">
                  Request a membership invitation
                </Link>
              </p>
            </FadeUp>

            {/* Login form */}
            <FadeUp delay={0.1}>
              <div className="rounded-2xl border border-white/5 bg-[#141414] p-8 md:p-10 glassmorphism shadow-xl h-full flex flex-col justify-center">
                <div className="mb-8">
                  <h2 className="type-h2 text-white">Sign In</h2>
                  <p className="type-body text-zinc-400 mt-2">
                    Enter your credentials to access your reserve account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {isSuccess && (
                    <div className="rounded border border-green-500/20 bg-green-500/10 p-4 type-success text-green-400 flex items-center gap-2">
                      <Check size={16} />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="login-email" className="type-label block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                        size={16}
                      />
                      <input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded border border-white/10 bg-[#181818] py-3 pl-10 pr-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="login-password" className="type-label block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                        size={16}
                      />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded border border-white/10 bg-[#181818] py-3 pl-10 pr-11 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 font-sans"
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

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-[#181818] text-brand-gold focus:ring-brand-gold/40 focus:ring-offset-0"
                      />
                      <span className="type-caption text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      className="type-caption text-brand-gold hover:text-brand-gold-hover transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-gold py-3 type-ui text-black hover:bg-brand-gold-hover transition-colors gold-glow active:scale-95 disabled:opacity-60 disabled:pointer-events-none mt-2"
                  >
                    {isSubmitting ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <LogIn size={14} />
                        Sign In
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="type-caption text-zinc-500">or</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <Link
                    href="/"
                    className="w-full flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 py-3 type-ui text-white hover:bg-white/10 transition-colors active:scale-95"
                  >
                    <UserRound size={14} />
                    Continue as a Guest
                    <ArrowRight size={14} className="text-zinc-500" />
                  </Link>
                </form>

                <p className="type-caption text-zinc-600 text-center mt-8">
                  By signing in you agree to our reserve membership terms.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
