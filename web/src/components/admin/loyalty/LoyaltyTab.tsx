"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Plus,
  QrCode,
  Filter,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Eye,
  Trash2,
  Zap,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Users,
  Award,
} from "lucide-react";
import { LoyaltyMember } from "@/utils/db";
import { formatDisplayPhone } from "@/utils/phone";

// Sub-components
import { QrScannerModal } from "./QrScannerModal";
import { ManualIdModal } from "./ManualIdModal";
import { ConfirmStampModal } from "./ConfirmStampModal";
import { LoyaltyDetailsModal } from "./LoyaltyDetailsModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { LoyaltyMemberCard } from "./LoyaltyMemberCard";

interface LoyaltyTabProps {
  loyaltyMembers: LoyaltyMember[];
  loyaltySearch: string;
  setLoyaltySearch: (search: string) => void;
  onDeleteLoyalty: (id: string) => void;
  onOpenRegisterModal: () => void;
  onRedeemFreeDrink: (member: LoyaltyMember) => void;
  onAwardStamp: (member: LoyaltyMember) => void;
  onRevokeStamp: (member: LoyaltyMember) => void;
}

export const LoyaltyTab: React.FC<LoyaltyTabProps> = ({
  loyaltyMembers,
  loyaltySearch,
  setLoyaltySearch,
  onDeleteLoyalty,
  onOpenRegisterModal,
  onRedeemFreeDrink,
  onAwardStamp,
  onRevokeStamp,
}) => {
  // Modal states
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isEnterIdModalOpen, setIsEnterIdModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Selected member states
  const [selectedMember, setSelectedMember] = useState<LoyaltyMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<LoyaltyMember | null>(null);

  // Filter/Sort states
  const [stampFilter, setStampFilter] = useState<"all" | "none" | "has" | "reward">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest" | "alphabetical">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Handler for QR scan success or manual search success
  const handleMemberFound = (member: LoyaltyMember) => {
    setSelectedMember(member);
    setIsScanModalOpen(false);
    setIsEnterIdModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  // Filtered and sorted members list
  const filteredLoyalty = useMemo(() => {
    let result = loyaltyMembers.filter((member) => {
      // Search filter (name, email, phone, and ID)
      if (loyaltySearch.trim()) {
        const q = loyaltySearch.toLowerCase().trim();
        const matchName = member.name.toLowerCase().includes(q);
        const matchEmail = (member.email || "").toLowerCase().includes(q);
        const matchId = member.id.toLowerCase().includes(q);
        const matchPhone = (member.phone || "").toLowerCase().includes(q);

        if (!matchName && !matchEmail && !matchId && !matchPhone) {
          return false;
        }
      }

      // Stamp filter
      if (stampFilter === "none" && member.stamps !== 0) return false;
      if (stampFilter === "has" && member.stamps === 0) return false;
      if (stampFilter === "reward" && member.stamps < 10) return false;

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "highest") {
        return b.stamps - a.stamps;
      }
      if (sortBy === "lowest") {
        return a.stamps - b.stamps;
      }
      if (sortBy === "oldest") {
        const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
        const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
        return timeA - timeB;
      }
      // default: newest
      const timeA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
      const timeB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  }, [loyaltyMembers, loyaltySearch, stampFilter, sortBy]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [loyaltySearch, stampFilter, sortBy, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLoyalty.length / itemsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLoyalty.slice(start, start + itemsPerPage);
  }, [filteredLoyalty, currentPage, itemsPerPage]);

  const hasActiveFilters = Boolean(loyaltySearch.trim() || stampFilter !== "all" || sortBy !== "newest");

  const resetAllFilters = () => {
    setLoyaltySearch("");
    setStampFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* 1. STAMP STATION HEADER */}
      <div className="rounded-2xl border border-brand-green/25 bg-white dark:bg-card/90 p-6 shadow-sm relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-green/5 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-green animate-pulse shrink-0" />
              <h3 className="type-ui text-sm text-foreground font-bold tracking-wider uppercase">Stamp Station</h3>
            </div>
            <p className="type-caption text-neutral-500 dark:text-neutral-400 leading-relaxed text-xs">
              Scan customer QR code or enter Member ID manually to award loyalty stamps. Buy 10 cups, get the 11th free.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-brand-green text-white px-5 py-2.5 text-xs font-semibold hover:bg-brand-green/90 transition-all duration-200 shadow-sm cursor-pointer"
            >
              <QrCode size={15} />
              Scan QR Code
            </button>
            <button
              onClick={() => setIsEnterIdModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt hover:bg-neutral-100 dark:hover:bg-neutral-800/30 text-neutral-700 dark:text-neutral-300 px-4 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <Plus size={15} />
              Enter Member ID
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEARCH, FILTERS & ACTION TOOLBAR (AUDIT LOGS STYLE) */}
      <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md p-4 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              placeholder="Search members by name, email, phone, or Member ID..."
              value={loyaltySearch}
              onChange={(e) => setLoyaltySearch(e.target.value)}
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground placeholder:text-neutral-500 focus:outline-none focus:border-brand-green transition-all"
            />
            {loyaltySearch && (
              <button
                onClick={() => setLoyaltySearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground text-xs font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Toolbar: View Mode Toggle & Register Member */}
          <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-100 dark:bg-background-alt border border-neutral-200 dark:border-card-border rounded-xl p-1">
              <div className="relative group">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-colors ${
                    viewMode === "grid" ? "bg-brand-green text-white" : "text-neutral-600 dark:text-neutral-400 hover:text-foreground"
                  }`}
                  aria-label="Grid View"
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

            {/* Reset Filters / Refresh Button */}
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

            {/* Register Member Primary Button */}
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green/90 text-white text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Register Member</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Sort Selector Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-200/60 dark:border-card-border/60">
          {/* Stamp Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { value: "all", label: "All Members" },
              { value: "none", label: "No Stamps" },
              { value: "has", label: "Has Stamps" },
              { value: "reward", label: "Reward Unlocked" },
            ].map((opt) => {
              const isActive = stampFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setStampFilter(opt.value as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-brand-green text-white shadow-sm font-semibold"
                      : "bg-neutral-100 dark:bg-background-alt text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-card-border"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal size={13} className="text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-xs text-foreground focus:outline-none focus:border-brand-green cursor-pointer"
            >
              <option value="newest">Newest Joined</option>
              <option value="oldest">Oldest Joined</option>
              <option value="highest">Highest Stamps</option>
              <option value="lowest">Lowest Stamps</option>
              <option value="alphabetical">Name (A-Z)</option>
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

            {loyaltySearch.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Keyword: "{loyaltySearch}"
                <button onClick={() => setLoyaltySearch("")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            {stampFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Filter: {stampFilter === "none" ? "No Stamps" : stampFilter === "has" ? "Has Stamps" : "Reward Unlocked"}
                <button onClick={() => setStampFilter("all")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
              </span>
            )}

            {sortBy !== "newest" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-brand-green/10 text-brand-green border border-brand-green/20">
                Sorted: {sortBy}
                <button onClick={() => setSortBy("newest")} className="hover:text-foreground font-bold ml-1 cursor-pointer">×</button>
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

      {/* 3. MEMBER DIRECTORY DISPLAY (GRID OR TABLE VIEW) */}
      <div className="rounded-2xl border border-neutral-200 dark:border-card-border bg-white dark:bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        {filteredLoyalty.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
              <Users size={24} />
            </div>
            <h3 className="type-h3 text-foreground font-serif text-lg">No Loyalty Members Found</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md">
              There are no registered loyalty members matching your current search query or stamp filter options.
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
            {paginatedMembers.map((member) => (
              <LoyaltyMemberCard
                key={member.id}
                member={member}
                onRedeemFreeDrink={onRedeemFreeDrink}
                onViewDetails={(m) => {
                  setSelectedMember(m);
                  setIsDetailsModalOpen(true);
                }}
                onDeleteClick={(m) => {
                  setMemberToDelete(m);
                  setIsDeleteConfirmOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-background-alt border-b border-neutral-200 dark:border-card-border uppercase text-[10px] tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Member Name & ID</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Stamps Progress</th>
                  <th className="py-3.5 px-4 text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/70 dark:divide-card-border">
                {paginatedMembers.map((member) => {
                  const freeDrinkEarned = member.stamps >= 10;
                  return (
                    <tr
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member);
                        setIsDetailsModalOpen(true);
                      }}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors cursor-pointer group"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground font-serif text-sm">{member.name}</div>
                        <div className="text-[10px] text-brand-green font-mono font-bold">ID: {member.id}</div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{member.email || "N/A"}</div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">{formatDisplayPhone(member.phone)}</div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                        {member.joinedAt || "N/A"}
                      </td>

                      {/* Stamps Progress */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground font-mono">{member.stamps} / 10</span>
                          {freeDrinkEarned ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-green text-white shadow-sm">
                              Reward Unlocked
                            </span>
                          ) : (
                            <div className="flex items-center gap-0.5">
                              {[...Array(10)].map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`h-2.5 w-2.5 rounded-full ${
                                    idx < member.stamps ? "bg-brand-green" : "bg-neutral-200 dark:bg-neutral-700"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {freeDrinkEarned && (
                            <button
                              onClick={() => onRedeemFreeDrink(member)}
                              className="px-2 py-1 rounded-lg bg-brand-green text-white text-[10px] font-bold hover:bg-brand-green/90 transition-colors cursor-pointer"
                              title="Redeem Free Drink"
                            >
                              Redeem
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setIsDetailsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white dark:bg-background-alt border border-neutral-200 dark:border-card-border text-neutral-500 dark:text-neutral-400 hover:text-brand-green hover:border-brand-green/30 transition-colors cursor-pointer"
                            title="View Member Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setMemberToDelete(member);
                              setIsDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. PAGINATION FOOTER */}
        {filteredLoyalty.length > 0 && (
          <div className="p-4 border-t border-neutral-200 dark:border-card-border bg-white dark:bg-background-alt flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <span>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLoyalty.length)} of {filteredLoyalty.length} members
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

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanSuccess={handleMemberFound}
        loyaltyMembers={loyaltyMembers}
      />

      {/* Manual Entry Modal */}
      <ManualIdModal
        isOpen={isEnterIdModalOpen}
        onClose={() => setIsEnterIdModalOpen(false)}
        onFindMember={handleMemberFound}
        loyaltyMembers={loyaltyMembers}
      />

      {/* Confirm Stamp Award Modal */}
      <ConfirmStampModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        selectedMember={selectedMember}
        onAwardStamp={onAwardStamp}
      />

      {/* Loyalty Member Account Profile & Revoke Modal */}
      <LoyaltyDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        selectedMember={selectedMember}
        onRevokeStamp={onRevokeStamp}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        memberToDelete={memberToDelete}
        onDeleteLoyalty={onDeleteLoyalty}
      />
    </div>
  );
};

