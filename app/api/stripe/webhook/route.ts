import Stripe from "stripe";
import { createServiceSupabase } from "@/lib/supabase";
import { createMailTransport, escapeHtml, SITE_CONTACT_EMAIL } from "@/lib/email";

export const runtime = "nodejs";

const EMAIL_PENDING = "system:order_confirmation_pending";

type OrderRow = {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, unknown> | null;
  total: number | string;
  currency: string;
  notes: string | null;
};

type OrderItemRow = {
  product_name: string;
  product_sku: string | null;
  unit_price: number | string;
  quantity: number;
};

function money(value: number | string, currency: string, locale: string) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "th-TH", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function addressText(address: Record<string, unknown> | null) {
  if (!address) return "-";
  return [address.line1, address.line2, address.city, address.state, address.postal_code, address.country]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(", ") || "-";
}

async function sendOrderConfirmation(order: OrderRow, items: OrderItemRow[], locale: string, paymentMethod: string) {
  const mail = createMailTransport();
  if (!mail) throw new Error("SMTP is not configured");
  const en = locale === "en";
  const customerName = order.customer_name?.trim() || (en ? "customer" : "ลูกค้า");
  const safeName = escapeHtml(customerName);
  const safeOrderNumber = escapeHtml(order.order_number);
  const safeAddress = escapeHtml(addressText(order.shipping_address));
  const safePhone = escapeHtml(order.customer_phone || "-");
  const safePayment = escapeHtml(paymentMethod === "promptpay" ? "PromptPay" : paymentMethod === "card" ? (en ? "Card" : "บัตร") : paymentMethod || "Stripe");
  const rows = items.map((item) => `<tr><td style="padding:12px 0;border-bottom:1px solid #e8eef3"><b>${escapeHtml(item.product_name)}</b>${item.product_sku ? `<br><span style="font-size:12px;color:#7a899b">SKU: ${escapeHtml(item.product_sku)}</span>` : ""}</td><td style="padding:12px 8px;text-align:center;border-bottom:1px solid #e8eef3">${item.quantity}</td><td style="padding:12px 0;text-align:right;border-bottom:1px solid #e8eef3">${escapeHtml(money(item.unit_price, order.currency, locale))}</td></tr>`).join("");
  const plainItems = items.map((item) => `- ${item.product_name}${item.product_sku ? ` (SKU: ${item.product_sku})` : ""} x ${item.quantity} — ${money(item.unit_price, order.currency, locale)}`).join("\n");
  const total = money(order.total, order.currency, locale);
  const address = addressText(order.shipping_address);
  const subject = en ? `Order confirmed ${order.order_number} | Nene's Little World` : `ยืนยันคำสั่งซื้อ ${order.order_number} | Nene's Little World`;

  await mail.transporter.sendMail({
    from: `"Nene's Little World" <${mail.user}>`,
    to: order.customer_email,
    replyTo: process.env.CONTACT_TO_EMAIL || SITE_CONTACT_EMAIL,
    subject,
    text: en
      ? `Hello ${customerName},\n\nYour payment was successful and your order is confirmed.\nOrder: ${order.order_number}\n\n${plainItems}\n\nTotal: ${total}\nPayment: ${safePayment}\nDelivery address: ${address}\nPhone: ${order.customer_phone || "-"}\n\nNene's family will prepare your order and contact you if more delivery information is needed. Never send card details by email.\n\nNene's Little World`
      : `สวัสดีคุณ ${customerName}\n\nชำระเงินสำเร็จและยืนยันคำสั่งซื้อแล้วค่ะ\nเลขคำสั่งซื้อ: ${order.order_number}\n\n${plainItems}\n\nยอดรวม: ${total}\nวิธีชำระเงิน: ${safePayment}\nที่อยู่จัดส่ง: ${address}\nโทรศัพท์: ${order.customer_phone || "-"}\n\nครอบครัวของเนเน่จะเตรียมสินค้า และจะติดต่อหากต้องการข้อมูลจัดส่งเพิ่มเติม กรุณาอย่าส่งข้อมูลบัตรทางอีเมล\n\nNene's Little World`,
    html: `<div style="display:none;max-height:0;overflow:hidden">${en ? "Your payment was successful and your order is confirmed." : "ชำระเงินสำเร็จและยืนยันคำสั่งซื้อแล้วค่ะ"}</div><div style="margin:0;background:#f4f8fb;padding:24px 12px;font-family:Arial,'Noto Sans Thai',sans-serif;color:#21395d"><div style="max-width:640px;margin:auto;background:#fff;border-radius:22px;overflow:hidden;border:1px solid #dce9f3"><div style="padding:32px 30px;text-align:center;background:linear-gradient(135deg,#e9f7ff,#fff2f4)"><div style="font-size:36px">♡</div><h1 style="margin:8px 0 5px;font-size:26px">${en ? "Order confirmed" : "ยืนยันคำสั่งซื้อแล้ว"}</h1><p style="margin:0;color:#6d8097">Nene's Little World · ${safeOrderNumber}</p></div><div style="padding:28px 30px;line-height:1.7"><p>${en ? "Hello" : "สวัสดีคุณ"} ${safeName},</p><p>${en ? "Your payment was successful. Nene’s family has received your order and will prepare it for delivery." : "เราได้รับการชำระเงินและคำสั่งซื้อของคุณเรียบร้อยแล้ว ครอบครัวของเนเน่จะเตรียมสินค้าเพื่อจัดส่งค่ะ"}</p><table role="presentation" style="width:100%;border-collapse:collapse;margin:20px 0"><thead><tr><th style="text-align:left;padding-bottom:8px">${en ? "Item" : "สินค้า"}</th><th style="text-align:center;padding-bottom:8px">${en ? "Qty" : "จำนวน"}</th><th style="text-align:right;padding-bottom:8px">${en ? "Price" : "ราคา"}</th></tr></thead><tbody>${rows}</tbody></table><div style="margin:18px 0;padding:18px 20px;background:#f7fafc;border-radius:12px"><p style="margin:0 0 8px"><b>${en ? "Total" : "ยอดรวม"}: ${escapeHtml(total)}</b></p><p style="margin:4px 0"><b>${en ? "Payment" : "วิธีชำระเงิน"}:</b> ${safePayment}</p><p style="margin:4px 0"><b>${en ? "Delivery address" : "ที่อยู่จัดส่ง"}:</b> ${safeAddress}</p><p style="margin:4px 0"><b>${en ? "Phone" : "โทรศัพท์"}:</b> ${safePhone}</p></div><p>${en ? "We’ll contact you if more delivery information is needed." : "หากต้องการข้อมูลจัดส่งเพิ่มเติม เราจะติดต่อกลับตามข้อมูลที่แจ้งไว้ค่ะ"}</p><p style="margin-top:24px"><b>${en ? "Nene’s family" : "ครอบครัวของเนเน่"}</b></p><p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #e4edf3;color:#8291a2;font-size:12px">${en ? "This automatic email confirms your website order. Never send card details or passwords by email." : "อีเมลอัตโนมัตินี้ยืนยันคำสั่งซื้อจากเว็บไซต์ กรุณาอย่าส่งข้อมูลบัตรหรือรหัสผ่านทางอีเมล"}</p></div></div></div>`,
  });
}

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

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    if (session.payment_status !== "paid") return new Response("Payment not completed", { status: 200 });
    const supabase = createServiceSupabase();
    if (!supabase) return new Response("Database not configured", { status: 503 });

    const productId = session.metadata?.product_id;
    const quantity = Number(session.metadata?.quantity || 1);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 5) return new Response("Invalid product metadata", { status: 400 });

    const { data: existing } = await supabase.from("orders").select("id,order_number,customer_email,customer_name,customer_phone,shipping_address,total,currency,notes").eq("stripe_checkout_session_id", session.id).maybeSingle();
    let confirmedOrder = existing as OrderRow | null;
    if (!existing) {
      const { data: product } = await supabase.from("products").select("id,name_th,sku,price,stock_quantity").eq("id", productId).single();
      if (!product) return new Response("Product not found", { status: 404 });
      const currentStock = Number(product.stock_quantity);
      if (!Number.isFinite(currentStock) || currentStock < quantity) return new Response("Insufficient stock", { status: 409 });
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
        notes: EMAIL_PENDING,
        paid_at: new Date().toISOString(),
      }).select("id,order_number,customer_email,customer_name,customer_phone,shipping_address,total,currency,notes").single();
      if (error || !order) return new Response("Order insert failed", { status: 500 });

      const unitPrice = quantity > 0 ? amount / quantity : Number(product.price);
      const { error: itemError } = await supabase.from("order_items").insert({ order_id: order.id, product_id: product.id, product_name: product.name_th, product_sku: product.sku, unit_price: unitPrice, quantity });
      if (itemError) {
        await supabase.from("orders").delete().eq("id", order.id);
        return new Response("Order item insert failed", { status: 500 });
      }
      const remaining = currentStock - quantity;
      const { data: updatedProduct, error: stockError } = await supabase
        .from("products")
        .update({ stock_quantity: remaining, status: remaining === 0 ? "sold" : "active" })
        .eq("id", product.id)
        .eq("stock_quantity", currentStock)
        .select("id")
        .maybeSingle();
      if (stockError || !updatedProduct) {
        await supabase.from("order_items").delete().eq("order_id", order.id);
        await supabase.from("orders").delete().eq("id", order.id);
        return new Response(stockError ? "Stock update failed" : "Stock changed during checkout", { status: stockError ? 500 : 409 });
      }
      confirmedOrder = order as OrderRow;
    }

    if (confirmedOrder?.notes === EMAIL_PENDING && confirmedOrder.customer_email !== "unknown@example.com") {
      const { data: items, error: itemsError } = await supabase.from("order_items").select("product_name,product_sku,unit_price,quantity").eq("order_id", confirmedOrder.id);
      if (itemsError || !items?.length) return new Response("Order confirmation data unavailable", { status: 500 });
      try {
        const locale = session.metadata?.locale === "en" ? "en" : "th";
        const paymentMethod = session.payment_method_types?.[0] || "stripe";
        await sendOrderConfirmation(confirmedOrder, items as OrderItemRow[], locale, paymentMethod);
        await supabase.from("orders").update({ notes: `system:order_confirmation_sent:${new Date().toISOString()}` }).eq("id", confirmedOrder.id).eq("notes", EMAIL_PENDING);
      } catch (error) {
        console.error("Order confirmation email error", error instanceof Error ? error.message : error);
        return new Response("Order confirmation email failed", { status: 500 });
      }
    }
  }

  return new Response("ok");
}
