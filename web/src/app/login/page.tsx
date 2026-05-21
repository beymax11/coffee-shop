import type { Metadata } from "next";
import { LoginView } from "@/components/login/LoginView";

export const metadata: Metadata = {
  title: "Sign In | L'OR NOIR",
  description: "Access your L'OR NOIR reserve account to manage subscriptions, orders, and salon reservations.",
};

export default function LoginPage() {
  return <LoginView />;
}
