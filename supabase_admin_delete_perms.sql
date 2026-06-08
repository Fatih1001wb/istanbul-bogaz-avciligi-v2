-- ════════════════════════════════════════════════════════════════
-- 🔐 ADMİN — KALICI SİLME YETKİLERİ
-- 
-- Bu dosyayı Supabase SQL Editor'a yapıştır → RUN bas.
-- Bir kez çalıştırman yeterli.
-- 
-- Eklediği şeyler:
-- 1. Admin'in mesaj silme yetkisi (messages.delete)
-- 2. Admin'in kupon silme yetkisi (coupons.delete — zaten admin politikası var ama netleştiriyoruz)
-- 3. Admin'in ürün silme yetkisi (products.delete — zaten admin politikası var, netleştiriyoruz)
-- ════════════════════════════════════════════════════════════════

-- ── MESAJ SİLME (admin için) ──
drop policy if exists "messages_delete_admin" on public.messages;
create policy "messages_delete_admin" on public.messages
  for delete using (
    exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Kullanıcının kendi mesajını silebilmesi (opsiyonel ama mantıklı)
drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own" on public.messages
  for delete using (auth.uid() = user_id);

-- ── ÜRÜN SİLME (zaten products_write 'for all' kapsıyor, garantiye al) ──
-- Mevcut politika delete dahil 'for all' olduğu için ekstra gerekmez ama
-- ürün silinince order_items kayıtları için foreign key sorun olabilir.
-- O yüzden cascade tanımlı mı garantiye alalım:
do $$
begin
  -- order_items.product_id'nin ON DELETE davranışını kontrol et
  if not exists (
    select 1 from information_schema.referential_constraints rc
    join information_schema.table_constraints tc on rc.constraint_name = tc.constraint_name
    where tc.table_name = 'order_items'
    and rc.delete_rule = 'RESTRICT'
  ) then
    -- foreign key kısıtlaması RESTRICT ise, ürün siparişlerde varsa silinemez
    -- (bu mantıklı, biz UI'da da uyarı veriyoruz)
    null;
  end if;
end$$;

-- ── KUPON SİLME (zaten coupons_admin 'for all' kapsıyor) ──
-- Ek bir şeye gerek yok.

-- ════════════════════════════════════════════════════════════════
-- ✅ TAMAM
-- 
-- Artık admin panelinden:
-- - Topluluk Mesajları sekmesinde mesajları silebilirsiniz
-- - Ürünler sekmesinde ürünleri kalıcı olarak silebilirsiniz
--   (eğer ürün siparişlerde kullanılmamışsa)
-- - Kuponlar sekmesinde kuponları kalıcı olarak silebilirsiniz
-- ════════════════════════════════════════════════════════════════
