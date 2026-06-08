-- ════════════════════════════════════════════════════════════════
-- 📦 KARGO TAKİP — Mevcut DB'ye Eklenmesi Gereken Tek Kolon
-- 
-- Bu dosyayı Supabase SQL Editor'a yapıştır → RUN bas.
-- Sadece bir kez çalıştırman yeterli.
-- ════════════════════════════════════════════════════════════════

-- orders tablosuna cargo_code kolonu ekle (idempotent — varsa atlanır)
alter table public.orders
  add column if not exists cargo_code text null;

-- notes kolonu zaten KURULUM.sql'de eklenmişti, garanti olsun
alter table public.orders
  add column if not exists notes text null;

-- Index — kargo koduyla arama hızlı olsun
create index if not exists orders_cargo_code_idx
  on public.orders(cargo_code)
  where cargo_code is not null;

-- ════════════════════════════════════════════════════════════════
-- ✅ HAZIR
-- 
-- Artık admin panelinden:
-- 1. Sipariş detayına gir
-- 2. Durumu "Kargoda" yap
-- 3. "Kargo Takip Numarası" alanına numarayı gir
-- 4. "Durumu Güncelle" bas
-- 
-- Kullanıcı sipariş sayfasını açtığında takip numarasını ve
-- güncel durumu görecek.
-- ════════════════════════════════════════════════════════════════
