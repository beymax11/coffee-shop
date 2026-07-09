"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans rounded-2xl border border-card-border bg-card/90 backdrop-blur-md text-foreground shadow-2xl transition-all duration-300 p-4 flex gap-3 items-center",
          description: "text-[11px] text-neutral-500 dark:text-zinc-400 font-sans",
          actionButton:
            "bg-brand-green text-white hover:bg-brand-green-hover rounded-full px-3 py-1 text-xs font-semibold font-sans transition-all",
          cancelButton:
            "bg-foreground/[0.05] hover:bg-foreground/[0.1] text-foreground rounded-full px-3 py-1 text-xs font-semibold font-sans transition-all",
          success: "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
          error: "text-red-600 dark:text-red-400 border-red-500/20 bg-red-500/5",
          info: "text-brand-gold dark:text-brand-gold border-brand-gold/20 bg-brand-gold/5",
        },
      }}
      {...props}
    />
  );
}
