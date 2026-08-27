import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getProductBySlug } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return product ? { title: product.name_th, description: product.description_th } : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  return <ProductDetail product={product} locale="th" />;
}
