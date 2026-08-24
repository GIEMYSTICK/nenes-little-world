import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { createServiceSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const schema = z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(5).default(1), locale: z.enum(["th", "en"]).default("th") });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ message: "ข้อมูลสินค้าไม่ถูกต้อง" }, { status: 400 });

    const supabase = createServiceSupabase();
    const secret = process.env.STRIPE_SECRET_KEY || process.env.stripe_secret_key;
    if (!supabase || !secret) return NextResponse.json({ message: "ระบบชำระเงินยังตั้งค่าไม่ครบ" }, { status: 503 });

    const { productId, quantity, locale } = parsed.data;
    const { data: product, error } = await supabase.from("products").select("id,name_th,name_en,description_th,description_en,price,currency,stock_quantity,status,product_images(url,sort_order)").eq("id", productId).single();
    if (error || !product || product.status !== "active") return NextResponse.json({ message: "ไม่พบสินค้านี้หรือสินค้ายังไม่เปิดขาย" }, { status: 404 });
    if (product.stock_quantity < quantity) return NextResponse.json({ message: "สินค้าเหลือไม่เพียงพอ" }, { status: 409 });

    const stripe = new Stripe(secret);
    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const origin = configuredUrl || new URL(request.url).origin;
    const name = locale === "en" ? product.name_en : product.name_th;
    const description = locale === "en" ? product.description_en : product.description_th;
    const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((image) => image.url).filter((url) => /^https:\/\//.test(url)).slice(0, 1);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: locale === "th" ? "th" : "en",
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["TH"] },
      line_items: [{
        quantity,
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: Math.round(Number(product.price) * 100),
          product_data: { name, description: description.slice(0, 500), ...(images.length ? { images } : {}) },
        },
      }],
      metadata: { product_id: product.id, quantity: String(quantity), locale },
      success_url: `${origin}/${locale === "en" ? "en/" : ""}shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale === "en" ? "en/" : ""}shop?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error instanceof Error ? error.message : error);
    return NextResponse.json({ message: "ไม่สามารถเริ่มการชำระเงินได้ กรุณาลองใหม่" }, { status: 500 });
  }
}
