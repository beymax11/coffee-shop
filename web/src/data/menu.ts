import { MenuItem } from "@/types";

export const menuItems: MenuItem[] = [
  // Hot Coffee
  {
    id: "m-espresso-classico",
    name: "Espresso Classico",
    description: "Double shot of our signature single-origin Ethiopian roast. Intensely rich with notes of dark cacao and wild jasmine.",
    price: 6.5,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1510701175591-1fdc47e71604?q=80&w=600&auto=format&fit=crop",
    category: "Hot Coffee",
    tags: ["Classic", "Single Origin"],
    notes: "Best enjoyed neat, accompanied by carbonated water."
  },
  {
    id: "m-gold-flake-latte",
    name: "Gold Leaf Latté",
    description: "Double espresso pulled over steamed organic macadamia milk, infused with Madagascar vanilla bean and crowned with 24k edible gold leaf.",
    price: 12.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop",
    category: "Hot Coffee",
    tags: ["Signature", "Best Seller"],
    notes: "Pair with our Gold Leaf Croissant."
  },
  {
    id: "m-smoke-caramel-macchiato",
    name: "Smoked Oak Macchiato",
    description: "Bold espresso layered with house-made salted caramel and steamed milk, cold-smoked with oak chips for a rich, campfire aroma.",
    price: 8.5,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop",
    category: "Hot Coffee",
    tags: ["Signature"],
    notes: "A complex balance of sweet, salty, and earthy smoke."
  },

  // Cold Coffee
  {
    id: "m-obsidian-cold-brew",
    name: "Obsidian Nitro Cold Brew",
    description: "Slow-steeped for 24 hours, nitrogen-infused for a velvety, stout-like head. Creamy, sweet notes with zero acidity.",
    price: 7.5,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop",
    category: "Cold Coffee",
    tags: ["Nitro", "Refreshing"],
    notes: "Served without ice to preserve the creamy cascading head."
  },
  {
    id: "m-espresso-tonic-rose",
    name: "Rose Quartz Espresso Tonic",
    description: "Chilled premium tonic water and organic rose water syrup, layered with a double shot of bright, citrusy espresso over spherical ice.",
    price: 9.0,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?q=80&w=600&auto=format&fit=crop",
    category: "Cold Coffee",
    tags: ["Signature", "New"],
    notes: "Garnished with dehydrated organic rose petals."
  },

  // Signature Drinks
  {
    id: "m-the-elixir-gold",
    name: "Antonioni Golden Elixir",
    description: "Slow-drip Kyoto cold brew combined with saffron-infused honey, dark amber maple, and a splash of oat milk. Finished with a gold luster dust.",
    price: 14.5,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=600&auto=format&fit=crop",
    category: "Signature Drinks",
    tags: ["Exclusive", "Award Winner"],
    notes: "Limited to 20 servings per day."
  },
  {
    id: "m-truffle-espresso-martini",
    name: "Black Truffle Espresso Mocktail",
    description: "Zero-proof dark rum and cold brew concentrate shaken with black truffle honey, egg whites, and finished with shaved Perigord truffle.",
    price: 15.0,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=600&auto=format&fit=crop",
    category: "Signature Drinks",
    tags: ["Exclusive", "Premium"],
    notes: "Rich, umami, and sophisticated."
  },
  {
    id: "m-la-notte-shakerato",
    name: "La Notte Espresso Shakerato",
    description: "Double shot of single-origin Panama Geisha espresso shaken with wild orange blossom honey and fresh rosemary essence, served over hand-cut ice spheres.",
    price: 13.5,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
    category: "Signature Drinks",
    tags: ["Cinematic", "Exclusive"],
    notes: "Inspired by Antonioni's masterpiece. Clean, bittersweet, and visually striking."
  },

  // Non-Coffee
  {
    id: "m-ceremonial-matcha-lavender",
    name: "Ceremonial Matcha Lavender Latté",
    description: "Stone-ground Uji matcha whisked with lavender-infused blossom honey and organic oat milk. Serene, botanical, and creamy.",
    price: 8.5,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop",
    category: "Non-Coffee",
    tags: ["Ceremonial Grade", "Best Seller"],
    notes: "Rich in L-theanine for sustained, calm focus."
  },
  {
    id: "m-white-truffle-cocoa",
    name: "White Truffle Hot Chocolate",
    description: "Melted single-origin Ecuadorian white chocolate, organic milk, and a delicate hint of white truffle oil. Luxuriously thick.",
    price: 9.5,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=600&auto=format&fit=crop",
    category: "Non-Coffee",
    tags: ["Indulgent", "New"],
    notes: "Served with a roasted house-made gold marshmallow."
  },

  // Pastries
  {
    id: "m-gold-leaf-croissant",
    name: "Madagascar Vanilla Gold Croissant",
    description: "81-layer butter croissant filled with organic Madagascar bourbon vanilla bean custard, glazed with gold syrup and topped with 24k gold leaf flakes.",
    price: 8.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop",
    category: "Pastries",
    tags: ["Artisanal", "Best Seller"],
    notes: "Baked fresh hourly by our executive pastry chef."
  },
  {
    id: "m-pistachio-truffle-danish",
    name: "Pistachio Truffle Pain au Chocolat",
    description: "Flaky chocolate pastry filled with roasted Bronte pistachio praline and a touch of black truffle honey. Elegant sweet-savory balance.",
    price: 9.5,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=600&auto=format&fit=crop",
    category: "Pastries",
    tags: ["Signature"],
    notes: "Contains nuts."
  },

  // Desserts
  {
    id: "m-grand-cru-tart",
    name: "Grand Cru Ganache Tart",
    description: "Valrhona 72% dark chocolate ganache, crisp charcoal pastry shell, fleur de sel, and edible gold dust. Rich and bittersweet.",
    price: 11.0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop",
    category: "Desserts",
    tags: ["Exclusive"],
    notes: "Perfect pairing with Espresso Classico."
  },
  {
    id: "m-saffron-creme-brulee",
    name: "Saffron Cardamom Crème Brûlée",
    description: "Velvety custard infused with premium Kashmiri saffron and organic cardamom pods, finished with a glass-like caramelized sugar crust.",
    price: 12.5,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?q=80&w=600&auto=format&fit=crop",
    category: "Desserts",
    tags: ["New"],
    notes: "Gluten free."
  }
];
