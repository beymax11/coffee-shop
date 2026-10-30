import type { SupabaseClient } from "@supabase/supabase-js";

const MOCK_IDS = new Set([
  "AG-882-901",
  "AG-102-902",
  "AG-203-903",
  "LN-882-901",
  "LN-102-902",
  "LN-203-903",
]);

/**
 * Formats a positive integer (1, 2, 3...) into sequential "AG-XXX-XXX" format
 * starting at "AG-000-001".
 */
export function formatLoyaltyCardId(seqNumber: number): string {
  const safeNum = Math.max(1, Math.floor(seqNumber));
  const padded = String(safeNum).padStart(6, "0");
  const part1 = padded.slice(0, 3);
  const part2 = padded.slice(3, 6);
  return `AG-${part1}-${part2}`;
}

/**
 * Parses an "AG-XXX-XXX" card ID into its numeric sequence value (e.g. "AG-000-001" -> 1).
 */
export function parseLoyaltyCardSeq(id: string): number | null {
  if (!id || MOCK_IDS.has(id.toUpperCase())) return null;
  const match = /^AG-(\d{3})-(\d{3})$/i.exec(id.trim());
  if (!match) return null;
  const num = parseInt(`${match[1]}${match[2]}`, 10);
  return Number.isNaN(num) || num < 1 ? null : num;
}

/**
 * Computes the next sequential loyalty card ID ("AG-000-001", "AG-000-002", ...)
 * from a list of existing IDs.
 */
export function getNextLocalLoyaltyCardId(existingIds: string[] = []): string {
  const usedIds = new Set<string>();

  for (const rawId of existingIds) {
    if (rawId) usedIds.add(rawId.trim().toUpperCase());
  }

  if (typeof window !== "undefined") {
    try {
      const rawMembers = localStorage.getItem("loyalty_members");
      if (rawMembers) {
        const parsed = JSON.parse(rawMembers);
        if (Array.isArray(parsed)) {
          for (const m of parsed) {
            if (m?.id) usedIds.add(String(m.id).trim().toUpperCase());
          }
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }

  let maxSeq = 0;
  for (const id of usedIds) {
    const seq = parseLoyaltyCardSeq(id);
    // Ignore legacy random IDs (which always started at >= 100-100, i.e. >= 100100)
    // unless the sequential count has genuinely reached that range.
    if (seq !== null && (seq < 100000 || usedIds.size >= 99999)) {
      if (seq > maxSeq) maxSeq = seq;
    }
  }

  let nextSeq = maxSeq + 1;
  while (usedIds.has(formatLoyaltyCardId(nextSeq))) {
    nextSeq++;
  }

  return formatLoyaltyCardId(nextSeq);
}

/**
 * Generates the next sequential loyalty card ID (starting from "AG-000-001")
 * verified against Supabase `loyalty_cards` when a client is provided.
 */
export async function generateUniqueLoyaltyCardId(
  supabaseAdmin?: SupabaseClient | null,
  existingIds: string[] = []
): Promise<string> {
  const collectedIds = [...existingIds];

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("loyalty_cards")
        .select("id");

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          if (row?.id) collectedIds.push(String(row.id));
        }
      }
    } catch {
      // Fall back to local IDs if query fails
    }
  }

  return getNextLocalLoyaltyCardId(collectedIds);
}

/**
 * Generates a cryptographically random reservation reference (e.g. "LN-X89K2P").
 */
export function generateReservationReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed easily confused characters (I, O, 0, 1)
  const randomBytes = new Uint32Array(6);
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 6; i++) {
      randomBytes[i] = Math.floor(Math.random() * chars.length);
    }
  }
  let code = "LN-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(randomBytes[i] % chars.length);
  }
  return code;
}

