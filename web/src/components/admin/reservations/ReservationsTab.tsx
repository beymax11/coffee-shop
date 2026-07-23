"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Check,
  X,
  Mail,
  Phone,
  Calendar,
  Users,
  MapPin,
  MessageSquare,
  Search,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Eye,
  Clock,
  AlertTriangle,
  SlidersHorizontal,
  CreditCard,
} from "lucide-react";
import { Reservation } from "@/types";
import { ConfirmModal } from "../common/ConfirmModal";

interface ReservationsTabProps {
  reservations: Reservation[];
  reservationStatuses: Record<string, "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested">;
  reservationFilter: "All" | "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested";
  setReservationFilter: (filter: "All" | "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested") => void;
  onUpdateStatus: (res: Reservation, newStatus: "Pending" | "Pre-Approved" | "Approved" | "Cancelled" | "Completed" | "Cancellation Requested") => void;
  reservationSearch: string;
  setReservationSearch: (search: string) => void;
  onOpenDetails: (res: Reservation) => void;
}

export const ReservationsTab: React.FC<ReservationsTabProps> = ({
  reservations,
  reservationStatuses,
  reservationFilter,
  setReservationFilter,
  onUpdateStatus,
  reservationSearch,
  setReservationSearch,
  onOpenDetails,
}) => {
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<"Completed" | "Cancelled" | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    res: Reservation;
    type: "Complete" | "Cancel";
    targetStatus: "Completed" | "Cancelled";
  } | null>(null);

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<string>("date-newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { res, targetStatus } = confirmAction;
    const key = `${res.fullName}-${res.date}-${res.time}`;
    setConfirmAction(null);
    setUpdatingKey(key);
    setUpdatingStatus(targetStatus);
    try {
      await onUpdateStatus(res, targetStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingKey(null);
      setUpdatingStatus(null);
    }
  };

  const filterStates: Array<"All" | "Pending" | "Pre-Approved" | "Approved" | "Completed" | "Cancellation Requested" | "Cancelled"> = [
    "All",
    "Pending",
    "Pre-Approved",
    "Approved",
    "Completed",
    "Cancellation Requested",
    "Cancelled",
  ];

  // Filtered and sorted reservations computation
  const filteredReservations = useMemo(() => {
    let result = reservations.filter((res) => {
      const compositeKey = `${res.fullName}-${res.date}-${res.time}`;
      const status = (res.id && reservationStatuses[res.id]) || reservationStatuses[compositeKey] || res.status || "Pending";
      
      // 1. Status Filter
      if (reservationFilter !== "All" && status !== reservationFilter) {
        return false;
      }

      // 2. Search Query (name, email, phone, location, event type)
      if (reservationSearch.trim()) {
        const q = reservationSearch.toLowerCase().trim();
        const matchName = res.fullName.toLowerCase().includes(q);
        const matchEmail = res.email.toLowerCase().includes(q);
        const matchPhone = res.phone.toLowerCase().includes(q);
        const matchLoc = (res.location || "").toLowerCase().includes(q);
        const matchEvent = (res.eventType || "").toLowerCase().includes(q);
        const matchNotes = (res.notes || "").toLowerCase().includes(q);

        if (!matchName && !matchEmail && !matchPhone && !matchLoc && !matchEvent && !matchNotes) {
          return false;
        }
      }

      return true;
    });

    // Sort Logic
    result = [...result].sort((a, b) => {
      if (sortBy === "name-az") {
        return a.fullName.localeCompare(b.fullName);
      }
      if (sortBy === "guests-high") {
        return b.guestCount - a.guestCount;
      }
      if (sortBy === "date-oldest") {
        return new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime();
      }
      // Default: date-newest
      return new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime();
    });

    return result;
  }, [reservations, reservationStatuses, reservationFilter, reservationSearch, sortBy]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [reservationSearch, reservationFilter, sortBy, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage) || 1;
  const paginatedReservations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReservations.slice(start, start + itemsPerPage);
  }, [filteredReservations, currentPage, itemsPerPage]);

  const hasActiveFilters = Boolean(reservationSearch.trim() || reservationFilter !== "All" || sortBy !== "date-newest");

  const resetAllFilters = () => {
    setReservationSearch("");
    setReservationFilter("All");
    setSortBy("date-newest");
    setCurrentPage(1);
  };

  // Status badge renderer helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Check size={11} /> Approved
          </span>
        );
      case "Pre-Approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock size={11} /> Pre-Approved
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Check size={11} /> Completed
          </span>
        );
      case "Cancellation Requested":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 animate-pulse">
            <AlertTriangle size={11} /> Cancel Req.
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <X size={11} /> Cancelled
          </span>
        );
      default: // Pending
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Clock size={11} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* 1. SEARCH, FILTERS & ACTION TOOLBAR (AUDIT LOGS STYLE) */}
      <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md p-4 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search by guest name, email, phone, location, or event type..."
              value={reservationSearch}
              onChange={(e) => setReservationSearch(e.target.value)}
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-brand-green transition-all"
            />
            {reservationSearch && (
              <button
                onClick={() => setReservationSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground text-xs font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Toolbar: View Mode Toggle & Reset Button */}
          <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 dark:bg-background-alt border border-neutral-200 dark:border-card-border rounded-xl p-1">
              <div className="relative group">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-colors ${
                    viewMode === "grid" ? "bg-brand-green text-white" : "text-neutral-600 dark:text-neutral-400 hover:text-foreground"
                  }`}
                  aria-label="Grid Cards View"
                >
                  <LayoutGrid size={15} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                  Grid View
                </div>
              </div>

              <div className="relative group">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-colors ${
                    viewMode === "table" ? "bg-brand-green text-white" : "text-neutral-600 dark:text-neutral-400 hover:text-foreground"
                  }`}
                  aria-label="Table View"
                >
                  <List size={15} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                  Table View
                </div>
              </div>
            </div>

            {/* Refresh / Reset Filters Button */}
            {hasActiveFilters && (
              <div className="relative group">
                <button
                  onClick={resetAllFilters}
                  className="p-2.5 rounded-xl border border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt hover:bg-neutral-100 dark:hover:bg-neutral-800/30 text-neutral-700 dark:text-neutral-400 hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
                  aria-label="Reset Filters"
                >
                  <RefreshCw size={15} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                  Reset Filters
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Pill Filters & Sorting Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-200/60 dark:border-card-border/60">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {filterStates.map((status) => {
              const isActive = reservationFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setReservationFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-brand-green text-white shadow-sm font-semibold"
                      : "bg-neutral-100 dark:bg-background-alt text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-card-border"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal size={13} className="text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground focus:outline-none focus:border-brand-green cursor-pointer"
            >
              <option value="date-newest">Date: Newest First</option>
              <option value="date-oldest">Date: Oldest First</option>
              <option value="name-az">Guest Name (A-Z)</option>
              <option value="guests-high">Most Guests</option>
            </select>
          </div>
        </div>

        {/* Active Filter Pills Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200/60 dark:border-card-border/40 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Filter size={12} className="text-brand-green" />
              Active Filters:
            </span>

            {reservationSearch.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Keyword: "{reservationSearch}"
                <button onClick={() => setReservationSearch("")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            {reservationFilter !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Status: {reservationFilter}
                <button onClick={() => setReservationFilter("All")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            {sortBy !== "date-newest" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Sorted: {sortBy === "date-oldest" ? "Oldest First" : sortBy === "name-az" ? "Name (A-Z)" : "Most Guests"}
                <button onClick={() => setSortBy("date-newest")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            <button
              onClick={resetAllFilters}
              className="text-[11px] text-amber-500 hover:text-amber-600 dark:text-amber-400 font-semibold underline underline-offset-2 ml-auto cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* 2. RESERVATIONS DISPLAY (GRID OR TABLE VIEW) */}
      <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        {filteredReservations.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
              <Calendar size={24} />
            </div>
            <h3 className="type-h3 text-foreground font-serif text-lg">No Reservations Found</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md">
              There are no experience bookings matching your search query or status filter parameters. Try clearing your filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="mt-2 text-xs font-semibold text-brand-green hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* GRID CARDS VIEW */
          <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {paginatedReservations.map((res, index) => {
              const compositeKey = `${res.fullName}-${res.date}-${res.time}`;
              const status = (res.id && reservationStatuses[res.id]) || reservationStatuses[compositeKey] || res.status || "Pending";
              const isCardUpdating = updatingKey === compositeKey || (res.id !== undefined && updatingKey === res.id);
              
              return (
                <div
                  key={res.id || index}
                  onClick={() => onOpenDetails(res)}
                  className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt p-5 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden transition-all duration-300 hover:border-brand-green/40 hover:shadow-md cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] text-brand-green dark:text-emerald-400 font-mono uppercase tracking-wider font-bold">
                        {res.eventType}
                      </span>
                      {renderStatusBadge(status)}
                    </div>

                    <h4 className="font-serif font-bold text-foreground text-lg">{res.fullName}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-neutral-400 shrink-0" />
                        <span className="truncate">{res.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-neutral-400 shrink-0" />
                        <span>{res.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-brand-green shrink-0" />
                        <span>{res.date} at <strong className="font-mono text-foreground">{res.time}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={13} className="text-brand-green shrink-0" />
                        <span>{res.guestCount} Guest{res.guestCount > 1 ? "s" : ""}</span>
                      </div>
                    </div>

                    {res.location && (
                      <div className="flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 border-t border-neutral-200/60 dark:border-card-border/50 pt-2.5">
                        <MapPin size={13} className="text-neutral-400 shrink-0" />
                        <span>Location: <strong className="text-foreground">{res.location}</strong></span>
                      </div>
                    )}

                    {res.notes && (
                      <div className="flex gap-2 rounded-xl border border-neutral-200/70 dark:border-card-border/60 bg-neutral-50 dark:bg-background/50 p-3 text-[11px] text-neutral-600 dark:text-neutral-400">
                        <MessageSquare size={12} className="text-brand-green shrink-0 mt-0.5" />
                        <p className="italic">"{res.notes}"</p>
                      </div>
                    )}

                    {(res.referenceNumber || res.proofOfPayment) && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                        <span className="text-[9px] uppercase font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                          Payment Verified
                        </span>
                        <div className="space-y-0.5 text-[11px]">
                          <p>Method: <strong className="text-foreground">{res.paymentMethod || "—"}</strong></p>
                          <p>Ref No: <strong className="text-foreground font-mono">{res.referenceNumber || "—"}</strong></p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Deck */}
                  <div className="flex gap-2 border-t border-neutral-200/60 dark:border-card-border/50 pt-3" onClick={(e) => e.stopPropagation()}>
                    {status === "Pending" && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(res, "Pre-Approved")}
                          disabled={updatingKey !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 py-2 text-[10px] font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check size={12} /> Pre-Approve
                        </button>
                        <button
                          onClick={() => setConfirmAction({ res, type: "Cancel", targetStatus: "Cancelled" })}
                          disabled={updatingKey !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 py-2 text-[10px] font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isCardUpdating && updatingStatus === "Cancelled" ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <X size={12} />
                          )}
                          {isCardUpdating && updatingStatus === "Cancelled" ? "Cancelling..." : "Cancel"}
                        </button>
                      </>
                    )}

                    {status === "Pre-Approved" && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(res, "Approved")}
                          disabled={updatingKey !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 py-2 text-[10px] font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check size={12} /> Approve & Paid
                        </button>
                        <button
                          onClick={() => setConfirmAction({ res, type: "Cancel", targetStatus: "Cancelled" })}
                          disabled={updatingKey !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 py-2 text-[10px] font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isCardUpdating && updatingStatus === "Cancelled" ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <X size={12} />
                          )}
                          {isCardUpdating && updatingStatus === "Cancelled" ? "Cancelling..." : "Cancel"}
                        </button>
                      </>
                    )}

                    {status === "Approved" && (
                      <>
                        <button
                          onClick={() => setConfirmAction({ res, type: "Complete", targetStatus: "Completed" })}
                          disabled={updatingKey !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 py-2 text-[10px] font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isCardUpdating && updatingStatus === "Completed" ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Check size={12} />
                          )}
                          {isCardUpdating && updatingStatus === "Completed" ? "Completing..." : "Complete"}
                        </button>
                        <button
                          onClick={() => setConfirmAction({ res, type: "Cancel", targetStatus: "Cancelled" })}
                          disabled={updatingKey !== null}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 py-2 text-[10px] font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isCardUpdating && updatingStatus === "Cancelled" ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <X size={12} />
                          )}
                          {isCardUpdating && updatingStatus === "Cancelled" ? "Cancelling..." : "Cancel"}
                        </button>
                      </>
                    )}

                    {status === "Cancellation Requested" && (
                      <button
                        onClick={() => onOpenDetails(res)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 py-2 text-[10px] font-bold tracking-wider transition-colors cursor-pointer"
                      >
                        Review Cancellation Request
                      </button>
                    )}

                    {status === "Completed" && (
                      <button
                        onClick={() => onUpdateStatus(res, "Approved")}
                        disabled={updatingKey !== null}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-neutral-100 dark:bg-background border border-neutral-200 dark:border-card-border text-neutral-600 dark:text-neutral-400 py-2 text-[10px] font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Restore to Active (Approved)
                      </button>
                    )}

                    {status === "Cancelled" && (
                      <button
                        onClick={() => onUpdateStatus(res, "Pending")}
                        disabled={updatingKey !== null}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-neutral-100 dark:bg-background border border-neutral-200 dark:border-card-border text-neutral-600 dark:text-neutral-400 py-2 text-[10px] font-bold tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Restore to Pending
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-background-alt border-b border-neutral-200 dark:border-card-border uppercase text-[10px] tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Guest & Event</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Guests</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/70 dark:divide-card-border">
                {paginatedReservations.map((res, index) => {
                  const compositeKey = `${res.fullName}-${res.date}-${res.time}`;
                  const status = (res.id && reservationStatuses[res.id]) || reservationStatuses[compositeKey] || res.status || "Pending";
                  
                  return (
                    <tr
                      key={res.id || index}
                      onClick={() => onOpenDetails(res)}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors cursor-pointer group"
                    >
                      {/* Guest & Event */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground font-serif text-sm">{res.fullName}</div>
                        <div className="text-[10px] text-brand-green dark:text-emerald-400 font-mono font-bold uppercase">{res.eventType}</div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{res.email}</div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">{res.phone}</div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-foreground">{res.date}</div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">{res.time}</div>
                      </td>

                      {/* Guest Count */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-foreground">{res.guestCount} pax</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(status)}
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenDetails(res)}
                          className="p-1.5 rounded-lg bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-neutral-500 dark:text-neutral-400 group-hover:text-brand-green group-hover:border-brand-green/30 transition-colors cursor-pointer"
                          title="Inspect Reservation"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. PAGINATION FOOTER */}
        {filteredReservations.length > 0 && (
          <div className="p-4 border-t border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <span>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredReservations.length)} of {filteredReservations.length} bookings
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-white dark:bg-card border border-neutral-200 dark:border-card-border text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-card-border bg-white dark:bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-card text-foreground cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 font-mono text-foreground font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-card-border bg-white dark:bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-card text-foreground cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.type === "Complete" ? "Complete Booking" : "Cancel Booking"}
        message={
          confirmAction?.type === "Complete"
            ? `Are you sure you want to mark ${confirmAction.res.fullName}'s reservation as completed? This will update their status and send a thank you email.`
            : `Are you sure you want to cancel ${confirmAction?.res.fullName}'s reservation? This action cannot be undone.`
        }
        confirmText={confirmAction?.type === "Complete" ? "Complete" : "Cancel Reservation"}
        variant={confirmAction?.type === "Complete" ? "warning" : "danger"}
        onConfirm={handleConfirmAction}
      />

    </div>
  );
};

