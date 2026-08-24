import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const BUCKET = "nene-media";
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024;

function safeSegment(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9/_.-]+/g, "-").replace(/\/+/g, "/").replace(/^\/+|\/+$/g, "") || "general";
}

async function ensureBucket(service: NonNullable<Awaited<ReturnType<typeof requireAdmin>>>["service"]) {
  const { data } = await service.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await service.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: [...ALLOWED_TYPES],
    });
    if (error && !/already exists/i.test(error.message)) throw error;
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const folder = safeSegment(String(form.get("folder") || "general"));
  if (!(file instanceof File)) return NextResponse.json({ message: "กรุณาเลือกไฟล์รูปภาพ" }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ message: "รองรับไฟล์ JPG, PNG, WEBP และ GIF เท่านั้น" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ message: "ไฟล์ต้องมีขนาดไม่เกิน 4 MB" }, { status: 400 });

  try {
    await ensureBucket(admin.service);
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error } = await admin.service.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw error;
    const { data } = admin.service.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "อัปโหลดรูปไม่สำเร็จ" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const rawPath = String((await request.json()).path || "");
  if (!rawPath) return NextResponse.json({ message: "Invalid path" }, { status: 400 });
  const path = safeSegment(rawPath);
  const { error } = await admin.service.storage.from(BUCKET).remove([path]);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
