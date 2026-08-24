import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const productSchema = z.object({
  name_th: z.string().trim().min(2).max(200), name_en: z.string().trim().min(2).max(200), slug: z.string().trim().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description_th: z.string().max(10000).default(""), description_en: z.string().max(10000).default(""), category_id: z.string().uuid().nullable(),
  price: z.number().min(0).max(10_000_000), compare_at_price: z.number().min(0).max(10_000_000).nullable(), stock_quantity: z.number().int().min(0).max(1_000_000),
  condition: z.enum(["new", "like_new", "good", "fair"]), brand: z.string().trim().max(200).nullable(), featured: z.boolean(),
  status: z.enum(["draft", "active", "sold", "out_of_stock"]), sku: z.string().trim().max(100).nullable(),
  image_urls: z.array(z.object({ url: z.string().url(), alt_th: z.string().max(300).nullable().optional(), alt_en: z.string().max(300).nullable().optional() })).max(8).default([]),
}).superRefine((product, context) => {
  if (product.compare_at_price !== null && product.compare_at_price < product.price) {
    context.addIssue({ code: "custom", path: ["compare_at_price"], message: "ราคาเดิมต้องไม่น้อยกว่าราคาขาย" });
  }
});

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "ข้อมูลสินค้าไม่ถูกต้อง", issues: parsed.error.flatten() }, { status: 400 });
  const { image_urls, ...product } = parsed.data;
  const { data, error } = await admin.service.from("products").insert({ ...product, created_by: admin.user.id }).select("*").single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  if (image_urls.length) {
    const { error: imageError } = await admin.service.from("product_images").insert(image_urls.map((image, index) => ({ product_id: data.id, url: image.url, alt_th: image.alt_th || product.name_th, alt_en: image.alt_en || product.name_en, sort_order: index })));
    if (imageError) {
      await admin.service.from("products").delete().eq("id", data.id);
      return NextResponse.json({ message: `บันทึกรูปสินค้าไม่สำเร็จ: ${imageError.message}` }, { status: 500 });
    }
  }
  return NextResponse.json({ product: data }, { status: 201 });
}
