"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Trash2, Check, ShieldCheck, X, Camera, Mail, Calendar, Zap, QrCode, Eye, AlertTriangle } from "lucide-react";
import { LoyaltyMember } from "@/utils/db";
import { motion, AnimatePresence } from "framer-motion";
import jsQR from "jsqr";

interface LoyaltyTabProps {
  loyaltyMembers: LoyaltyMember[];
  loyaltySearch: string;
  setLoyaltySearch: (search: string) => void;
  onDeleteLoyalty: (id: string) => void;
  onOpenRegisterModal: () => void;
  onRedeemFreeDrink: (member: LoyaltyMember) => void;
  onAwardStamp: (member: LoyaltyMember) => void;
  onRevokeStamp: (member: LoyaltyMember) => void;
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
  onDeleteLoyalty,
  onOpenRegisterModal,
  onRedeemFreeDrink,
  onAwardStamp,
  onRevokeStamp,
}) => {
  // Local state for scan & confirm flows
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isEnterIdModalOpen, setIsEnterIdModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<LoyaltyMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<LoyaltyMember | null>(null);
  const [scanSelectId, setScanSelectId] = useState("");
  const [manualInputId, setManualInputId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Camera scanning refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Run camera when scan modal opens
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
          animationFrameIdRef.current = requestAnimationFrame(scanTick);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setErrorMsg("Could not access camera. Please check camera permissions.");
      }
    };

    if (isScanModalOpen) {
      setErrorMsg(null);
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanModalOpen]);

  const scanTick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            const scannedId = code.data.trim();
            const member = loyaltyMembers.find(
              (m) => m.id.toLowerCase() === scannedId.toLowerCase()
            );

            if (member) {
              setSelectedMember(member);
              setIsScanModalOpen(false);
              setIsConfirmModalOpen(true);
              stopCamera();
              return;
            } else {
              setErrorMsg(`Unknown QR code / Member ID: "${scannedId}"`);
            }
          }
        }
      }
    }
    // Continue scanning if modal is still open
    if (isScanModalOpen) {
      animationFrameIdRef.current = requestAnimationFrame(scanTick);
    }
  };

  // Filtered members list
  const filteredLoyalty = loyaltyMembers.filter((member) => {
    return (
      member.name.toLowerCase().includes(loyaltySearch.toLowerCase()) ||
      member.email.toLowerCase().includes(loyaltySearch.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* STAMP STATION */}
      <div className="rounded-2xl border border-brand-green/25 bg-gradient-to-br from-card to-background-alt/30 p-6 glassmorphism-gold shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-green/5 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-green green-glow animate-pulse shrink-0" />
              <h3 className="type-ui text-sm text-foreground font-bold tracking-wider uppercase">Stamp Station</h3>
            </div>
            <p className="type-caption text-neutral-500 dark:text-zinc-400 leading-relaxed text-xs">
              Scan customer QR code or enter Member ID manually to award loyalty stamps. Buy 9 cups, get the 10th free.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setErrorMsg(null);
                setScanSelectId("");
                setIsScanModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-full bg-brand-green text-white px-6 py-3 type-ui text-xs hover:bg-brand-green-hover transition-all duration-300 font-bold shadow-lg shadow-brand-green/15 cursor-pointer green-glow"
            >
              <QrCode size={15} />
              Scan QR Code
            </button>
            <button
              onClick={() => {
                setErrorMsg(null);
                setManualInputId("");
                setIsEnterIdModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-full border border-card-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-neutral-500 dark:text-zinc-300 hover:text-white px-5 py-3 type-ui text-xs transition-all duration-300 cursor-pointer"
            >
              <Plus size={15} />
              Enter Member ID
            </button>
          </div>
        </div>
      </div>

      {/* Filter Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-card-border bg-card/50 backdrop-blur-sm p-4 shadow-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-zinc-500" size={14} />
          <input
            type="text"
            placeholder="Search members by email or name..."
            value={loyaltySearch}
            onChange={(e) => setLoyaltySearch(e.target.value)}
            className="w-full rounded-full border border-card-border bg-background/40 py-2.5 pl-10 pr-4 type-caption text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background/80 focus:ring-1 focus:ring-brand-green/20"
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
              className="rounded-2xl border border-card-border bg-gradient-to-br from-card via-card/90 to-background-alt/30 p-6 shadow-2xl relative overflow-hidden transition-all duration-300 flex flex-col justify-between gap-5 hover:border-brand-green/25"
            >
              {/* Luxury green highlight inside the loyalty card */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/[0.01] blur-[25px] rounded-full pointer-events-none" />

              <div>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="type-body font-bold text-foreground text-base font-serif tracking-wide">{member.name}</h4>
                    <div className="flex items-center gap-1.5 text-neutral-500 dark:text-zinc-500 text-[10px]">
                      <Mail size={11} className="shrink-0" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 text-[9px] tracking-wide text-neutral-500 dark:text-zinc-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} className="shrink-0" />
                        <span>JOINED: {member.joinedAt}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono bg-brand-green/10 px-2 py-0.5 rounded-md border border-brand-green/20 text-brand-green dark:text-emerald-400 text-[10px] font-bold w-fit tracking-wider shadow-sm shadow-brand-green/5 mt-0.5">
                        <span>ID: {member.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {freeDrinkEarned && (
                      <motion.span
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-brand-green text-white px-2.5 py-1 rounded-full text-[8px] font-bold type-ui tracking-wider green-glow"
                      >
                        REWARD UNLOCKED
                      </motion.span>
                    )}
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setIsDetailsModalOpen(true);
                      }}
                      className="p-2 rounded-full border border-card-border/40 text-neutral-500 dark:text-zinc-500 hover:text-brand-green hover:bg-brand-green/10 hover:border-brand-green/20 transition-all duration-300 cursor-pointer"
                      title="View Details & Manage Stamps"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setMemberToDelete(member);
                        setIsDeleteConfirmOpen(true);
                      }}
                      className="p-2 rounded-full border border-card-border/40 text-neutral-500 dark:text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 cursor-pointer"
                      title="Delete Card"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Interactive Stamp circles */}
                <div className="mt-3 border-t border-card-border/40 pt-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="type-label text-[10px] text-neutral-500 dark:text-zinc-400 flex items-center gap-1.5 font-bold">
                      <Zap size={11} className="text-brand-green" /> stamps collected: {member.stamps} / 9
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-9 gap-2.5 max-w-[340px]">
                    {[...Array(9)].map((_, idx) => {
                      const isStamped = idx < member.stamps;
                      return (
                        <div
                          key={idx}
                          className={`h-7 w-7 rounded-full border transition-all duration-300 flex items-center justify-center ${
                            isStamped
                              ? "bg-brand-green/20 border-brand-green text-brand-green shadow green-glow font-bold text-[9px] scale-105"
                              : "border-card-border bg-foreground/[0.03] text-neutral-400 dark:text-zinc-600 dark:bg-black/40 text-[9px] font-semibold"
                          }`}
                        >
                          {isStamped ? <Check size={11} className="stroke-[3]" /> : idx + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {freeDrinkEarned && (
                <div className="border-t border-card-border/40 pt-4">
                  <button
                    onClick={() => onRedeemFreeDrink(member)}
                    className="w-full py-2 rounded-full bg-brand-green hover:bg-brand-green-hover text-[10px] font-bold type-ui text-white transition-all duration-300 shadow-md shadow-brand-green/15 cursor-pointer animate-pulse"
                  >
                    Redeem Drink
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
        {filteredLoyalty.length === 0 && (
          <div className="col-span-2 py-16 text-center text-neutral-500 italic type-body-sm bg-foreground/[0.03] border border-dashed border-card-border rounded-2xl">
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

      {/* QR Code Scanner simulation Modal */}
      <AnimatePresence>
        {isScanModalOpen && (
          <motion.div
            key="scan-modal-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScanModalOpen(false)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="w-full max-w-md rounded-2xl border border-card-border bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-[40px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none" />

              <button
                onClick={() => setIsScanModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-all p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 rounded-xl bg-brand-green/10 text-brand-green">
                  <Camera size={18} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-base">QR Code Scanner</h3>
                  <p className="type-caption text-[10px] text-neutral-500 dark:text-zinc-400">Position the customer's QR code within the frame</p>
                </div>
              </div>

              {/* Camera Simulation Viewfinder */}
              <div className="relative h-48 rounded-xl bg-zinc-950 border border-card-border overflow-hidden flex flex-col items-center justify-center shadow-inner mb-6 group">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scanner Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] opacity-35" />
                <div className="absolute inset-0 border border-emerald-500/10 bg-emerald-500/[0.01]" />
                
                {/* Viewfinder brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-green green-glow" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-green green-glow" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-green green-glow" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-green green-glow" />

                {/* Scanning line animation */}
                <div
                  className="absolute left-6 right-6 h-[1.5px] bg-brand-green shadow-[0_0_10px_#2E5A44] opacity-80"
                  style={{
                    animation: "scan 2.5s infinite ease-in-out"
                  }}
                />

                <p className="type-caption text-brand-green font-mono text-[9px] tracking-widest animate-pulse absolute bottom-4 flex items-center gap-1.5 bg-black/80 px-3.5 py-1.5 rounded-full border border-brand-green/20 shadow-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green green-glow animate-ping" />
                  CAMERA ACTIVE / SCANNING...
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold uppercase">
                    Select Customer Card to Simulate Scan
                  </label>
                  <select
                    value={scanSelectId}
                    onChange={(e) => {
                      setScanSelectId(e.target.value);
                      setErrorMsg(null);
                    }}
                    className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-caption text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background/80 text-xs cursor-pointer font-medium focus:ring-1 focus:ring-brand-green/20"
                  >
                    <option value="">Choose a customer QR code...</option>
                    {loyaltyMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.id})
                      </option>
                    ))}
                    <option value="invalid">Invalid QR Code / Unregistered</option>
                  </select>
                </div>

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 mt-2 bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg"
                  >
                    <X size={14} className="stroke-[3] bg-red-500/20 rounded-full p-0.5 text-red-500" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                <button
                  onClick={() => {
                    if (!scanSelectId) {
                      setErrorMsg("Please select a QR simulation option.");
                      return;
                    }
                    if (scanSelectId === "invalid") {
                      setErrorMsg("Member not found. Please scan again.");
                      return;
                    }
                    const member = loyaltyMembers.find(m => m.id.toLowerCase() === scanSelectId.toLowerCase());
                    if (member) {
                      setSelectedMember(member);
                      setIsScanModalOpen(false);
                      setIsConfirmModalOpen(true);
                      setErrorMsg(null);
                    } else {
                      setErrorMsg("Member not found. Please scan again.");
                    }
                  }}
                  className="w-full rounded-full bg-brand-green py-3.5 type-ui text-xs text-white hover:bg-brand-green-hover transition-all duration-300 font-bold shadow-lg shadow-brand-green/15 cursor-pointer green-glow hover:shadow-brand-green-hover/25"
                >
                  Simulate QR Scan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback Manual Enter ID Modal */}
      <AnimatePresence>
        {isEnterIdModalOpen && (
          <motion.div
            key="enter-id-modal-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnterIdModalOpen(false)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="w-full max-w-sm rounded-2xl border border-card-border bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/10 blur-[35px] rounded-full pointer-events-none" />

              <button
                onClick={() => setIsEnterIdModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 rounded-xl bg-[#2E5A44]/10 text-brand-green">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-base">Enter Member ID</h3>
                  <p className="type-caption text-[10px] text-neutral-500 dark:text-zinc-400">Type customer card serial number</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cleanVal = manualInputId.trim().toUpperCase();
                  if (!cleanVal) {
                    setErrorMsg("Please enter a Member ID.");
                    return;
                  }
                  
                  const normalizeId = (id: string) => {
                    let clean = id.toUpperCase().replace(/[^A-Z0-9]/g, "");
                    if (clean.startsWith("LN") || clean.startsWith("AG")) {
                      clean = clean.substring(2);
                    }
                    return clean;
                  };

                  const normalizedInput = normalizeId(cleanVal);

                  const member = loyaltyMembers.find((m) => {
                    const normalizedMemberId = normalizeId(m.id);
                    return (
                      m.id.toUpperCase() === cleanVal ||
                      normalizedMemberId === normalizedInput
                    );
                  });

                  if (member) {
                    setSelectedMember(member);
                    setIsEnterIdModalOpen(false);
                    setIsConfirmModalOpen(true);
                    setErrorMsg(null);
                  } else {
                    setErrorMsg("Member not found. Please scan again.");
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold uppercase">
                    Member ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="AG-XXX-XXX"
                    value={manualInputId}
                    onChange={(e) => {
                      setManualInputId(e.target.value);
                      setErrorMsg(null);
                    }}
                    className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20 font-mono text-xs uppercase"
                  />
                </div>

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 mt-2 bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg"
                  >
                    <X size={14} className="stroke-[3] bg-red-500/20 rounded-full p-0.5 text-red-500" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#2E5A44] py-3.5 type-ui text-xs text-white hover:bg-[#234533] transition-all duration-300 font-bold shadow-lg shadow-[#2E5A44]/15 cursor-pointer font-semibold"
                >
                  Find Member
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && selectedMember && (
          <motion.div
            key="confirm-modal-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmModalOpen(false)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="w-full max-w-md rounded-2xl border border-card-border bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-[40px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 rounded-xl bg-brand-green/10 text-brand-green">
                  <ShieldCheck size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-base">Confirm Stamp Award</h3>
                  <p className="type-caption text-[10px] text-neutral-500 dark:text-zinc-400">Review member details before issuing stamp</p>
                </div>
              </div>

              {/* Premium Mini loyalty card design preview */}
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-[#ECF7F2]/80 to-[#D8ECE1]/20 dark:from-[#07130E]/90 dark:to-[#0F261B]/60 p-5 shadow-inner mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase tracking-[0.2em] text-[#2E5A44] dark:text-emerald-400 font-bold font-sans">Antonioni Grounds Reserve</span>
                    <h4 className="type-body text-sm font-bold text-foreground tracking-wide font-serif mt-0.5">{selectedMember.name}</h4>
                    <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[9px] tracking-wider block">ID: {selectedMember.id}</span>
                  </div>
                  
                  {/* Miniature progress pill */}
                  <span className="bg-[#2E5A44]/10 dark:bg-emerald-500/10 text-brand-green dark:text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border border-brand-green/20">
                    {selectedMember.stamps} / 9
                  </span>
                </div>

                {/* Stamp visual slot preview grid */}
                <div className="grid grid-cols-9 gap-1.5 pt-2 border-t border-card-border/40">
                  {Array.from({ length: 9 }).map((_, idx) => {
                    const isStamped = idx < selectedMember.stamps;
                    const isNextToStamp = idx === selectedMember.stamps;
                    
                    return (
                      <div
                        key={idx}
                        className={`h-6 w-6 rounded-full border flex items-center justify-center text-[8px] transition-all duration-300 ${
                          isStamped
                            ? "bg-brand-green/20 border-brand-green text-brand-green font-bold scale-105 shadow-sm shadow-brand-green/10"
                            : isNextToStamp
                            ? "bg-brand-green border-brand-green text-white font-extrabold animate-pulse scale-110 shadow-md shadow-brand-green/30"
                            : "border-card-border bg-background/50 text-neutral-400 dark:text-zinc-600 dark:bg-black/40 font-semibold"
                        }`}
                        title={isNextToStamp ? "Next stamp to be added" : ""}
                      >
                        {isStamped ? (
                          <Check size={9} className="stroke-[3]" />
                        ) : isNextToStamp ? (
                          "+1"
                        ) : (
                          idx + 1
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Summary and Details */}
              <div className="space-y-4 mb-6">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 dark:text-zinc-400 font-medium">Stamps Progress</span>
                    <span className="text-foreground font-bold font-mono">
                      {selectedMember.stamps} stamps &rarr; <span className="text-brand-green dark:text-emerald-400 font-extrabold">{selectedMember.stamps + 1} stamps</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-foreground/[0.05] rounded-full overflow-hidden border border-card-border/30">
                    <div
                      className="h-full bg-gradient-to-r from-brand-green to-emerald-500 transition-all duration-500"
                      style={{ width: `${((selectedMember.stamps + 1) / 9) * 100}%` }}
                    />
                  </div>
                  {selectedMember.stamps + 1 === 9 && (
                    <p className="text-[10px] text-brand-green dark:text-emerald-400 font-bold flex items-center gap-1 animate-pulse pt-1">
                      <Zap size={11} /> This stamp will unlock a complimentary drink reward!
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 rounded-full border border-card-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-neutral-500 dark:text-zinc-300 hover:text-white py-3 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onAwardStamp(selectedMember);
                    setIsConfirmModalOpen(false);
                  }}
                  disabled={selectedMember.stamps >= 9}
                  className="flex-1 rounded-full bg-brand-green py-3 text-xs text-white hover:bg-brand-green-hover transition-all duration-300 font-bold disabled:opacity-40 disabled:pointer-events-none cursor-pointer green-glow shadow-md shadow-brand-green/20"
                >
                  {selectedMember.stamps >= 9 ? "Card Full (9/9)" : "Award 1 Stamp"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Details & Stamp Management Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedMember && (
          <motion.div
            key="details-modal-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="w-full max-w-md rounded-2xl border border-card-border bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-[40px] rounded-full pointer-events-none" />

              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-all p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 rounded-xl bg-brand-green/10 text-brand-green">
                  <Eye size={20} />
                </div>
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-base">Customer Account Profile</h3>
                  <p className="type-caption text-[10px] text-neutral-500 dark:text-zinc-400">View information and manage loyalty points</p>
                </div>
              </div>

              {/* Account Details Sheet */}
              <div className="rounded-xl bg-foreground/[0.02] border border-card-border p-5 space-y-4 mb-6 shadow-inner">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Customer Name</span>
                  <span className="text-foreground font-bold">{selectedMember.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Email Address</span>
                  <span className="text-foreground font-semibold">{selectedMember.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Member ID</span>
                  <span className="text-brand-green dark:text-emerald-400 font-mono font-bold bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/15 text-[11px] shadow-sm">
                    {selectedMember.id}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Joined Date</span>
                  <span className="text-foreground font-semibold">{selectedMember.joinedAt}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-card-border/40 pt-4">
                  <span className="text-neutral-500 dark:text-zinc-400 font-medium">Stamps Collected</span>
                  <span className="text-foreground font-mono font-bold text-sm bg-neutral-100 dark:bg-zinc-800/60 px-2.5 py-0.5 rounded-full border border-card-border/60">
                    {selectedMember.stamps} / 9
                  </span>
                </div>
              </div>

              {/* Stamps slot preview grid inside the details modal */}
              <div className="mb-6 space-y-2.5">
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-zinc-400 font-bold block">Visual Stamp Progress</span>
                <div className="grid grid-cols-9 gap-1.5 p-3.5 bg-foreground/[0.01] rounded-xl border border-card-border/40">
                  {Array.from({ length: 9 }).map((_, idx) => {
                    const isStamped = idx < selectedMember.stamps;
                    return (
                      <div
                        key={idx}
                        className={`h-6 w-6 rounded-full border flex items-center justify-center text-[8px] transition-all duration-300 ${
                          isStamped
                            ? "bg-brand-green/20 border-brand-green text-brand-green font-bold scale-105 shadow-sm shadow-brand-green/10"
                            : "border-card-border bg-background/50 text-neutral-400 dark:text-zinc-600 dark:bg-black/40 font-semibold"
                        }`}
                      >
                        {isStamped ? <Check size={9} className="stroke-[3]" /> : idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="flex-1 rounded-full border border-card-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-neutral-500 dark:text-zinc-300 hover:text-white py-3 text-xs font-bold transition-all cursor-pointer"
                >
                  Close Profile
                </button>
                <button
                  onClick={() => {
                    if (selectedMember.stamps <= 0) return;
                    setIsRevokeConfirmOpen(true);
                  }}
                  disabled={selectedMember.stamps <= 0}
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-700 py-3 text-xs text-white transition-all duration-300 font-bold disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md shadow-red-600/10"
                >
                  Revoke 1 Stamp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revoke Confirmation Modal */}
      <AnimatePresence>
        {isRevokeConfirmOpen && selectedMember && (
          <motion.div
            key="revoke-confirm-modal-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRevokeConfirmOpen(false)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Decorative Red Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-[30px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                  <AlertTriangle size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-base">Confirm Revocation</h3>
                  <p className="type-caption text-[10px] text-neutral-500 dark:text-zinc-400">This action will deduct 1 stamp</p>
                </div>
              </div>

              {/* Confirmation Details Card */}
              <div className="rounded-xl border border-card-border bg-foreground/[0.02] p-4 space-y-2.5 mb-6 text-xs shadow-inner">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-zinc-400">Customer</span>
                  <span className="text-foreground font-bold">{selectedMember.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-zinc-400">Member ID</span>
                  <span className="text-foreground font-mono font-semibold">{selectedMember.id}</span>
                </div>
                <div className="flex justify-between border-t border-card-border/40 pt-2.5 mt-1">
                  <span className="text-neutral-500 dark:text-zinc-400">Current Stamps</span>
                  <span className="text-foreground font-bold font-mono">{selectedMember.stamps} / 9</span>
                </div>
                <div className="flex justify-between text-red-500 dark:text-red-400 font-bold">
                  <span>New Stamp Count</span>
                  <span className="font-mono">{selectedMember.stamps - 1} / 9</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsRevokeConfirmOpen(false)}
                  className="flex-1 rounded-full border border-card-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-neutral-500 dark:text-zinc-300 hover:text-white py-3 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const updated = { ...selectedMember, stamps: selectedMember.stamps - 1 };
                    setSelectedMember(updated);
                    onRevokeStamp(selectedMember);
                    setIsRevokeConfirmOpen(false);
                    setIsDetailsModalOpen(false);
                  }}
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-700 py-3 text-xs text-white transition-all duration-300 font-bold cursor-pointer shadow-lg shadow-red-600/20"
                >
                  Yes, Revoke
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && memberToDelete && (
          <motion.div
            key="delete-confirm-modal-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Decorative Red Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-[30px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                  <Trash2 size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-base">Delete Loyalty Card</h3>
                  <p className="type-caption text-[10px] text-red-500/80 dark:text-red-400/80 font-semibold uppercase tracking-wider">Warning: This action is permanent</p>
                </div>
              </div>

              {/* Warning explanation */}
              <p className="type-caption text-xs text-neutral-500 dark:text-zinc-400 mb-5 leading-relaxed">
                Are you sure you want to delete the loyalty card for <span className="font-bold text-foreground">{memberToDelete.name}</span>? All stamps and rewards earned will be permanently lost.
              </p>

              {/* Confirmation Details Card */}
              <div className="rounded-xl border border-card-border bg-foreground/[0.02] p-4 space-y-2.5 mb-6 text-xs shadow-inner">
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-zinc-400">Customer</span>
                  <span className="text-foreground font-bold">{memberToDelete.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-zinc-400">Email</span>
                  <span className="text-foreground font-semibold">{memberToDelete.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-zinc-400">Member ID</span>
                  <span className="text-foreground font-mono font-semibold">{memberToDelete.id}</span>
                </div>
                <div className="flex justify-between border-t border-card-border/40 pt-2.5 mt-1">
                  <span className="text-neutral-500 dark:text-zinc-400">Stamps Collected</span>
                  <span className="text-red-500 dark:text-red-400 font-bold font-mono">{memberToDelete.stamps} / 9</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 rounded-full border border-card-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-neutral-500 dark:text-zinc-300 hover:text-white py-3 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteLoyalty(memberToDelete.id);
                    setIsDeleteConfirmOpen(false);
                  }}
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-700 py-3 text-xs text-white transition-all duration-300 font-bold cursor-pointer shadow-lg shadow-red-600/20"
                >
                  Yes, Delete Card
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
