"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, UserRound, LogOut, Copy, Check, Sparkles, Award, Coffee, Loader2, Sun, Moon } from "lucide-react";
import { useScroll } from "@/hooks/use-scroll";
import { motion, AnimatePresence } from "framer-motion";
import { db, LoyaltyMember } from "@/utils/db";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<LoyaltyMember | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Read theme on mount
  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "June 2026";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Monitor scroll height with our custom hook
  const isScrolled = useScroll(50);

  useEffect(() => {
    const checkSession = () => {
      const sessionEmail = localStorage.getItem("customer_session");
      if (sessionEmail) {
        const members = db.getLoyaltyMembers();
        const found = members.find(
          (m) => m.email.toLowerCase() === sessionEmail.toLowerCase()
        );
        if (found) {
          setCustomer(found);
          return;
        }
      }
      setCustomer(null);
    };

    checkSession();
    window.addEventListener("storage", checkSession);
    return () => window.removeEventListener("storage", checkSession);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("customer_session");
      setCustomer(null);
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
      setIsLoggingOut(false);
      window.dispatchEvent(new Event("storage"));
    }, 1000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Reservations", href: "/reservations" },
    { name: "Loyalty Card", href: "/loyalty" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 flex items-center ${isScrolled
            ? "border-b border-card-border bg-background/80 backdrop-blur-md h-16 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            : "bg-transparent h-20"
          }`}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="ANTONIONI GROUNDS"
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 invert dark:invert-0"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative type-nav transition-colors ${
                    isActive ? "text-foreground font-semibold" : "text-neutral-500 hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="navActiveLine"
                      className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-brand-gold"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full border border-card-border bg-card/40 flex items-center justify-center text-zinc-500 hover:text-brand-gold hover:border-brand-gold/30 transition-all duration-300 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </button>

            {customer ? (
              <div className="flex items-center gap-2.5">
                 {/* Profile Capsule Button */}
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-gold/30 bg-card/90 transition-all duration-300 hover:border-brand-gold hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  aria-label="Profile"
                >
                  <div className="absolute inset-0 rounded-full bg-brand-gold/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                  <div className="w-5 h-5 rounded-full border border-brand-gold/40 bg-background flex items-center justify-center text-brand-gold text-[9px] font-bold shadow-[0_0_8px_rgba(197,168,128,0.1)] select-none">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-neutral-500 dark:text-zinc-300 group-hover:text-foreground dark:group-hover:text-white transition-colors">
                    {customer.name.split(" ")[0]}
                  </span>
                </button>

                 {/* Log Out Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-8 h-8 rounded-full border border-card-border bg-card/50 flex items-center justify-center text-neutral-500 dark:text-zinc-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Sign Out"
                >
                  {isLoggingOut ? (
                    <Loader2 size={13} className="animate-spin text-zinc-400" />
                  ) : (
                    <LogOut size={13} />
                  )}
                </button>
              </div>
            ) : (
              <Link href="/login" className="group relative" aria-label="Sign In">
                {/* Background glow ring on hover */}
                <div className="absolute inset-0 -m-[1px] rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-hover opacity-0 blur-[6px] transition-opacity duration-500 group-hover:opacity-100" />
                                {/* Main button container */}
                <div className={`relative flex items-center gap-2 px-5 py-2 rounded-full border text-[10px] font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 group-hover:scale-[1.02] active:scale-[0.98] ${
                  pathname === "/login"
                    ? "bg-brand-gold border-brand-gold text-black shadow-[0_0_15px_rgba(197,168,128,0.3)]"
                    : "bg-card/90 border-brand-gold/30 text-neutral-500 dark:text-zinc-300 group-hover:border-brand-gold group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-brand-gold group-hover:to-brand-gold-hover shadow-[0_0_15px_rgba(197,168,128,0.03)]"
                }`}>
                  <LogIn size={11} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  <span>Sign In</span>
                </div>
              </Link>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-zinc-400 hover:text-white transition-colors p-1"
              aria-label="Toggle Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-card-border p-8 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-card-border pb-6 mb-8">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <img
                      src="/logo.png"
                      alt="ANTONIONI GROUNDS"
                      className="h-7 w-auto object-contain invert dark:invert-0"
                    />
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-full border border-card-border bg-card p-2 text-zinc-400 hover:text-foreground"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Mobile Links */}
                <nav className="flex flex-col gap-6">
                  {customer ? (
                    <div className="border-b border-card-border pb-6 mb-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-brand-gold/30 bg-background-alt flex items-center justify-center text-brand-gold">
                          <UserRound size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">
                            {customer.name}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {customer.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setIsProfileOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-2 text-left type-nav text-sm text-neutral-500 dark:text-zinc-400 hover:text-brand-gold transition-colors py-1 cursor-pointer"
                        >
                          <UserRound size={16} />
                          My Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex items-center gap-2 text-left type-nav text-sm text-neutral-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors py-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isLoggingOut ? (
                            <Loader2 size={16} className="animate-spin text-zinc-400" />
                          ) : (
                            <LogOut size={16} />
                          )}
                          {isLoggingOut ? "Signing Out..." : "Sign Out"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 type-nav text-sm transition-colors py-1 ${pathname === "/login"
                           ? "text-brand-gold border-l-2 border-brand-gold pl-3"
                           : "text-zinc-400 hover:text-foreground dark:hover:text-white"
                        }`}
                    >
                      <LogIn size={16} />
                      Sign In
                    </Link>
                  )}

                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`type-nav text-sm transition-colors py-1 ${isActive
                            ? "text-brand-gold border-l-2 border-brand-gold pl-3"
                            : "text-zinc-400 hover:text-foreground dark:hover:text-white"
                          }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Footer */}
              <div className="border-t border-card-border pt-6 text-center">
                <p className="type-caption text-zinc-500 type-micro">
                  Antonioni Grounds Cafe & Boutique Roastery
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Card Modal */}
      <AnimatePresence>
        {isProfileOpen && customer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-black/75 dark:bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-2xl glassmorphism-gold"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsProfileOpen(false)}
                disabled={isLoggingOut}
                className="absolute right-4 top-4 rounded-full border border-card-border bg-background/50 dark:bg-zinc-900/50 p-1.5 text-zinc-400 hover:text-brand-gold dark:hover:text-brand-gold hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close Profile"
              >
                <X size={16} />
              </button>

              {/* Title / Header */}
              <div className="flex flex-col items-center text-center mt-2 mb-6">
                <span className="text-[9px] uppercase tracking-[0.3em] text-brand-gold/80 font-sans font-bold">
                  Antonioni Grounds
                </span>
                <h3 className="text-foreground mt-1 font-serif italic text-2xl font-light tracking-wide">Profile</h3>
                <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent mt-2.5" />
              </div>

              {/* Digital Membership Card */}
              <div className="relative overflow-hidden rounded-2xl border border-brand-gold/30 dark:border-brand-gold/20 bg-gradient-to-br from-[#FAF7F2] via-[#F4ECE1] to-[#EADBC8] dark:from-[#1E1B18] dark:via-[#0F0D0C] dark:to-[#1E1B18] p-6 shadow-[0_12px_25px_rgba(45,31,24,0.05)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.6)] mb-6 font-sans">
                {/* Gold Accent Stripe */}
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-brand-gold/40" />

                {/* Decorative card glow */}
                <div className="absolute -right-20 -top-20 w-44 h-44 rounded-full bg-brand-gold/10 dark:bg-brand-gold/5 blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-44 h-44 rounded-full bg-brand-gold/10 dark:bg-brand-gold/5 blur-3xl pointer-events-none" />

                {/* Card Top: Card Identity */}
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-brand-gold/80 dark:text-brand-gold/70">
                    Reserve Member
                  </span>
                  <Coffee size={14} className="text-brand-gold/60" />
                </div>

                {/* Card Middle: Profile Details */}
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-full border-2 border-brand-gold/40 bg-brand-espresso dark:bg-zinc-900/90 flex items-center justify-center text-brand-gold text-xl font-serif font-bold shadow-[0_4px_12px_rgba(197,168,128,0.15)] dark:shadow-[0_0_15px_rgba(197,168,128,0.2)] select-none">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-brand-espresso dark:text-zinc-100 tracking-wide font-serif truncate">
                      {customer.name}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate font-sans font-medium">
                      {customer.email}
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Member Serial */}
                <div className="mt-6 border-t border-brand-espresso/10 dark:border-white/5 pt-4 flex justify-between items-end relative z-10">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-zinc-500 dark:text-zinc-500 font-sans block mb-0.5">
                      Member Serial
                    </span>
                    <button
                      onClick={() => handleCopy(customer.id)}
                      className="group flex items-center gap-1.5 text-xs font-mono font-medium text-brand-espresso dark:text-zinc-300 hover:text-brand-gold dark:hover:text-brand-gold transition-colors cursor-pointer"
                    >
                      <span>{customer.id}</span>
                      {copied ? (
                        <Check size={10} className="text-emerald-600 dark:text-emerald-400 font-bold" />
                      ) : (
                        <Copy size={10} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </div>
                  <span className="text-[9px] font-serif italic text-brand-gold/70 tracking-wider">
                    Antonioni Grounds
                  </span>
                </div>
              </div>

               {/* Account Overview Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-3.5 rounded-xl border border-card-border bg-background-alt/30 dark:bg-brand-charcoal/20 p-4 font-sans text-xs">
                  <div>
                    <span className="text-neutral-500 dark:text-zinc-500 block mb-0.5 uppercase tracking-wider text-[9px] font-bold">
                      Stamps Earned
                    </span>
                    <span className="text-foreground font-bold font-mono text-xs flex items-center gap-1">
                      <Coffee size={12} className="text-brand-gold shrink-0" />
                      {customer.stamps} / 9 Stamps
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 dark:text-zinc-500 block mb-0.5 uppercase tracking-wider text-[9px] font-bold">
                      Points Balance
                    </span>
                    <span className="text-foreground font-bold font-mono text-xs flex items-center gap-1">
                      <Sparkles size={12} className="text-brand-gold shrink-0 animate-pulse" />
                      {customer.points} pts
                    </span>
                  </div>
                  <div className="col-span-2 h-[1px] bg-card-border my-0.5" />
                  <div>
                    <span className="text-neutral-500 dark:text-zinc-500 block mb-0.5 uppercase tracking-wider text-[9px] font-bold">
                      Registration Date
                    </span>
                    <span className="text-foreground font-medium font-mono text-xs">
                      {formatDate(customer.joinedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 dark:text-zinc-500 block mb-0.5 uppercase tracking-wider text-[9px] font-bold">
                      Account Status
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      Active Reserve Member
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-gold py-2.5 text-xs font-semibold text-black hover:bg-brand-gold-hover hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 gold-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Close Profile
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-card-border bg-background-alt/50 dark:bg-white/5 py-2.5 text-xs font-semibold text-neutral-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <Loader2 size={12} className="animate-spin text-zinc-400" />
                  ) : (
                    <LogOut size={12} />
                  )}
                  {isLoggingOut ? "Signing Out..." : "Sign Out of Account"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

