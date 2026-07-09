import { MenuItem, Reservation, LifestylePost } from "@/types";
import { menuItems as defaultMenuItems } from "@/data/menu";

export interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  stamps: number;
  points: number;
  joinedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: "admin" | "barista" | "customer";
  stamps?: number;
  points?: number;
  member_id?: string;
  joinedAt?: string;
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
    location: "Antonioni Brooklyn",
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

const DEFAULT_LOYALTY_MEMBERS: LoyaltyMember[] = [];

const DEFAULT_LIFESTYLE_POSTS: LifestylePost[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop",
    username: "caffeine.journal",
    likes: 432,
    commentsCount: 3,
    caption: "Morning rituals at Antonioni Grounds. That golden hour sunlight hitting the perfect brew. ☕️✨ #antonionilifestyle #coffeeaesthetic #morningglow",
    date: "2026-07-09",
    location: "Antonioni Grounds • Tokyo",
    comments: [
      { id: 1, username: "espresso.chaser", text: "This lighting is absolutely gorgeous! 😍", time: "1h ago" },
      { id: 2, username: "brew_master", text: "Is that the Panama Geisha?", time: "45m ago" },
      { id: 3, username: "antonioni_grounds", text: "It is! Sourced directly from Boquete estate.", time: "30m ago" },
    ]
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=600&auto=format&fit=crop",
    username: "espresso_aficionado",
    likes: 198,
    commentsCount: 2,
    caption: "First crack micro-lots. The craftsmanship here is unmatched. You can taste the strawberry notes immediately. 🍓☕️ #craftcoffee #specialtycoffee",
    date: "2026-07-09",
    location: "Antonioni HQ • Brooklyn",
    comments: [
      { id: 1, username: "bean_selector", text: "Light roast is the way to go.", time: "4h ago" },
      { id: 2, username: "coffeelover_ny", text: "Heading to Brooklyn headquarters tomorrow!", time: "2h ago" },
    ]
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
    username: "tokyo.coffee.guide",
    likes: 312,
    commentsCount: 2,
    caption: "Found my new favorite coffee sanctuary. Japanese minimalism meets Brooklyn roasting. 🇯🇵🇺🇸 Absolute peace. #tokyocafe #minimalism #coffeeplease",
    date: "2026-07-08",
    location: "Antonioni Grounds • Tokyo",
    comments: [
      { id: 1, username: "travel_eats", text: "Adding this to my itinerary for next month!", time: "18h ago" },
      { id: 2, username: "minimalist_vibes", text: "That interior is so soothing.", time: "12h ago" },
    ]
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=600&auto=format&fit=crop",
    username: "barista.artisan",
    likes: 285,
    commentsCount: 2,
    caption: "Golden extraction. Water temperature at exactly 92°C for that crisp fruit sweetness. Precision makes perfection. 🌡️☕️ #baristalife #espresso #extraction",
    date: "2026-07-07",
    location: "Antonioni Grounds • NY",
    comments: [
      { id: 1, username: "extraction_nerd", text: "What brew ratio are you running here?", time: "1d ago" },
      { id: 2, username: "barista.artisan", text: "1:16 ratio, perfect balance.", time: "1d ago" },
    ]
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop",
    username: "antonioni_grounds",
    likes: 512,
    commentsCount: 2,
    caption: "Slow drip chemistry. Witness the bloom of our Ethiopian heirloom microlot. Carbon dioxide escaping, unlocking floral aromatics. 🌸🧪 #dripcoffee #scentofcoffee",
    date: "2026-07-06",
    location: "Antonioni Grounds • Paris",
    comments: [
      { id: 1, username: "fragrance_lover", text: "I can smell this photo! 🌸", time: "2d ago" },
      { id: 2, username: "syphon_brew", text: "Beautiful bloom capture.", time: "2d ago" },
    ]
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
    const items = getLocalStorageItem("menu_items", defaultMenuItems);

    // Auto-merge logic: if defaults have items not present in localStorage, merge them.
    // This allows new signature drinks or modified defaults to sync automatically.
    if (isBrowser && Array.isArray(items)) {
      let updated = false;
      const merged = [...items];
      defaultMenuItems.forEach((defItem) => {
        if (!merged.some((item) => item.id === defItem.id)) {
          merged.push(defItem);
          updated = true;
        }
      });
      if (updated) {
        setLocalStorageItem("menu_items", merged);
        return merged;
      }
    }
    return items;
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
    const members = getLocalStorageItem("loyalty_members", DEFAULT_LOYALTY_MEMBERS);
    const mockIds = ["AG-882-901", "AG-102-902", "AG-203-903", "LN-882-901", "LN-102-902", "LN-203-903"];
    const filtered = members.filter((m) => !mockIds.includes(m.id));
    if (filtered.length !== members.length) {
      setLocalStorageItem("loyalty_members", filtered);
      return filtered;
    }
    return members;
  },

  saveLoyaltyMember(member: LoyaltyMember): void {
    const members = this.getLoyaltyMembers();
    // Match by ID first, then by email as fallback (handles ID migration scenarios)
    let index = members.findIndex((m) => m.id === member.id);
    if (index < 0) {
      index = members.findIndex((m) => m.email.toLowerCase() === member.email.toLowerCase());
    }
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    setLocalStorageItem("loyalty_members", members);
    if (isBrowser) window.dispatchEvent(new Event("storage"));

    // Sync updates to Supabase database in background
    if (isBrowser) {
      import("./supabase").then(({ supabase }) => {
        if (supabase) {
          supabase
            .from("profiles")
            .update({
              name: member.name,
              points: member.points,
              member_id: member.id
            })
            .eq("email", member.email.toLowerCase())
            .then(({ error }) => {
              if (error) {
                console.error("Error syncing loyalty member update to Supabase:", error);
              }
            });
        }
      });
    }
  },

  deleteLoyaltyMember(id: string): void {
    const members = this.getLoyaltyMembers();
    const filtered = members.filter((m) => m.id !== id);
    setLocalStorageItem("loyalty_members", filtered);
    if (isBrowser) window.dispatchEvent(new Event("storage"));

    // Sync deletion to Supabase
    if (isBrowser) {
      import("./supabase").then(({ supabase }) => {
        if (supabase) {
          supabase
            .from("profiles")
            .delete()
            .eq("id", id)
            .then(({ error }) => {
              if (error) {
                console.error("Error syncing loyalty member deletion to Supabase:", error);
              }
            });
        }
      });
    }
  },

  // --- MOCK USERS (for offline console management) ---
  getMockUsers(): UserProfile[] {
    if (!isBrowser) return [];
    const localUsers = localStorage.getItem("mock_users");
    if (localUsers) {
      try {
        return JSON.parse(localUsers);
      } catch (e) {
        console.error("Error parsing mock_users, resetting...", e);
      }
    }
    
    // Default seed
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@coffee.com";
    const seed: UserProfile[] = [
      {
        id: "admin-mock-1",
        name: "Maître D' Admin",
        username: "admin",
        email: adminEmail,
        role: "admin",
        joinedAt: "2026-07-01",
      }
    ];

    // Merge in current loyalty members as customers
    const members = this.getLoyaltyMembers();
    members.forEach((m) => {
      seed.push({
        id: m.id,
        name: m.name,
        username: m.email.split("@")[0],
        email: m.email,
        role: "customer",
        stamps: m.stamps,
        points: m.points,
        member_id: m.id,
        joinedAt: m.joinedAt || "2026-07-09",
      });
    });

    setLocalStorageItem("mock_users", seed);
    return seed;
  },

  saveMockUser(user: UserProfile): void {
    if (!isBrowser) return;
    const users = this.getMockUsers();
    const index = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    setLocalStorageItem("mock_users", users);
    window.dispatchEvent(new Event("storage"));
  },

  deleteMockUser(id: string): void {
    if (!isBrowser) return;
    const users = this.getMockUsers();
    const filtered = users.filter((u) => u.id !== id);
    setLocalStorageItem("mock_users", filtered);
    window.dispatchEvent(new Event("storage"));
  },

  getLifestylePosts(): LifestylePost[] {
    if (isBrowser && !localStorage.getItem("lifestyle_posts")) {
      setLocalStorageItem("lifestyle_posts", DEFAULT_LIFESTYLE_POSTS);
    }
    return getLocalStorageItem("lifestyle_posts", DEFAULT_LIFESTYLE_POSTS);
  },

  getDefaultLifestylePosts(): LifestylePost[] {
    return DEFAULT_LIFESTYLE_POSTS;
  },

  saveLifestylePost(post: LifestylePost): void {
    const posts = this.getLifestylePosts();
    const index = posts.findIndex((p) => p.id === post.id);
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.push(post);
    }
    setLocalStorageItem("lifestyle_posts", posts);
    if (isBrowser) window.dispatchEvent(new Event("storage"));

    // Sync updates to Supabase in background
    if (isBrowser) {
      import("./supabase").then(({ supabase }) => {
        if (supabase) {
          supabase
            .from("lifestyle_posts")
            .upsert({
              id: post.id,
              imageUrl: post.imageUrl,
              username: post.username,
              likes: post.likes,
              caption: post.caption,
              date: post.date,
              location: post.location,
              comments: post.comments,
              commentsCount: post.comments.length
            })
            .then(({ error }) => {
              if (error) {
                console.error("Error syncing lifestyle post update to Supabase:", error);
              }
            });
        }
      });
    }
  },

  deleteLifestylePost(id: number): void {
    const posts = this.getLifestylePosts();
    const filtered = posts.filter((p) => p.id !== id);
    setLocalStorageItem("lifestyle_posts", filtered);
    if (isBrowser) window.dispatchEvent(new Event("storage"));

    // Sync deletion to Supabase
    if (isBrowser) {
      import("./supabase").then(({ supabase }) => {
        if (supabase) {
          supabase
            .from("lifestyle_posts")
            .delete()
            .eq("id", id)
            .then(({ error }) => {
              if (error) {
                console.error("Error syncing lifestyle post deletion to Supabase:", error);
              }
            });
        }
      });
    }
  },

  // --- DATABASE RESET ---
  resetDatabase(): void {
    if (!isBrowser) return;
    localStorage.removeItem("menu_items");
    localStorage.removeItem("reservations");
    localStorage.removeItem("loyalty_members");
    localStorage.removeItem("mock_users");
    localStorage.removeItem("lifestyle_posts");
    // Reseed
    this.getMenuItems();
    this.getReservations();
    this.getLoyaltyMembers();
    this.getMockUsers();
    this.getLifestylePosts();
    window.dispatchEvent(new Event("storage"));
  }
};
