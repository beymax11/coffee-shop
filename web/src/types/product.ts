export interface Review {
  id: string;
  user: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  images: string[];
  category: "Merchandise" | "Coffee Beans" | "Coffee Accessories";
  details: string[];
  stock: number;
  reviews: Review[];
  roastLevel?: "Light" | "Medium" | "Medium-Dark" | "Dark";
  origin?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: "Menu" | "Shop";
  selectedOption?: string;
}
