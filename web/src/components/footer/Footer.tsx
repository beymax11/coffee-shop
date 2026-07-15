import React from "react";
import Link from "next/link";

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
  return (
    <footer className="relative mt-auto border-t border-card-border bg-card text-foreground overflow-hidden">
      {/* Background soft gold glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16 xl:gap-20 border-b border-card-border pb-16">
          {/* Brand Info */}
          <div className="w-full max-w-sm shrink-0 space-y-6">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="ANTONIONI GROUNDS"
                className="h-10 w-auto object-contain invert dark:invert-0"
              />
            </Link>
            <p className="type-body-sm text-neutral-500 dark:text-zinc-400">
              A sensory sanctuary redefining coffee. We source the world’s most exclusive microlots, roasting to reveal complex, elegant flavor profiles for the discerning palate.
            </p>
          </div>

          {/* Navigation, Opening Hours & Location */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start justify-start gap-10 sm:gap-12 lg:gap-14">
            <div className="space-y-4">
              <h4 className="type-label text-foreground">Navigation</h4>
              <ul className="space-y-2.5 type-body-sm text-neutral-500 dark:text-zinc-400">
                <li>
                  <Link href="/menu" className="hover:text-brand-gold transition-colors">Our Menu</Link>
                </li>
                <li>
                  <Link href="/reservations" className="hover:text-brand-gold transition-colors">Reservations</Link>
                </li>
                <li>
                  <Link href="/loyalty" className="hover:text-brand-gold transition-colors">Loyalty Card</Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-brand-gold transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-brand-gold transition-colors">Contact</Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="type-label text-foreground">Opening Hours</h4>
              <ul className="space-y-2.5 type-body-sm text-neutral-500 dark:text-zinc-400">
                <li>
                  <span>Monday - Friday</span>
                  <span className="block text-neutral-800 dark:text-zinc-300 font-medium">07:00 - 20:00</span>
                </li>
                <li>
                  <span>Saturday - Sunday</span>
                  <span className="block text-neutral-800 dark:text-zinc-300 font-medium">08:00 - 22:00</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="type-label text-foreground">Location</h4>
              <address className="not-italic space-y-2.5 type-body-sm text-neutral-500 dark:text-zinc-400">
                <p className="text-neutral-800 dark:text-zinc-300 font-medium">Antonioni Grounds</p>
                <p>J.P Rizal Street, Poblacion 3</p>
                <p>Tiaong, 4325 Quezon, Philippines</p>
              </address>
            </div>

            <div className="space-y-4">
              <h4 className="type-label text-foreground">Connect with us</h4>
              <div className="flex items-center gap-4 text-zinc-500">
                <a href="#" className="hover:text-foreground dark:hover:text-white transition-colors" aria-label="Instagram">
                  <InstagramIcon size={18} />
                </a>
                <a href="#" className="hover:text-foreground dark:hover:text-white transition-colors" aria-label="Facebook">
                  <FacebookIcon size={18} />
                </a>
                <a href="#" className="hover:text-foreground dark:hover:text-white transition-colors" aria-label="Twitter">
                  <TwitterIcon size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between py-8 type-caption text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} Antonioni Grounds. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Accessibility</a>
          </div>
        </div>

        {/* Brand Signature */}
        <div className="flex justify-center pt-8 pb-4">
          <img
            src="/signature.png"
            alt="Antonioni Signature"
            className="h-28 sm:h-40 md:h-52 w-auto object-contain dark:invert opacity-75 hover:opacity-100 transition-all duration-500 pointer-events-none select-none"
          />
        </div>
      </div>
    </footer>
  );
};
