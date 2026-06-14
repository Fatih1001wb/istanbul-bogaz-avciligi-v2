-- ╔══════════════════════════════════════════════════════════╗
-- ║   PB STORE - SEED DATA (Örnek Veriler)                   ║
-- ║   Test için başlangıç içerikleri                          ║
-- ╚══════════════════════════════════════════════════════════╝

-- ════════════════════════════════════════════════════════════
-- 1. ANA KATEGORİLER
-- ════════════════════════════════════════════════════════════
INSERT INTO public.categories (slug, name, description, icon, emoji, sort_order)
VALUES
  ('erkek-bakim', 'Erkek Bakım & Kozmetik', 'Tıraş, sakal, saç ve cilt bakım ürünleri', 'fa-scissors', '🧔', 1),
  ('taki-aksesuar', 'Takı & Aksesuar', 'Kadın takı, erkek aksesuar ve unisex parçalar', 'fa-gem', '💎', 2),
  ('ev-yasam', 'Ev & Yaşam / Konsept', 'Mumlar, oda kokuları ve hediye setleri', 'fa-gift', '🕯️', 3)
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 2. ALT KATEGORİLER
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE
  erkek_id UUID;
  taki_id UUID;
  ev_id UUID;
BEGIN
  SELECT id INTO erkek_id FROM public.categories WHERE slug = 'erkek-bakim';
  SELECT id INTO taki_id FROM public.categories WHERE slug = 'taki-aksesuar';
  SELECT id INTO ev_id FROM public.categories WHERE slug = 'ev-yasam';

  -- Erkek Bakım alt kategorileri
  INSERT INTO public.categories (slug, name, parent_id, icon, emoji, sort_order) VALUES
    ('tiras-bicaklari', 'Tıraş Bıçakları & Usturalar', erkek_id, 'fa-scissors', '✂️', 1),
    ('tiras-kopukleri', 'Tıraş Köpükleri & Jelleri', erkek_id, 'fa-spray-can', '🧴', 2),
    ('tiras-sonrasi', 'Tıraş Sonrası Balsam & Kolonyalar', erkek_id, 'fa-snowflake', '❄️', 3),
    ('sakal-yagi', 'Sakal & Bıyık Bakım Yağları', erkek_id, 'fa-droplet', '🧪', 4),
    ('sampuanlar', 'Şampuanlar & Saç Kremleri', erkek_id, 'fa-droplet', '🧴', 5),
    ('sac-wax', 'Wax, Pomad & Sprey', erkek_id, 'fa-circle', '🍯', 6),
    ('maskeler', 'Siyah Nokta & Maske Çeşitleri', erkek_id, 'fa-circle', '⚫', 7),
    ('yuz-bakim', 'Yüz Temizleme & Nemlendirici', erkek_id, 'fa-spray-can', '🧴', 8),
    ('dogal-sabunlar', 'Doğal El Yapımı Sabunlar', erkek_id, 'fa-soap', '🧼', 9)
  ON CONFLICT (slug) DO NOTHING;

  -- Takı & Aksesuar alt kategorileri
  INSERT INTO public.categories (slug, name, parent_id, icon, emoji, sort_order) VALUES
    ('kadin-kolye', 'Çelik & Gümüş Kolyeler', taki_id, 'fa-circle', '✨', 1),
    ('kadin-yuzuk', 'Yüzükler & Eklem Yüzükleri', taki_id, 'fa-circle', '💍', 2),
    ('kadin-kupe', 'Küpe & Kulak Kelepçeleri', taki_id, 'fa-gem', '💎', 3),
    ('kadin-bileklik', 'Bileklikler & Halhallar', taki_id, 'fa-circle', '📿', 4),
    ('erkek-gozluk', 'Güneş Gözlükleri', taki_id, 'fa-glasses', '🕶️', 5),
    ('erkek-saat', 'Klasik & Spor Kol Saatleri', taki_id, 'fa-clock', '⌚', 6),
    ('erkek-deri', 'Deri Bileklik ve Yüzükler', taki_id, 'fa-circle', '🧿', 7),
    ('unisex-anahtarlik', 'Tasarım Anahtarlıklar', taki_id, 'fa-key', '🔑', 8),
    ('unisex-corap', 'Renkli & Desenli Soket Çoraplar', taki_id, 'fa-circle', '🧦', 9)
  ON CONFLICT (slug) DO NOTHING;

  -- Ev & Yaşam alt kategorileri
  INSERT INTO public.categories (slug, name, parent_id, icon, emoji, sort_order) VALUES
    ('mumlar', 'Kokulu & Tasarım Mumlar', ev_id, 'fa-fire', '🕯️', 1),
    ('oda-kokulari', 'Bambu Çubuklu Oda Kokuları', ev_id, 'fa-spray-can', '🪵', 2),
    ('dekor-objeler', 'Alçı/Seramik Mumaltlıkları & Objeler', ev_id, 'fa-circle', '🗿', 3),
    ('erkek-hediye-setleri', 'Erkek Bakım Hediye Setleri', ev_id, 'fa-gift', '🎁', 4),
    ('ozel-gun-setleri', 'Sevgililer Günü / Doğum Günü Setleri', ev_id, 'fa-heart', '💝', 5),
    ('kisisellestirilmis', 'İsim Yazılı Hediye Kutuları', ev_id, 'fa-gift', '📦', 6)
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- ════════════════════════════════════════════════════════════
-- 3. ÜRÜNLER
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE
  erkek_id UUID;
  taki_id UUID;
  ev_id UUID;
  tiras_bicak_id UUID;
  sakal_yagi_id UUID;
  tiras_sonrasi_id UUID;
  kadin_kolye_id UUID;
  erkek_gozluk_id UUID;
  erkek_saat_id UUID;
  mumlar_id UUID;
  hediye_set_id UUID;
