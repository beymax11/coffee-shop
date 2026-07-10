"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsQR from "jsqr";
import { LoyaltyMember } from "@/utils/db";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (member: LoyaltyMember) => void;
  loyaltyMembers: LoyaltyMember[];
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  loyaltyMembers,
}) => {
  const [isScanSuccess, setIsScanSuccess] = useState(false);
  const [scannedMember, setScannedMember] = useState<LoyaltyMember | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Camera scanning refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isScanSuccessRef = useRef(false);
  const scanTimeoutRef = useRef<any>(null);

  // Stop camera helper
  const stopCamera = () => {
    isScanSuccessRef.current = false;
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
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

    if (isOpen) {
      setErrorMsg(null);
      setIsScanSuccess(false);
      isScanSuccessRef.current = false;
      setScannedMember(null);
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const scanTick = () => {
    if (isScanSuccessRef.current) return;
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
              setScannedMember(member);
              setIsScanSuccess(true);
              isScanSuccessRef.current = true;

              if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
              }

              scanTimeoutRef.current = setTimeout(() => {
                onScanSuccess(member);
                stopCamera();
              }, 2000);
              return;
            } else {
              setErrorMsg(`Unknown QR code / Member ID: "${scannedId}"`);
            }
          }
        }
      }
    }
    // Continue scanning if modal is still open and not succeeded yet
    if (isOpen && !isScanSuccessRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(scanTick);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="scan-modal-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35 }}
            className="fixed lg:relative inset-0 lg:inset-auto w-full h-full lg:h-auto lg:max-w-md lg:aspect-square rounded-none lg:rounded-2xl border-none lg:border lg:border-neutral-800 bg-black lg:bg-zinc-950 overflow-hidden shadow-2xl z-10 flex items-center justify-center"
          >
            {errorMsg && !streamRef.current ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-red-500 bg-black/95 z-10 space-y-2">
                <AlertTriangle className="text-red-500" size={32} />
                <p className="text-sm font-semibold">{errorMsg}</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            )}
            <canvas ref={canvasRef} className="hidden" />

            {/* Premium scanner overlay */}
            {!errorMsg && (
              <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center p-6">
                <div className={`text-center text-[10px] sm:text-[11px] font-semibold backdrop-blur-sm py-1.5 px-3 rounded-full w-fit mx-auto mb-8 pointer-events-none transition-all duration-300 ${isScanSuccess
                    ? "text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 green-glow"
                    : "text-white/80 bg-black/60"
                  }`}>
                  {isScanSuccess ? "Scanned successfully!" : "Align QR code inside the frame"}
                </div>

                {/* Scanner Frame Box Wrapper */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
                  {/* Shadow Mask to darken camera background outside the box */}
                  <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] rounded-2xl pointer-events-none" />

                  {/* Scanning content box */}
                  <div className={`absolute inset-0 border rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 ${isScanSuccess
                      ? "border-emerald-500 bg-emerald-950/15"
                      : "border-brand-green/30"
                    }`}>
                    {/* Corner markers */}
                    <div className={`absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 rounded-tl-md transition-colors duration-500 ${isScanSuccess ? "border-emerald-400" : "border-brand-green"}`} />
                    <div className={`absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 rounded-tr-md transition-colors duration-500 ${isScanSuccess ? "border-emerald-400" : "border-brand-green"}`} />
                    <div className={`absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 rounded-bl-md transition-colors duration-500 ${isScanSuccess ? "border-emerald-400" : "border-brand-green"}`} />
                    <div className={`absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 rounded-br-md transition-colors duration-500 ${isScanSuccess ? "border-emerald-400" : "border-brand-green"}`} />

                    {isScanSuccess ? (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex flex-col items-center justify-center gap-2"
                      >
                        <div className="p-3 bg-emerald-500 rounded-full text-white shadow-lg shadow-emerald-500/30">
                          <Check size={28} className="stroke-[3]" />
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider animate-pulse mt-1">
                          {scannedMember?.name}
                        </span>
                      </motion.div>
                    ) : (
                      <div className="absolute left-0 right-0 h-0.5 bg-brand-green/80 shadow-[0_0_8px_rgba(46,90,68,0.5)]" style={{ animation: "scan 2.5s infinite linear" }} />
                    )}
                  </div>
                </div>

                <div className="mt-8 text-white/40 text-[9px] uppercase tracking-wider text-center hidden sm:block">
                  Antonioni Grounds Console
                </div>
              </div>
            )}

            {errorMsg && streamRef.current && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 border border-red-500/30 backdrop-blur-md px-4 py-2.5 rounded-xl flex items-center gap-2 text-red-200 text-xs font-semibold z-20 shadow-lg">
                <AlertTriangle className="text-red-400 shrink-0" size={14} />
                <span className="truncate">{errorMsg}</span>
              </div>
            )}

            {/* Minimal close button overlay with safe area margin */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-2.5 rounded-full cursor-pointer transition-colors backdrop-blur-sm z-20"
              style={{ marginTop: "env(safe-area-inset-top)" }}
              aria-label="Close scanner"
            >
              <X size={18} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
