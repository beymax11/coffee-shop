"use client";

import React from "react";
import { Search, Plus, Trash2, Check, X } from "lucide-react";
import { LoyaltyMember } from "@/utils/db";

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
    <div className="space-y-6 animate-fadeIn">
      {/* STAMP STATION - QR Scanner & Manual Input */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-xl border border-brand-gold/15 bg-[#14120E]/90 p-6 glassmorphism-gold shadow-lg">
        {/* Left Column: Simulated QR Scanner Viewport */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-gold gold-glow animate-pulse" />
            <h3 className="type-ui text-[11px] text-white font-bold tracking-wider">Simulated QR Code Scanner</h3>
          </div>

          <div className="relative h-44 rounded-lg bg-black border border-white/5 overflow-hidden flex flex-col items-center justify-center">
            {/* Scanner Grid Overlay */}
            {isScanning ? (
              <>
                <div className="absolute inset-0 border border-green-500/20 bg-green-500/[0.02]" />
                <div
                  className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[1px] bg-green-400 shadow-[0_0_8px_#22c55e] animate-pulse"
                  style={{ animation: "scan 2.5s infinite ease-in-out" }}
                />

                {/* Viewfinder brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-green-500" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-green-500" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-green-500" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-green-500" />

                <p className="type-caption text-green-400 font-mono text-[10px] animate-pulse absolute bottom-4">
                  CAMERA ACTIVE / SCANNING QR...
                </p>
              </>
            ) : (
              <div className="text-center p-4 space-y-2">
                <span className="type-caption text-zinc-500 block">Scanner camera is currently idle.</span>
                <button
                  onClick={() => setIsScanning(true)}
                  className="rounded-full bg-brand-gold text-black px-4 py-2 type-ui text-[9px] hover:bg-brand-gold-hover transition-colors font-bold shadow"
                >
                  Activate Scanner Camera
                </button>
              </div>
            )}
          </div>

          {isScanning && (
            <div className="flex gap-2">
              <select
                value={scanSelectId}
                onChange={(e) => setScanSelectId(e.target.value)}
                className="flex-1 rounded border border-white/10 bg-black/40 px-3 py-2 type-caption text-zinc-400 outline-none focus:border-brand-gold/60 text-xs"
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
                className="rounded bg-brand-gold text-black px-4 py-2 type-ui text-[10px] hover:bg-brand-gold-hover transition-colors font-bold disabled:opacity-50 disabled:pointer-events-none"
              >
                Scan QR
              </button>
              <button
                onClick={() => setIsScanning(false)}
                className="rounded border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white px-3 py-2 text-xs"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Manual Code Input & Notifications */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="type-ui text-[11px] text-white font-bold tracking-wider">Manual Stamp Input</h3>
            <p className="type-caption text-zinc-500 leading-normal text-[11px]">
              Enter the member's QR serial number below (e.g.{" "}
              <span className="font-mono text-zinc-400 font-semibold select-all">LN-882-901</span>) if the scanner
              camera is unavailable.
            </p>
          </div>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Enter LN-XXX-XXX code"
              value={manualSerialCode}
              onChange={(e) => setManualSerialCode(e.target.value)}
              className="flex-1 rounded border border-white/10 bg-black/40 py-2.5 px-3 type-field text-sm text-[#F5F5F0] outline-none focus:border-brand-gold/60 font-mono"
            />
            <button
              onClick={onManualStamp}
              className="rounded bg-brand-gold text-black px-5 py-2.5 type-ui text-[10px] hover:bg-brand-gold-hover transition-colors font-bold shadow gold-glow font-semibold"
            >
              Issue Stamp
            </button>
          </div>

          {/* Notifications Banner */}
          <div className="min-h-12 flex flex-col justify-center">
            {stampStatusMsg && (
              <div
                className={`rounded p-3 border type-caption text-xs flex items-center gap-2 ${
                  stampStatusMsg.type === "success"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {stampStatusMsg.type === "success" ? <Check size={14} /> : <X size={14} />}
                <span>{stampStatusMsg.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#121212] p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          <input
            type="text"
            placeholder="Search members by email or name..."
            value={loyaltySearch}
            onChange={(e) => setLoyaltySearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-4 type-caption text-[#F5F5F0] outline-none focus:border-brand-gold/60"
          />
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="flex items-center gap-1.5 rounded-full bg-brand-gold px-4 py-2 type-ui text-[10px] text-black hover:bg-brand-gold-hover transition-colors font-bold shadow shrink-0"
        >
          <Plus size={12} />
          Register Member
        </button>
      </div>

      {/* Member Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredLoyalty.map((member) => {
          const freeDrinkEarned = member.stamps === 9;
          return (
            <div
              key={member.id}
              className="rounded-xl border border-white/5 bg-[#121212] p-6 shadow-md hover:border-white/10 transition-colors flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="type-body font-bold text-white text-base">{member.name}</h4>
                    <p className="type-caption text-zinc-500 text-[11px]">{member.email}</p>
                    <p className="type-caption text-zinc-600 text-[9px] uppercase tracking-wider mt-1">
                      Joined {member.joinedAt}
                    </p>
                    <p className="type-caption text-zinc-600 text-[9px] font-mono mt-0.5">ID: {member.id}</p>
                  </div>
                  {freeDrinkEarned && (
                    <span className="bg-brand-gold text-black px-2.5 py-1 rounded text-[8px] font-bold type-ui tracking-wider gold-glow animate-pulse">
                      REWARD EARNED
                    </span>
                  )}
                </div>

                {/* Interactive Stamp circles */}
                <div className="mt-6">
                  <span className="type-label text-[10px] text-zinc-400 block mb-2.5">
                    Stamps collected: {member.stamps} / 9
                  </span>
                  <div className="grid grid-cols-9 gap-1.5 max-w-sm">
                    {[...Array(9)].map((_, idx) => {
                      const isStamped = idx < member.stamps;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            const newStamps = idx === member.stamps - 1 ? idx : idx + 1;
                            onSaveStampsDirect(member, newStamps);
                          }}
                          className={`h-7 w-7 rounded-full border transition-all flex items-center justify-center ${
                            isStamped
                              ? "bg-brand-gold/20 border-brand-gold text-brand-gold shadow gold-glow font-bold text-[10px]"
                              : "border-white/10 bg-black/40 text-zinc-700 hover:border-white/30"
                          }`}
                        >
                          {isStamped ? <Check size={10} /> : idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-white/5 pt-4">
                <button
                  onClick={() => onUpdateStamps(member, true)}
                  disabled={member.stamps >= 9}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded border border-white/10 bg-white/5 text-[10px] font-semibold type-ui text-zinc-300 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  + Stamp
                </button>

                {freeDrinkEarned ? (
                  <button
                    onClick={() => onRedeemFreeDrink(member)}
                    className="flex-1 py-1.5 rounded bg-brand-gold hover:bg-brand-gold-hover text-[10px] font-semibold type-ui text-black transition-colors"
                  >
                    Redeem Free Drink
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStamps(member, false)}
                    disabled={member.stamps === 0}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded border border-white/10 bg-white/5 text-[10px] font-semibold type-ui text-zinc-300 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    - Stamp
                  </button>
                )}

                <button
                  onClick={() => onDeleteLoyalty(member.id)}
                  className="p-1.5 rounded border border-white/5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Card"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
        {filteredLoyalty.length === 0 && (
          <div className="col-span-2 py-16 text-center text-zinc-500 italic type-body-sm">
            No loyalty members found.
          </div>
        )}
      </div>

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
