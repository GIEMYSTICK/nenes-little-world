"use client";
/* eslint-disable @next/next/no-img-element -- authenticated previews use dynamic Supabase URLs */

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  FileText,
  HeartHandshake,
  ImagePlus,
  Images,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Mail,
  Menu,
  PackagePlus,
  RefreshCw,
  Save,
  ShoppingBag,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import type {
  AdminOverview,
  Product,
  UploadedMedia,
} from "@/lib/commerce-types";

type Tab = "overview" | "products" | "orders" | "consignments" | "content";

const emptyOverview: AdminOverview = {
  products: [],
  categories: [],
  orders: [],
  consignments: [],
  content: [],
  counts: { products: 0, orders: 0, consignments: 0, revenue: 0 },
};

function cell(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "—";
}
function date(value: unknown) {
  return typeof value === "string"
    ? new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
}
function mediaFromContent(item: Record<string, unknown>): UploadedMedia | null {
  const payload =
    item.payload && typeof item.payload === "object"
      ? (item.payload as Record<string, unknown>)
      : {};
  return typeof payload.image_url === "string"
    ? {
        url: payload.image_url,
        path: typeof payload.image_path === "string" ? payload.image_path : "",
      }
    : null;
}
function storagePath(url: string) {
  return decodeURIComponent(
    url.split("/storage/v1/object/public/nene-media/")[1] || "",
  );
}

const contentImageHelp: Record<string, string> = {
  home_hero: "ภาพปกของวิดีโอส่วนหัวหน้าแรก",
  home_profile: "รูปแนะนำตัวในส่วน Hello, I'm Nene",
  home_chapter: "รูปในส่วน Our current little chapter สำหรับอัปเดตการเติบโต",
  home_letter: "รูปข้างจดหมายจากพ่อและแม่",
  shop_hero: "รูปนี้จะแสดงในส่วนหัวหน้าร้าน",
};

async function optimizeImage(file: File) {
  if (file.type === "image/gif" || file.size < 900_000) return file;
  if (typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.84),
    );
    return blob
      ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
          type: "image/webp",
        })
      : file;
  } catch {
    return file;
  }
}

