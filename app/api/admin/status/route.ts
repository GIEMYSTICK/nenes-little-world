import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const schema = z.object({ entity: z.enum(["orders", "consignment_submissions"]), id: z.string().uuid(), status: z.string().min(2).max(30) });

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  const valid = parsed.data.entity === "orders"
    ? ["pending", "paid", "processing", "shipped", "completed", "cancelled", "refunded"]
    : ["new", "reviewing", "accepted", "listed", "declined", "completed"];
  if (!valid.includes(parsed.data.status)) return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  const { error } = await admin.service.from(parsed.data.entity).update({ status: parsed.data.status }).eq("id", parsed.data.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
