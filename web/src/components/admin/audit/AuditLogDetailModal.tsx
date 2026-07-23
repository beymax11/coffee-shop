"use client";

import React from "react";
import { X, Shield, Clock, User, Globe, AlertTriangle, CheckCircle2, Info, FileText, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuditLogEntry } from "@/types/audit";

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLogEntry | null;
}

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  if (!isOpen || !log) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (_) {
      return isoString;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 size={13} />
            Success
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle size={13} />
            Warning
          </span>
        );
      case "critical":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle size={13} />
            Critical
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <Info size={13} />
            Info
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white dark:bg-card border border-neutral-200 dark:border-card-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Decorative Line */}
          <div className="h-1 w-full bg-gradient-to-r from-brand-green via-emerald-400 to-amber-500" />

          {/* Header */}
          <div className="p-6 border-b border-neutral-200 dark:border-card-border flex items-start justify-between bg-white dark:bg-card/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="type-eyebrow text-[10px] text-brand-green dark:text-emerald-400 tracking-widest uppercase">
                  Audit Entry Inspection
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">• {log.id}</span>
              </div>
              <h2 className="type-h3 text-foreground font-serif tracking-tight text-xl">
                {log.target}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800/40 text-neutral-500 hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Action & Severity Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-background-alt border border-neutral-200 dark:border-card-border">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-brand-green/15 text-brand-green border border-brand-green/20">
                  {log.action}
                </span>
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Category: <span className="text-foreground font-semibold">{log.category}</span>
                </span>
              </div>
              {getSeverityBadge(log.severity)}
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                <FileText size={14} className="text-brand-green" />
                Event Summary & Description
              </label>
              <div className="p-4 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-sm text-foreground leading-relaxed shadow-sm">
                {log.details}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Actor Info */}
              <div className="p-4 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border space-y-2 shadow-sm">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                  <User size={13} className="text-brand-green" />
                  Initiated By (Actor)
                </label>
                <div className="text-sm font-semibold text-foreground">{log.actor.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">{log.actor.email}</div>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20">
                    <Shield size={10} />
                    {log.actor.role}
                  </span>
                </div>
              </div>

              {/* Timestamp & IP */}
              <div className="p-4 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border space-y-2 shadow-sm">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                  <Clock size={13} className="text-brand-green" />
                  Execution Timestamp & IP
                </label>
                <div className="text-xs text-foreground font-mono">{formatDate(log.timestamp)}</div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 pt-1 font-mono">
                  <Globe size={12} />
                  <span>IP: {log.ipAddress || "127.0.0.1 (Local Session)"}</span>
                </div>
              </div>
            </div>

            {/* JSON Payload (if available) */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                  <Code size={14} className="text-brand-green" />
                  Associated State Payload (JSON)
                </label>
                <pre className="p-4 rounded-xl bg-neutral-900 dark:bg-black/90 text-emerald-400 font-mono text-xs overflow-x-auto border border-card-border shadow-inner">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-neutral-200 dark:border-card-border bg-white dark:bg-card/80 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-foreground transition-colors cursor-pointer border border-neutral-200 dark:border-transparent"
            >
              Close Inspection
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
