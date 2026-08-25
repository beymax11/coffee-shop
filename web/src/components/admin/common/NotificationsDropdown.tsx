"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bell, Calendar, CreditCard, Info, Check, CheckSquare, Trash2, X, Inbox, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reservation } from "@/types";
import { LoyaltyMember } from "@/utils/db";

interface NotificationsDropdownProps {
  reservations: Reservation[];
  loyaltyMembers: LoyaltyMember[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "reservation" | "loyalty" | "system";
  read: boolean;
  timestamp: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE },
  },
};

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  reservations,
  loyaltyMembers,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lock body scroll on mobile when notification fullscreen view is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  // Initialize notifications from props + system updates
  useEffect(() => {
    // 1. Load read status mappings from localStorage
    const readMap: Record<string, boolean> = JSON.parse(
      localStorage.getItem("admin_read_notifications") || "{}"
    );

    const list: NotificationItem[] = [];

    // 2. Generate dynamic notifications from reservations
    reservations.forEach((res, idx) => {
      const id = `res-${res.fullName}-${res.date}-${res.time}`;
      const timestamp = new Date(`${res.date}T${res.time || "12:00:00"}`).getTime() || (Date.now() - idx * 3600000);
      
      list.push({
        id,
        title: "New Reservation Request",
        description: `${res.fullName} requested a booking for ${res.guestCount} guests on ${res.date} at ${res.time}.`,
        time: res.date,
        type: "reservation",
        read: !!readMap[id],
        timestamp,
      });
    });

    // 3. Generate dynamic notifications from Loyalty Members
    loyaltyMembers.forEach((member, idx) => {
      const id = `loyalty-${member.id}`;
      const timestamp = member.joinedAt ? new Date(member.joinedAt).getTime() : (Date.now() - idx * 86400000);
      
      list.push({
        id,
        title: "New Loyalty Sign-up",
        description: `${member.name} (${member.email}) joined the digital loyalty program.`,
        time: member.joinedAt || "Just now",
        type: "loyalty",
        read: !!readMap[id],
        timestamp,
      });
    });

    // 4. Add realistic system notifications
    const systemAlerts = [
      {
        id: "sys-beans",
        title: "Stock Alert: Espresso Beans",
        description: "Arabica Signature Roast is running below the 10kg threshold (8.5kg left). Please reorder soon.",
        time: "Today",
        type: "system" as const,
        timestamp: Date.now() - 4 * 3600000,
      },
      {
        id: "sys-backup",
        title: "Database Backup Completed",
        description: "Console backup was completed successfully. 0 items failed.",
        time: "Yesterday",
        type: "system" as const,
        timestamp: Date.now() - 28 * 3600000,
      }
    ];

    systemAlerts.forEach((alert) => {
      list.push({
        ...alert,
        read: !!readMap[alert.id],
      });
    });

    // Sort by timestamp descending
    list.sort((a, b) => b.timestamp - a.timestamp);

    setNotifications(list);
  }, [reservations, loyaltyMembers]);

  // Handle click outside to close dropdown (on desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobile && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);

    const readMap: Record<string, boolean> = {};
    updated.forEach(n => {
      readMap[n.id] = true;
    });
    localStorage.setItem("admin_read_notifications", JSON.stringify(readMap));
  };

  const toggleRead = (id: string) => {
    const updated = notifications.map(n => {
      if (n.id === id) {
        return { ...n, read: !n.read };
      }
      return n;
    });
    setNotifications(updated);

    const readMap: Record<string, boolean> = JSON.parse(
      localStorage.getItem("admin_read_notifications") || "{}"
    );
    const target = updated.find(n => n.id === id);
    if (target) {
      readMap[id] = target.read;
    }
    localStorage.setItem("admin_read_notifications", JSON.stringify(readMap));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    
    // Mark as read in local storage so it won't pop up again if re-generated
    const readMap: Record<string, boolean> = JSON.parse(
      localStorage.getItem("admin_read_notifications") || "{}"
    );
    readMap[id] = true;
    localStorage.setItem("admin_read_notifications", JSON.stringify(readMap));
  };

  const notificationContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for Desktop */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-transparent"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Fullscreen Mobile View / Desktop Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: isMobile ? "100%" : -10, scale: isMobile ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? "100%" : -10, scale: isMobile ? 1 : 0.96 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={
              isMobile
                ? "fixed top-14 sm:top-16 left-0 right-0 bottom-0 z-40 bg-background dark:bg-black p-4 sm:p-5 flex flex-col justify-start w-full h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)] overflow-hidden border-t border-card-border/60 shadow-2xl"
                : "absolute top-full right-0 w-80 mt-2 bg-card/98 dark:bg-zinc-950/98 backdrop-blur-2xl border border-brand-green/20 dark:border-emerald-500/20 rounded-2xl p-4 shadow-2xl z-40 overflow-hidden flex flex-col justify-start"
            }
          >
            {/* Decorative top green gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-green via-emerald-400 to-brand-green" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-card-border/60 pb-3 mb-3.5 mt-0.5 shrink-0">
              <div className="flex items-center gap-2.5">
                <h5 className="text-xs sm:text-[11px] font-bold text-foreground font-sans uppercase tracking-widest">
                  Notifications
                </h5>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] sm:text-[9px] bg-brand-green/15 text-brand-green dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[10px] sm:text-[9px] uppercase tracking-wider text-brand-green hover:text-brand-green/80 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold cursor-pointer transition-colors duration-200 flex items-center gap-1"
                >
                  <Check size={12} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List with Staggered Animations */}
            <motion.div
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 space-y-2.5 overflow-y-auto pr-1 scrollbar-thin sm:max-h-72 pb-10 sm:pb-0"
            >
              {notifications.length === 0 ? (
                <div className="py-16 sm:py-8 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-brand-green/5 dark:bg-emerald-500/5 flex items-center justify-center mb-3 ring-4 ring-brand-green/[0.02]">
                    <Inbox size={24} className="text-brand-green/40 dark:text-emerald-400/40" />
                  </div>
                  <p className="text-sm sm:text-[11px] font-semibold text-foreground">
                    All caught up!
                  </p>
                  <p className="text-xs sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    No notifications at the moment.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    variants={listItemVariants}
                    className={`w-full p-3 sm:p-2.5 rounded-xl border transition-all duration-200 text-left flex gap-3 sm:gap-2.5 items-start relative group ${
                      notif.read
                        ? "bg-card/40 dark:bg-zinc-900/30 border-card-border/40 hover:border-card-border/70 hover:bg-card/70 dark:hover:bg-zinc-900/50"
                        : "bg-brand-green/[0.04] dark:bg-emerald-500/[0.04] border-brand-green/20 dark:border-emerald-500/20 hover:border-brand-green/40 dark:hover:border-emerald-500/40 hover:bg-brand-green/[0.07] dark:hover:bg-emerald-500/[0.07]"
                    }`}
                  >
                    {/* Unread Accent Left Line */}
                    {!notif.read && (
                      <div className="absolute top-2.5 bottom-2.5 left-0 w-1 rounded-r bg-brand-green dark:bg-emerald-400" />
                    )}

                    {/* Icon container */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === "reservation"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : notif.type === "loyalty"
                        ? "bg-brand-green/10 text-brand-green dark:text-emerald-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}>
                      {notif.type === "reservation" && <Calendar size={14} />}
                      {notif.type === "loyalty" && <Sparkles size={14} />}
                      {notif.type === "system" && <Info size={14} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <span
                          className={`text-xs sm:text-[11px] leading-tight truncate ${
                            notif.read
                              ? "font-semibold text-zinc-700 dark:text-zinc-300"
                              : "font-bold text-foreground"
                          }`}
                        >
                          {notif.title}
                        </span>
                        <span className="text-[9px] sm:text-[8px] text-zinc-400 dark:text-zinc-500 font-mono shrink-0 mt-0.5">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed break-words">
                        {notif.description}
                      </p>

                      {/* Quick Action buttons */}
                      <div className="flex items-center mt-2 pt-1 border-t border-card-border/30">
                        <button
                          type="button"
                          onClick={() => toggleRead(notif.id)}
                          className="text-[10px] sm:text-[9px] text-neutral-500 hover:text-brand-green dark:text-zinc-400 dark:hover:text-emerald-400 flex items-center gap-1 font-medium cursor-pointer transition-colors"
                        >
                          <CheckSquare size={10} />
                          <span>{notif.read ? "Mark unread" : "Mark read"}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button — Bell transforms into Close (X) icon with Framer Motion morph */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close Notifications" : "Notifications"}
        aria-label={isOpen ? "Close Notifications" : "Notifications"}
        className="w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer relative z-50 text-neutral-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white hover:bg-foreground/[0.05] dark:hover:bg-white/[0.05] border border-transparent hover:border-card-border"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              <X size={18} className="text-foreground dark:text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="bell"
              initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="relative flex items-center justify-center"
            >
              <Bell size={18} className={unreadCount > 0 ? "animate-pulse" : ""} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-green dark:bg-emerald-400 rounded-full ring-2 ring-background animate-pulse shadow-[0_0_8px_#2e5a44] dark:shadow-[0_0_8px_#34d399]" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Render Portal on mobile to escape parent containing block rules, render inline on desktop */}
      {mounted ? (
        isMobile ? (
          createPortal(notificationContent, document.body)
        ) : (
          notificationContent
        )
      ) : null}
    </div>
  );
};
