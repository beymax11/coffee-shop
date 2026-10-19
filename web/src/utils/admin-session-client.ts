/**
 * Client-side helper for initializing an admin session with single active session tracking,
 * 15-minute access token, and 7-day refresh token.
 */
export async function initAdminClientSession(params: {
  userId?: string;
  email: string;
  role: "admin" | "barista";
  name: string;
}) {
  try {
    const res = await fetch("/api/auth/admin-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: params.userId || "admin-user",
        email: params.email,
        role: params.role,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_session_id", data.sessionId);
        localStorage.setItem("admin_access_exp", String(data.accessExpiresAt));
        localStorage.setItem("admin_refresh_exp", String(data.refreshExpiresAt));

        // Immediately notify other tabs in the same browser via BroadcastChannel
        try {
          const bc = new BroadcastChannel("admin_session_bus");
          bc.postMessage({
            type: "KICKOUT",
            targetEmail: params.email,
            newSessionId: data.sessionId,
          });
          bc.close();
        } catch {
          // BroadcastChannel fallback handled by storage event
        }
      }
      return data;
    }
  } catch (err) {
    console.error("[Admin Client Session] Failed to initialize:", err);
  }
  return null;
}
