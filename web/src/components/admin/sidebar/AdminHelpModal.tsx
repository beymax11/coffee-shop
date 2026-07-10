"use client";

import React, { useState } from "react";
import { X, HelpCircle, BookOpen, Info } from "lucide-react";
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
                  System Help & Guide
                </h3>
                <p className="text-xs text-neutral-400 dark:text-zinc-500">
                  Antonioni Grounds Admin Management Console
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-card-border/60 mb-6">
              {[
                { id: "guide" as const, label: "System Guide", icon: BookOpen },
                { id: "faqs" as const, label: "FAQs", icon: HelpCircle },
                { id: "support" as const, label: "Support & Diagnostics", icon: Info },
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
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                      Dashboard Overview
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Provides quick-glance statistics of total menu items, pending reservations, active loyalty members, and recent actions. Useful for monitoring daily operations at a glance.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                      Menu Offerings
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Create, view, update, or remove menu items. Toggle the availability state of drinks or food (e.g. mark out-of-stock to temporarily hide it from customers).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                      Experience Bookings / Reservations
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Review details of customers booking tables or events. You can approve pending slot requests, toggle check-ins, or cancel reservations directly.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                      Digital Loyalty Directory
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Manage digital stamp cards for registered customers. Staff can manually award stamps for walk-in orders, revoke accidental stamps, or redeem complete reward cards (resets cards to 0 stamps).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-foreground/[0.02] border border-card-border/40">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                      User Accounts & Roles
                    </h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed">
                      Adjust permissions by promoting or demoting users (e.g., to Admin, Barista, or Customer). Admin access grants full customization, whereas Baristas get a streamlined view focused only on execution.
                    </p>
                  </div>
                </div>
              )}

              {activeHelpTab === "faqs" && (
                <div className="space-y-4">
                  <div className="border-b border-card-border/40 pb-3">
                    <p className="font-bold text-foreground text-xs">Q: How do customers get stamps?</p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1">
                      Every time a customer makes a purchase, the barista/admin can search their email or phone number in the Loyalty Directory and click the "+" button to award a stamp.
                    </p>
                  </div>

                  <div className="border-b border-card-border/40 pb-3">
                    <p className="font-bold text-foreground text-xs">Q: What happens when 9 stamps are completed?</p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1">
                      The customer is eligible for a free reward drink. Use the "Redeem" action in the Loyalty tab to reset their stamp card to 0 after giving them the drink.
                    </p>
                  </div>

                  <div className="border-b border-card-border/40 pb-3">
                    <p className="font-bold text-foreground text-xs">Q: What can a Barista role access?</p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1">
                      A Barista can view the dashboard summary, review and change reservation statuses, and award/redeem loyalty stamps. Baristas cannot edit menu items, manage users, or post news.
                    </p>
                  </div>

                  <div className="pb-3">
                    <p className="font-bold text-foreground text-xs">Q: How do we upload images for Menu or Events?</p>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs mt-1">
                      When adding or editing items, you can drop an image file or type a direct URL. Files are automatically uploaded and optimized via Supabase Storage.
                    </p>
                  </div>
                </div>
              )}

              {activeHelpTab === "support" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-brand-green/5 border border-brand-green/20 flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 animate-pulse shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground text-xs">System Connected</h4>
                      <p className="text-neutral-500 dark:text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                        The admin console is successfully synchronized with Supabase cloud infrastructure and Local Storage database.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border border-card-border bg-foreground/[0.01]">
                      <span className="text-[10px] text-neutral-400 dark:text-zinc-500 block uppercase font-bold tracking-wider">Console Version</span>
                      <span className="font-mono text-xs text-foreground font-semibold">v1.4.0 (Stable)</span>
                    </div>
                    <div className="p-3 rounded-lg border border-card-border bg-foreground/[0.01]">
                      <span className="text-[10px] text-neutral-400 dark:text-zinc-500 block uppercase font-bold tracking-wider">API Latency</span>
                      <span className="font-mono text-xs text-foreground font-semibold">Optimal (&lt; 80ms)</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-card-border/40 pt-4">
                    <h4 className="font-bold text-foreground text-xs">Need Assistance?</h4>
                    <p className="text-neutral-500 dark:text-zinc-400 text-xs">
                      For technical issues, system outages, or custom features, contact the developers:
                    </p>
                    <div className="font-mono text-[11px] text-neutral-500 dark:text-zinc-400 space-y-1 bg-foreground/[0.02] p-3 rounded-lg border border-card-border/40">
                      <div>Email: <a href="mailto:support@coffee.com" className="text-brand-green hover:underline">support@coffee.com</a></div>
                      <div>Phone Support: Ext. 404 / +1 (555) 404-COFFEE</div>
                      <div>Working Hours: 08:00 AM - 10:00 PM (PST)</div>
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
