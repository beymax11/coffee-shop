"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit3, Trash2, Heart, MessageCircle, X, ExternalLink, AlertTriangle, Check } from "lucide-react";
import { LifestylePost, LifestyleComment } from "@/types";
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

export const LifestyleTab: React.FC = () => {
  const [posts, setPosts] = useState<LifestylePost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<LifestylePost | null>(null);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCommentsPost, setSelectedCommentsPost] = useState<LifestylePost | null>(null);
  const [deleteCommentData, setDeleteCommentData] = useState<{ commentId: number | string; postId: number } | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "posted" | "unposted">("all");

  // Form state
  const [formState, setFormState] = useState<{
    imageUrl: string;
    username: string;
    caption: string;
    likes: number | "";
    date: string;
    location: string;
    status: string;
  }>({
    imageUrl: "",
    username: "",
    caption: "",
    likes: 0,
    date: new Date().toISOString().split("T")[0],
    location: "Antonioni Grounds • Tokyo",
    status: "unposted",
  });

  const loadPosts = async () => {
    if (supabase) {
      const { data, error } = await supabase
        .from("lifestyle_posts")
        .select(`
          *,
          comments:lifestyle_comments(*),
          likes_list:lifestyle_likes(*)
        `)
        .order("created_at", { ascending: false });
      if (!error && data) {
        const postsData = data.map((post: any) => ({
          ...post,
          likes: (post.likes_list || []).length,
          commentsCount: (post.comments || []).length,
          comments: post.comments || [],
          status: post.status || "unposted"
        }));
        setPosts(postsData as unknown as LifestylePost[]);
        return;
      } else if (error) {
        console.error("Supabase select error:", error);
      }
    }
    setPosts(db.getLifestylePosts());
  };

  useEffect(() => {
    loadPosts();
    const handleStorageChange = () => {
      loadPosts();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleOpenAddModal = () => {
    setEditingPost(null);
    setFormState({
      imageUrl: "",
      username: "",
      caption: "",
      likes: 0,
      date: new Date().toISOString().split("T")[0],
      location: "Antonioni Grounds • Tokyo",
      status: "unposted",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: LifestylePost) => {
    setEditingPost(post);
    setFormState({
      imageUrl: post.imageUrl,
      username: post.username,
      caption: post.caption,
      likes: post.likes,
      date: post.date,
      location: post.location,
      status: post.status || "unposted",
    });
    setIsModalOpen(true);
  };

  const handleDeletePost = (id: number) => {
    setDeletePostId(id);
  };

  const handleDeletePostConfirm = async () => {
    if (deletePostId === null) return;
    setIsDeleting(true);
    try {
      if (supabase) {
        const { error } = await supabase
          .from("lifestyle_posts")
          .delete()
          .eq("id", deletePostId);
        if (error) {
          toast.error("Failed to delete from Supabase: " + error.message);
          return;
        }
      }
      db.deleteLifestylePost(deletePostId);
      loadPosts();
      toast.success("Lifestyle post deleted successfully.");
      setDeletePostId(null);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteComment = (commentId: number | string, postId: number) => {
    setDeleteCommentData({ commentId, postId });
  };

  const handleDeleteCommentConfirm = async () => {
    if (deleteCommentData === null) return;
    setIsDeletingComment(true);
    const { commentId, postId } = deleteCommentData;
    try {
      if (supabase) {
        const { error } = await supabase
          .from("lifestyle_comments")
          .delete()
          .eq("id", commentId);
          
        if (error) {
          toast.error("Failed to delete comment: " + error.message);
          return;
        }
      } else {
        // Fallback for offline local comments stored in local DB
        const postsList = db.getLifestylePosts();
        const foundPost = postsList.find(p => p.id === postId);
        if (foundPost) {
          foundPost.comments = foundPost.comments.filter(c => c.id !== commentId);
          db.saveLifestylePost(foundPost);
        }
      }

      toast.success("Comment deleted successfully.");
      
      // Update local modal state instantly
      if (selectedCommentsPost) {
        setSelectedCommentsPost(prev => {
          if (!prev) return null;
          return {
            ...prev,
            comments: prev.comments.filter(c => c.id !== commentId)
          };
        });
      }
      
      loadPosts();
      setDeleteCommentData(null);
    } catch (err: any) {
      console.error(err);
      toast.error("An error occurred during deletion.");
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.imageUrl.trim() || !formState.username.trim() || !formState.caption.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const postData: LifestylePost = {
      id: editingPost ? editingPost.id : Date.now(),
      imageUrl: formState.imageUrl.trim(),
      username: formState.username.replace("@", "").trim(),
      likes: Number(formState.likes) || 0,
      caption: formState.caption.trim(),
      date: formState.date.trim() || new Date().toISOString().split("T")[0],
      location: formState.location.trim() || "Antonioni Grounds",
      comments: editingPost ? editingPost.comments : [],
      commentsCount: editingPost ? editingPost.commentsCount : 0,
      status: formState.status,
    };

    if (supabase) {
      const { error } = await supabase
        .from("lifestyle_posts")
        .upsert({
          id: postData.id,
          imageUrl: postData.imageUrl,
          username: postData.username,
          likes: postData.likes,
          caption: postData.caption,
          date: postData.date,
          location: postData.location,
          comments: postData.comments,
          commentsCount: postData.commentsCount,
          status: postData.status
        });
      if (error) {
        toast.error("Failed to save to Supabase: " + error.message);
        return;
      }
    }

    db.saveLifestylePost(postData);
    loadPosts();
    setIsModalOpen(false);
    toast.success(editingPost ? "Lifestyle post updated successfully." : "New lifestyle post added successfully.");
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "posted" && post.status === "posted") ||
      (statusFilter === "unposted" && post.status === "unposted");
      
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card/50 backdrop-blur-sm p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-zinc-500" size={14} />
              <input
                type="text"
                placeholder="Search by user, caption, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-card-border bg-background/40 py-2.5 pl-10 pr-4 type-caption text-foreground outline-none transition-all duration-300 focus:border-brand-green/60 focus:bg-background/60 focus:ring-1 focus:ring-brand-green/20"
              />
            </div>

            {/* Status Filter Tab Pills */}
            <div className="flex items-center gap-1 bg-background-alt/30 border border-card-border/55 p-1 rounded-full w-fit">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-1.5 rounded-full type-ui text-[9px] font-bold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-foreground/5 dark:bg-white/5 text-foreground"
                    : "text-neutral-500 dark:text-zinc-400 hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("posted")}
                className={`px-4 py-1.5 rounded-full type-ui text-[9px] font-bold transition-all cursor-pointer ${
                  statusFilter === "posted"
                    ? "bg-[#2E5A44]/15 text-[#4d9b73] border border-[#2E5A44]/20"
                    : "text-neutral-500 dark:text-zinc-400 hover:text-[#4d9b73]"
                }`}
              >
                Posted
              </button>
              <button
                onClick={() => setStatusFilter("unposted")}
                className={`px-4 py-1.5 rounded-full type-ui text-[9px] font-bold transition-all cursor-pointer ${
                  statusFilter === "unposted"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "text-neutral-500 dark:text-zinc-400 hover:text-red-400"
                }`}
              >
                Unposted
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1.5 rounded-full bg-[#2E5A44] hover:bg-[#234533] px-5 py-2.5 type-ui text-[9px] text-white transition-all duration-300 font-bold shadow-lg shadow-[#2E5A44]/10 hover:shadow-[#234533]/25 cursor-pointer min-h-[44px]"
            >
              <Plus size={13} />
              Add Lifestyle Post
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            variants={cardVariants}
            className="rounded-2xl border border-card-border bg-card/40 backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col group"
          >
            {/* Post Image Container */}
            <div className="relative aspect-square w-full bg-background-alt overflow-hidden border-b border-card-border">
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-white text-[9px] font-bold font-sans tracking-wide uppercase">
                @{post.username}
              </div>
              <div className={`absolute top-3 right-3 backdrop-blur-md px-2.5 py-1 rounded border text-[9px] font-bold font-sans tracking-wide uppercase shadow-sm ${
                post.status === "posted"
                  ? "bg-[#2E5A44]/75 border-[#2E5A44]/30 text-white"
                  : "bg-red-950/75 border-red-500/30 text-red-300"
              }`}>
                {post.status === "posted" ? "Posted" : "Draft"}
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-neutral-500 dark:text-zinc-400 text-[10px] font-medium font-sans">
                  <span>{post.location}</span>
                  <span>{post.date}</span>
                </div>
                <p className="type-body-sm text-foreground text-xs line-clamp-3 leading-relaxed font-sans font-medium">
                  {post.caption}
                </p>
              </div>

              {/* Interaction Details & Actions */}
              <div className="border-t border-card-border/50 pt-3 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3.5 text-[10px] text-neutral-500 dark:text-zinc-400 font-bold font-mono">
                  <span className="flex items-center gap-1">
                    <Heart size={11} className="fill-red-500/10 text-red-500" />
                    {post.likes}
                  </span>
                  <button
                    onClick={() => setSelectedCommentsPost(post)}
                    className="flex items-center gap-1 hover:text-[#2E5A44] transition-all cursor-pointer hover:underline"
                    title="View Comments"
                  >
                    <MessageCircle size={11} className="text-[#2E5A44]" />
                    {post.comments.length}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(post)}
                    className="p-2 rounded-lg hover:bg-brand-green/10 text-neutral-500 dark:text-zinc-400 hover:text-brand-green transition-all duration-300 cursor-pointer"
                    title="Edit Post"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 dark:text-zinc-400 hover:text-red-400 transition-all duration-300 cursor-pointer"
                    title="Delete Post"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-500 italic type-body-sm bg-card/20 rounded-2xl border border-dashed border-card-border">
            No lifestyle posts found. Click "Add Lifestyle Post" to get started.
          </div>
        )}
      </motion.div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-w-lg bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-card-border flex items-center justify-between bg-background-alt/30">
                <h3 className="type-h3 text-foreground font-serif text-sm font-bold">
                  {editingPost ? "Edit Lifestyle Post" : "Add Lifestyle Post"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-foreground/[0.03] text-neutral-500 hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
                {/* Image URL */}
                <div className="space-y-1">
                  <label className="type-label text-[10px] text-neutral-500 dark:text-zinc-400">
                    Image URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formState.imageUrl}
                    onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                    className="w-full rounded-lg border border-card-border bg-background-alt/40 p-2.5 text-xs text-foreground outline-none transition-all focus:border-brand-green/60 focus:bg-background-alt/80"
                  />
                  <p className="text-[9px] text-neutral-500">
                    Use high quality image links from Unsplash or other hosting sites.
                  </p>
                </div>

                {/* Grid for Username and Likes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="space-y-1">
                    <label className="type-label text-[10px] text-neutral-500 dark:text-zinc-400">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">@</span>
                      <input
                        type="text"
                        required
                        placeholder="username"
                        value={formState.username}
                        onChange={(e) => setFormState({ ...formState, username: e.target.value })}
                        className="w-full rounded-lg border border-card-border bg-background-alt/40 py-2.5 pl-7 pr-3 text-xs text-foreground outline-none transition-all focus:border-brand-green/60 focus:bg-background-alt/80"
                      />
                    </div>
                  </div>

                  {/* Likes */}
                  <div className="space-y-1">
                    <label className="type-label text-[10px] text-neutral-500 dark:text-zinc-400">
                      Initial Likes
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formState.likes}
                      onChange={(e) => setFormState({ ...formState, likes: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="w-full rounded-lg border border-card-border bg-background-alt/40 p-2.5 text-xs text-foreground outline-none transition-all focus:border-brand-green/60 focus:bg-background-alt/80"
                    />
                  </div>
                </div>

                {/* Grid for Location and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="space-y-1">
                    <label className="type-label text-[10px] text-neutral-500 dark:text-zinc-400">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Antonioni Grounds • Tokyo"
                      value={formState.location}
                      onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                      className="w-full rounded-lg border border-card-border bg-background-alt/40 p-2.5 text-xs text-foreground outline-none transition-all focus:border-brand-green/60 focus:bg-background-alt/80"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="type-label text-[10px] text-neutral-500 dark:text-zinc-400">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formState.date}
                      onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                      className="w-full rounded-lg border border-card-border bg-background-alt/40 p-2.5 text-xs text-foreground outline-none transition-all focus:border-brand-green/60 focus:bg-background-alt/80"
                    />
                  </div>
                </div>

                {/* Caption */}
                <div className="space-y-1">
                  <label className="type-label text-[10px] text-neutral-500 dark:text-zinc-400">
                    Caption <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter caption with tags e.g. #antonionilifestyle..."
                    value={formState.caption}
                    onChange={(e) => setFormState({ ...formState, caption: e.target.value })}
                    className="w-full rounded-lg border border-card-border bg-background-alt/40 p-2.5 text-xs text-foreground outline-none transition-all focus:border-brand-green/60 focus:bg-background-alt/80 resize-none"
                  />
                </div>

                {/* Status Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="type-label text-[10px] text-neutral-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    Publication Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, status: "posted" })}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        formState.status === "posted"
                          ? "bg-[#2E5A44]/15 border-[#2E5A44] text-[#4d9b73] shadow-sm shadow-[#2E5A44]/10"
                          : "border-card-border bg-background-alt/10 hover:bg-foreground/[0.02] text-neutral-500 hover:text-foreground"
                      }`}
                    >
                      <Check size={13} />
                      Post
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, status: "unposted" })}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        formState.status === "unposted"
                          ? "bg-red-500/10 border-red-500/30 text-red-400"
                          : "border-card-border bg-background-alt/10 hover:bg-foreground/[0.02] text-neutral-500 hover:text-foreground"
                      }`}
                    >
                      <X size={13} />
                      Unpost
                    </button>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="border-t border-card-border/50 pt-4 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-card-border hover:bg-foreground/[0.03] type-ui text-[9px] text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-all cursor-pointer font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-brand-green hover:bg-[#234533] type-ui text-[9px] text-white transition-all cursor-pointer font-bold"
                  >
                    {editingPost ? "Save Changes" : "Create Post"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {deletePostId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-w-xs bg-card border border-card-border rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center gap-4"
            >
              {/* Alert Icon Badge */}
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner shadow-red-500/5">
                <AlertTriangle size={22} className="animate-pulse" />
              </div>

              {/* Title & Message */}
              <div className="space-y-1">
                <h3 className="type-h3 text-foreground font-serif text-sm font-bold">
                  Delete Post?
                </h3>
                <p className="type-caption text-neutral-500 text-[10px] leading-relaxed max-w-[240px] font-sans font-medium">
                  Are you sure you want to delete this lifestyle post? This action is permanent and cannot be undone.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center gap-2.5 border-t border-card-border/40 pt-4 mt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletePostId(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-card-border hover:bg-foreground/[0.03] type-ui text-[9px] text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-all cursor-pointer font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeletePostConfirm}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white type-ui text-[9px] transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-red-600/10 hover:shadow-red-700/20"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedCommentsPost !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-w-md bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-card-border flex items-center justify-between bg-background-alt/30">
                <div>
                  <h3 className="type-h3 text-foreground font-serif text-sm font-bold">
                    Comments
                  </h3>
                  <p className="text-[10px] text-neutral-500 dark:text-zinc-400 mt-0.5">
                    Managing comments on @{selectedCommentsPost.username}'s post
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCommentsPost(null)}
                  className="w-7 h-7 rounded-full bg-foreground/[0.03] text-neutral-500 hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Comments List */}
              <div className="p-4 overflow-y-auto space-y-3.5 max-h-[400px] min-h-[150px] scrollbar-thin">
                {selectedCommentsPost.comments && selectedCommentsPost.comments.length > 0 ? (
                  selectedCommentsPost.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start justify-between gap-3 group/comment p-2 rounded-lg hover:bg-foreground/[0.02] transition-colors border border-transparent hover:border-card-border/30">
                      <div className="flex gap-3 items-start min-w-0">
                        <div className="w-7 h-7 rounded-full bg-brand-charcoal border border-card-border flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-zinc-300 shrink-0 uppercase font-sans">
                          {comment.username.replace("@", "")[0] || "U"}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="leading-relaxed text-xs text-foreground">
                            <span className="font-bold mr-1.5 text-xs text-foreground font-sans">
                              {comment.username.startsWith("@") ? comment.username : `@${comment.username}`}
                            </span>
                            {comment.text}
                          </p>
                          <p className="text-[9px] text-neutral-500 dark:text-zinc-500 font-sans font-medium">
                            {comment.time}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment.id, selectedCommentsPost.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-500 dark:text-zinc-500 hover:text-red-400 transition-all opacity-100 md:opacity-0 group-hover/comment:opacity-100 cursor-pointer"
                        title="Delete Comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-neutral-500 italic type-body-sm bg-background-alt/10 rounded-xl border border-dashed border-card-border/50">
                    No comments on this post yet.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {deleteCommentData !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-w-xs bg-card border border-card-border rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center gap-4"
            >
              {/* Alert Icon Badge */}
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner shadow-red-500/5">
                <AlertTriangle size={22} className="animate-pulse" />
              </div>

              {/* Title & Message */}
              <div className="space-y-1">
                <h3 className="type-h3 text-foreground font-serif text-sm font-bold">
                  Delete Comment?
                </h3>
                <p className="type-caption text-neutral-500 text-[10px] leading-relaxed max-w-[240px] font-sans font-medium">
                  Are you sure you want to delete this comment? This action is permanent and cannot be undone.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center gap-2.5 border-t border-card-border/40 pt-4 mt-2">
                <button
                  type="button"
                  disabled={isDeletingComment}
                  onClick={() => setDeleteCommentData(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-card-border hover:bg-foreground/[0.03] type-ui text-[9px] text-neutral-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-white transition-all cursor-pointer font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingComment}
                  onClick={handleDeleteCommentConfirm}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white type-ui text-[9px] transition-all cursor-pointer font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-red-600/10 hover:shadow-red-700/20"
                >
                  {isDeletingComment ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
