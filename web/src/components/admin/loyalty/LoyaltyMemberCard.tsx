"use client";

import React from "react";
import { Mail, Calendar, Eye, Trash2, Zap, Check, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { LoyaltyMember } from "@/utils/db";
import { formatDisplayPhone } from "@/utils/phone";

interface LoyaltyMemberCardProps {
  member: LoyaltyMember;
  onRedeemFreeDrink: (member: LoyaltyMember) => void;
  onViewDetails: (member: LoyaltyMember) => void;
  onDeleteClick: (member: LoyaltyMember) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export const LoyaltyMemberCard: React.FC<LoyaltyMemberCardProps> = ({
  member,
  onRedeemFreeDrink,
  onViewDetails,
  onDeleteClick,
}) => {
  const freeDrinkEarned = member.stamps >= 10;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-card-border bg-gradient-to-br from-card via-card/90 to-background-alt/30 p-6 shadow-2xl relative overflow-hidden transition-all duration-300 flex flex-col justify-between gap-5 hover:border-brand-green/25"
    >
      {/* Luxury green highlight inside the loyalty card */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/[0.01] blur-[25px] rounded-full pointer-events-none" />

      <div>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="type-body font-bold text-foreground text-base font-serif tracking-wide">{member.name}</h4>
            <div className="flex flex-col gap-1 pt-0.5">
              <div className="flex items-center gap-1.5 text-neutral-500 dark:text-zinc-500 text-[10px]">
                <Mail size={11} className="shrink-0" />
                <span className="font-semibold text-neutral-600 dark:text-zinc-400">Email:</span>
                <span>{member.email ? member.email : "n/a"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-500 dark:text-zinc-500 text-[10px]">
                <Phone size={11} className="shrink-0" />
                <span className="font-semibold text-neutral-600 dark:text-zinc-400">Phone:</span>
                <span>{formatDisplayPhone(member.phone)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2 text-[9px] tracking-wide text-neutral-500 dark:text-zinc-500 font-medium">
              <div className="flex items-center gap-1">
                <Calendar size={10} className="shrink-0" />
                <span>JOINED: {member.joinedAt}</span>
              </div>
              <div className="flex items-center gap-1 font-mono bg-brand-green/10 px-2 py-0.5 rounded-md border border-brand-green/20 text-brand-green dark:text-emerald-400 text-[10px] font-bold w-fit tracking-wider shadow-sm shadow-brand-green/5 mt-0.5">
                <span>ID: {member.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {freeDrinkEarned && (
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-brand-green text-white px-2.5 py-1 rounded-full text-[8px] font-bold type-ui tracking-wider green-glow"
              >
                REWARD UNLOCKED
              </motion.span>
            )}
            <button
              onClick={() => onViewDetails(member)}
              className="p-2 rounded-full border border-card-border/40 text-neutral-500 dark:text-zinc-500 hover:text-brand-green hover:bg-brand-green/10 hover:border-brand-green/20 transition-all duration-300 cursor-pointer"
              title="View Details & Manage Stamps"
            >
              <Eye size={13} />
            </button>
            <button
              onClick={() => onDeleteClick(member)}
              className="p-2 rounded-full border border-card-border/40 text-neutral-500 dark:text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 cursor-pointer"
              title="Delete Card"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Interactive Stamp circles */}
        <div className="mt-3 border-t border-card-border/40 pt-3">
          <div className="flex justify-between items-center mb-3">
            <span className="type-label text-[10px] text-neutral-500 dark:text-zinc-400 flex items-center gap-1.5 font-bold">
              <Zap size={11} className="text-brand-green" /> stamps collected: {member.stamps} / 10
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1 sm:gap-1.5 max-w-full">
            {[...Array(10)].map((_, idx) => {
              const isStamped = idx < member.stamps;
              return (
                <div
                  key={idx}
                  className={`h-6 w-6 sm:h-7 sm:w-7 rounded-full border transition-all duration-300 flex items-center justify-center ${isStamped
                      ? "bg-brand-green/20 border-brand-green text-brand-green shadow green-glow font-bold text-[9px] scale-105"
                      : "border-card-border bg-foreground/[0.03] text-neutral-400 dark:text-zinc-600 dark:bg-black/40 text-[9px] font-semibold"
                    }`}
                >
                  {isStamped ? <Check size={11} className="stroke-[3]" /> : idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {freeDrinkEarned && (
        <div className="border-t border-card-border/40 pt-4">
          <button
            onClick={() => onRedeemFreeDrink(member)}
            className="w-full py-2 rounded-full bg-brand-green hover:bg-brand-green-hover text-[10px] font-bold type-ui text-white transition-all duration-300 shadow-md shadow-brand-green/15 cursor-pointer animate-pulse"
          >
            Redeem Drink
          </button>
        </div>
      )}
    </motion.div>
  );
};
