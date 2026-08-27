import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { service } = admin;
  await service.from("site_content").upsert([
    { content_key: "home_profile", locale: "th", title: "Hello, I'm Nene", body: "ภาพแนะนำตัวเนเน่บนหน้าแรก", payload: { image_url: "/images/nene-joy.png", image_path: "" } },
    { content_key: "home_chapter", locale: "th", title: "Our current little chapter", body: "ภาพอัปเดตการเติบโตของเนเน่ในบทปัจจุบัน", payload: { image_url: "/images/nene-one-month.jpeg", image_path: "" } },
    { content_key: "home_letter", locale: "th", title: "A Letter From Mom & Dad", body: "ภาพประกอบจดหมายจากพ่อและแม่", payload: { image_url: "/images/nene-smile.jpeg", image_path: "" } },
    { content_key: "home_profile", locale: "en", title: "Hello, I'm Nene", body: "Nene's introduction photo", payload: { image_url: "/images/nene-joy.png", image_path: "" } },
    { content_key: "home_chapter", locale: "en", title: "Our current little chapter", body: "Nene's latest growth photo", payload: { image_url: "/images/nene-one-month.jpeg", image_path: "" } },
    { content_key: "home_letter", locale: "en", title: "A Letter From Mom & Dad", body: "Photo beside the letter", payload: { image_url: "/images/nene-smile.jpeg", image_path: "" } },
  ], { onConflict: "content_key,locale", ignoreDuplicates: true });
  const [products, categories, orders, consignments, content] = await Promise.all([
    service.from("products").select("*, category:categories(name_th,name_en,slug), product_images(id,url,alt_th,alt_en,sort_order)").order("created_at", { ascending: false }),
    service.from("categories").select("*").order("sort_order"),
    service.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(50),
    service.from("consignment_submissions").select("*, category:categories(name_th,name_en)").order("created_at", { ascending: false }).limit(50),
    service.from("site_content").select("*").order("content_key").order("locale"),
  ]);
  const error = products.error || categories.error || orders.error || consignments.error || content.error;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  const paidOrders = (orders.data ?? []).filter((order) => ["paid", "processing", "shipped", "completed"].includes(order.status));
  return NextResponse.json({
    products: products.data ?? [], categories: categories.data ?? [], orders: orders.data ?? [], consignments: consignments.data ?? [], content: content.data ?? [],
    counts: { products: products.data?.length ?? 0, orders: orders.data?.length ?? 0, consignments: consignments.data?.length ?? 0, revenue: paidOrders.reduce((sum, order) => sum + Number(order.total), 0) },
  });
}
