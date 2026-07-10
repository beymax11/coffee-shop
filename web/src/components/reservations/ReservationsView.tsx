"use client";

import React, { useState, useEffect } from "react";
import { Coffee, Calendar as CalendarIcon, Clock, Users, MapPin, ChevronRight, ChevronLeft, CheckCircle2, User, Mail, Phone, FileText, Printer } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/utils/db";

type ReservationType = "Coffee Cart Booking" | "Table Reservation";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  eventType: ReservationType;
  date: string;
  time: string;
  guestCount: number;
  location: string;
  notes: string;
}

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
  });

  const [isMounted, setIsMounted] = useState(false);
  const [ticketId, setTicketId] = useState("");

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

  useEffect(() => {
    const sessionEmail = localStorage.getItem("customer_session");
    if (sessionEmail) {
      const members = db.getLoyaltyMembers();
      const found = members.find(
        (m) => (m.email && m.email.toLowerCase() === sessionEmail.toLowerCase()) ||
          (m.phone && m.phone.trim() === sessionEmail.trim())
      );
      if (found) {
        setFormData((prev) => ({
          ...prev,
          fullName: found.name,
          email: found.email || "",
          phone: found.phone || "",
        }));
      }
    }
  }, []);

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

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
        features: ["1 - 4 guests capacity", "Complimentary welcome pour", "Full patisserie menu access"],
        pricing: "$45 / Table",
        icon: Coffee,
      },
      {
        type: "Coffee Cart Booking",
        title: "Mobile Coffee Cart Sourcing",
        category: "Off-Site Sourcing",
        desc: "Sponsor our premium copper & brass espresso cart directly at weddings, fashion galas, or private product launches.",
        features: ["2 certified master baristas", "Unlimited espresso bar drinks", "Custom foam monogram stencil"],
        pricing: "Bespoke Quote",
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
    } else if (step === 3) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      setStep(4);
    }
  };

  const selectType = (type: ReservationType) => {
    setFormData({
      ...formData,
      eventType: type,
      // Default location to "Antonioni Grounds Café" if booking a table
      location: type === "Table Reservation" ? "Antonioni Grounds - Tiaong" : formData.location,
      time: type === "Table Reservation" ? "08:00 AM" : "",
    });
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
  const activeColor = isTable ? "bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "bg-[#8B5E3C] shadow-[0_0_12px_rgba(139,94,60,0.4)]";
  const todayActiveDot = isTable ? "bg-emerald-500" : "bg-[#8B5E3C]";
  const labelAccent = isTable ? "text-emerald-500/90" : "text-[#8B5E3C]/95";

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
          className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#8B5E3C]/5 blur-[150px] rounded-full pointer-events-none print:hidden"
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
                  background: i % 2 === 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(212, 197, 185, 0.15)",
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
          {step < 4 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

              <div className="lg:col-span-4 order-1 lg:sticky lg:top-16 text-left lg:pr-12 lg:border-r lg:border-zinc-200 dark:lg:border-white/5 lg:py-4 print:hidden">
                <span className={`text-[10px] uppercase font-bold tracking-[0.35em] block mb-3 font-sans transition-colors duration-300 ${step >= 2 ? labelAccent : "text-emerald-500/90"}`}>
                  {step >= 2 ? "Reservation Details" : "Bespoke Experience"}
                </span>
                <h1 className="text-4xl lg:text-5xl font-serif text-foreground tracking-tight font-semibold leading-tight mt-2">
                  {step >= 2 ? "Select Date & Time" : "Secure Your Ritual"}
                </h1>
                <div className="w-16 h-[1px] bg-brand-gold mt-6 mb-6" />

                {step >= 2 ? (
                  <div className="space-y-6">
                    {/* Custom Interactive Calendar */}
                    <div className="rounded-xl border border-card-border bg-card/45 backdrop-blur-md p-4 shadow-lg relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
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
                          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-zinc-500 hover:text-foreground"
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
                          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-zinc-500 hover:text-foreground"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Weekday Labels */}
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                          <span key={day} className="text-[10px] font-sans font-bold text-zinc-500 tracking-wider">
                            {day}
                          </span>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {getCalendarDays(calendarMonth).map((day, idx) => {
                          const dateStr = formatDateString(day.date);
                          const isSelected = formData.date === dateStr;
                          const isToday = formatDateString(new Date()) === dateStr;
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={day.isPast}
                              onClick={() => {
                                updateField("date", dateStr);
                              }}
                              className={`aspect-square flex items-center justify-center text-xs font-sans rounded-full transition-all duration-200 relative ${isSelected
                                  ? `${activeColor} font-bold text-white`
                                  : day.isPast
                                    ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-30"
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
                          );
                        })}
                      </div>
                    </div>
                    {errors.date && <span className="type-error block pl-1 text-xs text-red-500 font-sans">{errors.date}</span>}

                    {/* Time Selector */}
                    {isTable ? (
                      (() => {
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
                          <div className="space-y-2">
                            <label className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5E3C]/90 dark:text-[#D4C5B9] block pl-1">
                              Select Preferred Time
                            </label>
                            <div className="flex items-center gap-1.5 bg-background-alt/50 p-2 rounded-xl border border-card-border">
                              {/* Hour Dropdown */}
                              <div className="flex-1">
                                <span className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5 pl-1 font-sans tracking-wide">Hour</span>
                                <select
                                  value={selectedHour}
                                  onChange={(e) => handleTimeChange("hour", e.target.value)}
                                  className="w-full bg-card border border-card-border rounded-lg px-2 py-1.5 text-xs text-foreground outline-none focus:border-emerald-500 transition-all font-mono"
                                >
                                  {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((h) => (
                                    <option key={h} value={h}>{h}</option>
                                  ))}
                                </select>
                              </div>

                              <span className="text-foreground self-end mb-2 font-bold font-mono">:</span>

                              {/* Minute Dropdown */}
                              <div className="flex-1">
                                <span className="text-[8px] uppercase font-bold text-zinc-500 block mb-0.5 pl-1 font-sans tracking-wide">Minute</span>
                                <select
                                  value={selectedMinute}
                                  onChange={(e) => handleTimeChange("minute", e.target.value)}
                                  className="w-full bg-card border border-card-border rounded-lg px-2 py-1.5 text-xs text-foreground outline-none focus:border-emerald-500 transition-all font-mono"
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
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-300 font-sans ${isActive
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
                            {errors.time && <span className="type-error block pl-1 text-xs text-red-500 font-sans">{errors.time}</span>}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5E3C]/90 dark:text-[#D4C5B9] block pl-1">
                          Select Preferred Time Slot
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {timeSlots.map((slot) => {
                            const isSelected = formData.time === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => updateField("time", slot)}
                                className={`px-3 py-2.5 rounded-lg text-xs font-sans border transition-all duration-300 text-center flex items-center justify-center min-h-[40px] ${
                                  isSelected
                                    ? "bg-[#8B5E3C]/25 border-[#8B5E3C] text-[#8B5E3C] dark:text-[#EADBC8] shadow-[0_0_12px_rgba(139,94,60,0.15)] font-semibold"
                                    : "bg-card border-card-border text-neutral-500 hover:border-brand-gold/30 hover:bg-background"
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                        {errors.time && <span className="type-error block pl-1 text-xs text-red-500 font-sans">{errors.time}</span>}
                      </div>
                    )}
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
                              ? "bg-[#8B5E3C] w-3.5"
                              : "bg-white/30 hover:bg-white/60"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Form & Stepper */}
              <div className="lg:col-span-8 order-2">
                {/* Stepper indicators */}
                <div className="max-w-xl mx-auto mb-10 relative print:hidden">
                  <div className="flex items-center justify-between text-center select-none">
                    {[
                      { num: 1, label: "Experience" },
                      { num: 2, label: "Schedule" },
                      { num: 3, label: "Guest Details" },
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
                                  ? "text-[#8B5E3C] dark:text-[#D4C5B9]"
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
                                  ? "bg-[#8B5E3C]"
                                  : "bg-zinc-200 dark:bg-white/5"
                              }`} />
                          </button>

                          {idx < 2 && (
                            <div className="flex-1 flex justify-center items-center px-4 -mt-5">
                              <div className={`h-[1px] w-full transition-all duration-700 ${step > item.num ? "bg-[#8B5E3C]/40" : "bg-zinc-200 dark:bg-white/5"
                                }`} />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
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
                                    ? isTable
                                      ? "bg-gradient-to-br from-[#ECF7F2] to-[#D8ECE1] border-emerald-600/50 shadow-[0_10px_30px_rgba(46,90,68,0.12)] text-foreground dark:from-[#07130E]/95 dark:to-[#0F261B]/95 dark:border-emerald-500/80 dark:shadow-[0_10px_30px_rgba(46,90,68,0.25)]"
                                      : "bg-gradient-to-br from-[#FAF5F0] to-[#F1E8DF] border-[#8B5E3C]/60 shadow-[0_10px_30px_rgba(139,94,60,0.12)] text-foreground dark:from-[#120B07]/95 dark:to-[#22150D]/95 dark:border-[#8B5E3C]/80 dark:shadow-[0_10px_30px_rgba(139,94,60,0.25)]"
                                    : "bg-card border-card-border text-neutral-500 hover:border-brand-gold/30 hover:bg-background"
                                  }`}
                              >
                                <div className="space-y-4 flex-1">
                                  {/* Card Top Row */}
                                  <div className="flex justify-between items-start">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${isSelected
                                        ? isTable
                                          ? "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-[#2E5A44]/20 dark:text-emerald-400 dark:border-emerald-500/40"
                                          : "bg-[#8B5E3C]/10 border-[#8B5E3C]/30 text-[#8B5E3C] dark:bg-[#8B5E3C]/20 dark:text-[#EADBC8] dark:border-[#8B5E3C]/40"
                                        : "bg-zinc-100 dark:bg-white/5 text-zinc-500 border-zinc-200 dark:border-white/5"
                                      }`}>
                                      <Icon size={18} />
                                    </div>
                                    <div className="text-right">
                                      <span className={`text-[8px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${isSelected
                                          ? isTable
                                            ? "text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-500/30"
                                            : "text-[#8B5E3C] bg-[#8B5E3C]/10 border-[#8B5E3C]/20 dark:text-[#EADBC8] dark:bg-[#8B5E3C]/10 dark:border-[#8B5E3C]/30"
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
                                          ? isTable
                                            ? "text-emerald-700 dark:text-emerald-400"
                                            : "text-[#8B5E3C] dark:text-[#EADBC8]"
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
                                        <span className={`w-1 h-1 rounded-full ${isSelected ? isTable ? "bg-emerald-600 dark:bg-emerald-400" : "bg-[#8B5E3C]" : "bg-zinc-400 dark:bg-zinc-600"}`} />
                                        {feat}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-white/5 mt-4">
                                  <span className={`font-sans text-[9px] uppercase tracking-widest font-bold ${isSelected
                                      ? isTable
                                        ? "text-emerald-700 dark:text-emerald-400"
                                        : "text-[#8B5E3C] dark:text-[#EADBC8]"
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

                    {/* STEP 2: DATE / TIME / DETAILS */}
                    {step === 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="border-b border-zinc-200 dark:border-white/5 pb-4 mb-6">
                          <h3 className="text-xl font-serif text-foreground tracking-wide">Date & Booking Details</h3>
                          <p className="text-xs text-zinc-500 mt-1 font-light">Provide the specific coordinates of your visit.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background-alt/40 p-6 rounded-xl border border-card-border backdrop-blur-sm">
                          {formData.eventType === "Table Reservation" ? (
                            <>
                              {/* Guest Count Input Field */}
                              <div className="space-y-2 col-span-1">
                                <label className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5E3C]/90 dark:text-[#D4C5B9] block pl-1">
                                  Guest Count
                                </label>
                                <div className="relative group">
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Users size={14} />
                                  </div>
                                  <input
                                    type="number"
                                    required
                                    min={1}
                                    max={4}
                                    value={formData.guestCount || ""}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      updateField("guestCount", isNaN(val) ? "" : Math.min(4, Math.max(1, val)));
                                    }}
                                    className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="Number of guests"
                                  />
                                </div>
                                <span className="text-[9px] text-zinc-500 pl-1 font-sans block">Capacity: 1 - 4 guests</span>
                                {errors.guestCount && <span className="type-error block mt-1">{errors.guestCount}</span>}
                              </div>

                              {/* Venue / Location Address (Disabled for Table Reservation) */}
                              <div className="space-y-2 col-span-1">
                                <label className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5E3C]/90 dark:text-[#D4C5B9] block pl-1">
                                  Location
                                </label>
                                <div className="relative group">
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                                    <MapPin size={14} className="text-zinc-500" />
                                  </div>
                                  <input
                                    type="text"
                                    disabled
                                    value="Antonioni Grounds - Tiaong"
                                    className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-zinc-500 cursor-not-allowed"
                                  />
                                </div>
                              </div>

                              {/* Lounge Reserve Policy Info Card */}
                              <div className="col-span-1 md:col-span-2 p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10 mt-2">
                                <h4 className="text-xs font-serif font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase mb-1">
                                  Antonioni Grounds - Tiaong Lounge Reserve Policy
                                </h4>
                                <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
                                  To ensure the ultimate sensory experience for all guests, lounge tables are reserved for a duration of 90 minutes. Reservations are held for 15 minutes past the scheduled booking. Premium pour-overs and tasting flights are available in-lounge.
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Guest Count Input Field */}
                              <div className="space-y-2 col-span-1">
                                <label className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5E3C]/90 dark:text-[#D4C5B9] block pl-1">
                                  Guest Count
                                </label>
                                <div className="relative group">
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#8B5E3C] transition-colors">
                                    <Users size={14} />
                                  </div>
                                  <input
                                    type="number"
                                    required
                                    min={1}
                                    max={200}
                                    value={formData.guestCount || ""}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      updateField("guestCount", isNaN(val) ? "" : Math.min(200, Math.max(1, val)));
                                    }}
                                    className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-[#8B5E3C]/80 focus:ring-1 focus:ring-[#8B5E3C]/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="Number of guests"
                                  />
                                </div>
                                <span className="text-[9px] text-zinc-500 pl-1 font-sans block">Capacity: 1 - 200 Pax</span>
                                {errors.guestCount && <span className="type-error block mt-1">{errors.guestCount}</span>}
                              </div>

                              {/* Venue / Location Address */}
                              <div className="space-y-2 col-span-1">
                                <label className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5E3C]/90 dark:text-[#D4C5B9] block pl-1">
                                  Location
                                </label>
                                <div className="relative group">
                                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#8B5E3C]">
                                    <MapPin size={14} className="text-zinc-500 group-focus-within:text-[#8B5E3C]" />
                                  </div>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. 5th Avenue Loft, New York"
                                    value={formData.location}
                                    onChange={(e) => updateField("location", e.target.value)}
                                    className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-[#8B5E3C]/80 focus:ring-1 focus:ring-[#8B5E3C]/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700"
                                  />
                                </div>
                                {errors.location && <span className="type-error block mt-1">{errors.location}</span>}
                              </div>

                              {/* Sourcing Info Card */}
                              <div className="col-span-1 md:col-span-2 p-4 bg-[#8B5E3C]/5 rounded-lg border border-[#8B5E3C]/10 mt-2">
                                <h4 className="text-xs font-serif font-bold text-[#8B5E3C] dark:text-[#EADBC8] tracking-wider uppercase mb-1">
                                  Mobile Coffee Cart Sourcing Details
                                </h4>
                                <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
                                  Our premium espresso bar setup is fully mobile and includes everything needed for certified master barista services at your venue. Event coordinate details and power logistics will be finalized by our event coordination team upon reservation approval.
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex justify-between pt-6 border-t border-zinc-200 dark:border-white/5">
                          <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center gap-1.5 rounded-full border border-[#8B5E3C]/20 bg-[#8B5E3C]/5 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-[#8B5E3C] dark:text-[#D4C5B9] hover:bg-[#8B5E3C]/10 transition-all active:scale-95"
                          >
                            <ChevronLeft size={14} />
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={handleNext}
                            className="flex items-center gap-1.5 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-white border border-[#2E5A44]/30 transition-all shadow-[0_0_20px_rgba(46,90,68,0.25)] hover:shadow-[0_0_25px_rgba(46,90,68,0.4)] active:scale-95"
                          >
                            Continue
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: CONTACT INFO & NOTES */}
                    {step === 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="border-b border-zinc-200 dark:border-white/5 pb-4 mb-6">
                          <h3 className="text-xl font-serif text-foreground tracking-wide">Contact Information & Review</h3>
                          <p className="text-xs text-zinc-500 mt-1 font-light">Confirm your contact coordinate details before booking.</p>
                        </div>

                        <div className="space-y-5 bg-background-alt/40 p-6 rounded-xl border border-card-border backdrop-blur-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                              <label className="type-label block mb-2 text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5E3C]/90 dark:text-[#D4C5B9]">Full Name</label>
                              <div className="relative">
                                <User className="absolute left-3 top-[15px] text-zinc-500" size={16} />
                                <input
                                  type="text"
                                  required
                                  placeholder="Enter your name"
                                  value={formData.fullName}
                                  onChange={(e) => updateField("fullName", e.target.value)}
                                  className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700"
                                />
                              </div>
                              {errors.fullName && <span className="type-error block mt-1">{errors.fullName}</span>}
                            </div>

                            {/* Email */}
                            <div>
                              <label className="type-label block mb-2 text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5E3C]/90 dark:text-[#D4C5B9]">Email Address</label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-[15px] text-zinc-500" size={16} />
                                <input
                                  type="email"
                                  required
                                  placeholder="john@example.com"
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
                            <label className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5E3C]/90 dark:text-[#D4C5B9] block pl-1">
                              Phone Number
                            </label>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                                <Phone size={14} />
                              </div>
                              <input
                                type="tel"
                                required
                                placeholder="+1 (555) 019-2834"
                                value={formData.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                                className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700"
                              />
                            </div>
                            {errors.phone && <span className="type-error block mt-1">{errors.phone}</span>}
                          </div>

                          {/* Additional Notes */}
                          <div className="space-y-2">
                            <label className="font-sans text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B5E3C]/90 dark:text-[#D4C5B9] block pl-1">
                              Special Requests / Notes
                            </label>
                            <div className="relative group">
                              <div className="absolute top-3.5 left-3.5 pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                                <FileText size={14} />
                              </div>
                              <textarea
                                rows={3}
                                placeholder="e.g. Saffron allergy, custom menu engravings, special staging, custom foam art..."
                                value={formData.notes}
                                onChange={(e) => updateField("notes", e.target.value)}
                                className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none placeholder:text-neutral-400 dark:placeholder:text-zinc-700 min-h-[90px]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Summary Block */}
                        <div className="rounded-xl border border-card-border bg-card p-6 space-y-4 mt-8 relative overflow-hidden">
                          {/* Inner emerald decorative line */}
                          <div className="absolute inset-2 border border-emerald-500/10 dark:border-emerald-950/20 rounded-lg pointer-events-none" />
                          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-3 relative z-10">
                            <h4 className="font-sans text-[10px] uppercase font-bold tracking-[0.25em] text-emerald-600 dark:text-emerald-400">Review Booking Details</h4>
                            <span className="font-serif text-[11px] text-[#8B5E3C] dark:text-[#D4C5B9] italic">Summary</span>
                          </div>

                          <div className="space-y-3.5 pt-2 relative z-10">
                            {[
                              { label: "Selected Experience", value: formData.eventType, highlight: true },
                              { label: "Reservation Date", value: formData.date },
                              { label: "Preferred Time Slot", value: formData.time },
                              { label: "Guests Attending", value: `${formData.guestCount} Guests` },
                              { 
                                label: formData.eventType === "Table Reservation" ? "Store Location" : "Venue Coordinate", 
                                value: formData.eventType === "Table Reservation" ? "Antonioni Grounds - Tiaong" : formData.location 
                              },
                            ].map((row, idx) => (
                              <div key={idx} className="flex justify-between items-baseline gap-4 text-xs">
                                <span className="font-sans text-zinc-500 font-light whitespace-nowrap">{row.label}</span>
                                <span className={`font-serif text-right ${row.highlight ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-foreground font-medium"}`}>
                                  {row.value || "—"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t border-zinc-200 dark:border-white/5 mt-8">
                          <button
                            type="button"
                            onClick={handleBack}
                            className="flex items-center gap-1.5 rounded-full border border-[#8B5E3C]/20 bg-[#8B5E3C]/5 px-6 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-[#8B5E3C] dark:text-[#D4C5B9] hover:bg-[#8B5E3C]/10 transition-all active:scale-95"
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
          ) : (
            /* Centered success docket screen */
            <div className="max-w-xl mx-auto py-8 print:py-0 print:max-w-none">
              {/* STEP 4: SUCCESS CONFIRMATION SCREEN */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 print:space-y-0"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2E5A44]/10 border border-[#2E5A44]/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(46,90,68,0.2)] print:hidden">
                    <CheckCircle2 size={36} className="stroke-[1.5]" />
                  </div>

                  <div className="space-y-2 print:hidden">
                    <h3 className="text-3xl font-serif text-foreground tracking-wide font-semibold">Reservation Confirmed</h3>
                    <p className="font-sans text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed max-w-md mx-auto">
                      Thank you for choosing L&apos;OR NOIR. An elegant confirmation docket and calendar invite have been dispatched to <strong className="text-foreground font-medium">{formData.email}</strong>.
                    </p>
                  </div>

                  {/* Visual Receipt Card */}
                  <div
                    id="reservation-ticket"
                    className="max-w-md mx-auto rounded-xl border border-card-border bg-card p-8 text-left space-y-6 relative border-t-4 border-t-[#2E5A44] shadow-2xl overflow-hidden font-sans print:bg-white print:text-black print:border-t-black print:border print:border-zinc-300 print:shadow-none print:max-w-none"
                  >
                    {/* Punch hole cutouts on side */}
                    <div className="absolute -left-3 top-[73%] w-6 h-6 rounded-full bg-background border-r border-card-border z-10 print:hidden" />
                    <div className="absolute -right-3 top-[73%] w-6 h-6 rounded-full bg-background border-l border-card-border z-10 print:hidden" />

                    {/* Stamp overlay */}
                    <div className="absolute top-16 right-6 border-2 border-emerald-500/20 text-emerald-500/30 px-3 py-1 rounded text-xs font-serif uppercase tracking-[0.2em] font-bold rotate-12 select-none pointer-events-none print:border-black/20 print:text-black/30">
                      RESERVE SECURED
                    </div>

                    {/* Monogram water mark */}
                    <div className="absolute -right-6 -bottom-6 text-[#2E5A44]/10 pointer-events-none text-9xl font-serif select-none font-bold italic print:text-zinc-100">AG</div>

                    <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-3">
                      <div>
                        <span className="font-sans text-[9px] uppercase tracking-widest text-zinc-500 print:text-zinc-500 block">Reservation Docket</span>
                        <h4 className="font-mono text-sm text-foreground print:text-black mt-1 tracking-wider">#{ticketId || "LN-XXXXXX"}</h4>
                      </div>
                      <span className="flex items-center gap-1.5 font-sans text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-[#2E5A44]/10 border border-[#2E5A44]/30 px-2.5 py-1 rounded font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)] print:text-black print:bg-zinc-100 print:border-zinc-300 print:shadow-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] print:bg-zinc-500 print:animate-none print:shadow-none" />
                        PENDING APPROVAL
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2 font-sans text-zinc-600 dark:text-zinc-400 print:text-zinc-800">
                      <div>
                        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Guest Name</span>
                        <span className="font-serif text-sm text-foreground print:text-black font-medium mt-0.5 block">{formData.fullName}</span>
                      </div>
                      <div>
                        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Contact Phone</span>
                        <span className="font-serif text-sm text-foreground print:text-black font-medium mt-0.5 block">{formData.phone}</span>
                      </div>
                      <div>
                        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Experience</span>
                        <span className="font-serif text-sm text-foreground print:text-black font-medium mt-0.5 block">{formData.eventType}</span>
                      </div>
                      <div>
                        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Schedule</span>
                        <span className="font-serif text-sm text-foreground print:text-black font-medium mt-0.5 block">{formData.date} at {formData.time}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">
                          {formData.eventType === "Table Reservation" ? "Store Location" : "Venue / Sourced Location"}
                        </span>
                        <span className="font-serif text-sm text-foreground print:text-black font-medium mt-0.5 block">
                          {formData.eventType === "Table Reservation" ? "Antonioni Grounds - Tiaong" : formData.location}
                        </span>
                      </div>
                      {formData.notes && (
                        <div className="col-span-2 border-t border-zinc-200 dark:border-white/5 print:border-zinc-200 pt-3">
                          <span className="font-sans text-[10px] uppercase tracking-wider text-zinc-500 print:text-zinc-500 block">Special Requests</span>
                          <span className="font-sans text-xs text-zinc-500 dark:text-zinc-400 print:text-zinc-700 italic font-light leading-relaxed block mt-1.5">{formData.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Decorative barcode at the bottom */}
                    <div className="flex flex-col items-center pt-6 border-t border-dashed border-zinc-200 dark:border-white/10 print:border-zinc-200 mt-8 select-none">
                      <div className="relative w-48 h-7 overflow-hidden opacity-60 print:opacity-100">
                        {/* Barcode line pattern */}
                        <div className="h-full w-full bg-[repeating-linear-gradient(90deg,var(--foreground)_0px,var(--foreground)_2px,transparent_2px,transparent_5px,var(--foreground)_5px,var(--foreground)_6px,transparent_6px,transparent_10px)]" />
                        {/* Red Laser Line */}
                        <motion.div
                          className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] print:hidden"
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-zinc-500 print:text-zinc-600 tracking-[0.25em] mt-2 uppercase">#{ticketId || "LN-XXXXXX"}</span>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-wrap justify-center gap-3.5 print:hidden">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-full border border-[#8B5E3C]/30 bg-[#8B5E3C]/10 px-5 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-[#8B5E3C] dark:text-[#EADBC8] hover:bg-[#8B5E3C]/20 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Printer size={13} />
                      Print Docket
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-5 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all active:scale-95"
                    >
                      Book Another
                    </button>
                    <a
                      href="/menu"
                      className="rounded-full bg-[#2E5A44] hover:bg-[#234533] px-5 py-2.5 font-sans text-xs uppercase font-bold tracking-wider text-white border border-[#2E5A44]/30 transition-all shadow-[0_0_20px_rgba(46,90,68,0.25)] hover:shadow-[0_0_25px_rgba(46,90,68,0.4)] active:scale-95"
                    >
                      Explore Menu
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

