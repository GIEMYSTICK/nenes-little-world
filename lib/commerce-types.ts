export type Locale = "th" | "en";

export type ProductCondition = "new" | "like_new" | "good" | "fair";

export type Product = {
  id: string;
  slug: string;
  name_th: string;
  name_en: string;
  description_th: string;
  description_en: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  sku: string | null;
  stock_quantity: number;
  condition: ProductCondition;
  brand: string | null;
  featured: boolean;
  status: "draft" | "active" | "sold" | "out_of_stock";
  category_id: string | null;
  category?: { name_th: string; name_en: string; slug: string } | null;
  product_images?: Array<{ id: string; url: string; alt_th: string | null; alt_en: string | null; sort_order: number }>;
  created_at?: string;
};

export type Category = {
  id: string;
  slug: string;
  name_th: string;
  name_en: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

export type AdminOverview = {
  products: Product[];
  categories: Category[];
  orders: Array<Record<string, unknown>>;
  consignments: Array<Record<string, unknown>>;
  content: Array<Record<string, unknown>>;
  counts: { products: number; orders: number; consignments: number; revenue: number };
};
