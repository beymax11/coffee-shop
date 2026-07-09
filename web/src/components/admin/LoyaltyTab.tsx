"use client";

import React from "react";
import { Search, Plus, Trash2, Check, X, Camera, ShieldCheck, Mail, Calendar, User, Zap } from "lucide-react";
import { LoyaltyMember } from "@/utils/db";
import { motion } from "framer-motion";

interface LoyaltyTabProps {
  loyaltyMembers: LoyaltyMember[];
  loyaltySearch: string;
  setLoyaltySearch: (search: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  scanSelectId: string;
  setScanSelectId: (id: string) => void;
  manualSerialCode: string;
  setManualSerialCode: (code: string) => void;
  stampStatusMsg: { type: "success" | "error"; text: string } | null;
  onManualStamp: () => void;
  onScanSimulate: () => void;
  onUpdateStamps: (member: LoyaltyMember, increment: boolean) => void;
  onDeleteLoyalty: (id: string) => void;
  onOpenRegisterModal: () => void;
  onSaveStampsDirect: (member: LoyaltyMember, stamps: number) => void;
  onRedeemFreeDrink: (member: LoyaltyMember) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export const LoyaltyTab: React.FC<LoyaltyTabProps> = ({
  loyaltyMembers,
  loyaltySearch,
  setLoyaltySearch,
  isScanning,
  setIsScanning,
  scanSelectId,
  setScanSelectId,
  manualSerialCode,
  setManualSerialCode,
  stampStatusMsg,
  onManualStamp,
  onScanSimulate,
  onUpdateStamps,
  onDeleteLoyalty,
  onOpenRegisterModal,
  onSaveStampsDirect,
  onRedeemFreeDrink,
}) => {
  // Filtered members list
  const filteredLoyalty = loyaltyMembers.filter((member) => {
    return (
      member.name.toLowerCase().includes(loyaltySearch.toLowerCase()) ||
      member.email.toLowerCase().includes(loyaltySearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* STAMP STATION - QR Scanner & Manual Input */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-2xl border border-brand-gold/15 bg-gradient-to-br from-[#12100E] to-[#0A0908] p-6 glassmorphism-gold shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-gold/5 blur-[90px] rounded-full pointer-events-none" />

        {/* Left Column: Simulated QR Scanner Viewport */}
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-brand-gold gold-glow animate-pulse shrink-0" />
            <h3 className="type-ui text-[11px] text-white font-bold tracking-wider">Simulated QR Code Scanner</h3>
          </div>

          <div className="relative h-44 rounded-xl bg-black border border-white/[0.08] overflow-hidden flex flex-col items-center justify-center shadow-inner group">
            {isScanning ? (
              <>
                <div className="absolute inset-0 border border-emerald-500/20 bg-emerald-500/[0.01]" />
                {/* Viewfinder brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-gold/60" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-gold/60" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-gold/60" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-gold/60" />

                {/* Animated Scanner Grid Overlay */}
                <div
                  className="absolute left-6 right-6 h-[1px] bg-brand-gold shadow-[0_0_10px_#C5A880] opacity-80"
                  style={{
                    animation: "scan 2.5s infinite ease-in-out"
                  }}
                />

                <p className="type-caption text-brand-gold font-mono text-[9px] tracking-widest animate-pulse absolute bottom-4 flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full border border-brand-gold/20">
                  <Camera size={10} className="animate-pulse" /> CAMERA ACTIVE / SCANNING...
                </p>
              </>
            ) : (
              <div className="text-center p-6 space-y-4">
                <span className="type-caption text-zinc-500 block text-xs">Simulated camera scanner is currently offline.</span>
                <button
                  onClick={() => setIsScanning(true)}
                  className="rounded-full bg-brand-gold text-black px-5 py-2.5 type-ui text-[9px] hover:bg-brand-gold-hover transition-all duration-300 font-bold shadow-lg shadow-brand-gold/10 cursor-pointer"
                >
                  Activate Scanner
                </button>
              </div>
            )}
          </div>

          {isScanning && (
            <div className="flex gap-2.5 animate-fadeIn">
              <select
                value={scanSelectId}
                onChange={(e) => setScanSelectId(e.target.value)}
                className="flex-1 rounded-full border border-white/10 bg-black/50 px-4 py-2.5 type-caption text-zinc-400 outline-none transition-all duration-300 focus:border-brand-gold/60 text-xs cursor-pointer"
              >
                <option value="">Select customer QR to scan...</option>
                {loyaltyMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.id})
                  </option>
                ))}
              </select>
              <button
                onClick={onScanSimulate}
                disabled={!scanSelectId}
                className="rounded-full bg-[#2E5A44] text-white px-5 py-2.5 type-ui text-[9px] hover:bg-[#234533] transition-all duration-300 font-bold disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-[#2E5A44]/15 cursor-pointer shrink-0"
              >
                Scan QR
              </button>
              <button
                onClick={() => setIsScanning(false)}
                className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white px-4 py-2.5 text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Manual Code Input & Notifications */}
        <div className="flex flex-col justify-between space-y-4 relative z-10">
          <div className="space-y-2">
            <h3 className="type-ui text-[11px] text-white font-bold tracking-wider">Manual Stamp Input</h3>
            <p className="type-caption text-zinc-400 leading-relaxed text-[11px]">
              Enter the card's QR serial number below (e.g.{" "}
              <span className="font-mono text-zinc-300 bg-white/[0.04] px-1.5 py-0.5 rounded select-all font-semibold border border-white/[0.06]">LN-882-901</span>) if camera simulation is not used.
            </p>
          </div>

          <div className="flex gap-2.5">
            <input
              type="text"
              placeholder="Enter LN-XXX-XXX code"
              value={manualSerialCode}
              onChange={(e) => setManualSerialCode(e.target.value)}
              className="flex-1 rounded-full border border-white/10 bg-black/40 py-2.5 px-4 type-field text-xs text-[#F5F5F0] outline-none transition-all duration-300 focus:border-brand-gold/60 focus:bg-black/60 font-mono focus:ring-1 focus:ring-brand-gold/20"
            />
            <button
              onClick={onManualStamp}
              className="rounded-full bg-brand-gold text-black px-6 py-2.5 type-ui text-[9px] hover:bg-brand-gold-hover transition-all duration-300 font-bold shadow-lg shadow-brand-gold/15 cursor-pointer shrink-0 font-semibold"
            >
              Issue Stamp
            </button>
          </div>

          {/* Notifications Banner */}
          <div className="min-h-12 flex flex-col justify-center">
            {stampStatusMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl p-3.5 border type-caption text-xs flex items-start gap-2.5 shadow-md ${
                  stampStatusMsg.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {stampStatusMsg.type === "success" ? (
                  <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                ) : (
                  <X size={14} className="shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{stampStatusMsg.text}</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#0A0A0A]/50 backdrop-blur-sm p-4 shadow-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          <input
            type="text"
            placeholder="Search members by email or name..."
            value={loyaltySearch}
            onChange={(e) => setLoyaltySearch(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-black/40 py-2.5 pl-10 pr-4 type-caption text-[#F5F5F0] outline-none transition-all duration-300 focus:border-brand-gold/60 focus:bg-black/60 focus:ring-1 focus:ring-brand-gold/20"
          />
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="flex items-center gap-1.5 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-5 py-2.5 type-ui text-[9px] text-white transition-all duration-300 font-bold shadow-lg shadow-[#2E5A44]/10 hover:shadow-[#234533]/25 cursor-pointer shrink-0"
        >
          <Plus size={13} />
          Register Member
        </button>
      </div>

      {/* Member Directory Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {filteredLoyalty.map((member) => {
          const freeDrinkEarned = member.stamps === 9;
          return (
            <motion.div
              key={member.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#121212] via-[#0D0D0D] to-[#151515] p-6 shadow-2xl relative overflow-hidden transition-all duration-300 flex flex-col justify-between gap-5 hover:border-brand-gold/15"
            >
              {/* Luxury gold highlight inside the loyalty card */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/[0.01] blur-[25px] rounded-full pointer-events-none" />

              <div>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="type-body font-bold text-white text-base font-serif tracking-wide">{member.name}</h4>
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                      <Mail size={11} className="shrink-0" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-2 text-[9px] tracking-wide text-zinc-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} className="shrink-0" />
                        <span>JOINED: {member.joinedAt}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.05] text-zinc-400">
                        <span>ID: {member.id}</span>
                      </div>
                    </div>
                  </div>

                  {freeDrinkEarned && (
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="bg-brand-gold text-black px-2.5 py-1 rounded-full text-[8px] font-bold type-ui tracking-wider gold-glow"
                    >
                      REWARD UNLOCKED
                    </motion.span>
                  )}
                </div>

                {/* Interactive Stamp circles */}
                <div className="mt-6 border-t border-white/[0.04] pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="type-label text-[10px] text-zinc-400 flex items-center gap-1.5 font-bold">
                      <Zap size={11} className="text-brand-gold" /> stamps collected: {member.stamps} / 9
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-9 gap-2.5 max-w-[340px]">
                    {[...Array(9)].map((_, idx) => {
                      const isStamped = idx < member.stamps;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            const newStamps = idx === member.stamps - 1 ? idx : idx + 1;
                            onSaveStampsDirect(member, newStamps);
                          }}
                          className={`h-7 w-7 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                            isStamped
                              ? "bg-brand-gold/20 border-brand-gold text-brand-gold shadow gold-glow font-bold text-[9px] scale-105"
                              : "border-white/10 bg-black/40 text-zinc-600 hover:border-white/30 hover:bg-black/60 text-[9px] font-semibold"
                          }`}
                        >
                          {isStamped ? <Check size={11} className="stroke-[3]" /> : idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-white/[0.04] pt-4">
                <button
                  onClick={() => onUpdateStamps(member, true)}
                  disabled={member.stamps >= 9}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-full border border-white/10 bg-white/[0.02] text-[10px] font-bold type-ui text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                >
                  + Stamp
                </button>

                {freeDrinkEarned ? (
                  <button
                    onClick={() => onRedeemFreeDrink(member)}
                    className="flex-1 py-2 rounded-full bg-brand-gold hover:bg-brand-gold-hover text-[10px] font-bold type-ui text-black transition-all duration-300 shadow-md shadow-brand-gold/15 cursor-pointer animate-pulse"
                  >
                    Redeem Drink
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStamps(member, false)}
                    disabled={member.stamps === 0}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-full border border-white/10 bg-white/[0.02] text-[10px] font-bold type-ui text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-all duration-300 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                  >
                    - Stamp
                  </button>
                )}

                <button
                  onClick={() => onDeleteLoyalty(member.id)}
                  className="p-2 rounded-full border border-white/5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 cursor-pointer"
                  title="Delete Card"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          );
        })}
        {filteredLoyalty.length === 0 && (
          <div className="col-span-2 py-16 text-center text-zinc-500 italic type-body-sm bg-black/10 border border-dashed border-white/[0.06] rounded-2xl">
            No loyalty members found matching this filter.
          </div>
        )}
      </motion.div>

      {/* CSS for scanner scanline animation */}
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
    </div>
  );
};
