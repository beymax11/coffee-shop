"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Coffee, ArrowRight, CheckCircle2 } from "lucide-react";

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
);

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail("");
      setTimeout(() => setIsSubmitted(false), 5000);
    }
  };

  return (
    <footer className="relative mt-auto border-t border-white/5 bg-[#070707] text-[#F5F5F0]">
      {/* Background soft gold glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5 pb-16">
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Coffee className="text-brand-gold" size={24} />
              <span className="type-logo">
                L&apos;OR <span className="text-brand-gold">NOIR</span>
              </span>
            </Link>
            <p className="type-body-sm text-zinc-400">
              A sensory sanctuary redefining coffee. We source the world’s most exclusive microlots, roasting to reveal complex, elegant flavor profiles for the discerning palate.
            </p>
            <div className="flex items-center gap-4 text-zinc-500">
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
                <FacebookIcon size={18} />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <TwitterIcon size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="type-label text-white">Navigation</h4>
            <ul className="space-y-2.5 type-body-sm text-zinc-400">
              <li>
                <Link href="/menu" className="hover:text-brand-gold transition-colors">Our Menu</Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-brand-gold transition-colors">Event Reservations</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-brand-gold transition-colors">Boutique Merchandise</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-gold transition-colors">Heritage & Roastery</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-gold transition-colors">Find a Salon</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hours & Sourcing */}
          <div className="space-y-4">
            <h4 className="type-label text-white">Opening Hours</h4>
            <ul className="space-y-2.5 type-body-sm text-zinc-400">
              <li className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="text-zinc-300 font-medium">07:00 - 20:00</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday - Sunday</span>
                <span className="text-zinc-300 font-medium">08:00 - 22:00</span>
              </li>
              <li className="border-t border-white/5 pt-2.5 type-caption text-zinc-500">
                *Private event bookings are available outside salon hours.
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="type-label text-white">L&apos;OR CLUB</h4>
            <p className="type-body-sm text-zinc-400">
              Subscribe to receive exclusive access to microlot releases, roasting masterclasses, and private lounge events.
            </p>

            <form onSubmit={handleSubmit} className="relative mt-2">
              {isSubmitted ? (
                <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2.5 type-success text-green-400">
                  <CheckCircle2 size={16} />
                  <span>Welcome to the club.</span>
                </div>
              ) : (
                <div className="flex items-center rounded-full border border-white/10 bg-black/40 p-1.5 focus-within:border-brand-gold transition-all">
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent px-3 py-1 type-field text-[#F5F5F0] outline-none placeholder:text-zinc-600"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-brand-gold p-2 text-black hover:bg-brand-gold-hover transition-all"
                    aria-label="Subscribe"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between py-8 type-caption text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} L&apos;OR NOIR. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
