import type { Metadata } from "next";
import { ForgotPasswordView } from "@/components/login/ForgotPasswordView";

export const metadata: Metadata = {
  title: "Reset Password | Antonioni Grounds",
  description: "Request a secure link to reset the password for your Antonioni Grounds reserve account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
