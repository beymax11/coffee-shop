export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price?: number | null;
  hot?: number | null;
  modest?: number | null;
  grand?: number | null;
  rating: number;
  image: string;
  category: string;
  tags?: string[];
  notes?: string;
}
