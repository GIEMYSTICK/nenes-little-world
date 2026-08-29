-- Nene's Little World: CMS + commerce schema
-- Run this entire file once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

do $$ begin create type public.app_role as enum ('admin', 'editor'); exception when duplicate_object then null; end $$;
do $$ begin create type public.product_status as enum ('draft', 'active', 'sold', 'out_of_stock'); exception when duplicate_object then null; end $$;
do $$ begin create type public.product_condition as enum ('new', 'like_new', 'good', 'fair'); exception when duplicate_object then null; end $$;
do $$ begin create type public.order_status as enum ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type public.consignment_status as enum ('new', 'reviewing', 'accepted', 'listed', 'declined', 'completed'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role public.app_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_th text not null,
  name_en text not null,
  icon text not null default '♡',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_th text not null,
  name_en text not null,
  description_th text not null default '',
  description_en text not null default '',
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  currency char(3) not null default 'THB',
  sku text unique,
  stock_quantity integer not null default 1 check (stock_quantity >= 0),
  condition public.product_condition not null default 'good',
  brand text,
  featured boolean not null default false,
  status public.product_status not null default 'draft',
  source text not null default 'nene' check (source in ('nene', 'consignment')),
  consignment_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_th text,
  alt_en text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  phone text,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('NENE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_id uuid references public.customers(id) on delete set null,
  customer_email text not null,
  customer_name text,
  customer_phone text,
  shipping_address jsonb not null default '{}'::jsonb,
  subtotal numeric(12,2) not null default 0,
  shipping_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency char(3) not null default 'THB',
  status public.order_status not null default 'pending',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_sku text,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) generated always as (unit_price * quantity) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.consignment_submissions (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique default ('CON-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  seller_name text not null,
  seller_email text not null,
  seller_phone text not null,
  category_id uuid references public.categories(id) on delete set null,
  item_name text not null,
  brand text,
  condition public.product_condition not null,
  description text not null,
  expected_price numeric(12,2) check (expected_price is null or expected_price >= 0),
  image_urls jsonb not null default '[]'::jsonb,
  status public.consignment_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products drop constraint if exists products_consignment_id_fkey;
alter table public.products add constraint products_consignment_id_fkey foreign key (consignment_id) references public.consignment_submissions(id) on delete set null;

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  content_key text not null,
  locale text not null check (locale in ('th', 'en')),
  title text not null default '',
  body text not null default '',
  payload jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_key, locale)
);

create index if not exists products_category_status_idx on public.products(category_id, status);
create index if not exists products_featured_idx on public.products(featured) where status = 'active';
create index if not exists orders_status_created_idx on public.orders(status, created_at desc);
create index if not exists consignments_status_created_idx on public.consignment_submissions(status, created_at desc);
create index if not exists product_images_product_sort_idx on public.product_images(product_id, sort_order);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','categories','products','customers','orders','consignment_submissions','site_content'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name);
  end loop;
end $$;

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin','editor')); $$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.consignment_submissions enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "Public reads active categories" on public.categories;
create policy "Public reads active categories" on public.categories for select using (is_active or public.is_staff());
drop policy if exists "Public reads active products" on public.products;
create policy "Public reads active products" on public.products for select using (status = 'active' or public.is_staff());
drop policy if exists "Public reads active product images" on public.product_images;
create policy "Public reads active product images" on public.product_images for select using (exists(select 1 from public.products p where p.id = product_id and (p.status = 'active' or public.is_staff())));
drop policy if exists "Public reads published content" on public.site_content;
create policy "Public reads published content" on public.site_content for select using (is_published or public.is_staff());
drop policy if exists "Anyone submits consignment" on public.consignment_submissions;
create policy "Anyone submits consignment" on public.consignment_submissions for insert to anon, authenticated with check (status = 'new');

drop policy if exists "Staff manages categories" on public.categories;
create policy "Staff manages categories" on public.categories for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manages products" on public.products;
create policy "Staff manages products" on public.products for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manages product images" on public.product_images;
create policy "Staff manages product images" on public.product_images for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manages content" on public.site_content;
create policy "Staff manages content" on public.site_content for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff reads profiles" on public.profiles;
create policy "Staff reads profiles" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff());
drop policy if exists "Staff manages orders" on public.orders;
create policy "Staff manages orders" on public.orders for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manages order items" on public.order_items;
create policy "Staff manages order items" on public.order_items for all to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Staff manages consignments" on public.consignment_submissions;
create policy "Staff manages consignments" on public.consignment_submissions for all to authenticated using (public.is_staff()) with check (public.is_staff());

insert into public.categories (slug, name_th, name_en, icon, sort_order) values
  ('feeding', 'ขวดนมและการให้นม', 'Feeding', '🍼', 10),
  ('diapers', 'ผ้าอ้อมและของใช้', 'Diapers & Care', '☁️', 20),
  ('strollers', 'รถเข็นและคาร์ซีท', 'Strollers & Car Seats', '🛞', 30),
  ('clothing', 'เสื้อผ้าเด็ก', 'Baby Clothing', '🧸', 40),
  ('mom-care', 'ของใช้คุณแม่', 'Mom Essentials', '♡', 50),
  ('toys', 'ของเล่นและพัฒนาการ', 'Toys & Learning', '✦', 60)
on conflict (slug) do update set name_th = excluded.name_th, name_en = excluded.name_en, icon = excluded.icon, sort_order = excluded.sort_order;

insert into public.site_content (content_key, locale, title, body) values
  ('home_hero', 'th', 'ยินดีต้อนรับสู่โลกใบเล็ก ๆ ของเนเน่', 'เรื่องราวเล็ก ๆ ของเด็กผู้หญิงตัวน้อยที่ทำให้โลกของเราสดใสขึ้นทุกวัน'),
  ('home_hero', 'en', 'Welcome to my little world', 'A little corner filled with smiles, wonder, and love.'),
  ('home_profile', 'th', 'Hello, I''m Nene', 'ภาพแนะนำตัวเนเน่บนหน้าแรก'),
  ('home_profile', 'en', 'Hello, I''m Nene', 'Nene''s introduction photo on the home page'),
  ('home_chapter', 'th', 'Our current little chapter', 'ภาพอัปเดตการเติบโตของเนเน่ในบทปัจจุบัน'),
  ('home_chapter', 'en', 'Our current little chapter', 'Nene''s latest growth photo'),
  ('home_letter', 'th', 'A Letter From Mom & Dad', 'ภาพประกอบจดหมายจากพ่อและแม่'),
  ('home_letter', 'en', 'A Letter From Mom & Dad', 'Photo beside the letter from Mom and Dad'),
  ('home_gallery', 'th', 'Little Moments', 'จัดการภาพความทรงจำในแกลเลอรีทั้งเว็บไซต์ภาษาไทยและอังกฤษ'),
  ('shop_hero', 'th', 'ของรักของเนเน่ ส่งต่อด้วยความใส่ใจ', 'สินค้าสำหรับแม่และเด็กที่คัดสรรแล้ว พร้อมเรื่องราวและรายละเอียดสภาพอย่างตรงไปตรงมา'),
  ('shop_hero', 'en', 'Loved by Nene, ready for a new family', 'Thoughtfully selected essentials for babies and parents, with honest condition details and a story behind every item.')
on conflict (content_key, locale) do nothing;

-- After creating an admin in Authentication > Users, promote that account once:
-- insert into public.profiles (id, display_name, role)
-- values ('PASTE_AUTH_USER_UUID_HERE', 'Nene Admin', 'admin')
-- on conflict (id) do update set role = 'admin';
