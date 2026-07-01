"use client";

import React, { useState, useEffect } from "react";
import { Coffee, Calendar as CalendarIcon, Clock, Users, MapPin, ChevronRight, ChevronLeft, CheckCircle2, User, Mail, Phone, FileText } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/utils/db";

type ReservationType = "Coffee Cart Booking" | "Table Reservation" | "Private Event" | "Corporate Event";

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

  useEffect(() => {
    const sessionEmail = localStorage.getItem("customer_session");
    if (sessionEmail) {
      const members = db.getLoyaltyMembers();
      const found = members.find(
        (m) => m.email.toLowerCase() === sessionEmail.toLowerCase()
      );
      if (found) {
        setFormData((prev) => ({
          ...prev,
          fullName: found.name,
          email: found.email,
        }));
      }
    }
  }, []);

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const eventTypes: { type: ReservationType; title: string; desc: string; icon: any }[] = [
    {
      type: "Table Reservation",
      title: "Lounge Table Reservation",
      desc: "Reserve a private alcove in our luxury matte-black salon for 1-4 guests. Includes complimentary welcome pour.",
      icon: Coffee,
    },
    {
      type: "Coffee Cart Booking",
      title: "Mobile Coffee Cart Sourcing",
      desc: "Book our premium copper & brass espresso cart for weddings, fashion galas, or private launches. Serviced by 2 baristas.",
      icon: CalendarIcon,
    },
    {
      type: "Private Event",
      title: "Exclusive Lounge Takeover",
      desc: "Full takeover of our design salon for private celebrations, cocktail nights, or dinner experiences (up to 50 guests).",
      icon: Users,
    },
    {
      type: "Corporate Event",
      title: "Corporate Coffee Workshop",
      desc: "Private sensory roasting workshops and tasting seminars for team builders or VIP corporate clients.",
      icon: AwardIcon,
    },
  ];

  // Dummy helper icon for corporate
  function AwardIcon(props: any) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    );
  }

  const validateStep = () => {
    const newErrors: typeof errors = {};

    if (step === 1) {
      if (!formData.eventType) newErrors.eventType = "Please select an event type";
    } else if (step === 2) {
      if (!formData.date) newErrors.date = "Date is required";
      if (!formData.time) newErrors.time = "Time is required";
      if (formData.guestCount <= 0) newErrors.guestCount = "Guest count must be greater than 0";
      
      const isExternalEvent = formData.eventType === "Coffee Cart Booking" || formData.eventType === "Private Event";
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
      // Default location to "L'OR NOIR Salon" if booking a table
      location: type === "Table Reservation" ? "L'OR NOIR Salon (New York / Tokyo)" : formData.location,
    });
    setErrors({ ...errors, eventType: undefined });
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0B0B0B] py-16 md:py-24 text-[#F5F5F0]">
        <div className="mx-auto max-w-3xl px-6">
          
          {/* Header */}
          <div className="text-center mb-12">
            <span className="type-eyebrow">L'OR NOIR Privé</span>
            <h1 className="type-h1 text-white mt-2">
              Privé Reservations
            </h1>
            <p className="type-body text-zinc-400 mt-3 max-w-md mx-auto">
              Curate your private tasting lounge experience or schedule our professional barista coffee cart for events.
            </p>
          </div>

          {/* Stepper indicators */}
          {step < 4 && (
            <div className="flex items-center justify-between max-w-md mx-auto mb-12 relative px-4">
              {/* Stepper bar */}
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-[1px] bg-brand-gold -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />

              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  disabled={num > step}
                  onClick={() => setStep(num)}
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full type-body-sm font-bold transition-all border ${
                    step === num
                      ? "bg-brand-gold border-brand-gold text-black gold-glow scale-110"
                      : step > num
                      ? "bg-[#141414] border-brand-gold text-brand-gold"
                      : "bg-[#141414] border-white/5 text-zinc-500"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          )}

          {/* Form Content Wrapper */}
          <div className="rounded-2xl border border-white/5 bg-[#141414] p-8 md:p-10 shadow-2xl glassmorphism-gold relative overflow-hidden">
            <div className="absolute -top-1/4 -right-1/4 w-80 h-80 bg-brand-gold/5 blur-[90px] rounded-full pointer-events-none" />

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: EVENT TYPE SELECT */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h3 className="type-h3 text-white mb-4">Select Experience Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventTypes.map((item) => {
                      const Icon = item.icon;
                      const isSelected = formData.eventType === item.type;
                      return (
                        <div
                          key={item.type}
                          onClick={() => selectType(item.type)}
                          className={`rounded-xl border p-5 cursor-pointer transition-all flex flex-col justify-between h-48 select-none ${
                            isSelected
                              ? "bg-white/5 border-brand-gold text-white shadow-[0_0_20px_rgba(197,168,128,0.1)]"
                              : "bg-[#181818] border-white/5 text-zinc-400 hover:border-white/20 hover:bg-[#1c1c1c]"
                          }`}
                        >
                          <div className="space-y-2">
                            <Icon size={24} className={isSelected ? "text-brand-gold" : "text-zinc-500"} />
                            <h4 className="type-subheading text-white">{item.title}</h4>
                            <p className="type-caption text-zinc-500">{item.desc}</p>
                          </div>
                          
                          <div className="flex justify-end pt-2">
                            <span className={`type-micro ${
                              isSelected ? "text-brand-gold" : "text-zinc-600"
                            }`}>
                              {isSelected ? "Selected" : "Choose"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-1.5 rounded-full bg-brand-gold px-6 py-2.5 type-ui text-black hover:bg-brand-gold-hover transition-all gold-glow active:scale-95"
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
                  <h3 className="type-h3 text-white mb-4">Date & Booking Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Picker */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 type-label text-zinc-400">
                        <CalendarIcon size={14} className="text-brand-gold" />
                        Select Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => updateField("date", e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 transition-all font-sans"
                      />
                      {errors.date && <span className="type-error">{errors.date}</span>}
                    </div>

                    {/* Time Selector */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 type-label text-zinc-400">
                        <Clock size={14} className="text-brand-gold" />
                        Preferred Time
                      </label>
                      <select
                        required
                        value={formData.time}
                        onChange={(e) => updateField("time", e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 transition-all font-sans"
                      >
                        <option value="" disabled className="bg-[#121212]">Choose Time Slot</option>
                        {formData.eventType === "Table Reservation" ? (
                          <>
                            <option value="08:00 AM" className="bg-[#121212]">08:00 AM</option>
                            <option value="10:00 AM" className="bg-[#121212]">10:00 AM</option>
                            <option value="12:00 PM" className="bg-[#121212]">12:00 PM</option>
                            <option value="02:00 PM" className="bg-[#121212]">02:00 PM</option>
                            <option value="04:00 PM" className="bg-[#121212]">04:00 PM</option>
                            <option value="06:00 PM" className="bg-[#121212]">06:00 PM</option>
                            <option value="08:00 PM" className="bg-[#121212]">08:00 PM</option>
                          </>
                        ) : (
                          <>
                            <option value="Morning (08:00 - 12:00)" className="bg-[#121212]">Morning (08:00 - 12:00)</option>
                            <option value="Afternoon (12:00 - 17:00)" className="bg-[#121212]">Afternoon (12:00 - 17:00)</option>
                            <option value="Evening (17:00 - 22:00)" className="bg-[#121212]">Evening (17:00 - 22:00)</option>
                            <option value="All Day Gala Booking" className="bg-[#121212]">All Day Gala Booking</option>
                          </>
                        )}
                      </select>
                      {errors.time && <span className="type-error">{errors.time}</span>}
                    </div>

                    {/* Guest Count */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 type-label text-zinc-400">
                        <Users size={14} className="text-brand-gold" />
                        Guest Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={formData.eventType === "Table Reservation" ? 4 : 500}
                        value={formData.guestCount}
                        onChange={(e) => updateField("guestCount", parseInt(e.target.value) || 1)}
                        className="w-full rounded-lg border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 transition-all font-sans"
                      />
                      <span className="type-caption text-zinc-500">
                        {formData.eventType === "Table Reservation" ? "Lounge tables fit max 4 guests." : "No limit on event bookings."}
                      </span>
                    </div>

                    {/* Venue / Location Address */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 type-label text-zinc-400">
                        <MapPin size={14} className="text-brand-gold" />
                        Location
                      </label>
                      {formData.eventType === "Table Reservation" ? (
                        <input
                          type="text"
                          disabled
                          value="L'OR NOIR Luxury Salon Lounge"
                          className="w-full rounded-lg border border-white/5 bg-[#141414] p-3 type-field text-zinc-500 cursor-not-allowed font-sans"
                        />
                      ) : (
                        <input
                          type="text"
                          required
                          placeholder="e.g. 5th Avenue Loft, New York"
                          value={formData.location}
                          onChange={(e) => updateField("location", e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 transition-all font-sans"
                        />
                      )}
                      {errors.location && <span className="type-error">{errors.location}</span>}
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-white/5 mt-8">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 type-ui text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      <ChevronLeft size={14} />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-1.5 rounded-full bg-brand-gold px-6 py-2.5 type-ui text-black hover:bg-brand-gold-hover transition-all gold-glow active:scale-95"
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
                  <h3 className="type-h3 text-white mb-4">Contact Information & Review</h3>
                  
                  <div className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 type-label text-zinc-400">
                        <User size={14} className="text-brand-gold" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 transition-all font-sans"
                      />
                      {errors.fullName && <span className="type-error">{errors.fullName}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Email */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 type-label text-zinc-400">
                          <Mail size={14} className="text-brand-gold" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 transition-all font-sans"
                        />
                        {errors.email && <span className="type-error">{errors.email}</span>}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 type-label text-zinc-400">
                          <Phone size={14} className="text-brand-gold" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+1 (555) 019-2834"
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 transition-all font-sans"
                        />
                        {errors.phone && <span className="type-error">{errors.phone}</span>}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 type-label text-zinc-400">
                        <FileText size={14} className="text-brand-gold" />
                        Special Requests / Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Saffron allergy, custom menu engravings, special staging, corporate logo on coffee foams..."
                        value={formData.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#181818] p-3 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 transition-all font-sans resize-none"
                      />
                    </div>
                  </div>

                  {/* Summary Block */}
                  <div className="rounded-xl border border-brand-gold/20 bg-brand-gold/5 p-4 space-y-2 type-body-sm mt-6">
                    <h4 className="type-eyebrow">Booking Summary</h4>
                    <div className="grid grid-cols-2 gap-y-1.5 text-zinc-300">
                      <span>Experience Type:</span>
                      <span className="text-white font-semibold">{formData.eventType}</span>
                      <span>Date & Time:</span>
                      <span className="text-white font-semibold">{formData.date} at {formData.time}</span>
                      <span>Guests:</span>
                      <span className="text-white font-semibold">{formData.guestCount} guests</span>
                      <span>Venue / Location:</span>
                      <span className="text-white font-semibold truncate">{formData.location}</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-white/5 mt-8">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 type-ui text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      <ChevronLeft size={14} />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-full bg-brand-gold px-8 py-2.5 type-ui text-black hover:bg-brand-gold-hover transition-all gold-glow active:scale-95"
                    >
                      Confirm Booking
                      <CheckCircle2 size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: SUCCESS CONFIRMATION SCREEN */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                     <CheckCircle2 size={36} className="stroke-[1.5]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="type-h2 text-white">Reservation Confirmed</h3>
                    <p className="type-body text-zinc-400 max-w-md mx-auto">
                      Thank you for choosing L&apos;OR NOIR. An elegant confirmation docket and calendar invite have been dispatched to <strong className="text-zinc-200">{formData.email}</strong>.
                    </p>
                  </div>

                  {/* Visual Receipt Card */}
                  <div className="max-w-md mx-auto rounded-xl border border-white/5 bg-[#181818] p-6 text-left space-y-4 relative">
                    {/* Monogram water mark */}
                    <div className="absolute right-4 bottom-4 text-white/5 pointer-events-none type-watermark">L&apos;O</div>
                    
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div>
                        <span className="type-micro text-zinc-500">Reservation Docket</span>
                        <h4 className="type-ui text-white mt-0.5">#LN-{Math.floor(100000 + Math.random() * 900000)}</h4>
                      </div>
                      <span className="type-eyebrow rounded bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5">
                        PENDING APPROVAL
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 type-caption">
                      <div>
                        <span className="type-micro text-zinc-500 block">Guest Name</span>
                        <span className="text-white font-semibold">{formData.fullName}</span>
                      </div>
                      <div>
                        <span className="type-micro text-zinc-500 block">Contact Phone</span>
                        <span className="text-white font-semibold">{formData.phone}</span>
                      </div>
                      <div>
                        <span className="type-micro text-zinc-500 block">Experience</span>
                        <span className="text-white font-semibold">{formData.eventType}</span>
                      </div>
                      <div>
                        <span className="type-micro text-zinc-500 block">Schedule</span>
                        <span className="text-white font-semibold">{formData.date} at {formData.time}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="type-micro text-zinc-500 block">Venue / Sourced Location</span>
                        <span className="text-white font-semibold">{formData.location}</span>
                      </div>
                      {formData.notes && (
                        <div className="col-span-2 border-t border-white/5 pt-3">
                          <span className="type-micro text-zinc-500 block">Barista Requests</span>
                          <span className="text-zinc-400 italic font-medium leading-relaxed block mt-0.5">{formData.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 type-ui text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                      Book Another Event
                    </button>
                    <a
                      href="/menu"
                      className="rounded-full bg-brand-gold px-6 py-2.5 type-ui text-black hover:bg-brand-gold-hover transition-all gold-glow active:scale-95"
                    >
                      Explore The Menu
                    </a>
                  </div>
                </motion.div>
              )}

            </form>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
