import type { Metadata } from "next";
import { ResetPasswordView } from "@/components/login/ResetPasswordView";

export const metadata: Metadata = {
  title: "Update Password | Antonioni Grounds",
  description: "Update the password for your Antonioni Grounds reserve account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
