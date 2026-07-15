import { supabase } from "@/utils/supabase";

export interface NotificationItem {
  id: string;
  email: string;
  title: string;
  message: string;
  unread: boolean;
  type: "reservation" | "loyalty" | "system";
  created_at: string;
}

// LocalStorage helpers for offline fallback
const getLocalNotifications = (email: string): NotificationItem[] => {
  if (typeof window === "undefined" || !email) return [];
  try {
    const stored = localStorage.getItem(`customer_notifications_${email.toLowerCase()}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalNotifications = (email: string, notifs: NotificationItem[]): void => {
  if (typeof window === "undefined" || !email) return;
  try {
    localStorage.setItem(`customer_notifications_${email.toLowerCase()}`, JSON.stringify(notifs));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Local storage save error", e);
  }
};

export const notificationsService = {
  /**
   * Fetches all notifications for a specific customer email, sorted by created_at descending.
   */
  async fetchNotifications(email: string): Promise<NotificationItem[]> {
    if (!email) return [];
    
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("email", email.toLowerCase())
          .order("created_at", { ascending: false });
          
        if (!error && data) {
          // Map backend schema (created_at string) to NotificationItem
          return data.map((item: any) => ({
            id: item.id,
            email: item.email,
            title: item.title,
            message: item.message,
            unread: item.unread,
            type: item.type || "system",
            created_at: item.created_at,
          }));
        }
        console.warn("Supabase fetch notifications error, using local fallback:", error);
      } catch (err) {
        console.warn("Supabase fetch notifications exception, using local fallback:", err);
      }
    }
    
    return getLocalNotifications(email);
  },

  /**
   * Inserts a new notification for a user email.
   */
  async addNotification(
    email: string,
    title: string,
    message: string,
    type: "reservation" | "loyalty" | "system" = "system"
  ): Promise<void> {
    if (!email) return;
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from("notifications")
          .insert([
            {
              email: email.toLowerCase(),
              title,
              message,
              unread: true,
              type,
            }
          ]);
          
        if (!error) {
          // Trigger a local storage storage event so other tabs refresh
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("storage"));
          }
          return;
        }
        console.warn("Supabase add notification error, using local fallback:", error);
      } catch (err) {
        console.warn("Supabase add notification exception, using local fallback:", err);
      }
    }
    
    // Fallback
    const localNotifs = getLocalNotifications(email);
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substring(2, 11),
      email: email.toLowerCase(),
      title,
      message,
      unread: true,
      type,
      created_at: new Date().toISOString(),
    };
    localNotifs.unshift(newNotif);
    saveLocalNotifications(email, localNotifs);
  },

  /**
   * Marks a specific notification as read.
   */
  async markAsRead(id: string, email?: string): Promise<void> {
    if (!id) return;
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ unread: false })
          .eq("id", id);
          
        if (!error) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("storage"));
          }
          return;
        }
        console.warn("Supabase markAsRead error, using local fallback:", error);
      } catch (err) {
        console.warn("Supabase markAsRead exception, using local fallback:", err);
      }
    }
    
    // Fallback
    if (email) {
      const localNotifs = getLocalNotifications(email);
      const updated = localNotifs.map(n => n.id === id ? { ...n, unread: false } : n);
      saveLocalNotifications(email, updated);
    }
  },

  /**
   * Marks all notifications as read for a specific customer email.
   */
  async markAllAsRead(email: string): Promise<void> {
    if (!email) return;
    
    if (supabase) {
      try {
        const { error } = await supabase
          .from("notifications")
          .update({ unread: false })
          .eq("email", email.toLowerCase())
          .eq("unread", true);
          
        if (!error) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("storage"));
          }
          return;
        }
        console.warn("Supabase markAllAsRead error, using local fallback:", error);
      } catch (err) {
        console.warn("Supabase markAllAsRead exception, using local fallback:", err);
      }
    }
    
    // Fallback
    const localNotifs = getLocalNotifications(email);
    const updated = localNotifs.map(n => ({ ...n, unread: false }));
    saveLocalNotifications(email, updated);
  }
};
