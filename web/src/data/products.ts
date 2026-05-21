import { Product } from "@/types";

export const shopProducts: Product[] = [
  {
    id: "s-obsidian-tumbler",
    name: "Obsidian Thermal Tumbler",
    description: "Double-walled matte black stainless steel thermal tumbler. Retains heat for 12 hours and keeps drinks cold for 24 hours. Engraved with our gold monogram.",
    price: 48.0,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=600&auto=format&fit=crop"
    ],
    category: "Merchandise",
    details: [
      "500ml capacity",
      "18/8 food-grade stainless steel",
      "Leak-proof magnetic cap",
      "BPA-free and condensation-free coating"
    ],
    stock: 14,
    reviews: [
      {
        id: "r1",
        user: "Alexander V.",
        rating: 5,
        date: "May 12, 2026",
        comment: "The finish is absolutely stunning. Keeps my espresso macchiato piping hot during my morning commute."
      },
      {
        id: "r2",
        user: "Sophia K.",
        rating: 4,
        date: "April 28, 2026",
        comment: "Beautiful minimalist design, though it requires hand-washing to protect the gold monogram logo."
      }
    ]
  },
  {
    id: "s-leather-tote",
    name: "L'OR NOIR Leather Tote",
    description: "Handcrafted from full-grain Italian pebble leather. Structured silhouette, reinforced base, brass hardware, and dedicated compartments for your laptop and thermal tumbler.",
    price: 185.0,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop"
    ],
    category: "Merchandise",
    details: [
      "100% full-grain Italian leather",
      "Soft beige suede lining",
      "Fits up to 16-inch laptops",
      "Reinforced double handles with 10-inch drop"
    ],
    stock: 5,
    reviews: [
      {
        id: "r3",
        user: "Marcus L.",
        rating: 5,
        date: "May 02, 2026",
        comment: "An investment piece. The smell of the leather and the gold stitching is exquisite. Easily holds my laptop and files."
      }
    ]
  },
  {
    id: "s-ritual-apron",
    name: "The Roaster's Canvas Apron",
    description: "Premium heavy-duty waxed utility apron. Designed for professional baristas and roasters, featuring genuine leather straps, brass buckles, and multiple tool pockets.",
    price: 65.0,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600&auto=format&fit=crop"
    ],
    category: "Merchandise",
    details: [
      "16oz water-resistant waxed canvas",
      "Detachable cross-back leather harness",
      "Reinforced double stitching",
      "Adjustable unisex sizing"
    ],
    stock: 12,
    reviews: []
  },
  {
    id: "s-ceramic-mug",
    name: "Matte Charcoal Ceramic Mug",
    description: "Individually hand-thrown ceramic mug with a rough charcoal-textured exterior and a smooth, glossy amber-gold interior glaze. Heat-retaining clay.",
    price: 28.0,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?q=80&w=600&auto=format&fit=crop"
    ],
    category: "Coffee Accessories",
    details: [
      "320ml capacity",
      "Lead-free food-safe glaze",
      "Thick heat-retaining walls",
      "Dishwasher and microwave safe"
    ],
    stock: 22,
    reviews: [
      {
        id: "r4",
        user: "Clara M.",
        rating: 5,
        date: "May 15, 2026",
        comment: "Each mug is slightly different. The gold glaze inside reflects the light from the coffee beautifully. A true ritual cup."
      }
    ]
  },
  {
    id: "s-geisha-beans",
    name: "Panama Geisha Signature Reserve (250g)",
    description: "The crown jewel of our roastery. Microlot Geisha coffee beans from Boquete, Panama. Extremely complex profile featuring bright floral aromas, jasmine, peach nectar, and a clean bergamot finish.",
    price: 75.0,
    rating: 5.0,
    images: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610631780796-a1400bf1b3a6?q=80&w=600&auto=format&fit=crop"
    ],
    category: "Coffee Beans",
    details: [
      "Origin: Boquete, Panama (1,850m elevation)",
      "Process: Natural Anaerobic Slow Dry",
      "Roast Profile: Light (Preserves delicate florals)",
      "Optimal brewing: Pour-over (V60 or Chemex)"
    ],
    stock: 8,
    roastLevel: "Light",
    origin: "Boquete, Panama",
    reviews: [
      {
        id: "r5",
        user: "Hiroshi T.",
        rating: 5,
        date: "May 19, 2026",
        comment: "Spectacular jasmine aroma. Tastes like a mixture of early harvest tea and peach honey. Unparalleled cup."
      }
    ]
  },
  {
    id: "s-espresso-blend",
    name: "Nero Espresso Reserve (500g)",
    description: "Our signature house blend, used daily in all L'OR NOIR cafes. A bold, luxurious blend of washed Colombian and natural Brazilian beans. Yields an exceptionally heavy body and thick hazelnut crema.",
    price: 32.0,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1580933079451-9548b3211ac8?q=80&w=600&auto=format&fit=crop"
    ],
    category: "Coffee Beans",
    details: [
      "Origin: 60% Colombia Excelso, 40% Brazil Cerrado",
      "Process: Washed & Natural",
      "Roast Profile: Medium-Dark",
      "Notes: Dark chocolate, toasted almond, burnt sugar"
    ],
    stock: 45,
    roastLevel: "Medium-Dark",
    origin: "Colombia & Brazil",
    reviews: [
      {
        id: "r6",
        user: "Julien P.",
        rating: 5,
        date: "May 10, 2026",
        comment: "Very forgiving blend for home espresso machines. Extremely syrupy with a deep chocolate finish that cuts through milk."
      }
    ]
  },
  {
    id: "s-brewer-kit",
    name: "Traveler's V60 Gold Drip Kit",
    description: "Everything you need for the perfect pour-over, housed in a custom padded black saffiano leather travel case. Includes a gold-plated stainless steel cone dripper, double-walled glass server, and a hand grinder.",
    price: 145.0,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1542181961-9590d0c79dab?q=80&w=600&auto=format&fit=crop"
    ],
    category: "Coffee Accessories",
    details: [
      "Gold-plated food-grade V02 dripper",
      "Premium precision steel-burr manual grinder",
      "360ml double-walled borosilicate glass server",
      "Luxury saffiano leather travel case"
    ],
    stock: 4,
    reviews: []
  }
];
