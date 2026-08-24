import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const productSchema = z.object({
  name_th: z.string().trim().min(2), name_en: z.string().trim().min(2), slug: z.string().trim().regex(/^[a-z0-9-]+$/),
  description_th: z.string().default(""), description_en: z.string().default(""), category_id: z.string().uuid().nullable(),
  price: z.number().min(0), compare_at_price: z.number().min(0).nullable(), stock_quantity: z.number().int().min(0),
  condition: z.enum(["new", "like_new", "good", "fair"]), brand: z.string().nullable(), featured: z.boolean(),
  status: z.enum(["draft", "active", "sold", "out_of_stock"]), sku: z.string().nullable(),
  image_urls: z.array(z.object({ url: z.string().url(), alt_th: z.string().max(300).nullable().optional(), alt_en: z.string().max(300).nullable().optional() })).max(8).default([]),
});

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "ข้อมูลสินค้าไม่ถูกต้อง", issues: parsed.error.flatten() }, { status: 400 });
  const { image_urls, ...product } = parsed.data;
  const { data, error } = await admin.service.from("products").insert({ ...product, created_by: admin.user.id }).select("*").single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  if (image_urls.length) await admin.service.from("product_images").insert(image_urls.map((image, index) => ({ product_id: data.id, url: image.url, alt_th: image.alt_th || product.name_th, alt_en: image.alt_en || product.name_en, sort_order: index })));
  return NextResponse.json({ product: data }, { status: 201 });
}
