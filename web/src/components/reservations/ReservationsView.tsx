"use client";

import React, { useState, useEffect } from "react";
import { Coffee, Calendar as CalendarIcon, Clock, Users, MapPin, ChevronRight, ChevronLeft, CheckCircle2, User, Mail, Phone, FileText, Printer, Check, Search, Eye, Loader2, X, ExternalLink } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/utils/db";
import { notificationsService } from "@/utils/notifications";

export type ReservationType = "Coffee Cart Booking" | "Table Reservation";

export interface FormData {
  fullName: string;
  email: string;
  phone: string;
  eventType: ReservationType;
  date: string;
  time: string;
  guestCount: number;
  location: string;
  notes: string;
  paymentMethod: "GCash" | "Bank Transfer" | "QRPh";
  referenceNumber: string;
  proofOfPayment: string;
  coffeeFlavor1?: string;
  coffeeFlavor2?: string;
  nonCoffeeFlavor1?: string;
  nonCoffeeFlavor2?: string;
}

import { TableReservationForm, TableReservationPolicy, TableReservationReceipt } from "./TableReservation";
import { CartReservationForm, CartReservationPolicy, CartReservationReceipt } from "./CartReservation";
import { PaymentMethod } from "./PaymentMethod";
import { SuccessDocket } from "./SuccessDocket";

