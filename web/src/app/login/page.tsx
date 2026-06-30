import type { Metadata } from "next";
import { LoginView } from "@/components/login/LoginView";

export const metadata: Metadata = {
  title: "Sign In | Antonioni Grounds",
  description: "Access your Antonioni Grounds reserve account to manage subscriptions, orders, and salon reservations.",
};

export default function LoginPage() {
  return <LoginView />;
}
