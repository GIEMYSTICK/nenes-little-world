import { unstable_noStore as noStore } from "next/cache";
import { createPublicSupabase } from "@/lib/supabase";
import type { Category, Product } from "@/lib/commerce-types";

export async function getSiteContent(contentKey: string, locale: "th" | "en") {
  noStore();
  const supabase = createPublicSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from("site_content").select("title,body,payload").eq("content_key", contentKey).eq("locale", locale).eq("is_published", true).maybeSingle();
  if (error) { console.error("Content query failed", error.message); return null; }
  return data;
}

export async function getCatalog(): Promise<{ products: Product[]; categories: Category[]; configured: boolean }> {
  noStore();
  const supabase = createPublicSupabase();
  if (!supabase) return { products: [], categories: [], configured: false };

  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(name_th,name_en,slug), product_images(id,url,alt_th,alt_en,sort_order)")
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  if (productsResult.error || categoriesResult.error) {
    console.error("Catalog query failed", productsResult.error?.message || categoriesResult.error?.message);
    return { products: [], categories: [], configured: true };
  }

  const products = ((productsResult.data ?? []) as Product[]).map((product) => ({
    ...product,
    product_images: [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  }));
  return { products, categories: (categoriesResult.data ?? []) as Category[], configured: true };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  noStore();
  const supabase = createPublicSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(name_th,name_en,slug), product_images(id,url,alt_th,alt_en,sort_order)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error) {
    console.error("Product query failed", error.message);
    return null;
  }
  if (!data) return null;
  const product = data as Product;
  return {
    ...product,
    product_images: [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  };
}
