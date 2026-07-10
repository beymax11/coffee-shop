"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { EventItem } from "@/types";
import { db } from "@/utils/db";
import { supabase } from "@/utils/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};


export const EventsTab: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formState, setFormState] = useState<{
    category: string;
    title: string;
    description: string;
    highlight: string;
    image: string;
    link: string;
    linkLabel: string;
  }>({
    category: "",
    title: "",
    description: "",
    highlight: "",
    image: "",
    link: "",
    linkLabel: "",
  });

  const loadEvents = async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("events_updates")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          const mapped = data.map((event: {
            id: string;
            category: string;
            title: string;
            description: string;
            highlight: string;
            image: string;
            link: string;
            link_label?: string;
            linkLabel?: string;
            created_at?: string;
          }) => ({
            id: event.id,
            category: event.category,
            title: event.title,
            description: event.description,
            highlight: event.highlight,
            image: event.image,
            link: event.link,
            linkLabel: event.link_label || event.linkLabel || "Explore More",
            created_at: event.created_at,
          }));
          setEvents(mapped);
          return;
        } else if (error) {
          console.error("Supabase select error for events:", error);
        }
      } catch (err) {
        console.error("Exception loading events from Supabase:", err);
      }
    }
    setEvents(db.getEvents());
  };

  useEffect(() => {
    Promise.resolve().then(() => loadEvents());
    const handleStorageChange = () => {
      loadEvents();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setFormState({
      category: "",
      title: "",
      description: "",
      highlight: "",
      image: "",
      link: "",
      linkLabel: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setFormState({
      category: event.category,
      title: event.title,
      description: event.description,
      highlight: event.highlight,
      image: event.image,
      link: event.link,
      linkLabel: event.linkLabel,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formState.category ||
      !formState.title ||
      !formState.description ||
      !formState.image
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload: EventItem = {
      id: editingEvent ? editingEvent.id : crypto.randomUUID(),
      category: formState.category,
      title: formState.title,
      description: formState.description,
      highlight: formState.highlight || "Limited Time",
      image: formState.image,
      link: formState.link || "/menu",
      linkLabel: formState.linkLabel || "Explore More",
    };

    try {
      db.saveEvent(payload);
      toast.success(
        editingEvent ? "Event updated successfully" : "Event created successfully",
        {
          description: payload.title,
        }
      );
      handleCloseModal();
      loadEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("An error occurred while saving the event.");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteEventId(id);
  };

  const confirmDeleteEvent = async () => {
    if (!deleteEventId) return;
    setIsDeleting(true);
    try {
      db.deleteEvent(deleteEventId);
      toast.success("Event deleted successfully");
      setDeleteEventId(null);
      loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Control Area */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={16}
            className="absolute left-4.5 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="text"
            placeholder="Search events, announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card/50 border border-card-border rounded-xl pl-12 pr-4 py-3 text-xs text-foreground placeholder-neutral-500 focus:outline-none focus:border-brand-green transition-all"
          />
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-brand-green hover:bg-brand-green-dark text-white px-4 py-2.5 rounded-xl type-ui text-[11px] font-semibold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-brand-green/20 hover:scale-[1.02] cursor-pointer"
          >
            <Plus size={14} />
            Add Announcement
          </button>
          <div className="text-[11px] text-neutral-500 font-sans">
            Showing {filteredEvents.length} of {events.length} announcements
          </div>
        </div>
      </div>

      {/* Events Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((event) => {
            return (
              <motion.div
                key={event.id}
                variants={cardVariants}
                layout
                exit={{ opacity: 0, scale: 0.95 }}
                className="group rounded-2xl border border-card-border bg-card overflow-hidden glassmorphism flex flex-col sm:flex-row h-full transition-all duration-500"
              >
                {/* Event Image */}
                <div className="w-full sm:w-[180px] h-[180px] sm:h-auto shrink-0 relative overflow-hidden bg-neutral-900 border-b sm:border-b-0 sm:border-r border-card-border">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                {/* Event Details */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] tracking-[0.25em] font-sans font-bold uppercase text-emerald-600 dark:text-emerald-400">
                        {event.category}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-zinc-700" />
                      <span className="text-[10px] font-sans text-neutral-400 dark:text-zinc-500">
                        {event.highlight}
                      </span>
                    </div>

                    <h3 className="type-h3 text-foreground font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {event.title}
                    </h3>

                    <p className="type-body-sm text-neutral-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-card-border/50 flex items-center justify-between">
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-neutral-400 hover:text-emerald-500 transition-colors"
                    >
                      {event.linkLabel}
                      <ExternalLink size={10} />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(event)}
                        className="p-2 rounded-lg bg-foreground/[0.03] border border-card-border hover:bg-brand-green/10 hover:text-brand-green transition-all cursor-pointer text-neutral-500 dark:text-zinc-400"
                        title="Edit announcement"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(event.id)}
                        className="p-2 rounded-lg bg-foreground/[0.03] border border-card-border hover:bg-rose-500/10 hover:text-rose-500 transition-all cursor-pointer text-neutral-500 dark:text-zinc-400"
                        title="Delete announcement"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Events Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-background/80 dark:bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="w-full max-w-xl rounded-2xl border border-card-border bg-card p-6 md:p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Decorative Accent Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 blur-[20px] rounded-full pointer-events-none" />

              <button
                onClick={handleCloseModal}
                className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="type-h3 text-foreground font-serif font-bold tracking-tight mb-6">
                {editingEvent ? "Edit Announcement" : "Create Announcement"}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="type-ui text-[10px] uppercase tracking-wider text-neutral-500 dark:text-zinc-400">
                      Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.title}
                      onChange={(e) =>
                        setFormState({ ...formState, title: e.target.value })
                      }
                      placeholder="e.g., Seasonal Cold Brews"
                      className="bg-background border border-card-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-neutral-500 focus:outline-none focus:border-brand-green transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="type-ui text-[10px] uppercase tracking-wider text-neutral-500 dark:text-zinc-400">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.category}
                      onChange={(e) =>
                        setFormState({ ...formState, category: e.target.value })
                      }
                      placeholder="e.g., Seasonal Menu, Event, Hours"
                      className="bg-background border border-card-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-neutral-500 focus:outline-none focus:border-brand-green transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="type-ui text-[10px] uppercase tracking-wider text-neutral-500 dark:text-zinc-400">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formState.description}
                    onChange={(e) =>
                      setFormState({ ...formState, description: e.target.value })
                    }
                    placeholder="Provide details about this announcement..."
                    className="bg-background border border-card-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-neutral-500 focus:outline-none focus:border-brand-green transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Highlight text */}
                  <div className="flex flex-col gap-1.5">
                    <label className="type-ui text-[10px] uppercase tracking-wider text-neutral-500 dark:text-zinc-400">
                      Highlight Text
                    </label>
                    <input
                      type="text"
                      value={formState.highlight}
                      onChange={(e) =>
                        setFormState({ ...formState, highlight: e.target.value })
                      }
                      placeholder="e.g., Available today, Every Sat"
                      className="bg-background border border-card-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-neutral-500 focus:outline-none focus:border-brand-green transition-all"
                    />
                  </div>

                  {/* Image URL */}
                  <div className="flex flex-col gap-1.5">
                    <label className="type-ui text-[10px] uppercase tracking-wider text-neutral-500 dark:text-zinc-400">
                      Image URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={formState.image}
                      onChange={(e) =>
                        setFormState({ ...formState, image: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="bg-background border border-card-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-neutral-500 focus:outline-none focus:border-brand-green transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Link Path */}
                  <div className="flex flex-col gap-1.5">
                    <label className="type-ui text-[10px] uppercase tracking-wider text-neutral-500 dark:text-zinc-400">
                      Action Link Path
                    </label>
                    <input
                      type="text"
                      value={formState.link}
                      onChange={(e) =>
                        setFormState({ ...formState, link: e.target.value })
                      }
                      placeholder="e.g., /menu or /contact"
                      className="bg-background border border-card-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-neutral-500 focus:outline-none focus:border-brand-green transition-all"
                    />
                  </div>

                  {/* Link Label */}
                  <div className="flex flex-col gap-1.5">
                    <label className="type-ui text-[10px] uppercase tracking-wider text-neutral-500 dark:text-zinc-400">
                      Link Label
                    </label>
                    <input
                      type="text"
                      value={formState.linkLabel}
                      onChange={(e) =>
                        setFormState({ ...formState, linkLabel: e.target.value })
                      }
                      placeholder="e.g., View Menu"
                      className="bg-background border border-card-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-neutral-500 focus:outline-none focus:border-brand-green transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border/50">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 text-xs tracking-wider uppercase border border-card-border hover:bg-foreground/5 transition-colors rounded-lg cursor-pointer text-neutral-500 hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs tracking-wider uppercase bg-brand-green hover:bg-brand-green-dark text-white transition-colors rounded-lg shadow-md cursor-pointer"
                  >
                    {editingEvent ? "Save Changes" : "Create Event"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteEventId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteEventId(null)}
              className="absolute inset-0 bg-background/80 dark:bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="w-full max-w-md rounded-2xl border border-card-border bg-card p-6 md:p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              <button
                onClick={() => setDeleteEventId(null)}
                className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-rose-500 animate-pulse" size={18} />
                <h3 className="type-h3 text-foreground font-serif font-bold tracking-tight">
                  Delete Announcement?
                </h3>
              </div>

              <p className="text-neutral-500 dark:text-zinc-400 text-xs leading-relaxed mb-6">
                Are you sure you want to delete this event/announcement? This action will permanently remove it from the database and it will no longer display on the homepage.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteEventId(null)}
                  className="px-4 py-2.5 text-xs tracking-wider uppercase border border-card-border hover:bg-foreground/5 transition-colors rounded-lg cursor-pointer text-neutral-500 hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteEvent}
                  className="px-4 py-2.5 text-xs tracking-wider uppercase bg-rose-500 hover:bg-rose-600 text-white transition-colors rounded-lg shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
