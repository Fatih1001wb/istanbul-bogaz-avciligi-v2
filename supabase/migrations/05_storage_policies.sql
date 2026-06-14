-- ╔══════════════════════════════════════════════════════════╗
-- ║   PB STORE - SUPABASE STORAGE POLICIES                   ║
-- ║   Resim yükleme güvenliği                                 ║
-- ╚══════════════════════════════════════════════════════════╝
--
-- ÖNEMLİ: Bu SQL'i çalıştırmadan ÖNCE bucket'ları manuel oluştur:
-- 1. Supabase Dashboard → Storage
-- 2. "New Bucket" → Adı: product-images, Public: ✓ (Halka açık)
-- 3. "New Bucket" → Adı: user-avatars, Public: ✓ (Halka açık)
--
-- Sonra bu SQL'i çalıştır.

-- ════════════════════════════════════════════════════════════
-- 1. PRODUCT IMAGES BUCKET
-- ════════════════════════════════════════════════════════════
-- Herkes ürün resimlerini görebilir (zaten açık)
CREATE POLICY "Ürün resimlerini herkes görür"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Sadece admin ürün resmi yükleyebilir
CREATE POLICY "Sadece admin ürün resmi yükler"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Sadece admin günceller
CREATE POLICY "Sadece admin ürün resmi günceller"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Sadece admin siler
CREATE POLICY "Sadece admin ürün resmi siler"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- ════════════════════════════════════════════════════════════
-- 2. USER AVATARS BUCKET
-- ════════════════════════════════════════════════════════════
-- Herkes avatarları görebilir
CREATE POLICY "Avatarları herkes görür"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-avatars');

-- Kullanıcı kendi avatarını yükleyebilir
-- Dosya adı format: {user_id}.{ext}
CREATE POLICY "Kullanıcı kendi avatarını yükler"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Kullanıcı kendi avatarını günceller"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Kullanıcı kendi avatarını siler"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ════════════════════════════════════════════════════════════
-- BAŞARILI!
-- ════════════════════════════════════════════════════════════
SELECT 'Storage policies kuruldu!' AS sonuc;
