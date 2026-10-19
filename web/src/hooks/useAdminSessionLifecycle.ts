"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { eraseCookie, getCookie } from "@/utils/cookies";

export interface SessionLifecycleState {
  isKickedOut: boolean;
  isExpired: boolean;
  kickoutReason: string;
  timeUntilAccessExpirySeconds: number;
  timeUntilHardExpiryDays: number;
  refreshAccessToken: () => Promise<boolean>;
}

export function useAdminSessionLifecycle(currentUserEmail?: string): SessionLifecycleState {
  const router = useRouter();
  const [isKickedOut, setIsKickedOut] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [kickoutReason, setKickoutReason] = useState("");
  const [timeUntilAccessExpirySeconds, setTimeUntilAccessExpiry] = useState<number>(900);
  const [timeUntilHardExpiryDays, setTimeUntilHardExpiry] = useState<number>(7);

  const isRefreshingRef = useRef(false);
  const currentEmailRef = useRef(currentUserEmail);
  currentEmailRef.current = currentUserEmail;

  // Cleanup helper
  const performLocalLogout = useCallback(() => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_profile");
    localStorage.removeItem("admin_session_id");
    localStorage.removeItem("admin_access_exp");
    localStorage.removeItem("admin_refresh_exp");
    localStorage.removeItem("admin_active_tab");

    eraseCookie("admin_session");
    eraseCookie("admin_role");
    eraseCookie("admin_access_token");
    eraseCookie("admin_refresh_token");
    eraseCookie("admin_session_id");
    eraseCookie("sb-access-token");

    window.dispatchEvent(new Event("storage"));
  }, []);

  // Silent refresh token caller
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) return false;
    isRefreshingRef.current = true;

    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) {
        const data = await res.json();
        if (data.kickedOut) {
          setIsKickedOut(true);
          setKickoutReason(
            data.error ||
              "Your session was terminated because this account was logged in from another device."
          );
          performLocalLogout();
          return false;
        }

        if (data.expired) {
          setIsExpired(true);
          performLocalLogout();
          return false;
        }
      }

      if (!res.ok) {
        return false;
      }

      const data = await res.json();
      if (data.success && data.accessExpiresAt) {
        localStorage.setItem("admin_access_exp", String(data.accessExpiresAt));
        if (data.refreshExpiresAt) {
          localStorage.setItem("admin_refresh_exp", String(data.refreshExpiresAt));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("[Session Lifecycle] Failed to refresh token:", err);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [performLocalLogout]);

  // 1. REAL-TIME KICKOUT LISTENER (Supabase Realtime Channel + BroadcastChannel)
  useEffect(() => {
    const email = currentEmailRef.current || "";
    const localSessionId =
      localStorage.getItem("admin_session_id") ||
      getCookie("admin_session_id");

    if (!localSessionId) return;

    // Cross-tab broadcast channel for instant multi-tab sync
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("admin_session_bus");
      bc.onmessage = (event) => {
        if (event.data?.type === "KICKOUT") {
          const { targetEmail, newSessionId } = event.data;
          if (
            targetEmail &&
            email &&
            targetEmail.toLowerCase() === email.toLowerCase() &&
            newSessionId !== localSessionId
          ) {
            setIsKickedOut(true);
            setKickoutReason(
              "Your session was terminated because this account logged in from another tab or window."
            );
            performLocalLogout();
          }
        }
      };
    } catch {
      // BroadcastChannel not supported in some older environments
    }

    // Supabase Realtime Channel for Cross-Device Push
    let channel: any = null;
    if (supabase) {
      try {
        channel = supabase.channel("admin-session-channel");
        channel
          .on("broadcast", { event: "KICKOUT" }, (payload: any) => {
            const data = payload?.payload;
            if (data) {
              const targetEmail = data.email?.toLowerCase();
              const activeEmail = currentEmailRef.current?.toLowerCase();
              if (
                targetEmail &&
                activeEmail &&
                targetEmail === activeEmail &&
                data.newSessionId !== localSessionId
              ) {
                setIsKickedOut(true);
                setKickoutReason(
                  "Your session was terminated because another user logged into this admin account from another device."
                );
                performLocalLogout();
              }
            }
          })
          .subscribe();
      } catch (err) {
        console.warn("[Session Lifecycle] Could not connect to realtime channel:", err);
      }
    }

    // Periodic Server Heartbeat (every 25 seconds) to catch missed socket events
    const heartbeatTimer = setInterval(async () => {
      const activeEmail = currentEmailRef.current;
      const activeSessionId =
        localStorage.getItem("admin_session_id") ||
        getCookie("admin_session_id");

      if (!activeEmail || !activeSessionId) return;

      try {
        const res = await fetch(
          `/api/auth/admin-session?email=${encodeURIComponent(
            activeEmail
          )}&sessionId=${encodeURIComponent(activeSessionId)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.active === false) {
            setIsKickedOut(true);
            setKickoutReason(
              "Your session is no longer active. Another login was detected."
            );
            performLocalLogout();
          }
        }
      } catch {
        // Network blip, ignore
      }
    }, 25000);

    return () => {
      clearInterval(heartbeatTimer);
      if (bc) bc.close();
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [performLocalLogout]);

  // 2. AUTOMATIC 15-MINUTE ACCESS TOKEN REFRESH & 7-DAY HARD EXPIRY TRACKER
  useEffect(() => {
    const checkExpiryAndAutoRefresh = async () => {
      const now = Date.now();
      const accessExpStr = localStorage.getItem("admin_access_exp");
      const refreshExpStr = localStorage.getItem("admin_refresh_exp");

      const accessExp = accessExpStr ? parseInt(accessExpStr, 10) : now + 15 * 60 * 1000;
      const refreshExp = refreshExpStr ? parseInt(refreshExpStr, 10) : now + 7 * 24 * 60 * 60 * 1000;

      // Update UI countdown metrics
      const secRemaining = Math.max(0, Math.floor((accessExp - now) / 1000));
      const daysRemaining = Math.max(0, Math.ceil((refreshExp - now) / (1000 * 60 * 60 * 24)));
      setTimeUntilAccessExpiry(secRemaining);
      setTimeUntilHardExpiry(daysRemaining);

      // Check Hard Expiry (7 Days)
      if (now >= refreshExp) {
        setIsExpired(true);
        performLocalLogout();
        return;
      }

      // Check if Access Token is expiring soon (within 2 minutes of the 15m limit)
      // or already expired
      if (now >= accessExp - 120 * 1000) {
        // Automatic refresh in the background
        await refreshAccessToken();
      }
    };

    // Run immediately and every 15 seconds
    checkExpiryAndAutoRefresh();
    const interval = setInterval(checkExpiryAndAutoRefresh, 15000);

    return () => clearInterval(interval);
  }, [performLocalLogout, refreshAccessToken]);

  return {
    isKickedOut,
    isExpired,
    kickoutReason,
    timeUntilAccessExpirySeconds,
    timeUntilHardExpiryDays,
    refreshAccessToken,
  };
}
