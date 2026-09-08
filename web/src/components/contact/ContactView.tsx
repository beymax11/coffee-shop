"use client";

import React, { useState } from "react";
import {
  MapPin,
  Check,
  Send,
  Clock,
  User,
  Mail,
  FileText,
  MessageSquare,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SALON_LOCATIONS } from "@/lib/constants";

// Social SVG Icons
const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export function ContactView() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setIsSent(false), 5000);
    }
  };

  const updateField = (field: keyof typeof formData, val: string) => {
    setFormData({ ...formData, [field]: val });
  };

  const primaryLocation = SALON_LOCATIONS[0];

  const contactChannels = [
    {
      icon: InstagramIcon,
      label: "Instagram",
      value: "@antonioni.grounds",
      hint: "DM for bookings, questions, or just to say hi",
      href: "https://www.instagram.com/antonioni.grounds?igsh=MWR6MzBrNnplN2hubg==",
    },
    {
      icon: FacebookIcon,
      label: "Facebook",
      value: "Antonioni Grounds",
      hint: "Connect on our Facebook page",
      href: "https://www.facebook.com/share/1KExdzaSt5/",
    },
    {
      icon: TikTokIcon,
      label: "TikTok",
      value: "@antonioni.grounds",
      hint: "Watch our coffee brews and behind-the-scenes",
      href: "https://www.tiktok.com/@antonioni.grounds?_r=1&_t=ZS-98UmTZeZYwi",
    },
    {
      icon: Clock,
      label: "Opening Hours",
      value: "9:00 AM – 9:00 PM",
      hint: "Monday – Sunday, everyday",
      href: undefined,
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-500">
        {/* Atmospheric background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(46,90,68,0.08)_0%,transparent_70%)] blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(197,168,128,0.05)_0%,transparent_70%)] blur-[120px]" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
            }}
          />
        </div>

        {/* Cinematic header */}
        <div className="relative h-[320px] md:h-[380px] w-full flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 dark:opacity-25"
            style={{ backgroundImage: "url('/kape.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 dark:via-background/50 to-background/20 dark:to-black/70 transition-colors duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/50 dark:from-background/80 dark:via-transparent dark:to-background/40 transition-colors duration-500" />

          <FadeUp className="relative z-10 text-center max-w-2xl px-6 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="type-eyebrow tracking-[0.25em] text-emerald-600 dark:text-emerald-400">Tiaong, Quezon</span>
            </div>
            <h1 className="type-h1 text-foreground leading-tight font-serif">
              Get in Touch
            </h1>
            <div className="h-[1px] w-12 bg-[#2E5A44] mx-auto" />
            <p className="type-body text-neutral-600 dark:text-zinc-400 max-w-md mx-auto">
              Fastest way to reach us: Instagram,{" "}
              <a
                href="https://www.instagram.com/antonioni.grounds?igsh=MWR6MzBrNnplN2hubg=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                @antonioni.grounds
              </a>
              . DM for bookings, questions, or just to say hi.
            </p>
          </FadeUp>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 pb-16 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-8">
              <FadeUp>
                <span className="type-eyebrow text-emerald-600 dark:text-emerald-400">Antonioni Grounds</span>
                <h2 className="type-h2 text-foreground mt-2 leading-snug font-serif">
                  Tara, kape!
                </h2>
                <div className="w-16 h-[1px] bg-[#2E5A44]/40 mt-4 mb-4" />
                <p className="type-body text-neutral-600 dark:text-zinc-400 leading-relaxed text-sm">
                  A coffee shop in Tiaong. A cart that comes to you. Same care either way. Connect with us on Instagram, book the Brew Buggy for your celebration, or drop by our shop.
                </p>
              </FadeUp>

              <FadeUp delay={0.1}>
                <div className="relative rounded-xl overflow-hidden border border-card-border shadow-[0_10px_35px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)] aspect-[4/3] group">
                  <Image
                    src="/res.jpg"
                    alt="Antonioni Grounds coffee house"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </FadeUp>

              <StaggerContainer className="space-y-3" staggerDelay={0.08}>
                {contactChannels.map((channel) => {
                  const Icon = channel.icon;
                  const inner = (
                    <div className="flex items-center gap-4 rounded-xl border border-card-border bg-card p-4 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-card/90 hover:shadow-md hover:shadow-emerald-500/5 dark:hover:shadow-none hover:-translate-y-0.5">
                      <div className="rounded-full bg-[#2E5A44]/10 p-2.5 text-[#2E5A44] dark:text-emerald-400 shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="type-label text-zinc-500 block text-xs">{channel.label}</span>
                        <span className="type-body-sm text-foreground font-semibold truncate block">{channel.value}</span>
                        {channel.hint && (
                          <span className="text-[11px] text-neutral-400 dark:text-zinc-500 block truncate">{channel.hint}</span>
                        )}
                      </div>
                    </div>
                  );

                  return (
                    <StaggerItem key={channel.label}>
                      {channel.href ? (
                        <a href={channel.href} target="_blank" rel="noopener noreferrer" className="block">
                          {inner}
                        </a>
                      ) : (
                        inner
                      )}
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>

              <FadeUp delay={0.2} className="flex flex-col gap-3">
                <Link
                  href="/reservations?type=cart"
                  className="type-ui group inline-flex items-center justify-center gap-2 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-6 py-3 text-white border border-[#2E5A44]/30 transition-all duration-300 shadow-[0_0_20px_rgba(46,90,68,0.25)] hover:shadow-[0_0_25px_rgba(46,90,68,0.4)]"
                >
                  <Calendar size={14} className="transition-transform duration-300 group-hover:scale-110" />
                  Book the Brew Buggy
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/reservations"
                  className="type-ui group inline-flex items-center justify-center gap-2 rounded-full border border-card-border bg-card/80 hover:bg-neutral-100 dark:hover:bg-zinc-800 px-6 py-3 text-foreground transition-all duration-300 text-xs"
                >
                  Reserve a Table
                </Link>
              </FadeUp>
            </div>

            {/* Right: Form + Locations */}
            <div className="lg:col-span-8 space-y-12">
              {/* Inquiry form */}
              <FadeUp>
                <div className="rounded-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.04)] dark:shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden glassmorphism-green border border-card-border bg-card/60 backdrop-blur-md">
                  <div className="relative z-10 space-y-6">
                    <div className="border-b border-card-border pb-4">
                      <h3 className="type-h3 text-foreground font-serif">Send a Message</h3>
                      <p className="type-body-sm text-neutral-500 dark:text-zinc-400 mt-1">
                        Questions about our drinks, orders, or booking? Drop us a note here.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="type-label text-foreground flex items-center gap-2 text-xs">
                            <User size={13} className="text-emerald-500" />
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Juan Dela Cruz"
                            value={formData.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            className="w-full rounded-lg border border-card-border bg-background-alt/50 px-3.5 py-2.5 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-600"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="type-label text-foreground flex items-center gap-2 text-xs">
                            <Mail size={13} className="text-emerald-500" />
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="juan@example.com"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            className="w-full rounded-lg border border-card-border bg-background-alt/50 px-3.5 py-2.5 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="type-label text-foreground flex items-center gap-2 text-xs">
                          <FileText size={13} className="text-emerald-500" />
                          Subject
                        </label>
                        <input
                          type="text"
                          placeholder="Event Booking / Table Inquiry / General Question"
                          value={formData.subject}
                          onChange={(e) => updateField("subject", e.target.value)}
                          className="w-full rounded-lg border border-card-border bg-background-alt/50 px-3.5 py-2.5 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-neutral-400 dark:placeholder:text-zinc-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="type-label text-foreground flex items-center gap-2 text-xs">
                          <MessageSquare size={13} className="text-emerald-500" />
                          Your Message
                        </label>
                        <textarea
                          required
                          placeholder="Tell us what you need..."
                          value={formData.message}
                          onChange={(e) => updateField("message", e.target.value)}
                          className="w-full rounded-lg border border-card-border bg-background-alt/50 px-3.5 py-2.5 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none placeholder:text-neutral-400 dark:placeholder:text-zinc-600 min-h-[120px]"
                        />
                      </div>

                      {isSent && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                          <Check size={14} className="stroke-[3]" />
                          <span>Thank you! Your message has been received. Tara, kape!</span>
                        </div>
                      )}

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="type-ui group relative w-full flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#2E5A44] py-3.5 text-white font-semibold transition-all duration-300 hover:bg-[#234533] hover:shadow-[0_0_30px_rgba(46,90,68,0.25)] cursor-pointer"
                      >
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
                        <span className="relative flex items-center gap-2">
                          <Send size={14} />
                          Send Message
                        </span>
                      </motion.button>
                    </form>
                  </div>
                </div>
              </FadeUp>

              {/* Coffee Shop Location with Map */}
              <div className="space-y-6">
                <FadeUp>
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                    <div>
                      <span className="type-eyebrow text-emerald-600 dark:text-emerald-400">Our Location</span>
                      <h2 className="type-h2 text-foreground leading-tight font-serif mt-1">
                        Visit Antonioni Grounds
                      </h2>
                    </div>
                    <p className="type-body-sm text-neutral-500 dark:text-zinc-400 max-w-md">
                      Drop by for a freshly brewed cup. Connection first, coffee second.
                    </p>
                  </div>
                </FadeUp>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Location Details Card */}
                  <div className="lg:col-span-5 h-full">
                    <div className="group rounded-xl border border-card-border bg-card p-6 space-y-4 h-full flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(46,90,68,0.12)]">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="rounded-full bg-[#2E5A44]/10 p-2.5 text-[#2E5A44] dark:text-emerald-400 shrink-0">
                            <MapPin size={16} />
                          </div>
                          <span className="type-micro text-neutral-500 dark:text-zinc-400">{primaryLocation.coordinates}</span>
                        </div>

                        <div>
                          <h4 className="type-subheading text-foreground font-semibold">{primaryLocation.name}</h4>
                          <p className="type-body-sm text-neutral-600 dark:text-zinc-400 mt-2 leading-relaxed">{primaryLocation.address}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5 pt-4 border-t border-card-border mt-auto">
                        <span className="flex items-center gap-2 type-caption text-neutral-600 dark:text-zinc-400">
                          <Clock size={12} className="text-emerald-500/80 shrink-0" />
                          <span>9:00 AM – 9:00 PM (Monday – Sunday)</span>
                        </span>
                        <a
                          href="https://www.instagram.com/antonioni.grounds?igsh=MWR6MzBrNnplN2hubg=="
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 type-caption text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                        >
                          <InstagramIcon size={12} />
                          <span>DM us on Instagram (@antonioni.grounds)</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Google Maps Embed */}
                  <div className="lg:col-span-7 min-h-[300px] lg:min-h-full rounded-xl overflow-hidden border border-card-border shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                    <iframe
                      title="Antonioni Grounds Tiaong Flagship Map"
                      src="https://maps.google.com/maps?q=Antonioni%20Grounds,%20Tiaong,%20Quezon&t=&z=16&ie=UTF8&iwloc=&output=embed"
                      className="w-full h-full min-h-[300px] border-0 opacity-90 dark:opacity-80"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
