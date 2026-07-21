import { supabase } from "./supabase";
import { getCachedData, invalidateCache } from "./cache";

/**
 * Fetches the current maintenance mode status.
 * If Supabase is active, it queries the `system_settings` table.
 * If Supabase is inactive, it falls back to localStorage.
 */
export const getMaintenanceMode = async (): Promise<boolean> => {
  return getCachedData("maintenance_mode", async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("value")
          .eq("key", "maintenance_mode")
          .single();

        if (!error && data) {
          // Handle both raw boolean and stringified representation
          return data.value === true || data.value === "true";
        }
      } catch (err) {
        console.warn("Failed to fetch maintenance mode from Supabase, falling back to localStorage:", err);
      }
    }

    if (typeof window !== "undefined") {
      return localStorage.getItem("maintenance_mode") === "true";
    }
    return false;
  }, { ttl: 30000 });
};

/**
 * Sets the maintenance mode status in the database and local storage.
 */
export const setMaintenanceMode = async (active: boolean): Promise<void> => {
  invalidateCache("maintenance_mode");
  if (typeof window !== "undefined") {
    localStorage.setItem("maintenance_mode", active ? "true" : "false");
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
        console.error("Error updating maintenance mode in Supabase settings table:", error);
      }
    } catch (err) {
      console.error("Failed to update maintenance mode in Supabase:", err);
    }
  }
};
