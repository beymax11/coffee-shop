"use client";

import React, { useState, useEffect } from "react";
import { 
  Coffee, 
  QrCode, 
  Gift, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Award, 
  Check, 
  Plus, 
  RotateCcw, 
  User, 
  Copy, 
  MapPin, 
  Info,
  X,
  CreditCard
} from "lucide-react";
import { FadeUp, PageTransition, StaggerContainer, StaggerItem } from "@/components/animations";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/utils/db";

interface ActivityLog {
  id: string;
  date: string;
  action: string;
  stampsEarned: number;
  points: number;
  location: string;
}

export function LoyaltyView() {
  const memberId = "LN-882-901";
  
  const [stamps, setStamps] = useState<number>(5);
  const [points, setPoints] = useState<number>(720);
  const [tier, setTier] = useState<"Bronze" | "Gold" | "Platinum">("Gold");
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Sync with DB
  useEffect(() => {
    const syncFromDb = () => {
      const members = db.getLoyaltyMembers();
      const current = members.find((m) => m.id === memberId);
      if (current) {
        setStamps(current.stamps);
        setPoints(current.points);
      }
    };
    syncFromDb();

    window.addEventListener("storage", syncFromDb);
    return () => window.removeEventListener("storage", syncFromDb);
  }, []);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "act-1",
      date: "Today, 14:32",
      action: "Geisha Pour Over Purchase",
      stampsEarned: 1,
      points: 25,
      location: "San Jose Salon",
    },
    {
      id: "act-2",
      date: "June 27, 2026",
      action: "Matte Black Espresso & Croissant",
      stampsEarned: 1,
      points: 35,
      location: "San Jose Salon",
    },
    {
      id: "act-3",
      date: "June 22, 2026",
      action: "Single-Origin Beans Pack",
      stampsEarned: 2,
      points: 60,
      location: "Boutique Online",
    },
    {
      id: "act-4",
      date: "June 15, 2026",
      action: "Signature Rose Cardamom Latte",
      stampsEarned: 1,
      points: 20,
      location: "Beverly Hills Salon",
    },
  ]);

  // Recalculate tier based on points
  useEffect(() => {
    if (points >= 1500) {
      setTier("Platinum");
    } else if (points >= 500) {
      setTier("Gold");
    } else {
      setTier("Bronze");
    }
  }, [points]);

  const copyMemberId = () => {
    navigator.clipboard.writeText(memberId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSimulatePurchase = () => {
    if (stamps >= 9) {
      // Prompt user to claim reward first
      alert("You have filled your card! Please claim your Complimentary Reserve Reward.");
      return;
    }
    
    const newStamps = stamps + 1;
    const newPoints = points + 25;
    setStamps(newStamps);
    setPoints(newPoints);

    // Save back to db
    const members = db.getLoyaltyMembers();
    const current = members.find((m) => m.id === memberId);
    if (current) {
      db.saveLoyaltyMember({
        ...current,
        stamps: newStamps,
        points: newPoints
      });
    }

    const now = new Date();
    const formattedDate = `Today, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      date: formattedDate,
      action: "Simulated Espresso Order",
      stampsEarned: 1,
      points: 25,
      location: "Boutique Simulator",
    };

    setActivityLogs([newLog, ...activityLogs]);
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
    
    const now = new Date();
    const formattedDate = `Today, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      date: formattedDate,
      action: "Claimed Complimentary Geisha Pour Over",
      stampsEarned: -9,
      points: 50,
      location: "Boutique Simulator",
    };

    setActivityLogs([newLog, ...activityLogs]);
  };

  const handleResetSimulator = () => {
    setStamps(0);
    setPoints(280);

    // Save back to db
    const members = db.getLoyaltyMembers();
    const current = members.find((m) => m.id === memberId);
    if (current) {
      db.saveLoyaltyMember({
        ...current,
        stamps: 0,
        points: 280
      });
    }

    setActivityLogs([
      {
        id: "act-reset",
        date: "Just Now",
        action: "Loyalty Card Initialized",
        stampsEarned: 0,
        points: 0,
        location: "System Reset",
      }
    ]);
  };

  // Calculating progress to next tier
  const getTierProgress = () => {
    if (tier === "Bronze") {
      return (points / 500) * 100;
    } else if (tier === "Gold") {
      return ((points - 500) / 1000) * 100; // 500 to 1500
    }
    return 100; // Platinum maxed
  };

  const getPointsToNextTier = () => {
    if (tier === "Bronze") return 500 - points;
    if (tier === "Gold") return 1500 - points;
    return 0;
  };

  const nextTierName = () => {
    if (tier === "Bronze") return "Gold Status";
    if (tier === "Gold") return "Platinum Reserve";
    return "";
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0B0B0B] py-16 md:py-24 text-[#F5F5F0]">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          
          {/* Header Title */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="type-eyebrow">Exclusive Rewards Lounge</span>
            <h1 className="type-h1 text-white mt-2">
              L&apos;OR NOIR Loyalty Card
            </h1>
            <div className="h-[1px] w-12 bg-brand-gold mx-auto mt-4" />
            <p className="type-body text-zinc-400 mt-4">
              Your key to custom salon experiences, complimentary Geisha reserves, and priority allocation of microlot roasts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left/Middle Column: Membership Card & Stamp Card */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Virtual Membership Card */}
              <FadeUp className="relative overflow-hidden rounded-2xl border border-brand-gold/15 bg-gradient-to-br from-[#1c1a16] to-[#121212] p-8 glassmorphism-gold shadow-xl flex flex-col justify-between min-h-[240px] gold-glow">
                {/* Accent Watermark */}
                <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 text-[#23201a] select-none type-watermark-lg font-serif pointer-events-none opacity-20">
                  L&apos;OR
                </div>
                
                <div className="flex justify-between items-start z-10">
                  <div>
                    <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">L&apos;OR NOIR MEMBER CARD</span>
                    <h2 className="type-h2 text-white font-serif mt-1 font-bold">Alexander Vance</h2>
                    <p className="type-caption text-zinc-400 mt-0.5">Premium Lounge Member</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="rounded-full bg-brand-gold/10 border border-brand-gold/30 px-3 py-1 text-[10px] text-brand-gold uppercase font-bold tracking-wider">
                      {tier} Member
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-end z-10">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Member ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white text-sm tracking-wider">{memberId}</span>
                      <button 
                        onClick={copyMemberId}
                        className="text-zinc-500 hover:text-brand-gold transition-colors"
                        title="Copy ID"
                      >
                        {copiedId ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Total points</span>
                      <span className="text-xl font-bold font-serif text-brand-gold">{points} pts</span>
                    </div>
                    
                    <button 
                      onClick={() => setShowQRModal(true)}
                      className="rounded-xl bg-brand-gold text-black p-3 hover:scale-105 active:scale-95 transition-all shadow-md gold-glow"
                      title="Show Barcode / QR Code"
                    >
                      <QrCode size={20} />
                    </button>
                  </div>
                </div>
              </FadeUp>

              {/* Loyalty Stamp Card */}
              <FadeUp delay={0.1} className="rounded-2xl border border-white/5 bg-[#141414] p-8 glassmorphism shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h3 className="type-h3 text-white">Interactive Coffee Stamp Card</h3>
                    <p className="type-caption text-zinc-400 mt-1">Buy 9 coffees, get the 10th complimentary.</p>
                  </div>
                  
                  {stamps >= 9 ? (
                    <button 
                      onClick={handleClaimReward}
                      className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 type-ui flex items-center gap-1.5 transition-all shadow-lg animate-pulse"
                    >
                      <Gift size={14} />
                      Claim Complimentary Geisha
                    </button>
                  ) : (
                    <div className="text-right bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                      <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">Card Progress</span>
                      <span className="text-sm font-semibold text-brand-gold">{stamps} / 9 Stamps</span>
                    </div>
                  )}
                </div>

                {/* Stamp Card Grid */}
                <div className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 9 }).map((_, idx) => {
                    const isStamped = idx < stamps;
                    return (
                      <div 
                        key={idx}
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all duration-300 ${
                          isStamped 
                            ? "bg-brand-gold/10 border-brand-gold/40 shadow-inner" 
                            : "bg-[#181818] border-white/5"
                        }`}
                      >
                        {isStamped ? (
                          <motion.div 
                            initial={{ scale: 0.5, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex flex-col items-center justify-center text-brand-gold"
                          >
                            <Coffee size={24} className="fill-brand-gold/20" />
                            <span className="text-[9px] uppercase font-bold tracking-wider mt-1 opacity-70">Stamped</span>
                          </motion.div>
                        ) : (
                          <span className="text-zinc-600 font-bold text-lg font-mono">{idx + 1}</span>
                        )}
                      </div>
                    );
                  })}

                  {/* Stamp 10: Reward Slot */}
                  <div 
                    className={`col-span-1 aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all duration-500 ${
                      stamps >= 9 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg gold-glow" 
                        : "bg-[#181818] border-white/10 border-dashed text-zinc-500"
                    }`}
                  >
                    <Gift size={24} className={stamps >= 9 ? "animate-bounce text-emerald-400" : ""} />
                    <span className="text-[9px] uppercase font-bold tracking-wider mt-1 text-center leading-tight">
                      {stamps >= 9 ? "Claim!" : "10th Free"}
                    </span>
                  </div>
                </div>

                <div className="mt-8 rounded-xl bg-white/5 border border-white/5 p-4 flex gap-3 items-start">
                  <Info size={16} className="text-brand-gold shrink-0 mt-0.5" />
                  <p className="type-caption text-zinc-400 leading-relaxed">
                    Stamps are automatically issued upon checkout for any handcrafted beverage purchases when your loyalty ID is scanned. Complimentary drinks include any signature coffees, including Geisha reserve microlots.
                  </p>
                </div>
              </FadeUp>

              {/* Simulator Action Center */}
              <FadeUp delay={0.15} className="rounded-2xl border border-brand-gold/10 bg-[#161412] p-6 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-brand-gold" />
                  <h4 className="type-subheading text-white text-xs">Sandbox Simulator Control Panel</h4>
                </div>
                <p className="type-caption text-zinc-400 mb-6">
                  Test the interactive loyalty logic! Add stamps to fill the card, view the real-time activity ledger update, and claim your free beverage.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleSimulatePurchase}
                    disabled={stamps >= 9}
                    className="flex-1 min-w-[150px] flex items-center justify-center gap-2 rounded-full bg-brand-gold text-black py-2.5 px-4 type-ui hover:bg-brand-gold-hover transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                    Simulate Coffee Purchase
                  </button>

                  <button 
                    onClick={handleResetSimulator}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white py-2.5 px-4 type-ui transition-all"
                  >
                    <RotateCcw size={14} />
                    Reset Card
                  </button>
                </div>
              </FadeUp>

            </div>

            {/* Right Column: Tiers & Activity Log */}
            <div className="space-y-8">
              
              {/* Tiers & Status */}
              <FadeUp delay={0.2} className="rounded-2xl border border-white/5 bg-[#141414] p-8 glassmorphism shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="type-h3 text-white">Membership Status</h3>
                  <Award size={18} className="text-brand-gold" />
                </div>

                {/* Progress bar to next level */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400 font-semibold">{tier} Status</span>
                    <span className="text-brand-gold font-bold">{points} total pts</span>
                  </div>
                  
                  {tier !== "Platinum" ? (
                    <>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-gold rounded-full transition-all duration-700" 
                          style={{ width: `${getTierProgress()}%` }}
                        />
                      </div>
                      <p className="type-caption text-zinc-500">
                        {getPointsToNextTier()} points remaining for <span className="text-brand-gold">{nextTierName()}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="h-1.5 w-full bg-brand-gold rounded-full" />
                      <p className="type-caption text-zinc-500">
                        You have attained the ultimate tier: <span className="text-brand-gold font-bold">Platinum Reserve</span>
                      </p>
                    </>
                  )}
                </div>

                {/* Tiers details list */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className={`p-3 rounded-xl border transition-all ${tier === "Bronze" ? "bg-white/5 border-brand-gold/30" : "border-white/5 bg-transparent"}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-zinc-300">BRONZE LEVEL</span>
                      <span className="text-[10px] text-zinc-500">0 - 499 pts</span>
                    </div>
                    <ul className="text-[10px] text-zinc-400 list-disc list-inside space-y-0.5">
                      <li>Earn 1 stamp per beverage</li>
                      <li>Standard lounge reservations</li>
                    </ul>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all ${tier === "Gold" ? "bg-brand-gold/5 border-brand-gold/30" : "border-white/5 bg-transparent"}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-brand-gold">GOLD STATUS</span>
                      <span className="text-[10px] text-brand-gold/60">500 - 1499 pts</span>
                    </div>
                    <ul className="text-[10px] text-zinc-400 list-disc list-inside space-y-0.5">
                      <li>10% off beans & merchandise purchase</li>
                      <li>Double points events access</li>
                      <li>Priority lounge booking</li>
                    </ul>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all ${tier === "Platinum" ? "bg-brand-gold/10 border-brand-gold/40" : "border-white/5 bg-transparent"}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-[#E2C59D]">PLATINUM RESERVE</span>
                      <span className="text-[10px] text-[#E2C59D]/60">1500+ pts</span>
                    </div>
                    <ul className="text-[10px] text-zinc-400 list-disc list-inside space-y-0.5">
                      <li>Complimentary private tasting flights</li>
                      <li>Private event booking fee waived</li>
                      <li>Personalized coffee selector service</li>
                    </ul>
                  </div>
                </div>
              </FadeUp>

              {/* Activity Ledger */}
              <FadeUp delay={0.25} className="rounded-2xl border border-white/5 bg-[#141414] p-8 glassmorphism shadow-lg flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="type-h3 text-white">Recent Activity</h3>
                  <Clock size={16} className="text-zinc-500" />
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  <AnimatePresence initial={false}>
                    {activityLogs.map((log) => (
                      <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-between items-start border-b border-white/5 pb-3 last:border-b-0 last:pb-0"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-medium text-white block">{log.action}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-zinc-500">{log.date}</span>
                            <span className="text-[9px] text-zinc-500 flex items-center gap-0.5">
                              <MapPin size={8} /> {log.location}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-brand-gold block">+{log.points} pts</span>
                          {log.stampsEarned !== 0 && (
                            <span className={`text-[9px] ${log.stampsEarned > 0 ? "text-emerald-400" : "text-amber-500"}`}>
                              {log.stampsEarned > 0 ? `+${log.stampsEarned}` : log.stampsEarned} stamp{Math.abs(log.stampsEarned) > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </FadeUp>

            </div>

          </div>

        </div>
      </div>

      {/* QR Scanning modal */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#121212] border border-brand-gold/20 rounded-2xl p-8 z-10 glassmorphism-gold shadow-2xl text-center"
            >
              <button 
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 rounded-full border border-white/5 bg-white/5 p-2 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <span className="type-eyebrow text-[10px] tracking-[0.25em]">Salon Register Scan</span>
              <h3 className="type-h3 text-white font-serif mt-2 font-bold">Alexander Vance</h3>
              <p className="type-caption text-zinc-500">Scan at any register to log your purchase.</p>

              {/* Barcode/QR Code Visualization */}
              <div className="my-8 mx-auto w-48 h-48 bg-white p-4 rounded-xl flex flex-col justify-center items-center relative overflow-hidden group shadow-inner">
                {/* Gold scanning light simulation */}
                <div className="absolute left-0 right-0 h-1 bg-brand-gold opacity-75 shadow-[0_0_8px_#C5A880] animate-pulse" style={{ animation: "scan 2.5s infinite ease-in-out" }} />
                
                {/* Virtual Stylized QR representation */}
                <div className="w-full h-full flex flex-col justify-between select-none">
                  {/* Rows of block indicators simulating a luxury QR code */}
                  <div className="flex justify-between h-10 w-full">
                    <div className="w-10 h-10 border-4 border-black p-1 flex justify-center items-center"><div className="w-4 h-4 bg-black" /></div>
                    <div className="flex-1 flex flex-col justify-around py-1 px-2 gap-1">
                      <div className="flex gap-1"><div className="w-2 h-2 bg-black" /><div className="w-4 h-2 bg-black" /><div className="w-2 h-2 bg-black" /></div>
                      <div className="flex gap-1"><div className="w-5 h-2 bg-black" /><div className="w-2 h-2 bg-black" /></div>
                    </div>
                    <div className="w-10 h-10 border-4 border-black p-1 flex justify-center items-center"><div className="w-4 h-4 bg-black" /></div>
                  </div>

                  <div className="flex-1 flex justify-between my-2 gap-2">
                    <div className="w-10 flex flex-col justify-around gap-1">
                      <div className="h-2 w-full bg-black" />
                      <div className="h-2 w-6 bg-black" />
                      <div className="h-2 w-8 bg-black" />
                    </div>
                    <div className="flex-1 grid grid-cols-6 gap-1 p-1">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 7 === 0 ? "bg-black" : "bg-transparent"}`} />
                      ))}
                    </div>
                    <div className="w-10 flex flex-col justify-around items-end gap-1">
                      <div className="h-2 w-full bg-black" />
                      <div className="h-2 w-4 bg-black" />
                      <div className="h-2 w-8 bg-black" />
                    </div>
                  </div>

                  <div className="flex justify-between h-10 w-full">
                    <div className="w-10 h-10 border-4 border-black p-1 flex justify-center items-center"><div className="w-4 h-4 bg-black" /></div>
                    <div className="flex-1 flex flex-col justify-around py-1 px-2 gap-1">
                      <div className="flex gap-1"><div className="w-3 h-2 bg-black" /><div className="w-3 h-2 bg-black" /></div>
                      <div className="flex gap-1"><div className="w-2 h-2 bg-black" /><div className="w-4 h-2 bg-black" /></div>
                    </div>
                    <div className="w-10 h-10 border-4 border-black/20 p-1 flex justify-center items-center"><div className="w-2 h-2 bg-black/40" /></div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-zinc-400 text-sm tracking-widest">{memberId}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Scan code updates immediately</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#121212] border border-emerald-500/20 rounded-2xl p-8 z-10 glassmorphism shadow-2xl text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                <Gift size={32} className="animate-bounce" />
              </div>

              <span className="type-eyebrow text-emerald-400 text-[10px] tracking-[0.25em] block">Transaction Success</span>
              <h3 className="type-h3 text-white font-serif mt-2 font-bold">Reward Claimed!</h3>
              <p className="type-caption text-zinc-400 mt-2 leading-relaxed">
                Your complimentary Geisha Pour Over order has been successfully generated. Present this to your barista.
              </p>

              <div className="my-6 rounded-xl bg-white/5 border border-white/5 p-4 space-y-2 text-left">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Reward Ticket</span>
                  <span className="text-white font-mono font-semibold">#LN-REW-9988</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Offer Code</span>
                  <span className="text-emerald-400 font-bold font-mono">GEISHA-FREE</span>
                </div>
                <div className="flex justify-between text-xs border-t border-white/5 pt-2">
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
      `}</style>
    </PageTransition>
  );
}
