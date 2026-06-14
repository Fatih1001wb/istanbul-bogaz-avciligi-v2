-- ════════════════════════════════════════════════════════════════
-- 🎣 BALIKAVİSTANBUL — KURULUM
-- 
-- Bilgi platformu sürümü için Supabase kurulumu.
-- 
-- Bu dosya şunları oluşturur:
--   • profiles    (kullanıcı bilgileri)
--   • messages    (topluluk sohbeti)
--   • Storage: chat-uploads (dosya/görsel ekleri)
-- 
-- Eski e-ticaret/admin tabloları (varsa) otomatik silinir.
-- 
-- KULLANIM:
--   1. Supabase Dashboard → SQL Editor → New Query
--   2. Bu dosyayı yapıştır
--   3. RUN bas
-- ════════════════════════════════════════════════════════════════


-- ┌──────────────────────────────────────────────────────┐
-- │ 1. ESKİ TABLOLARI TEMİZLE                            │
-- └──────────────────────────────────────────────────────┘
-- Eski e-ticaret ve admin yapısından geriye kalan tablolar varsa
-- temizle. Yoksa sessizce atlanır.

drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.reviews cascade;
drop table if exists public.coupons cascade;
drop table if exists public.addresses cascade;
drop table if exists public.products cascade;
drop type if exists order_status;


-- ┌──────────────────────────────────────────────────────┐
-- │ 2. KULLANICI PROFİLLERİ                              │
-- └──────────────────────────────────────────────────────┘

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  phone       text,
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


-- ┌──────────────────────────────────────────────────────┐
-- │ 3. TOPLULUK SOHBETİ                                  │
-- └──────────────────────────────────────────────────────┘

create table if not exists public.messages (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references public.profiles(id) on delete cascade not null,
  content         text null,
  district_id     text default 'general',
  attachment_url  text     null,
  attachment_name text     null,
  attachment_type text     null,
  attachment_size integer  null,
  created_at      timestamptz default now(),
  check (content is not null or attachment_url is not null),
  check (content is null or length(content) between 1 and 500)
);

create index if not exists messages_district_created_idx
  on public.messages(district_id, created_at desc);


-- ┌──────────────────────────────────────────────────────┐
-- │ 4. ROW LEVEL SECURITY (RLS)                          │
-- └──────────────────────────────────────────────────────┘

alter table public.profiles enable row level security;
alter table public.messages enable row level security;

-- profiles: Kullanıcı sadece kendi profilini görür ve değiştirir
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- messages: Herkes mesajları okuyabilir
drop policy if exists "messages_read"       on public.messages;
drop policy if exists "messages_insert"     on public.messages;
drop policy if exists "messages_delete_own" on public.messages;

create policy "messages_read" on public.messages
  for select using (true);

-- messages: Sadece giriş yapan kullanıcı kendi adına mesaj atabilir
create policy "messages_insert" on public.messages
  for insert with check (auth.uid() = user_id);

-- messages: Kullanıcı sadece kendi mesajını silebilir
create policy "messages_delete_own" on public.messages
  for delete using (auth.uid() = user_id);


-- ┌──────────────────────────────────────────────────────┐
-- │ 5. REALTIME (anlık mesaj akışı)                      │
-- └──────────────────────────────────────────────────────┘

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end$$;


-- ┌──────────────────────────────────────────────────────┐
-- │ 6. STORAGE (sohbet dosya/görsel yüklemesi)           │
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

-- Yüklenen dosyaları herkes görebilir (sohbet açık)
create policy "chat_uploads_read"
  on storage.objects for select
  using (bucket_id = 'chat-uploads');

-- Sadece kayıtlı kullanıcılar yükleyebilir
create policy "chat_uploads_insert"
  on storage.objects for insert
  with check (bucket_id = 'chat-uploads' and auth.role() = 'authenticated');

-- Kullanıcı sadece kendi yüklediği dosyayı silebilir
create policy "chat_uploads_delete"
  on storage.objects for delete
  using (bucket_id = 'chat-uploads' and auth.uid() = owner);


-- ════════════════════════════════════════════════════════════════
-- ✅ KURULUM TAMAM
-- 
-- Aktif tablolar:
--   • auth.users  → Supabase yönetiminde
--   • profiles    → Kullanıcı bilgileri (otomatik oluşturulur)
--   • messages    → Topluluk sohbeti
-- 
-- Aktif storage bucket:
--   • chat-uploads → Sohbet ekleri (resim, PDF, dosya — 10 MB sınır)
-- 
-- Realtime aktif: messages tablosu
-- ════════════════════════════════════════════════════════════════
