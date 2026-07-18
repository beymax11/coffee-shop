import { VerifiedView } from "@/components/login/VerifiedView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Verified | Antonioni Grounds",
  description: "Your email address has been successfully verified.",
};

export default function VerifiedPage() {
  return <VerifiedView />;
}
