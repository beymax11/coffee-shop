"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, UserRound, LogOut, Loader2, Sun, Moon } from "lucide-react";
import { useScroll } from "@/hooks/use-scroll";
import { motion, AnimatePresence } from "framer-motion";
import { db, LoyaltyMember } from "@/utils/db";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileModal } from "./ProfileModal";
import { LoginDrawer } from "./LoginDrawer";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<LoyaltyMember | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Reservation Confirmed",
      message: "Your table reservation is confirmed. See you soon!",
      time: "5m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Double Points Active",
      message: "Earn double stamps on any single-origin pour over today!",
      time: "2h ago",
      unread: true,
    },
    {
      id: 3,
      title: "Welcome Offer",
      message: "Thanks for joining! Enjoy your personalized stamp card.",
      time: "1d ago",
      unread: false,
    },
  ]);

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
                    isActive ? "text-foreground font-semibold" : "text-neutral-500 hover:text-brand-gold dark:hover:text-brand-gold-hover"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="navActiveLine"
                      className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-brand-green"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {customer && (
              /* Profile Capsule Button */
              <button
                onClick={() => setIsProfileOpen(true)}
                className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-gold/30 bg-card/90 transition-all duration-300 hover:border-brand-gold hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                aria-label="Profile"
              >
                <div className="absolute inset-0 rounded-full bg-brand-gold/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                <div className="w-5 h-5 rounded-full border border-brand-gold/40 bg-background flex items-center justify-center text-brand-gold text-[9px] font-bold shadow-[0_0_8px_rgba(197,168,128,0.1)] select-none">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <span className="relative hidden sm:inline text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-neutral-500 dark:text-zinc-300 group-hover:text-foreground dark:group-hover:text-white transition-colors">
                  {customer.name.split(" ")[0]}
                  <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full border border-card-border bg-card/40 flex items-center justify-center text-zinc-500 hover:text-brand-gold hover:border-brand-gold/30 transition-all duration-300 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </button>

            {/* Notification Button */}
            {customer && (
              <NotificationDropdown
                notifications={notifications}
                setNotifications={setNotifications}
              />
            )}

            {/* Sign In Button (Only when NOT logged in) */}
            {!customer && (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="group relative cursor-pointer"
                aria-label="Sign In"
              >
                {/* Background glow ring on hover */}
                <div className="absolute inset-0 -m-[1px] rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-hover opacity-0 blur-[6px] transition-opacity duration-500 group-hover:opacity-100" />
                {/* Main button container */}
                <div className={`relative flex items-center gap-2 px-5 py-2 rounded-full border text-[10px] font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 group-hover:scale-[1.02] active:scale-[0.98] ${
                  isLoginOpen
                    ? "bg-brand-gold border-brand-gold text-black shadow-[0_0_15px_rgba(197,168,128,0.3)]"
                    : "bg-card/90 border-brand-gold/30 text-neutral-500 dark:text-zinc-300 group-hover:border-brand-gold group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-brand-gold group-hover:to-brand-gold-hover shadow-[0_0_15px_rgba(197,168,128,0.03)]"
                }`}>
                  <LogIn size={11} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  <span>Sign In</span>
                </div>
              </button>
            )}

            {/* Log Out Button */}
            {customer && (
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
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsLoginOpen(true);
                      }}
                      className={`flex items-center gap-2 type-nav text-sm transition-colors py-1 text-left w-full cursor-pointer ${
                        isLoginOpen
                          ? "text-brand-green border-l-2 border-brand-green pl-3"
                          : "text-zinc-400 hover:text-foreground dark:hover:text-white"
                      }`}
                    >
                      <LogIn size={16} />
                      Sign In
                    </button>
                  )}

                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`type-nav text-sm transition-colors py-1 ${isActive
                            ? "text-brand-green border-l-2 border-brand-green pl-3"
                            : "text-zinc-400 hover:text-brand-gold dark:hover:text-white"
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
      {customer && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          customer={customer}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
          onUpdateCustomer={(updated) => setCustomer(updated)}
        />
      )}

      {/* Login Drawer Modal */}
      <LoginDrawer
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};

