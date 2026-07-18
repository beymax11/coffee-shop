"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { setCookie } from "@/utils/cookies";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      if (!supabase) {
        router.replace("/login?view=page&error=supabase_not_configured");
        return;
      }

      try {
        // Wait a brief moment for the Supabase client to parse the URL hash/query
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // Fetch user profile to determine their role
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          const role = profile?.role || "customer";
          const isStaff = role === "admin" || role === "barista";

          // Sync secure session cookies for Next.js middleware
          setCookie("sb-access-token", session.access_token, 7);
          setCookie("admin_session", isStaff ? "true" : "false", 7);
          if (role) {
            setCookie("admin_role", role, 7);
          }

          // Redirect to the intermediate Verified page
          router.replace("/auth/verified");
        } else {
          // Fallback: If no session on mount, check again after 1.5 seconds in case parsing was delayed
          setTimeout(async () => {
            if (!supabase) return;
            const { data: { session: secondSession } } = await supabase.auth.getSession();
            if (secondSession) {
              setCookie("sb-access-token", secondSession.access_token, 7);
              router.replace("/auth/verified");
            } else {
              console.error("No active session found in callback.");
              router.replace("/login?view=page&error=no_session_found");
            }
          }, 1500);
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        router.replace("/login?view=page&error=auth_callback_failed");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute w-[300px] h-[300px] bg-brand-green/10 blur-[100px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay" />
      <div className="flex flex-col items-center gap-4 text-center z-10">
        <Loader2 className="animate-spin text-brand-green h-10 w-10" />
        <span className="type-eyebrow text-zinc-500 text-xs tracking-[0.2em]">Exchanging credentials...</span>
      </div>
    </div>
  );
}
