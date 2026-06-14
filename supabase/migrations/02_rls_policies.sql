-- ╔══════════════════════════════════════════════════════════╗
-- ║   PB STORE - ROW LEVEL SECURITY (RLS) POLICIES           ║
-- ║   GÜVENLİK: Hiç kimse başkasının verisini göremez        ║
-- ╚══════════════════════════════════════════════════════════╝
--
-- BU ÇOK ÖNEMLİ! Bu olmadan tüm veriler herkese açıktır.
-- Mutlaka 01_schema.sql çalıştıktan SONRA çalıştır.

-- ════════════════════════════════════════════════════════════
-- 1. RLS'i tüm tablolarda aktif et
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════════════════
-- YARDIMCI FONKSİYON: Mevcut kullanıcı admin mi?
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'staff')
  );
$$;

-- ════════════════════════════════════════════════════════════
-- 2. PROFILES (Profil)
-- ════════════════════════════════════════════════════════════
-- Kullanıcı sadece kendi profilini görür/düzenler
CREATE POLICY "Kullanıcı kendi profilini görür"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Kullanıcı kendi profilini günceller"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Profil ekleme trigger ile otomatik yapılır, kimse direkt INSERT yapamaz
-- Ama admin yapabilir
CREATE POLICY "Sadece admin profil ekler"
  ON public.profiles FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Sadece admin profil siler"
  ON public.profiles FOR DELETE
  USING (is_admin());

-- ════════════════════════════════════════════════════════════
-- 3. ADDRESSES (Adresler)
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Kullanıcı kendi adreslerini görür"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Kullanıcı kendi adresini ekler"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi adresini günceller"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi adresini siler"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 4. CATEGORIES (Kategoriler) - Herkese açık okuma
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Aktif kategorileri herkes görür"
  ON public.categories FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Sadece admin kategori ekler"
  ON public.categories FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Sadece admin kategori günceller"
  ON public.categories FOR UPDATE
  USING (is_admin());

CREATE POLICY "Sadece admin kategori siler"
  ON public.categories FOR DELETE
  USING (is_admin());

-- ════════════════════════════════════════════════════════════
-- 5. PRODUCTS (Ürünler) - Herkese açık okuma
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Aktif ürünleri herkes görür"
  ON public.products FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Sadece admin ürün ekler"
  ON public.products FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Sadece admin ürün günceller"
  ON public.products FOR UPDATE
  USING (is_admin());

CREATE POLICY "Sadece admin ürün siler"
  ON public.products FOR DELETE
  USING (is_admin());

-- ════════════════════════════════════════════════════════════
-- 6. FAVORITES (Favoriler) - Sadece kendi favorin
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Kullanıcı kendi favorilerini görür"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi favorisini ekler"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi favorisini siler"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 7. CART (Sepet) - Sadece kendi sepetin
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Kullanıcı kendi sepetini görür"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi sepetine ürün ekler"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi sepetini günceller"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi sepetinden siler"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 8. ORDERS (Siparişler) - Çok hassas!
-- ════════════════════════════════════════════════════════════
-- Kullanıcı sadece kendi siparişlerini görür
CREATE POLICY "Kullanıcı kendi siparişlerini görür"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

-- Kullanıcı kendi siparişini oluşturabilir (checkout sırasında)
CREATE POLICY "Kullanıcı kendi siparişini oluşturur"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- SADECE ADMIN günceller (kullanıcı kendi siparişini değiştiremez)
CREATE POLICY "Sadece admin sipariş günceller"
  ON public.orders FOR UPDATE
  USING (is_admin());

-- SADECE ADMIN siler (genelde silme yerine cancel kullanılır)
CREATE POLICY "Sadece admin sipariş siler"
  ON public.orders FOR DELETE
  USING (is_admin());

-- ════════════════════════════════════════════════════════════
-- 9. ORDER ITEMS (Sipariş Kalemleri)
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Kullanıcı kendi sipariş kalemlerini görür"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Sipariş oluşturulurken kalemler eklenir"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Sadece admin sipariş kalemini günceller"
  ON public.order_items FOR UPDATE
  USING (is_admin());

CREATE POLICY "Sadece admin sipariş kalemini siler"
  ON public.order_items FOR DELETE
  USING (is_admin());

-- ════════════════════════════════════════════════════════════
-- 10. REVIEWS (Yorumlar)
-- ════════════════════════════════════════════════════════════
-- Onaylanmış yorumları herkes görür
CREATE POLICY "Onaylı yorumları herkes görür"
  ON public.reviews FOR SELECT
  USING (is_approved = true OR user_id = auth.uid() OR is_admin());

-- Sadece kayıtlı kullanıcı yorum yazabilir
CREATE POLICY "Kullanıcı yorum yazabilir"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcı kendi yorumunu güncelleyebilir
CREATE POLICY "Kullanıcı kendi yorumunu günceller"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id OR is_admin());

-- Sadece admin yorumu silebilir
CREATE POLICY "Sadece admin yorum siler"
  ON public.reviews FOR DELETE
  USING (is_admin());

-- ════════════════════════════════════════════════════════════
-- 11. COUPONS (Kuponlar)
-- ════════════════════════════════════════════════════════════
-- Aktif kuponları herkes görebilir (sepet'te uygulamak için)
CREATE POLICY "Aktif kuponları herkes görür"
  ON public.coupons FOR SELECT
  USING (is_active = true AND (ends_at IS NULL OR ends_at > NOW()) OR is_admin());

CREATE POLICY "Sadece admin kupon ekler"
  ON public.coupons FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Sadece admin kupon günceller"
  ON public.coupons FOR UPDATE
  USING (is_admin());

CREATE POLICY "Sadece admin kupon siler"
  ON public.coupons FOR DELETE
  USING (is_admin());

-- ════════════════════════════════════════════════════════════
-- 12. COUPON USAGE (Kupon Kullanımları)
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Kullanıcı kendi kupon kullanımını görür"
  ON public.coupon_usage FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Kullanıcı kupon kullanır"
  ON public.coupon_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════
-- 13. AUDIT LOGS - Sadece admin görür
-- ════════════════════════════════════════════════════════════
CREATE POLICY "Sadece admin audit log görür"
  ON public.audit_logs FOR SELECT
  USING (is_admin());

-- Audit logları otomatik eklenir, RLS bypass eden trigger var

-- ════════════════════════════════════════════════════════════
-- BAŞARILI!
-- ════════════════════════════════════════════════════════════
SELECT 'RLS politikaları kuruldu! Sonraki: 03_functions_triggers.sql' AS sonuc;
