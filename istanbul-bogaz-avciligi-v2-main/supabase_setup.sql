-- ════════════════════════════════════════════════════════
-- SUPABASE KURULUM TAMAMLAMA
-- Supabase → SQL Editor'a yapıştır, sırayla çalıştır
-- ════════════════════════════════════════════════════════

-- ── 1. VARSAYILAN KUPON EKLE (yoksa) ────────────────────
insert into public.coupons (code, discount_type, discount_value, min_order)
values ('BALIK10', 'percent', 10, 100)
on conflict (code) do nothing;

-- ── 2. KUPON OKUMA POLİTİKASI (giriş yapan kullanıcılar) ─
-- Mevcut policy sadece admini kapsıyor, kullanıcılar kupon validate edemez.
-- Bu policy'yi ekle:
drop policy if exists "coupons_read_active" on public.coupons;
create policy "coupons_read_active" on public.coupons
  for select using (is_active = true);

-- ── 3. ADMİN KULLANICI AYARLA ───────────────────────────
-- Önce uygulamadan normal kayıt ol.
-- Sonra aşağıdaki sorguyla kendi e-postanı bul ve UUID'yi al:
--   select id, full_name from public.profiles;
--
-- Sonra aşağıdaki satırdaki UUID'yi kendi UUID'nle değiştir:
--   update public.profiles set role = 'admin' where id = 'BURAYA-UUID-YAZ';

-- ── 4. MESAJ ATTACHMENTS TABLOSU (yoksa) ────────────────
alter table public.messages
  add column if not exists attachment_url  text,
  add column if not exists attachment_name text,
  add column if not exists attachment_type text,
  add column if not exists attachment_size bigint;

-- ── 5. STORAGE BUCKET (chat yüklemeleri için) ───────────
-- Supabase → Storage → New Bucket:
--   Name: chat-uploads
--   Public: true
--   Max file size: 10 MB
-- (SQL ile yapılamaz, dashboard'dan yapılmalı)
