import { supabase } from "./supabase";
import { getCachedData, invalidateCache } from "./cache";

const COOKIE_NAME = "maintenance_mode";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Fetches the current maintenance mode status.
 * Checks localStorage and cookies first for instant response,
 * and syncs with Supabase if system_settings table is present.
 */
export const getMaintenanceMode = async (forceRefresh = false): Promise<boolean> => {
  if (forceRefresh) {
    invalidateCache("maintenance_mode");
  }

  // 1. Prioritize database query when Supabase is active
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .single();

      if (!error && data !== null && data !== undefined) {
        const isVal = data.value === true || data.value === "true" || data.value === 1 || data.value === "1";
        if (typeof window !== "undefined") {
          localStorage.setItem("maintenance_mode", isVal ? "true" : "false");
          setCookie(COOKIE_NAME, isVal ? "true" : "false");
        }
        return isVal;
      }
    } catch (err) {
      console.warn("Notice: Failed to query maintenance_mode from Supabase:", err);
    }
  }

  // 2. Fallback to localStorage & Cookie when Supabase is not available
  if (typeof window !== "undefined") {
    const localVal = localStorage.getItem("maintenance_mode");
    const cookieVal = getCookie(COOKIE_NAME);
    return localVal === "true" || cookieVal === "true";
  }

  return false;
};

/**
 * Sets the maintenance mode status in the database, local storage, and cookies.
 */
export const setMaintenanceMode = async (active: boolean): Promise<void> => {
  invalidateCache("maintenance_mode");
  if (typeof window !== "undefined") {
    const strVal = active ? "true" : "false";
    localStorage.setItem("maintenance_mode", strVal);
    setCookie(COOKIE_NAME, strVal);
    window.dispatchEvent(new CustomEvent("maintenance_mode_changed", { detail: active }));
    window.dispatchEvent(new Event("storage"));
  }

  if (supabase) {
    try {
      const { error } = await supabase
        .from("system_settings")
        .upsert(
          { key: "maintenance_mode", value: active },
          { onConflict: "key" }
        );

      if (error) {
        console.warn("Notice: Supabase system_settings upsert error (falling back to local storage):", error.message);
      }
    } catch (err) {
      console.warn("Failed to update maintenance mode in Supabase:", err);
    }
  }
};


