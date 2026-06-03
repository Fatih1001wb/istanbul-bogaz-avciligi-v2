-- ════════════════════════════════════════════════════════
-- SOHBET — İLÇE GRUPLARI MIGRATION
-- Supabase SQL Editor'a yapıştırıp çalıştır.
-- Mevcut mesajlar otomatik 'general' (Tüm İstanbul) grubuna düşer.
-- ════════════════════════════════════════════════════════

-- 1) messages tablosuna district_id ekle
alter table public.messages
  add column if not exists district_id text not null default 'general';

-- 2) Hızlı filtreleme için indeks
create index if not exists messages_district_created_idx
  on public.messages (district_id, created_at desc);

-- ── KONTROL ──────────────────────────────────────────────
-- select district_id, count(*) from public.messages group by 1;
