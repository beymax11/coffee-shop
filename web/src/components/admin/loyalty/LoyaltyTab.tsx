"use client";

import React, { useState } from "react";
import { Search, Plus, QrCode } from "lucide-react";
import { LoyaltyMember } from "@/utils/db";
import { motion } from "framer-motion";

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

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

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

  // Handler for QR scan success or manual search success
  const handleMemberFound = (member: LoyaltyMember) => {
    setSelectedMember(member);
    setIsScanModalOpen(false);
    setIsEnterIdModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  // Filtered and sorted members list
  const filteredLoyalty = loyaltyMembers
    .filter((member) => {
      // Search filter (name, email, and ID)
      const matchesSearch =
        member.name.toLowerCase().includes(loyaltySearch.toLowerCase()) ||
        member.email.toLowerCase().includes(loyaltySearch.toLowerCase()) ||
        member.id.toLowerCase().includes(loyaltySearch.toLowerCase());

      // Stamp filter
      let matchesStamp = true;
      if (stampFilter === "none") {
        matchesStamp = member.stamps === 0;
      } else if (stampFilter === "has") {
        matchesStamp = member.stamps > 0;
      } else if (stampFilter === "reward") {
        matchesStamp = member.stamps === 10;
      }

      return matchesSearch && matchesStamp;
    })
    .sort((a, b) => {
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

  return (
    <div className="space-y-6">
      {/* STAMP STATION */}
      <div className="rounded-2xl border border-brand-green/25 bg-gradient-to-br from-card to-background-alt/30 p-6 glassmorphism-gold shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-green/5 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-green green-glow animate-pulse shrink-0" />
              <h3 className="type-ui text-sm text-foreground font-bold tracking-wider uppercase">Stamp Station</h3>
            </div>
            <p className="type-caption text-neutral-500 dark:text-zinc-400 leading-relaxed text-xs">
              Scan customer QR code or enter Member ID manually to award loyalty stamps. Buy 10 cups, get the 11th free.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-brand-green text-white px-6 py-3 type-ui text-xs hover:bg-brand-green-hover transition-all duration-300 font-bold shadow-lg shadow-brand-green/15 cursor-pointer green-glow"
            >
              <QrCode size={15} />
              Scan QR Code
            </button>
            <button
              onClick={() => setIsEnterIdModalOpen(true)}
              className="flex items-center gap-2 rounded-full border border-card-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-neutral-500 dark:text-zinc-300 hover:text-white px-5 py-3 type-ui text-xs transition-all duration-300 cursor-pointer"
            >
              <Plus size={15} />
              Enter Member ID
            </button>
          </div>
        </div>
      </div>

      {/* Filter Deck */}
      <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card/50 backdrop-blur-sm p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="Search members by email, name or ID..."
              value={loyaltySearch}
              onChange={(e) => setLoyaltySearch(e.target.value)}
              className="w-full rounded-full border border-card-border bg-background/40 py-2.5 pl-10 pr-4 type-caption text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background/80 focus:ring-1 focus:ring-brand-green/20"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="type-ui text-[9px] text-neutral-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-full border border-card-border bg-background/40 px-3.5 py-1.5 type-ui text-[9px] text-foreground dark:text-zinc-300 outline-none cursor-pointer transition-all duration-300 focus:border-brand-green/60 focus:bg-background/80"
              >
                <option value="newest" className="bg-card text-foreground">Newest Joined</option>
                <option value="oldest" className="bg-card text-foreground">Oldest Joined</option>
                <option value="highest" className="bg-card text-foreground">Highest Stamps</option>
                <option value="lowest" className="bg-card text-foreground">Lowest Stamps</option>
                <option value="alphabetical" className="bg-card text-foreground">Name (A-Z)</option>
              </select>
            </div>

            <button
              onClick={onOpenRegisterModal}
              className="flex items-center gap-1.5 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-4 py-2 type-ui text-[9px] text-white transition-all duration-300 font-bold shadow-lg shadow-[#2E5A44]/10 hover:shadow-[#234533]/25 cursor-pointer shrink-0 min-h-[36px]"
            >
              <Plus size={13} />
              Register Member
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-card-border/40 pt-3">
          <span className="type-ui text-[9px] text-neutral-500 dark:text-zinc-400 font-bold uppercase tracking-wider mr-2">Filter by stamps:</span>
          {(
            [
              { value: "all", label: "All Members" },
              { value: "none", label: "No Stamps" },
              { value: "has", label: "Has Stamps" },
              { value: "reward", label: "Reward Unlocked" },
            ] as const
          ).map((opt) => {
            const isActive = stampFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setStampFilter(opt.value)}
                className={`rounded-full px-3.5 py-1.5 type-ui text-[9px] tracking-wider border cursor-pointer transition-all duration-300 ${isActive
                    ? "bg-brand-green border-brand-green text-white font-semibold shadow-[0_2px_10px_rgba(46,90,68,0.25)]"
                    : "bg-foreground/[0.02] border-card-border/50 text-neutral-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white dark:hover:border-white/20"
                  }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Member Directory Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
      >
        {filteredLoyalty.map((member) => (
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
        {filteredLoyalty.length === 0 && (
          <div className="col-span-2 py-16 text-center text-neutral-500 italic type-body-sm bg-foreground/[0.03] border border-dashed border-card-border rounded-2xl">
            No loyalty members found matching this filter.
          </div>
        )}
      </motion.div>

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
