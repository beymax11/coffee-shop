"use client";

import React, { useState } from "react";
import { Bell, Calendar, Sparkles, Gift, Coffee, Check, Inbox } from "lucide-react";
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

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);


  const unreadCount = notifications.filter((n) => n.unread).length;

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

  return (
    <div className="relative">
      <button
        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        className="w-8 h-8 rounded-full border border-card-border bg-card/40 flex items-center justify-center text-zinc-500 hover:text-brand-green hover:border-brand-green/30 dark:hover:text-emerald-400 dark:hover:border-emerald-500/30 transition-all duration-300 cursor-pointer relative"
        aria-label="Notifications"
      >
        <Bell size={14} className={unreadCount > 0 ? "animate-pulse" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-green dark:bg-emerald-400 rounded-full ring-2 ring-background animate-pulse shadow-[0_0_8px_#2e5a44] dark:shadow-[0_0_8px_#34d399]" />
        )}
      </button>

      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsNotificationsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-4 right-4 w-auto sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:w-80 sm:mt-2 bg-card/95 backdrop-blur-xl border border-brand-green/10 dark:border-brand-green/20 rounded-2xl p-4 shadow-2xl z-40 overflow-hidden"
            >
              {/* Decorative top green bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-green dark:bg-emerald-500" />

              <div className="flex items-center justify-between border-b border-card-border/50 pb-2 mb-3 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-[10px] font-bold text-foreground font-sans uppercase tracking-wider">
                    Notifications
                  </h5>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] bg-brand-green/10 text-brand-green dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="text-[9px] uppercase tracking-wider text-brand-green hover:text-brand-green-hover dark:text-emerald-400 dark:hover:text-emerald-300 font-bold cursor-pointer transition-colors duration-200 flex items-center gap-0.5"
                  >
                    <Check size={10} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-brand-green/5 dark:bg-emerald-500/5 flex items-center justify-center mb-2.5 ring-4 ring-brand-green/[0.02]">
                      <Inbox size={20} className="text-brand-green/40 dark:text-emerald-400/40" />
                    </div>
                    <p className="text-[11px] font-semibold text-foreground">
                      All caught up!
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      No new notifications at the moment.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => onMarkAsRead(notif.id)}
                      className={`w-full p-2.5 rounded-xl border transition-all duration-300 text-left cursor-pointer flex gap-3 items-start ${
                        notif.unread
                          ? "bg-brand-green/[0.03] dark:bg-emerald-500/[0.03] border-brand-green/15 dark:border-emerald-500/15 hover:border-brand-green/30 dark:hover:border-emerald-500/30 hover:bg-brand-green/[0.06] dark:hover:bg-emerald-500/[0.06]"
                          : "bg-background/20 dark:bg-zinc-950/20 border-card-border/40 hover:border-card-border/70 hover:bg-background/40 dark:hover:bg-zinc-900/20"
                      }`}
                    >
                      {/* Icon container */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.unread
                          ? "bg-brand-green/10 dark:bg-emerald-500/10 text-brand-green dark:text-emerald-400"
                          : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500"
                      }`}>
                        {getNotificationIcon(notif.title)}
                      </div>

                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <span
                            className={`text-[10.5px] leading-tight truncate ${
                              notif.unread
                                ? "font-bold text-foreground"
                                : "font-semibold text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {notif.title}
                          </span>
                          <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-mono shrink-0 mt-0.5">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed break-words">
                          {notif.message}
                        </p>
                      </div>

                      {/* Unread dot indicator */}
                      {notif.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green dark:bg-emerald-400 shrink-0 mt-1.5 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
