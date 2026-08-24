import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { service } = admin;
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
