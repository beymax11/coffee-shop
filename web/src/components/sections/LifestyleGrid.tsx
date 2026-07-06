"use client";

import React, { useState, useEffect } from "react";
import { FadeUp } from "@/components/animations";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ExternalLink 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom SVG Instagram Icon to ensure compatibility across all environments
const InstagramIcon: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface Comment {
  id: number;
  username: string;
  text: string;
  time: string;
}

interface Post {
  id: number;
  imageUrl: string;
  username: string;
  likes: number;
  commentsCount: number;
  caption: string;
  time: string;
  comments: Comment[];
  location: string;
}

// Curated Instagram-style Lifestyle Posts representing the Antonioni Grounds theme
const LIFESTYLE_POSTS: Post[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop",
    username: "caffeine.journal",
    likes: 432,
    commentsCount: 3,
    caption: "Morning rituals at Antonioni Grounds. That golden hour sunlight hitting the perfect brew. ☕️✨ #antonionilifestyle #coffeeaesthetic #morningglow",
    time: "2 hours ago",
    location: "Antonioni Grounds • Tokyo",
    comments: [
      { id: 1, username: "espresso.chaser", text: "This lighting is absolutely gorgeous! 😍", time: "1h ago" },
      { id: 2, username: "brew_master", text: "Is that the Panama Geisha?", time: "45m ago" },
      { id: 3, username: "antonioni_grounds", text: "It is! Sourced directly from Boquete estate.", time: "30m ago" },
    ]
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=600&auto=format&fit=crop",
    username: "espresso_aficionado",
    likes: 198,
    commentsCount: 2,
    caption: "First crack micro-lots. The craftsmanship here is unmatched. You can taste the strawberry notes immediately. 🍓☕️ #craftcoffee #specialtycoffee",
    time: "5 hours ago",
    location: "Antonioni HQ • Brooklyn",
    comments: [
      { id: 1, username: "bean_selector", text: "Light roast is the way to go.", time: "4h ago" },
      { id: 2, username: "coffeelover_ny", text: "Heading to Brooklyn headquarters tomorrow!", time: "2h ago" },
    ]
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
    username: "tokyo.coffee.guide",
    likes: 312,
    commentsCount: 2,
    caption: "Found my new favorite coffee sanctuary. Japanese minimalism meets Brooklyn roasting. 🇯🇵🇺🇸 Absolute peace. #tokyocafe #minimalism #coffeeplease",
    time: "1 day ago",
    location: "Antonioni Grounds • Tokyo",
    comments: [
      { id: 1, username: "travel_eats", text: "Adding this to my itinerary for next month!", time: "18h ago" },
      { id: 2, username: "minimalist_vibes", text: "That interior is so soothing.", time: "12h ago" },
    ]
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=600&auto=format&fit=crop",
    username: "barista.artisan",
    likes: 285,
    commentsCount: 2,
    caption: "Golden extraction. Water temperature at exactly 92°C for that crisp fruit sweetness. Precision makes perfection. 🌡️☕️ #baristalife #espresso #extraction",
    time: "2 days ago",
    location: "Antonioni Grounds • NY",
    comments: [
      { id: 1, username: "extraction_nerd", text: "What brew ratio are you running here?", time: "1d ago" },
      { id: 2, username: "barista.artisan", text: "1:16 ratio, perfect balance.", time: "1d ago" },
    ]
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600&auto=format&fit=crop",
    username: "antonioni_grounds",
    likes: 512,
    commentsCount: 2,
    caption: "Slow drip chemistry. Witness the bloom of our Ethiopian heirloom microlot. Carbon dioxide escaping, unlocking floral aromatics. 🌸🧪 #dripcoffee #scentofcoffee",
    time: "3 days ago",
    location: "Antonioni Grounds • Paris",
    comments: [
      { id: 1, username: "fragrance_lover", text: "I can smell this photo! 🌸", time: "2d ago" },
      { id: 2, username: "syphon_brew", text: "Beautiful bloom capture.", time: "2d ago" },
    ]
  }
];

