import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { CartDrawer } from "@/components/ecommerce/CartDrawer";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "L'OR NOIR | Luxury Café & Boutique Roastery",
  description: "Experience the art of artisanal coffee. L'OR NOIR offers exclusive single-origin Geisha coffees, luxury custom patisserie, and cinematic private café events.",
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
      className={`${playfair.variable} ${jakarta.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0B0B] text-[#F5F5F0] font-sans">
        {/* Navigation header bar */}
        <Navbar />
        
        {/* Main application page content */}
        <main className="flex-1 flex flex-col pt-[72px] md:pt-[80px]">
          {children}
        </main>
        
        {/* Sliding shopping cart drawer */}
        <CartDrawer />
        
        {/* Brand footer */}
        <Footer />
      </body>
    </html>
  );
}
