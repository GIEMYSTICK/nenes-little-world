import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const allowed = ["name_th", "name_en", "description_th", "description_en", "category_id", "price", "compare_at_price", "stock_quantity", "condition", "brand", "featured", "status", "sku"];
  const update = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  const { error } = await admin.service.from("products").update(update).eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin || admin.profile.role !== "admin") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await admin.service.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
