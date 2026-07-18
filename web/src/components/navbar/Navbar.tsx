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
import { LoginDrawer } from "@/components/login/LoginDrawer";
import { notificationsService } from "@/utils/notifications";

// Framer Motion Variants for mobile menu animation
const menuVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 30,
      mass: 0.8,
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    x: "100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 32,
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    x: 10,
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

    // Subscribe to realtime database changes on Supabase if available
    let subscription: any = null;
    let channel: any = null;
    import("@/utils/supabase").then(({ supabase }) => {
      if (supabase && customer?.email) {
        channel = supabase.channel(`customer-notifications-${customer.email.toLowerCase()}`);
        subscription = channel
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "notifications",
              filter: `email=eq.${customer.email.toLowerCase()}`,
            },
            () => {
              loadNotifications();
            }
          )
          .subscribe();
      }
    });

    return () => {
      window.removeEventListener("storage", loadNotifications);
      if (channel && subscription) {
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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 flex items-center ${isScrolled
          ? "border-b border-card-border bg-background/80 backdrop-blur-md h-16 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "bg-transparent h-20"
          }`}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-3 sm:px-6 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="ANTONIONI GROUNDS"
              className="h-9 sm:h-11 lg:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105 invert dark:invert-0"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative type-nav transition-colors ${isActive ? "text-foreground font-semibold" : "text-neutral-500 hover:text-brand-gold dark:hover:text-brand-gold-hover"
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
          <div className="flex items-center gap-1.5 sm:gap-3">
            {customer && (
              /* Profile Capsule Button */
              <button
                onClick={() => setIsProfileOpen(true)}
                className="group relative hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-brand-green/30 bg-card/90 transition-all duration-300 hover:border-brand-green hover:scale-[1.02] active:scale-[0.98] cursor-pointer sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 sm:justify-start sm:gap-2"
                aria-label="Profile"
              >
                <div className="absolute inset-0 rounded-full bg-brand-green/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                <div className="relative w-5 h-5 rounded-full border border-brand-green/30 bg-background flex items-center justify-center text-brand-green dark:text-emerald-400 text-[9px] font-bold shadow-[0_0_8px_rgba(46,90,68,0.15)] select-none">
                  {(customer.username || customer.name).charAt(0).toUpperCase()}
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse sm:hidden" />
                </div>
                <span className="relative hidden sm:inline text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-neutral-500 dark:text-zinc-300 group-hover:text-foreground dark:group-hover:text-white transition-colors">
                  {customer.username || customer.name.split(" ")[0]}
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
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            )}

            {/* Sign In Button (Only when NOT logged in) */}
            {!customer && (
              <>
                {/* Desktop Sign In Button */}
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="hidden lg:block group relative cursor-pointer"
                  aria-label="Sign In"
                >
                  {/* Background glow ring on hover */}
                  <div className="absolute inset-0 -m-[1px] rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-hover opacity-0 blur-[6px] transition-opacity duration-500 group-hover:opacity-100" />
                  {/* Main button container */}
                  <div className={`relative flex items-center gap-2 px-5 py-2 rounded-full border text-[10px] font-sans font-bold tracking-[0.15em] uppercase transition-all duration-300 group-hover:scale-[1.02] active:scale-[0.98] ${isLoginOpen
                      ? "bg-brand-gold border-brand-gold text-black shadow-[0_0_15px_rgba(197,168,128,0.3)]"
                      : "bg-card/90 border-brand-gold/30 text-neutral-500 dark:text-zinc-300 group-hover:border-brand-gold group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-brand-gold group-hover:to-brand-gold-hover shadow-[0_0_15px_rgba(197,168,128,0.03)]"
                    }`}>
                    <LogIn size={11} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    <span>Sign In</span>
                  </div>
                </button>

                {/* Mobile/Tablet Sign In Button */}
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="lg:hidden w-8 h-8 rounded-full border border-brand-gold/30 bg-card/90 flex items-center justify-center text-zinc-500 hover:text-brand-gold hover:border-brand-gold transition-all duration-300 cursor-pointer"
                  aria-label="Sign In"
                >
                  <LogIn size={13} />
                </button>
              </>
            )}

            {/* Log Out Button */}
            {customer && (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="hidden lg:flex w-8 h-8 rounded-full border border-card-border bg-card/50 items-center justify-center text-neutral-500 dark:text-zinc-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
              className="lg:hidden w-8 h-8 rounded-full border border-card-border bg-card/40 flex items-center justify-center text-zinc-500 hover:text-brand-gold hover:border-brand-gold/30 transition-all duration-300 cursor-pointer"
              aria-label="Toggle Menu"
            >
              <Menu size={14} />
            </button>
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

            {/* Menu Panel */}
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-0 top-0 bottom-0 w-full sm:w-80 h-full bg-background/95 dark:bg-[#0B0B0B]/95 backdrop-blur-2xl border-l border-brand-green/15 p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto overflow-x-hidden"
            >
              {/* Decorative background glows */}
              <div className="absolute top-1/4 -right-10 w-48 h-48 bg-brand-green/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-10 -left-10 w-36 h-36 bg-brand-green/5 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-card-border pb-6 mb-8">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <img
                      src="/logo.png"
                      alt="ANTONIONI GROUNDS"
                      className="h-7 w-auto object-contain invert dark:invert-0"
                    />
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ rotate: 90 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full border border-card-border bg-card/40 flex items-center justify-center text-zinc-500 hover:text-brand-green hover:border-brand-green/30 transition-all duration-300 cursor-pointer"
                    aria-label="Close Menu"
                  >
                    <X size={14} />
                  </motion.button>
                </div>

                {/* Mobile Links */}
                <nav className="flex flex-col gap-3">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div key={link.name} variants={itemVariants}>
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between type-nav text-sm py-2.5 px-4 rounded-xl transition-all duration-300 ${isActive
                              ? "text-brand-green bg-brand-green/10 font-bold border-l-2 border-brand-green shadow-[inset_1px_0_0_0_rgba(46,90,68,0.2)]"
                              : "text-neutral-500 dark:text-zinc-400 hover:text-brand-green hover:bg-card/40"
                            }`}
                        >
                          <span>{link.name}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-green shadow-[0_0_8px_rgba(46,90,68,0.6)]" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Section (Profile / Sign In + Footer) */}
              <motion.div
                variants={itemVariants}
                className="relative z-10 border-t border-card-border pt-6 mt-auto space-y-4"
              >
                {customer ? (
                  <div className="space-y-4">
                    {/* User Profile Card */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-card-border/10 dark:bg-white/[0.02] border border-card-border/40 dark:border-white/[0.05] hover:border-brand-green/30 dark:hover:border-brand-green/30 hover:bg-brand-green/[0.02] transition-all duration-300 text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl border border-brand-green/20 bg-brand-green/5 flex items-center justify-center text-brand-green font-bold text-base shadow-[inset_0_1px_1px_rgba(46,90,68,0.1)] shrink-0">
                          {(customer.username || customer.name).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase tracking-[0.15em] font-sans font-bold text-brand-green/80">
                            Reserve Member
                          </span>
                          <div className="text-sm font-semibold text-foreground truncate mt-0.5">
                            {customer.username || customer.name}
                          </div>
                          <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                            {customer.id}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-500 group-hover:text-brand-green group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/25 bg-red-500/5 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/40 active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut ? (
                          <Loader2 size={14} className="animate-spin text-zinc-400" />
                        ) : (
                          <LogOut size={14} />
                        )}
                        <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLoginOpen(true);
                    }}
                    className={`flex items-center gap-2 type-nav text-sm transition-colors py-1 text-left w-full cursor-pointer ${isLoginOpen
                        ? "text-brand-green bg-brand-green/10 font-bold border-l-2 border-brand-green shadow-[inset_1px_0_0_0_rgba(46,90,68,0.2)]"
                        : "text-zinc-400 hover:text-foreground dark:hover:text-white"
                      }`}
                  >
                    <LogIn size={16} />
                    Sign In
                  </button>
                )}

                {/* Mobile Footer */}
                <div className="border-t border-card-border pt-4 text-center">
                  <p className="type-caption text-zinc-500 type-micro">
                    Antonioni Grounds.
                  </p>
                </div>
              </motion.div>
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

