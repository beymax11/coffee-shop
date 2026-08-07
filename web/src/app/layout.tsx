import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { SpeedInsights } from "@vercel/speed-insights/next";

const harmonique = localFont({
  src: [
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-harmonique",
  display: "swap",
});

const harmoniqueDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-harmonique-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Antonioni Grounds",
  description: "Experience the art of artisanal coffee. Antonioni Grounds offers exclusive single-origin Geisha coffees, luxury custom patisserie, and cinematic private café events.",
  keywords: "luxury coffee, single origin coffee, geisha coffee beans, specialty coffee, private event booking, coffee catering, espresso bar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${harmoniqueDisplay.variable} ${harmonique.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans transition-colors duration-300">
        <LayoutWrapper>{children}</LayoutWrapper>
        <SpeedInsights />
      </body>
    </html>
  );
}

