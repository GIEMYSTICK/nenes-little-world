import Stripe from "stripe";
import { createServiceSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY || process.env.stripe_secret_key;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.stripe_webhook_secret;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !webhookSecret || !signature) return new Response("Webhook not configured", { status: 503 });

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(secret);
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (error) {
    console.error("Stripe signature error", error instanceof Error ? error.message : error);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const supabase = createServiceSupabase();
    if (!supabase) return new Response("Database not configured", { status: 503 });

    const productId = session.metadata?.product_id;
    const quantity = Number(session.metadata?.quantity || 1);
    if (!productId) return new Response("Missing product metadata", { status: 400 });

    const { data: existing } = await supabase.from("orders").select("id").eq("stripe_checkout_session_id", session.id).maybeSingle();
    if (!existing) {
      const { data: product } = await supabase.from("products").select("id,name_th,sku,price,stock_quantity").eq("id", productId).single();
      if (!product) return new Response("Product not found", { status: 404 });
      const amount = Number(session.amount_total || 0) / 100;
      const details = session.customer_details;
      const { data: order, error } = await supabase.from("orders").insert({
        customer_email: details?.email || session.customer_email || "unknown@example.com",
        customer_name: details?.name || null,
        customer_phone: details?.phone || null,
        shipping_address: details?.address || {},
        subtotal: amount,
        total: amount,
        currency: (session.currency || "thb").toUpperCase(),
        status: "paid",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        paid_at: new Date().toISOString(),
      }).select("id").single();
      if (error || !order) return new Response("Order insert failed", { status: 500 });

      await supabase.from("order_items").insert({ order_id: order.id, product_id: product.id, product_name: product.name_th, product_sku: product.sku, unit_price: Number(product.price), quantity });
      const remaining = Math.max(0, Number(product.stock_quantity) - quantity);
      await supabase.from("products").update({ stock_quantity: remaining, status: remaining === 0 ? "sold" : "active" }).eq("id", product.id);
    }
  }

  return new Response("ok");
}
