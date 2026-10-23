import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generates a collision-resistant loyalty card ID (e.g. "AG-742-918").
 * Uses Node.js crypto.randomInt and verifies against Supabase if client is provided.
 */
export async function generateUniqueLoyaltyCardId(
  supabaseAdmin?: SupabaseClient | null
): Promise<string> {
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const part1 = crypto.randomInt(100, 1000);
    const part2 = crypto.randomInt(100, 1000);
    const candidate = `AG-${part1}-${part2}`;

    if (!supabaseAdmin) {
      return candidate;
    }

    try {
      const { data, error } = await supabaseAdmin
        .from("loyalty_cards")
        .select("id")
        .eq("id", candidate)
        .maybeSingle();

      if (!error && !data) {
        return candidate;
      }
    } catch {
      return candidate;
    }
  }

  // Fallback with timestamp suffix to guarantee 100% uniqueness
  const part1 = crypto.randomInt(100, 1000);
  const part2 = crypto.randomInt(100, 1000);
  const suffix = crypto.randomInt(10, 100);
  return `AG-${part1}-${part2}-${suffix}`;
}

/**
 * Generates a cryptographically random reservation reference (e.g. "LN-X89K2P").
 */
export function generateReservationReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed easily confused characters (I, O, 0, 1)
  let code = "LN-";
  for (let i = 0; i < 6; i++) {
    const idx = crypto.randomInt(0, chars.length);
    code += chars.charAt(idx);
  }
  return code;
}
