"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export interface NotificationDropdownProps {
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  setNotifications,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        className="w-8 h-8 rounded-full border border-card-border bg-card/40 flex items-center justify-center text-zinc-500 hover:text-brand-gold hover:border-brand-gold/30 transition-all duration-300 cursor-pointer relative"
        aria-label="Notifications"
      >
        <Bell size={13} />
        {notifications.some((n) => n.unread) && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full ring-2 ring-background animate-pulse" />
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
              className="absolute right-0 mt-2 w-80 bg-card/95 backdrop-blur-md border border-card-border rounded-xl p-4 shadow-xl z-40"
            >
              <div className="flex items-center justify-between border-b border-card-border/50 pb-2 mb-3">
                <h5 className="text-[10px] font-bold text-foreground font-sans uppercase tracking-wider">
                  Notifications
                </h5>
                {notifications.some((n) => n.unread) && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[9px] uppercase tracking-wider text-brand-gold hover:text-brand-gold-hover font-bold cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => markAsRead(notif.id)}
                    className={`w-full p-2.5 rounded-lg border transition-all duration-300 text-left cursor-pointer block ${
                      notif.unread
                        ? "bg-brand-gold/5 border-brand-gold/20 hover:border-brand-gold/40"
                        : "bg-background/40 border-card-border/40 hover:border-card-border/80"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className={`text-[10px] font-bold ${
                          notif.unread ? "text-brand-gold" : "text-foreground"
                        }`}
                      >
                        {notif.title}
                      </span>
                      <span className="text-[8px] text-zinc-500 font-mono shrink-0">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
