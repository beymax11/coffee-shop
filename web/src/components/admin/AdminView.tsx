"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Sun, Moon, Wrench, X } from "lucide-react";
import { db, LoyaltyMember, UserProfile } from "@/utils/db";
import { MenuItem, Reservation } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getMaintenanceMode, setMaintenanceMode } from "@/utils/settings";

// Import modular sub-components
import { Sidebar } from "./Sidebar";
import { DashboardTab } from "./DashboardTab";
import { MenuTab } from "./MenuTab";
import { ReservationsTab } from "./ReservationsTab";
import { LoyaltyTab } from "./LoyaltyTab";
import { MenuModal } from "./MenuModal";
import { LoyaltyModal } from "./LoyaltyModal";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { UsersTab } from "./UsersTab";

const EASE = [0.16, 1, 0.3, 1] as const;

export const AdminView: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "menu" | "reservations" | "loyalty" | "users">("dashboard");

  // Database States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loyaltyMembers, setLoyaltyMembers] = useState<LoyaltyMember[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "barista">("admin");

  // Search/Filters
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCatFilter, setMenuCatFilter] = useState("All");
  const [reservationFilter, setReservationFilter] = useState<"All" | "Pending" | "Approved" | "Cancelled">("All");
  const [loyaltySearch, setLoyaltySearch] = useState("");



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

  // Theme state and toggle logic
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme ? savedTheme === "dark" : root.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const changeTheme = (newTheme: "light" | "dark") => {
    const root = document.documentElement;
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // Maintenance state and toggle logic
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [showMaintenanceConfirmModal, setShowMaintenanceConfirmModal] = useState(false);

  useEffect(() => {
    const loadMaintenance = async () => {
      const active = await getMaintenanceMode();
      setIsMaintenanceActive(active);
    };

    // Set initial value inside microtask to avoid synchronous setState warning
    Promise.resolve().then(loadMaintenance);

    const handleStorage = () => {
      loadMaintenance();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleMaintenance = () => {
    if (!isMaintenanceActive) {
      setShowMaintenanceConfirmModal(true);
    } else {
      setIsMaintenanceActive(false);
      setMaintenanceMode(false);
      toast.success("Maintenance mode deactivated. Customer access restored.");
    }
  };

  const confirmActivateMaintenance = () => {
    setIsMaintenanceActive(true);
    setMaintenanceMode(true);
    toast.error("Maintenance mode activated. Customer access is restricted.", {
      description: "Customers will see a maintenance message after logging in.",
    });
    setShowMaintenanceConfirmModal(false);
  };

  // 1. Auth check
  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session !== "true") {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      const adminProfileStr = localStorage.getItem("admin_profile");
      if (adminProfileStr) {
        try {
          const adminProfile = JSON.parse(adminProfileStr);
          if (adminProfile.email) {
            setCurrentUserEmail(adminProfile.email);
          }
          if (adminProfile.role) {
            setCurrentUserRole(adminProfile.role);
          } else {
            // Default fallback based on email
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@coffee.com";
            if (adminProfile.email?.toLowerCase() === adminEmail.toLowerCase()) {
              setCurrentUserRole("admin");
            } else {
              setCurrentUserRole("barista");
            }
          }
        } catch (e) {
          console.error("Error parsing admin profile:", e);
        }
      }
    }
  }, [router]);

  // Safeguard tab permissions for Baristas
  useEffect(() => {
    if (currentUserRole === "barista" && (activeTab === "menu" || activeTab === "users")) {
      setActiveTab("dashboard");
    }
  }, [activeTab, currentUserRole]);

  // 2. Load DB
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
      
      const handleStorageChange = () => {
        loadLocalData();
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [isAuthenticated]);

  // Load non-loyalty data from localStorage (menu, reservations)
  const loadLocalData = () => {
    setMenuItems(db.getMenuItems());
    const loadedReservations = db.getReservations();
    setReservations(loadedReservations);

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

  // Fetch loyalty members from Supabase (single source of truth)
  const fetchLoyaltyFromSupabase = async () => {
    try {
      const { supabase } = await import("@/utils/supabase");
      const localMembers = db.getLoyaltyMembers();

      if (supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "customer");
        
        if (error) {
          console.error("Supabase select error:", error);
          setLoyaltyMembers(localMembers);
          return;
        }
        if (data) {
          const supabaseMembers: LoyaltyMember[] = data.map((profile: any) => ({
            id: profile.member_id || profile.id,
            name: profile.name || profile.username || "Unknown",
            email: profile.email || "",
            stamps: profile.stamps || 0,
            points: profile.points || 0,
            joinedAt: profile.created_at
              ? new Date(profile.created_at).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]
          }));

          // Merge local members that do NOT exist in Supabase (e.g. offline walk-in members that aren't synced yet)
          const mergedMembers = [...supabaseMembers];
          localMembers.forEach((local) => {
            if (!mergedMembers.some((s) => s.email.toLowerCase() === local.email.toLowerCase())) {
              mergedMembers.push(local);
            }
          });

          setLoyaltyMembers(mergedMembers);
        }
      } else {
        setLoyaltyMembers(localMembers);
      }
    } catch (err) {
      console.error("Error fetching loyalty profiles from Supabase:", err);
      setLoyaltyMembers(db.getLoyaltyMembers());
    }
  };

  // Fetch all profiles from Supabase (unified list) or fallback to mock
  const fetchUsers = async () => {
    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching profiles from Supabase:", error);
          setUsers(db.getMockUsers());
          return;
        }
        
        if (data) {
          const mappedUsers: UserProfile[] = data.map((profile: any) => ({
            id: profile.id,
            name: profile.name || profile.username || "Unknown",
            username: profile.username || undefined,
            email: profile.email || "",
            role: profile.role || "customer",
            stamps: profile.stamps || 0,
            points: profile.points || 0,
            member_id: profile.member_id || undefined,
            joinedAt: profile.created_at
              ? new Date(profile.created_at).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]
          }));
          setUsers(mappedUsers);
        }
      } else {
        setUsers(db.getMockUsers());
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setUsers(db.getMockUsers());
    }
  };

  // Full load: local data + Supabase loyalty members + user profiles
  const loadAllData = async () => {
    loadLocalData();
    await fetchLoyaltyFromSupabase();
    await fetchUsers();
  };

  const updateReservationStatus = (res: Reservation, newStatus: "Pending" | "Approved" | "Cancelled") => {
    const key = `${res.fullName}-${res.date}-${res.time}`;
    const updated = { ...reservationStatuses, [key]: newStatus };
    setReservationStatuses(updated);
    localStorage.setItem("admin_reservation_statuses", JSON.stringify(updated));
    if (newStatus === "Approved") {
      toast.success(`Reservation for ${res.fullName} has been approved.`);
    } else if (newStatus === "Cancelled") {
      toast.error(`Reservation for ${res.fullName} has been cancelled.`);
    } else {
      toast.info(`Reservation for ${res.fullName} set to pending.`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_profile");
    router.push("/login");
  };

  const handleResetDb = () => {
    if (confirm("Are you sure you want to reset the database to defaults? Any changes will be lost.")) {
      db.resetDatabase();
      localStorage.removeItem("admin_reservation_statuses");
      loadAllData();
      toast.success("Database has been reset to defaults.");
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

  // --- STAMP HANDLERS: All Supabase-first ---
  const handleAwardStamp = async (member: LoyaltyMember) => {
    if (member.stamps >= 9) return;
    const newStamps = member.stamps + 1;
    
    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase) {
        const { error } = await supabase
          .from("profiles")
          .update({ stamps: newStamps })
          .eq("email", member.email.toLowerCase());
        
        if (error) {
          console.error("Supabase stamp update error:", error);
          toast.error("Failed to update stamp in database.");
          return;
        }
      }
    } catch (err) {
      console.error("Error awarding stamp:", err);
      toast.error("Failed to connect to database.");
      return;
    }

    // Update UI after successful DB write
    const updated = { ...member, stamps: newStamps };
    setLoyaltyMembers(prev => prev.map(m => m.email === member.email ? updated : m));
    playBeep();
    toast.success(`Awarded 1 stamp to ${member.name}. (${newStamps}/9)`);
  };

  const handleRevokeStamp = async (member: LoyaltyMember) => {
    if (member.stamps <= 0) return;
    const newStamps = member.stamps - 1;

    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase) {
        const { error } = await supabase
          .from("profiles")
          .update({ stamps: newStamps })
          .eq("email", member.email.toLowerCase());
        
        if (error) {
          console.error("Supabase stamp revoke error:", error);
          toast.error("Failed to revoke stamp in database.");
          return;
        }
      }
    } catch (err) {
      console.error("Error revoking stamp:", err);
      toast.error("Failed to connect to database.");
      return;
    }

    const updated = { ...member, stamps: newStamps };
    setLoyaltyMembers(prev => prev.map(m => m.email === member.email ? updated : m));
    toast.info(`Revoked 1 stamp from ${member.name}. (${newStamps}/9)`);
  };

  const handleRedeemFreeDrink = async (member: LoyaltyMember) => {
    if (!confirm("Redeem rewards card and reset stamps?")) return;

    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase) {
        const { error } = await supabase
          .from("profiles")
          .update({ stamps: 0 })
          .eq("email", member.email.toLowerCase());
        
        if (error) {
          console.error("Supabase redeem error:", error);
          toast.error("Failed to redeem in database.");
          return;
        }
      }
    } catch (err) {
      console.error("Error redeeming drink:", err);
      toast.error("Failed to connect to database.");
      return;
    }

    const updated = { ...member, stamps: 0 };
    setLoyaltyMembers(prev => prev.map(m => m.email === member.email ? updated : m));
    toast.success(`Complimentary drink redeemed for ${member.name}!`);
  };

  const handleDeleteLoyalty = async (id: string) => {
    const member = loyaltyMembers.find(m => m.id === id);

    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase && member) {
        await supabase
          .from("profiles")
          .delete()
          .eq("email", member.email.toLowerCase());
      }
    } catch (err) {
      console.error("Error deleting member:", err);
    }

    db.deleteLoyaltyMember(id);
    setLoyaltyMembers(prev => prev.filter(m => m.id !== id));
    toast.success("Loyalty card deleted successfully!");
  };

  // --- USER MANAGEMENT HANDLERS ---
  const handleUpdateUserRole = async (userId: string, newRole: "admin" | "barista" | "customer") => {
    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase) {
        const { error } = await supabase
          .from("profiles")
          .update({ role: newRole })
          .eq("id", userId);
        
        if (error) {
          console.error("Supabase user role update error:", error);
          toast.error("Failed to update user role in database.");
          return;
        }
      } else {
        // Mock mode update
        const mockUsers = db.getMockUsers();
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
          user.role = newRole;
          db.saveMockUser(user);
        }
      }
      
      toast.success("User role updated successfully.");
      await fetchUsers();
      await fetchLoyaltyFromSupabase(); // refresh loyalty to stay in sync
    } catch (err) {
      console.error("Error updating user role:", err);
      toast.error("Failed to update user role.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase) {
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("id", userId);
        
        if (error) {
          console.error("Supabase user delete error:", error);
          toast.error("Failed to delete user in database.");
          return;
        }
      } else {
        // Mock mode delete
        db.deleteMockUser(userId);
      }
      
      toast.success("User account deleted successfully.");
      await fetchUsers();
      await fetchLoyaltyFromSupabase();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user.");
    }
  };

  // --- CRUD HANDLERS ---
  // Menu Item
  const handleAddMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingMenuItem;
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
    toast.success(isEditing ? "Menu item updated successfully!" : "Menu item added successfully!");
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
      toast.success("Menu item deleted successfully!");
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
  const handleAddLoyaltySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const memberId = `AG-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    const email = loyaltyForm.email.trim();
    const name = loyaltyForm.name.trim();
    const stamps = Number(loyaltyForm.stamps) || 0;

    const newMember: LoyaltyMember = {
      id: memberId,
      name: name,
      email: email,
      stamps: stamps,
      points: 0,
      joinedAt: new Date().toISOString().split("T")[0]
    };

    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase) {
        const tempPassword = `CoffeeTemp_${Math.floor(100000 + Math.random() * 900000)}!`;
        
        // Try to sign up the customer as a user first
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: tempPassword,
          options: {
            data: {
              name: name,
              role: "customer"
            }
          }
        });

        if (signUpError) {
          console.warn("Supabase signUp error (user might already exist):", signUpError.message);
          
          // User might already exist, so let's try to update their existing profile
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              member_id: memberId,
              stamps: stamps,
              name: name
            })
            .eq("email", email.toLowerCase());

          if (updateError) {
            console.error("Failed to update existing profile in Supabase:", updateError.message);
          } else {
            console.log("Successfully updated existing profile with loyalty details.");
          }
        } else {
          // SignUp succeeded. Wait for profile creation trigger.
          const userId = signUpData.user?.id;
          if (userId) {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                member_id: memberId,
                stamps: stamps
              })
              .eq("id", userId);

            if (updateError) {
              console.error("Failed to update profile member_id after signUp:", updateError.message);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error during Supabase registration:", err);
    }

    db.saveLoyaltyMember(newMember);
    await loadAllData();
    setShowAddLoyaltyModal(false);
    setLoyaltyForm({ name: "", email: "", stamps: 0 });
    toast.success(`Loyalty card registered for ${newMember.name}!`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute w-[300px] h-[300px] bg-brand-green/10 blur-[100px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay" />
        <div className="flex flex-col items-center gap-4 text-center z-10">
          <RefreshCw className="animate-spin text-brand-green h-10 w-10" />
          <span className="type-eyebrow text-zinc-500 text-xs tracking-[0.2em]">Accessing Maître D' Console...</span>
        </div>
      </div>
    );
  }

  const menuItemsCount = menuItems.length;
  const reservationsCount = reservations.length;
  const loyaltyMembersCount = loyaltyMembers.length;

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden relative font-sans">
      {/* Background elements */}
      <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay z-0" />
      <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-brand-green/4 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[10%] w-[450px] h-[450px] bg-[#2E5A44]/4 blur-[130px] rounded-full pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reservationsCount={reservationsCount}
        onLogout={handleLogout}
        currentUserRole={currentUserRole}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto p-8 relative z-10">
        
        {/* TOP BAR / Header */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-card-border relative">
          <div>
            <span className="type-eyebrow text-[9px] text-brand-green dark:text-emerald-400 tracking-[0.25em]">Console Panel</span>
            <h1 className="type-h2 text-foreground font-serif tracking-tight mt-1">
              {activeTab === "dashboard" && "DASHBOARD OVERVIEW"}
              {activeTab === "menu" && "MENU OFFERINGS"}
              {activeTab === "reservations" && "EXPERIENCE BOOKINGS"}
              {activeTab === "loyalty" && "DIGITAL LOYALTY DIRECTORY"}
              {activeTab === "users" && "USER ACCOUNTS & ROLES"}
            </h1>
            <p className="type-caption text-neutral-500 mt-1">
              {activeTab === "users"
                ? "Adjust account authorization roles, inspect client profiles, and manage system access."
                : "Manage menu inventory, client reservations, and card records."
              }
            </p>
          </div>

          {/* Top Right Actions: Theme Toggle and Notifications */}
          <div className="flex items-center gap-3 self-start md:self-center">
             {/* Maintenance Toggle */}
             <button
               onClick={toggleMaintenance}
               title={isMaintenanceActive ? "Deactivate Maintenance Mode" : "Activate Maintenance Mode"}
               className={`p-2 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center ${
                 isMaintenanceActive
                   ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-500/20 animate-pulse"
                   : "bg-foreground/[0.03] border-card-border text-neutral-500 hover:text-foreground dark:text-zinc-500 dark:hover:text-white"
               }`}
             >
               <Wrench size={18} />
             </button>

            {/* Theme Toggle */}
            <div className="flex items-center gap-1 bg-foreground/[0.03] border border-card-border rounded-full p-1 shadow-sm">
              <button
                onClick={() => changeTheme("light")}
                title="Light Mode"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${theme === "light" ? "bg-brand-green text-white shadow-md" : "text-neutral-500 hover:text-foreground dark:text-zinc-500 dark:hover:text-white"}`}
              >
                <Sun size={12} />
              </button>
              <button
                onClick={() => changeTheme("dark")}
                title="Dark Mode"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${theme === "dark" ? "bg-brand-green text-white shadow-md" : "text-neutral-500 hover:text-foreground dark:text-zinc-500 dark:hover:text-white"}`}
              >
                <Moon size={12} />
              </button>
            </div>

            {/* Notifications Dropdown */}
            <NotificationsDropdown
              reservations={reservations}
              loyaltyMembers={loyaltyMembers}
            />
          </div>
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
                  currentUserRole={currentUserRole}
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
                  onDeleteLoyalty={handleDeleteLoyalty}
                  onOpenRegisterModal={() => {
                    setLoyaltyForm({ name: "", email: "", stamps: 0 });
                    setShowAddLoyaltyModal(true);
                  }}
                  onRedeemFreeDrink={handleRedeemFreeDrink}
                  onAwardStamp={handleAwardStamp}
                  onRevokeStamp={handleRevokeStamp}
                />
              )}

              {activeTab === "users" && (
                <UsersTab
                  users={users}
                  currentUserEmail={currentUserEmail}
                  onUpdateRole={handleUpdateUserRole}
                  onDeleteUser={handleDeleteUser}
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

      <AnimatePresence>
        {showMaintenanceConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMaintenanceConfirmModal(false)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="w-full max-w-md rounded-2xl border border-card-border bg-card p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-[25px] rounded-full pointer-events-none" />

              <button
                onClick={() => setShowMaintenanceConfirmModal(false)}
                className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors duration-300 p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <Wrench size={16} className="text-rose-500 animate-pulse" />
                <h3 className="type-h3 text-foreground font-serif font-bold tracking-tight">
                  Activate Maintenance Mode?
                </h3>
              </div>

              <p className="text-neutral-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                Are you sure you want to activate maintenance mode? This will restrict access for all logged-in customer accounts across the website and show them the maintenance screen. Admins and baristas will retain full access.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceConfirmModal(false)}
                  className="px-4 py-2.5 text-xs tracking-wider uppercase border border-card-border hover:bg-foreground/5 transition-colors duration-300 rounded-lg cursor-pointer text-neutral-500 hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmActivateMaintenance}
                  className="px-4 py-2.5 text-xs tracking-wider uppercase bg-rose-500 hover:bg-rose-600 text-white transition-colors duration-300 rounded-lg shadow-md cursor-pointer animate-pulse"
                >
                  Activate Mode
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
