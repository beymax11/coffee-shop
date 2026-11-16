import { db } from "@/utils/db";
import { supabase } from "@/utils/supabase";
import { getNextLocalLoyaltyCardId } from "@/lib/id-generator";
import { setCookie, eraseCookie } from "@/utils/cookies";
import { initAdminClientSession } from "@/utils/admin-session-client";

interface LoginUserLike {
  id: string;
  email?: string | null;
}

interface LoyaltyCardRow {
  id?: string;
  stamps?: number;
  points?: number;
}

interface ProfileWithCard {
  name?: string | null;
  username?: string | null;
  created_at?: string | null;
  loyalty_cards?: LoyaltyCardRow | LoyaltyCardRow[] | null;
}

/**
 * Resolves a username or email input into the email address used for sign-in.
 */
export async function resolveLoginEmail(identifier: string): Promise<string> {
  const trimmed = identifier.trim();
  if (!trimmed) return "";

  if (supabase) {
    // Skip username lookup when the input already looks like an email address.
    if (!trimmed.includes("@")) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", trimmed)
          .single();

        if (profile?.email) {
          return profile.email;
        }
      } catch {
        // Fall back to input text if no matching username profile is found
      }
    }
    return trimmed;
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@coffee.com";
  if (trimmed.toLowerCase() === "admin") {
    return adminEmail;
  }
  return trimmed;
}

/**
 * Clears all admin cookies and localStorage session keys so a subsequent
 * customer sign-in never gets treated as an admin session.
 */
export function clearAdminSessionState(): void {
  eraseCookie("admin_session");
  eraseCookie("admin_role");
  eraseCookie("admin_session_id");
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_profile");
    localStorage.removeItem("admin_session_id");
  }
}

/**
 * Persists customer auth cookies, localStorage session, and local loyalty cache
 * synchronously so post-login redirect can proceed immediately without stalling.
 */
export function persistCustomerLoginSession(params: {
  user: LoginUserLike;
  profile?: ProfileWithCard | null;
  accessToken?: string;
}): void {
  const { user, profile, accessToken } = params;

  clearAdminSessionState();

  const customerIdent = user.email || user.id || "customer_active";
  localStorage.setItem("customer_session", customerIdent);
  setCookie("customer_session", "true", 7);
  if (accessToken) {
    setCookie("sb-access-token", accessToken, 7);
  }

  const members = db.getLoyaltyMembers();
  const existingMember = members.find(
    (m) => m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase()
  );

  const rawCard = profile?.loyalty_cards;
  const loyaltyCard = Array.isArray(rawCard) ? rawCard[0] : rawCard;

  if (existingMember) {
    if (profile) {
      let memberIdToUse = loyaltyCard?.id || existingMember.id;
      if (!memberIdToUse || memberIdToUse.length > 20) {
        memberIdToUse = getNextLocalLoyaltyCardId(members.map((m) => m.id));
      }
      existingMember.id = memberIdToUse;
      existingMember.stamps = loyaltyCard?.stamps ?? existingMember.stamps;
      existingMember.points = loyaltyCard?.points ?? existingMember.points;
      existingMember.name = profile.name ?? existingMember.name;
      existingMember.username = profile.username ?? existingMember.username;
      db.saveLoyaltyMember(existingMember);
    }
    localStorage.setItem("customer_session", existingMember.email || customerIdent);
  } else {
    const displayName = profile?.name || user.email?.split("@")[0] || "Member";
    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    let memberIdToUse = loyaltyCard?.id;
    if (!memberIdToUse || memberIdToUse.length > 20) {
      memberIdToUse = getNextLocalLoyaltyCardId(members.map((m) => m.id));
    }

    db.saveLoyaltyMember({
      id: memberIdToUse,
      name: capitalizedName,
      username: profile?.username || "",
      email: user.email || "",
      phone: "",
      stamps: loyaltyCard?.stamps || 0,
      points: loyaltyCard?.points || 0,
      joinedAt: profile?.created_at
        ? new Date(profile.created_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    localStorage.setItem("customer_session", customerIdent);
  }

  window.dispatchEvent(new Event("storage"));
}

/**
 * Persists staff/admin auth cookies, localStorage profile, and dual-token
 * single-active-session tracking before redirecting to /admin.
 */
export async function persistStaffLoginSession(params: {
  userId: string;
  email: string;
  role: "admin" | "barista";
  name: string;
  accessToken?: string;
}): Promise<void> {
  const { userId, email, role, name, accessToken } = params;

  localStorage.setItem("admin_session", "true");
  localStorage.setItem("admin_profile", JSON.stringify({ name, email, role }));
  localStorage.removeItem("customer_session");
  eraseCookie("customer_session");
  setCookie("admin_session", "true", 7);
  setCookie("admin_role", role, 7);
  if (accessToken) {
    setCookie("sb-access-token", accessToken, 7);
  } else {
    eraseCookie("sb-access-token");
  }

  const sessionData = await initAdminClientSession({
    userId,
    email,
    role,
    name,
    accessToken,
  });
  if (sessionData?.role) {
    setCookie("admin_role", sessionData.role, 7);
    localStorage.setItem(
      "admin_profile",
      JSON.stringify({
        name,
        email,
        role: sessionData.role,
      })
    );
  }

  window.dispatchEvent(new Event("storage"));
}
