-- ════════════════════════════════════════════════════════════════
-- 🐟 BALIKAVİSTANBUL — TEK TIKLA KURULUM
-- 
-- Bu dosyayı yeni Supabase projende:
-- 1. SQL Editor'a yapıştır
-- 2. RUN butonuna bas
-- 
-- Tüm tablolar, RLS, ürünler, sohbet, dosya yükleme... her şey kurulur.
-- 
-- ÖNEMLİ: Önce sitende "Kayıt Ol" ile bir hesap aç,
-- SONRA bu SQL'i çalıştır. En sondaki bölüm,
-- en son kayıt olan kullanıcıyı otomatik admin yapar.
-- ════════════════════════════════════════════════════════════════


-- ┌──────────────────────────────────────────────────────┐
-- │ BÖLÜM 1: TEMEL ŞEMA                                  │
-- └──────────────────────────────────────────────────────┘

-- Uzantılar
create extension if not exists "uuid-ossp";

-- ── KULLANICI PROFİLİ ──
create table if not exists public.profiles (
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
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── ADRESLER ──
create table if not exists public.addresses (
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

-- ── ÜRÜNLER ──
create table if not exists public.products (
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

-- ── SİPARİŞLER ──
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum (
      'pending','confirmed','processing','shipped','delivered','cancelled','refunded'
    );
  end if;
end$$;

create table if not exists public.orders (
  id              uuid default uuid_generate_v4() primary key,
  order_no        text unique not null,
  user_id         uuid references public.profiles(id) not null,
  status          order_status default 'pending',
  subtotal        numeric(10,2) not null,
  shipping_fee    numeric(10,2) default 0,
  discount        numeric(10,2) default 0,
  total           numeric(10,2) not null,
  address_snap    jsonb,
  payment_ref     text,
  payment_method  text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── SİPARİŞ KALEMLERİ (gram desteğiyle) ──
create table if not exists public.order_items (
  id          uuid default uuid_generate_v4() primary key,
  order_id    uuid references public.orders(id) on delete cascade not null,
  product_id  integer references public.products(id) not null,
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(10,2) not null,
  total_price numeric(10,2) not null,
  gram        integer null  -- kurşun ürünleri için seçilen gram
);

-- Eski tablolar için kolon ekle
alter table public.order_items add column if not exists gram integer null;

-- ── DEĞERLENDİRMELER ──
create table if not exists public.reviews (
  id          uuid default uuid_generate_v4() primary key,
  product_id  integer references public.products(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) not null,
  rating      integer check (rating between 1 and 5) not null,
  comment     text,
  is_approved boolean default false,
  created_at  timestamptz default now(),
  unique(product_id, user_id)
);

-- ── KUPONLAR ──
create table if not exists public.coupons (
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
values ('BALIK10', 'percent', 10, 100)
on conflict (code) do nothing;

-- ── TOPLULUK SOHBETİ (15 ilçe gruplu + dosya destekli) ──
create table if not exists public.messages (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  content         text null,                   -- nullable: sadece dosya da gönderilebilir
  district_id     text default 'general',      -- 'sariyer', 'kadikoy', vs.
  attachment_url  text     null,
  attachment_name text     null,
  attachment_type text     null,
  attachment_size integer  null,
  created_at      timestamptz default now(),
  check (content is not null or attachment_url is not null),
  check (content is null or length(content) between 1 and 500)
);

-- Mevcut tabloya kolonları ekle (idempotent)
alter table public.messages add column if not exists district_id text default 'general';
alter table public.messages add column if not exists attachment_url   text null;
alter table public.messages add column if not exists attachment_name  text null;
alter table public.messages add column if not exists attachment_type  text null;
alter table public.messages add column if not exists attachment_size  integer null;

-- content nullable yap (idempotent dene)
do $$
begin
  alter table public.messages alter column content drop not null;
exception when others then null;
end$$;

create index if not exists messages_district_created_idx
  on public.messages(district_id, created_at desc);


-- ┌──────────────────────────────────────────────────────┐
-- │ BÖLÜM 2: YARDIMCI FONKSİYONLAR                       │
-- └──────────────────────────────────────────────────────┘

create or replace function generate_order_no()
returns text language plpgsql as $$
declare num text;
begin
  num := 'SP' || to_char(now(), 'YYYYMMDD') || lpad(floor(random()*9999+1)::text, 4, '0');
  return num;
end;
$$;

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at before update on public.products
  for each row execute procedure update_updated_at();

drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at before update on public.orders
  for each row execute procedure update_updated_at();

-- Stok düşürme
create or replace function public.decrement_stock(product_id int, qty int)
returns void language plpgsql security definer as $$
begin
  update public.products
  set stock = greatest(0, stock - qty)
  where id = product_id;
end;
$$;

grant execute on function public.decrement_stock(int, int) to authenticated;


-- ┌──────────────────────────────────────────────────────┐
-- │ BÖLÜM 3: ROW LEVEL SECURITY (RLS)                    │
-- └──────────────────────────────────────────────────────┘

alter table public.profiles    enable row level security;
alter table public.addresses   enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews     enable row level security;
alter table public.coupons     enable row level security;
alter table public.messages    enable row level security;

-- Politikaları yeniden oluştur (idempotent)
drop policy if exists "profiles_own"          on public.profiles;
drop policy if exists "profiles_admin"        on public.profiles;
drop policy if exists "addresses_own"         on public.addresses;
drop policy if exists "products_read"         on public.products;
drop policy if exists "products_write"        on public.products;
drop policy if exists "orders_own"            on public.orders;
drop policy if exists "orders_insert"         on public.orders;
drop policy if exists "orders_update_admin"   on public.orders;
drop policy if exists "order_items_read"      on public.order_items;
drop policy if exists "order_items_insert"    on public.order_items;
drop policy if exists "reviews_read"          on public.reviews;
drop policy if exists "reviews_write"         on public.reviews;
drop policy if exists "coupons_admin"         on public.coupons;
drop policy if exists "messages_read"         on public.messages;
drop policy if exists "messages_insert"       on public.messages;

-- Profiles
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);
create policy "profiles_admin" on public.profiles
  for all using (
    exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
  );

-- Addresses
create policy "addresses_own" on public.addresses
  for all using (auth.uid() = user_id);

-- Products
create policy "products_read" on public.products
  for select using (is_active = true or
    exists(select 1 from public.profiles where id=auth.uid() and role='admin'));
create policy "products_write" on public.products
  for all using (
    exists(select 1 from public.profiles where id=auth.uid() and role='admin')
  );

-- Orders
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

-- Order Items
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

-- Reviews
create policy "reviews_read" on public.reviews
  for select using (is_approved = true or
    auth.uid() = user_id or
    exists(select 1 from public.profiles where id=auth.uid() and role='admin'));
create policy "reviews_write" on public.reviews
  for insert with check (auth.uid() = user_id);

-- Coupons
create policy "coupons_admin" on public.coupons
  for all using (
    exists(select 1 from public.profiles where id=auth.uid() and role='admin')
  );

-- Messages
create policy "messages_read" on public.messages
  for select using (true);
create policy "messages_insert" on public.messages
  for insert with check (auth.uid() = user_id);


-- ┌──────────────────────────────────────────────────────┐
-- │ BÖLÜM 4: REALTIME (anlık mesaj akışı)                │
-- └──────────────────────────────────────────────────────┘

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end$$;


-- ┌──────────────────────────────────────────────────────┐
-- │ BÖLÜM 5: STORAGE (dosya yükleme bucket)              │
-- └──────────────────────────────────────────────────────┘

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-uploads', 'chat-uploads', true, 10485760,
  array[
    'image/jpeg','image/jpg','image/png','image/webp','image/gif',
    'application/pdf',
    'application/zip','application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chat_uploads_read"   on storage.objects;
drop policy if exists "chat_uploads_insert" on storage.objects;
drop policy if exists "chat_uploads_delete" on storage.objects;

create policy "chat_uploads_read"
  on storage.objects for select
  using (bucket_id = 'chat-uploads');

create policy "chat_uploads_insert"
  on storage.objects for insert
  with check (bucket_id = 'chat-uploads' and auth.role() = 'authenticated');

create policy "chat_uploads_delete"
  on storage.objects for delete
  using (bucket_id = 'chat-uploads' and auth.uid() = owner);


-- ┌──────────────────────────────────────────────────────┐
-- │ BÖLÜM 6: ÖRNEK ÜRÜN VERİSİ (gerçekçi 2026 fiyatlar)  │
-- └──────────────────────────────────────────────────────┘

-- Mevcut ürün yoksa ekle (idempotent)
insert into public.products (id, name, category, price, stock, description)
values
  (1,  'Hafif Kurşun (5–45g)',         'kurşun',    120,  80, 'Sakin koşullar için hafif döküm kurşun.'),
  (2,  'Orta Kurşun (50–100g)',        'kurşun',    185,  60, 'Orta akıntı koşulları için ideal.'),
  (3,  'Ağır Kurşun (105–160g)',       'kurşun',    295,  40, 'Surf casting, sert akıntı için ağır kurşun.'),
  (4,  'Mono Misina 0.16mm 100m',      'misina',    115, 100, 'Şeffaf monofilament, hassas av.'),
  (5,  'Mono Misina 0.22mm 100m',      'misina',    145,  90, 'Orta kalınlık monofilament.'),
  (6,  'Mono Misina 0.30mm 100m',      'misina',    195,  70, 'Kalın mono, büyük balık için.'),
  (7,  'PE Örgü Misina 0.16mm 100m',   'misina',    285,  50, '8 katlı örgü PE, hassas spin.'),
  (8,  'PE Örgü Misina 0.22mm 100m',   'misina',    365,  45, 'Orta sınıf PE örgü.'),
  (9,  'PE Örgü Misina 0.30mm 100m',   'misina',    445,  35, 'Ağır iş için kalın PE.'),
  (10, 'Spin Kamışı Hafif 2.7m',       'olta',     1250,  20, 'Lüfer & levrek için aksiyon uçlu spin.'),
  (11, 'Surf Oltası 4.5m',             'olta',     2350,  12, 'Kıyıdan uzak atış, ağır kurşun uyumlu.'),
  (12, 'Jig İğne Karışık Set',         'iğne',       75, 200, 'No 4–8 karışık 20 adet.'),
  (13, 'Karagöz Kirpi İğnesi',         'iğne',       55, 150, '3D kirpi form, No 6–10, 15 adet.'),
  (14, 'Üçlü Çengel Set',              'iğne',       85, 120, 'Kaçış önleyici üçlü çengel, 10 adet.'),
  (15, 'Silikon Solucan Yem Seti',     'yem',       195,  60, 'Karagöz, çupra için, 20 adet.'),
  (16, 'Hamsi & Sardalya Yem',         'yem',       245,  40, 'Taze kesilmiş, lüfer için.'),
  (17, 'Ahtapot & Kalamar Yem',        'yem',       165,  55, 'Levrek ve çupra için ideal.'),
  (18, 'Pro Balıkçı Yeleği',           'aksesuar',  695,  30, '14 cepli, su geçirmez Cordura.'),
  (19, 'Dijital Balık Terazisi',       'aksesuar',  425,  45, '50kg kapasite, USB şarj.'),
  (20, 'Hızlı Misina Sarıcı',          'aksesuar',  165,  35, 'Tüm makaralara uyumlu.')
on conflict (id) do update set
  price = excluded.price,
  name  = excluded.name,
  stock = excluded.stock,
  description = excluded.description;

-- Sequence'i güncelle ki yeni ürünler 21'den başlasın
select setval('products_id_seq', (select max(id) from public.products));


-- ┌──────────────────────────────────────────────────────┐
-- │ BÖLÜM 7: 🔑 İLK ADMİN — EN SON KAYIT OLAN OTOMATİK   │
-- └──────────────────────────────────────────────────────┘
-- 
-- En son kayıt olan kullanıcı (yani sen) otomatik admin olur.
-- Eğer hiç kullanıcı yoksa, bu kısım sessizce atlanır.
-- 
-- ÇOK ÖNEMLİ: Önce sitenden "Kayıt Ol" ile bir hesap aç.
-- Sonra bu SQL'i çalıştır. Otomatik admin olursun.

update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  order by created_at desc
  limit 1
);

-- Sonucu göster
do $$
declare admin_email text;
begin
  select u.email into admin_email
  from auth.users u
  join public.profiles p on p.id = u.id
  where p.role = 'admin'
  order by p.created_at desc
  limit 1;
  
  if admin_email is not null then
    raise notice '✅ ADMİN OLDU: %', admin_email;
  else
    raise notice '⚠️  Henüz kayıt olmuş kullanıcı yok. Sitede "Kayıt Ol" yapıp bu SQL''in BÖLÜM 7''sini tekrar çalıştır.';
  end if;
end$$;


-- ════════════════════════════════════════════════════════════════
-- ✅ KURULUM TAMAM
-- 
-- Şimdi admin.html sayfasına git, kayıt olduğun e-posta ve
-- şifre ile giriş yap. Admin paneli açılacak.
-- ════════════════════════════════════════════════════════════════
