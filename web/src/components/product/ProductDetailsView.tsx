"use client";

import React, { useState, use, useMemo } from "react";
import { shopProducts } from "@/data/products";
import { Star, Heart, ShoppingBag, ArrowLeft, Check, Truck, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function ProductDetailsView({ params }: PageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  // Retrieve Product
  const product = useMemo(() => {
    return shopProducts.find((p) => p.id === productId);
  }, [productId]);

  if (!product) {
    notFound();
  }

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedGrind, setSelectedGrind] = useState("Whole Bean");
  const [activeTab, setActiveTab] = useState<"details" | "brewing" | "shipping">("details");

  // Reviews states
  const [reviewsList, setReviewsList] = useState(product.reviews);
  const [newComment, setNewComment] = useState("");
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const wishlist = useCartStore((state) => state.wishlist);
  const addItem = useCartStore((state) => state.addItem);

  const isFavorited = wishlist.includes(product.id);
  const isBeans = product.category === "Coffee Beans";

  // Calculations for related products
  const relatedProducts = useMemo(() => {
    return shopProducts.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);
  }, [product]);

  const handleAddToCart = () => {
    const selectedOption = isBeans ? selectedGrind : undefined;
    addItem({
      id: `${product.id}-${selectedOption || "default"}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: "Shop",
      selectedOption: selectedOption,
      quantity: quantity,
    });
    setQuantity(1);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && newName.trim()) {
      const addedReview = {
        id: `mock-r-${Date.now()}`,
        user: newName,
        rating: newRating,
        date: "Today",
        comment: newComment,
      };
      setReviewsList([addedReview, ...reviewsList]);
      setNewName("");
      setNewComment("");
      setNewRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 5000);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0B0B0B] py-16 md:py-24 text-[#F5F5F0]">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          
          {/* Back Button */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 type-ui text-zinc-500 hover:text-white mb-10 transition-colors"
          >
            <ArrowLeft size={14} className="text-brand-gold" />
            Back to Boutique
          </Link>

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Product Images */}
            <div className="space-y-4">
              {/* Main Preview Container */}
              <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-white/5 bg-[#141414] group">
                <img
                  src={product.images[activeImageIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                
                {/* Image overlay badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="type-ui rounded bg-brand-gold/90 px-2.5 py-0.5 text-black">
                    {product.category}
                  </span>
                  {product.origin && (
                    <span className="type-ui rounded bg-black/70 border border-white/10 px-2.5 py-0.5 text-brand-gold">
                      {product.origin}
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails grid */}
              {product.images.length > 1 && (
                <div className="flex gap-4">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative h-20 w-20 overflow-hidden rounded-xl border transition-all ${
                        activeImageIdx === idx ? "border-brand-gold" : "border-white/5 hover:border-white/20"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details Panel */}
            <div className="space-y-8">
              <div>
                <h1 className="type-h2 text-white leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-6 mt-4 border-b border-white/5 pb-4">
                  <span className="type-h3 text-brand-gold">
                    ${product.price.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1.5 border-l border-white/10 pl-6">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(product.rating) ? "fill-brand-gold text-brand-gold" : "text-zinc-600"}
                        />
                      ))}
                    </div>
                    <span className="type-body-sm font-medium text-zinc-300">{product.rating}</span>
                    <span className="type-caption text-zinc-500">({reviewsList.length} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="type-body text-zinc-400">
                {product.description}
              </p>

              {/* Grind Selector (Only for Coffee Beans) */}
              {isBeans && (
                <div className="space-y-3">
                  <span className="block type-label text-zinc-400">Grind Options</span>
                  <div className="flex flex-wrap gap-2">
                    {["Whole Bean", "Drip / Filter", "Espresso Fine", "Cold Brew Coarse"].map((grind) => (
                      <button
                        key={grind}
                        onClick={() => setSelectedGrind(grind)}
                        className={`rounded-full px-4 py-2 type-label border transition-all ${
                          selectedGrind === grind
                            ? "bg-brand-gold border-brand-gold text-black shadow"
                            : "bg-[#141414] border-white/5 text-zinc-400 hover:border-brand-gold/50"
                        }`}
                      >
                        {grind}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Counter & Add Buttons */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                {/* Counter */}
                <div className="flex items-center rounded-full border border-white/10 bg-black/40 px-3 py-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="type-qty-btn px-2 text-zinc-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="w-8 text-center type-body-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="type-qty-btn px-2 text-zinc-400 hover:text-white"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-brand-gold px-8 py-3.5 type-ui text-black hover:bg-brand-gold-hover transition-all gold-glow active:scale-95 shadow-md"
                >
                  <ShoppingBag size={16} />
                  Add to Cart
                </button>

                {/* Favorite */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`rounded-full border p-3.5 transition-all ${
                    isFavorited
                      ? "bg-red-500/10 border-red-500/30 text-red-500"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Heart size={16} className={isFavorited ? "fill-red-500" : ""} />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 type-caption text-zinc-500 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-brand-gold shrink-0" />
                  <span>Complimentary shipping on orders over $75.</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-brand-gold shrink-0" />
                  <span>Secure 256-bit SSL encrypted credit card payments.</span>
                </div>
              </div>

            </div>
          </div>

          {/* Tabs Section: Product Specs, Sourcing, Shipping */}
          <div className="mt-20 border-b border-white/5">
            <div className="flex gap-8 type-label text-zinc-500">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-4 border-b transition-colors ${activeTab === "details" ? "border-brand-gold text-white" : "hover:text-white"}`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab("brewing")}
                className={`pb-4 border-b transition-colors ${activeTab === "brewing" ? "border-brand-gold text-white" : "hover:text-white"}`}
              >
                Brewing Guide
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`pb-4 border-b transition-colors ${activeTab === "shipping" ? "border-brand-gold text-white" : "hover:text-white"}`}
              >
                Delivery & Sourcing
              </button>
            </div>

            <div className="py-8 type-body text-zinc-400 max-w-3xl">
              {activeTab === "details" && (
                <div className="space-y-4">
                  <p>Our boutique accessories are hand-selected to fit the coffee ceremony aesthetic. Each piece undergoes high-quality heat testing, and matches the charcoal and gold motifs of our global salons.</p>
                  <ul className="space-y-2 text-zinc-300">
                    {product.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check size={14} className="text-brand-gold" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {activeTab === "brewing" && (
                <div className="space-y-3">
                  <h4 className="type-label text-white">The V60 Ritual Recommendation</h4>
                  <p>1. Grind 15g of L&apos;OR NOIR Reserve beans to a medium consistency (similar to sea salt).</p>
                  <p>2. Heat 250ml of carbon-filtered water to precisely 93°C (200°F).</p>
                  <p>3. Wet the filter paper and pre-warm your charcoal ceramic mug, discarding water.</p>
                  <p>4. Add grounds and bloom with 40g water for 45 seconds to release natural jasmine volatiles.</p>
                  <p>5. Pour in slow, spiraling circles, completing the brew at 2 minutes and 45 seconds.</p>
                </div>
              )}
              {activeTab === "shipping" && (
                <p>We source our coffee beans directly from ethical family farms, paying 80% above standard Fair Trade pricing to ensure sustainable farming practices. Bags are flushed with nitrogen to seal peak freshness. Accessory items are packed in custom L&apos;OR NOIR boxes with protective silk foam and ship within 24 hours of ordering.</p>
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Left: Summary and Leave Review */}
            <div className="space-y-6">
              <h3 className="type-h2 text-white">Guest Reviews</h3>
              
              {/* Form */}
              <form onSubmit={handleAddReview} className="rounded-xl border border-white/5 bg-[#141414] p-6 space-y-4">
                <span className="block type-label text-brand-gold">Share Your Ceremony</span>
                
                {reviewSuccess && (
                  <div className="rounded border border-green-500/20 bg-green-500/10 p-3 type-success text-green-400 flex items-center gap-2">
                    <Check size={16} />
                    <span>Review submitted. Thank you.</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="type-label block">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Guest Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="type-label block">Salon Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setNewRating(stars)}
                        className="text-zinc-500 hover:scale-110 transition-transform"
                      >
                        <Star size={16} className={stars <= newRating ? "fill-brand-gold text-brand-gold" : ""} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="type-label block">Comment</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share your sensory experience..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full rounded border border-white/10 bg-[#181818] p-2.5 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-brand-gold py-2 type-ui text-black hover:bg-brand-gold-hover transition-colors"
                >
                  Submit Review
                </button>
              </form>
            </div>

            {/* Right: Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {reviewsList.length === 0 ? (
                <div className="text-zinc-500 italic type-body-sm py-8">Be the first to review this premium offering.</div>
              ) : (
                reviewsList.map((rev) => (
                  <div key={rev.id} className="border-b border-white/5 pb-6 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="type-label text-white">{rev.user}</span>
                        <span className="type-caption text-zinc-500">— {rev.date}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < rev.rating ? "fill-brand-gold text-brand-gold" : "text-zinc-700"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="type-body-sm text-zinc-400 mt-2 font-sans leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-24 border-t border-white/5 pt-16">
              <h3 className="type-h2 text-white mb-10">Boutique Pairings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {relatedProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="group rounded-xl border border-white/5 bg-[#141414] p-4 transition-all hover:border-brand-gold/30"
                  >
                    <div className="relative h-48 w-full overflow-hidden rounded-lg bg-zinc-900 mb-4">
                      <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <span className="type-eyebrow">{p.category}</span>
                    <h4 className="type-card-title text-white mt-1 group-hover:text-brand-gold transition-colors truncate">{p.name}</h4>
                    <span className="type-body-sm text-zinc-400 font-semibold block mt-1">${p.price.toFixed(2)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
