"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Check, Send, Clock, Globe } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";

export function ContactView() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
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

  const locations = [
    {
      city: "Tokyo",
      neighborhood: "Aoyama Salon",
      address: "5-10-1 Minami-Aoyama, Minato-ku, Tokyo 107-0062",
      phone: "+81 3 5468 0912",
      hours: "08:00 - 22:00 Daily"
    },
    {
      city: "New York",
      neighborhood: "Soho Roastery",
      address: "412 West Broadway, New York, NY 10012",
      phone: "+1 (212) 965-0143",
      hours: "07:00 - 20:00 Daily"
    },
    {
      city: "Paris",
      neighborhood: "Marais Lounge",
      address: "18 Rue des Quatre-Fils, 75003 Paris",
      phone: "+33 1 42 74 98 05",
      hours: "08:00 - 21:00 Daily"
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0B0B0B] py-16 md:py-24 text-[#F5F5F0]">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          
          {/* Header Title */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="type-eyebrow">L'OR NOIR Global</span>
            <h1 className="type-h1 text-white mt-2">
              Our Salons & Roasteries
            </h1>
            <div className="h-[1px] w-12 bg-brand-gold mx-auto mt-4" />
            <p className="type-body text-zinc-400 mt-4">
              Find a physical sanctuary or send us details for private events. Our concierge team is available to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Contact Form & Info */}
            <div className="space-y-10">
              <div className="space-y-6">
                <h3 className="type-h2 text-white">Concierge Inquiries</h3>
                <p className="type-body text-zinc-400">
                  For wholesale partnership accounts, event staging requests, or general thoughts on our roast profiles, please submit the form below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/5 bg-[#141414] p-8 glassmorphism shadow-xl">
                {isSent && (
                  <div className="rounded border border-green-500/20 bg-green-500/10 p-4 type-success text-green-400 flex items-center gap-2">
                    <Check size={16} />
                    <span>Inquiry sent successfully. A concierge will respond within 12 hours.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="type-label block">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alexander Vance"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="type-label block">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alexander@example.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="type-label block">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Sourcing details, cart event catering"
                    value={formData.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="type-label block">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share details of your request..."
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className="w-full rounded border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 font-sans resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-gold py-3 type-ui text-black hover:bg-brand-gold-hover transition-colors gold-glow active:scale-95"
                >
                  <Send size={12} />
                  Send Message
                </button>
              </form>
            </div>

            {/* Right: Global Salons List & Custom Map */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="type-h2 text-white">Global Locations</h3>
                
                {/* Salons list */}
                <div className="space-y-6">
                  {locations.map((loc, idx) => (
                    <div key={idx} className="flex gap-4 border-b border-white/5 pb-6 last:border-0">
                      <div className="rounded-full bg-brand-gold/10 p-2.5 text-brand-gold h-fit shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div className="space-y-1 font-sans type-body-sm">
                        <h4 className="type-subheading text-white">
                          {loc.city} <span className="text-brand-gold font-sans type-body-sm font-bold">/ {loc.neighborhood}</span>
                        </h4>
                        <p className="text-zinc-400 leading-relaxed">{loc.address}</p>
                        <div className="flex gap-4 type-caption text-zinc-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Phone size={10} /> {loc.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {loc.hours}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Map Mockup */}
              <div className="rounded-2xl border border-white/5 bg-[#141414] p-6 h-60 relative flex flex-col justify-between overflow-hidden shadow-md">
                <div className="absolute inset-0 bg-cover opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800')" }} />
                
                <div className="flex items-center gap-2 relative z-10">
                  <Globe className="text-brand-gold animate-spin" style={{ animationDuration: "12s" }} size={16} />
                  <span className="type-micro text-zinc-500">Salon Coordinates Map</span>
                </div>

                {/* Stylized locations representation in map */}
                <div className="relative h-28 w-full flex items-center justify-center border border-white/5 rounded-lg bg-black/40">
                  <div className="absolute top-[20%] left-[25%] flex flex-col items-center">
                    <span className="h-2 w-2 rounded-full bg-brand-gold animate-ping" />
                    <span className="type-micro mt-1">NYC</span>
                  </div>
                  <div className="absolute top-[35%] left-[45%] flex flex-col items-center">
                    <span className="h-2 w-2 rounded-full bg-brand-gold animate-ping" style={{ animationDelay: "1s" }} />
                    <span className="type-micro mt-1">PARIS</span>
                  </div>
                  <div className="absolute top-[25%] left-[80%] flex flex-col items-center">
                    <span className="h-2 w-2 rounded-full bg-brand-gold animate-ping" style={{ animationDelay: "2s" }} />
                    <span className="type-micro mt-1">TOKYO</span>
                  </div>
                </div>

                <span className="type-micro text-zinc-600 relative z-10">
                  L&apos;OR NOIR Roasters Network Inc.
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
