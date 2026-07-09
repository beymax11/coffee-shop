"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Coffee,
  Calendar,
  Sparkles,
  LogOut,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { db, LoyaltyMember } from "@/utils/db";
import { MenuItem, Reservation } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

// Import modular sub-components
import { DashboardTab } from "./DashboardTab";
import { MenuTab } from "./MenuTab";
import { ReservationsTab } from "./ReservationsTab";
import { LoyaltyTab } from "./LoyaltyTab";
import { MenuModal } from "./MenuModal";
import { LoyaltyModal } from "./LoyaltyModal";

const EASE = [0.16, 1, 0.3, 1] as const;

export const AdminView: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "menu" | "reservations" | "loyalty">("dashboard");

  // Database States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loyaltyMembers, setLoyaltyMembers] = useState<LoyaltyMember[]>([]);

  // Search/Filters
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCatFilter, setMenuCatFilter] = useState("All");
  const [reservationFilter, setReservationFilter] = useState<"All" | "Pending" | "Approved" | "Cancelled">("All");
  const [loyaltySearch, setLoyaltySearch] = useState("");

  // Loyalty Stamping & Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [scanSelectId, setScanSelectId] = useState("");
  const [manualSerialCode, setManualSerialCode] = useState("");
  const [stampStatusMsg, setStampStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal / Drawer States
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showAddLoyaltyModal, setShowAddLoyaltyModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  // Form States (Menu)
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Hot Coffee" as MenuItem["category"],
    image: "",
    tags: "",
    notes: ""
  });

  // Form States (Loyalty)
  const [loyaltyForm, setLoyaltyForm] = useState({
    name: "",
    email: "",
    stamps: 0
  });

  // Status mappings for reservations (we store approval state locally)
  const [reservationStatuses, setReservationStatuses] = useState<Record<string, "Pending" | "Approved" | "Cancelled">>({});

  // 1. Auth check
  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session !== "true") {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // 2. Load DB
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
      
      const handleStorageChange = () => {
        loadAllData();
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [isAuthenticated]);

  const loadAllData = () => {
    setMenuItems(db.getMenuItems());
    
    const loadedReservations = db.getReservations();
    setReservations(loadedReservations);
    
    setLoyaltyMembers(db.getLoyaltyMembers());

    // Initialize mock statuses for loaded reservations if not present
    const savedStatuses = localStorage.getItem("admin_reservation_statuses");
    if (savedStatuses) {
      setReservationStatuses(JSON.parse(savedStatuses));
    } else {
      const initialStatuses: Record<string, "Pending" | "Approved" | "Cancelled"> = {};
      loadedReservations.forEach((res, index) => {
        const key = `${res.fullName}-${res.date}-${res.time}`;
        initialStatuses[key] = index === 0 ? "Approved" : "Pending";
      });
      setReservationStatuses(initialStatuses);
      localStorage.setItem("admin_reservation_statuses", JSON.stringify(initialStatuses));
    }
  };

  const updateReservationStatus = (res: Reservation, newStatus: "Pending" | "Approved" | "Cancelled") => {
    const key = `${res.fullName}-${res.date}-${res.time}`;
    const updated = { ...reservationStatuses, [key]: newStatus };
    setReservationStatuses(updated);
    localStorage.setItem("admin_reservation_statuses", JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    router.push("/login");
  };

  const handleResetDb = () => {
    if (confirm("Are you sure you want to reset the database to defaults? Any changes will be lost.")) {
      db.resetDatabase();
      localStorage.removeItem("admin_reservation_statuses");
      loadAllData();
      alert("Database has been reset to defaults.");
    }
  };

  // Beep utility using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Failed to play audio context beep:", e);
    }
  };

  const handleManualStamp = () => {
    if (!manualSerialCode.trim()) return;

    const cleanCode = manualSerialCode.trim();
    const member = loyaltyMembers.find(m => m.id.toLowerCase() === cleanCode.toLowerCase());

    if (member) {
      if (member.stamps >= 9) {
        setStampStatusMsg({ type: "error", text: `${member.name} has already filled their card (9/9 stamps)!` });
        return;
      }
      const newStamps = member.stamps + 1;
      db.saveLoyaltyMember({ ...member, stamps: newStamps });
      playBeep();
      loadAllData();
      setManualSerialCode("");
      
      const unlockedReward = newStamps === 9;
      setStampStatusMsg({ 
        type: "success", 
        text: `Success: Stamp added to ${member.name}'s card! (Now: ${newStamps}/9 stamps).${unlockedReward ? " 🎉 Reward unlocked!" : ""}`
      });
    } else {
      setStampStatusMsg({ type: "error", text: `Error: Serial number "${cleanCode}" is not registered.` });
    }
  };

  const handleScanSimulate = () => {
    if (!scanSelectId) return;

    const member = loyaltyMembers.find(m => m.id === scanSelectId);

    if (member) {
      if (member.stamps >= 9) {
        setStampStatusMsg({ type: "error", text: `Scan Failed: ${member.name} has already filled their card (9/9 stamps)!` });
        return;
      }
      const newStamps = member.stamps + 1;
      db.saveLoyaltyMember({ ...member, stamps: newStamps });
      playBeep();
      loadAllData();
      
      const unlockedReward = newStamps === 9;
      setStampStatusMsg({ 
        type: "success", 
        text: `Scan Success: Detected ${member.name}'s QR code! Issued 1 stamp. (Now: ${newStamps}/9 stamps).${unlockedReward ? " 🎉 Reward unlocked!" : ""}`
      });
    } else {
      setStampStatusMsg({ type: "error", text: "Scan Failed: Card not found in database." });
    }
  };

  const handleUpdateStamps = (member: LoyaltyMember, increment: boolean) => {
    let newStamps = member.stamps + (increment ? 1 : -1);
    if (newStamps < 0) newStamps = 0;
    if (newStamps > 9) newStamps = 9;
    db.saveLoyaltyMember({ ...member, stamps: newStamps });
    loadAllData();
  };

  const handleSaveStampsDirect = (member: LoyaltyMember, stamps: number) => {
    db.saveLoyaltyMember({ ...member, stamps });
    loadAllData();
  };

  const handleRedeemFreeDrink = (member: LoyaltyMember) => {
    if (confirm("Redeem rewards card and reset stamps?")) {
      db.saveLoyaltyMember({ ...member, stamps: 0 });
      loadAllData();
    }
  };

  const handleDeleteLoyalty = (id: string) => {
    if (confirm("Delete this loyalty card?")) {
      db.deleteLoyaltyMember(id);
      loadAllData();
    }
  };

  // --- CRUD HANDLERS ---
  // Menu Item
  const handleAddMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: MenuItem = {
      id: editingMenuItem ? editingMenuItem.id : `m-${Date.now()}`,
      name: menuForm.name,
      description: menuForm.description,
      price: Number(menuForm.price),
      rating: editingMenuItem ? editingMenuItem.rating : 5.0,
      image: menuForm.image || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop",
      category: menuForm.category,
      tags: menuForm.tags ? menuForm.tags.split(",").map(t => t.trim()) : [],
      notes: menuForm.notes || undefined
    };
    db.saveMenuItem(newItem);
    loadAllData();
    setShowAddMenuModal(false);
    setEditingMenuItem(null);
    resetMenuForm();
  };

  const startEditMenu = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      tags: item.tags ? item.tags.join(", ") : "",
      notes: item.notes || ""
    });
    setShowAddMenuModal(true);
  };

  const handleDeleteMenu = (id: string) => {
    if (confirm("Delete this menu item?")) {
      db.deleteMenuItem(id);
      loadAllData();
    }
  };

  const resetMenuForm = () => {
    setMenuForm({
      name: "",
      description: "",
      price: 0,
      category: "Hot Coffee",
      image: "",
      tags: "",
      notes: ""
    });
  };

  // Loyalty Member
  const handleAddLoyaltySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: LoyaltyMember = {
      id: `LN-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
      name: loyaltyForm.name,
      email: loyaltyForm.email,
      stamps: Number(loyaltyForm.stamps),
      points: 0,
      joinedAt: new Date().toISOString().split("T")[0]
    };
    db.saveLoyaltyMember(newMember);
    loadAllData();
    setShowAddLoyaltyModal(false);
    setLoyaltyForm({ name: "", email: "", stamps: 0 });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute w-[300px] h-[300px] bg-[#C5A880]/10 blur-[100px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay" />
        <div className="flex flex-col items-center gap-4 text-center z-10">
          <RefreshCw className="animate-spin text-brand-gold h-10 w-10" />
          <span className="type-eyebrow text-zinc-500 text-xs tracking-[0.2em]">Accessing Maître D' Console...</span>
        </div>
      </div>
    );
  }

  const menuItemsCount = menuItems.length;
  const reservationsCount = reservations.length;
  const loyaltyMembersCount = loyaltyMembers.length;

  return (
    <div className="min-h-screen flex bg-[#080808] text-[#F5F5F0] overflow-hidden relative font-sans">
      {/* Background elements */}
      <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay z-0" />
      <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-[#C5A880]/4 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[10%] w-[450px] h-[450px] bg-[#2E5A44]/4 blur-[130px] rounded-full pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/[0.06] bg-[#0A0A0A]/95 backdrop-blur-md flex flex-col justify-between shrink-0 relative z-10">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/[0.06] flex flex-col gap-1.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A880]/5 blur-[20px] rounded-full pointer-events-none" />
            <span className="type-eyebrow tracking-[0.25em] text-[9px] text-brand-gold font-bold">ANTONIONI GROUNDS</span>
            <span className="type-logo text-white text-sm font-bold font-serif tracking-wider">MAÎTRE D' CONSOLE</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            {[
              { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
              { id: "menu" as const, label: "Menu Offerings", icon: Coffee },
              { id: "reservations" as const, label: "Reservations", icon: Calendar, badge: reservations.length },
              { id: "loyalty" as const, label: "Loyalty Logs", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl type-ui text-[11px] tracking-wider transition-all duration-300 relative group overflow-hidden ${
                    isActive
                      ? "text-black font-semibold shadow-[0_4px_20px_rgba(197,168,128,0.2)]"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
                  }`}
                >
                  {/* Glowing background for active */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-brand-gold"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  <span className="relative z-10 flex items-center gap-3.5 w-full">
                    <Icon size={15} className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                    {tab.label}
                    {tab.badge && tab.badge > 0 && (
                      <span className={`ml-auto font-mono text-[9px] px-1.5 py-0.5 rounded-full transition-colors ${
                        isActive ? "bg-black/15 text-black font-bold" : "bg-white/10 text-zinc-300"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin User Section */}
        <div className="p-4 border-t border-white/[0.06] bg-[#080808]/90 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold text-xs font-bold shadow-[0_0_15px_rgba(197,168,128,0.1)] shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <p className="type-body-sm font-semibold text-white truncate text-xs">Maître D' Admin</p>
              <p className="type-caption text-zinc-500 truncate text-[9px] tracking-wide mt-0.5">admin@coffee.com</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] py-2.5 type-ui text-[10px] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all duration-300 group hover:border-white/10"
          >
            <LogOut size={12} className="transition-transform group-hover:-translate-x-0.5" />
            Exit Console
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto p-8 relative z-10">
        
        {/* TOP BAR / Header */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-white/[0.06] relative">
          <div>
            <span className="type-eyebrow text-[9px] text-brand-gold tracking-[0.25em]">Console Panel</span>
            <h1 className="type-h2 text-white font-serif tracking-tight mt-1">
              {activeTab === "dashboard" && "DASHBOARD OVERVIEW"}
              {activeTab === "menu" && "MENU OFFERINGS"}
              {activeTab === "reservations" && "EXPERIENCE BOOKINGS"}
              {activeTab === "loyalty" && "DIGITAL LOYALTY DIRECTORY"}
            </h1>
            <p className="type-caption text-zinc-500 mt-1">
              Manage menu inventory, client reservations, and card records.
            </p>
          </div>

          {activeTab === "dashboard" && (
            <motion.button
              onClick={handleResetDb}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-full border border-red-500/10 bg-red-500/5 px-4 py-2 type-ui text-[10px] text-red-400 hover:bg-red-500/10 transition-all font-semibold cursor-pointer shadow-lg hover:shadow-red-500/5"
            >
              <RefreshCw size={11} className="transition-transform hover:rotate-180 duration-500" />
              Reset Database
            </motion.button>
          )}
        </header>

        {/* Tab Views with Animation */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex-1 flex flex-col"
            >
              {activeTab === "dashboard" && (
                <DashboardTab
                  menuItemsCount={menuItemsCount}
                  reservationsCount={reservationsCount}
                  loyaltyMembersCount={loyaltyMembersCount}
                  recentReservations={reservations}
                  reservationStatuses={reservationStatuses}
                  onNavigate={setActiveTab}
                  onNewMenuItemClick={() => {
                    resetMenuForm();
                    setShowAddMenuModal(true);
                  }}
                  onRegisterLoyaltyClick={() => {
                    setLoyaltyForm({ name: "", email: "", stamps: 0 });
                    setShowAddLoyaltyModal(true);
                  }}
                />
              )}

              {activeTab === "menu" && (
                <MenuTab
                  menuItems={menuItems}
                  menuSearch={menuSearch}
                  setMenuSearch={setMenuSearch}
                  menuCatFilter={menuCatFilter}
                  setMenuCatFilter={setMenuCatFilter}
                  onEditItem={startEditMenu}
                  onDeleteItem={handleDeleteMenu}
                  onOpenAddModal={() => {
                    resetMenuForm();
                    setShowAddMenuModal(true);
                  }}
                />
              )}

              {activeTab === "reservations" && (
                <ReservationsTab
                  reservations={reservations}
                  reservationStatuses={reservationStatuses}
                  reservationFilter={reservationFilter}
                  setReservationFilter={setReservationFilter}
                  onUpdateStatus={updateReservationStatus}
                />
              )}

              {activeTab === "loyalty" && (
                <LoyaltyTab
                  loyaltyMembers={loyaltyMembers}
                  loyaltySearch={loyaltySearch}
                  setLoyaltySearch={setLoyaltySearch}
                  isScanning={isScanning}
                  setIsScanning={setIsScanning}
                  scanSelectId={scanSelectId}
                  setScanSelectId={setScanSelectId}
                  manualSerialCode={manualSerialCode}
                  setManualSerialCode={setManualSerialCode}
                  stampStatusMsg={stampStatusMsg}
                  onManualStamp={handleManualStamp}
                  onScanSimulate={handleScanSimulate}
                  onUpdateStamps={handleUpdateStamps}
                  onDeleteLoyalty={handleDeleteLoyalty}
                  onOpenRegisterModal={() => {
                    setLoyaltyForm({ name: "", email: "", stamps: 0 });
                    setShowAddLoyaltyModal(true);
                  }}
                  onSaveStampsDirect={handleSaveStampsDirect}
                  onRedeemFreeDrink={handleRedeemFreeDrink}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Modals */}
      <MenuModal
        isOpen={showAddMenuModal}
        onClose={() => {
          setShowAddMenuModal(false);
          setEditingMenuItem(null);
        }}
        editingMenuItem={editingMenuItem}
        menuForm={menuForm}
        setMenuForm={setMenuForm}
        onSubmit={handleAddMenuSubmit}
      />

      <LoyaltyModal
        isOpen={showAddLoyaltyModal}
        onClose={() => setShowAddLoyaltyModal(false)}
        loyaltyForm={loyaltyForm}
        setLoyaltyForm={setLoyaltyForm}
        onSubmit={handleAddLoyaltySubmit}
      />

    </div>
  );
};
