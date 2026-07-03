"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Check,
  Send,
  Clock,
  User,
  FileText,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { SALON_LOCATIONS } from "@/lib/constants";

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
      icon: Mail,
      label: "Email",
      value: "concierge@antonionigrounds.com",
      href: "mailto:concierge@antonionigrounds.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: primaryLocation.phone,
      href: `tel:${primaryLocation.phone.replace(/\s/g, "")}`,
    },
    {
      icon: Clock,
      label: "Response Time",
      value: "Within 12 hours",
      href: undefined,
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-500">
        {/* Atmospheric background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(197,168,128,0.07)_0%,transparent_70%)] blur-[120px]" />
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
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse shrink-0" />
              <span className="type-eyebrow tracking-[0.25em]">Antonioni Grounds</span>
            </div>
            <h1 className="type-h1 text-foreground leading-tight">
              Get in Touch
            </h1>
            <div className="h-[1px] w-12 bg-brand-gold mx-auto" />
            <p className="type-body text-neutral-600 dark:text-zinc-400 max-w-md mx-auto">
              Questions about our menu, private events, or wholesale partnerships — our concierge team is here to help.
            </p>
          </FadeUp>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 pb-16 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left sidebar */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-8">
              <FadeUp>
                <span className="type-eyebrow">Connect</span>
                <h2 className="type-h2 text-foreground mt-2 leading-snug">
                  Bespoke Sourcing Consultations
                </h2>
                <div className="w-16 h-[1px] bg-brand-gold/40 mt-5 mb-5" />
                <p className="type-body text-neutral-600 dark:text-zinc-400 leading-relaxed">
                  For wholesale accounts, event cart staging, or general inquiries about our roast profiles — reach us directly or visit our Tiaong flagship.
                </p>
              </FadeUp>

              <FadeUp delay={0.1}>
                <div className="relative rounded-xl overflow-hidden border border-card-border shadow-[0_10px_35px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)] aspect-[4/3] group">
                  <Image
                    src="/res.jpg"
                    alt="Antonioni Grounds coffee house interior"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="type-micro text-brand-gold/80">Flagship Coffee House</span>
                    <p className="type-card-title text-white mt-1">{primaryLocation.name}</p>
                  </div>
                </div>
              </FadeUp>

              <StaggerContainer className="space-y-3" staggerDelay={0.08}>
                {contactChannels.map((channel) => {
                  const Icon = channel.icon;
                  const inner = (
                    <div className="flex items-center gap-4 rounded-xl border border-card-border bg-card p-4 backdrop-blur-sm transition-all duration-300 hover:border-brand-gold/30 hover:bg-card/90 hover:shadow-md hover:shadow-brand-gold/5 dark:hover:shadow-none hover:-translate-y-0.5">
                      <div className="rounded-full bg-brand-gold/10 p-2.5 text-brand-gold shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="type-label text-zinc-500 block">{channel.label}</span>
                        <span className="type-body-sm text-foreground truncate block">{channel.value}</span>
                      </div>
                    </div>
                  );

                  return (
                    <StaggerItem key={channel.label}>
                      {channel.href ? (
                        <a href={channel.href} className="block">
                          {inner}
                        </a>
                      ) : (
                        inner
                      )}
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>

              <FadeUp delay={0.2}>
                <Link
                  href="/reservations"
                  className="type-ui group inline-flex items-center gap-2 rounded-full border border-card-border bg-card px-6 py-3 text-foreground transition-all duration-300 hover:border-brand-gold/40 hover:bg-background"
                >
                  Reserve a Table
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </FadeUp>
            </div>

            {/* Right: Form + Locations */}
            <div className="lg:col-span-8 space-y-12">
              {/* Inquiry form */}
              <FadeUp>
                <div className="rounded-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.04)] dark:shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden glassmorphism-gold">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand-gold/30" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-brand-gold/30" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-brand-gold/30" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand-gold/30" />
                  <div className="absolute -bottom-1/4 -right-1/4 w-72 h-72 bg-brand-gold/5 blur-[90px] rounded-full pointer-events-none" />

                  <div className="relative z-10 space-y-6">
                    <div className="border-b border-card-border pb-4">
                      <h3 className="type-h3 text-foreground">Send an Inquiry</h3>
                      <p className="type-body-sm text-neutral-500 dark:text-zinc-400 mt-1">
                        We typically respond within 12 hours on business days.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {isSent && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 type-success text-emerald-400 flex items-center gap-2"
                        >
                          <Check size={16} />
                          <span>Inquiry sent successfully. A concierge will respond shortly.</span>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="type-label block pl-1 tracking-[0.2em] text-[#8B5E3C]/90 dark:text-brand-beige">
                            Your Name
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-brand-gold transition-colors">
                              <User size={14} />
                            </div>
                            <input
                              type="text"
                              required
                              placeholder="Your full name"
                              value={formData.name}
                              onChange={(e) => updateField("name", e.target.value)}
                              className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-600"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="type-label block pl-1 tracking-[0.2em] text-[#8B5E3C]/90 dark:text-brand-beige">
                            Email Address
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-brand-gold transition-colors">
                              <Mail size={14} />
                            </div>
                            <input
                              type="email"
                              required
                              placeholder="concierge@example.com"
                              value={formData.email}
                              onChange={(e) => updateField("email", e.target.value)}
                              className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="type-label block pl-1 tracking-[0.2em] text-[#8B5E3C]/90 dark:text-brand-beige">
                          Subject
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-brand-gold transition-colors">
                            <MessageSquare size={14} />
                          </div>
                          <input
                            type="text"
                            placeholder="Microlot subscription query..."
                            value={formData.subject}
                            onChange={(e) => updateField("subject", e.target.value)}
                            className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="type-label block pl-1 tracking-[0.2em] text-[#8B5E3C]/90 dark:text-brand-beige">
                          Your Message
                        </label>
                        <div className="relative group">
                          <div className="absolute top-3.5 left-3.5 pointer-events-none text-zinc-500 group-focus-within:text-brand-gold transition-colors">
                            <FileText size={14} />
                          </div>
                          <textarea
                            rows={4}
                            required
                            placeholder="Write your concierge request..."
                            value={formData.message}
                            onChange={(e) => updateField("message", e.target.value)}
                            className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/20 transition-all resize-none placeholder:text-neutral-400 dark:placeholder:text-zinc-600 min-h-[120px]"
                          />
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="type-ui group relative w-full flex items-center justify-center gap-2.5 overflow-hidden rounded-full bg-brand-gold py-4 text-black font-semibold transition-all duration-300 hover:bg-brand-gold-hover hover:shadow-[0_0_30px_rgba(197,168,128,0.25)]"
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

              {/* Coffee Concierge with Map */}
              <div className="space-y-8">
                <FadeUp>
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                      <span className="type-eyebrow">Our Coffee Shop</span>
                      <h1 className="type-h1 text-foreground leading-tight">
                        Coffee Concierge
                      </h1>
                    </div>
                    <p className="type-body-sm text-neutral-500 dark:text-zinc-400 max-w-md">
                      Visit our sensory flagship lounge for the full Antonioni experience.
                    </p>
                  </div>
                </FadeUp>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left Column: Location Details */}
                  <div className="lg:col-span-5 h-full">
                    <div className="group rounded-xl border border-card-border bg-card p-6 space-y-4 h-full flex flex-col justify-between transition-all duration-300 hover:border-brand-gold/30 hover:shadow-[0_8px_30px_rgba(197,168,128,0.12)] hover:-translate-y-0.5">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="rounded-full bg-brand-gold/10 p-2.5 text-brand-gold shrink-0">
                            <MapPin size={16} />
                          </div>
                          <span className="type-micro text-neutral-500 dark:text-zinc-400">{primaryLocation.coordinates}</span>
                        </div>

                        <div>
                          <h4 className="type-subheading text-foreground">{primaryLocation.name}</h4>
                          <p className="type-body-sm text-neutral-600 dark:text-zinc-400 mt-2 leading-relaxed">{primaryLocation.address}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 pt-3 border-t border-card-border mt-auto">
                        <span className="flex items-center gap-2 type-caption text-neutral-600 dark:text-zinc-500">
                          <Phone size={11} className="text-brand-gold/70 shrink-0" />
                          <a href={`tel:${primaryLocation.phone.replace(/\s/g, "")}`} className="hover:text-brand-gold transition-colors">
                            {primaryLocation.phone}
                          </a>
                        </span>
                        <span className="flex items-center gap-2 type-caption text-neutral-600 dark:text-zinc-500">
                          <Clock size={11} className="text-brand-gold/70 shrink-0" />
                          {primaryLocation.hours}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Google Maps Embed */}
                  <div className="lg:col-span-7 min-h-[300px] lg:min-h-full rounded-xl overflow-hidden border border-card-border shadow-[0_8px_30px_rgba(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                    <iframe
                      title="Antonioni Grounds Tiaong Flagship Map"
                      src="https://maps.google.com/maps?q=Antonioni%20Grounds,%20Tiaong,%20Quezon&t=&z=16&ie=UTF8&iwloc=&output=embed"
                      className="w-full h-full min-h-[300px] border-0 grayscale opacity-80 contrast-125 dark:invert dark:opacity-75"
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
