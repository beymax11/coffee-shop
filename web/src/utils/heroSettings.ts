import { supabase } from "./supabase";
import { getCachedData, invalidateCache } from "./cache";

export interface HomeHeroConfig {
  eyebrowText: string;
  headlineMain: string;
  headlineHighlight: string;
  subcopy: string;
  bgImageUrl: string;
}

export const DEFAULT_HERO_CONFIG: HomeHeroConfig = {
  eyebrowText: "Welcome to Antonioni Grounds",
  headlineMain: "Where Every Cup",
  headlineHighlight: "Finds Its Story",
  subcopy: "Experience handcrafted coffee, thoughtfully prepared with quality beans, warm hospitality, and a space made for meaningful moments.",
  bgImageUrl: "/hero.png",
};

let memoryHeroConfig: HomeHeroConfig | null = null;

/**
 * Synchronously retrieves cached hero config if available in memory or localStorage.
 */
export const getSyncHeroConfig = (): HomeHeroConfig | null => {
  if (memoryHeroConfig) return memoryHeroConfig;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("home_hero_config");
      if (saved) {
        return { ...DEFAULT_HERO_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Error parsing local hero config:", e);
    }
  }
  return null;
};

/**
 * Fetches the current Home Hero configuration.
 * Prioritizes Supabase DB query when available.
 */
export const getHeroConfig = async (forceRefresh = false): Promise<HomeHeroConfig> => {
  if (memoryHeroConfig && !forceRefresh) {
    return memoryHeroConfig;
  }

  if (forceRefresh) {
    invalidateCache("hero_config");
  }

  // 1. Query Supabase system_settings table first if connected
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "home_hero_config")
        .single();

      if (!error && data !== null && data !== undefined && data.value) {
        const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        const fullConfig = { ...DEFAULT_HERO_CONFIG, ...parsed };
        memoryHeroConfig = fullConfig;
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("home_hero_config", JSON.stringify(fullConfig));
          } catch (e) {
            console.warn("Notice: Could not write home_hero_config to localStorage, clearing stale item:", e);
            try {
              localStorage.removeItem("home_hero_config");
            } catch (clearErr) {}
          }
        }
        return fullConfig;
      }
    } catch (err) {
      console.warn("Notice: Failed to fetch home_hero_config from Supabase:", err);
    }
  }

  // 2. Fallback to localStorage if Supabase is not available or errored
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("home_hero_config");
      if (saved) {
        const fullConfig = { ...DEFAULT_HERO_CONFIG, ...JSON.parse(saved) };
        memoryHeroConfig = fullConfig;
        return fullConfig;
      }
    } catch (e) {
      console.error("Error parsing local hero config:", e);
    }
  }

  return DEFAULT_HERO_CONFIG;
};

/**
 * Saves the Home Hero configuration.
 */
export const setHeroConfig = async (config: HomeHeroConfig): Promise<void> => {
  memoryHeroConfig = config;
  invalidateCache("hero_config");
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("home_hero_config", JSON.stringify(config));
    } catch (err: any) {
      console.warn("localStorage quota warning when setting home_hero_config:", err);
      // Attempt quota recovery by trimming audit logs or older storage items
      try {
        const storedLogs = localStorage.getItem("audit_logs");
        if (storedLogs) {
          const logs = JSON.parse(storedLogs);
          if (Array.isArray(logs) && logs.length > 20) {
            localStorage.setItem("audit_logs", JSON.stringify(logs.slice(0, 20)));
          }
        }
        localStorage.setItem("home_hero_config", JSON.stringify(config));
      } catch (retryErr) {
        console.warn("Retry saving home_hero_config to localStorage failed; relying on memory/database:", retryErr);
        try {
          localStorage.removeItem("home_hero_config");
        } catch (clearErr) {}
      }
    }
    window.dispatchEvent(new CustomEvent("hero_config_changed", { detail: config }));
    window.dispatchEvent(new Event("storage"));
  }

  if (supabase) {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("system_settings")
        .upsert(
          { 
            key: "home_hero_config", 
            value: config,
            updated_at: now
          },
          { onConflict: "key" }
        );

      if (error) {
        // If updated_at trigger is missing or column error occurs, retry basic upsert
        if (error.message?.includes("updated_at")) {
          const { error: retryErr } = await supabase
            .from("system_settings")
            .upsert(
              { key: "home_hero_config", value: config },
              { onConflict: "key" }
            );

          if (retryErr) {
            console.warn("Notice: Retry upsert error:", retryErr.message);
          } else {
            console.log("Successfully saved hero config on retry!");
          }
        } else {
          console.warn("Notice: Supabase system_settings upsert error:", error.message);
        }
      } else {
        console.log("Successfully saved hero config to Supabase system_settings!");
      }
    } catch (err) {
      console.warn("Failed to update hero config in Supabase:", err);
    }
  }
};
