-- ╔══════════════════════════════════════════════════════════╗
-- ║   PB STORE - SUPABASE DATABASE SCHEMA                    ║
-- ║   Versiyon: 1.0 · Tarih: 2026                            ║
-- ╚══════════════════════════════════════════════════════════╝
--
-- Bu dosyayı Supabase'in SQL Editor'ünde çalıştır.
-- Dashboard → SQL Editor → New Query → bu SQL'i yapıştır → Run
--
-- KURULUM SIRASI (önemli!):
-- 1. Önce bu dosyayı çalıştır (01_schema.sql)
-- 2. Sonra 02_rls_policies.sql
-- 3. Sonra 03_functions_triggers.sql
-- 4. Son olarak 04_seed_data.sql (örnek veriler)

-- ════════════════════════════════════════════════════════════
-- EKSTRA EKLENTİLER
-- ════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ════════════════════════════════════════════════════════════
-- 1. PROFILES (Kullanıcı profilleri)
-- ════════════════════════════════════════════════════════════
-- auth.users tablosunu Supabase otomatik oluşturur.
-- Biz onun yanına ek profil bilgileri tutuyoruz.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  birth_date DATE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  kvkk_accepted_at TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT false,
  total_orders INT DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  loyalty_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Kullanıcı profil bilgileri';

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- ════════════════════════════════════════════════════════════
-- 2. ADDRESSES (Adresler)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,  -- "Ev", "İş", vb.
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT DEFAULT 'Türkiye',
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  neighborhood TEXT,
  full_address TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON public.addresses(user_id);

-- ════════════════════════════════════════════════════════════
-- 3. CATEGORIES (Kategoriler)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,  -- 'erkek-bakim'
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,  -- Font Awesome class
  emoji TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);

-- ════════════════════════════════════════════════════════════
-- 4. PRODUCTS (Ürünler)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  short_description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  old_price NUMERIC(12, 2) CHECK (old_price >= 0),
  cost_price NUMERIC(12, 2),  -- Maliyet (sadece admin görür)
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold INT DEFAULT 5,
  images JSONB DEFAULT '[]'::JSONB,  -- ["url1", "url2", ...]
  icon TEXT,  -- Fallback icon
  badges TEXT[] DEFAULT '{}',  -- ['new', 'sale', 'bestseller']
  attributes JSONB DEFAULT '{}'::JSONB,  -- {color: "red", size: "M"}
  meta_title TEXT,
  meta_description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  rating NUMERIC(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_subcategory ON public.products(subcategory_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);
CREATE INDEX idx_products_search ON public.products USING GIN (to_tsvector('turkish', name || ' ' || COALESCE(description, '')));

-- ════════════════════════════════════════════════════════════
-- 5. FAVORITES (Favoriler)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- ════════════════════════════════════════════════════════════
-- 6. CART (Sepet)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_user ON public.cart_items(user_id);

-- ════════════════════════════════════════════════════════════
-- 7. ORDERS (Siparişler)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,  -- 'PB-2026-3471'
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial_refund')),

  -- Adres
  shipping_address JSONB NOT NULL,  -- Snapshot, address değişse de eski kalır
  billing_address JSONB,

  -- Tutarlar
  subtotal NUMERIC(12, 2) NOT NULL,
  shipping_cost NUMERIC(12, 2) DEFAULT 0,
  tax NUMERIC(12, 2) DEFAULT 0,
  discount NUMERIC(12, 2) DEFAULT 0,
  discount_code TEXT,
  total NUMERIC(12, 2) NOT NULL,

  -- Kargo
  shipping_method TEXT,  -- 'standart', 'hizli', 'aksam_teslim'
  tracking_number TEXT,
  shipping_carrier TEXT,

  -- Ödeme
  payment_method TEXT,  -- 'credit_card', 'havale', 'kapida'
  payment_provider TEXT DEFAULT 'iyzico',

  -- Notlar
  customer_note TEXT,
  admin_note TEXT,  -- sadece admin görür

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_orders_number ON public.orders(order_number);

-- ════════════════════════════════════════════════════════════
-- 8. ORDER ITEMS (Sipariş Kalemleri)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  -- Snapshot - ürün silinse de bilgi kalır
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- ════════════════════════════════════════════════════════════
-- 9. REVIEWS (Yorumlar)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id, order_id)
);

CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_reviews_approved ON public.reviews(is_approved);

-- ════════════════════════════════════════════════════════════
-- 10. COUPONS (Kuponlar)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL,
  min_purchase NUMERIC(12, 2) DEFAULT 0,
  max_discount NUMERIC(12, 2),
  usage_limit INT,
  usage_count INT DEFAULT 0,
  user_limit INT DEFAULT 1,  -- Bir kullanıcı kaç kere kullanabilir
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active);

-- ════════════════════════════════════════════════════════════
-- 11. COUPON USAGE (Kupon Kullanım Geçmişi)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupon_usage_user ON public.coupon_usage(user_id);

-- ════════════════════════════════════════════════════════════
-- 12. AUDIT LOGS (Admin İşlem Logları - Güvenlik)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,  -- 'create_product', 'update_order', vb.
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);

-- ════════════════════════════════════════════════════════════
-- BAŞARILI!
-- ════════════════════════════════════════════════════════════
-- Sonraki adım: 02_rls_policies.sql çalıştır

SELECT 'Database schema oluşturuldu! Sonraki: 02_rls_policies.sql' AS sonuc;
