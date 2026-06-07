-- ════════════════════════════════════════════════════════
-- BALIKAVİSTANBUL — SUPABASE VERİTABANI ŞEMASI
-- Supabase SQL Editor'a yapıştırıp çalıştır
-- ════════════════════════════════════════════════════════

-- ── 1. UZANTILAR ─────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 2. KULLANICILARIN PROFİLİ ─────────────────────────────
-- auth.users tablosuna bağlı, otomatik oluşur
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  phone       text,
  role        text default 'customer' check (role in ('customer','admin')),
  created_at  timestamptz default now()
);

-- Yeni kullanıcı kayıt olunca otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 3. ADRESLER ──────────────────────────────────────────
create table public.addresses (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  full_addr   text not null,
  district    text,
  city        text default 'İstanbul',
  zip         text,
  is_default  boolean default false,
  created_at  timestamptz default now()
);

-- ── 4. ÜRÜNLER ───────────────────────────────────────────
create table public.products (
  id          serial primary key,
  name        text not null,
  category    text not null,
  price       numeric(10,2) not null,
  stock       integer default 0,
  description text,
  image_url   text,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── 5. SİPARİŞLER ────────────────────────────────────────
create type order_status as enum (
  'pending','confirmed','processing','shipped','delivered','cancelled','refunded'
);

create table public.orders (
  id              uuid default uuid_generate_v4() primary key,
  order_no        text unique not null,
  user_id         uuid references public.profiles(id) not null,
  status          order_status default 'pending',
  subtotal        numeric(10,2) not null,
  shipping_fee    numeric(10,2) default 0,
  discount        numeric(10,2) default 0,
  total           numeric(10,2) not null,
  address_snap    jsonb,        -- sipariş anındaki adres kopyası
  payment_ref     text,         -- ödeme sağlayıcı referansı
  payment_method  text,
  cargo_code      text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.orders add column if not exists cargo_code text;

-- ── 6. SİPARİŞ KALEMLERİ ─────────────────────────────────
create table public.order_items (
  id          uuid default uuid_generate_v4() primary key,
  order_id    uuid references public.orders(id) on delete cascade not null,
  product_id  integer references public.products(id) not null,
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(10,2) not null,  -- satış anındaki fiyat
  total_price numeric(10,2) not null
);

-- ── 7. DEĞERLENDİRMELER ──────────────────────────────────
create table public.reviews (
  id          uuid default uuid_generate_v4() primary key,
  product_id  integer references public.products(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) not null,
  rating      integer check (rating between 1 and 5) not null,
  comment     text,
  is_approved boolean default false,
  created_at  timestamptz default now(),
  unique(product_id, user_id)  -- bir kullanıcı bir ürüne bir kez yorum yapabilir
);

-- ── 8. KUPON KODLARI ─────────────────────────────────────
create table public.coupons (
  id              uuid default uuid_generate_v4() primary key,
  code            text unique not null,
  discount_type   text check (discount_type in ('percent','fixed')) default 'percent',
  discount_value  numeric(10,2) not null,
  min_order       numeric(10,2) default 0,
  max_uses        integer,
  used_count      integer default 0,
  expires_at      timestamptz,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

-- Varsayılan kupon
insert into public.coupons (code, discount_type, discount_value, min_order)
values ('BALIK10', 'percent', 10, 100);

-- ── 9. SİPARİŞ NUMARASI OLUŞTURUCU ──────────────────────
create or replace function generate_order_no()
returns text language plpgsql as $$
declare
  num text;
begin
  num := 'SP' || to_char(now(), 'YYYYMMDD') || lpad(floor(random()*9999+1)::text, 4, '0');
  return num;
end;
$$;

-- ── 10. UPDATED_AT OTOMATİK GÜNCELLE ────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_products_updated_at before update on public.products
  for each row execute procedure update_updated_at();

create trigger update_orders_updated_at before update on public.orders
  for each row execute procedure update_updated_at();

-- ── 11. ROW LEVEL SECURITY (RLS) ─────────────────────────
alter table public.profiles    enable row level security;
alter table public.addresses   enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews     enable row level security;
alter table public.coupons     enable row level security;

-- Profiles: sadece kendi profilini okuyabilir/güncelleyebilir
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

create policy "profiles_admin" on public.profiles
  for all using (
    exists(select 1 from public.profiles where id=auth.uid() and role='admin')
  );

-- Addresses: sadece kendi adreslerini yönetebilir
create policy "addresses_own" on public.addresses
  for all using (auth.uid() = user_id);

-- Products: herkes okuyabilir, sadece admin yazabilir
create policy "products_read" on public.products
  for select using (is_active = true or
    exists(select 1 from public.profiles where id=auth.uid() and role='admin'));

create policy "products_write" on public.products
  for all using (
    exists(select 1 from public.profiles where id=auth.uid() and role='admin')
  );

-- Orders: kendi siparişlerini görebilir; admin hepsini görebilir
create policy "orders_own" on public.orders
  for select using (
    auth.uid() = user_id or
    exists(select 1 from public.profiles where id=auth.uid() and role='admin')
  );

create policy "orders_insert" on public.orders
  for insert with check (auth.uid() = user_id);

create policy "orders_update_admin" on public.orders
  for update using (
    exists(select 1 from public.profiles where id=auth.uid() and role='admin')
  );

-- Order items: ilgili sipariş sahibi veya admin
create policy "order_items_read" on public.order_items
  for select using (
    exists(
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or
             exists(select 1 from public.profiles where id=auth.uid() and role='admin'))
    )
  );

create policy "order_items_insert" on public.order_items
  for insert with check (
    exists(select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

-- Reviews: onaylı yorumlar herkese açık
create policy "reviews_read" on public.reviews
  for select using (is_approved = true or
    auth.uid() = user_id or
    exists(select 1 from public.profiles where id=auth.uid() and role='admin'));

create policy "reviews_write" on public.reviews
  for insert with check (auth.uid() = user_id);

-- Coupons: sadece admin yönetebilir, kod kontrolü için servis kullanılır
create policy "coupons_admin" on public.coupons
  for all using (
    exists(select 1 from public.profiles where id=auth.uid() and role='admin')
  );

-- ── 12. YARDIMCI VIEW'LAR ────────────────────────────────

-- Admin sipariş listesi (kullanıcı bilgisiyle)
create view public.admin_orders as
  select
    o.*,
    p.full_name as customer_name,
    u.email as customer_email,
    count(oi.id) as item_count
  from public.orders o
  left join public.profiles p on p.id = o.user_id
  left join auth.users u on u.id = o.user_id
  left join public.order_items oi on oi.order_id = o.id
  group by o.id, p.full_name, u.email
  order by o.created_at desc;

-- Ürün istatistikleri
create view public.product_stats as
  select
    p.id, p.name, p.category, p.price, p.stock,
    count(distinct oi.order_id) as total_orders,
    coalesce(sum(oi.quantity), 0) as total_sold,
    coalesce(avg(r.rating), 0)::numeric(3,1) as avg_rating,
    count(distinct r.id) as review_count
  from public.products p
  left join public.order_items oi on oi.product_id = p.id
  left join public.reviews r on r.product_id = p.id and r.is_approved = true
  group by p.id;

-- ── 13. ÖRNEK ÜRÜN VERİSİ ───────────────────────────────
insert into public.products (name, category, price, stock, description) values
  ('Ağır Dip Kurşun Seti',      'kurşun',   89,  50, '20g–60g döküm kurşun seti. Galvaniz kaplama.'),
  ('Hafif Kıyı Kurşun Seti',    'kurşun',   65,  80, '5g–15g hafif kurşun seti.'),
  ('Kaya Takılmaz Kurşun',      'kurşun',  120,  30, 'Kayalık dip için özel form. 40–80g.'),
  ('Pro Mono Misina 0.18mm',    'misina',   75, 100, '150m, şeffaf monofilament.'),
  ('Florokarbon Misina 0.25mm', 'misina',  145,  60, '100m, neredeyse görünmez.'),
  ('PE Örgü İp 8x 0.16mm',     'misina',  195,  40, '200m, 8 katlı örgü PE.'),
  ('Karbon Kıyı Kamışı 4.2m',  'olta',    480,  20, '40–120g atış, karbon blank.'),
  ('Tekne Olta Komple Seti',   'olta',    850,  15, '1.8m kamış + 5000 makara + iğne seti.'),
  ('Ultra Hafif Spin 2.7m',    'olta',    320,  25, 'Lüfer & levrek spin, aksiyon uç.'),
  ('Jig İğne Karışık Set',     'iğne',     45, 200, 'No 4–8 karışık 20 adet.'),
  ('Karagöz Kirpi İğnesi',     'iğne',     38, 150, '3D kirpi form, No 6–10, 15 adet.'),
  ('Üçlü Çengel Set',          'iğne',     52, 120, 'Kaçış önleyici, 10 adet.'),
  ('Silikon Solucan Yem Seti', 'yem',     165,  60, 'Karagöz, çupra için, 20 adet.'),
  ('Hamsi & Sardalya Yem',     'yem',     210,  40, 'Taze kesilmiş, lüfer için.'),
  ('Ahtapot & Kalamar Yem',    'yem',      95,  55, 'Levrek, kırlangıç için.'),
  ('Pro Balıkçı Yeleği',       'aksesuar', 375,  30, '14 cepli, su geçirmez.'),
  ('Dijital Balık Terazisi',   'aksesuar', 145,  45, '50kg kapasite, USB şarj.'),
  ('Hızlı Misina Sarıcı',      'aksesuar',  85,  35, 'Tüm makaralara uyar.'),
  ('Katlanabilir Olta Kovası',  'aksesuar', 120,  50, '10L PVC, katlanır.'),
  ('Başlangıç Komple Set',     'aksesuar', 280,  20, '2.7m kamış + tüm aksesuarlar.');

-- ── 14. İLK ADMİN KULLANICI ──────────────────────────────
-- Kayıt olduktan sonra kendi kullanıcı ID'nizi buraya yazın:
-- update public.profiles set role = 'admin' where id = 'YOUR-USER-UUID';

-- ── 15. STOK DÜŞME RPC FONKSİYONU ──────────────────────
create or replace function public.decrement_stock(product_id int, qty int)
returns void language plpgsql security definer as $$
begin
  update public.products
  set stock = greatest(0, stock - qty)
  where id = product_id;
end;
$$;

grant execute on function public.decrement_stock(int, int) to authenticated;

-- ── 16. TOPLULUK SOHBET MESAJLARI ────────────────────────
create table if not exists public.messages (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  content     text not null check (length(content) between 1 and 500),
  created_at  timestamptz default now()
);

alter table public.messages enable row level security;

-- Herkes okuyabilir
create policy "messages_read" on public.messages
  for select using (true);

-- Giriş yapan kullanıcı yazabilir
create policy "messages_insert" on public.messages
  for insert with check (auth.uid() = user_id);

-- Supabase Realtime için yayın aktif et
alter publication supabase_realtime add table public.messages;
