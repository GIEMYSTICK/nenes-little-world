import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getProductBySlug } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return product ? { title: product.name_en, description: product.description_en } : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  return <ProductDetail product={product} locale="en" />;
}
