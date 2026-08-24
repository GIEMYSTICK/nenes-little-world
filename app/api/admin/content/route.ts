import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const schema = z.object({ id: z.string().uuid(), title: z.string().max(300), body: z.string().max(10000), is_published: z.boolean(), payload: z.record(z.string(), z.unknown()).default({}) });

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Invalid content" }, { status: 400 });
  const { id, ...content } = parsed.data;
  const { error } = await admin.service.from("site_content").update({ ...content, updated_by: admin.user.id }).eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