export function AdminDashboard() {
  const supabase = createBrowserSupabase();
  const [sessionToken, setSessionToken] = useState("");
  const [authChecked, setAuthChecked] = useState(() => !supabase);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<AdminOverview>(emptyOverview);
  const [tab, setTab] = useState<Tab>("overview");
  const [menu, setMenu] = useState(false);
  const [newProduct, setNewProduct] = useState(false);
  const [imageProduct, setImageProduct] = useState<Product | null>(null);
  const [draftImages, setDraftImages] = useState<UploadedMedia[]>([]);
  const [contentMedia, setContentMedia] = useState<
    Record<string, UploadedMedia | null>
  >({});
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [productError, setProductError] = useState("");
  const productFormRef = useRef<HTMLFormElement>(null);

  const load = useCallback(
    async (token: string) => {
      setLoading(true);
      setNotice("");
      const response = await fetch("/api/admin/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        await supabase?.auth.signOut();
        setSessionToken("");
        setLoginError("บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแล");
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.message || "โหลดข้อมูลไม่สำเร็จ");
        setLoading(false);
        return;
      }
      setOverview(data);
      setContentMedia(
        Object.fromEntries(
          (data.content || []).map((item: Record<string, unknown>) => [
            String(item.id),
            mediaFromContent(item),
          ]),
        ),
      );
      setLoading(false);
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token || "";
      setSessionToken(token);
      setAuthChecked(true);
      if (token) void load(token);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSessionToken(session?.access_token || "");
      },
    );
    return () => listener.subscription.unsubscribe();
  }, [load, supabase]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setLoginError("");
    const form = new FormData(event.currentTarget);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error || !data.session) {
      setLoginError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }
    setSessionToken(data.session.access_token);
    await load(data.session.access_token);
  }

  async function api(path: string, options: RequestInit) {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
        ...(options.headers || {}),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      const fieldErrors = data?.issues?.fieldErrors as
        Record<string, string[] | undefined> | undefined;
      const detail = fieldErrors
        ? Object.values(fieldErrors).flat().find(Boolean)
        : "";
      throw new Error(detail || data.message || "ดำเนินการไม่สำเร็จ");
    }
    return data;
  }

  async function uploadMedia(
    file: File,
    folder: string,
  ): Promise<UploadedMedia> {
    const prepared = await optimizeImage(file);
    const form = new FormData();
    form.set("file", prepared);
    form.set("folder", folder);
    const response = await fetch("/api/admin/uploads", {
      method: "POST",
      headers: { Authorization: `Bearer ${sessionToken}` },
      body: form,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "อัปโหลดรูปไม่สำเร็จ");
    return data;
  }

  async function uploadDraftImages(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setNotice("");
    setProductError("");
    try {
      const uploaded: UploadedMedia[] = [];
      for (const file of Array.from(files).slice(
        0,
        Math.max(0, 8 - draftImages.length),
      ))
        uploaded.push(await uploadMedia(file, "products/drafts"));
      setDraftImages((current) => [...current, ...uploaded]);
    } catch (error) {
      setProductError(
        error instanceof Error ? error.message : "อัปโหลดรูปไม่สำเร็จ",
      );
    } finally {
      setUploading(false);
    }
  }

  async function removeStoredMedia(media: UploadedMedia) {
    if (media.path)
      await api("/api/admin/uploads", {
        method: "DELETE",
        body: JSON.stringify({ path: media.path }),
      });
  }

  async function discardDraftProduct() {
    if (uploading) return;
    const unusedImages = [...draftImages];
    setNewProduct(false);
    setDraftImages([]);
    await Promise.allSettled(unusedImages.map(removeStoredMedia));
  }

  async function addProductImages(product: Product, files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setNotice("");
    try {
      const added: NonNullable<Product["product_images"]> = [];
      for (const file of Array.from(files).slice(
        0,
        Math.max(0, 8 - (product.product_images?.length || 0)),
      )) {
        const media = await uploadMedia(file, `products/${product.id}`);
        try {
          const result = await api(`/api/admin/products/${product.id}/images`, {
            method: "POST",
            body: JSON.stringify({
              url: media.url,
              alt_th: product.name_th,
              alt_en: product.name_en,
            }),
          });
          added.push(result.image);
        } catch (error) {
          await removeStoredMedia(media).catch(() => undefined);
          throw error;
        }
      }
      setImageProduct((current) =>
        current
          ? {
              ...current,
              product_images: [...(current.product_images || []), ...added],
            }
          : current,
      );
      setNotice("เพิ่มรูปสินค้าเรียบร้อยแล้ว");
      await load(sessionToken);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "เพิ่มรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  async function deleteProductImage(
    product: Product,
    image: NonNullable<Product["product_images"]>[number],
  ) {
    if (!window.confirm("ลบรูปนี้ออกจากสินค้าใช่ไหม?")) return;
    try {
      await api(`/api/admin/products/${product.id}/images`, {
        method: "DELETE",
        body: JSON.stringify({ imageId: image.id }),
      });
      const path = storagePath(image.url);
      if (path)
        await api("/api/admin/uploads", {
          method: "DELETE",
          body: JSON.stringify({ path }),
        }).catch(() => undefined);
      setImageProduct({
        ...product,
        product_images: product.product_images?.filter(
          (item) => item.id !== image.id,
        ),
      });
      setNotice("ลบรูปสินค้าแล้ว");
      await load(sessionToken);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ลบรูปไม่สำเร็จ");
    }
  }

  async function uploadContentImage(
    item: Record<string, unknown>,
    files: FileList | null,
  ) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setNotice("");
    try {
      const id = String(item.id);
      const media = await uploadMedia(
        file,
        `content/${String(item.content_key || "section")}`,
      );
      setContentMedia((current) => ({ ...current, [id]: media }));
      setNotice("อัปโหลดแล้ว กรุณากดบันทึกคอนเทนต์");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  async function createProduct(formElement: HTMLFormElement) {
    setProductError("");
    const form = new FormData(formElement);
    const nameTh = String(form.get("name_th") || "").trim();
    const priceText = String(form.get("price") || "").trim();
    const missing = [!nameTh && "ชื่อสินค้า", !priceText && "ราคา"].filter(Boolean);
    if (missing.length) {
      const fieldName = !nameTh ? "name_th" : "price";
      const invalid = formElement.elements.namedItem(fieldName) as HTMLElement | null;
      invalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      invalid?.focus();
      setProductError(`กรุณากรอก ${missing.join(" และ ")} ก่อนบันทึกสินค้า`);
      return;
    }
    setLoading(true);
    setNotice("");
    const nameEn = String(form.get("name_en") || "").trim() || nameTh;
    const requestedSlug = String(form.get("slug") || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = requestedSlug || `product-${Date.now()}`;
    const payload = {
      name_th: nameTh,
      name_en: nameEn,
      slug,
      description_th: form.get("description_th"),
      description_en: form.get("description_en"),
      category_id: form.get("category_id") || null,
      price: Number(form.get("price")),
      compare_at_price:
        form.get("compare_at_price") === "" ||
        form.get("compare_at_price") === null
          ? null
          : Number(form.get("compare_at_price")),
      stock_quantity: Number(form.get("stock_quantity")),
      condition: form.get("condition"),
      brand: form.get("brand") || null,
      featured: form.get("featured") === "on",
      status: form.get("status"),
      sku: form.get("sku") || null,
      image_urls: draftImages.map((image) => ({
        url: image.url,
        alt_th: nameTh,
        alt_en: nameEn,
      })),
    };
    try {
      await api("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setNewProduct(false);
      setDraftImages([]);
      setProductError("");
      await load(sessionToken);
      setNotice("เพิ่มสินค้าเรียบร้อยแล้ว และพร้อมแสดงตามสถานะที่เลือก");
    } catch (error) {
      setProductError(
        error instanceof Error ? error.message : "เพิ่มสินค้าไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateProduct(
    product: Product,
    field: string,
    value: unknown,
  ) {
    try {
      await api(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: value }),
      });
      setNotice("บันทึกสินค้าแล้ว");
      await load(sessionToken);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    }
  }

  async function updateStatus(
    entity: "orders" | "consignment_submissions",
    id: unknown,
    status: string,
  ) {
    try {
      await api("/api/admin/status", {
        method: "PATCH",
        body: JSON.stringify({ entity, id, status }),
      });
      setNotice("อัปเดตสถานะแล้ว");
      await load(sessionToken);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "อัปเดตไม่สำเร็จ");
    }
  }

  async function saveContent(
    event: FormEvent<HTMLFormElement>,
    item: Record<string, unknown>,
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentPayload =
      item.payload && typeof item.payload === "object"
        ? (item.payload as Record<string, unknown>)
        : {};
    const media = contentMedia[String(item.id)];
    const payload = {
      ...currentPayload,
      image_url: media?.url || null,
      image_path: media?.path || null,
    };
    try {
      await api("/api/admin/content", {
        method: "PATCH",
        body: JSON.stringify({
          id: item.id,
          title: form.get("title"),
          body: form.get("body"),
          is_published: form.get("is_published") === "on",
          payload,
        }),
      });
      const previous = mediaFromContent(item);
      if (previous?.path && previous.path !== media?.path)
        await removeStoredMedia(previous).catch(() => undefined);
      setNotice("บันทึกคอนเทนต์และรูปภาพแล้ว");
      await load(sessionToken);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    }
  }

  if (!authChecked)
    return (
      <main className="admin-loading">
        <LoaderCircle className="spin" />
        <span>กำลังตรวจสอบระบบ…</span>
      </main>
    );
  if (!supabase)
    return (
      <main className="admin-setup">
        <div>
          <LayoutDashboard />
          <h1>Admin Dashboard พร้อมเชื่อมต่อ</h1>
          <p>เพิ่มตัวแปร Supabase ใน `.env` และ Vercel ก่อนเข้าสู่ระบบ</p>
          <code>
            NEXT_PUBLIC_SUPABASE_URL
            <br />
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
            <br />
            SUPABASE_SERVICE_ROLE_KEY
          </code>
          <Link href="/">กลับหน้าเว็บเนเน่</Link>
        </div>
      </main>
    );
  if (!sessionToken)
    return (
      <main className="admin-login">
        <section>
          <Link className="admin-brand" href="/">
            <span>♡</span> Nene&apos;s Little World
          </Link>
          <div className="admin-login-copy">
            <p className="eyebrow">Private workspace</p>
            <h1>
              ยินดีต้อนรับกลับ
              <br />
              ผู้ดูแลเนเน่
            </h1>
            <p>จัดการเรื่องราว สินค้า ออเดอร์ และคำขอฝากขายจากที่เดียว</p>
          </div>
          <form onSubmit={login}>
            <label>
              อีเมลผู้ดูแล
              <input type="email" name="email" required autoComplete="email" />
            </label>
            <label>
              รหัสผ่าน
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
              />
            </label>
            <button disabled={loading}>
              {loading ? (
                <LoaderCircle className="spin" />
              ) : (
                <LayoutDashboard />
              )}{" "}
              เข้าสู่ระบบหลังบ้าน
            </button>
            {loginError && <p role="alert">{loginError}</p>}
          </form>
        </section>
      </main>
    );

  const nav: Array<[Tab, string, React.ReactNode]> = [
    ["overview", "ภาพรวม", <BarChart3 key="o" />],
    ["products", "สินค้า", <Boxes key="p" />],
    ["orders", "คำสั่งซื้อ", <ShoppingBag key="r" />],
    ["consignments", "ฝากขาย", <HeartHandshake key="c" />],
    ["content", "คอนเทนต์", <FileText key="t" />],
  ];
  return (
    <main className="admin-shell">
      <aside className={menu ? "open" : ""}>
        <div className="admin-side-head">
          <span>♡</span>
          <div>
            <b>Nene Admin</b>
            <small>Little World Manager</small>
          </div>
          <button onClick={() => setMenu(false)}>
            <X />
          </button>
        </div>
        <nav>
          {nav.map(([id, label, icon]) => (
            <button
              className={tab === id ? "active" : ""}
              key={id}
              onClick={() => {
                setTab(id);
                setMenu(false);
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
        <div className="admin-side-bottom">
          <a href="/shop" target="_blank">
            <ShoppingBag /> เปิดหน้าร้าน
          </a>
          <button onClick={() => supabase.auth.signOut()}>
            <LogOut /> ออกจากระบบ
          </button>
        </div>
      </aside>
      <section className="admin-main">
        <header>
          <button className="admin-menu" onClick={() => setMenu(true)}>
            <Menu />
          </button>
          <div>
            <small>Nene&apos;s Little World</small>
            <h1>{nav.find(([id]) => id === tab)?.[1]}</h1>
          </div>
          <button
            className="admin-refresh"
            onClick={() => load(sessionToken)}
            disabled={loading}
          >
            <RefreshCw className={loading ? "spin" : ""} /> รีเฟรช
          </button>
        </header>
        {notice && (
          <div className="admin-notice">
            <CheckCircle2 /> {notice}
          </div>
        )}
        {tab === "overview" && (
          <div className="admin-overview">
            <div className="admin-stats">
              <article>
                <Boxes />
                <span>สินค้าทั้งหมด</span>
                <b>{overview.counts.products}</b>
              </article>
              <article>
                <ShoppingBag />
                <span>คำสั่งซื้อ</span>
                <b>{overview.counts.orders}</b>
              </article>
              <article>
                <HeartHandshake />
                <span>รอตรวจฝากขาย</span>
                <b>{overview.counts.consignments}</b>
              </article>
              <article>
                <BarChart3 />
                <span>ยอดขายรวม</span>
                <b>฿{overview.counts.revenue.toLocaleString()}</b>
              </article>
            </div>
            <div className="admin-panel">
              <div className="admin-panel-title">
                <div>
                  <b>กิจกรรมล่าสุด</b>
                  <span>ออเดอร์และคำขอฝากขายใหม่</span>
                </div>
              </div>
              <div className="activity-list">
                {overview.orders.slice(0, 4).map((order) => (
                  <article key={cell(order.id)}>
                    <span className="activity-icon">
                      <ShoppingBag />
                    </span>
                    <div>
                      <b>{cell(order.order_number)}</b>
                      <small>{cell(order.customer_email)}</small>
                    </div>
                    <strong>
                      ฿{Number(order.total || 0).toLocaleString()}
                    </strong>
                  </article>
                ))}
                {overview.consignments.slice(0, 4).map((item) => (
                  <article key={cell(item.id)}>
                    <span className="activity-icon">
                      <HeartHandshake />
                    </span>
                    <div>
                      <b>{cell(item.item_name)}</b>
                      <small>{cell(item.seller_name)}</small>
                    </div>
                    <strong>{cell(item.status)}</strong>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === "products" && (
          <div className="admin-panel">
            <div className="admin-panel-title">
              <div>
                <b>คลังสินค้า</b>
                <span>จัดการรูปภาพ ราคา สต็อก และสถานะการเผยแพร่</span>
              </div>
              <button
                onClick={() => {
                  setDraftImages([]);
                  setProductError("");
                  setNewProduct(true);
                }}
              >
                <PackagePlus /> เพิ่มสินค้า
              </button>
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>รูปภาพ</th>
                    <th>ราคา</th>
                    <th>สต็อก</th>
                    <th>สถานะ</th>
                    <th>แนะนำ</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-cell">
                          {product.product_images?.[0]?.url ? (
                            <img src={product.product_images[0].url} alt="" />
                          ) : (
                            <span>
                              <Images />
                            </span>
                          )}
                          <div>
                            <b>{product.name_th}</b>
                            <small>{product.name_en}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          className="admin-image-button"
                          onClick={() => setImageProduct(product)}
                        >
                          <ImagePlus /> จัดการรูป (
                          {product.product_images?.length || 0})
                        </button>
                      </td>
                      <td>฿{Number(product.price).toLocaleString()}</td>
                      <td>{product.stock_quantity}</td>
                      <td>
                        <select
                          value={product.status}
                          onChange={(event) =>
                            updateProduct(product, "status", event.target.value)
                          }
                        >
                          <option value="draft">ฉบับร่าง</option>
                          <option value="active">เปิดขาย</option>
                          <option value="out_of_stock">สินค้าหมด</option>
                          <option value="sold">ขายแล้ว</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className={`admin-toggle ${product.featured ? "on" : ""}`}
                          onClick={() =>
                            updateProduct(
                              product,
                              "featured",
                              !product.featured,
                            )
                          }
                          aria-label="สลับสินค้าแนะนำ"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === "orders" && (
          <div className="admin-panel">
            <div className="admin-panel-title">
              <div>
                <b>คำสั่งซื้อ</b>
                <span>อัปเดตการเตรียมและจัดส่งสินค้า</span>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>เลขออเดอร์</th>
                    <th>ลูกค้า</th>
                    <th>ยอดรวม</th>
                    <th>วันที่</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.orders.map((order) => (
                    <tr key={cell(order.id)}>
                      <td>
                        <b>{cell(order.order_number)}</b>
                      </td>
                      <td>
                        {cell(order.customer_name)}
                        <small>{cell(order.customer_email)}</small>
                      </td>
                      <td>฿{Number(order.total || 0).toLocaleString()}</td>
                      <td>{date(order.created_at)}</td>
                      <td>
                        <select
                          value={cell(order.status)}
                          onChange={(event) =>
                            updateStatus("orders", order.id, event.target.value)
                          }
                        >
                          {[
                            "pending",
                            "paid",
                            "processing",
                            "shipped",
                            "completed",
                            "cancelled",
                            "refunded",
                          ].map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === "consignments" && (
          <div className="admin-panel">
            <div className="admin-panel-title">
              <div>
                <b>รายการฝากขาย</b>
                <span>ตรวจข้อมูลและติดต่อลูกค้า</span>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>เลขอ้างอิง</th>
                    <th>สินค้า</th>
                    <th>ผู้ฝาก</th>
                    <th>ราคาที่ต้องการ</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.consignments.map((item) => (
                    <tr key={cell(item.id)}>
                      <td>
                        <b>{cell(item.reference_number)}</b>
                        <small>{date(item.created_at)}</small>
                      </td>
                      <td>
                        {cell(item.item_name)}
                        <small>{cell(item.condition)}</small>
                      </td>
                      <td>
                        {cell(item.seller_name)}
                        <small>
                          <Mail size={12} /> {cell(item.seller_email)}
                        </small>
                      </td>
                      <td>
                        ฿{Number(item.expected_price || 0).toLocaleString()}
                      </td>
                      <td>
                        <select
                          value={cell(item.status)}
                          onChange={(event) =>
                            updateStatus(
                              "consignment_submissions",
                              item.id,
                              event.target.value,
                            )
                          }
                        >
                          {[
                            "new",
                            "reviewing",
                            "accepted",
                            "listed",
                            "declined",
                            "completed",
                          ].map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === "content" && (
          <div className="admin-content-grid">
            {overview.content.map((item) => {
              const media = contentMedia[String(item.id)];
              return (
                <form
                  key={cell(item.id)}
                  className="admin-content-card"
                  onSubmit={(event) => saveContent(event, item)}
                >
                  <div>
                    <span>{cell(item.locale).toUpperCase()}</span>
                    <b>{cell(item.content_key)}</b>
                  </div>
                  <label>
                    หัวข้อ
                    <input name="title" defaultValue={cell(item.title)} />
                  </label>
                  <label>
                    เนื้อหา
                    <textarea
                      name="body"
                      rows={5}
                      defaultValue={cell(item.body)}
                    />
                  </label>
                  <div className="content-image-editor">
                    {media ? (
                      <div className="content-image-preview">
                        <img src={media.url} alt="ภาพประกอบคอนเทนต์" />
                        <button
                          type="button"
                          onClick={() =>
                            setContentMedia((current) => ({
                              ...current,
                              [String(item.id)]: null,
                            }))
                          }
                        >
                          <Trash2 /> ลบรูป
                        </button>
                      </div>
                    ) : (
                      <div className="content-image-empty">
                        <Images />
                        <span>ยังไม่มีภาพประกอบ</span>
                      </div>
                    )}
                    <label className="upload-button">
                      <UploadCloud />{" "}
                      {media ? "เปลี่ยนรูปจากเครื่อง" : "เพิ่มรูปจากเครื่อง"}
                      <input
                        type="file"
                        accept="image/*"
                        aria-label="เลือกรูปคอนเทนต์จากเครื่อง"
                        onChange={(event) => {
                          void uploadContentImage(item, event.target.files);
                          event.currentTarget.value = "";
                        }}
                        disabled={uploading}
                      />
                    </label>
                    <small>{contentImageHelp[cell(item.content_key)] || "ภาพประกอบคอนเทนต์บนเว็บไซต์"}</small>
                  </div>
                  <label className="publish-check">
                    <input
                      type="checkbox"
                      name="is_published"
                      defaultChecked={Boolean(item.is_published)}
                    />{" "}
                    เผยแพร่บนเว็บไซต์
                  </label>
                  <button disabled={uploading}>
                    <Save /> บันทึกคอนเทนต์
                  </button>
                </form>
              );
            })}
          </div>
        )}
      </section>
      {newProduct && (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <form
            ref={productFormRef}
            onSubmit={(event) => {
              event.preventDefault();
              void createProduct(event.currentTarget);
            }}
            noValidate
          >
            <header>
              <div>
                <b>เพิ่มสินค้าใหม่</b>
                <span>
                  กรอกข้อมูลสองภาษาและเลือกรูปจากเครื่องได้สูงสุด 8 รูป
                </span>
              </div>
              <button
                type="button"
                disabled={uploading}
                onClick={() => void discardDraftProduct()}
              >
                <X />
              </button>
            </header>
            <div className="admin-form-grid">
              <label>
                ชื่อสินค้า (ไทย)
                <input name="name_th" required />
              </label>
              <label>
                Product name (English)
                <input name="name_en" placeholder="เว้นว่างเพื่อใช้ชื่อภาษาไทย" />
              </label>
              <label>
                Slug URL
                <input
                  name="slug"
                  pattern="[a-z0-9-]+"
                  placeholder="สร้างให้อัตโนมัติเมื่อเว้นว่าง"
                />
              </label>
              <label>
                หมวดหมู่
                <select name="category_id">
                  <option value="">ไม่ระบุ</option>
                  {overview.categories.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.icon} {category.name_th}
                    </option>
                  ))}
                </select>
              </label>
              <label className="wide">
                รายละเอียด (ไทย)
                <textarea name="description_th" rows={3} />
              </label>
              <label className="wide">
                Description (English)
                <textarea name="description_en" rows={3} />
              </label>
              <label>
                ราคา
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </label>
              <label>
                ราคาเดิม
                <input
                  name="compare_at_price"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </label>
              <label>
                จำนวน
                <input
                  name="stock_quantity"
                  type="number"
                  min="0"
                  defaultValue="1"
                  required
                />
              </label>
              <label>
                สภาพ
                <select name="condition" defaultValue="good">
                  <option value="new">สินค้าใหม่</option>
                  <option value="like_new">เหมือนใหม่</option>
                  <option value="good">สภาพดี</option>
                  <option value="fair">ผ่านการใช้งาน</option>
                </select>
              </label>
              <label>
                ยี่ห้อ
                <input name="brand" />
              </label>
              <label>
                SKU
                <input name="sku" />
              </label>
              <div className="wide product-upload-editor">
                <div className="upload-heading">
                  <b>รูปสินค้า</b>
                  <small>เลือกได้หลายรูป ระบบจะย่อภาพให้อัตโนมัติ</small>
                </div>
                <div className="media-grid">
                  {draftImages.map((media) => (
                    <div key={media.url}>
                      <img src={media.url} alt="ตัวอย่างสินค้า" />
                      <button
                        type="button"
                        aria-label="ลบรูป"
                        onClick={async () => {
                          await removeStoredMedia(media).catch(() => undefined);
                          setDraftImages((current) =>
                            current.filter((item) => item.url !== media.url),
                          );
                        }}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  ))}
                  <label className="media-add">
                    <UploadCloud />
                    <span>{uploading ? "กำลังอัปโหลด…" : "เพิ่มรูป"}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      aria-label="เลือกรูปสินค้าจากโทรศัพท์"
                      onChange={(event) => {
                        void uploadDraftImages(event.target.files);
                        event.currentTarget.value = "";
                      }}
                      disabled={uploading || draftImages.length >= 8}
                    />
                  </label>
                </div>
              </div>
              <label>
                สถานะ
                <select name="status" defaultValue="draft">
                  <option value="draft">ฉบับร่าง</option>
                  <option value="active">เปิดขาย</option>
                </select>
              </label>
              <label className="feature-check">
                <input name="featured" type="checkbox" /> สินค้าแนะนำ
              </label>
            </div>
            <footer>
              {!productError && (
                <p className="admin-modal-help">
                  ช่องที่จำเป็น: ชื่อสินค้าและราคา · ชื่ออังกฤษกับ Slug สร้างให้อัตโนมัติได้
                </p>
              )}
              {productError && (
                <p className="admin-modal-error" role="alert">
                  {productError}
                </p>
              )}
              <button
                type="button"
                disabled={uploading}
                onClick={() => void discardDraftProduct()}
              >
                ยกเลิก
              </button>
              <button type="submit" disabled={loading || uploading}>
                {loading ? <LoaderCircle className="spin" /> : <Save />}
                {loading ? "กำลังบันทึก…" : "บันทึกสินค้า"}
              </button>
            </footer>
          </form>
        </div>
      )}
      {imageProduct && (
        <div
          className="admin-modal image-manager-modal"
          role="dialog"
          aria-modal="true"
        >
          <section>
            <header>
              <div>
                <b>จัดการรูปสินค้า</b>
                <span>
                  {imageProduct.name_th} · เพิ่ม เปลี่ยน หรือลบรูปได้ตลอดเวลา
                </span>
              </div>
              <button type="button" onClick={() => setImageProduct(null)}>
                <X />
              </button>
            </header>
            <div className="image-manager-body">
              <div className="media-grid">
                {imageProduct.product_images?.map((image) => (
                  <div key={image.id}>
                    <img
                      src={image.url}
                      alt={image.alt_th || imageProduct.name_th}
                    />
                    <button
                      type="button"
                      aria-label="ลบรูป"
                      onClick={() => deleteProductImage(imageProduct, image)}
                    >
                      <Trash2 />
                    </button>
                  </div>
                ))}
                <label className="media-add">
                  <ImagePlus />
                  <span>
                    {uploading ? "กำลังอัปโหลด…" : "เพิ่มรูปจากเครื่อง"}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    aria-label="เลือกรูปสินค้าจากเครื่อง"
                    onChange={(event) => {
                      void addProductImages(imageProduct, event.target.files);
                      event.currentTarget.value = "";
                    }}
                    disabled={
                      uploading ||
                      (imageProduct.product_images?.length || 0) >= 8
                    }
                  />
                </label>
              </div>
              <p>รูปแรกจะเป็นรูปปกสินค้า รองรับสูงสุด 8 รูป</p>
            </div>
            <footer>
              <button type="button" onClick={() => setImageProduct(null)}>
                เสร็จแล้ว
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
