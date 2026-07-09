"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Calendar, CreditCard, Info, Check, CheckSquare, Trash2 } from "lucide-react";
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

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  reservations,
  loyaltyMembers,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        className="p-2 rounded-full transition-colors cursor-pointer text-neutral-500 hover:text-foreground dark:text-zinc-500 dark:hover:text-white hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03] relative border border-transparent hover:border-card-border"
      >
        <Bell size={18} className={unreadCount > 0 ? "animate-pulse" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-background dark:ring-black" />
        )}
      </button>

      {/* Dropdown Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-hidden rounded-2xl border border-card-border bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col z-50"
          >
            {/* Header */}
            <div className="p-3 px-4 border-b border-card-border flex items-center justify-between bg-background-alt/30">
              <div className="flex items-center gap-2">
                <h3 className="type-body font-semibold text-[10px] text-foreground uppercase tracking-wider">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-brand-green text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="type-ui text-[9px] text-brand-green dark:text-emerald-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Check size={10} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto divide-y divide-card-border custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 dark:text-zinc-500 flex flex-col items-center justify-center gap-2">
                  <Bell size={20} className="opacity-20" />
                  <p className="type-caption text-[10px]">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 transition-colors flex gap-2.5 relative group ${
                      notif.read ? "opacity-75 hover:bg-foreground/[0.01] dark:hover:bg-white/[0.01]" : "bg-brand-green/[0.02] dark:bg-emerald-500/[0.01] hover:bg-brand-green/[0.04]"
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {!notif.read && (
                      <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-brand-green" />
                    )}

                    {/* Icon based on type */}
                    <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === "reservation"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : notif.type === "loyalty"
                        ? "bg-brand-green/10 text-brand-green dark:text-emerald-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}>
                      {notif.type === "reservation" && <Calendar size={11} />}
                      {notif.type === "loyalty" && <CreditCard size={11} />}
                      {notif.type === "system" && <Info size={11} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5">
                        <p className="type-body-sm text-[10.5px] font-semibold text-foreground truncate">
                          {notif.title}
                        </p>
                        <span className="type-caption text-[7.5px] text-neutral-400 dark:text-zinc-500 shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="type-caption text-[9.5px] text-neutral-500 dark:text-zinc-400 leading-normal mt-0.5 break-words">
                        {notif.description}
                      </p>

                      {/* Action buttons inside hovered notification */}
                      <div className="flex items-center gap-2.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleRead(notif.id)}
                          className="type-ui text-[8.5px] text-neutral-400 hover:text-foreground dark:text-zinc-500 dark:hover:text-white flex items-center gap-0.5 cursor-pointer"
                        >
                          <CheckSquare size={8} />
                          {notif.read ? "Mark unread" : "Mark read"}
                        </button>
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="type-ui text-[8.5px] text-red-500/80 hover:text-red-500 flex items-center gap-0.5 cursor-pointer ml-auto"
                        >
                          <Trash2 size={8} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
