"use client";

import React, { useState } from "react";
import {
  Search,
  Shield,
  Coffee,
  User,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  Users,
  Calendar,
  AtSign,
  UserCheck
} from "lucide-react";
import { UserProfile } from "@/utils/db";
import { motion, AnimatePresence } from "framer-motion";
import { formatDisplayPhone } from "@/utils/phone";

interface UsersTabProps {
  users: UserProfile[];
  currentUserEmail: string;
  onUpdateRole: (userId: string, newRole: "admin" | "barista" | "customer") => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

const displayContactInfo = (email?: string, phone?: string) => {
  const formattedPhone = phone ? formatDisplayPhone(phone) : "";
  if (email) {
    return formattedPhone ? `${email} • ${formattedPhone}` : email;
  }
  return formattedPhone || "No contact info";
};

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  currentUserEmail,
  onUpdateRole,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "barista" | "customer">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alphabetical">("newest");

  // Modal States
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<"admin" | "barista" | "customer">("customer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Statistics
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const baristaCount = users.filter((u) => u.role === "barista").length;
  const customerCount = users.filter((u) => u.role === "customer").length;

  // Filter & Sort Logic
  const filteredUsers = users
    .filter((user) => {
      const customerMemberId = user.role === "customer" ? (user.member_id || user.id || "") : "";
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerMemberId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name);
      }
      const dateA = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
      const dateB = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenRoleModal = (user: UserProfile) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleOpenDeleteModal = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleRoleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await onUpdateRole(selectedUser.id, newRole);
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await onDeleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* STATS DECK */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
      >
        {[
          { label: "Total Accounts", value: totalUsers, icon: Users, color: "text-brand-green bg-brand-green/10" },
          { label: "Administrators", value: adminCount, icon: Shield, color: "text-red-500 bg-red-500/10 border-red-500/10" },
          { label: "Baristas & Staff", value: baristaCount, icon: Coffee, color: "text-teal-500 bg-teal-500/10 border-teal-500/10" },
          { label: "Registered Customers", value: customerCount, icon: User, color: "text-blue-500 bg-blue-500/10 border-blue-500/10" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="rounded-2xl border border-card-border bg-card/40 backdrop-blur-sm p-5 flex items-center justify-between shadow-xl"
            >
              <div className="space-y-1">
                <span className="type-caption text-[10px] text-neutral-500 dark:text-zinc-500 uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className="text-2xl font-bold font-serif text-foreground block">
                  {stat.value}
                </span>
              </div>
              <div className={`p-3 rounded-2xl ${stat.color} shrink-0`}>
                <Icon size={18} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* FILTER & CONTROLS DECK */}
      <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card/50 backdrop-blur-sm p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="Search by name, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-card-border bg-background/40 py-2.5 pl-10 pr-4 type-caption text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background focus:ring-1 focus:ring-brand-green/20"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="type-ui text-[9px] text-neutral-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-full border border-card-border bg-background/40 px-3.5 py-1.5 type-ui text-[9px] text-foreground dark:text-zinc-300 outline-none cursor-pointer transition-all duration-300 focus:border-brand-green/60 focus:bg-background"
            >
              <option value="newest" className="bg-card text-foreground">Newest Accounts</option>
              <option value="oldest" className="bg-card text-foreground">Oldest Accounts</option>
              <option value="alphabetical" className="bg-card text-foreground">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-card-border/40 pt-3">
          <span className="type-ui text-[9px] text-neutral-500 dark:text-zinc-400 font-bold uppercase tracking-wider mr-2">
            Filter by role:
          </span>
          {(
            [
              { value: "all", label: "All Accounts" },
              { value: "admin", label: "Administrators" },
              { value: "barista", label: "Baristas/Staff" },
              { value: "customer", label: "Customers" },
            ] as const
          ).map((opt) => {
            const isActive = roleFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setRoleFilter(opt.value)}
                className={`rounded-full px-3.5 py-1.5 type-ui text-[9px] tracking-wider border cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-brand-green border-brand-green text-white font-semibold shadow-[0_2px_10px_rgba(46,90,68,0.2)]"
                    : "bg-foreground/[0.02] border-card-border/50 text-neutral-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white dark:hover:border-white/20"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE CARD VIEW — visible on sm and below */}
      <div className="sm:hidden space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isSelf = user.email.toLowerCase() === currentUserEmail.toLowerCase();
            return (
              <div
                key={user.id}
                className="rounded-2xl border border-card-border bg-card/40 backdrop-blur-sm p-4 shadow-xl flex flex-col gap-3"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-xs border ${
                      user.role === "admin"
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : user.role === "barista"
                        ? "bg-teal-500/10 text-teal-500 border-teal-500/20"
                        : "bg-brand-green/10 text-brand-green border-brand-green/20"
                    }`}>
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                        {user.name}
                        {isSelf && (
                          <span className="bg-brand-green/15 text-brand-green px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase">You</span>
                        )}
                      </p>
                      <p className="text-[10px] text-neutral-500 dark:text-zinc-500 truncate">
                        {displayContactInfo(user.email, user.phone)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold border shrink-0 ${
                    user.role === "admin"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : user.role === "barista"
                      ? "bg-teal-500/10 text-teal-500 border-teal-500/20"
                      : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  }`}>
                    {user.role === "admin" && <Shield size={9} />}
                    {user.role === "barista" && <Coffee size={9} />}
                    {user.role === "customer" && <User size={9} />}
                    <span className="capitalize">{user.role}</span>
                  </span>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-neutral-500 dark:text-zinc-400 items-center">
                  {user.role === "customer" && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded-md font-semibold">
                      <span className="text-[8px] uppercase tracking-wider text-neutral-500 dark:text-zinc-400 font-sans font-normal">ID:</span>
                      {user.member_id || user.id}
                    </span>
                  )}
                  {user.username && (
                    <span className="flex items-center gap-1 font-mono">
                      <AtSign size={9} />{user.username}
                    </span>
                  )}
                  {user.joinedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar size={9} />{user.joinedAt}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-card-border/40">
                  <button
                    onClick={() => handleOpenRoleModal(user)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-card-border bg-foreground/[0.01] hover:bg-foreground/5 text-neutral-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white transition-colors text-[9px] font-bold tracking-wider cursor-pointer min-h-[44px]"
                  >
                    <Edit2 size={12} /> Edit Role
                  </button>
                  <button
                    onClick={() => !isSelf && handleOpenDeleteModal(user)}
                    disabled={isSelf}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-colors text-[9px] font-bold tracking-wider min-h-[44px] ${
                      isSelf
                        ? "border-transparent bg-transparent text-neutral-300 dark:text-zinc-700 cursor-not-allowed opacity-40"
                        : "border-red-500/10 bg-red-500/[0.01] hover:bg-red-500/10 text-red-500 hover:text-red-600 cursor-pointer"
                    }`}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-neutral-500 dark:text-zinc-400 italic text-xs border border-dashed border-card-border rounded-2xl">
            No matching user accounts found.
          </div>
        )}
      </div>

      {/* USERS TABLE — hidden on mobile, visible on sm+ */}
      <div className="hidden sm:block rounded-2xl border border-card-border bg-card/30 backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-card-border bg-foreground/[0.02] dark:bg-white/[0.01]">
                <th className="px-6 py-4 type-ui text-[10px] text-neutral-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-4 type-ui text-[10px] text-neutral-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-4 type-ui text-[10px] text-neutral-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 type-ui text-[10px] text-neutral-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  Member ID
                </th>
                <th className="px-6 py-4 type-ui text-[10px] text-neutral-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-4 type-ui text-[10px] text-neutral-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isSelf = user.email.toLowerCase() === currentUserEmail.toLowerCase();
                  
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-foreground/[0.01] dark:hover:bg-white/[0.01] transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold text-xs border ${
                            user.role === "admin" 
                              ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                              : user.role === "barista"
                              ? "bg-teal-500/10 text-teal-500 border-teal-500/20"
                              : "bg-brand-green/10 text-brand-green border-brand-green/20"
                          }`}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <span className="type-body-sm font-semibold text-foreground flex items-center gap-1.5 text-xs">
                              {user.name}
                              {isSelf && (
                                <span className="bg-brand-green/15 text-brand-green px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="type-caption text-[10px] text-neutral-500 dark:text-zinc-500 block mt-0.5">
                              {displayContactInfo(user.email, user.phone)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="px-6 py-4 font-mono text-[11px] text-neutral-500 dark:text-zinc-400">
                        {user.username ? (
                          <div className="flex items-center gap-1">
                            <AtSign size={10} className="text-zinc-600" />
                            {user.username}
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">none</span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold type-ui tracking-wider border ${
                            user.role === "admin"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              : user.role === "barista"
                              ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {user.role === "admin" && <Shield size={10} />}
                          {user.role === "barista" && <Coffee size={10} />}
                          {user.role === "customer" && <User size={10} />}
                          <span className="capitalize">{user.role}</span>
                        </span>
                      </td>

                      {/* Member ID */}
                      <td className="px-6 py-4 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                        {user.role === "customer" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg border border-brand-green/30 bg-brand-green/10 text-brand-green font-semibold text-[10px] tracking-wide">
                            {user.member_id || user.id}
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-600 font-sans italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-[11px] text-neutral-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-neutral-500/60" />
                          {user.joinedAt || "N/A"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenRoleModal(user)}
                            title="Edit User Role"
                            className="p-2 rounded-lg border border-card-border bg-foreground/[0.01] hover:bg-foreground/5 dark:hover:bg-white/5 text-neutral-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                          
                          <button
                            onClick={() => handleOpenDeleteModal(user)}
                            disabled={isSelf}
                            title={isSelf ? "You cannot delete yourself" : "Delete Account"}
                            className={`p-2 rounded-lg border transition-colors ${
                              isSelf
                                ? "border-transparent bg-transparent text-neutral-300 dark:text-zinc-700 cursor-not-allowed opacity-40"
                                : "border-red-500/10 bg-red-500/[0.01] hover:bg-red-500/10 text-red-500 hover:text-red-600 cursor-pointer"
                            }`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 dark:text-zinc-400 italic text-xs">
                    No matching user accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT ROLE MODAL */}
      <AnimatePresence>
        {isRoleModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRoleModalOpen(false)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-card-border bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/10 blur-[35px] rounded-full pointer-events-none" />

              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 rounded-xl bg-brand-green/10 text-brand-green">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-base">Adjust User Role</h3>
                  <p className="type-caption text-[10px] text-neutral-500 dark:text-zinc-400">Modify authorization privileges</p>
                </div>
              </div>

              <form onSubmit={handleRoleChangeSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <span className="type-caption text-[10px] text-neutral-500 dark:text-zinc-500">Account Details:</span>
                  <div className="rounded-xl border border-card-border bg-foreground/[0.02] dark:bg-white/[0.01] p-3">
                    <p className="type-body-sm font-semibold text-foreground text-xs">{selectedUser.name}</p>
                    <p className="type-caption text-[9px] text-neutral-500 dark:text-zinc-500 font-mono mt-0.5">
                      {displayContactInfo(selectedUser.email, selectedUser.phone)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="type-label block text-[9px] tracking-wider text-neutral-500 dark:text-zinc-400 font-bold uppercase">
                    Choose System Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full rounded-xl border border-card-border bg-background/50 py-3 px-4 type-field text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background text-xs capitalize cursor-pointer font-sans"
                  >
                    <option value="customer" className="bg-card text-foreground">Customer (Loyalty Program)</option>
                    <option value="barista" className="bg-card text-foreground">Barista / Staff (QR and Bookings)</option>
                    <option value="admin" className="bg-card text-foreground">Administrator (Full System Access)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="flex-1 rounded-xl border border-card-border hover:bg-foreground/5 dark:hover:bg-white/5 py-3 type-ui text-[10px] font-bold text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-all cursor-pointer text-center font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-brand-green text-white hover:bg-brand-green-hover py-3 type-ui text-[10px] font-bold transition-all shadow-md shadow-brand-green/10 cursor-pointer text-center flex items-center justify-center gap-1.5 font-sans"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-red-500/20 bg-card/95 dark:bg-zinc-950/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-[35px] rounded-full pointer-events-none" />

              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-500 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-white/5 transition-colors p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="type-h3 text-foreground font-serif font-bold text-base">Delete Account</h3>
                  <p className="type-caption text-[10px] text-neutral-500 dark:text-red-400">This action cannot be undone</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="type-caption text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed font-sans">
                  Are you sure you want to delete the user account for <strong className="text-foreground">{selectedUser.name}</strong> ({selectedUser.email})? They will lose all access and database profile records permanently.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 rounded-xl border border-card-border hover:bg-foreground/5 dark:hover:bg-white/5 py-3 type-ui text-[10px] font-bold text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-all cursor-pointer text-center font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteSubmit}
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-red-500 text-white hover:bg-red-600 py-3 type-ui text-[10px] font-bold transition-all shadow-md shadow-red-500/10 cursor-pointer text-center flex items-center justify-center gap-1.5 font-sans"
                  >
                    {isSubmitting ? "Deleting..." : "Confirm Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