BEGIN
  SELECT id INTO erkek_id FROM public.categories WHERE slug = 'erkek-bakim';
  SELECT id INTO taki_id FROM public.categories WHERE slug = 'taki-aksesuar';
  SELECT id INTO ev_id FROM public.categories WHERE slug = 'ev-yasam';
  SELECT id INTO tiras_bicak_id FROM public.categories WHERE slug = 'tiras-bicaklari';
  SELECT id INTO sakal_yagi_id FROM public.categories WHERE slug = 'sakal-yagi';
  SELECT id INTO tiras_sonrasi_id FROM public.categories WHERE slug = 'tiras-sonrasi';
  SELECT id INTO kadin_kolye_id FROM public.categories WHERE slug = 'kadin-kolye';
  SELECT id INTO erkek_gozluk_id FROM public.categories WHERE slug = 'erkek-gozluk';
  SELECT id INTO erkek_saat_id FROM public.categories WHERE slug = 'erkek-saat';
  SELECT id INTO mumlar_id FROM public.categories WHERE slug = 'mumlar';
  SELECT id INTO hediye_set_id FROM public.categories WHERE slug = 'erkek-hediye-setleri';

  INSERT INTO public.products (
    sku, slug, name, brand, description, short_description,
    category_id, subcategory_id,
    price, old_price, stock, icon, badges, is_featured, rating, review_count
  ) VALUES
    (
      'PB-UST-01', 'premium-celik-usturad', 'Premium Çelik Usturad', 'PB Barber',
      'Klasik berber usturası — paslanmaz çelik gövde, hassas tıraş için ergonomik tasarım. Geleneksel ustalık ve modern dayanıklılık.',
      'Klasik berber usturası, paslanmaz çelik',
      erkek_id, tiras_bicak_id,
      890, 1190, 28, 'fa-scissors', ARRAY['bestseller', 'sale'], true, 4.9, 342
    ),
    (
      'PB-SBY-50', 'argan-sakal-yagi', 'Argan Yağlı Sakal Bakım Yağı', 'PB Beard',
      'Argan ve cedarwood yağı ile sakalınıza yumuşaklık ve parlaklık veren lüks bakım yağı.',
      'Argan ve cedarwood yağı, 50ml',
      erkek_id, sakal_yagi_id,
      285, 360, 18, 'fa-droplet', ARRAY['bestseller', 'sale'], true, 4.9, 512
    ),
    (
      'PB-VTK-200', 'klasik-vetiver-kolonya', 'Klasik Vetiver Kolonya', 'PB Heritage',
      'Geleneksel 80° vetiver kolonya — tıraş sonrası mükemmel ferahlık, uzun ömürlü esans.',
      '80° kolonya, klasik şişe tasarımı',
      erkek_id, tiras_sonrasi_id,
      320, 420, 22, 'fa-spray-can-sparkles', ARRAY['bestseller', 'sale'], true, 4.9, 287
    ),
    (
      'PB-KGK-925', 'gumus-incili-kolye', '925 Ayar Gümüş İncili Kolye', 'PB Jewelry',
      'Zarif tasarımıyla her gardrop için vazgeçilmez — 925 ayar gümüş, gerçek inci.',
      '925 ayar gümüş, hipoalerjenik',
      taki_id, kadin_kolye_id,
      580, 720, 16, 'fa-gem', ARRAY['bestseller', 'sale'], true, 4.9, 287
    ),
    (
      'PB-AVG-001', 'polarize-aviator-gozluk', 'Polarize Aviator Güneş Gözlüğü', 'PB Style',
      'UV400 koruma + polarize cam ile gözlerinizi koruyan, klasik aviator formuyla zamansız stil.',
      'UV400, polarize, metal çerçeve',
      taki_id, erkek_gozluk_id,
      485, 640, 19, 'fa-glasses', ARRAY['bestseller', 'sale'], true, 4.9, 312
    ),
    (
      'PB-MKS-AUT', 'klasik-mekanik-saat', 'Klasik Mekanik Kol Saati', 'PB Heritage',
      'Pille çalışmayan otomatik mekanizma, hakiki deri kayış — el sanatları ve modern mühendislik.',
      'Otomatik mekanizma, deri kayış',
      taki_id, erkek_saat_id,
      1850, NULL, 12, 'fa-clock', ARRAY['bestseller'], true, 4.9, 89
    ),
    (
      'PB-VSM-200', 'vanilya-sandalagaci-mum', 'Vanilya & Sandalağacı Mumu', 'PB Home',
      '%100 doğal soya mumu, vanilya ve sandalağacı esansları — yaklaşık 50 saat yanma süresi.',
      'Doğal soya, 50 saat yanma',
      ev_id, mumlar_id,
      195, 245, 34, 'fa-fire', ARRAY['bestseller', 'sale'], true, 4.9, 312
    ),
    (
      'PB-EHS-LUX', 'erkek-bakim-hediye-seti-lux', 'Erkek Bakım Hediye Seti (Lüks)', 'PB Gift',
      'Argan sakal yağı + tıraş köpüğü + vetiver kolonya — özel kutu, ideal hediye seçimi.',
      '3 ürünlük lüks hediye seti',
      ev_id, hediye_set_id,
      890, 1180, 23, 'fa-gift', ARRAY['bestseller', 'sale'], true, 4.9, 178
    )
  ON CONFLICT (sku) DO NOTHING;
END $$;

-- ════════════════════════════════════════════════════════════
-- 4. ÖRNEK KUPONLAR
-- ════════════════════════════════════════════════════════════
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_purchase, usage_limit, ends_at)
VALUES
  ('PB15', 'Yeni üyelere %15 hoşgeldin indirimi', 'percent', 15, 0, 1000, NOW() + INTERVAL '1 year'),
  ('HOSGELDIN', 'İlk siparişe özel %20', 'percent', 20, 200, 500, NOW() + INTERVAL '6 months'),
  ('BEAUTY100', '100 TL indirim — 500 TL üzeri', 'fixed', 100, 500, 200, NOW() + INTERVAL '3 months'),
  ('SEZON', 'Sezon sonu %25 indirim', 'percent', 25, 1000, NULL, NOW() + INTERVAL '1 month')
ON CONFLICT (code) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- BAŞARILI!
-- ════════════════════════════════════════════════════════════
SELECT 'Örnek veriler eklendi! Site artık kullanıma hazır.' AS sonuc;
SELECT 'Ürün sayısı: ' || COUNT(*) AS bilgi FROM public.products;
SELECT 'Kategori sayısı: ' || COUNT(*) AS bilgi FROM public.categories;
