-- ════════════════════════════════════════════════════════
-- KURŞUN ÜRÜNLERİNE GRAM SEÇİMİ — order_items MIGRATION
-- Supabase SQL Editor'da çalıştır.
-- Mevcut siparişlere zarar vermez (nullable kolon).
-- ════════════════════════════════════════════════════════

alter table public.order_items
  add column if not exists gram integer null;

comment on column public.order_items.gram is
  'Kurşun ürünleri için seçilen ağırlık (gr). Diğer ürünlerde null.';

-- ── KONTROL ──────────────────────────────────────────────
-- select id, product_id, quantity, gram from public.order_items order by id desc limit 10;
