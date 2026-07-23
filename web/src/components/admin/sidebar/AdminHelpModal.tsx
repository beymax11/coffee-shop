"use client";

import React, { useState } from "react";
import {
  X,
  HelpCircle,
  BookOpen,
  Info,
  LayoutDashboard,
  Coffee,
  Calendar,
  CreditCard,
  Users,
  Camera,
  Megaphone,
  History,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminHelpModal: React.FC<AdminHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeHelpTab, setActiveHelpTab] = useState<"guide" | "faqs" | "support">("guide");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full max-w-2xl rounded-2xl border border-card-border bg-card p-6 md:p-8 shadow-2xl relative z-10 overflow-hidden text-foreground flex flex-col max-h-[85vh]"
          >
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 blur-[35px] rounded-full pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors duration-300 p-1.5 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-brand-green/10 rounded-xl text-brand-green">
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 className="text-xl text-foreground font-serif font-bold tracking-tight">
                  System Help & Documentation
                </h3>
                <p className="text-xs text-neutral-400 dark:text-zinc-500">
                  Antonioni Grounds Admin & Staff Operations Portal
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-card-border/60 mb-6">
              {[
                { id: "guide" as const, label: "System Guide", icon: BookOpen },
                { id: "faqs" as const, label: "FAQs", icon: HelpCircle },
                { id: "support" as const, label: "Diagnostics & Support", icon: Info },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isTabActive = activeHelpTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveHelpTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                      isTabActive
                        ? "border-brand-green text-brand-green font-bold"
                        : "border-transparent text-neutral-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white"
                    }`}
                  >
                    <TabIcon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-sm scrollbar-thin">
              {activeHelpTab === "guide" && (
                <div className="space-y-3.5">
                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40 hover:border-card-border/80 transition-colors">
                    <h4 className="font-bold text-foreground mb-1.5 flex items-center gap-2 text-xs">
                      <LayoutDashboard size={15} className="text-brand-green" />
                      Dashboard Overview
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Monitor overall store metrics in real time including total menu items, pending table reservations, active loyalty customers, and daily activity. Provides quick operation shortcuts for staff.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40 hover:border-card-border/80 transition-colors">
                    <h4 className="font-bold text-foreground mb-1.5 flex items-center gap-2 text-xs">
                      <Coffee size={15} className="text-brand-green" />
                      Menu Offerings
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Add, edit, or remove coffee, beverage, and pastry offerings. Easily switch item status between <span className="font-semibold text-foreground">In Stock</span> and <span className="font-semibold text-amber-500">Out of Stock</span> to update customer menu availability instantly.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40 hover:border-card-border/80 transition-colors">
                    <h4 className="font-bold text-foreground mb-1.5 flex items-center gap-2 text-xs">
                      <Calendar size={15} className="text-brand-green" />
                      Experience Bookings & Table Reservations
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Review incoming customer table and event booking requests. Staff can approve pending reservations, mark guests as checked in, or cancel requests as necessary.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40 hover:border-card-border/80 transition-colors">
                    <h4 className="font-bold text-foreground mb-1.5 flex items-center gap-2 text-xs">
                      <CreditCard size={15} className="text-brand-green" />
                      Digital Loyalty Directory
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Search registered customers by email or unique <span className="font-semibold text-foreground">Member ID</span>. Award digital stamps for purchases, adjust stamp balances, and redeem completed 9-stamp reward cards.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40 hover:border-card-border/80 transition-colors">
                    <h4 className="font-bold text-foreground mb-1.5 flex items-center gap-2 text-xs">
                      <Users size={15} className="text-brand-green" />
                      User Accounts & Roles
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Manage user profiles and customer accounts. View Member IDs, assign roles (<span className="font-semibold text-foreground">Admin</span>, <span className="font-semibold text-emerald-500">Barista</span>, or <span className="font-semibold text-neutral-400">Customer</span>), and adjust system permissions.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40 hover:border-card-border/80 transition-colors">
                    <h4 className="font-bold text-foreground mb-1.5 flex items-center gap-2 text-xs">
                      <Camera size={15} className="text-brand-green" />
                      Gallery & Lifestyle Atmosphere
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Curate aesthetic shop photos, interior highlights, and coffee preparation visuals displayed on the customer landing page and shop lifestyle showcase.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40 hover:border-card-border/80 transition-colors">
                    <h4 className="font-bold text-foreground mb-1.5 flex items-center gap-2 text-xs">
                      <Megaphone size={15} className="text-brand-green" />
                      Events & Announcements
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Publish upcoming coffee workshops, seasonal blend announcements, special promotional events, and store schedules visible to all visitors.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40 hover:border-card-border/80 transition-colors">
                    <h4 className="font-bold text-foreground mb-1.5 flex items-center gap-2 text-xs">
                      <History size={15} className="text-brand-green" />
                      Audit Logs & Activity History <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green font-normal">Admin Only</span>
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Track security events, login attempts, user role changes, and system modifications. Search logs by category or severity level for compliance and audit auditing.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40 hover:border-card-border/80 transition-colors">
                    <h4 className="font-bold text-foreground mb-1.5 flex items-center gap-2 text-xs">
                      <Wrench size={15} className="text-brand-green" />
                      System Settings <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green font-normal">Admin Only</span>
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Configure store operating hours, contact information, notification behavior, theme defaults, and store metadata settings.
                    </p>
                  </div>
                </div>
              )}

              {activeHelpTab === "faqs" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-card-border/40 bg-foreground/[0.01]">
                    <p className="font-bold text-foreground text-xs flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0" />
                      Q: How do staff members award stamps to customers?
                    </p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1.5 leading-relaxed pl-3.5">
                      Navigate to the <span className="font-semibold text-foreground">Loyalty Directory</span> tab. Search for the customer using their Name, Email, or Member ID (e.g. AG-84920), then click the <span className="font-semibold text-brand-green">+ Stamp</span> button for each qualifying drink purchase.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-card-border/40 bg-foreground/[0.01]">
                    <p className="font-bold text-foreground text-xs flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0" />
                      Q: How does reward redemption work when 9 stamps are completed?
                    </p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1.5 leading-relaxed pl-3.5">
                      When a customer reaches 9 stamps, their card becomes eligible for a free reward drink. Click the <span className="font-semibold text-emerald-600">Redeem Reward</span> button in the Loyalty tab to issue the reward and automatically reset the customer's stamp balance to 0.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-card-border/40 bg-foreground/[0.01]">
                    <p className="font-bold text-foreground text-xs flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0" />
                      Q: What are the access permissions for the Barista role?
                    </p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1.5 leading-relaxed pl-3.5">
                      Baristas have access to essential operational tools: <span className="font-semibold text-foreground">Dashboard</span>, <span className="font-semibold text-foreground">Reservations</span>, and <span className="font-semibold text-foreground">Loyalty</span>. Restricted administrative areas such as <span className="font-semibold text-amber-500">Audit Logs</span>, <span className="font-semibold text-amber-500">Menu Editing</span>, <span className="font-semibold text-amber-500">User Management</span>, and <span className="font-semibold text-amber-500">Settings</span> are hidden for safety.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-card-border/40 bg-foreground/[0.01]">
                    <p className="font-bold text-foreground text-xs flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0" />
                      Q: How do customer Member IDs work?
                    </p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1.5 leading-relaxed pl-3.5">
                      Each customer is automatically assigned a unique Member ID upon registration (e.g. AG-10245). Customers can view this ID on their digital membership card, and staff can use it in the search filters.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-card-border/40 bg-foreground/[0.01]">
                    <p className="font-bold text-foreground text-xs flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0" />
                      Q: How do we upload images for Menu, Lifestyle, or Events?
                    </p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1.5 leading-relaxed pl-3.5">
                      When creating or editing items, you can upload image files directly or input direct image URLs. Images are stored securely via Supabase Cloud Storage with automated thumbnail caching.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-card-border/40 bg-foreground/[0.01]">
                    <p className="font-bold text-foreground text-xs flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0" />
                      Q: Where can I trace administrative changes or security logs?
                    </p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1.5 leading-relaxed pl-3.5">
                      Administrators can open the <span className="font-semibold text-foreground">Audit Logs</span> tab to inspect detailed logs of menu modifications, stamp adjustments, user role upgrades, and login events.
                    </p>
                  </div>
                </div>
              )}

              {activeHelpTab === "support" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-brand-green/5 border border-brand-green/20 flex items-start gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-1 animate-pulse shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        System Connected & Synchronized
                      </h4>
                      <p className="text-neutral-500 dark:text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                        Antonioni Grounds Admin Console is online and synced with cloud services & local IndexedDB storage.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-card-border bg-foreground/[0.01]">
                      <span className="text-[10px] text-neutral-400 dark:text-zinc-500 block uppercase font-bold tracking-wider">Console Version</span>
                      <span className="font-mono text-xs text-foreground font-semibold">v1.5.0 (Stable)</span>
                    </div>
                    <div className="p-3 rounded-xl border border-card-border bg-foreground/[0.01]">
                      <span className="text-[10px] text-neutral-400 dark:text-zinc-500 block uppercase font-bold tracking-wider">Database Sync</span>
                      <span className="font-mono text-xs text-brand-green font-semibold">Supabase & LocalDB</span>
                    </div>
                    <div className="p-3 rounded-xl border border-card-border bg-foreground/[0.01]">
                      <span className="text-[10px] text-neutral-400 dark:text-zinc-500 block uppercase font-bold tracking-wider">API Latency</span>
                      <span className="font-mono text-xs text-foreground font-semibold">Optimal (&lt; 45ms)</span>
                    </div>
                    <div className="p-3 rounded-xl border border-card-border bg-foreground/[0.01]">
                      <span className="text-[10px] text-neutral-400 dark:text-zinc-500 block uppercase font-bold tracking-wider">Security State</span>
                      <span className="font-mono text-xs text-emerald-500 font-semibold flex items-center gap-1">
                        <ShieldCheck size={12} /> Active Audit
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-card-border/40 pt-4">
                    <h4 className="font-bold text-foreground text-xs">Technical Support & Contact</h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs">
                      For technical assistance, system configuration updates, or bug reports:
                    </p>
                    <div className="font-mono text-[11px] text-neutral-600 dark:text-zinc-300 space-y-2 bg-foreground/[0.02] p-3.5 rounded-xl border border-card-border/40">
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-brand-green shrink-0" />
                        <span>Email: <a href="mailto:support@antonionigrounds.com" className="text-brand-green hover:underline">support@antonionigrounds.com</a></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-brand-green shrink-0" />
                        <span>Phone Hotline: Ext. 404 / +63 (2) 8800-COFFEE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-brand-green shrink-0" />
                        <span>Support Hours: Mon - Sun | 07:00 AM - 11:00 PM (PST)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="mt-6 pt-4 border-t border-card-border/60 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs tracking-wider uppercase text-white bg-brand-green hover:brightness-95 transition-all duration-300 rounded-xl shadow-md font-semibold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

