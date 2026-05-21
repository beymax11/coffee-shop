import { shopProducts } from "@/data/products";
import { Product } from "@/types";

export class ProductService {
  /**
   * Finds a specific product by its unique ID.
   */
  static getProductById(id: string): Product | undefined {
    return shopProducts.find((product) => product.id === id);
  }

  /**
   * Retrieves products, optionally filtered by category.
   */
  static getProducts(category?: Product["category"] | "All"): Product[] {
    if (!category || category === "All") {
      return shopProducts;
    }
    return shopProducts.filter((product) => product.category === category);
  }

  /**
   * Fetches merchandise or bean pairings excluding the current active product ID.
   */
  static getRelatedProducts(product: Product, limit = 3): Product[] {
    return shopProducts
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, limit);
  }

  /**
   * Conducts a keyword search across name and description fields.
   */
  static searchProducts(query: string): Product[] {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return shopProducts;

    return shopProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(cleanQuery) ||
        p.description.toLowerCase().includes(cleanQuery)
    );
  }
}
