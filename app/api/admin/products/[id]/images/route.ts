import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const addSchema = z.object({
  url: z.string().url(),
  alt_th: z.string().max(300).nullable().optional(),
  alt_en: z.string().max(300).nullable().optional(),
});
const idSchema = z.string().uuid();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = addSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "ข้อมูลรูปภาพไม่ถูกต้อง" }, { status: 400 });
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
  const { count } = await admin.service.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", id);
  if ((count ?? 0) >= 8) return NextResponse.json({ message: "สินค้าเพิ่มรูปได้สูงสุด 8 รูป" }, { status: 409 });
  const { data, error } = await admin.service.from("product_images").insert({ product_id: id, ...parsed.data, sort_order: count || 0 }).select("*").single();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ image: data }, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
  const imageId = String((await request.json()).imageId || "");
  if (!idSchema.safeParse(imageId).success) return NextResponse.json({ message: "Invalid image ID" }, { status: 400 });
  const { error } = await admin.service.from("product_images").delete().eq("id", imageId).eq("product_id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
