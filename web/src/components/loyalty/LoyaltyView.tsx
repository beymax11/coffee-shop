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
  Maximize2,
  Download
} from "lucide-react";
import { FadeUp, PageTransition } from "@/components/animations";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/utils/db";
import { getTierInfo } from "@/utils/loyalty";
import QRCode from "qrcode";

export function LoyaltyView() {
  const [memberId, setMemberId] = useState<string>("AG-882-901");
  const [memberName, setMemberName] = useState<string>("Alexander Vance");
  const [isGuest, setIsGuest] = useState<boolean>(true);

  const [stamps, setStamps] = useState<number>(1);
  const [points, setPoints] = useState<number>(720);
  const tier = getTierInfo(points).label;
  const [showClaimSuccess, setShowClaimSuccess] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isQrExpanded, setIsQrExpanded] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add("card-fullscreen-active");
    } else {
      document.body.classList.remove("card-fullscreen-active");
    }
    return () => {
      document.body.classList.remove("card-fullscreen-active");
    };
  }, [isFullscreen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (memberId) {
      QRCode.toDataURL(memberId, {
        margin: 1.5,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      })
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error("Failed to generate QR code:", err);
        });
    }
  }, [memberId]);

  // Sync with DB
  useEffect(() => {
    const syncFromDb = async () => {
      const sessionEmail = localStorage.getItem("customer_session");
      const members = db.getLoyaltyMembers();

      let current = members.find((m) => m.id === "AG-882-901"); // default fallback
      let guestState = true;

      if (sessionEmail) {
        // Try to fetch latest profile from Supabase to ensure real-time sync of stamps/member_id
        try {
          const { supabase } = await import("@/utils/supabase");
          if (supabase) {
            const isEmail = sessionEmail.includes("@");
            const query = supabase.from("profiles").select("*");
            const { data: profile } = isEmail
              ? await query.eq("email", sessionEmail.toLowerCase()).single()
              : await query.eq("phone", sessionEmail).single();

            if (profile) {
              // Find or create local loyalty member representation
              let existing = members.find(
                (m) => (m.email && m.email.toLowerCase() === sessionEmail.toLowerCase()) ||
                  (m.phone && m.phone.trim() === sessionEmail.trim())
              );
              let memberIdToUse = profile.member_id || existing?.id || `AG-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

              if (!profile.member_id || profile.member_id.length > 20) {
                // Update Supabase profiles table
                await supabase
                  .from("profiles")
                  .update({ member_id: memberIdToUse })
                  .eq("id", profile.id);
              }

              const updatedMember = {
                id: memberIdToUse,
                name: profile.name || existing?.name || (isEmail ? sessionEmail.split("@")[0] : sessionEmail),
                email: isEmail ? sessionEmail : (profile.email || ""),
                phone: isEmail ? (profile.phone || "") : sessionEmail,
                stamps: profile.stamps ?? existing?.stamps ?? 0,
                points: profile.points ?? existing?.points ?? 0,
                joinedAt: profile.created_at
                  ? new Date(profile.created_at).toISOString().split("T")[0]
                  : existing?.joinedAt || new Date().toISOString().split("T")[0]
              };

              db.saveLoyaltyMember(updatedMember);
              current = updatedMember;
              guestState = false;
            }
          }
        } catch (err) {
          console.error("Error syncing profile with Supabase on mount:", err);
        }

        if (guestState) {
          const found = members.find(
            (m) => (m.email && m.email.toLowerCase() === sessionEmail.toLowerCase()) ||
              (m.phone && m.phone.trim() === sessionEmail.trim())
          );
          if (found) {
            current = found;
            guestState = false;
          }
        }
      }

      if (current) {
        let currentStamps = current.stamps;
        if (current.id === "AG-882-901") {
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
  
  const downloadQrCode = () => {
    if (!qrCodeUrl) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 380;
    canvas.height = 480;

    const qrImage = new window.Image();
    const logoImage = new window.Image();

    let loadedCount = 0;
    const onImageLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        drawCanvas();
      }
    };

    qrImage.onload = onImageLoaded;
    logoImage.onload = onImageLoaded;
    qrImage.onerror = onImageLoaded;
    logoImage.onerror = onImageLoaded;

    qrImage.src = qrCodeUrl;
    logoImage.src = "/logo.png";

    const drawCanvas = () => {
      // 1. Draw Background (Black)
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
      } else {
        ctx.rect(0, 0, canvas.width, canvas.height);
      }
      ctx.fill();

      // Draw subtle border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Draw Logo Image at the top
      // Make it proportional
      const logoWidth = 140;
      const logoHeight = (logoImage.naturalHeight / logoImage.naturalWidth) * logoWidth || 46;
      const logoX = (canvas.width - logoWidth) / 2;
      const logoY = 30; // position from top
      ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);

      // 3. Draw QR Code Container (white background with rounded corner)
      const qrContainerSize = 190;
      const qrContainerX = (canvas.width - qrContainerSize) / 2;
      const qrContainerY = 100;
      
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, 12);
      } else {
        ctx.rect(qrContainerX, qrContainerY, qrContainerSize, qrContainerSize);
      }
      ctx.fill();

      // Draw QR Code Image inside the white container
      const padding = 12;
      const qrSize = qrContainerSize - padding * 2;
      const qrX = qrContainerX + padding;
      const qrY = qrContainerY + padding;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // 4. Draw Member Account ID Section
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("MEMBER ACCOUNT ID", canvas.width / 2, 325);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px monospace";
      ctx.fillText(memberId, canvas.width / 2, 350);

      // Divider line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(40, 385);
      ctx.lineTo(canvas.width - 40, 385);
      ctx.stroke();

      // 5. Draw Footer Tagline
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "10px sans-serif";
      ctx.fillText("Scan this code at checkout to update your stamps.", canvas.width / 2, 415);

      // Export and download
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `loyalty-qr-${memberId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background py-16 md:py-24 text-foreground relative overflow-hidden transition-colors duration-500">
        {/* Subtle decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Glowing gold blobs */}
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(46,90,68,0.08)_0%,transparent_70%)] blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(46,90,68,0.06)_0%,transparent_70%)] blur-[120px]" />
          <div className="absolute top-[30%] left-[40%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(46,90,68,0.04)_0%,transparent_70%)] blur-[100px]" />

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
            <FadeUp className="max-w-md mx-auto rounded-2xl border border-card-border bg-card p-8 md:p-10 text-center glassmorphism-green shadow-xl flex flex-col items-center">
              <div className="rounded-full bg-[#2E5A44]/10 p-4 text-[#2E5A44] dark:text-emerald-400 mb-6">
                <QrCode size={32} />
              </div>
              <h2 className="type-h3 text-foreground">Membership Access Required</h2>
              <p className="type-body-sm text-neutral-500 dark:text-zinc-400 mt-2 mb-8 max-w-xs">
                To view your stamps, tiers, and scan history, please log in with your Antonioni Grounds reserve credentials.
              </p>
              <div className="mt-8 w-full space-y-3">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#2E5A44] py-3 text-sm font-semibold text-white hover:bg-[#234533] transition-colors shadow-[0_0_20px_rgba(46,90,68,0.25)] active:scale-95 cursor-pointer"
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
            <FadeUp className="max-w-[760px] mx-auto w-full">
              <div className="w-[310px] xs:w-[350px] h-[540px] xs:h-[600px] sm:w-full sm:h-[465px] mx-auto relative">
                <div
                  className={`${isFullscreen
                    ? "fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                    : "absolute inset-0 flex items-center justify-center"
                    }`}
                  style={{ perspective: "1500px" }}
                >
                  {/* Close button for fullscreen mode */}
                  {isFullscreen && (
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="fixed top-6 right-6 z-55 rounded-full bg-white/10 hover:bg-white/20 text-white p-3 transition-all active:scale-95 cursor-pointer"
                      title="Exit Fullscreen"
                    >
                      <X size={24} />
                    </button>
                  )}

                  {/* Rotator Wrapper to present the card landscape (sideways/rotated) on mobile screen */}
                  <div
                    className={`w-full h-full rotate-90 sm:rotate-0 flex items-center justify-center transition-all duration-300 ${isFullscreen
                      ? "scale-[0.92] xs:scale-[1.05] sm:scale-110 md:scale-125"
                      : "scale-[0.72] xs:scale-[0.80] sm:scale-100"
                      }`}
                  >
                    <div
                      className="absolute sm:relative w-[720px] h-[440px] sm:w-full sm:h-full transition-transform duration-700"
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
                        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-[#ECF7F2] to-[#D8ECE1]/40 dark:from-[#07130E]/95 dark:to-[#0F261B]/95 p-8 glassmorphism-green shadow-xl flex flex-col justify-start gap-4 h-full">
                          {/* Front Card Header */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pr-12 gap-4">
                            <div>
                              <h3 className="type-h3 text-emerald-600 dark:text-emerald-400">Every stamp is a step toward another unforgettable brew.</h3>
                              <p className="type-caption text-zinc-600 dark:text-zinc-400 mt-1">Buy 9 coffees, get the 10th complimentary.</p>
                            </div>

                            {stamps >= 9 && (
                              <button
                                onClick={handleClaimReward}
                                className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 type-ui flex items-center gap-1.5 transition-all shadow-lg animate-pulse"
                              >
                                <Gift size={14} className="text-emerald-300" />
                                Claim Complimentary Geisha
                              </button>
                            )}
                          </div>

                          {/* Card Actions Group */}
                          <div className="absolute top-8 right-8 flex items-center gap-2 z-20">
                            {/* Fullscreen Button */}
                            <button
                              onClick={() => setIsFullscreen(!isFullscreen)}
                              className="sm:hidden rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all active:scale-95"
                              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                            >
                              <Maximize2 size={16} />
                            </button>
                            {/* Flip Icon Button */}
                            <button
                              onClick={() => setIsFlipped(true)}
                              className="rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all active:scale-95"
                              title="View Membership Card"
                            >
                              <RotateCcw size={16} className="rotate-180" />
                            </button>
                          </div>

                          {/* Stamp Card Grid */}
                          <div className="grid grid-cols-5 gap-4 mt-6 justify-items-center">
                            {Array.from({ length: 9 }).map((_, idx) => {
                              const isStamped = idx < stamps;
                              return (
                                <div
                                  key={idx}
                                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex flex-col items-center justify-center relative transition-all duration-300 ${isStamped
                                    ? "bg-transparent border-emerald-500/40"
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
                              <Gift size={28} className={stamps >= 9 ? "animate-bounce text-emerald-600 dark:text-emerald-400" : "text-emerald-600 dark:text-emerald-400"} />
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
                        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-[#ECF7F2] to-[#D8ECE1]/40 dark:from-[#07130E]/95 dark:to-[#0F261B]/95 p-8 glassmorphism-green shadow-xl flex flex-col justify-between h-full">

                          {/* Right side coffee photo cover */}
                          <div className="absolute top-0 right-0 bottom-0 w-1/2 overflow-hidden border-l border-[#2E5A44]/10 block">
                            <Image
                              src="/kape.jpg"
                              alt="Luxury Coffee"
                              fill
                              className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                            />
                            {/* Soft blend overlay gradient to card background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#ECF7F2] dark:from-[#07130E] via-transparent to-transparent" />
                          </div>

                          {/* Content Column (occupying left half on desktop) */}
                          <div className="flex flex-col justify-start gap-3 h-full w-[48%] min-w-0 z-10 relative pb-14">
                            <div>
                              <span className="text-[10px] tracking-[0.25em] text-[#2E5A44] dark:text-emerald-400 font-bold uppercase block font-sans">Antonioni Grounds Reserve</span>
                              <h2 className="type-h1 text-foreground mt-1 truncate">{memberName}</h2>
                              {isGuest && <p className="type-caption text-zinc-600 dark:text-zinc-400 mt-1">Guest Preview Card</p>}
                            </div>

                            {/* Flex Row Container: QR Code on left, Member stats on right */}
                            <div className="flex flex-row items-start gap-5 mt-3">
                              {/* Integrated Large QR Code */}
                              <div
                                onClick={() => setIsQrExpanded(true)}
                                className="w-32 h-32 bg-white p-2.5 rounded-xl flex flex-col justify-center items-center relative overflow-hidden shadow-inner shrink-0 group cursor-pointer"
                              >
                                {/* Real QR Code Representation */}
                                {qrCodeUrl ? (
                                  <img
                                    src={qrCodeUrl}
                                    alt="Loyalty QR Code"
                                    className="w-full h-full object-contain relative z-0 select-none pointer-events-none"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-zinc-100 dark:bg-[#181818] animate-pulse rounded-md" />
                                )}

                                {/* Hover Overlay Expand Button */}
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                  <button className="bg-[#2E5A44] text-white rounded-full p-2.5 shadow-lg flex items-center justify-center hover:scale-110 transition-all hover:bg-[#234533] active:scale-95">
                                    <Maximize2 size={16} />
                                  </button>
                                </div>
                              </div>

                              {/* Member ID & Member Since Stack */}
                              <div className="space-y-4 pb-1">
                                <div className="space-y-0.5">
                                  <span className="text-[9px] uppercase tracking-wider text-zinc-600 dark:text-zinc-500 block">Member ID</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-foreground text-xs tracking-wider font-semibold">{memberId}</span>
                                    <button
                                      onClick={copyMemberId}
                                      className="text-zinc-500 hover:text-emerald-500 transition-colors"
                                      title="Copy ID"
                                    >
                                      {copiedId ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[9px] uppercase tracking-wider text-zinc-600 dark:text-zinc-500 block">Member Since</span>
                                  <span className="font-mono text-zinc-800 dark:text-zinc-300 text-xs font-semibold">10/24</span>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[9px] uppercase tracking-wider text-zinc-600 dark:text-zinc-500 block">Loyalty Status</span>
                                  <span className="font-mono text-[#2E5A44] dark:text-emerald-400 text-xs font-bold">{stamps} / 10 Stamps</span>
                                </div>
                              </div>
                            </div>

                            {/* Reward Preview Strip */}
                            <div className="mt-auto rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 px-4 py-3 block">
                              <span className="text-[9px] uppercase tracking-wider text-zinc-600 dark:text-zinc-500 block">Your Reward at 10 Stamps</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Coffee size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="text-foreground font-semibold text-xs">Complimentary Geisha Pour Over</span>
                              </div>
                              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-1">
                                {stamps >= 9
                                  ? "Ready to claim!"
                                  : `${9 - stamps} more stamp${9 - stamps === 1 ? "" : "s"} to unlock`}
                              </p>
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

                          {/* Card Actions Group */}
                          <div className="absolute top-8 right-8 flex items-center gap-2 z-20">
                            {/* Fullscreen Button */}
                            <button
                              onClick={() => setIsFullscreen(!isFullscreen)}
                              className="sm:hidden rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all active:scale-95"
                              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                            >
                              <Maximize2 size={16} />
                            </button>
                            {/* Flip Icon Button */}
                            <button
                              onClick={() => setIsFlipped(false)}
                              className="rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all active:scale-95"
                              title="View Stamp Card"
                            >
                              <RotateCcw size={16} />
                            </button>
                          </div>

                        </div>
                      </div>
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
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">+50 pts</span>
                </div>
              </div>

              <button
                onClick={() => setShowClaimSuccess(false)}
                className="w-full rounded-full bg-[#2E5A44] text-white py-2.5 type-ui hover:bg-[#234533] transition-colors font-bold"
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


              <div className="mb-6 flex justify-center">
                <Image
                  src="/logo.png"
                  alt="Antonioni Grounds Logo"
                  width={150}
                  height={50}
                  className="h-10 w-auto object-contain invert dark:invert-0"
                />
              </div>

              {/* Large QR Code Container */}
              <div className="w-48 h-48 bg-white p-3 rounded-xl flex flex-col justify-center items-center relative overflow-hidden shadow-lg border border-zinc-200/50">
                {/* Real QR Code Representation */}
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Loyalty QR Code"
                    className="w-full h-full object-contain relative z-0 select-none pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-100 dark:bg-[#181818] animate-pulse rounded-md" />
                )}
              </div>

              {/* Download Button */}
              {qrCodeUrl && (
                <button
                  onClick={downloadQrCode}
                  className="mt-4 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <Download size={14} />
                  Download QR Code
                </button>
              )}

              <div className="mt-6 text-center space-y-1">
                <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[10px] tracking-wider uppercase block">Member Account ID</span>
                <span className="font-mono text-foreground text-sm font-bold tracking-wider">{memberId}</span>
              </div>

              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center mt-4 max-w-[240px]">
                Scan this code at checkout to update your stamps.
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
        body.card-fullscreen-active header {
          opacity: 0 !important;
          pointer-events: none !important;
          transform: translateY(-100%) !important;
          transition: all 0.3s ease-in-out !important;
        }
        body.card-fullscreen-active footer {
          display: none !important;
        }
      `}</style>
    </PageTransition>
  );
}
