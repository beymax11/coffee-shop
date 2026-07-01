"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, UserRound, LogOut, Copy, Check, Sparkles, Award, Coffee } from "lucide-react";
import { useScroll } from "@/hooks/use-scroll";
import { motion, AnimatePresence } from "framer-motion";
import { db, LoyaltyMember } from "@/utils/db";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<LoyaltyMember | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
    localStorage.removeItem("customer_session");
    setCustomer(null);
    setIsProfileOpen(false);
    window.dispatchEvent(new Event("storage"));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTier = (points: number) => {
    if (points >= 1500) {
      return {
        name: "Platinum",
        style: "bg-gradient-to-r from-slate-200 to-slate-400 text-black",
        next: null,
      };
    }
    if (points >= 500) {
      return {
        name: "Gold",
        style: "bg-gradient-to-r from-amber-200 to-yellow-500 text-black",
        next: { name: "Platinum", diff: 1500 - points },
      };
    }
    return {
      name: "Bronze",
      style: "bg-gradient-to-r from-amber-700 to-amber-900 text-amber-100",
      next: { name: "Gold", diff: 500 - points },
    };
  };

  const tierInfo = customer
    ? getTier(customer.points)
    : { name: "Bronze", style: "bg-[#27272a] text-zinc-300", next: null };

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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 flex items-center ${
          isScrolled
            ? "border-b border-white/5 bg-black/70 backdrop-blur-md h-16 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent h-20"
        }`}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-6 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="ANTONIONI GROUNDS"
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
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
                  className="relative type-nav transition-colors hover:text-white"
                  style={{ color: isActive ? "#F5F5F0" : "#A0A0A5" }}
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
          <div className="flex items-center gap-4">
            {customer ? (
              <div className="flex items-center gap-3">
                {/* Profile Icon Button */}
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-2 group cursor-pointer"
                  aria-label="Profile"
                >
                  <div className="w-8 h-8 rounded-full border border-brand-gold/30 bg-[#141414] flex items-center justify-center text-brand-gold transition-all duration-300 group-hover:border-brand-gold group-hover:scale-105">
                    <UserRound size={16} />
                  </div>
                  <span className="hidden lg:inline text-xs font-sans text-zinc-300 group-hover:text-white transition-colors">
                    {customer.name}
                  </span>
                </button>

                {/* Log Out Button */}
                <button
                  onClick={handleLogout}
                  className="text-zinc-400 hover:text-red-400 transition-colors p-1"
                  aria-label="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`relative transition-colors p-1 ${
                  pathname === "/login" ? "text-brand-gold" : "text-zinc-400 hover:text-white"
                }`}
                aria-label="Sign In"
              >
                <LogIn size={20} />
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
              className="absolute right-0 top-0 bottom-0 w-80 bg-[#0c0c0c] border-l border-white/5 p-8 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <img
                      src="/logo.png"
                      alt="ANTONIONI GROUNDS"
                      className="h-7 w-auto object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-full border border-white/5 bg-white/5 p-2 text-zinc-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Mobile Links */}
                <nav className="flex flex-col gap-6">
                  {customer ? (
                    <div className="border-b border-white/5 pb-6 mb-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-brand-gold/30 bg-[#161616] flex items-center justify-center text-brand-gold">
                          <UserRound size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">
                            {customer.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono">
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
                          className="flex items-center gap-2 text-left type-nav text-sm text-zinc-400 hover:text-white transition-colors py-1"
                        >
                          <UserRound size={16} />
                          My Profile Card
                        </button>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-2 text-left type-nav text-sm text-zinc-400 hover:text-red-400 transition-colors py-1"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 type-nav text-sm transition-colors py-1 ${
                        pathname === "/login"
                          ? "text-brand-gold border-l-2 border-brand-gold pl-3"
                          : "text-zinc-400 hover:text-white"
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
                        className={`type-nav text-sm transition-colors py-1 ${
                          isActive
                            ? "text-brand-gold border-l-2 border-brand-gold pl-3"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Footer */}
              <div className="border-t border-white/5 pt-6 text-center">
                <p className="type-caption text-zinc-500 type-micro">
                  L&apos;OR NOIR Cafe & Boutique Roastery
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
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-2xl glassmorphism-gold"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsProfileOpen(false)}
                className="absolute right-4 top-4 rounded-full border border-white/5 bg-white/5 p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Title / Header */}
              <div className="flex flex-col items-center text-center mt-2 mb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-sans font-semibold">
                  L&apos;OR NOIR Reserve Membership
                </span>
                <h3 className="type-h3 text-white mt-1">Private Salon Profile</h3>
                <div className="h-[1px] w-8 bg-brand-gold mt-3" />
              </div>

              {/* User Identity Details */}
              <div className="space-y-4 rounded-xl border border-white/5 bg-white/5 p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-brand-gold/30 bg-[#1a1a1a] flex items-center justify-center text-brand-gold text-lg font-semibold">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{customer.name}</h4>
                    <p className="text-xs text-zinc-400 truncate font-sans">{customer.email}</p>
                  </div>
                  {/* Tier Badge */}
                  <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full ${tierInfo.style}`}>
                    {tierInfo.name}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans">
                    Member Serial
                  </span>
                  <button
                    onClick={() => handleCopy(customer.id)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors font-mono cursor-pointer"
                  >
                    <span>{customer.id}</span>
                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {/* Loyalty Progress */}
              <div className="space-y-4 rounded-xl border border-white/5 bg-white/5 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award size={14} className="text-brand-gold" />
                    <span className="text-xs font-semibold text-white font-sans">Loyalty Card</span>
                  </div>
                  <span className="text-xs text-brand-gold font-bold">
                    {customer.stamps} / 10 Stamps
                  </span>
                </div>

                {/* Stamps Coffee Row */}
                <div className="grid grid-cols-5 gap-2.5 my-2 justify-items-center">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const isStamped = i < customer.stamps;
                    return (
                      <div
                        key={i}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 ${
                          isStamped
                            ? "bg-gradient-to-br from-brand-gold to-amber-600 border-brand-gold text-black shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                            : "border-white/10 bg-[#161616] text-zinc-600"
                        }`}
                      >
                        <Coffee size={14} className={isStamped ? "fill-black" : ""} />
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between text-xs font-sans">
                  <span className="text-zinc-400">Total Reserve Points:</span>
                  <span className="font-bold text-white font-mono">{customer.points} pts</span>
                </div>

                {tierInfo.next && (
                  <p className="text-[10px] text-zinc-500 font-sans italic text-center">
                    Earn {tierInfo.next.diff} more points to reach {tierInfo.next.name} Member Tier.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Link
                  href="/loyalty"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-gold py-2.5 text-xs font-semibold text-black hover:bg-brand-gold-hover transition-colors gold-glow active:scale-[0.98]"
                >
                  <Sparkles size={12} />
                  Manage Bean Loyalty Card
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  <LogOut size={12} />
                  Sign Out of Salon
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

