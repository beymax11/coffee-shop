import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

const harmonique = localFont({
  src: [
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
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
      path: "../../public/fonts/Antonioni Font/Harmonique-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-SemiBoldItalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-Heavy.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-HeavyItalic.otf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/Harmonique-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-harmonique",
});

const harmoniqueDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
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
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-SemiBoldItalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-BoldItalic.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-Heavy.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-HeavyItalic.otf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Antonioni Font/HarmoniqueDisplay-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-harmonique-display",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans transition-colors duration-300">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

