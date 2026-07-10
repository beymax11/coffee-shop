import type { Metadata } from "next";
import { SignUpPageClient } from "@/components/login/SignUpPageClient";

export const metadata: Metadata = {
  title: "Sign Up | Antonioni Grounds",
  description: "Join the Antonioni Grounds Reserve Membership program to earn stamps and loyalty rewards.",
};

export default function SignUpPage() {
  return <SignUpPageClient />;
}
