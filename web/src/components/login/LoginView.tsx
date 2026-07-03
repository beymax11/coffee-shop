"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Coffee, Eye, EyeOff, Lock, LogIn, Mail, UserRound } from "lucide-react";
import { FadeUp, PageTransition } from "@/components/animations";
import { db } from "@/utils/db";
import { supabase } from "@/utils/supabase";

export function LoginView() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
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
    if (isSignUp && !name) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setIsSuccess(false);

    const trimmedEmail = email.trim();
    let loginEmail = trimmedEmail;

    // --- RESOLVE USERNAME TO EMAIL (if using Supabase) ---
    if (supabase && !isSignUp) {
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
    } else if (!supabase && !isSignUp) {
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

        if (isSignUp) {
          // Register mock customer
          const randomId = `LN-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
          const newMember = {
            id: randomId,
            name: name.trim(),
            email: trimmedEmail,
            stamps: 0,
            points: 0,
            joinedAt: new Date().toISOString().split("T")[0]
          };
          db.saveLoyaltyMember(newMember);
          localStorage.setItem("customer_session", trimmedEmail);
          localStorage.removeItem("admin_session");
          setSuccessMessage("Account created (Mock). Redirecting to Antonioni Grounds...");
          setIsSuccess(true);
          window.dispatchEvent(new Event("storage"));
          setTimeout(() => {
            router.push("/");
          }, 1200);
          return;
        }

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
          }, 1200);
        } else {
          setSuccessMessage("Welcome back. Redirecting to Antonioni Grounds (Mock)...");
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
            router.push("/");
          }, 1200);
        }
      }, 900);
      return;
    }

    // --- REAL SUPABASE AUTHENTICATION ---
    try {
      if (isSignUp) {
        // Sign Up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              name: name.trim(),
              role: "customer",
            },
          },
        });

        if (error) throw error;

        const user = data.user;
        if (user) {
          // Pre-register user in local storage to support local loyalty DB views
          const members = db.getLoyaltyMembers();
          const existingMember = members.find(
            (m) => m.email.toLowerCase() === trimmedEmail.toLowerCase()
          );
          if (!existingMember) {
            const randomId = `LN-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
            db.saveLoyaltyMember({
              id: randomId,
              name: name.trim(),
              email: trimmedEmail,
              stamps: 0,
              points: 0,
              joinedAt: new Date().toISOString().split("T")[0],
            });
          }

          if (data.session) {
            // Logged in immediately (email confirmation disabled in Supabase settings)
            localStorage.setItem("customer_session", trimmedEmail);
            localStorage.removeItem("admin_session");
            setSuccessMessage("Account created successfully! Redirecting...");
            setIsSuccess(true);
            window.dispatchEvent(new Event("storage"));
            setTimeout(() => {
              router.push("/");
            }, 1200);
          } else {
            // Verification email sent
            setSuccessMessage("Registration successful! Please check your email for the confirmation link.");
            setIsSuccess(true);
          }
        }
      } else {
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
          }, 1200);
        } else {
          setSuccessMessage("Welcome back. Redirecting to Antonioni Grounds...");
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
            const displayName = profile?.name || name || loginEmail.split("@")[0];
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
            router.push("/");
          }, 1200);
        }
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
    <PageTransition>
      <div className="min-h-screen bg-background py-16 md:py-24 text-foreground transition-colors duration-500">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
            {/* Brand panel */}
            <FadeUp className="flex flex-col justify-between rounded-2xl border border-card-border bg-card p-10 glassmorphism-gold shadow-xl">
              <div>
                <span className="type-eyebrow">Member Access</span>
                <h1 className="type-h1 text-foreground mt-2">Antonioni Grounds Reserve</h1>
                <div className="h-[1px] w-12 bg-brand-gold mt-4" />
                <p className="type-body text-neutral-500 dark:text-zinc-400 mt-6 leading-relaxed">
                  Sign in to manage your bean subscriptions, view order history, and access exclusive table reservations.
                </p>
              </div>

              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-3 text-neutral-500 dark:text-zinc-400 type-body-sm">
                  <Coffee className="text-brand-gold shrink-0" size={18} />
                  <span>Priority Geisha reserve allocations</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 dark:text-zinc-400 type-body-sm">
                  <Coffee className="text-brand-gold shrink-0" size={18} />
                  <span>Private event booking & concierge chat</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500 dark:text-zinc-400 type-body-sm">
                  <Coffee className="text-brand-gold shrink-0" size={18} />
                  <span>Complimentary tastings at all locations</span>
                </div>
              </div>

               <p className="type-caption text-neutral-400 dark:text-zinc-600 mt-10">
                New to Antonioni Grounds?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg("");
                    setIsSuccess(false);
                  }}
                  className="text-brand-gold hover:text-brand-gold-hover transition-colors font-semibold"
                >
                  Request a membership invitation
                </button>
              </p>
            </FadeUp>

            {/* Login/Signup form */}
            <FadeUp delay={0.1}>
              <div className="rounded-2xl border border-card-border bg-card p-8 md:p-10 glassmorphism shadow-xl h-full flex flex-col justify-center">
                <div className="mb-8">
                  <h2 className="type-h2 text-foreground">{isSignUp ? "Register" : "Sign In"}</h2>
                  <p className="type-body text-neutral-500 dark:text-zinc-400 mt-2">
                    {isSignUp
                      ? "Create your reserve credentials to join Antonioni Grounds."
                      : "Enter your credentials to access your reserve account."}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!supabase && (
                    <div className="rounded border border-amber-500/20 bg-amber-500/10 p-3 type-caption text-amber-400 leading-normal">
                      <strong>Developer Notice:</strong> Supabase environment variables not configured. Operating in mock auth mode.
                    </div>
                  )}

                  {isSuccess && (
                    <div className="rounded border border-green-500/20 bg-green-500/10 p-4 type-success text-green-400 flex items-center gap-2">
                      <Check size={16} />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="rounded border border-red-500/20 bg-red-500/10 p-4 type-error text-red-400 text-sm">
                      {errorMsg}
                    </div>
                  )}

                  {isSignUp && (
                    <div className="space-y-1.5">
                      <label htmlFor="login-name" className="type-label block">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserRound
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                          size={16}
                        />
                        <input
                          id="login-name"
                          type="text"
                          required
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded border border-card-border bg-background-alt/50 py-3 pl-10 pr-3 type-field text-foreground outline-none focus:border-brand-gold/60 font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="login-email" className="type-label block">
                      {isSignUp ? "Email Address" : "Email Address or Username"}
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                        size={16}
                      />
                      <input
                        id="login-email"
                        type={isSignUp ? "email" : "text"}
                        required
                        autoComplete="email"
                        placeholder={isSignUp ? "you@example.com" : "you@example.com "}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded border border-card-border bg-background-alt/50 py-3 pl-10 pr-3 type-field text-foreground outline-none focus:border-brand-gold/60 font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600"
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
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded border border-card-border bg-background-alt/50 py-3 pl-10 pr-11 type-field text-foreground outline-none focus:border-brand-gold/60 font-sans placeholder:text-neutral-400 dark:placeholder:text-zinc-600"
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

                  {!isSignUp && (
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
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-gold py-3 type-ui text-black hover:bg-brand-gold-hover transition-colors gold-glow active:scale-95 disabled:opacity-60 disabled:pointer-events-none mt-2"
                  >
                    {isSubmitting ? (
                      <span>{isSignUp ? "Creating Account..." : "Authenticating..."}</span>
                    ) : (
                      <>
                        <LogIn size={14} />
                        {isSignUp ? "Register Account" : "Sign In"}
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setErrorMsg("");
                        setIsSuccess(false);
                      }}
                      className="type-caption text-brand-gold hover:text-brand-gold-hover transition-colors focus:outline-none font-medium"
                    >
                      {isSignUp
                        ? "Already have a reserve account? Sign In"
                        : "New to Antonioni Grounds? Create your account"}
                    </button>
                  </div>

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

