import { Metadata } from "next";
import { BrewBuggyView } from "@/components/brew-buggy/BrewBuggyView";

export const metadata: Metadata = {
  title: "Brew Buggy | Antonioni Grounds",
  description:
    "The open-top coffee carriage of Antonioni Grounds. Created to bring freshly brewed coffee, good energy, and meaningful moments to your special occasions.",
};

export default function BrewBuggyPage() {
  return <BrewBuggyView />;
}
