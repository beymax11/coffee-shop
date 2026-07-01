import { MenuItem, Reservation } from "@/types";
import { menuItems as defaultMenuItems } from "@/data/menu";

export interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  stamps: number;
  points: number;
  joinedAt: string;
}

const DEFAULT_RESERVATIONS: Reservation[] = [
  {
    fullName: "Arthur Pendragon",
    email: "arthur@camelot.org",
    phone: "+639171234567",
    eventType: "Table Reservation",
    date: "2026-07-05",
    time: "14:00",
    guestCount: 2,
    location: "Salon Prime",
    notes: "Celebrating anniversary. Prefer window seat."
  },
  {
    fullName: "Ginevra de' Benci",
    email: "ginevra@florence.net",
    phone: "+639189876543",
    eventType: "Coffee Cart Booking",
    date: "2026-07-12",
    time: "10:00",
    guestCount: 50,
    location: "Art Gallery, BGC",
    notes: "Require premium Geisha tasting flights for guests."
  }
];

const DEFAULT_LOYALTY_MEMBERS: LoyaltyMember[] = [
  {
    id: "LN-882-901",
    name: "Alexander Vance",
    email: "alexander@vance.net",
    stamps: 5,
    points: 720,
    joinedAt: "2026-06-15"
  },
  {
    id: "LN-102-902",
    name: "John Doe",
    email: "john@example.com",
    stamps: 3,
    points: 420,
    joinedAt: "2026-06-01"
  },
  {
    id: "LN-203-903",
    name: "Jane Smith",
    email: "jane@gmail.com",
    stamps: 7,
    points: 1150,
    joinedAt: "2026-06-12"
  }
];

// Helper to check if localStorage is available
const isBrowser = typeof window !== "undefined";

function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setLocalStorageItem<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

export const db = {
  // --- MENU ITEMS ---
  getMenuItems(): MenuItem[] {
    // If not in localStorage, seed defaults
    if (isBrowser && !localStorage.getItem("menu_items")) {
      setLocalStorageItem("menu_items", defaultMenuItems);
    }
    return getLocalStorageItem("menu_items", defaultMenuItems);
  },

  saveMenuItem(item: MenuItem): void {
    const items = this.getMenuItems();
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    setLocalStorageItem("menu_items", items);
    // Dispatch storage event for other tabs/components
    if (isBrowser) window.dispatchEvent(new Event("storage"));
  },

  deleteMenuItem(id: string): void {
    const items = this.getMenuItems();
    const filtered = items.filter((i) => i.id !== id);
    setLocalStorageItem("menu_items", filtered);
    if (isBrowser) window.dispatchEvent(new Event("storage"));
  },

  // --- RESERVATIONS ---
  getReservations(): Reservation[] {
    if (isBrowser && !localStorage.getItem("reservations")) {
      setLocalStorageItem("reservations", DEFAULT_RESERVATIONS);
    }
    return getLocalStorageItem("reservations", DEFAULT_RESERVATIONS);
  },

  saveReservation(reservation: Reservation): void {
    const reservations = this.getReservations();
    reservations.unshift(reservation); // Add new reservations to the top
    setLocalStorageItem("reservations", reservations);
    if (isBrowser) window.dispatchEvent(new Event("storage"));
  },

  // --- LOYALTY MEMBERS ---
  getLoyaltyMembers(): LoyaltyMember[] {
    if (isBrowser && !localStorage.getItem("loyalty_members")) {
      setLocalStorageItem("loyalty_members", DEFAULT_LOYALTY_MEMBERS);
    }
    return getLocalStorageItem("loyalty_members", DEFAULT_LOYALTY_MEMBERS);
  },

  saveLoyaltyMember(member: LoyaltyMember): void {
    const members = this.getLoyaltyMembers();
    const index = members.findIndex((m) => m.id === member.id);
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    setLocalStorageItem("loyalty_members", members);
    if (isBrowser) window.dispatchEvent(new Event("storage"));
  },

  deleteLoyaltyMember(id: string): void {
    const members = this.getLoyaltyMembers();
    const filtered = members.filter((m) => m.id !== id);
    setLocalStorageItem("loyalty_members", filtered);
    if (isBrowser) window.dispatchEvent(new Event("storage"));
  },

  // --- DATABASE RESET ---
  resetDatabase(): void {
    if (!isBrowser) return;
    localStorage.removeItem("menu_items");
    localStorage.removeItem("reservations");
    localStorage.removeItem("loyalty_members");
    // Reseed
    this.getMenuItems();
    this.getReservations();
    this.getLoyaltyMembers();
    window.dispatchEvent(new Event("storage"));
  }
};
