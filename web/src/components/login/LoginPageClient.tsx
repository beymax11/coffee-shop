"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LoginDrawer } from "@/components/login/LoginDrawer";

/**
 * Full-page host for the LoginDrawer.
 * The /login route reuses the single login component (LoginDrawer) so the
 * sign-in / sign-up experience is identical whether opened from the navbar
 * or visited directly (e.g. admin logout redirect, loyalty CTAs).
 */
export function LoginPageClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <LoginDrawer isOpen onClose={() => router.replace("/")} />
    </div>
  );
}
