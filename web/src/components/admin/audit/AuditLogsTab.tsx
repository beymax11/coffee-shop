"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  Calendar,
  Coffee,
  CreditCard,
  Users as UsersIcon,
  Wrench,
  Key,
  Megaphone,
  Camera,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  List,
  Activity,
  FileSpreadsheet,
  FileCode,
  SlidersHorizontal,
  Eye,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuditLogEntry, AuditCategory, AuditAction, AuditSeverity } from "@/types/audit";
import { MenuItem, Reservation } from "@/types";
import { LoyaltyMember, UserProfile } from "@/utils/db";
import { auditLogger } from "@/utils/auditLogger";
import { AuditLogDetailModal } from "./AuditLogDetailModal";
import { ConfirmModal } from "../common/ConfirmModal";
import { toast } from "sonner";

interface AuditLogsTabProps {
  reservations?: Reservation[];
  menuItems?: MenuItem[];
  loyaltyMembers?: LoyaltyMember[];
  users?: UserProfile[];
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({
  reservations = [],
  menuItems = [],
  loyaltyMembers = [],
  users = [],
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedAction, setSelectedAction] = useState<string>("All");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("All");
  const [selectedActorRole, setSelectedActorRole] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selected Log for detail modal
  const [inspectLog, setInspectLog] = useState<AuditLogEntry | null>(null);

  // Clear Logs Modal state
  const [showClearModal, setShowClearModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLogs = async () => {
    const data = await auditLogger.fetchFromSupabase();
    setLogs(data);
  };

  const handleRefreshLogs = async () => {
    setIsRefreshing(true);
    try {
      const data = await auditLogger.fetchFromSupabase();
      setLogs(data);
      toast.success("Refreshed latest audit logs from database.");
    } catch (err) {
      console.error("Failed to refresh audit logs:", err);
      toast.error("Failed to refresh audit logs.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const handleStorageChange = async () => {
      const data = await auditLogger.fetchFromSupabase();
      setLogs(data);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Reset all filters function
  const resetAllFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedAction("All");
    setSelectedSeverity("All");
    setSelectedTimeRange("All");
    setSelectedActorRole("All");
    setCurrentPage(1);
    toast.info("All audit log filters have been reset.");
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    selectedCategory !== "All" ||
    selectedAction !== "All" ||
    selectedSeverity !== "All" ||
    selectedTimeRange !== "All" ||
    selectedActorRole !== "All"
  );

  // Filtered logs computation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Multi-Field Search Query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTarget = log.target.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        const matchActorName = log.actor.name.toLowerCase().includes(q);
        const matchActorEmail = log.actor.email.toLowerCase().includes(q);
        const matchActorRole = log.actor.role.toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchCategory = log.category.toLowerCase().includes(q);
        const matchSeverity = log.severity.toLowerCase().includes(q);
        const matchId = log.id.toLowerCase().includes(q);
        const matchIp = (log.ipAddress || "").toLowerCase().includes(q);

        if (!matchTarget && !matchDetails && !matchActorName && !matchActorEmail && !matchActorRole && !matchAction && !matchCategory && !matchSeverity && !matchId && !matchIp) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== "All" && log.category !== selectedCategory) {
        return false;
      }

      // 3. Action Filter
      if (selectedAction !== "All" && log.action !== selectedAction) {
        return false;
      }

      // 4. Severity Filter
      if (selectedSeverity !== "All" && log.severity !== selectedSeverity) {
        return false;
      }

      // 5. Operator Role Filter
      if (selectedActorRole !== "All" && log.actor.role !== selectedActorRole) {
        return false;
      }

      // 6. Time Range Filter
      if (selectedTimeRange !== "All") {
        const now = Date.now();
        const logTime = new Date(log.timestamp).getTime();
        if (selectedTimeRange === "Today") {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          if (logTime < startOfDay.getTime()) return false;
        } else if (selectedTimeRange === "24h") {
          if (now - logTime > 24 * 60 * 60 * 1000) return false;
        } else if (selectedTimeRange === "7d") {
          if (now - logTime > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (selectedTimeRange === "30d") {
          if (now - logTime > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      return true;
    });
  }, [logs, search, selectedCategory, selectedAction, selectedSeverity, selectedActorRole, selectedTimeRange]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedAction, selectedSeverity, selectedActorRole, selectedTimeRange, itemsPerPage]);

  // Metrics computation
  const metrics = useMemo(() => {
    const total = logs.length;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayCount = logs.filter(l => new Date(l.timestamp).getTime() >= startOfDay.getTime()).length;
    const warningsAndCritical = logs.filter(l => l.severity === "warning" || l.severity === "critical").length;
    const uniqueActors = new Set(logs.map(l => l.actor.email)).size;

    return { total, todayCount, warningsAndCritical, uniqueActors };
  }, [logs]);

  const handleClearLogs = () => {
    auditLogger.clearLogs();
    setLogs([]);
    setShowClearModal(false);
    toast.success("Audit history cleared successfully.");
  };

  const handleExportCSV = () => {
    auditLogger.exportCSV(filteredLogs);
    toast.success("Exported audit log entries to CSV.");
  };

  const handleExportJSON = () => {
    auditLogger.exportJSON(filteredLogs);
    toast.success("Exported audit log entries to JSON.");
  };

  // Helper for Category Icons
  const getCategoryIcon = (category: AuditCategory) => {
    switch (category) {
      case "menu":
        return <Coffee size={14} className="text-amber-500" />;
      case "reservations":
        return <Calendar size={14} className="text-emerald-500" />;
      case "loyalty":
        return <CreditCard size={14} className="text-indigo-400" />;
      case "users":
        return <UsersIcon size={14} className="text-sky-400" />;
      case "settings":
        return <Wrench size={14} className="text-zinc-400" />;
      case "auth":
        return <Key size={14} className="text-rose-400" />;
      case "events":
        return <Megaphone size={14} className="text-purple-400" />;
      case "lifestyle":
        return <Camera size={14} className="text-pink-400" />;
      default:
        return <Shield size={14} className="text-brand-green" />;
    }
  };

  // Helper for Severity Badges
  const renderSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 size={11} />
            Success
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle size={11} />
            Warning
          </span>
        );
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle size={11} />
            Critical
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <Info size={11} />
            Info
          </span>
        );
    }
  };

  // Format relative timestamp
  const formatTimeAgo = (isoString: string) => {
    try {
      const logTime = new Date(isoString).getTime();
      const now = Date.now();
      const diffMs = now - logTime;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      return `${diffDays}d ago`;
    } catch (_) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* 1. TOP METRICS HEADER CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Audit Logs</span>
            <div className="text-2xl font-bold font-serif text-foreground mt-1">{metrics.total}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand-green/10 text-brand-green border border-brand-green/20 flex items-center justify-center">
            <Activity size={20} />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Actions Today</span>
            <div className="text-2xl font-bold font-serif text-emerald-500 dark:text-emerald-400 mt-1">{metrics.todayCount}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Alerts & Warnings</span>
            <div className="text-2xl font-bold font-serif text-amber-500 dark:text-amber-400 mt-1">{metrics.warningsAndCritical}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Active Operators</span>
            <div className="text-2xl font-bold font-serif text-sky-500 dark:text-sky-400 mt-1">{metrics.uniqueActors}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <UsersIcon size={20} />
          </div>
        </div>
      </div>

      {/* 2. SEARCH, FILTERS & ACTION TOOLBAR */}
      <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md p-4 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search by action, target, actor email, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-brand-green transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons: View Toggle, Refresh, Exports, Clear */}
          <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 dark:bg-background-alt border border-neutral-200 dark:border-card-border rounded-xl p-1">
              <div className="relative group">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-colors ${viewMode === "table" ? "bg-brand-green text-white" : "text-neutral-600 dark:text-neutral-400 hover:text-foreground"}`}
                  aria-label="Table View"
                >
                  <List size={15} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                  Table View
                </div>
              </div>

              <div className="relative group">
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-2 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-colors ${viewMode === "timeline" ? "bg-brand-green text-white" : "text-neutral-600 dark:text-neutral-400 hover:text-foreground"}`}
                  aria-label="Timeline View"
                >
                  <Activity size={15} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                  Timeline View
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="relative group">
              <button
                onClick={handleRefreshLogs}
                disabled={isRefreshing}
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt hover:bg-neutral-100 dark:hover:bg-neutral-800/30 text-neutral-700 dark:text-neutral-400 hover:text-foreground disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Refresh Logs"
              >
                <RefreshCw size={15} className={isRefreshing ? "animate-spin text-brand-green" : ""} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                Refresh Logs
              </div>
            </div>

            {/* CSV Export Button */}
            <div className="relative group">
              <button
                onClick={handleExportCSV}
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt hover:bg-neutral-100 dark:hover:bg-neutral-800/30 text-neutral-700 dark:text-neutral-300 hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Export CSV"
              >
                <FileSpreadsheet size={15} className="text-emerald-500" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                Export CSV
              </div>
            </div>

            {/* JSON Export Button */}
            <div className="relative group">
              <button
                onClick={handleExportJSON}
                className="p-2.5 rounded-xl border border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt hover:bg-neutral-100 dark:hover:bg-neutral-800/30 text-neutral-700 dark:text-neutral-300 hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Export JSON"
              >
                <FileCode size={15} className="text-sky-500" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                Export JSON
              </div>
            </div>

            {/* Clear Logs Button */}
            <div className="relative group">
              <button
                onClick={() => setShowClearModal(true)}
                className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 transition-colors cursor-pointer flex items-center justify-center"
                aria-label="Clear Logs"
              >
                <Trash2 size={15} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-20">
                Clear Logs
              </div>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-neutral-200/60 dark:border-card-border/60">

          {/* Category Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground focus:outline-none focus:border-brand-green cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="reservations">Reservations</option>
              <option value="menu">Menu Offerings</option>
              <option value="loyalty">Loyalty Cards</option>
              <option value="users">Users & Roles</option>
              <option value="settings">Settings</option>
              <option value="auth">Auth & Sessions</option>
              <option value="events">Events</option>
              <option value="lifestyle">Lifestyle</option>
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
              Action
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground focus:outline-none focus:border-brand-green cursor-pointer"
            >
              <option value="All">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="APPROVE">APPROVE</option>
              <option value="REJECT">REJECT</option>
              <option value="AWARD">AWARD</option>
              <option value="REDEEM">REDEEM</option>
              <option value="TOGGLE">TOGGLE</option>
              <option value="LOGIN">LOGIN</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
              Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground focus:outline-none focus:border-brand-green cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Operator Role Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
              Operator Role
            </label>
            <select
              value={selectedActorRole}
              onChange={(e) => setSelectedActorRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground focus:outline-none focus:border-brand-green cursor-pointer"
            >
              <option value="All">All Operators</option>
              <option value="admin">Admin</option>
              <option value="barista">Barista</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Time Range Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
              Date Range
            </label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground focus:outline-none focus:border-brand-green cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="Today">Today Only</option>
              <option value="24h">Past 24 Hours</option>
              <option value="7d">Past 7 Days</option>
              <option value="30d">Past 30 Days</option>
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

            {search.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Keyword: "{search}"
                <button onClick={() => setSearch("")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            {selectedCategory !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("All")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            {selectedAction !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Action: {selectedAction}
                <button onClick={() => setSelectedAction("All")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            {selectedSeverity !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Severity: {selectedSeverity}
                <button onClick={() => setSelectedSeverity("All")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            {selectedActorRole !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Role: {selectedActorRole}
                <button onClick={() => setSelectedActorRole("All")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            {selectedTimeRange !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Range: {selectedTimeRange}
                <button onClick={() => setSelectedTimeRange("All")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            <button
              onClick={resetAllFilters}
              className="text-[11px] text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 font-semibold underline underline-offset-2 ml-auto cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* 3. LOGS DISPLAY (TABLE OR TIMELINE VIEW) */}
      <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
              <Activity size={24} />
            </div>
            <h3 className="type-h3 text-foreground font-serif text-lg">No Audit Log Entries Found</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md">
              There are no recorded audit logs matching your current search query or filter parameters. Try clearing your filters or performing an administrative action.
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-background-alt border-b border-neutral-200 dark:border-card-border uppercase text-[10px] tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target & Summary</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/70 dark:divide-card-border">
                {paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setInspectLog(log)}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors cursor-pointer group"
                  >
                    {/* Category Icon & Label */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-background border border-neutral-200 dark:border-card-border">
                          {getCategoryIcon(log.category)}
                        </div>
                        <span className="font-semibold text-foreground capitalize">{log.category}</span>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20">
                        {log.action}
                      </span>
                    </td>

                    {/* Target & Details */}
                    <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                      <div className="font-medium text-foreground truncate">{log.target}</div>
                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate">{log.details}</div>
                    </td>

                    {/* Actor Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">{log.actor.name}</div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">{log.actor.email}</div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                      {formatTimeAgo(log.timestamp)}
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderSeverityBadge(log.severity)}
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectLog(log);
                        }}
                        className="p-1.5 rounded-lg bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-neutral-500 dark:text-neutral-400 group-hover:text-brand-green group-hover:border-brand-green/30 transition-colors cursor-pointer"
                        title="Inspect Log Entry"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* TIMELINE VIEW */
          <div className="p-6 space-y-6">
            <div className="relative border-l-2 border-brand-green/30 ml-4 space-y-6">
              {paginatedLogs.map((log) => (
                <div key={log.id} className="relative pl-6 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-brand-green bg-white dark:bg-background flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                  </div>

                  {/* Card Content */}
                  <div
                    onClick={() => setInspectLog(log)}
                    className="p-4 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border hover:border-brand-green/40 transition-all cursor-pointer space-y-2 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-background border border-neutral-200 dark:border-card-border">
                          {getCategoryIcon(log.category)}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20">
                          {log.action}
                        </span>
                        <span className="text-xs font-semibold text-foreground">{log.target}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderSeverityBadge(log.severity)}
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">{formatTimeAgo(log.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{log.details}</p>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200/60 dark:border-card-border/50">
                      <span>Operator: <strong className="text-foreground">{log.actor.name}</strong> ({log.actor.email})</span>
                      <span className="font-mono text-[10px]">ID: {log.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PAGINATION FOOTER */}
        {filteredLogs.length > 0 && (
          <div className="p-4 border-t border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries</span>
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
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-card-border bg-white dark:bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-card text-foreground cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 font-mono text-foreground font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-card-border bg-white dark:bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-card text-foreground cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED INSPECTION MODAL */}
      <AuditLogDetailModal
        isOpen={Boolean(inspectLog)}
        onClose={() => setInspectLog(null)}
        log={inspectLog}
      />

      {/* CONFIRMATION MODAL FOR CLEARING LOGS */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearLogs}
        title="Clear All Audit Logs?"
        message="Are you sure you want to permanently purge all recorded audit log entries? This action cannot be undone."
        confirmText="Yes, Clear Audit Log History"
        variant="danger"
      />

    </div>
  );
};
