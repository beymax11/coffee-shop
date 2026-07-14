"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Sun, Moon, Wrench, X, AlertTriangle, Trash2 } from "lucide-react";
import { db, LoyaltyMember, UserProfile } from "@/utils/db";
import { MenuItem, Reservation, ReservationType } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getMaintenanceMode, setMaintenanceMode } from "@/utils/settings";
import { formatPhoneNumber } from "@/utils/phone";

// Import modular sub-components
import { Sidebar } from "./sidebar/Sidebar";
import { DashboardTab } from "./dashboard/DashboardTab";
import { MenuTab } from "./menu/MenuTab";
import { ReservationsTab } from "./reservations/ReservationsTab";
import { ReservationDetailsModal } from "./reservations/ReservationDetailsModal";
import { LoyaltyTab } from "./loyalty/LoyaltyTab";
import { MenuModal } from "./menu/MenuModal";
import { LoyaltyModal } from "./loyalty/LoyaltyModal";
import { NotificationsDropdown } from "./common/NotificationsDropdown";
import { UsersTab } from "./users/UsersTab";
import { LifestyleTab } from "./lifestyle/LifestyleTab";
import { EventsTab } from "./events/EventsTab";
import { SettingsTab } from "./settings/SettingsTab";
import { ConfirmModal } from "./common/ConfirmModal";

const EASE = [0.16, 1, 0.3, 1] as const;

