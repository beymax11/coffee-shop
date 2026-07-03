"use client";

import React, { useState, useEffect } from "react";
import {
  Coffee,
  QrCode,
  Gift,
  Check,
  Copy,
  Info,
  X,
  CreditCard,
  RotateCcw,
  Maximize2
} from "lucide-react";
import { FadeUp, PageTransition } from "@/components/animations";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/utils/db";

export function LoyaltyView() {
  const [memberId, setMemberId] = useState<string>("LN-882-901");
  const [memberName, setMemberName] = useState<string>("Alexander Vance");
  const [isGuest, setIsGuest] = useState<boolean>(true);

  const [stamps, setStamps] = useState<number>(1);
  const [points, setPoints] = useState<number>(720);
  const tier = points >= 1500 ? "Platinum" : points >= 500 ? "Gold" : "Bronze";
  const [showClaimSuccess, setShowClaimSuccess] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isQrExpanded, setIsQrExpanded] = useState<boolean>(false);

  // Sync with DB
  useEffect(() => {
    const syncFromDb = () => {
      const sessionEmail = localStorage.getItem("customer_session");
      const members = db.getLoyaltyMembers();

      let current = members.find((m) => m.id === "LN-882-901"); // default fallback
      let guestState = true;

      if (sessionEmail) {
        const found = members.find((m) => m.email.toLowerCase() === sessionEmail.toLowerCase());
        if (found) {
          current = found;
          guestState = false;
        }
      }

      if (current) {
        let currentStamps = current.stamps;
        if (current.id === "LN-882-901") {
          currentStamps = 1;
          if (current.stamps !== 1) {
            db.saveLoyaltyMember({
              ...current,
              stamps: 1
            });
          }
        }
        setMemberId(current.id);
        setMemberName(current.name);
        setStamps(currentStamps);
        setPoints(current.points);
        setIsGuest(guestState);
      }
    };
    syncFromDb();

    window.addEventListener("storage", syncFromDb);
    return () => window.removeEventListener("storage", syncFromDb);
  }, []);

  const copyMemberId = () => {
    navigator.clipboard.writeText(memberId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleClaimReward = () => {
    if (stamps < 9) return;

    setStamps(0);
    const newPoints = points + 50;
    setPoints(newPoints); // bonus points for claiming
    setShowClaimSuccess(true);

    // Save back to db
    const members = db.getLoyaltyMembers();
    const current = members.find((m) => m.id === memberId);
    if (current) {
      db.saveLoyaltyMember({
        ...current,
        stamps: 0,
        points: newPoints
      });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-16 md:py-24 text-foreground relative overflow-hidden transition-colors duration-500">
        {/* Subtle decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Glowing gold blobs */}
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(197,168,128,0.07)_0%,transparent_70%)] blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(197,168,128,0.05)_0%,transparent_70%)] blur-[120px]" />
          <div className="absolute top-[30%] left-[40%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(197,168,128,0.03)_0%,transparent_70%)] blur-[100px]" />

          {/* Fine luxury grid lines overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, var(--card-border) 1px, transparent 1px), linear-gradient(to bottom, var(--card-border) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">



          {isGuest ? (
            <FadeUp className="max-w-md mx-auto rounded-2xl border border-card-border bg-card p-8 md:p-10 text-center glassmorphism-gold shadow-xl flex flex-col items-center">
              <div className="rounded-full bg-brand-gold/10 p-4 text-brand-gold mb-6">
                <QrCode size={32} />
              </div>
              <h2 className="type-h3 text-foreground">Membership Access Required</h2>
              <p className="type-body-sm text-neutral-500 dark:text-zinc-400 mt-2 mb-8 max-w-xs">
                To view your stamps, tiers, and scan history, please log in with your Antonioni Grounds reserve credentials.
              </p>
              <div className="mt-8 w-full space-y-3">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-gold py-3 text-sm font-semibold text-black hover:bg-brand-gold-hover transition-colors gold-glow active:scale-95 cursor-pointer"
                >
                  Sign In to Account
                </Link>
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 py-3 text-sm font-medium text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
                >
                  Create a New Account
                </Link>
              </div>
            </FadeUp>
          ) : (
            <FadeUp className="max-w-2xl mx-auto w-full">
              <div className="w-full" style={{ perspective: "1500px" }}>
                <div
                  className="relative w-full transition-transform duration-700 h-[510px] sm:h-[440px]"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                  }}
                >
                  {/* Front Side: Loyalty Stamp Card */}
                  <div
                    className={`absolute inset-0 w-full h-full ${isFlipped ? "pointer-events-none z-0" : "pointer-events-auto z-10"}`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden"
                    }}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-brand-gold/15 bg-gradient-to-br from-[#FCF9F5] to-[#EADBC8]/40 dark:from-[#1c1a16] dark:to-[#121212] p-8 glassmorphism-gold shadow-xl flex flex-col justify-start gap-4 h-full gold-glow">
                      {/* Front Card Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pr-12 gap-4">
                        <div>
                          <h3 className="type-h3 text-foreground">Every stamp is a step toward another unforgettable brew.</h3>
                          <p className="type-caption text-zinc-600 dark:text-zinc-400 mt-1">Buy 9 coffees, get the 10th complimentary.</p>
                        </div>

                        {stamps >= 9 && (
                          <button
                            onClick={handleClaimReward}
                            className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 type-ui flex items-center gap-1.5 transition-all shadow-lg animate-pulse"
                          >
                            <Gift size={14} />
                            Claim Complimentary Geisha
                          </button>
                        )}
                      </div>

                      {/* Flip Icon Button */}
                      <button
                        onClick={() => setIsFlipped(true)}
                        className="absolute top-8 right-8 rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-brand-gold hover:border-brand-gold/30 transition-all active:scale-95 z-20"
                        title="View Membership Card"
                      >
                        <RotateCcw size={16} className="rotate-180" />
                      </button>

                      {/* Stamp Card Grid */}
                      <div className="grid grid-cols-5 gap-4 mt-6 justify-items-center">
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const isStamped = idx < stamps;
                          return (
                            <div
                              key={idx}
                              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex flex-col items-center justify-center relative transition-all duration-300 ${isStamped
                                ? "bg-transparent border-brand-gold/40"
                                : "bg-zinc-100 border-zinc-200/80 dark:bg-[#181818] dark:border-white/5"
                                }`}
                            >
                              {isStamped ? (
                                <motion.div
                                  initial={{ scale: 0.5, rotate: -45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  className="flex flex-col items-center justify-center"
                                >
                                  <Image
                                    src="/stamps-transparent.png"
                                    alt="Coffee Stamp"
                                    width={72}
                                    height={72}
                                    className="w-15 h-15 sm:w-18 sm:h-18 object-contain loyalty-stamp-color"
                                  />
                                </motion.div>
                              ) : (
                                <span className="text-zinc-500 dark:text-zinc-600 font-bold text-base sm:text-lg font-mono">{idx + 1}</span>
                              )}
                            </div>
                          );
                        })}

                        {/* Stamp 10: Reward Slot */}
                        <div
                          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex flex-col items-center justify-center relative transition-all duration-500 ${stamps >= 9
                            ? "bg-emerald-50/70 border-emerald-500 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 shadow-lg gold-glow"
                            : "bg-zinc-100 border-zinc-200/80 border-dashed text-zinc-400 dark:bg-[#181818] dark:border-white/10 dark:text-zinc-500"
                            }`}
                        >
                          <Gift size={28} className={stamps >= 9 ? "animate-bounce text-emerald-600 dark:text-emerald-400" : ""} />
                        </div>
                      </div>

                      {/* Brand Logo & Info Alert text on Lower Right Corner */}
                      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                        <div>
                          <Image
                            src="/logo.png"
                            alt="Antonioni Grounds Logo"
                            width={140}
                            height={46}
                            className="h-9 w-auto object-contain invert dark:invert-0"
                          />
                        </div>
                        <div className="max-w-[240px] xs:max-w-[280px] sm:max-w-[320px] text-right">
                          <p className="text-[8px] sm:text-[9px] text-zinc-500 leading-normal sm:leading-relaxed">
                            Stamps are automatically issued upon checkout for any handcrafted beverage purchases when your loyalty ID is scanned.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back Side: ANTONIONI MEMBER CARD */}
                  <div
                    className={`absolute inset-0 w-full h-full ${!isFlipped ? "pointer-events-none z-0" : "pointer-events-auto z-10"}`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)"
                    }}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-brand-gold/15 bg-gradient-to-br from-[#FCF9F5] to-[#EADBC8]/40 dark:from-[#1c1a16] dark:to-[#121212] p-8 glassmorphism-gold shadow-xl flex flex-col justify-between h-full gold-glow">

                      {/* Right side coffee photo cover */}
                      <div className="absolute top-0 right-0 bottom-0 w-1/2 overflow-hidden border-l border-brand-gold/10 hidden sm:block">
                        <Image
                          src="/kape.jpg"
                          alt="Luxury Coffee"
                          fill
                          className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                        />
                        {/* Soft blend overlay gradient to card background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FCF9F5] dark:from-[#121212] via-transparent to-transparent" />
                      </div>

                      {/* Content Column (occupying left half on desktop) */}
                      <div className="flex flex-col justify-start gap-3 h-full w-full sm:w-[48%] min-w-0 z-10 relative">
                        <div>
                          <span className="text-[10px] tracking-[0.25em] text-brand-gold/90 font-bold uppercase block font-sans">Antonioni Grounds Reserve</span>
                          <h2 className="type-h1 text-foreground mt-1">{memberName}</h2>
                          {isGuest && <p className="type-caption text-zinc-600 dark:text-zinc-400 mt-1">Guest Preview Card</p>}
                        </div>

                        {/* Flex Row Container: QR Code on left, Member stats on right */}
                        <div className="flex flex-row items-start gap-5">
                          {/* Integrated Large QR Code */}
                          <div
                            onClick={() => setIsQrExpanded(true)}
                            className="w-32 h-32 sm:w-36 sm:h-36 bg-white p-2.5 rounded-xl flex flex-col justify-center items-center relative overflow-hidden shadow-inner shrink-0 group cursor-pointer"
                          >
                            {/* Gold scanning light simulation */}
                            <div className="absolute left-0 right-0 h-1 bg-brand-gold opacity-75 shadow-[0_0_8px_#C5A880] animate-pulse z-10" style={{ animation: "scan 2.5s infinite ease-in-out" }} />

                            {/* Virtual Stylized QR representation */}
                            <div className="w-full h-full flex flex-col justify-between select-none">
                              {/* Rows of block indicators simulating a luxury QR code */}
                              <div className="flex justify-between h-7 sm:h-8 w-full">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 border-4 border-black p-0.5 flex justify-center items-center"><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black" /></div>
                                <div className="flex-1 flex flex-col justify-around py-0.5 px-1.5 gap-0.5">
                                  <div className="flex gap-0.5"><div className="w-1.5 h-1 bg-black" /><div className="w-2.5 h-1 bg-black" /><div className="w-1.5 h-1 bg-black" /></div>
                                  <div className="flex gap-0.5"><div className="w-3 h-1 bg-black" /><div className="w-1 h-1 bg-black" /></div>
                                </div>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 border-4 border-black p-0.5 flex justify-center items-center"><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black" /></div>
                              </div>

                              <div className="flex-1 flex justify-between my-1 sm:my-1.5 gap-1">
                                <div className="w-7 sm:w-8 flex flex-col justify-around gap-0.5">
                                  <div className="h-1 w-full bg-black" />
                                  <div className="h-1 w-3 sm:w-4 bg-black" />
                                  <div className="h-1 w-5 sm:w-6 bg-black" />
                                </div>
                                <div className="flex-1 grid grid-cols-6 gap-0.5 p-0.5">
                                  {Array.from({ length: 24 }).map((_, i) => (
                                    <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 7 === 0 ? "bg-black" : "bg-transparent"}`} />
                                  ))}
                                </div>
                                <div className="w-7 sm:w-8 flex flex-col justify-around items-end gap-0.5">
                                  <div className="h-1 w-full bg-black" />
                                  <div className="h-1 w-2 sm:w-3 bg-black" />
                                  <div className="h-1 w-5 sm:w-6 bg-black" />
                                </div>
                              </div>

                              <div className="flex justify-between h-7 sm:h-8 w-full">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 border-4 border-black p-0.5 flex justify-center items-center"><div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-black" /></div>
                                <div className="flex-1 flex flex-col justify-around py-0.5 px-1.5 gap-0.5">
                                  <div className="flex gap-0.5"><div className="w-2 h-1 bg-black" /><div className="w-2 h-1 bg-black" /></div>
                                  <div className="flex gap-0.5"><div className="w-1.5 h-1 bg-black" /><div className="w-2.5 h-1 bg-black" /></div>
                                </div>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 border-4 border-black/20 p-0.5 flex justify-center items-center"><div className="w-1.5 h-1 bg-black/40" /></div>
                              </div>
                            </div>

                            {/* Hover Overlay Expand Button */}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                              <button className="bg-brand-gold text-black rounded-full p-2.5 shadow-lg flex items-center justify-center hover:scale-110 transition-all hover:bg-brand-gold-hover active:scale-95">
                                <Maximize2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Member ID & Member Since Stack */}
                          <div className="space-y-4 pb-1">
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-zinc-600 dark:text-zinc-500 block">Member ID</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-foreground text-xs tracking-wider">{memberId}</span>
                                <button
                                  onClick={copyMemberId}
                                  className="text-zinc-500 hover:text-brand-gold transition-colors"
                                  title="Copy ID"
                                >
                                  {copiedId ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-zinc-600 dark:text-zinc-500 block">Member Since</span>
                              <span className="font-mono text-zinc-800 dark:text-zinc-300 text-xs">10/24</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-zinc-600 dark:text-zinc-500 block">Loyalty Status</span>
                              <span className="font-mono text-brand-gold text-xs font-bold">{stamps} / 10 Stamps</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Brand Logo on Lower Left Corner */}
                      <div className="absolute bottom-8 left-8 z-10">
                        <Image
                          src="/logo.png"
                          alt="Antonioni Grounds Logo"
                          width={140}
                          height={46}
                          className="h-9 w-auto object-contain invert dark:invert-0"
                        />
                      </div>

                      {/* Flip Icon Button */}
                      <button
                        onClick={() => setIsFlipped(false)}
                        className="absolute top-8 right-8 rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-brand-gold hover:border-brand-gold/30 transition-all active:scale-95 z-20"
                        title="View Stamp Card"
                      >
                        <RotateCcw size={16} />
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          )}

        </div>
      </div>


      {/* Claim Reward Success Modal */}
      <AnimatePresence>
        {showClaimSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClaimSuccess(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-card border border-card-border rounded-2xl p-8 z-10 glassmorphism shadow-2xl text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                <Gift size={32} className="animate-bounce" />
              </div>

              <span className="type-eyebrow text-emerald-600 dark:text-emerald-400 text-[10px] tracking-[0.25em] block">Transaction Success</span>
              <h3 className="type-h3 text-foreground font-serif mt-2 font-bold">Reward Claimed!</h3>
              <p className="type-body-sm text-neutral-500 dark:text-zinc-400 mt-2">
                Your complimentary Geisha Pour Over order has been successfully generated. Present this to your barista.
              </p>

              <div className="my-6 rounded-xl bg-background-alt/50 border border-card-border p-4 space-y-2 text-left">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Reward Ticket</span>
                  <span className="text-foreground font-mono font-semibold">#LN-REW-9988</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Offer Code</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">GEISHA-FREE</span>
                </div>
                <div className="flex justify-between text-xs border-t border-card-border pt-2">
                  <span className="text-zinc-500">Points Awarded</span>
                  <span className="text-brand-gold font-bold font-mono">+50 pts</span>
                </div>
              </div>

              <button
                onClick={() => setShowClaimSuccess(false)}
                className="w-full rounded-full bg-brand-gold text-black py-2.5 type-ui hover:bg-brand-gold-hover transition-colors font-bold"
              >
                Close Ticket
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expanded QR Code Modal */}
      <AnimatePresence>
        {isQrExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQrExpanded(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xs bg-card border border-card-border rounded-2xl p-8 z-10 glassmorphism shadow-2xl text-center flex flex-col items-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsQrExpanded(false)}
                className="absolute top-4 right-4 rounded-full p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <span className="type-eyebrow text-brand-gold text-[10px] tracking-[0.25em] block mb-2">Member ID Scanner</span>
              <h3 className="type-h3 text-foreground font-serif text-center font-bold mb-6">Your Loyalty QR Code</h3>

              {/* Large QR Code Container */}
              <div className="w-48 h-48 bg-white p-3 rounded-xl flex flex-col justify-center items-center relative overflow-hidden shadow-lg border border-zinc-200/50">
                {/* Gold scanning light simulation */}
                <div className="absolute left-0 right-0 h-1 bg-brand-gold opacity-75 shadow-[0_0_8px_#C5A880] animate-pulse z-10" style={{ animation: "scan 2.5s infinite ease-in-out" }} />
                
                {/* Virtual Stylized QR representation */}
                <div className="w-full h-full flex flex-col justify-between select-none">
                  <div className="flex justify-between h-10 w-full">
                    <div className="w-10 h-10 border-4 border-black p-0.5 flex justify-center items-center"><div className="w-5 h-5 bg-black" /></div>
                    <div className="flex-1 flex flex-col justify-around py-0.5 px-2 gap-0.5">
                      <div className="flex gap-0.5"><div className="w-2.5 h-1 bg-black" /><div className="w-3.5 h-1 bg-black" /><div className="w-2.5 h-1 bg-black" /></div>
                      <div className="flex gap-0.5"><div className="w-4.5 h-1 bg-black" /><div className="w-1.5 h-1 bg-black" /></div>
                    </div>
                    <div className="w-10 h-10 border-4 border-black p-0.5 flex justify-center items-center"><div className="w-5 h-5 bg-black" /></div>
                  </div>

                  <div className="flex-1 flex justify-between my-1.5 gap-1">
                    <div className="w-10 flex flex-col justify-around gap-0.5">
                      <div className="h-1 w-full bg-black" />
                      <div className="h-1 w-5 bg-black" />
                      <div className="h-1 w-7 bg-black" />
                    </div>
                    <div className="flex-1 grid grid-cols-6 gap-0.5 p-0.5">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 7 === 0 || i % 5 === 1 ? "bg-black" : "bg-transparent"}`} />
                      ))}
                    </div>
                    <div className="w-10 flex flex-col justify-around items-end gap-0.5">
                      <div className="h-1 w-full bg-black" />
                      <div className="h-1 w-3 bg-black" />
                      <div className="h-1 w-6 bg-black" />
                    </div>
                  </div>

                  <div className="flex justify-between h-10 w-full">
                    <div className="w-10 h-10 border-4 border-black p-0.5 flex justify-center items-center"><div className="w-5 h-5 bg-black" /></div>
                    <div className="flex-1 flex flex-col justify-around py-0.5 px-2 gap-0.5">
                      <div className="flex gap-0.5"><div className="w-2.5 h-1 bg-black" /><div className="w-2.5 h-1 bg-black" /></div>
                      <div className="flex gap-0.5"><div className="w-1.5 h-1 bg-black" /><div className="w-3.5 h-1 bg-black" /></div>
                    </div>
                    <div className="w-10 h-10 border-4 border-black/20 p-0.5 flex justify-center items-center"><div className="w-2 h-1 bg-black/40" /></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center space-y-1">
                <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[10px] tracking-wider uppercase block">Member Account ID</span>
                <span className="font-mono text-foreground text-sm font-bold tracking-wider">{memberId}</span>
              </div>
              
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center mt-4 max-w-[240px]">
                Scan this code at checkout to update your stamps and points balance.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CSS for scanline animation keyframe */}
      <style jsx global>{`
        @keyframes scan {
          0% {
            top: 4px;
          }
          50% {
            top: calc(100% - 8px);
          }
          100% {
            top: 4px;
          }
        }
        .loyalty-stamp-color {
          filter: brightness(0) !important;
        }
        .dark .loyalty-stamp-color {
          filter: brightness(0) invert(1) !important;
        }
      `}</style>
    </PageTransition>
  );
}
