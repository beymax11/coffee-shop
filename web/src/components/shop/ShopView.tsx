"use client";

import React, { useState, useMemo } from "react";
import { shopProducts } from "@/data/products";
import { Star, Heart, ShoppingBag, Eye, Search } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { QuickViewModal } from "@/components/shared/QuickViewModal";
import { FadeUp, StaggerContainer, StaggerItem, PageTransition } from "@/components/animations";
import { Product } from "@/types";
import Link from "next/link";

export function ShopView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const wishlist = useCartStore((state) => state.wishlist);
  const addItem = useCartStore((state) => state.addItem);

  const categories = ["All", "Coffee Beans", "Coffee Accessories", "Merchandise"];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return shopProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    const isBeans = product.category === "Coffee Beans";
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: "Shop",
      selectedOption: isBeans ? "Whole Bean" : undefined,
      quantity: 1,
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0B0B0B] py-16 md:py-24 text-[#F5F5F0]">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          
          {/* Header Title */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="type-eyebrow">L'OR NOIR Boutique</span>
            <h1 className="type-h1 text-white mt-2">
              The Boutique Roastery
            </h1>
            <div className="h-[1px] w-12 bg-brand-gold mx-auto mt-4" />
            <p className="type-body text-zinc-400 mt-4">
              Bring the luxury ritual home. Purchase single-origin reserve beans, hand-crafted clay ceramics, and custom lifestyle apparel.
            </p>
          </div>

          {/* Search & Filters Grid */}
          <div className="space-y-8 mb-12">
            {/* Search Input */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="Search reserve beans, apparel, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-[#141414] py-3 pl-12 pr-6 type-field text-[#F5F5F0] outline-none focus:border-brand-gold/60 transition-all placeholder:text-zinc-600 shadow-md"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-5 py-2.5 type-ui border transition-all ${
                    selectedCategory === category
                      ? "bg-brand-gold border-brand-gold text-black shadow-md gold-glow"
                      : "bg-[#141414] border-white/5 text-zinc-400 hover:text-white hover:border-brand-gold/30"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="type-body-sm text-zinc-500 font-medium">No products found matching your search.</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="mt-4 type-ui text-brand-gold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Boutique Grid */
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => {
                const isFavorited = wishlist.includes(product.id);
                return (
                  <StaggerItem
                    key={product.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-[#141414] p-4 transition-all hover:border-brand-gold/30 hover:bg-[#181818] gold-glow-hover"
                  >
                    {/* Item Image with controls */}
                    <div className="relative h-72 w-full overflow-hidden rounded-xl bg-zinc-900 mb-6">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                      
                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleQuickView(product)}
                          className="rounded-full bg-white text-black p-3 hover:scale-110 active:scale-95 transition-all shadow"
                          title="Quick Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="rounded-full bg-brand-gold text-black p-3 hover:scale-110 active:scale-95 transition-all shadow"
                          title="Add to Cart"
                        >
                          <ShoppingBag size={16} />
                        </button>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3 right-3 rounded-full border p-2 transition-all backdrop-blur bg-black/40 ${
                          isFavorited
                            ? "border-red-500/20 text-red-500"
                            : "border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Heart size={14} className={isFavorited ? "fill-red-500" : ""} />
                      </button>

                      {/* Out of Stock Alert */}
                      {product.stock <= 5 && (
                        <span className="absolute bottom-3 left-3 bg-red-500/95 border border-red-400/20 text-white type-ui px-2 py-0.5 rounded">
                          Only {product.stock} Left
                        </span>
                      )}
                    </div>

                    {/* Details Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="type-eyebrow">
                            {product.category}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <Star size={12} className="fill-brand-gold text-brand-gold" />
                            <span className="type-caption font-medium text-zinc-300">{product.rating}</span>
                          </div>
                        </div>

                        {/* Title link to product details */}
                        <Link href={`/product/${product.id}`} className="block mt-2">
                          <h3 className="type-card-title font-bold text-white group-hover:text-brand-gold transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <p className="type-body-sm text-zinc-400 mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                        <span className="type-price text-brand-gold">
                          ${product.price.toFixed(2)}
                        </span>
                        
                        <Link
                          href={`/product/${product.id}`}
                          className="type-ui text-zinc-400 hover:text-white flex items-center gap-1.5 transition-all"
                        >
                          View Details
                          <ArrowRightIcon size={12} className="text-brand-gold" />
                        </Link>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickViewModal
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          item={selectedProduct}
        />
      )}
    </PageTransition>
  );

  // Helper local component for icon
  function ArrowRightIcon(props: any) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    );
  }
}