export const AdminView: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "menu" | "reservations" | "loyalty" | "users" | "lifestyle" | "events" | "settings">("dashboard");

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
  const [reservationFilter, setReservationFilter] = useState<"All" | "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed">("All");
  const [reservationSearch, setReservationSearch] = useState("");
  const [loyaltySearch, setLoyaltySearch] = useState("");



  // Modal / Drawer States
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showAddLoyaltyModal, setShowAddLoyaltyModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Form States (Menu)
  const [menuForm, setMenuForm] = useState<{
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    tags: string;
    imageFile?: File | null;
  }>({
    name: "",
    description: "",
    price: 0,
    category: "Hot Coffee",
    image: "",
    tags: "",
    imageFile: null
  });

  // Form States (Loyalty)
  const [loyaltyForm, setLoyaltyForm] = useState({
    name: "",
    email: "",
    phone: "",
    stamps: 0
  });
  // Status mappings for reservations (we store approval state locally)
  const [reservationStatuses, setReservationStatuses] = useState<Record<string, "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed">>({});

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: "danger" | "warning";
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    variant: "danger",
    onConfirm: () => { }
  });

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

  useEffect(() => {
    const handleStorage = () => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setTheme(savedTheme as "light" | "dark");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
    if (currentUserRole === "barista" && (activeTab === "menu" || activeTab === "users" || activeTab === "lifestyle" || activeTab === "events")) {
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

  // Fetch menu items from Supabase
  const fetchMenuItems = async () => {
    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase) {
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching menu items from Supabase:", error);
          setMenuItems(db.getMenuItems());
          return;
        }
        if (data) {
          setMenuItems(data as MenuItem[]);
        }
      } else {
        setMenuItems(db.getMenuItems());
      }
    } catch (err) {
      console.error("Error loading menu items:", err);
      setMenuItems(db.getMenuItems());
    }
  };

  // Fetch reservations — Supabase first, fallback to local
  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();
        // Map snake_case DB columns back to camelCase
        const mapped = (data.reservations as any[]).map((r) => ({
          id: r.id,
          fullName: r.full_name,
          email: r.email,
          phone: r.phone,
          eventType: r.event_type,
          date: r.date,
          time: r.time,
          guestCount: r.guest_count,
          location: r.location,
          notes: r.notes,
          status: r.status,
          paymentMethod: r.payment_method,
          referenceNumber: r.reference_number,
          proofOfPayment: r.proof_of_payment,
          created_at: r.created_at,
        }));

        // Merge: include local reservations that don't exist in Supabase yet (offline bookings)
        const localReservations = db.getReservations();
        const supabaseIds = new Set(mapped.map((r) => r.id));
        const onlyLocal = localReservations.filter((r) => r.id && !supabaseIds.has(r.id));
        const merged = [...mapped, ...onlyLocal];

        setReservations(merged);
        syncLocalReservationStatuses(merged);
        return;
      }
    } catch (err) {
      console.warn("Could not load from Supabase, falling back to local:", err);
    }
    // Fallback: local db only
    const loadedReservations = db.getReservations();
    setReservations(loadedReservations);
    syncLocalReservationStatuses(loadedReservations);
  };

  const syncLocalReservationStatuses = (loadedReservations: Reservation[]) => {
    const savedStatuses = localStorage.getItem("admin_reservation_statuses");
    if (savedStatuses) {
      setReservationStatuses(JSON.parse(savedStatuses));
    } else {
      const initialStatuses: Record<string, "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed"> = {};
      loadedReservations.forEach((res, index) => {
        const key = `${res.fullName}-${res.date}-${res.time}`;
        initialStatuses[key] = index === 0 ? "Approved" : "Pending";
      });
      setReservationStatuses(initialStatuses);
      localStorage.setItem("admin_reservation_statuses", JSON.stringify(initialStatuses));
    }
  };

  // Load non-loyalty data (menu, reservations)
  const loadLocalData = () => {
    fetchMenuItems();
    fetchReservations();
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
            phone: profile.phone || undefined,
            stamps: profile.stamps || 0,
            points: profile.points || 0,
            joinedAt: profile.created_at
              ? new Date(profile.created_at).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]
          }));

          // Merge local members that do NOT exist in Supabase (e.g. offline walk-in members that aren't synced yet)
          const mergedMembers = [...supabaseMembers];
          localMembers.forEach((local) => {
            const alreadyExists = mergedMembers.some((s) => {
              if (local.email && s.email) {
                return s.email.toLowerCase() === local.email.toLowerCase();
              }
              if (local.phone && s.phone) {
                return s.phone.trim() === local.phone.trim();
              }
              return false;
            });
            if (!alreadyExists) {
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
            phone: profile.phone || undefined,
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
    await fetchMenuItems();
    await fetchReservations();
    await fetchLoyaltyFromSupabase();
    await fetchUsers();
  };

  const updateReservationStatus = async (res: Reservation, newStatus: "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed") => {
    const key = `${res.fullName}-${res.date}-${res.time}`;
    const updated = { ...reservationStatuses, [key]: newStatus };
    setReservationStatuses(updated);
    localStorage.setItem("admin_reservation_statuses", JSON.stringify(updated));
    
    // Propagate status update back to the reservation object in localStorage
    const localReservations = db.getReservations();
    const idx = localReservations.findIndex((r) => r.fullName === res.fullName && r.date === res.date && r.time === res.time);
    if (idx >= 0) {
      localReservations[idx].status = newStatus;
      localStorage.setItem("reservations", JSON.stringify(localReservations));
    }
    
    window.dispatchEvent(new Event("storage"));

    // Also update status in Supabase via API (if reservation has an id)
    if (res.id) {
      try {
        await fetch(`/api/reservations/${res.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (err) {
        console.warn("Could not update reservation status in backend:", err);
      }
    }

    // Send automated email notifications
    if (newStatus === "Approved") {
      toast.success(`Reservation for ${res.fullName} has been approved & paid.`);
      // Send secured confirmation email
      try {
        const emailRes = await fetch("/api/send-email/secured", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reservation: res }),
        });
        if (emailRes.ok) {
          toast.success(`📧 Secured & Paid confirmation email sent to ${res.email}`);
        } else {
          console.warn("Email send failed:", await emailRes.text());
          toast.warning(`Approved & Paid, but email notification could not be sent.`);
        }
      } catch (err) {
        console.warn("Email API error:", err);
        toast.warning(`Approved & Paid, but email notification could not be sent.`);
      }
    } else if (newStatus === "Pre-Approved") {
      toast.success(`Reservation for ${res.fullName} has been pre-approved.`);
      // Send approval email so customer gets the Pay Now link
      try {
        const emailRes = await fetch("/api/send-email/approved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reservation: res }),
        });
        if (emailRes.ok) {
          toast.success(`📧 Confirmation email sent to ${res.email}`);
        } else {
          console.warn("Pre-approve email send failed:", await emailRes.text());
          toast.warning(`Pre-approved, but email notification could not be sent.`);
        }
      } catch (err) {
        console.warn("Email API error:", err);
        toast.warning(`Pre-approved, but email notification could not be sent.`);
      }
    } else if (newStatus === "Cancelled") {
      toast.error(`Reservation for ${res.fullName} has been cancelled.`);
    } else if (newStatus === "Completed") {
      toast.success(`Reservation for ${res.fullName} has been completed.`);
      // Send thank you email
      try {
        const emailRes = await fetch("/api/send-email/completed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reservation: res }),
        });
        if (emailRes.ok) {
          toast.success(`📧 Thank you email sent to ${res.email}`);
        } else {
          console.warn("Thank you email send failed:", await emailRes.text());
          toast.warning(`Completed, but thank you email could not be sent.`);
        }
      } catch (err) {
        console.warn("Email API error:", err);
        toast.warning(`Completed, but thank you email could not be sent.`);
      }
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
    setConfirmModal({
      isOpen: true,
      title: "Reset Database",
      message: "Are you sure you want to reset the database to defaults? All custom changes, menu items, and reservation bookings will be lost.",
      confirmText: "Reset Database",
      variant: "warning",
      onConfirm: () => {
        db.resetDatabase();
        localStorage.removeItem("admin_reservation_statuses");
        loadAllData();
        toast.success("Database has been reset to defaults.");
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
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
  const handleRedeemFreeDrink = (member: LoyaltyMember) => {
    setConfirmModal({
      isOpen: true,
      title: "Redeem Free Drink",
      message: `Are you sure you want to redeem the rewards card for ${member.name}? This will reset their stamp count back to 0.`,
      confirmText: "Redeem Card",
      variant: "warning",
      onConfirm: async () => {
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
              setConfirmModal((prev) => ({ ...prev, isOpen: false }));
              return;
            }
          }
        } catch (err) {
          console.error("Error redeeming drink:", err);
          toast.error("Failed to connect to database.");
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          return;
        }

        const updated = { ...member, stamps: 0 };
        setLoyaltyMembers(prev => prev.map(m => m.email === member.email ? updated : m));
        toast.success(`Successfully redeemed free drink for ${member.name}! Stamps reset.`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
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
  const handleAddMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingMenuItem;
    const uniqueId = `m-${crypto.randomUUID()}`;
    let finalImageUrl = menuForm.image || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop";

    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase) {
        // Upload image file if user chose a new file
        if (menuForm.imageFile) {
          const file = menuForm.imageFile;
          const fileExt = file.name.split(".").pop();
          const fileName = `menu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("menu-images")
            .upload(fileName, file, { cacheControl: "3600", upsert: true });

          if (uploadError) {
            console.error("Supabase Storage upload error:", uploadError);
            toast.error("Failed to upload image to Supabase Storage.");
          } else if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from("menu-images")
              .getPublicUrl(fileName);
            finalImageUrl = publicUrl;
          }
        }

        const newItem: MenuItem = {
          id: editingMenuItem ? editingMenuItem.id : uniqueId,
          name: menuForm.name,
          description: menuForm.description,
          price: Number(menuForm.price),
          rating: editingMenuItem ? editingMenuItem.rating : 5.0,
          image: finalImageUrl,
          category: menuForm.category,
          tags: menuForm.tags ? menuForm.tags.split(",").map(t => t.trim()) : []
        };

        const { error } = await supabase
          .from("menu_items")
          .upsert({
            id: newItem.id,
            name: newItem.name,
            description: newItem.description,
            price: newItem.price,
            image: newItem.image,
            category: newItem.category,
            tags: newItem.tags
          });

        if (error) {
          console.error("Supabase upsert menu item error:", error);
          toast.error("Failed to save to database. Saving locally...");
          db.saveMenuItem(newItem);
        }
      } else {
        const newItem: MenuItem = {
          id: editingMenuItem ? editingMenuItem.id : uniqueId,
          name: menuForm.name,
          description: menuForm.description,
          price: Number(menuForm.price),
          rating: editingMenuItem ? editingMenuItem.rating : 5.0,
          image: finalImageUrl,
          category: menuForm.category,
          tags: menuForm.tags ? menuForm.tags.split(",").map(t => t.trim()) : []
        };
        db.saveMenuItem(newItem);
      }
    } catch (err) {
      console.error("Error in handleAddMenuSubmit Supabase path:", err);
      const newItem: MenuItem = {
        id: editingMenuItem ? editingMenuItem.id : uniqueId,
        name: menuForm.name,
        description: menuForm.description,
        price: Number(menuForm.price),
        rating: editingMenuItem ? editingMenuItem.rating : 5.0,
        image: finalImageUrl,
        category: menuForm.category,
        tags: menuForm.tags ? menuForm.tags.split(",").map(t => t.trim()) : []
      };
      db.saveMenuItem(newItem);
    }

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
      tags: item.tags ? item.tags.join(", ") : ""
    });
    setShowAddMenuModal(true);
  };
  const handleDeleteMenu = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete Menu Offering",
      message: `Are you sure you want to delete "${item?.name || "this menu item"}"? This action is permanent and cannot be undone.`,
      confirmText: "Delete Item",
      variant: "danger",
      onConfirm: async () => {
        try {
          const { supabase } = await import("@/utils/supabase");
          if (supabase) {
            const { error } = await supabase
              .from("menu_items")
              .delete()
              .eq("id", id);

            if (error) {
              console.error("Supabase delete menu item error:", error);
              toast.error("Failed to delete from database. Deleting locally...");
              db.deleteMenuItem(id);
            }
          } else {
            db.deleteMenuItem(id);
          }
        } catch (err) {
          console.error("Error in handleDeleteMenu Supabase path:", err);
          db.deleteMenuItem(id);
        }

        loadAllData();
        toast.success("Menu item deleted successfully!");
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };


  const resetMenuForm = () => {
    setMenuForm({
      name: "",
      description: "",
      price: 0,
      category: "Hot Coffee",
      image: "",
      tags: "",
      imageFile: null
    });
  };

  // Loyalty Member
  const handleAddLoyaltySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const memberId = `AG-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    const email = loyaltyForm.email.trim();
    const phone = loyaltyForm.phone.trim();
    const name = loyaltyForm.name.trim();
    const stamps = Number(loyaltyForm.stamps) || 0;

    const formattedPhone = phone ? formatPhoneNumber(phone) : "";

    const newMember: LoyaltyMember = {
      id: memberId,
      name: name,
      email: email,
      phone: formattedPhone || undefined,
      stamps: stamps,
      points: 0,
      joinedAt: new Date().toISOString().split("T")[0]
    };

    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase) {
        const tempPassword = `CoffeeTemp_${Math.floor(100000 + Math.random() * 900000)}!`;

        if (formattedPhone) {
          // Phone Signup
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            phone: formattedPhone,
            password: tempPassword,
            options: {
              data: {
                name: name,
                role: "customer"
              }
            }
          });

          if (signUpError) {
            console.warn("Supabase signUp by phone error (user might already exist):", signUpError.message);

            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                member_id: memberId,
                stamps: stamps,
                name: name
              })
              .eq("phone", formattedPhone);

            if (updateError) {
              console.error("Failed to update existing profile in Supabase by phone:", updateError.message);
            }
          } else {
            const userId = signUpData.user?.id;
            if (userId) {
              await new Promise((resolve) => setTimeout(resolve, 1200));

              const { data: existingProfile } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", userId)
                .single();

              if (existingProfile) {
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update({
                    member_id: memberId,
                    stamps: stamps
                  })
                  .eq("id", userId);

                if (updateError) {
                  console.error("Failed to update profile member_id after phone signUp:", updateError.message);
                }
              } else {
                const { error: insertError } = await supabase
                  .from("profiles")
                  .insert({
                    id: userId,
                    name: name,
                    email: "",
                    phone: formattedPhone || null,
                    role: "customer",
                    member_id: memberId,
                    stamps: stamps,
                    points: 0
                  });

                if (insertError) {
                  console.error("Failed to insert missing profile after phone signUp:", insertError.message);
                }
              }
            }
          }
        } else {
          // Email Signup
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
            console.warn("Supabase signUp by email error (user might already exist):", signUpError.message);

            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                member_id: memberId,
                stamps: stamps,
                name: name
              })
              .eq("email", email.toLowerCase());

            if (updateError) {
              console.error("Failed to update existing profile in Supabase by email:", updateError.message);
            }
          } else {
            const userId = signUpData.user?.id;
            if (userId) {
              await new Promise((resolve) => setTimeout(resolve, 1200));

              const { data: existingProfile } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", userId)
                .single();

              if (existingProfile) {
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update({
                    member_id: memberId,
                    stamps: stamps
                  })
                  .eq("id", userId);

                if (updateError) {
                  console.error("Failed to update profile member_id after email signUp:", updateError.message);
                }
              } else {
                const { error: insertError } = await supabase
                  .from("profiles")
                  .insert({
                    id: userId,
                    name: name,
                    email: email.toLowerCase(),
                    phone: null,
                    role: "customer",
                    member_id: memberId,
                    stamps: stamps,
                    points: 0
                  });

                if (insertError) {
                  console.error("Failed to insert missing profile after email signUp:", insertError.message);
                }
              }
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
    setLoyaltyForm({ name: "", email: "", phone: "", stamps: 0 });
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
          <span className="type-eyebrow text-zinc-500 text-xs tracking-[0.2em]">Accessing Maître D&apos; Console...</span>
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

      {/* Sidebar Navigation — hidden on mobile, visible on md+ */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        currentUserRole={currentUserRole}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 md:p-8 relative z-10 pb-24 md:pb-8">

        {/* TOP BAR / Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 md:mb-8 pb-3 md:pb-4 border-b border-card-border relative">
          <div>
            <span className="type-eyebrow text-[9px] text-brand-green dark:text-emerald-400 tracking-[0.25em]">Console Panel</span>
            <h1 className="type-h2 text-foreground font-serif tracking-tight mt-1 text-lg sm:text-xl md:text-2xl">
              {activeTab === "dashboard" && "DASHBOARD OVERVIEW"}
              {activeTab === "menu" && "MENU OFFERINGS"}
              {activeTab === "reservations" && "EXPERIENCE BOOKINGS"}
              {activeTab === "loyalty" && "DIGITAL LOYALTY DIRECTORY"}
              {activeTab === "users" && "USER ACCOUNTS & ROLES"}
              {activeTab === "lifestyle" && "LIFESTYLE SELECTIONS"}
              {activeTab === "events" && "EVENTS & ANNOUNCEMENTS"}
              {activeTab === "settings" && "CONSOLE SETTINGS"}
            </h1>
            <p className="type-caption text-neutral-500 mt-1 hidden sm:block">
              {activeTab === "users"
                ? "Adjust account authorization roles, inspect client profiles, and manage system access."
                : activeTab === "lifestyle"
                  ? "Curate and manage social media post selections featured on the lifestyle bento grid."
                  : activeTab === "events"
                    ? "Manage promotional events, holiday schedules, and seasonal menu announcements."
                    : activeTab === "settings"
                      ? "Configure your personal dashboard details and set console system preferences."
                      : "Manage menu inventory, client reservations, and card records."
              }
            </p>
          </div>

          {/* Top Right Actions: Theme Toggle and Notifications */}
          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-start md:self-center">

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
                    setLoyaltyForm({ name: "", email: "", phone: "", stamps: 0 });
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
                  reservationSearch={reservationSearch}
                  setReservationSearch={setReservationSearch}
                  onOpenDetails={(res) => setSelectedReservation(res)}
                />
              )}

              {activeTab === "loyalty" && (
                <LoyaltyTab
                  loyaltyMembers={loyaltyMembers}
                  loyaltySearch={loyaltySearch}
                  setLoyaltySearch={setLoyaltySearch}
                  onDeleteLoyalty={handleDeleteLoyalty}
                  onOpenRegisterModal={() => {
                    setLoyaltyForm({ name: "", email: "", phone: "", stamps: 0 });
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

              {activeTab === "lifestyle" && (
                <LifestyleTab />
              )}

              {activeTab === "events" && (
                <EventsTab />
              )}

              {activeTab === "settings" && currentUserRole !== "barista" && (
                <SettingsTab />
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
      />

      <ReservationDetailsModal
        isOpen={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        reservation={selectedReservation}
        reservationStatuses={reservationStatuses}
        onUpdateStatus={updateReservationStatus}
      />
    </div>
  );
};
