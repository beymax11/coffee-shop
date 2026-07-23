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

/**
 * Fetches the current Home Hero configuration.
 * Prioritizes Supabase DB query when available.
 */
export const getHeroConfig = async (forceRefresh = false): Promise<HomeHeroConfig> => {
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
        if (typeof window !== "undefined") {
          localStorage.setItem("home_hero_config", JSON.stringify(fullConfig));
        }
        return fullConfig;
      }
    } catch (err) {
      console.warn("Notice: Failed to fetch home_hero_config from Supabase:", err);
    }
  }

  // 2. Fallback to localStorage if Supabase is not available or errored
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("home_hero_config");
    if (saved) {
      try {
        return { ...DEFAULT_HERO_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Error parsing local hero config:", e);
      }
    }
  }

  return DEFAULT_HERO_CONFIG;
};

/**
 * Saves the Home Hero configuration.
 */
export const setHeroConfig = async (config: HomeHeroConfig): Promise<void> => {
  invalidateCache("hero_config");
  if (typeof window !== "undefined") {
    localStorage.setItem("home_hero_config", JSON.stringify(config));
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
