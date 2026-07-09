import type { Metadata } from "next";
import { LoginPageClient } from "@/components/login/LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In | Antonioni Grounds",
  description: "Access your Antonioni Grounds reserve account to manage subscriptions, orders, and table reservations.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