export const LifestyleGrid: React.FC = () => {
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [extraComments, setExtraComments] = useState<Record<number, Comment[]>>({});
  const [commentInput, setCommentInput] = useState("");
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);

  // Keyboard navigation for Lightbox modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPostIndex === null) return;
      if (e.key === "Escape") setSelectedPostIndex(null);
      if (e.key === "ArrowLeft") {
        const prevIdx = (selectedPostIndex - 1 + LIFESTYLE_POSTS.length) % LIFESTYLE_POSTS.length;
        setSelectedPostIndex(prevIdx);
        setCommentInput("");
      }
      if (e.key === "ArrowRight") {
        const nextIdx = (selectedPostIndex + 1) % LIFESTYLE_POSTS.length;
        setSelectedPostIndex(nextIdx);
        setCommentInput("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPostIndex]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPostIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPostIndex]);

  const handleLikeToggle = (postId: number) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = (postId: number) => {
    if (!commentInput.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      username: "visitor.guest",
      text: commentInput.trim(),
      time: "Just now"
    };
    setExtraComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    setCommentInput("");
  };

  const handleShare = (post: Post) => {
    const shareText = `Check out @${post.username}'s post at Antonioni Grounds: "${post.caption}"`;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2000);
    }).catch(err => {
      console.error("Could not copy link: ", err);
    });
  };

  const handlePrevPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPostIndex !== null) {
      const prevIdx = (selectedPostIndex - 1 + LIFESTYLE_POSTS.length) % LIFESTYLE_POSTS.length;
      setSelectedPostIndex(prevIdx);
      setCommentInput("");
    }
  };

  const handleNextPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPostIndex !== null) {
      const nextIdx = (selectedPostIndex + 1) % LIFESTYLE_POSTS.length;
      setSelectedPostIndex(nextIdx);
      setCommentInput("");
    }
  };

  return (
    <section className="py-24 bg-background border-t border-card-border transition-colors duration-500 relative overflow-hidden">
      {/* Dynamic Background accents */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-[#2E5A44]/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-[#2E5A44]/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="type-eyebrow">Social Curation</span>
          <h2 className="type-h2 text-foreground mt-2 font-serif">
            Antonioni Grounds Lifestyle
          </h2>
          <p className="type-caption text-zinc-500 dark:text-zinc-500 mt-2">
            Tag <span className="text-emerald-600 dark:text-emerald-400 font-bold">@antonioni_grounds</span> to be featured in our monthly selection.
          </p>
        </div>

        {/* Asymmetric Bento Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[1fr]">
          {LIFESTYLE_POSTS.map((post, idx) => {
            const isLarge = idx === 0;
            const commentsTotal = post.comments.length + (extraComments[post.id]?.length || 0);
            const displayLikes = post.likes + (likedPosts[post.id] ? 1 : 0);

            return (
              <FadeUp 
                key={post.id} 
                delay={idx * 0.08} 
                className={`${
                  isLarge 
                    ? "col-span-2 row-span-2 h-[350px] md:h-full min-h-[350px] md:min-h-[528px]" 
                    : "col-span-1 h-44 md:h-[252px]"
                } relative rounded-2xl overflow-hidden group border border-card-border shadow-md hover:shadow-xl transition-all duration-500 bg-neutral-900 cursor-pointer`}
              >
                <div className="w-full h-full" onClick={() => setSelectedPostIndex(idx)}>
                  <img
                    src={post.imageUrl}
                    alt={`Instagram Showcase ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  
                  {/* Premium Instagram-Style Hover Overlay */}
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] flex flex-col justify-between p-4 z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#2E5A44]/20 border border-[#2E5A44]/30 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
                          {post.username[0]}
                        </div>
                        <span className="text-[11px] font-bold text-white font-sans tracking-wide">
                          @{post.username}
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-400 font-sans">{post.time}</span>
                    </div>

                    {/* Middle Icon */}
                    <div className="flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 my-auto">
                      <div className="w-11 h-11 rounded-full border border-emerald-500/40 bg-black/40 flex items-center justify-center text-emerald-500">
                        <InstagramIcon size={18} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-[11px] text-zinc-200 line-clamp-2 leading-relaxed font-sans font-medium">
                        {post.caption}
                      </p>
                      
                      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-zinc-300">
                        <div className="flex items-center gap-3.5 text-[11px]">
                          <span className="flex items-center gap-1 font-semibold">
                            <Heart size={12} className={likedPosts[post.id] ? "fill-red-500 text-red-500" : ""} />
                            {displayLikes}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <MessageCircle size={12} />
                            {commentsTotal}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-bold flex items-center gap-0.5 hover:text-emerald-500 transition-colors">
                          View Post <ExternalLink size={9} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>

        {/* Brand Community Call-to-Action */}
        <FadeUp delay={0.4} className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8 rounded-2xl border border-card-border bg-background-alt/30 dark:bg-brand-charcoal/30 backdrop-blur-md max-w-2xl mx-auto w-full justify-between">
            <div className="text-left space-y-1">
              <p className="text-sm font-bold text-foreground font-serif">Join our digital café community</p>
              <p className="text-xs text-neutral-500 dark:text-zinc-500 font-sans">Share your coffee moments and stay in the loop.</p>
            </div>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2E5A44] to-[#234533] hover:from-[#234533] hover:to-[#2E5A44] text-white font-sans text-xs font-bold tracking-wider uppercase rounded-lg shadow-md hover:shadow-emerald-500/10 transition-all duration-300 shrink-0 cursor-pointer"
            >
              <InstagramIcon size={14} /> Follow @antonioni_grounds
            </a>
          </div>
        </FadeUp>
      </div>

      {/* Lightbox Modal Component */}
      <AnimatePresence>
        {selectedPostIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            onClick={() => setSelectedPostIndex(null)}
          >
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-w-5xl h-[85vh] md:h-[75vh] bg-card border border-card-border rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous / Next Arrows for Desktop */}
              <button 
                onClick={handlePrevPost}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-black/75 hover:border-emerald-500 transition-all z-20 cursor-pointer hidden md:flex"
                aria-label="Previous Post"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextPost}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-black/75 hover:border-emerald-500 transition-all z-20 cursor-pointer hidden md:flex"
                aria-label="Next Post"
              >
                <ChevronRight size={20} />
              </button>

              {/* Close Button */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={() => setSelectedPostIndex(null)}
                  className="w-8 h-8 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center hover:bg-black/70 hover:text-emerald-500 transition-all cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Left Column: Post Image (60% width on Desktop) */}
              <div className="relative w-full md:w-3/5 h-[40%] md:h-full bg-neutral-950 flex items-center justify-center select-none overflow-hidden">
                <img 
                  src={LIFESTYLE_POSTS[selectedPostIndex].imageUrl} 
                  alt={`Antonioni Grounds Showcase detail`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-white/70 text-[9px] tracking-widest uppercase font-sans pointer-events-none">
                  Antonioni Grounds Community
                </div>
              </div>

              {/* Right Column: Post Details & Conversation (40% width on Desktop) */}
              <div className="w-full md:w-2/5 h-[60%] md:h-full flex flex-col justify-between bg-card text-foreground">
                
                {/* User Header */}
                <div className="p-4 border-b border-card-border flex items-center gap-3 shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[#2E5A44]/15 border border-[#2E5A44]/20 flex items-center justify-center text-sm font-bold text-[#2E5A44] dark:text-emerald-400 uppercase font-sans">
                    {LIFESTYLE_POSTS[selectedPostIndex].username[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold font-sans">@{LIFESTYLE_POSTS[selectedPostIndex].username}</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#2E5A44] text-white flex items-center justify-center text-[7px] font-bold">✓</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans">{LIFESTYLE_POSTS[selectedPostIndex].location}</span>
                  </div>
                </div>

                {/* Comments & Caption Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
                  {/* Origin Caption */}
                  <div className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-[#2E5A44]/10 border border-[#2E5A44]/20 flex items-center justify-center text-[10px] font-bold text-[#2E5A44] dark:text-emerald-400 shrink-0 uppercase font-sans">
                      {LIFESTYLE_POSTS[selectedPostIndex].username[0]}
                    </div>
                    <div className="space-y-1">
                      <p className="leading-relaxed">
                        <span className="font-bold mr-1.5 font-sans">@{LIFESTYLE_POSTS[selectedPostIndex].username}</span>
                        {LIFESTYLE_POSTS[selectedPostIndex].caption}
                      </p>
                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-sans font-medium">
                        {LIFESTYLE_POSTS[selectedPostIndex].time}
                      </p>
                    </div>
                  </div>

                  <div className="h-[1px] bg-card-border" />

                  {/* Comment Thread */}
                  <div className="space-y-4">
                    {[
                      ...LIFESTYLE_POSTS[selectedPostIndex].comments,
                      ...(extraComments[LIFESTYLE_POSTS[selectedPostIndex].id] || [])
                    ].map((comment) => (
                      <div key={comment.id} className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-full bg-brand-charcoal border border-card-border flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-zinc-300 shrink-0 uppercase font-sans">
                          {comment.username.replace("@", "")[0]}
                        </div>
                        <div className="space-y-1">
                          <p className="leading-relaxed">
                            <span className="font-bold mr-1.5 font-sans">{comment.username}</span>
                            {comment.text}
                          </p>
                          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-sans font-medium">{comment.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Interaction Bar */}
                <div className="border-t border-card-border bg-background-alt/10 shrink-0">
                  {/* Actions */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-card-border">
                    <div className="flex items-center gap-4 text-foreground">
                      <button 
                        onClick={() => handleLikeToggle(LIFESTYLE_POSTS[selectedPostIndex!].id)}
                        className="hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Like post"
                      >
                        <Heart 
                          size={19} 
                          className={likedPosts[LIFESTYLE_POSTS[selectedPostIndex].id] ? "fill-red-500 text-red-500" : ""} 
                        />
                      </button>
                      <button className="hover:text-emerald-500 transition-colors" aria-label="Comment on post">
                        <MessageCircle size={19} />
                      </button>
                      <button 
                        onClick={() => handleShare(LIFESTYLE_POSTS[selectedPostIndex!])}
                        className="hover:text-emerald-500 transition-colors relative cursor-pointer"
                        aria-label="Share post"
                      >
                        {copiedPostId === LIFESTYLE_POSTS[selectedPostIndex].id ? (
                          <Check size={19} className="text-green-500" />
                        ) : (
                          <Share2 size={19} />
                        )}
                        <AnimatePresence>
                          {copiedPostId === LIFESTYLE_POSTS[selectedPostIndex].id && (
                            <motion.span 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-0.5 rounded shadow-md whitespace-nowrap font-sans font-bold"
                            >
                              Copied Info!
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </div>

                    <div className="text-right select-none font-sans">
                      <p className="text-xs font-bold text-foreground">
                        {LIFESTYLE_POSTS[selectedPostIndex].likes + (likedPosts[LIFESTYLE_POSTS[selectedPostIndex].id] ? 1 : 0)} likes
                      </p>
                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mt-0.5">
                        {LIFESTYLE_POSTS[selectedPostIndex].time}
                      </p>
                    </div>
                  </div>

                  {/* Comment Input */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddComment(LIFESTYLE_POSTS[selectedPostIndex!].id);
                    }}
                    className="p-3 flex items-center gap-2"
                  >
                    <input 
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="flex-1 bg-transparent border-0 outline-none text-xs text-foreground placeholder-neutral-400 py-1.5 px-2 font-sans"
                    />
                    <button 
                      type="submit"
                      disabled={!commentInput.trim()}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 disabled:opacity-40 hover:text-emerald-500 transition-colors px-2 cursor-pointer font-sans"
                    >
                      Post
                    </button>
                  </form>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
