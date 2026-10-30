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
  Download,
  ArrowRight,
  History,
  Calendar,
  Clock,
  Sparkles,
  MinusCircle
} from "lucide-react";
import { FadeUp, PageTransition } from "@/components/animations";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/utils/db";
import { getTierInfo } from "@/utils/loyalty";
import { generateUniqueLoyaltyCardId } from "@/lib/id-generator";
import { notificationsService } from "@/utils/notifications";
import { auditLogger } from "@/utils/auditLogger";
import QRCode from "qrcode";
import { supabase } from "@/utils/supabase";

export interface StampHistoryEntry {
  id: string;
  type: "earned" | "redeemed" | "revoked";
  title: string;
  description: string;
  stampNumber?: number;
  totalStamps?: number;
  timestamp: string;
}

export function LoyaltyView() {
  const [memberId, setMemberId] = useState<string>("AG-882-901");
  const [memberName, setMemberName] = useState<string>("Alexander Vance");
  const [memberUsername, setMemberUsername] = useState<string>("");
  const [memberEmail, setMemberEmail] = useState<string>("");
  const [memberJoinedAt, setMemberJoinedAt] = useState<string>("10/24");
  const [isGuest, setIsGuest] = useState<boolean>(true);

  const [stamps, setStamps] = useState<number>(1);
  const [points, setPoints] = useState<number>(720);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const tier = getTierInfo(points).label;
  const [showClaimSuccess, setShowClaimSuccess] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isQrExpanded, setIsQrExpanded] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [stampHistory, setStampHistory] = useState<StampHistoryEntry[]>([]);
  const [historyFilter, setHistoryFilter] = useState<"all" | "earned" | "redeemed">("all");
  const confettiFiringRef = React.useRef<boolean>(false);

  const isLoadedRef = React.useRef(isLoaded);
  const isGuestRef = React.useRef(isGuest);
  const memberIdRef = React.useRef(memberId);
  const memberEmailRef = React.useRef(memberEmail);

  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  useEffect(() => {
    isGuestRef.current = isGuest;
  }, [isGuest]);

  useEffect(() => {
    memberIdRef.current = memberId;
  }, [memberId]);

  useEffect(() => {
    memberEmailRef.current = memberEmail;
  }, [memberEmail]);

  const getLocalHistory = (cardId: string): StampHistoryEntry[] => {
    if (typeof window === "undefined" || !cardId) return [];
    try {
      const raw = localStorage.getItem(`loyalty_stamp_history_${cardId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveLocalHistory = (cardId: string, entries: StampHistoryEntry[]) => {
    if (typeof window === "undefined" || !cardId) return;
    try {
      localStorage.setItem(`loyalty_stamp_history_${cardId}`, JSON.stringify(entries.slice(0, 50)));
    } catch (e) {
      console.error("Failed to save stamp history:", e);
    }
  };

  const appendLocalHistoryEntry = (cardId: string, entry: StampHistoryEntry) => {
    const existing = getLocalHistory(cardId);
    const updated = [entry, ...existing];
    saveLocalHistory(cardId, updated);
    return updated;
  };

  const formatHistoryDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return "Recent";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  const formatHistoryTime = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return "--:--";
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "--:--";
    }
  };

  const loadStampHistory = React.useCallback(
    async (cardId: string, email: string, currentStamps: number, fallbackDateStr?: string) => {
      if (!cardId) return;

      const localEntries = getLocalHistory(cardId);
      const fromNotifications: StampHistoryEntry[] = [];

      if (email) {
        try {
          const notifs = await notificationsService.fetchNotifications(email);
          notifs.forEach((n) => {
            const titleLower = (n.title || "").toLowerCase();
            const isLoyaltyNotif =
              n.type === "loyalty" ||
              titleLower.includes("stamp") ||
              titleLower.includes("loyalty") ||
              titleLower.includes("reward");

            if (!isLoyaltyNotif) return;

            const matchCount = (n.message || "").match(/\((\d+)\s*\/\s*10/);
            const parsedCount = matchCount ? parseInt(matchCount[1], 10) : undefined;

            let entryType: "earned" | "redeemed" | "revoked" = "earned";
            let entryTitle = n.title || "Stamp Earned";

            if (titleLower.includes("redeem") || titleLower.includes("claim")) {
              entryType = "redeemed";
              entryTitle = "Free Drink Reward Claimed";
            } else if (titleLower.includes("revok") || titleLower.includes("remov")) {
              entryType = "revoked";
              entryTitle = "Stamp Adjusted";
            } else if (parsedCount) {
              entryTitle = `Stamp #${parsedCount} Collected`;
            }

            fromNotifications.push({
              id: `notif-${n.id}`,
              type: entryType,
              title: entryTitle,
              description: n.message,
              stampNumber: entryType === "earned" ? parsedCount : undefined,
              totalStamps: parsedCount ?? (entryType === "redeemed" ? 0 : undefined),
              timestamp: n.created_at || new Date().toISOString(),
            });
          });
        } catch (err) {
          console.warn("Failed to load loyalty notifications for stamp history:", err);
        }
      }

      // Also check audit logs if available locally
      const fromAudit: StampHistoryEntry[] = [];
      try {
        const logs = auditLogger.getAuditLogs();
        logs.forEach((log) => {
          if (log.category !== "loyalty") return;
          const matchesMember =
            log.metadata?.memberId === cardId ||
            (email && log.metadata?.email?.toLowerCase() === email.toLowerCase());
          if (!matchesMember) return;

          if (log.action === "AWARD") {
            const count = log.metadata?.newStamps ?? log.metadata?.stamps;
            fromAudit.push({
              id: `audit-${log.id}`,
              type: "earned",
              title: count ? `Stamp #${count} Collected` : "Stamp Earned",
              description: `A new stamp was added to your loyalty card.${count ? ` (${count}/10 stamps)` : ""}`,
              stampNumber: count,
              totalStamps: count,
              timestamp: log.timestamp,
            });
          } else if (log.action === "REDEEM") {
            fromAudit.push({
              id: `audit-${log.id}`,
              type: "redeemed",
              title: "Free Drink Reward Claimed",
              description: "Redeemed 10 stamps for a complimentary handcrafted beverage.",
              totalStamps: 0,
              timestamp: log.timestamp,
            });
          } else if (log.action === "DELETE" && log.details.toLowerCase().includes("revok")) {
            const count = log.metadata?.newStamps;
            fromAudit.push({
              id: `audit-${log.id}`,
              type: "revoked",
              title: "Stamp Adjusted",
              description: `A stamp was removed from your loyalty card.${count !== undefined ? ` (${count}/10 stamps)` : ""}`,
              totalStamps: count,
              timestamp: log.timestamp,
            });
          }
        });
      } catch {
        // Ignore audit log parse errors
      }

      // Merge and deduplicate entries that represent the same event within 15 seconds
      const combined = [...fromNotifications, ...localEntries, ...fromAudit].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const deduped: StampHistoryEntry[] = [];
      for (const item of combined) {
        const itemTime = new Date(item.timestamp).getTime();
        const isDuplicate = deduped.some((existing) => {
          if (existing.type !== item.type) return false;
          const existingTime = new Date(existing.timestamp).getTime();
          const timeDiff = Math.abs(existingTime - itemTime);
          if (existing.id === item.id) return true;
          if (timeDiff < 15000 && existing.totalStamps === item.totalStamps) return true;
          return false;
        });
        if (!isDuplicate) {
          deduped.push(item);
        }
      }

      // Ensure active stamps on the card have baseline history entries if not yet logged
      if (currentStamps > 0) {
        // Find entries since the most recent redemption
        const lastRedeemIdx = deduped.findIndex((e) => e.type === "redeemed");
        const currentCycleEntries =
          lastRedeemIdx >= 0 ? deduped.slice(0, lastRedeemIdx) : deduped;
        const earnedInCycle = currentCycleEntries.filter((e) => e.type === "earned");

        if (earnedInCycle.length < currentStamps) {
          const existingNumbers = new Set(
            earnedInCycle.map((e) => e.stampNumber).filter(Boolean)
          );
          const baseDate = fallbackDateStr ? new Date(fallbackDateStr) : new Date();
          const validBaseTime = isNaN(baseDate.getTime()) ? Date.now() : baseDate.getTime();
          const newLocalToSave = [...localEntries];
          let addedBaseline = false;

          for (let s = 1; s <= currentStamps; s++) {
            if (!existingNumbers.has(s) && earnedInCycle.length + (addedBaseline ? 1 : 0) < currentStamps) {
              const syntheticId = `baseline-${cardId}-stamp-${s}`;
              if (!deduped.some((d) => d.id === syntheticId)) {
                // Stagger timestamps slightly so each stamp has a distinct chronological order
                const stampTimestamp = new Date(
                  validBaseTime - (currentStamps - s) * 3600 * 1000 * 24
                ).toISOString();
                const baselineEntry: StampHistoryEntry = {
                  id: syntheticId,
                  type: "earned",
                  title: `Stamp #${s} Collected`,
                  description: `Handcrafted beverage stamp added to your loyalty card. (${s}/10 stamps)`,
                  stampNumber: s,
                  totalStamps: s,
                  timestamp: stampTimestamp,
                };
                deduped.push(baselineEntry);
                if (!newLocalToSave.some((l) => l.id === syntheticId)) {
                  newLocalToSave.push(baselineEntry);
                  addedBaseline = true;
                }
              }
            }
          }

          if (addedBaseline) {
            saveLocalHistory(cardId, newLocalToSave);
          }
        }
      }

      deduped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setStampHistory(deduped);
    },
    []
  );

  const triggerConfetti = async (fromTop: boolean = false) => {
    // Guard against multiple simultaneous confetti runs
    if (confettiFiringRef.current) return;
    confettiFiringRef.current = true;

    try {
      const confetti = (await import("canvas-confetti")).default;

      const colors = ["#2E5A44", "#10B981", "#F59E0B", "#D97706", "#34D399", "#FBBF24"];

      if (fromTop) {
        // Rain from the top downwards
        // Left-side top spray
        confetti({
          particleCount: 150,
          angle: 270,
          spread: 120,
          origin: { x: 0.3, y: -0.1 },
          colors: colors,
          gravity: 0.95,
          scalar: 1.1
        });

        // Right-side top spray
        confetti({
          particleCount: 150,
          angle: 270,
          spread: 120,
          origin: { x: 0.7, y: -0.1 },
          colors: colors,
          gravity: 0.95,
          scalar: 1.1
        });

        // High capacity left cannon
        setTimeout(() => {
          confetti({
            particleCount: 75,
            angle: 60,
            spread: 70,
            origin: { x: 0, y: 0.8 },
            colors: ["#2E5A44", "#10B981", "#F59E0B", "#D97706"]
          });
        }, 150);

        // High capacity right cannon — release guard after all bursts are done
        setTimeout(() => {
          confetti({
            particleCount: 75,
            angle: 120,
            spread: 70,
            origin: { x: 1, y: 0.8 },
            colors: ["#2E5A44", "#10B981", "#F59E0B", "#D97706"]
          });
          confettiFiringRef.current = false;
        }, 400);
      } else {
        // 1. Initial main center burst (high particle count)
        confetti({
          particleCount: 180,
          spread: 90,
          origin: { y: 0.6 },
          colors: colors
        });

        // 2. Delayed secondary center burst (to fill the air)
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 120,
            origin: { y: 0.55 },
            colors: colors
          });
        }, 200);

        // 3. High capacity left cannon
        setTimeout(() => {
          confetti({
            particleCount: 75,
            angle: 60,
            spread: 70,
            origin: { x: 0, y: 0.8 },
            colors: ["#2E5A44", "#10B981", "#F59E0B", "#D97706"]
          });
        }, 150);

        // 4. High capacity right cannon — release guard after all bursts are done
        setTimeout(() => {
          confetti({
            particleCount: 75,
            angle: 120,
            spread: 70,
            origin: { x: 1, y: 0.8 },
            colors: ["#2E5A44", "#10B981", "#F59E0B", "#D97706"]
          });
          confettiFiringRef.current = false;
        }, 400);
      }
    } catch (err) {
      confettiFiringRef.current = false;
      console.error("Failed to load or trigger confetti:", err);
    }
  };

  // Stamps tracking and trigger confetti logic is directly handled in setStamps functional state updates.

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
    let active = true;
    const syncFromDb = async () => {
      let sessionEmail = localStorage.getItem("customer_session");
      const members = db.getLoyaltyMembers();

      let current = members.find((m) => m.id === "AG-882-901"); // default fallback
      let guestState = true;

      if (sessionEmail) {
        let supabaseChecked = false;
        // Try to fetch latest profile from Supabase to ensure real-time sync of stamps/member_id
        try {
          const { supabase } = await import("@/utils/supabase");
          if (!active) return;
          if (supabase) {
            supabaseChecked = true;
            // Verify authenticated user identity via Supabase Auth session to prevent localStorage session spoofing
            const {
              data: { session: activeSession },
            } = await supabase.auth.getSession();
            const authUser = activeSession?.user ?? null;

            if (!active) return;

            if (authUser) {
              const verifiedIdent = authUser.email || authUser.phone;
              if (verifiedIdent && verifiedIdent.toLowerCase() !== sessionEmail.toLowerCase()) {
                sessionEmail = verifiedIdent;
                localStorage.setItem("customer_session", verifiedIdent);
              }
            }

            if (sessionEmail) {
              const isEmail = sessionEmail.includes("@");
              const query = supabase.from("profiles").select("*, loyalty_cards(*)");
              const { data: profile } = authUser?.id
                ? await query.eq("id", authUser.id).single()
                : isEmail
                  ? await query.eq("email", sessionEmail.toLowerCase()).single()
                  : await query.eq("phone", sessionEmail).single();

              if (!active) return;

              if (profile) {
                const rawCard = profile.loyalty_cards;
                const loyaltyCard = Array.isArray(rawCard) ? rawCard[0] : rawCard;

                // Find or create local loyalty member representation
                let existing = members.find(
                  (m) => (m.email && m.email.toLowerCase() === sessionEmail!.toLowerCase()) ||
                    (m.phone && m.phone.trim() === sessionEmail!.trim())
                );
                let memberIdToUse =
                  loyaltyCard?.id ||
                  (await generateUniqueLoyaltyCardId(
                    supabase,
                    members.map((m) => m.id)
                  ));

                // NOTE: Do NOT upsert loyalty_cards here — that's the admin/signup's responsibility.
                // Writing stamps from here risks overwriting fresher data from the admin.

                const updatedMember = {
                  id: memberIdToUse,
                  name: profile.name || existing?.name || (isEmail ? sessionEmail.split("@")[0] : sessionEmail),
                  username: profile.username || existing?.username || "",
                  email: isEmail ? sessionEmail : (profile.email || ""),
                  phone: isEmail ? (profile.phone || "") : sessionEmail,
                  stamps: loyaltyCard?.stamps ?? 0,
                  points: loyaltyCard?.points ?? 0,
                  joinedAt: profile.created_at
                    ? new Date(profile.created_at).toISOString().split("T")[0]
                    : existing?.joinedAt || new Date().toISOString().split("T")[0]
                };

                db.saveLoyaltyMember(updatedMember);
                current = updatedMember;
                guestState = false;
              } else {
                // Account was deleted from Supabase — purge stale local cache on this device
                const cleaned = members.filter(
                  (m) =>
                    (!m.email || m.email.toLowerCase() !== sessionEmail!.toLowerCase()) &&
                    (!m.phone || m.phone.trim() !== sessionEmail!.trim())
                );
                localStorage.setItem("loyalty_members", JSON.stringify(cleaned));
                localStorage.removeItem("customer_session");
              }
            }
          }
        } catch (err) {
          console.error("Error syncing profile with Supabase on mount:", err);
        }

        if (!supabaseChecked && guestState && active && sessionEmail) {
          const found = members.find(
            (m) => (m.email && m.email.toLowerCase() === sessionEmail!.toLowerCase()) ||
              (m.phone && m.phone.trim() === sessionEmail!.trim())
          );
          if (found) {
            current = found;
            guestState = false;
          }
        }
      }

      if (!active) return;

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
        setMemberUsername(current.username || "");
        setMemberEmail(current.email || "");
        if (current.joinedAt) {
          const parsedJoin = new Date(current.joinedAt);
          if (!isNaN(parsedJoin.getTime())) {
            const month = String(parsedJoin.getMonth() + 1).padStart(2, "0");
            const year = String(parsedJoin.getFullYear()).slice(-2);
            setMemberJoinedAt(`${month}/${year}`);
          }
        }
        setPoints(current.points);
        setIsGuest(guestState);

        setStamps((prevStamps) => {
          if (isLoadedRef.current && !isGuestRef.current && currentStamps > prevStamps) {
            triggerConfetti(true);
          }
          return currentStamps;
        });

        loadStampHistory(current.id, current.email || "", currentStamps, current.joinedAt);
      }
      setIsLoaded(true);
    };
    syncFromDb();

    // Listen for real-time updates on loyalty_cards table
    let channel: any = null;
    const sessionEmail = typeof window !== "undefined" ? localStorage.getItem("customer_session") : null;
    if (sessionEmail && supabase) {
      // Capture supabase in a local variable to preserve type narrowing inside async closure
      const supabaseClient = supabase;
      // We fetch the profile UUID to use as a reliable filter for the loyalty_cards real-time subscription
      const setupRealtimeChannel = async () => {
        const {
          data: { session: activeSession },
        } = await supabaseClient.auth.getSession();
        const authUser = activeSession?.user ?? null;
        if (!active) return;

        const isEmail = sessionEmail.includes("@");
        const query = supabaseClient.from("profiles").select("id, email, loyalty_cards(id)");
        const { data: profileData } = authUser?.id
          ? await query.eq("id", authUser.id).single()
          : isEmail
            ? await query.eq("email", sessionEmail.toLowerCase()).single()
            : await query.eq("phone", sessionEmail).single();

        if (!active) return;

        const rawCard = profileData?.loyalty_cards;
        const loyaltyCardId = (Array.isArray(rawCard) ? rawCard[0] : rawCard)?.id;

        if (!loyaltyCardId) return; // No loyalty card found yet — can't subscribe

        channel = supabaseClient.channel(`loyalty-card-${loyaltyCardId}`);
        channel
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "loyalty_cards",
              filter: `id=eq.${loyaltyCardId}`,
            },
            (payload: any) => {
              if (!active) return;
              const newStamps = payload.new?.stamps;
              const newPoints = payload.new?.points;

              if (newStamps !== undefined) {
                setStamps((prevStamps) => {
                  if (newStamps > prevStamps) {
                    triggerConfetti(true);
                    appendLocalHistoryEntry(loyaltyCardId, {
                      id: `rt-earn-${Date.now()}`,
                      type: "earned",
                      title: `Stamp #${newStamps} Collected`,
                      description: `A new stamp was added to your loyalty card. (${newStamps}/10 stamps)`,
                      stampNumber: newStamps,
                      totalStamps: newStamps,
                      timestamp: new Date().toISOString(),
                    });
                  } else if (newStamps === 0 && prevStamps >= 10) {
                    appendLocalHistoryEntry(loyaltyCardId, {
                      id: `rt-redeem-${Date.now()}`,
                      type: "redeemed",
                      title: "Free Drink Reward Claimed",
                      description: "You claimed your free drink reward! Your stamps have been reset to 0.",
                      totalStamps: 0,
                      timestamp: new Date().toISOString(),
                    });
                  } else if (newStamps < prevStamps) {
                    appendLocalHistoryEntry(loyaltyCardId, {
                      id: `rt-revoke-${Date.now()}`,
                      type: "revoked",
                      title: "Stamp Adjusted",
                      description: `A stamp was removed from your loyalty card. (${newStamps}/10 stamps)`,
                      totalStamps: newStamps,
                      timestamp: new Date().toISOString(),
                    });
                  }
                  setTimeout(() => {
                    loadStampHistory(
                      loyaltyCardId,
                      profileData?.email || memberEmailRef.current,
                      newStamps
                    );
                  }, 300);
                  return newStamps;
                });
              }
              if (newPoints !== undefined) setPoints(newPoints);
            }
          )
          .subscribe();
      };

      setupRealtimeChannel();
    }

    const handleStorage = (e: Event) => {
      if (e instanceof StorageEvent) {
        if (
          !e.key ||
          e.key === "customer_session" ||
          e.key === "loyalty_members" ||
          e.key.startsWith("customer_notifications_") ||
          e.key.startsWith("loyalty_stamp_history_") ||
          e.key === "audit_logs"
        ) {
          syncFromDb();
        }
      } else {
        syncFromDb();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [loadStampHistory]);

  const copyMemberId = () => {
    navigator.clipboard.writeText(memberId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleClaimReward = () => {
    if (stamps < 10) return;

    setStamps(0);
    const newPoints = points + 50;
    setPoints(newPoints); // bonus points for claiming
    setShowClaimSuccess(true);
    triggerConfetti(true);

    const nowIso = new Date().toISOString();
    appendLocalHistoryEntry(memberId, {
      id: `claim-${Date.now()}`,
      type: "redeemed",
      title: "Free Drink Reward Claimed",
      description: "Claim any Mini drink on the menu! Stamps reset to 0/10.",
      totalStamps: 0,
      timestamp: nowIso,
    });

    if (memberEmail) {
      notificationsService.addNotification(
        memberEmail,
        "Loyalty Card Redeemed",
        "You claimed your free drink reward! Your stamps have been reset to 0.",
        "loyalty"
      );
    }

    loadStampHistory(memberId, memberEmail, 0);

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

    if (supabase && memberId) {
      supabase
        .from("loyalty_cards")
        .update({ stamps: 0, points: newPoints })
        .eq("id", memberId)
        .gte("stamps", 10)
        .then(({ error }) => {
          if (error) console.error("Error syncing reward claim:", error);
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

  const filteredHistory = stampHistory.filter((entry) => {
    if (historyFilter === "all") return true;
    if (historyFilter === "earned") return entry.type === "earned";
    if (historyFilter === "redeemed") return entry.type === "redeemed";
    return true;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-24 pb-16 sm:py-24 text-foreground relative overflow-hidden transition-colors duration-500">
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

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 relative z-10">
          {isGuest ? (
            <FadeUp className="max-w-lg mx-auto text-center flex flex-col items-center py-8 sm:py-12">
              <span className="type-eyebrow text-emerald-600 dark:text-emerald-400 font-bold block mb-2">
                Loyalty Card
              </span>
              <h2 className="type-h2 text-foreground font-serif leading-tight">
                Your Antonioni Grounds card, but digital.
              </h2>
              <p className="text-base font-medium text-emerald-600 dark:text-emerald-400 mt-2">
                No more forgetting it at home.
              </p>
              <p className="type-body text-neutral-600 dark:text-zinc-400 mt-3 mb-8 max-w-md leading-relaxed text-sm sm:text-base">
                Scan it every visit and collect your stamps. Every so often, we'll get to say thank you with more than just a discount code.
              </p>
              <div className="w-full max-w-xs space-y-3">
                <Link
                  href="/signup"
                  className="type-ui group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#2E5A44] py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#234533] hover:shadow-[0_0_25px_rgba(46,90,68,0.3)] active:scale-95 cursor-pointer"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-hero-shine" />
                  <span className="relative flex items-center gap-1.5">
                    <span>Get Your Card</span>
                    <span className="max-w-0 -translate-x-2 opacity-0 overflow-hidden transition-all duration-300 ease-out group-hover:max-w-[20px] group-hover:translate-x-0 group-hover:opacity-100 flex items-center">
                      <ArrowRight size={15} className="shrink-0 ml-1" />
                    </span>
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="inline-block text-xs font-medium text-neutral-500 dark:text-zinc-400 hover:text-foreground hover:underline transition-colors pt-2 cursor-pointer"
                >
                  Already have an account? Sign In
                </Link>
              </div>
            </FadeUp>
          ) : (
            <div className="max-w-[760px] mx-auto w-full space-y-6 sm:space-y-8">
              {/* ─── DIGITAL LOYALTY CARD ─── */}
              <FadeUp className="w-full">
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
                            <div className="pr-12 sm:pr-64">
                              <h3 className="type-h3 text-emerald-600 dark:text-emerald-400">Every stamp is a step toward another unforgettable brew.</h3>
                              <p className="type-caption text-zinc-600 dark:text-zinc-400 mt-1">Buy 10 coffees, get the 11th complimentary.</p>
                            </div>

                            {/* Card Actions Group */}
                            <div className="absolute top-8 right-8 flex items-center gap-2 z-20">
                              {stamps >= 10 && (
                                <button
                                  onClick={handleClaimReward}
                                  className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 type-ui flex items-center gap-1.5 transition-all shadow-lg animate-pulse whitespace-nowrap cursor-pointer"
                                >
                                  <Gift size={14} className="text-emerald-300" />
                                  Claim Free Drink
                                </button>
                              )}
                              {/* Fullscreen Button */}
                              <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="sm:hidden rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                              >
                                <Maximize2 size={16} />
                              </button>
                              {/* Flip Icon Button */}
                              <button
                                onClick={() => setIsFlipped(true)}
                                className="rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
                                title="View Membership Card"
                              >
                                <RotateCcw size={16} className="rotate-180" />
                              </button>
                            </div>

                            {/* Stamp Card Grid */}
                            <div className="grid grid-cols-5 gap-4 mt-6 justify-items-center">
                              {Array.from({ length: 10 }).map((_, idx) => {
                                const isStamped = idx < stamps;
                                const isRewardSlot = idx === 9;
                                return (
                                  <div
                                    key={idx}
                                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border flex flex-col items-center justify-center relative transition-all duration-300 ${isStamped
                                      ? "bg-transparent border-emerald-500/40"
                                      : isRewardSlot
                                        ? "bg-zinc-100 border-emerald-500/40 text-zinc-500 dark:bg-[#181818] dark:border-emerald-500/30 dark:text-zinc-600 cursor-pointer"
                                        : "bg-zinc-100 border-zinc-200/80 dark:bg-[#181818] dark:border-white/5"
                                      } ${isRewardSlot && stamps >= 10 ? "bg-emerald-50/70 border-emerald-500 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 shadow-lg gold-glow cursor-pointer" : ""} ${isRewardSlot ? "group" : ""}`}
                                  >
                                    {isStamped ? (
                                      <motion.div
                                        key={`stamped-${idx}`}
                                        initial={{ scale: 0.5, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
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

                                    {/* If it's the 10th slot, mark it with a Gift icon at the top */}
                                    {isRewardSlot && (
                                      <div className={`absolute -top-2.5 -right-2.5 rounded-full p-1.5 bg-emerald-500 text-white shadow-md z-20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${stamps >= 10 ? "animate-bounce" : ""}`}>
                                        <Gift size={16} />
                                        {/* Hover tooltip for the entire 10th circle positioned on top of the Gift icon */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-bold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg border border-white/10 z-30">
                                          Free Drink
                                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
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
                                <h2 className="type-h1 text-foreground mt-1 truncate uppercase">
                                  {memberUsername || memberName}
                                </h2>
                                {isGuest && <p className="type-caption text-zinc-600 dark:text-zinc-400 mt-1">Guest Preview Card</p>}
                              </div>

                              {/* Flex Row Container: QR Code on left, Member stats on right */}
                              <div className="flex flex-row items-start gap-5 mt-3">
                                {/* Integrated Large QR Code */}
                                <div
                                  onClick={() => setIsQrExpanded(true)}
                                  className="w-36 h-36 bg-white p-2.5 rounded-xl flex flex-col justify-center items-center relative overflow-hidden shadow-inner shrink-0 group cursor-pointer"
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
                                        className="text-zinc-500 hover:text-emerald-500 transition-colors cursor-pointer"
                                        title="Copy ID"
                                      >
                                        {copiedId ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] uppercase tracking-wider text-zinc-600 dark:text-zinc-500 block">Member Since</span>
                                    <span className="font-mono text-zinc-800 dark:text-zinc-300 text-xs font-semibold">{memberJoinedAt}</span>
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
                                  <span className="text-foreground font-semibold text-xs">Claim any Mini drink on the menu!</span>
                                </div>
                                <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-1">
                                  {stamps >= 10
                                    ? "Ready to claim!"
                                    : `${10 - stamps} more stamp${10 - stamps === 1 ? "" : "s"} to unlock`}
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
                                className="sm:hidden rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                              >
                                <Maximize2 size={16} />
                              </button>
                              {/* Flip Icon Button */}
                              <button
                                onClick={() => setIsFlipped(false)}
                                className="rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5 p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
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

              {/* ─── STAMP HISTORY SECTION ─── */}
              <FadeUp delay={0.1} className="w-[310px] xs:w-[350px] sm:w-full mx-auto mt-24 sm:mt-28 pt-6 sm:pt-8">
                <div className="flex items-center justify-between pb-3.5 border-b border-card-border">
                  <h3 className="text-sm sm:text-base font-serif font-bold text-foreground tracking-wide">
                    Stamp History
                  </h3>
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    {stamps} / 10 Stamps
                  </span>
                </div>

                {stampHistory.length === 0 ? (
                  <p className="py-8 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 text-center">
                    No stamp history yet.
                  </p>
                ) : (
                  <div className="mt-2 max-h-[260px] overflow-y-auto pr-1 divide-y divide-card-border">
                    {stampHistory.map((item) => (
                      <div
                        key={item.id}
                        className="h-[52px] flex items-center justify-between gap-4 text-xs sm:text-sm"
                      >
                        <span className="font-medium text-foreground truncate">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                          <span>{formatHistoryDate(item.timestamp)}</span>
                          <span className="opacity-40">•</span>
                          <span>{formatHistoryTime(item.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </FadeUp>
            </div>
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
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-[#ECF7F2] to-[#D8ECE1]/60 dark:from-[#07130E]/95 dark:to-[#0F261B]/95 p-8 glassmorphism-green shadow-2xl text-center flex flex-col items-center gap-6"
            >
              {/* Premium Glow Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-500/5 blur-[30px] rounded-full pointer-events-none" />

              {/* Glowing Icon Emblem */}
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
                <Gift size={36} className="text-emerald-500 animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-white/10" />
              </div>

              {/* Text Group */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold font-sans">
                  Transaction Success
                </span>
                <h3 className="type-h3 text-foreground font-serif mt-1 font-bold text-2xl tracking-wide">
                  Reward Claimed!
                </h3>
                <p className="type-body-sm text-neutral-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                  Claim any Mini drink on the menu! Present your Digital Loyalty Card at the counter to redeem.
                </p>
              </div>

              {/* Subtle elegant divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent my-1" />

              {/* Actions */}
              <button
                onClick={() => setShowClaimSuccess(false)}
                className="w-full rounded-full bg-[#2E5A44] hover:bg-[#234533] text-white py-3 text-sm font-semibold transition-all duration-300 shadow-md shadow-emerald-950/20 hover:shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                Done
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
