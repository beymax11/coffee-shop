"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, Calendar, Sparkles, Gift, Coffee, Check, Inbox, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
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
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE },
  },
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Lock body scroll on mobile when notification fullscreen view is open
  useEffect(() => {
    if (isNotificationsOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isNotificationsOpen, isMobile]);

  // Helper to determine icon based on notification content
  const getNotificationIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (
      lowerTitle.includes("confirm") ||
      lowerTitle.includes("reservation") ||
      lowerTitle.includes("table") ||
      lowerTitle.includes("booking")
    ) {
      return <Calendar size={14} className="text-brand-green dark:text-emerald-400" />;
    }
    if (
      lowerTitle.includes("points") ||
      lowerTitle.includes("stamp") ||
      lowerTitle.includes("double") ||
      lowerTitle.includes("loyalty")
    ) {
      return <Sparkles size={14} className="text-brand-green dark:text-emerald-400" />;
    }
    if (
      lowerTitle.includes("welcome") ||
      lowerTitle.includes("offer") ||
      lowerTitle.includes("promo") ||
      lowerTitle.includes("gift")
    ) {
      return <Gift size={14} className="text-brand-green dark:text-emerald-400" />;
    }
    return <Coffee size={14} className="text-brand-green dark:text-emerald-400" />;
  };

  const notificationContent = (
    <AnimatePresence>
      {isNotificationsOpen && (
        <>
          {/* Backdrop for Desktop */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-transparent"
              onClick={() => setIsNotificationsOpen(false)}
            />
          )}

          {/* Fullscreen Mobile View / Desktop Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: isMobile ? "100%" : -10, scale: isMobile ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? "100%" : -10, scale: isMobile ? 1 : 0.96 }}
            transition={{ duration: 0.38, ease: EASE }}
            className={
              isMobile
                ? "fixed top-16 left-0 right-0 bottom-0 z-40 bg-background dark:bg-black p-5 flex flex-col justify-start w-full h-[calc(100dvh-64px)] overflow-hidden border-t border-card-border/60 shadow-2xl"
                : "absolute top-full right-0 w-80 mt-2 bg-card/98 dark:bg-zinc-950/98 backdrop-blur-2xl border border-brand-green/20 dark:border-emerald-500/20 rounded-2xl p-4 shadow-2xl z-40 overflow-hidden flex flex-col justify-start"
            }
          >
            {/* Decorative top green gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-green via-emerald-400 to-brand-green" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-card-border/60 pb-3 mb-4 mt-1 shrink-0">
              <div className="flex items-center gap-2.5">
                <h5 className="text-xs sm:text-[11px] font-bold text-foreground font-sans uppercase tracking-widest">
                  Notifications
                </h5>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 text-[10px] sm:text-[9px] bg-brand-green/15 text-brand-green dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-[10px] sm:text-[9px] uppercase tracking-wider text-brand-green hover:text-brand-green-hover dark:text-emerald-400 dark:hover:text-emerald-300 font-bold cursor-pointer transition-colors duration-200 flex items-center gap-1"
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
              className="flex-1 space-y-2.5 overflow-y-auto pr-1 scrollbar-thin sm:max-h-64 pb-12 sm:pb-0"
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
                    No new notifications at the moment.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.button
                    key={notif.id}
                    variants={listItemVariants}
                    type="button"
                    onClick={() => {
                      onMarkAsRead(notif.id);
                      if (isMobile) setIsNotificationsOpen(false);
                    }}
                    className={`w-full p-3.5 sm:p-2.5 rounded-xl border transition-all duration-300 text-left cursor-pointer flex gap-3.5 sm:gap-3 items-start ${notif.unread
                        ? "bg-brand-green/[0.04] dark:bg-emerald-500/[0.04] border-brand-green/20 dark:border-emerald-500/20 hover:border-brand-green/40 dark:hover:border-emerald-500/40 hover:bg-brand-green/[0.07] dark:hover:bg-emerald-500/[0.07]"
                        : "bg-card/40 dark:bg-zinc-900/30 border-card-border/40 hover:border-card-border/70 hover:bg-card/70 dark:hover:bg-zinc-900/50"
                      }`}
                  >
                    {/* Icon container */}
                    <div className={`w-9 h-9 sm:w-8 sm:h-8 rounded-xl sm:rounded-lg flex items-center justify-center shrink-0 ${notif.unread
                        ? "bg-brand-green/10 dark:bg-emerald-500/10 text-brand-green dark:text-emerald-400"
                        : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500"
                      }`}>
                      {getNotificationIcon(notif.title)}
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <span
                          className={`text-xs sm:text-[10.5px] leading-tight truncate ${notif.unread
                              ? "font-bold text-foreground"
                              : "font-semibold text-zinc-600 dark:text-zinc-400"
                            }`}
                        >
                          {notif.title}
                        </span>
                        <span className="text-[9px] sm:text-[8px] text-zinc-400 dark:text-zinc-500 font-mono shrink-0 mt-0.5">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed break-words">
                        {notif.message}
                      </p>
                    </div>

                    {/* Unread dot indicator */}
                    {notif.unread && (
                      <span className="w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-green dark:bg-emerald-400 shrink-0 mt-1.5 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                    )}
                  </motion.button>
                ))
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative">
      {/* Trigger Button — Bell transforms into Close (X) icon with Framer Motion morph */}
      <button
        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        className="w-10 h-10 lg:w-8 lg:h-8 rounded-full lg:border lg:border-card-border lg:bg-card/40 flex items-center justify-center text-foreground dark:text-white hover:text-brand-green dark:hover:text-emerald-400 transition-all duration-300 cursor-pointer relative z-50 drop-shadow-md"
        aria-label={isNotificationsOpen ? "Close Notifications" : "Notifications"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isNotificationsOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              <X className="w-6 h-6 lg:w-4 lg:h-4 text-foreground dark:text-white" />
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
              <Bell className={`transition-all ${unreadCount > 0 ? "animate-pulse" : ""} w-6 h-6 lg:w-3.5 lg:h-3.5`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 lg:w-2 lg:h-2 bg-brand-green dark:bg-emerald-400 rounded-full ring-2 ring-background animate-pulse shadow-[0_0_8px_#2e5a44] dark:shadow-[0_0_8px_#34d399]" />
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
