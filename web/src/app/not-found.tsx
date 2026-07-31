"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Sun, Moon, Coffee, Sparkles } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const checkTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      const isDark = savedTheme ? savedTheme === "dark" : root.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    checkTheme();
    window.addEventListener("storage", checkTheme);
    return () => window.removeEventListener("storage", checkTheme);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isCurrentlyDark = root.classList.contains("dark");
    const nextTheme = isCurrentlyDark ? "light" : "dark";

    if (nextTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
    window.dispatchEvent(new Event("storage"));
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-background text-foreground transition-colors duration-500 select-none">
      {/* Background Ambient Glows & Grain */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-green/10 dark:bg-emerald-500/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-brand-gold/10 dark:bg-brand-gold/5 blur-[110px] rounded-full" />
        <div className="absolute inset-0 film-grain opacity-[0.03] dark:opacity-[0.05]" />
      </div>

      {/* Top Header inside 404 View */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 sm:px-10 flex items-center justify-end">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full border border-card-border bg-card/60 backdrop-blur-md flex items-center justify-center text-zinc-500 hover:text-brand-gold hover:border-brand-gold/40 transition-all duration-300 cursor-pointer shadow-sm"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center my-auto">
        {/* Large 404 Background Watermark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <span className="font-serif text-[140px] sm:text-[220px] md:text-[300px] font-bold tracking-tighter text-brand-gold/[0.06] dark:text-brand-gold/[0.04] leading-none select-none">
            404
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-xl mx-auto flex flex-col items-center space-y-6"
        >
          {/* Logo directly above the main title */}
          <Link href="/" className="group flex items-center justify-center">
            <img
              src="/logo.png"
              alt="ANTONIONI GROUNDS"
              className="h-12 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 invert dark:invert-0"
            />
          </Link>

          {/* Main Title */}
          <h1 className="type-h1 text-foreground font-serif tracking-tight leading-tight text-3xl sm:text-4xl md:text-5xl">
            This Coffee Trail Leads Nowhere
          </h1>

          {/* Subtitle / Description */}
          <p className="type-body text-neutral-600 dark:text-zinc-400 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            The page you are looking for has been moved, renamed, or freshly brewed into another path.
          </p>

          {/* Actions: Return Home and Go Back */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            {/* Primary: Return Home */}
            <Link
              href="/"
              className="w-full sm:w-auto group relative flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-brand-green hover:bg-brand-green-hover text-white type-ui text-xs tracking-[0.15em] transition-all duration-300 shadow-[0_0_25px_rgba(46,90,68,0.25)] hover:shadow-[0_0_30px_rgba(46,90,68,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Home size={14} className="transition-transform duration-300 group-hover:scale-110" />
              <span>Return Home</span>
            </Link>

            {/* Secondary: Go Back */}
            <button
              onClick={handleGoBack}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full border border-card-border bg-card/60 hover:bg-card hover:border-brand-gold/40 text-foreground type-ui text-xs tracking-[0.15em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Go Back</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer inside 404 View */}
      <footer className="relative z-10 w-full text-center py-6 border-t border-card-border/30">
        <p className="type-caption text-neutral-400 dark:text-zinc-500 type-micro tracking-widest">
          © ANTONIONI GROUNDS 2026
        </p>
      </footer>
    </div>
  );
}
