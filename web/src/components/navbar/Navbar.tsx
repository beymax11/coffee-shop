"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, UserRound, LogOut, Loader2, Sun, Moon, ChevronRight } from "lucide-react";
import { useScroll } from "@/hooks/use-scroll";
import { motion, AnimatePresence } from "framer-motion";
import { db, LoyaltyMember } from "@/utils/db";
import { NotificationDropdown, NotificationItem } from "./NotificationDropdown";
import { ProfileModal } from "./ProfileModal";
import { notificationsService } from "@/utils/notifications";
import { LoginDrawer } from "@/components/login/LoginDrawer";
// Social Media Icons for mobile drawer
const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const TiktokIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
);

// Framer Motion Variants for DBTK-style mobile menu transition
const menuVariants = {
  hidden: {
    x: "-100%",
  },
  visible: {
    x: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 1, 0.5, 1],
      staggerChildren: 0.05,
      delayChildren: 0.12,
    },
  },
  exit: {
    x: "-100%",
    transition: {
      duration: 0.35,
      ease: [0.7, 0, 0.84, 0],
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
} as const;

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: {
      duration: 0.15,
    },
  },
} as const;

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<LoyaltyMember | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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
          (m) => (m.email && m.email.toLowerCase() === sessionEmail.toLowerCase()) ||
            (m.phone && m.phone.trim() === sessionEmail.trim())
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

  // Lock body scroll when mobile menu is open to prevent background scrolling & lag
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const formatNotificationTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  // Fetch and subscribe to client-side notifications
  useEffect(() => {
    if (!customer?.email) {
      setNotifications([]);
      return;
    }

    const loadNotifications = async () => {
      const list = await notificationsService.fetchNotifications(customer.email);
      setNotifications(
        list.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          time: formatNotificationTime(n.created_at),
          unread: n.unread,
        }))
      );
    };

    loadNotifications();

    // Listen for storage events (offline/localStorage changes)
    window.addEventListener("storage", loadNotifications);

    let isMounted = true;
    let channel: any = null;
    import("@/utils/supabase").then(({ supabase }) => {
      if (!isMounted) return;
      if (supabase && customer?.email) {
        channel = supabase.channel(`customer-notifications-${customer.email.toLowerCase()}`);
        channel
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `email=eq.${customer.email.toLowerCase()}`,
            },
            () => {
              if (isMounted) loadNotifications();
            }
          )
          .subscribe();
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener("storage", loadNotifications);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [customer?.email]);

  const handleMarkAsRead = async (id: string) => {
    if (!customer?.email) return;
    await notificationsService.markAsRead(id, customer.email);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!customer?.email) return;
    await notificationsService.markAllAsRead(customer.email);
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 flex items-center ${
          isScrolled
            ? "border-b border-card-border bg-background/80 backdrop-blur-md h-16 lg:h-20 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            : "bg-transparent lg:bg-background/80 lg:backdrop-blur-md lg:border-b lg:border-card-border h-20 lg:h-24 lg:shadow-[0_4px_20px_rgba(0,0,0,0.05)] lg:dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
        }`}
      >
        {/* ─── DESKTOP Layout (lg+) ─── */}
        <div className="hidden lg:flex mx-auto h-full w-full max-w-7xl items-center justify-between px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="ANTONIONI GROUNDS"
              className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105 invert dark:invert-0"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative type-nav transition-colors ${
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-neutral-500 hover:text-brand-green dark:hover:text-brand-green"
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

          {/* Desktop Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Profile Capsule */}
            {customer && (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="group relative flex items-center justify-center w-auto h-auto px-3 py-1.5 gap-2 rounded-full border border-brand-green/30 bg-card/90 transition-all duration-300 hover:border-brand-green hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                aria-label="Profile"
              >
                <div className="absolute inset-0 rounded-full bg-brand-green/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                <div className="relative w-5 h-5 rounded-full border border-brand-green/30 bg-background flex items-center justify-center text-brand-green dark:text-emerald-400 text-[9px] font-bold shadow-[0_0_8px_rgba(46,90,68,0.15)] select-none">
                  {(customer.username || customer.name).charAt(0).toUpperCase()}
                </div>
                <span className="relative text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-neutral-500 dark:text-zinc-300 group-hover:text-foreground dark:group-hover:text-white transition-colors">
                  {customer.username || customer.name.split(" ")[0]}
                  <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full border border-card-border bg-card/40 flex items-center justify-center text-zinc-500 hover:text-brand-green hover:border-brand-green/30 transition-all duration-300 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </button>

            {/* Notifications */}
            {customer && (
              <NotificationDropdown
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            )}

            {/* Sign In */}
            {!customer && (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="group relative cursor-pointer"
                aria-label="Sign In"
              >
                <div className="absolute inset-0 -m-[1px] rounded-full bg-gradient-to-r from-brand-green to-brand-green/70 opacity-0 blur-[6px] transition-opacity duration-500 group-hover:opacity-100" />
                <div
                  className={`relative flex items-center gap-2 px-5 py-2 rounded-full border text-[10px] font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 group-hover:scale-[1.02] active:scale-[0.98] ${
                    isLoginOpen
                      ? "bg-brand-green border-brand-green text-white shadow-[0_0_15px_rgba(46,90,68,0.3)]"
                      : "bg-card/90 border-brand-green/30 text-neutral-500 dark:text-zinc-300 group-hover:border-brand-green group-hover:text-white group-hover:bg-brand-green shadow-[0_0_15px_rgba(46,90,68,0.03)]"
                  }`}
                >
                  <LogIn size={11} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  <span>Sign In</span>
                </div>
              </button>
            )}

            {/* Log Out */}
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
          </div>
        </div>

        {/* ─── MOBILE Layout (below lg) — 3-column: Burger | Logo (center) | Notification ─── */}
        <div className="lg:hidden relative flex items-center w-full h-full px-4">
          {/* LEFT: Burger icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
              isScrolled
                ? "border border-card-border bg-card/50 text-zinc-500 hover:text-brand-green hover:border-brand-green/30"
                : "text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)] hover:opacity-75"
            }`}
            aria-label="Toggle Menu"
          >
            <Menu size={24} />
          </button>

          {/* CENTER: Logo — absolutely centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link href="/" className="pointer-events-auto flex items-center group">
              <img
                src="/logo.png"
                alt="ANTONIONI GROUNDS"
                className={`h-8 sm:h-9 w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
                  isScrolled
                    ? "invert dark:invert-0"
                    : "brightness-0 invert drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]"
                }`}
              />
            </Link>
          </div>

          {/* RIGHT: Notification icon (if logged in) or empty spacer */}
          <div className="relative z-10 ml-auto">
            {customer ? (
              <div
                className={`transition-all duration-300 ${
                  !isScrolled
                    ? "[&_button]:text-white [&_button]:drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
                    : ""
                }`}
              >
                <NotificationDropdown
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
              </div>
            ) : (
              /* Spacer to keep logo centered when no notification */
              <div className="w-10 h-10" />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-hidden w-full h-full">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Menu Panel — DBTK Full-Screen Takeover Style */}
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 top-0 bottom-0 w-full h-full bg-background dark:bg-black p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto overflow-x-hidden"
            >
              {/* Drawer Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-card-border/60 pb-5 mb-4 shrink-0">
                {/* Left: Close Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ rotate: 90 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative z-10 w-10 h-10 rounded-full border border-card-border bg-card/40 flex items-center justify-center text-zinc-500 hover:text-brand-green hover:border-brand-green/30 transition-all duration-300 cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X size={20} />
                </motion.button>

                {/* Center: Logo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="pointer-events-auto">
                    <img
                      src="/logo.png"
                      alt="ANTONIONI GROUNDS"
                      className="h-8 sm:h-9 w-auto object-contain invert dark:invert-0"
                    />
                  </Link>
                </div>

                {/* Right: Spacer to keep logo centered */}
                <div className="w-10 h-10 pointer-events-none" />
              </div>

              {/* Centered Navigation Links & Actions (DBTK Style Uniform Typography) */}
              <div className="relative z-10 mt-2 sm:mt-4 mb-auto py-4 flex flex-col items-center justify-start w-full">
                <nav className="flex flex-col items-center gap-3.5 sm:gap-4 w-full max-w-xs">
                  {/* Page Navigation Links */}
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div key={link.name} variants={itemVariants} className="w-full text-center">
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`inline-flex items-center justify-center text-base sm:text-lg tracking-wider uppercase type-nav py-1.5 px-6 rounded-2xl transition-all duration-300 ${
                            isActive
                              ? "text-brand-green font-bold"
                              : "text-neutral-600 dark:text-zinc-300 hover:text-brand-green hover:scale-105"
                          }`}
                        >
                          <span>{link.name}</span>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Dark Mode Toggle — Styled like navigation links */}
                  <motion.div variants={itemVariants} className="w-full text-center pt-2">
                    <button
                      onClick={toggleTheme}
                      className="inline-flex items-center justify-center gap-2.5 text-base sm:text-lg tracking-wider uppercase type-nav py-1.5 px-6 rounded-2xl transition-all duration-300 text-neutral-600 dark:text-zinc-300 hover:text-brand-green hover:scale-105 cursor-pointer"
                      aria-label="Toggle Theme"
                    >
                      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                  </motion.div>

                  {/* User Profile / Sign In / Sign Out — Styled like navigation links */}
                  {customer ? (
                    <>
                      <motion.div variants={itemVariants} className="w-full text-center">
                        <button
                          onClick={() => {
                            setIsProfileOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="inline-flex items-center justify-center gap-2.5 text-base sm:text-lg tracking-wider uppercase type-nav py-1.5 px-6 rounded-2xl transition-all duration-300 text-neutral-600 dark:text-zinc-300 hover:text-brand-green hover:scale-105 cursor-pointer"
                        >
                          <UserRound size={18} />
                          <span>Profile ({customer.username || customer.name.split(" ")[0]})</span>
                        </button>
                      </motion.div>

                      <motion.div variants={itemVariants} className="w-full text-center">
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="inline-flex items-center justify-center gap-2.5 text-base sm:text-lg tracking-wider uppercase type-nav py-1.5 px-6 rounded-2xl transition-all duration-300 text-red-500 hover:text-red-400 hover:scale-105 cursor-pointer disabled:opacity-50"
                        >
                          {isLoggingOut ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <LogOut size={18} />
                          )}
                          <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div variants={itemVariants} className="w-full text-center">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsLoginOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2.5 text-base sm:text-lg tracking-wider uppercase type-nav py-1.5 px-6 rounded-2xl transition-all duration-300 text-brand-green font-bold hover:scale-105 cursor-pointer"
                      >
                        <LogIn size={18} />
                        <span>Sign In</span>
                      </button>
                    </motion.div>
                  )}

                  {/* Social Media Links (FB, IG, TikTok) — Underneath Sign Out / Sign In */}
                  <motion.div variants={itemVariants} className="w-full text-center pt-4 border-t border-card-border/40 mt-3">
                    <div className="flex items-center justify-center gap-7 text-neutral-500 dark:text-zinc-400">
                      <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-brand-green dark:hover:text-white transition-all duration-300 hover:scale-110"
                        aria-label="Facebook"
                      >
                        <FacebookIcon size={20} />
                      </a>
                      <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-brand-green dark:hover:text-white transition-all duration-300 hover:scale-110"
                        aria-label="Instagram"
                      >
                        <InstagramIcon size={20} />
                      </a>
                      <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-brand-green dark:hover:text-white transition-all duration-300 hover:scale-110"
                        aria-label="TikTok"
                      >
                        <TiktokIcon size={20} />
                      </a>
                    </div>
                  </motion.div>
                </nav>
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

