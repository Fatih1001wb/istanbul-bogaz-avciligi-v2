-- ════════════════════════════════════════════════════════
-- SOHBET — DOSYA / GÖRSEL EKLEME MIGRATION
-- Supabase SQL Editor'da çalıştır.
-- ════════════════════════════════════════════════════════

-- 1) messages tablosuna ek alanlar
alter table public.messages
  add column if not exists attachment_url   text     null,
  add column if not exists attachment_name  text     null,
  add column if not exists attachment_type  text     null,   -- mime type, örn 'image/png', 'application/pdf'
  add column if not exists attachment_size  integer  null;   -- byte cinsinden

-- content nullable olsun, sadece dosya gönderilebilsin
alter table public.messages
  alter column content drop not null;

-- En azından metin VEYA ek olmalı
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'messages_content_or_attachment_chk'
  ) then
    alter table public.messages
      add constraint messages_content_or_attachment_chk
      check (content is not null or attachment_url is not null);
  end if;
end$$;

-- ════════════════════════════════════════════════════════
-- 2) STORAGE BUCKET: chat-uploads
-- ════════════════════════════════════════════════════════

-- Bucket oluştur (10 MB limit, public okuma)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-uploads',
  'chat-uploads',
  true,                  -- public erişim (link açılabilir)
  10485760,              -- 10 MB = 10 * 1024 * 1024
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

-- ════════════════════════════════════════════════════════
-- 3) STORAGE POLİTİKALARI
-- ════════════════════════════════════════════════════════

-- Eski politikaları temizle (idempotent)
drop policy if exists "chat_uploads_read"   on storage.objects;
drop policy if exists "chat_uploads_insert" on storage.objects;
drop policy if exists "chat_uploads_delete" on storage.objects;

-- Herkes okuyabilir (mesajları görmek için)
create policy "chat_uploads_read"
  on storage.objects for select
  using (bucket_id = 'chat-uploads');

-- Sadece giriş yapan kullanıcılar yükleyebilir
create policy "chat_uploads_insert"
  on storage.objects for insert
  with check (bucket_id = 'chat-uploads' and auth.role() = 'authenticated');

-- Sadece dosya sahibi silebilir (owner = uploader)
create policy "chat_uploads_delete"
  on storage.objects for delete
  using (bucket_id = 'chat-uploads' and auth.uid() = owner);

-- ── KONTROL ──────────────────────────────────────────────
-- select id, name, public, file_size_limit from storage.buckets where id = 'chat-uploads';
-- select column_name from information_schema.columns where table_name = 'messages';
