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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://agshop.lat"),
  title: {
    default: "Antonioni Grounds | Artisanal Coffee & Luxury Patisserie",
    template: "%s | Antonioni Grounds",
  },
  description: "Experience the art of artisanal coffee. Antonioni Grounds offers exclusive single-origin Geisha coffees, luxury custom patisserie, and cinematic private café events.",
  keywords: ["luxury coffee", "single origin coffee", "geisha coffee beans", "specialty coffee", "private event booking", "coffee catering", "espresso bar"],
  openGraph: {
    title: "Antonioni Grounds | Artisanal Coffee & Luxury Patisserie",
    description: "Experience the art of artisanal coffee. Antonioni Grounds offers exclusive single-origin Geisha coffees, luxury custom patisserie, and cinematic private café events.",
    url: "/",
    siteName: "Antonioni Grounds",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Antonioni Grounds Artisanal Coffee",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Antonioni Grounds | Artisanal Coffee & Luxury Patisserie",
    description: "Experience the art of artisanal coffee. Antonioni Grounds offers exclusive single-origin Geisha coffees, luxury custom patisserie, and cinematic private café events.",
    images: ["/hero.png"],
  },
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

