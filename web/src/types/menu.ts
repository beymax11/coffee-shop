export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  category: "Hot Coffee" | "Cold Coffee" | "Signature Drinks" | "Non-Coffee" | "Pastries" | "Desserts";
  tags?: string[];
  notes?: string;
}