export function ReservationsView() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    eventType: "Table Reservation",
    date: "",
    time: "",
    guestCount: 2,
    location: "",
    notes: "",
    paymentMethod: "GCash",
    referenceNumber: "",
    proofOfPayment: "",
    coffeeFlavor1: "",
    coffeeFlavor2: "",
    nonCoffeeFlavor1: "",
    nonCoffeeFlavor2: "",
  });

  const [addressDetails, setAddressDetails] = useState({
    landmark: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
  });
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);

  const handleSaveAddress = () => {
    const parts = [
      addressDetails.street.trim(),
      addressDetails.barangay.trim() ? `Brgy. ${addressDetails.barangay.trim()}` : "",
      addressDetails.city.trim(),
      addressDetails.province.trim(),
      addressDetails.landmark.trim() ? `(Landmark: ${addressDetails.landmark.trim()})` : ""
    ].filter(Boolean);
    const combinedLocation = parts.join(", ");
    updateField("location", combinedLocation);
    setIsAddressExpanded(false);
  };

  const [isMounted, setIsMounted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [reservationStatus, setReservationStatus] = useState<"Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Cancellation Requested">("Pending");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [existingReservations, setExistingReservations] = useState<any[]>([]);
  const [dbReservations, setDbReservations] = useState<any[]>([]);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  // Status tracking states
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [searchTicketId, setSearchTicketId] = useState("");
  const [trackedReservation, setTrackedReservation] = useState<any | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    const updateSession = () => {
      setSessionEmail(localStorage.getItem("customer_session"));
    };
    updateSession();
    window.addEventListener("storage", updateSession);
    return () => window.removeEventListener("storage", updateSession);
  }, []);

  const handleTrackSearch = async (idToSearch: string) => {
    const trimmedId = idToSearch.trim();
    if (!trimmedId) return;

    setIsTrackingLoading(true);
    setTrackingError(null);
    setTrackedReservation(null);

    try {
      const response = await fetch(`/api/reservations/${trimmedId}`);
      if (!response.ok) {
        // Fallback to local storage in case db is not synced or offline
        const localMerged = db.getReservations();
        const foundLocal = localMerged.find((r: any) => r.id?.toLowerCase() === trimmedId.toLowerCase());
        if (foundLocal) {
          setTrackedReservation(foundLocal);
          setIsTrackingLoading(false);
          return;
        }
        throw new Error("Reservation not found. Please check your ID.");
      }
      const data = await response.json();
      if (data && data.reservation) {
        setTrackedReservation(data.reservation);
      } else {
        throw new Error("No reservation details returned.");
      }
    } catch (err: any) {
      // Local storage fallback lookup
      const localMerged = db.getReservations();
      const foundLocal = localMerged.find((r: any) => r.id?.toLowerCase() === trimmedId.toLowerCase());
      if (foundLocal) {
        setTrackedReservation(foundLocal);
      } else {
        setTrackingError(err.message || "Failed to retrieve status. Please try again.");
      }
    } finally {
      setIsTrackingLoading(false);
    }
  };

  useEffect(() => {
    const loadReservations = async () => {
      let merged = db.getReservations();
      setExistingReservations(merged);

      try {
        const response = await fetch("/api/reservations");
        if (response.ok) {
          const { reservations } = await response.json();
          if (reservations) {
            const mapped = reservations.map((r: any) => ({
              id: r.id,
              fullName: r.full_name,
              email: r.email,
              phone: r.phone,
              eventType: r.event_type,
              date: r.date,
              time: r.time,
              guestCount: r.guest_count,
              location: r.location,
              notes: r.notes,
              status: r.status,
              paymentMethod: r.payment_method,
              referenceNumber: r.reference_number,
              proofOfPayment: r.proof_of_payment,
              created_at: r.created_at,
            }));

            setDbReservations(mapped);

            const local = db.getReservations();
            const remoteIds = new Set(mapped.map((r: any) => r.id));
            const onlyLocal = local.filter((r) => r.id && !remoteIds.has(r.id));
            merged = [...mapped, ...onlyLocal];
            setExistingReservations(merged);
          }
        }
      } catch (err) {
        console.warn("Could not sync reservations from backend API:", err);
      }
    };

    loadReservations();
  }, []);

  useEffect(() => {
    if (step !== 3 || !ticketId) return;

    const checkStatus = () => {
      const key = `${formData.fullName}-${formData.date}-${formData.time}`;
      try {
        const statuses = JSON.parse(localStorage.getItem("admin_reservation_statuses") || "{}");
        const currentStatus = statuses[key] || "Pending";
        setReservationStatus(currentStatus);
      } catch (err) {
        console.error(err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1500);
    window.addEventListener("storage", checkStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkStatus);
    };
  }, [step, ticketId, formData.fullName, formData.date, formData.time]);

  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const parseTimeStr = (timeStr: string) => {
    if (!timeStr) return { hour: "08", minute: "00", ampm: "AM" };
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      return { hour: match[1].padStart(2, '0'), minute: match[2], ampm: match[3].toUpperCase() };
    }
    return { hour: "08", minute: "00", ampm: "AM" };
  };

  const getCalendarDays = (currentDate: Date) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; isPast: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Trailing days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isPast: d < today,
      });
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isPast: d < today,
      });
    }

    // Leading days from next month
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isPast: d < today,
      });
    }

    return days;
  };

  const sidebarImages = ["/ser.jpg", "/cart.jpg", "/carts.jpg", "/res.jpg"];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    setTicketId(`LN-${Math.floor(100000 + Math.random() * 900000)}`);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get("type");
      if (typeParam === "cart" || typeParam === "table") {
        const selectedType = typeParam === "cart" ? "Coffee Cart Booking" : "Table Reservation";
        setFormData((prev) => ({
          ...prev,
          eventType: selectedType,
          location: selectedType === "Table Reservation" ? "Antonioni Grounds - Tiaong" : prev.location,
          time: selectedType === "Table Reservation" ? "08:00 AM" : prev.time,
        }));
        setStep(2);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % sidebarImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Removed customer_session autofill to keep input fields completely empty by default

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  const eventTypes: {
    type: ReservationType;
    title: string;
    category: string;
    desc: string;
    features: string[];
    pricing: string;
    icon: any;
  }[] = [
      {
        type: "Table Reservation",
        title: "Lounge Table Reservation",
        category: "In-House Café",
        desc: "Reserve a private table in our luxury matte-black café. Perfect for premium coffee tastings, quiet meetings, or personal coffee rituals.",
        features: [
          "1 - 4 guests capacity",
          "₱3,500 fully consumable fee",
          "3-hour table booking duration",
          "100% refundable up to 24h prior"
        ],
        pricing: "₱3,500 / 3 Hours",
        icon: Coffee,
      },
      {
        type: "Coffee Cart Booking",
        title: '"Brew Buggy" Mobile Coffee Cart',
        category: "Off-Site Sourcing",
        desc: "Sponsor Antonioni Ground's exclusive Brew Buggy coffee cart, designed exclusively for special occasions.",
        features: [
          "Inclusions: Cart, 2 Baristas, 3 Hours Service",
          "Flavor Options: Latte, Americano, +2 Flavors, +2 Non-Coffee",
          "Price: 50 Pax (₱5,500) to 200 Pax (₱22,000)",
          "10% Downpayment required to secure booking",
          "100% Refundable up to 1 week before booking date"
        ],
        pricing: "From ₱5,500 / 3 Hours",
        icon: CalendarIcon,
      },
    ];

  const validateStep = () => {
    const newErrors: typeof errors = {};

    if (step === 1) {
      if (!formData.eventType) newErrors.eventType = "Please select an event type";
    } else if (step === 2) {
      if (!formData.date) newErrors.date = "Date is required";
      if (!formData.time) newErrors.time = "Time is required";
      if (formData.guestCount <= 0) newErrors.guestCount = "Guest count must be greater than 0";

      const isExternalEvent = formData.eventType === "Coffee Cart Booking";
      if (isExternalEvent && !formData.location) {
        newErrors.location = "Event location / venue address is required";
      }

      if (isExternalEvent) {
        if (!formData.coffeeFlavor1) newErrors.coffeeFlavor1 = "Please select Coffee Flavor 1";
        if (!formData.coffeeFlavor2) newErrors.coffeeFlavor2 = "Please select Coffee Flavor 2";
        if (!formData.nonCoffeeFlavor1) newErrors.nonCoffeeFlavor1 = "Please select Non-Coffee Flavor 1";
        if (!formData.nonCoffeeFlavor2) newErrors.nonCoffeeFlavor2 = "Please select Non-Coffee Flavor 2";
      }

      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    const newReservation = {
      ...formData,
      id: ticketId,
      status: "Pending" as const,
      created_at: new Date().toISOString(),
    };

    // Save to localStorage (always works, even offline)
    db.saveReservation(newReservation);
    setExistingReservations((prev) => [newReservation, ...prev]);

    // Add customer notification for booking submission
    notificationsService.addNotification(
      newReservation.email,
      "Reservation Submitted",
      `We received your request for a ${newReservation.eventType} on ${newReservation.date} at ${newReservation.time}.`,
      "reservation"
    );

    // Also persist to Supabase via API
    try {
      await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReservation),
      });
    } catch (err) {
      console.warn("Could not save reservation to backend (offline fallback):", err);
    }



    setStep(3);
  };

  const handleConfirmPayment = async () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.paymentMethod) newErrors.paymentMethod = "Please select a payment method";
    if (!formData.referenceNumber.trim()) newErrors.referenceNumber = "Reference number is required";
    if (!formData.proofOfPayment) newErrors.proofOfPayment = "Proof of payment screenshot is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    let finalProofUrl = formData.proofOfPayment;

    // Convert file to Base64 as a fallback
    if (proofFile) {
      const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      };
      try {
        finalProofUrl = await getBase64(proofFile);
      } catch (err) {
        console.warn("Base64 conversion failed:", err);
      }
    }

    // Upload file to Supabase if available
    try {
      const { supabase } = await import("@/utils/supabase");
      if (supabase && proofFile) {
        const fileExt = proofFile.name.split(".").pop();
        const fileName = `proof-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(fileName, proofFile, { cacheControl: "3600", upsert: true });

        if (uploadError) {
          console.error("Supabase Storage upload error for proof:", uploadError);
        } else if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from("menu-images")
            .getPublicUrl(fileName);
          finalProofUrl = publicUrl;
        }
      }
    } catch (err) {
      console.error("Failed to upload proof of payment file:", err);
    }

    setIsPaid(true);

    // Update in database / localStorage
    if (typeof window !== "undefined") {
      const reservations = db.getReservations();
      const idx = reservations.findIndex((r) => r.id === ticketId);
      if (idx >= 0) {
        reservations[idx] = {
          ...reservations[idx],
          paymentMethod: formData.paymentMethod,
          referenceNumber: formData.referenceNumber,
          proofOfPayment: finalProofUrl,
        };
        localStorage.setItem("reservations", JSON.stringify(reservations));
        window.dispatchEvent(new Event("storage"));
      }
    }

    // Add customer notification for payment proof submission
    notificationsService.addNotification(
      formData.email,
      "Payment Details Submitted",
      `Your payment reference code for reservation ${ticketId} has been submitted for verification.`,
      "reservation"
    );

    // Update in Supabase
    try {
      await fetch(`/api/reservations/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: formData.paymentMethod,
          referenceNumber: formData.referenceNumber,
          proofOfPayment: finalProofUrl,
        }),
      });
    } catch (err) {
      console.warn("Could not sync payment details to backend:", err);
    }

    setShowPaymentForm(false);
  };

  const selectType = (type: ReservationType) => {
    const isTableType = type === "Table Reservation";
    setFormData({
      ...formData,
      eventType: type,
      location: isTableType ? "Antonioni Grounds - Tiaong" : "",
      time: "08:00 AM", // default start time
      guestCount: isTableType ? 2 : 50, // default to 50 pax package for Brew Buggy, 2 for Table
    });
    setAddressDetails({
      landmark: "",
      street: "",
      barangay: "",
      city: "",
      province: "",
    });
    setIsAddressExpanded(false);
    setErrors({ ...errors, eventType: undefined });
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  };

  const timeSlots = formData.eventType === "Table Reservation"
    ? ["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"]
    : [
      "Morning (08:00 - 12:00)",
      "Afternoon (12:00 - 17:00)",
      "Evening (17:00 - 22:00)",
      "All Day Gala Booking"
    ];

  const quickGuests = formData.eventType === "Table Reservation" ? [1, 2, 3, 4] : [20, 50, 100, 150];

  const isTable = formData.eventType === "Table Reservation";
  const activeColor = "bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.4)]";
  const todayActiveDot = "bg-emerald-500";
  const labelAccent = "text-emerald-600 dark:text-emerald-400";

  const renderStepper = () => (
    <div className="max-w-xl mx-auto mb-10 relative print:hidden">
      <div className="flex items-center justify-between text-center select-none">
        {[
          { num: 1, label: "Experience" },
          { num: 2, label: "Reservation Details" },
          { num: 3, label: "Payment Details" },
        ].map((item, idx) => {
          const isCurrent = step === item.num;
          const isPassed = step > item.num;
          return (
            <React.Fragment key={item.num}>
              <button
                type="button"
                disabled={item.num > step}
                onClick={() => setStep(item.num)}
                className="group flex flex-col items-center focus:outline-none disabled:cursor-not-allowed"
              >
                <span className={`font-serif text-[13px] tracking-widest ${isCurrent
                  ? "text-emerald-600 dark:text-emerald-400 font-medium scale-105"
                  : isPassed
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-zinc-500 dark:text-zinc-600"
                  } transition-all duration-300`}>
                  0{item.num}
                </span>
                <span className={`font-sans text-[9px] uppercase tracking-[0.25em] mt-1.5 font-bold ${isCurrent
                  ? "text-foreground"
                  : isPassed
                    ? "text-zinc-500 dark:text-zinc-400"
                    : "text-zinc-500 dark:text-zinc-600"
                  } transition-all duration-300`}>
                  {item.label}
                </span>
                <div className={`h-[2px] w-6 mt-2 rounded-full transition-all duration-500 ${isCurrent
                  ? "bg-emerald-600 dark:bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] dark:shadow-[0_0_8px_rgba(16,185,129,0.8)] w-10"
                  : isPassed
                    ? "bg-emerald-600 dark:bg-emerald-500"
                    : "bg-zinc-200 dark:bg-white/5"
                  }`} />
              </button>

              {idx < 2 && (
                <div className="flex-1 flex justify-center items-center px-4 -mt-5">
                  <div className={`h-[1px] w-full transition-all duration-700 ${step > item.num ? "bg-emerald-600/40" : "bg-zinc-200 dark:bg-white/5"
                    }`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const getEndTimeString = (startTimeStr: string) => {
    if (!startTimeStr) return "";
    const match = startTimeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return "";
    let h = parseInt(match[1]);
    const m = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;

    // Add 3 hours
    h = (h + 3) % 24;

    const endAmPm = h >= 12 ? "PM" : "AM";
    let endH = h % 12;
    if (endH === 0) endH = 12;

    return `${String(endH).padStart(2, '0')}:${m} ${endAmPm}`;
  };

  const getPricingDetails = () => {
    if (isTable) {
      return {
        totalPrice: 3500,
        downpayment: 1000,
        label: "Lounge Table Reservation Fee",
        notes: "₱3,500 consumable for 3 hours (₱1,000 downpayment required). Refundable up to 24 hours prior."
      };
    } else {
      const pax = formData.guestCount;
      let totalPrice = 5500;
      if (pax === 100) totalPrice = 11000;
      else if (pax === 150) totalPrice = 16500;
      else if (pax === 200) totalPrice = 22000;

      const dp = totalPrice * 0.10;

      return {
        totalPrice,
        downpayment: dp,
        label: `Brew Buggy Coffee Cart (${pax} Pax Package)`,
        notes: `Total Price: ₱${totalPrice.toLocaleString()}. 10% Downpayment (₱${dp.toLocaleString()}) required. Refundable up to 1 week prior. Downpayment is non-refundable if cancelled less than 24h prior.`
      };
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-8 pb-16 md:pt-12 md:pb-24 text-foreground relative overflow-hidden font-sans print:bg-white print:text-black transition-colors duration-500">
        {/* Inject print-specific styles to hide main navbar and footer if present */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            header, footer, nav, [role="navigation"], .no-print, .print-hidden-element {
              display: none !important;
            }
            body {
              background-color: white !important;
              color: black !important;
            }
            main, .min-h-screen {
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
              min-height: 0 !important;
            }
          }
        ` }} />

        {/* Deep atmospheric ambient glows */}
        <motion.div
          animate={{
            x: [0, 30, -15, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#2E5A44]/5 blur-[150px] rounded-full pointer-events-none print:hidden"
        />
        <motion.div
          animate={{
            x: [0, -20, 30, 0],
            y: [0, 30, -15, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#2E5A44]/5 blur-[150px] rounded-full pointer-events-none print:hidden"
        />

        {/* Floating Gold/Green Particles */}
        {isMounted && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 print:hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: i % 2 === 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(52, 211, 153, 0.15)",
                }}
                animate={{
                  y: [0, -120 - Math.random() * 180],
                  x: [0, (Math.random() - 0.5) * 50],
                  opacity: [0, 0.7, 0],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: 9 + Math.random() * 12,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 8,
                }}
              />
            ))}
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10 print:px-0">
          {step < 3 ? (
            <div className="flex flex-col">
              {/* Stepper only visible on mobile/tablet view above the layout */}
              <div className="lg:hidden w-full">
                {renderStepper()}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

              <div className={`lg:col-span-4 order-1 lg:sticky lg:top-16 text-left lg:pr-12 lg:border-r lg:border-zinc-200 dark:lg:border-white/5 lg:py-4 print:hidden`}>
                {/* Track Status Button */}
                <div className="mb-6 flex">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTrackModalOpen(true);
                      setTrackingError(null);
                      setTrackedReservation(null);
                      setSearchTicketId("");
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-600/5 px-4.5 py-2.5 font-sans text-[11px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/10 hover:border-emerald-600/50 transition-all active:scale-95 cursor-pointer shadow-[0_2px_12px_rgba(16,185,129,0.06)]"
                  >
                    <Search size={12} className="stroke-[2.5]" />
                    Track Booking Status
                  </button>
                </div>

                <div className={step === 1 ? 'hidden lg:block' : ''}>
                  <span className={`text-[10px] uppercase font-bold tracking-[0.35em] block mb-3 font-sans transition-colors duration-300 ${step >= 2 ? labelAccent : "text-emerald-500/90"}`}>
                    {step >= 2 ? "Reservation Details" : "Bespoke Experience"}
                  </span>
                  <h1 className="text-4xl lg:text-5xl font-serif text-foreground tracking-tight font-semibold leading-tight mt-2">
                    {step >= 2 ? "Select Date & Time" : "Secure Your Ritual"}
                  </h1>
                  <div className="w-16 h-[1px] bg-brand-gold mt-6 mb-6" />

                  {step === 2 ? (
                  <div className="space-y-6">
                    {/* Custom Interactive Calendar */}
                    <div className="rounded-xl border border-card-border bg-card/45 backdrop-blur-md p-5 shadow-md relative max-w-[420px] mx-auto w-full">
                      <div className="flex items-center justify-between mb-5">
                        <button
                          type="button"
                          onClick={() => {
                            const newMonth = new Date(calendarMonth);
                            newMonth.setMonth(newMonth.getMonth() - 1);
                            const today = new Date();
                            if (newMonth.getFullYear() > today.getFullYear() ||
                              (newMonth.getFullYear() === today.getFullYear() && newMonth.getMonth() >= today.getMonth())) {
                              setCalendarMonth(newMonth);
                            }
                          }}
                          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-zinc-500 hover:text-foreground"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="font-serif text-sm font-semibold tracking-wide text-foreground">
                          {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newMonth = new Date(calendarMonth);
                            newMonth.setMonth(newMonth.getMonth() + 1);
                            setCalendarMonth(newMonth);
                          }}
                          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-zinc-500 hover:text-foreground"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Weekday Labels */}
                      <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                          <span key={day} className="text-xs font-sans font-bold text-zinc-500 tracking-wider">
                            {day}
                          </span>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1.5 text-center">
                        {getCalendarDays(calendarMonth).map((day, idx) => {
                          const dateStr = formatDateString(day.date);
                          const isSelected = formData.date === dateStr;
                          const isToday = formatDateString(new Date()) === dateStr;
                          const isFullyBooked = existingReservations.some(
                            (r) => r.date === dateStr &&
                                   r.eventType === formData.eventType &&
                                   (r.status === "Approved" || r.status === "Completed")
                          );

                          return (
                            <div
                              key={idx}
                              className="relative"
                              onMouseEnter={() => setHoveredDate(dateStr)}
                              onMouseLeave={() => setHoveredDate(null)}
                            >
                              <button
                                type="button"
                                disabled={day.isPast}
                                onClick={() => {
                                  if (isFullyBooked) return;
                                  updateField("date", dateStr);
                                }}
                                className={`w-full aspect-square flex items-center justify-center text-xs font-sans rounded-full transition-all duration-200 relative ${isSelected
                                  ? `${activeColor} font-bold text-white`
                                  : day.isPast
                                    ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-30"
                                    : isFullyBooked
                                      ? "text-rose-500/60 dark:text-rose-400/50 line-through cursor-not-allowed bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20"
                                      : day.isCurrentMonth
                                        ? "text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
                                        : "text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
                                  }`}
                              >
                                {day.date.getDate()}
                                {isToday && !isSelected && (
                                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${todayActiveDot}`} />
                                )}
                              </button>

                              <AnimatePresence>
                                {hoveredDate === dateStr && isFullyBooked && !day.isPast && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider text-white bg-rose-600 dark:bg-rose-500 rounded shadow-[0_4px_12px_rgba(244,63,94,0.3)] whitespace-nowrap pointer-events-none"
                                  >
                                    Fully Booked
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-rose-600 dark:border-t-rose-500" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {errors.date && <span className="type-error block pl-1 text-xs text-red-500 font-sans">{errors.date}</span>}

                    {/* Time Selector */}
                    <div className="space-y-2">
                      <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
                        Select Starting Time
                      </label>

                      {(() => {
                        const { hour: selectedHour, minute: selectedMinute, ampm: selectedAmPm } = parseTimeStr(formData.time);
                        const handleTimeChange = (type: "hour" | "minute" | "ampm", val: string) => {
                          let h = selectedHour;
                          let m = selectedMinute;
                          let ap = selectedAmPm;
                          if (type === "hour") h = val;
                          if (type === "minute") m = val;
                          if (type === "ampm") ap = val;
                          updateField("time", `${h}:${m} ${ap}`);
                        };

                        return (
                          <div className="space-y-4">
                            <div className="flex items-center gap-1.5 bg-card/65 p-3 rounded-xl border border-card-border max-w-md mx-auto w-full">
                              {/* Hour Dropdown */}
                              <div className="flex-1">
                                <span className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5 pl-1 font-sans tracking-wide">Hour</span>
                                <select
                                  value={selectedHour}
                                  onChange={(e) => handleTimeChange("hour", e.target.value)}
                                  className="w-full bg-card border border-card-border rounded-lg px-2 py-2 text-xs text-foreground outline-none focus:border-emerald-500 transition-all font-mono"
                                >
                                  {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((h) => (
                                    <option key={h} value={h}>{h}</option>
                                  ))}
                                </select>
                              </div>

                              <span className="text-foreground self-end mb-2.5 font-bold font-mono">:</span>

                              {/* Minute Dropdown */}
                              <div className="flex-1">
                                <span className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5 pl-1 font-sans tracking-wide">Minute</span>
                                <select
                                  value={selectedMinute}
                                  onChange={(e) => handleTimeChange("minute", e.target.value)}
                                  className="w-full bg-card border border-card-border rounded-lg px-2 py-2 text-xs text-foreground outline-none focus:border-emerald-500 transition-all font-mono"
                                >
                                  {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                              </div>

                              {/* AM/PM Button Toggle */}
                              <div className="flex flex-col justify-end">
                                <span className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5 pl-1 font-sans tracking-wide">Period</span>
                                <div className="flex rounded-lg border border-card-border overflow-hidden bg-card p-0.5">
                                  {["AM", "PM"].map((period) => {
                                    const isActive = selectedAmPm === period;
                                    return (
                                      <button
                                        key={period}
                                        type="button"
                                        onClick={() => handleTimeChange("ampm", period)}
                                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all duration-300 font-sans ${isActive
                                          ? "bg-[#2E5A44] text-white shadow-sm"
                                          : "text-zinc-500 hover:text-foreground"
                                          }`}
                                      >
                                        {period}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            {!isTable && (
                              <span className="text-[10px] text-zinc-400 font-light block text-center mt-1">
                                Duration: Exactly 3 Hours slot (e.g. {formData.time} - {getEndTimeString(formData.time)})
                              </span>
                            )}
                            {errors.time && <span className="type-error block pl-1 text-xs text-red-500 font-sans text-center">{errors.time}</span>}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-card-border shadow-[0_10px_35px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)] bg-card/40 w-full aspect-[4/5] md:aspect-[3/4] group">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImgIndex}
                        src={sidebarImages[currentImgIndex]}
                        alt="Antonioni Grounds Experience"
                        initial={{ opacity: 0, scale: 1.12, y: 3 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -3 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="w-full h-full object-cover block"
                      />
                    </AnimatePresence>

                    {/* Glassmorphic Indicator dots at the bottom */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      {sidebarImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentImgIndex(idx)}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentImgIndex === idx
                            ? "bg-emerald-600 w-3.5"
                            : "bg-white/30 hover:bg-white/60"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </div>

              {/* Right Column: Form & Stepper */}
              <div className="lg:col-span-8 order-2">
                {/* Stepper indicators only visible on desktop */}
                <div className="hidden lg:block">
                  {renderStepper()}
                </div>

                {/* Form Content Wrapper */}
                <div className="rounded-2xl border border-card-border bg-card p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.08)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-xl">
                  {/* Decorative corner borders */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-emerald-500/30" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-emerald-500/30" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-emerald-500/30" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-emerald-500/30" />

                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {/* STEP 1: EVENT TYPE SELECT */}
                    {step === 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="border-b border-zinc-200 dark:border-white/5 pb-4 mb-6">
                          <h3 className="text-xl font-serif text-foreground tracking-wide">Select Experience Type</h3>
                          <p className="text-xs text-zinc-500 mt-1 font-light">Choose how you wish to spend your time with us.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {eventTypes.map((item) => {
                            const Icon = item.icon;
                            const isSelected = formData.eventType === item.type;
                            const isTable = item.type === "Table Reservation";

                            return (
                              <motion.div
                                key={item.type}
                                whileHover={{ y: -4, scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => selectType(item.type)}
                                className={`rounded-xl border p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[310px] h-auto select-none ${isSelected
                                  ? "bg-gradient-to-br from-[#ECF7F2] to-[#D8ECE1] border-emerald-600/50 shadow-[0_10px_30px_rgba(46,90,68,0.12)] text-foreground dark:from-[#07130E]/95 dark:to-[#0F261B]/95 dark:border-emerald-500/80 dark:shadow-[0_10px_30px_rgba(46,90,68,0.25)]"
                                  : "bg-card border-card-border text-neutral-500 hover:border-emerald-600/30 hover:bg-background"
                                  }`}
                              >
                                <div className="space-y-4 flex-1">
                                  {/* Card Top Row */}
                                  <div className="flex justify-between items-start">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${isSelected
                                      ? "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-[#2E5A44]/20 dark:text-emerald-400 dark:border-emerald-500/40"
                                      : "bg-zinc-100 dark:bg-white/5 text-zinc-500 border-zinc-200 dark:border-white/5"
                                      }`}>
                                      <Icon size={18} />
                                    </div>
                                    <div className="text-right">
                                      <span className={`text-[8px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${isSelected
                                        ? "text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-500/30"
                                        : "text-zinc-500 border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-white/5"
                                        }`}>
                                        {item.category}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Title & Description */}
                                  <div>
                                    <div className="flex justify-between items-baseline gap-2">
                                      <h4 className="font-serif text-sm md:text-base text-foreground tracking-wide font-medium">{item.title}</h4>
                                      <span className={`font-serif text-xs italic ${isSelected
                                        ? "text-emerald-700 dark:text-emerald-400"
                                        : "text-zinc-500"
                                        }`}>
                                        {item.pricing}
                                      </span>
                                    </div>
                                    <p className="font-sans text-[11px] text-zinc-600 dark:text-zinc-400 font-light mt-1.5 leading-relaxed">{item.desc}</p>
                                  </div>

                                  {/* Features list */}
                                  <ul className="space-y-1.5 pt-3 border-t border-zinc-200 dark:border-white/5">
                                    {item.features.map((feat) => (
                                      <li key={feat} className="flex items-center gap-2 font-sans text-[10px] text-zinc-600 dark:text-zinc-400 font-light">
                                        <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-emerald-600 dark:bg-emerald-400" : "bg-zinc-400 dark:bg-zinc-600"}`} />
                                        {feat}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-white/5 mt-4">
                                  <span className={`font-sans text-[9px] uppercase tracking-widest font-bold ${isSelected
                                    ? "text-emerald-700 dark:text-emerald-400"
                                    : "text-zinc-500 dark:text-zinc-600"
                                    }`}>
                                    {isSelected ? "● Selected" : "Choose"}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        <div className="flex justify-end pt-6 border-t border-zinc-200 dark:border-white/5">
                          <button
                            type="button"
                            onClick={handleNext}
                            className="flex items-center gap-2 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-6 py-3 font-sans text-xs uppercase font-bold tracking-wider text-white border border-[#2E5A44]/30 transition-all shadow-[0_0_20px_rgba(46,90,68,0.25)] hover:shadow-[0_0_25px_rgba(46,90,68,0.4)] active:scale-95"
                          >
                            Continue
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: BOOKING DETAILS & CONTACT */}
                    {step === 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="border-b border-zinc-200 dark:border-white/5 pb-4 mb-6">
                          <h3 className="text-xl font-serif text-foreground tracking-wide">Booking Details & Contact Info</h3>
                          <p className="text-xs text-zinc-500 mt-1 font-light">Provide your group details and contact coordinates.</p>
                        </div>

                        {/* Booking & Contact Information Block */}
                        <div className="space-y-5 bg-background-alt/40 p-6 rounded-xl border border-card-border backdrop-blur-sm">
                          {formData.eventType === "Table Reservation" ? (
                            <TableReservationForm
                              formData={formData}
                              errors={errors}
                              updateField={updateField}
                              labelAccent={labelAccent}
                            />
                          ) : (
                            <CartReservationForm
                              formData={formData}
                              errors={errors}
                              updateField={updateField}
                              labelAccent={labelAccent}
                              addressDetails={addressDetails}
                              setAddressDetails={setAddressDetails}
                              isAddressExpanded={isAddressExpanded}
                              setIsAddressExpanded={setIsAddressExpanded}
                              handleSaveAddress={handleSaveAddress}
                              isPackageModalOpen={isPackageModalOpen}
                              setIsPackageModalOpen={setIsPackageModalOpen}
                            />
                          )}

                          {/* Contact Details Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Full Name */}
                            <div>
                              <label className={`type-label block mb-2 text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent}`}>Full Name</label>
                              <div className="relative">
                                <User className="absolute left-3 top-[15px] text-zinc-500" size={16} />
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Juan Dela Cruz"
                                  value={formData.fullName}
                                  onChange={(e) => updateField("fullName", e.target.value)}
                                  className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700"
                                />
                              </div>
                              {errors.fullName && <span className="type-error block mt-1">{errors.fullName}</span>}
                            </div>

                            {/* Email */}
                            <div>
                              <label className={`type-label block mb-2 text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent}`}>Email Address</label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-[15px] text-zinc-500" size={16} />
                                <input
                                  type="email"
                                  required
                                  placeholder="e.g. juan.delacruz@gmail.com"
                                  value={formData.email}
                                  onChange={(e) => updateField("email", e.target.value)}
                                  className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700"
                                />
                              </div>
                              {errors.email && <span className="type-error block mt-1">{errors.email}</span>}
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="space-y-2">
                            <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
                              Phone Number
                            </label>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                                <Phone size={14} />
                              </div>
                              <input
                                type="tel"
                                required
                                placeholder="e.g. 09171234567"
                                value={formData.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                                className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700"
                              />
                            </div>
                            {errors.phone && <span className="type-error block mt-1">{errors.phone}</span>}
                          </div>

                          {/* Additional Notes */}
                          <div className="space-y-2">
                            <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
                              Special Requests / Notes
                            </label>
                            <div className="relative group">
                              <div className="absolute top-3.5 left-3.5 pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                                <FileText size={14} />
                              </div>
                              <textarea
                                rows={3}
                                placeholder="e.g. Extra table for gifts, custom foam design..."
                                value={formData.notes}
                                onChange={(e) => updateField("notes", e.target.value)}
                                className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none placeholder:text-neutral-400 dark:placeholder:text-zinc-700 min-h-[90px]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Flavor Selection Dropdowns (Only for Coffee Cart Booking) */}
                        {formData.eventType === "Coffee Cart Booking" && (
                          <div className="space-y-5 bg-background-alt/45 p-6 rounded-xl border border-card-border backdrop-blur-sm">
                            <div className="border-b border-zinc-200/10 pb-2 mb-4 flex justify-between items-baseline">
                              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 block pl-1 font-sans">
                                Customize Package Flavors
                              </span>
                              <span className="text-[8px] uppercase text-zinc-500 font-sans tracking-wide">Required Selection</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Coffee Flavor 1 */}
                              <div className="space-y-2">
                                <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
                                  Coffee Flavor 1 (Iced/Hot)
                                </label>
                                <select
                                  value={formData.coffeeFlavor1 || ""}
                                  onChange={(e) => updateField("coffeeFlavor1", e.target.value)}
                                  className="w-full rounded-lg border border-card-border bg-background-alt/50 px-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 cursor-pointer dark:[&>option]:bg-zinc-950 [&>option]:bg-white"
                                >
                                  <option value="" disabled>Select Coffee Flavor 1</option>
                                  <option value="Spanish Latté">Spanish Latté</option>
                                  <option value="Salted Caramel Latté">Salted Caramel Latté</option>
                                  <option value="White Mocha Latté">White Mocha Latté</option>
                                  <option value="Dark Mocha Latté">Dark Mocha Latté</option>
                                  <option value="Vanilla Bean Latté">Vanilla Bean Latté</option>
                                  <option value="Hazelnut Praline Latté">Hazelnut Praline Latté</option>
                                </select>
                                {errors.coffeeFlavor1 && <span className="type-error block mt-1 text-xs text-red-500 font-sans">{errors.coffeeFlavor1}</span>}
                              </div>

                              {/* Coffee Flavor 2 */}
                              <div className="space-y-2">
                                <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
                                  Coffee Flavor 2 (Iced/Hot)
                                </label>
                                <select
                                  value={formData.coffeeFlavor2 || ""}
                                  onChange={(e) => updateField("coffeeFlavor2", e.target.value)}
                                  className="w-full rounded-lg border border-card-border bg-background-alt/50 px-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 cursor-pointer dark:[&>option]:bg-zinc-950 [&>option]:bg-white"
                                >
                                  <option value="" disabled>Select Coffee Flavor 2</option>
                                  <option value="Spanish Latté">Spanish Latté</option>
                                  <option value="Salted Caramel Latté">Salted Caramel Latté</option>
                                  <option value="White Mocha Latté">White Mocha Latté</option>
                                  <option value="Dark Mocha Latté">Dark Mocha Latté</option>
                                  <option value="Vanilla Bean Latté">Vanilla Bean Latté</option>
                                  <option value="Hazelnut Praline Latté">Hazelnut Praline Latté</option>
                                </select>
                                {errors.coffeeFlavor2 && <span className="type-error block mt-1 text-xs text-red-500 font-sans">{errors.coffeeFlavor2}</span>}
                              </div>

                              {/* Non-Coffee Flavor 1 */}
                              <div className="space-y-2">
                                <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
                                  Non-Coffee Flavor 1 (Over Ice)
                                </label>
                                <select
                                  value={formData.nonCoffeeFlavor1 || ""}
                                  onChange={(e) => updateField("nonCoffeeFlavor1", e.target.value)}
                                  className="w-full rounded-lg border border-card-border bg-background-alt/50 px-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 cursor-pointer dark:[&>option]:bg-zinc-950 [&>option]:bg-white"
                                >
                                  <option value="" disabled>Select Non-Coffee Flavor 1</option>
                                  <option value="Uji Matcha Latté">Uji Matcha Latté</option>
                                  <option value="Ecuadorian Dark Cocoa">Ecuadorian Dark Cocoa</option>
                                  <option value="Strawberry Sakura Milk">Strawberry Sakura Milk</option>
                                  <option value="Hibiscus Berry Iced Tea">Hibiscus Berry Iced Tea</option>
                                  <option value="Premium Peach Blossom Soda">Premium Peach Blossom Soda</option>
                                </select>
                                {errors.nonCoffeeFlavor1 && <span className="type-error block mt-1 text-xs text-red-500 font-sans">{errors.nonCoffeeFlavor1}</span>}
                              </div>

                              {/* Non-Coffee Flavor 2 */}
                              <div className="space-y-2">
                                <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
                                  Non-Coffee Flavor 2 (Over Ice)
                                </label>
                                <select
                                  value={formData.nonCoffeeFlavor2 || ""}
                                  onChange={(e) => updateField("nonCoffeeFlavor2", e.target.value)}
                                  className="w-full rounded-lg border border-card-border bg-background-alt/50 px-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 cursor-pointer dark:[&>option]:bg-zinc-950 [&>option]:bg-white"
                                >
                                  <option value="" disabled>Select Non-Coffee Flavor 2</option>
                                  <option value="Uji Matcha Latté">Uji Matcha Latté</option>
                                  <option value="Ecuadorian Dark Cocoa">Ecuadorian Dark Cocoa</option>
                                  <option value="Strawberry Sakura Milk">Strawberry Sakura Milk</option>
                                  <option value="Hibiscus Berry Iced Tea">Hibiscus Berry Iced Tea</option>
                                  <option value="Premium Peach Blossom Soda">Premium Peach Blossom Soda</option>
                                </select>
                                {errors.nonCoffeeFlavor2 && <span className="type-error block mt-1 text-xs text-red-500 font-sans">{errors.nonCoffeeFlavor2}</span>}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Policy Info Card */}
                        {formData.eventType === "Table Reservation" ? (
                          <TableReservationPolicy />
                        ) : (
                          <CartReservationPolicy />
                        )}

                        {/* Summary Block */}
                        <div className="rounded-xl border border-card-border bg-card p-6 space-y-4 mt-8 relative overflow-hidden">
                          {/* Inner emerald decorative line */}
                          <div className="absolute inset-2 border border-emerald-500/10 dark:border-emerald-950/20 rounded-lg pointer-events-none" />
                          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-3 relative z-10">
                            <h4 className={`font-sans text-[10px] uppercase font-bold tracking-[0.25em] ${labelAccent}`}>Review Booking Details</h4>
                            <span className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Summary</span>
                          </div>

                          <div className="space-y-3.5 pt-2 relative z-10">
                            {(() => {
                              const pricing = getPricingDetails();
                              const endTime = getEndTimeString(formData.time);
                              const list = [
                                { label: "Selected Experience", value: formData.eventType === "Table Reservation" ? "Lounge Table Reservation" : '"Brew Buggy" Mobile Coffee Cart', highlight: true },
                                { label: "Reservation Date", value: formData.date },
                                { label: "Service Time (3 Hrs)", value: `${formData.time} - ${endTime}` },
                                { label: "Capacity / Package", value: formData.eventType === "Table Reservation" ? `${formData.guestCount} Guests` : `${formData.guestCount} Pax Package` },
                                { label: "Location", value: formData.eventType === "Table Reservation" ? "Antonioni Grounds - Tiaong" : formData.location },
                                { label: "Package Price", value: `₱${pricing.totalPrice.toLocaleString()}` },
                                { label: "Required Downpayment", value: `₱${pricing.downpayment.toLocaleString()}`, highlight: true }
                              ];

                              return list.map((row, idx) => (
                                <div key={idx} className="flex justify-between items-baseline gap-4 text-xs">
                                  <span className="font-sans text-zinc-500 dark:text-zinc-400 font-normal whitespace-nowrap">{row.label}</span>
                                  <span className={`font-sans text-right ${row.highlight ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-foreground font-medium"}`}>
                                    {row.value || "—"}
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        {/* Summary Policy footer note */}
                        <div className="mt-4 px-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                          {getPricingDetails().notes}
                        </div>

                        <div className="flex justify-between pt-6 border-t border-zinc-200 dark:border-white/5 mt-8">
                          <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-600/5 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/10 transition-all active:scale-95"
                          >
                            <ChevronLeft size={14} />
                            Back
                          </button>
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-8 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-white border border-[#2E5A44]/30 transition-all shadow-[0_0_20px_rgba(46,90,68,0.3)] hover:shadow-[0_0_25px_rgba(46,90,68,0.5)] active:scale-95"
                          >
                            Confirm Booking
                            <CheckCircle2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </form>
                </div>
              </div>

            </div>
          </div>
          ) : (
            /* Centered success docket screen */
            <SuccessDocket
              step={step}
              formData={formData}
              errors={errors}
              updateField={updateField}
              labelAccent={labelAccent}
              ticketId={ticketId}
              reservationStatus={reservationStatus}
              isPaid={isPaid}
              showPaymentForm={showPaymentForm}
              setShowPaymentForm={setShowPaymentForm}
              handleConfirmPayment={handleConfirmPayment}
              getEndTimeString={getEndTimeString}
              getPricingDetails={getPricingDetails}
              onFileSelect={setProofFile}
            />
          )}
        </div>

        {/* Reservation Tracking Modal */}
        <AnimatePresence>
          {isTrackModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsTrackModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="relative w-full max-w-lg rounded-2xl border border-card-border bg-card/95 p-6 shadow-2xl overflow-hidden backdrop-blur-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative gradients inside modal */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2E5A44]/5 blur-3xl rounded-full pointer-events-none" />

                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-zinc-200 dark:border-white/5 pb-4 mb-5">
                  <div>
                    <h3 className="text-xl font-serif text-foreground font-semibold">Track Reservation Status</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-light">Verify the real-time status of your booking.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTrackModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400 hover:text-foreground transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Search Input and Action */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 text-zinc-500" size={16} />
                      <input
                        type="text"
                        placeholder="Enter Booking ID (e.g. LN-123456)"
                        value={searchTicketId}
                        onChange={(e) => setSearchTicketId(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleTrackSearch(searchTicketId);
                        }}
                        className="w-full rounded-xl border border-card-border bg-background-alt/40 pl-10 pr-4 py-2.5 font-mono text-sm text-foreground outline-none focus:border-emerald-500 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-600"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isTrackingLoading || !searchTicketId.trim()}
                      onClick={() => handleTrackSearch(searchTicketId)}
                      className="rounded-xl bg-[#2E5A44] hover:bg-[#234533] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {isTrackingLoading ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        "Search"
                      )}
                    </button>
                  </div>

                  {/* Errors */}
                  {trackingError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-sans">
                      {trackingError}
                    </div>
                  )}

                  {/* Recent Bookings Shortcut List */}
                  {!trackedReservation && !isTrackingLoading && (() => {
                    const seenIds = new Set();
                    const localBookings = (sessionEmail 
                      ? dbReservations.filter((r: any) => r.email && r.email.toLowerCase() === sessionEmail.toLowerCase())
                      : db.getReservations()
                    ).filter(
                      (r: any) => {
                        if (!r.id || !r.id.startsWith("LN-") || seenIds.has(r.id)) {
                          return false;
                        }
                        seenIds.add(r.id);
                        return true;
                      }
                    );

                    return (
                      <div className="space-y-2.5">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500 pl-1 block">
                          {sessionEmail ? `Recent Bookings for ${sessionEmail}` : "Recent Bookings on this device"}
                        </span>

                        {localBookings.length === 0 ? (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-600 font-light italic pl-1">
                            {sessionEmail 
                              ? "No bookings found in our records for your email." 
                              : "No recent bookings detected on this browser session."}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
                            {localBookings.map((r: any) => (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => {
                                  setSearchTicketId(r.id);
                                  handleTrackSearch(r.id);
                                }}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-card-border bg-card/40 hover:bg-[#2E5A44]/5 hover:border-emerald-500/30 text-left transition-all duration-300 group cursor-pointer"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-foreground">{r.id}</span>
                                    <span className="text-[9px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                                      {r.fullName}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-zinc-500 font-light mt-0.5">
                                    {r.eventType} • {r.date}
                                  </div>
                                </div>
                                <ChevronRight size={14} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Tracked Reservation Details */}
                  {trackedReservation && (
                    <div className="space-y-5 pt-2">
                      <div className="p-4 rounded-xl border border-card-border bg-card/65 space-y-4">
                        <div className="flex justify-between items-start border-b border-zinc-200 dark:border-white/5 pb-2.5">
                          <div>
                            <span className="text-[9px] uppercase text-zinc-500 font-sans tracking-wide block">Reservation ID</span>
                            <span className="font-mono text-sm font-semibold text-foreground tracking-wider">{trackedReservation.id}</span>
                          </div>
                          
                          {/* Premium Status Badge */}
                          {(() => {
                            const status = trackedReservation.status;
                            const isPaid = trackedReservation.referenceNumber && trackedReservation.proofOfPayment;
                            
                            if (status === "Cancelled") {
                              return (
                                <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                                  CANCELLED
                                </span>
                              );
                            }
                            if (status === "Cancellation Requested") {
                              return (
                                <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-400 animate-pulse" />
                                  CANCELLATION REQUESTED
                                </span>
                              );
                            }
                            if (status === "Approved") {
                              return (
                                <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                                  APPROVED & PAID
                                </span>
                              );
                            }
                            if (isPaid) {
                              return (
                                <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                                  PENDING VERIFICATION
                                </span>
                              );
                            }
                            if (status === "Pre-Approved") {
                              return (
                                <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                                  PRE-APPROVED
                                </span>
                              );
                            }
                            return (
                              <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 px-2 py-0.5 rounded font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400" />
                                PENDING APPROVAL
                              </span>
                            );
                          })()}
                        </div>

                        {/* Details Table */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                          <div>
                            <span className="text-[9px] uppercase text-zinc-500 font-sans tracking-wide block">Customer</span>
                            <span className="text-foreground font-medium">{trackedReservation.fullName}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase text-zinc-500 font-sans tracking-wide block">Phone</span>
                            <span className="text-foreground font-medium">{trackedReservation.phone}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase text-zinc-500 font-sans tracking-wide block">Experience</span>
                            <span className="text-foreground font-medium">{trackedReservation.eventType}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase text-zinc-500 font-sans tracking-wide block">Date & Time</span>
                            <span className="text-foreground font-medium">{trackedReservation.date} @ {trackedReservation.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Requested notice */}
                      {trackedReservation.status === "Cancellation Requested" && (
                        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-left space-y-2">
                          <h4 className="font-semibold text-xs text-orange-500">Cancellation Under Review</h4>
                          <p className="text-[10px] text-orange-500/80 leading-relaxed font-light">
                            Your cancellation request has been received. Our admin team will review it and process your request shortly. You will be notified of the outcome via email.
                          </p>
                          {trackedReservation.cancellationReason && (
                            <div className="pt-2 border-t border-orange-500/20">
                              <span className="text-[9px] uppercase tracking-wide text-orange-600 dark:text-orange-400 font-bold block mb-1">Your Reason</span>
                              <p className="text-[11px] text-foreground italic">"{trackedReservation.cancellationReason}"</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Visual Timeline */}
                      {trackedReservation.status !== "Cancelled" && trackedReservation.status !== "Cancellation Requested" && (
                        <div className="space-y-4 bg-background-alt/25 p-4 rounded-xl border border-card-border">
                          <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-zinc-500 pl-1 block">
                            Booking Journey Tracker
                          </span>

                          <div className="relative pl-6 space-y-5">
                            {/* Vertical Line */}
                            <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[2px] bg-zinc-200 dark:bg-white/5" />

                            {/* Journey Steps */}
                            {(() => {
                              const status = trackedReservation.status;
                              const isPaid = trackedReservation.referenceNumber && trackedReservation.proofOfPayment;
                              
                              const steps = [
                                {
                                  label: "Booking Submitted",
                                  desc: "We received your reservation request.",
                                  isDone: true,
                                  isCurrent: status === "Pending",
                                },
                                {
                                  label: "Administrative Review",
                                  desc: "Our team verifies scheduling & capacity.",
                                  isDone: status !== "Pending",
                                  isCurrent: status === "Pre-Approved" && !isPaid,
                                },
                                {
                                  label: "Downpayment Submission",
                                  desc: isPaid ? "Downpayment received & pending verification." : "Submit downpayment reference to lock your slot.",
                                  isDone: status === "Approved",
                                  isCurrent: (status === "Pre-Approved" || isPaid) && status !== "Approved",
                                },
                                {
                                  label: "Reservation Fully Confirmed",
                                  desc: "Downpayment verified. Your slot is officially secured!",
                                  isDone: status === "Approved" || status === "Completed",
                                  isCurrent: status === "Approved",
                                }
                              ];

                              return steps.map((step, idx) => (
                                <div key={idx} className="relative text-xs">
                                  {/* Dot */}
                                  <div className={`absolute -left-[24px] top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                    step.isDone 
                                      ? "bg-emerald-600 border-emerald-500 text-white" 
                                      : step.isCurrent 
                                        ? "bg-amber-500 border-amber-400 text-white animate-pulse" 
                                        : "bg-card border-card-border text-zinc-400"
                                  }`}>
                                    {step.isDone ? <Check size={10} className="stroke-[3]" /> : <Clock size={10} />}
                                  </div>
                                  <div>
                                    <h4 className={`font-semibold ${step.isDone || step.isCurrent ? "text-foreground" : "text-zinc-500 font-normal"}`}>
                                      {step.label}
                                    </h4>
                                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-light">
                                      {step.desc}
                                    </p>
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* If Cancelled */}
                      {trackedReservation.status === "Cancelled" && (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-left">
                          <h4 className="font-semibold text-xs text-rose-500">Reservation Cancelled</h4>
                          <p className="text-[10px] text-rose-500/80 mt-1 leading-relaxed font-light">
                            This reservation request has been cancelled by our system or the admin team. Please request a new booking session or contact host services.
                          </p>
                        </div>
                      )}

                      {/* Quick Action Button */}
                      <div className="pt-2 flex justify-end gap-3.5">
                        <button
                          type="button"
                          onClick={() => {
                            setTrackedReservation(null);
                            setSearchTicketId("");
                            setTrackingError(null);
                          }}
                          className="rounded-full border border-card-border bg-card hover:bg-background-alt px-5 py-2 font-sans text-[10px] uppercase font-bold tracking-wider text-zinc-500 hover:text-foreground transition-all active:scale-95 cursor-pointer"
                        >
                          Clear Result
                        </button>
                        <a
                          href={`/reservations/${trackedReservation.id}`}
                          className="flex items-center gap-1.5 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-6 py-2 font-sans text-[10px] uppercase font-bold tracking-wider text-white transition-all active:scale-95 shadow-[0_2px_12px_rgba(46,90,68,0.2)] cursor-pointer"
                        >
                          Open Invoice & Pay
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </PageTransition>
  );
}

