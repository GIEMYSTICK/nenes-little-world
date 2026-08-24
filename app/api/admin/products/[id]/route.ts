import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const idSchema = z.string().uuid();
const updateSchema = z.object({
  name_th: z.string().trim().min(2).max(200),
  name_en: z.string().trim().min(2).max(200),
  description_th: z.string().max(10000),
  description_en: z.string().max(10000),
  category_id: z.string().uuid().nullable(),
  price: z.number().min(0).max(10_000_000),
  compare_at_price: z.number().min(0).max(10_000_000).nullable(),
  stock_quantity: z.number().int().min(0).max(1_000_000),
  condition: z.enum(["new", "like_new", "good", "fair"]),
  brand: z.string().trim().max(200).nullable(),
  featured: z.boolean(),
  status: z.enum(["draft", "active", "sold", "out_of_stock"]),
  sku: z.string().trim().max(100).nullable(),
}).partial().strict().refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "ข้อมูลสินค้าไม่ถูกต้อง", issues: parsed.error.flatten() }, { status: 400 });
  const { error } = await admin.service.from("products").update(parsed.data).eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin || admin.profile.role !== "admin") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
  const { error } = await admin.service.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
