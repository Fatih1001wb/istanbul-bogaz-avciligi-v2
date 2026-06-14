/* ╔══════════════════════════════════════════════════════════╗
   ║   PB STORE - ANA VERİ DOSYASI (Statik Mock Data)         ║
   ║   Tüm ürünler ve kategoriler burada.                     ║
   ║                                                            ║
   ║   ÜRÜN EKLEMEK İÇİN:                                       ║
   ║   1. PRODUCTS dizisinin sonuna yeni ürünü ekle           ║
   ║   2. id'yi benzersiz tut (son id + 1)                     ║
   ║   3. category ve subcategory'i CATEGORIES'tekiyle eşleştir║
   ║   4. Tüm sayfalar otomatik güncellenir!                   ║
   ╚══════════════════════════════════════════════════════════╝
*/

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // KATEGORİLER — 3 ana × 9 alt
  // ═══════════════════════════════════════════════════════════
  const CATEGORIES = [
    {
      slug: 'erkek-bakim',
      name: 'Erkek Bakım & Kozmetik',
      icon: 'fa-scissors',
      emoji: '🧔',
      description: 'Tıraş, sakal, saç ve cilt bakım ürünleri',
      subcategories: [
        { slug: 'tiras-bicaklari', name: 'Tıraş Bıçakları & Usturalar', emoji: '✂️' },
        { slug: 'tiras-kopukleri', name: 'Tıraş Köpükleri & Jelleri', emoji: '🧴' },
        { slug: 'tiras-sonrasi', name: 'Tıraş Sonrası Balsam & Kolonya', emoji: '❄️' },
        { slug: 'sakal-yagi', name: 'Sakal & Bıyık Bakım Yağları', emoji: '🧪' },
        { slug: 'sampuanlar', name: 'Şampuanlar & Saç Kremleri', emoji: '🧴' },
        { slug: 'sac-wax', name: 'Wax, Pomad & Sprey', emoji: '🍯' },
        { slug: 'maskeler', name: 'Siyah Nokta & Maske', emoji: '⚫' },
        { slug: 'yuz-bakim', name: 'Yüz Temizleme & Nemlendirici', emoji: '🧴' },
        { slug: 'dogal-sabunlar', name: 'Doğal El Yapımı Sabunlar', emoji: '🧼' }
      ]
    },
    {
      slug: 'taki-aksesuar',
      name: 'Takı & Aksesuar',
      icon: 'fa-gem',
      emoji: '💎',
      description: 'Kadın takı, erkek aksesuar ve unisex parçalar',
      subcategories: [
        { slug: 'kadin-kolye', name: 'Çelik & Gümüş Kolyeler', emoji: '✨' },
        { slug: 'kadin-yuzuk', name: 'Yüzükler & Eklem Yüzükleri', emoji: '💍' },
        { slug: 'kadin-kupe', name: 'Küpe & Kulak Kelepçeleri', emoji: '💎' },
        { slug: 'kadin-bileklik', name: 'Bileklikler & Halhallar', emoji: '📿' },
        { slug: 'erkek-gozluk', name: 'Güneş Gözlükleri', emoji: '🕶️' },
        { slug: 'erkek-saat', name: 'Klasik & Spor Kol Saatleri', emoji: '⌚' },
        { slug: 'erkek-deri', name: 'Deri Bileklik ve Yüzükler', emoji: '🧿' },
        { slug: 'unisex-anahtarlik', name: 'Tasarım Anahtarlıklar', emoji: '🔑' },
        { slug: 'unisex-corap', name: 'Renkli & Desenli Soket Çoraplar', emoji: '🧦' }
      ]
    },
    {
      slug: 'ev-yasam',
      name: 'Ev & Yaşam / Konsept',
      icon: 'fa-gift',
      emoji: '🕯️',
      description: 'Mumlar, oda kokuları ve hediye setleri',
      subcategories: [
        { slug: 'mumlar', name: 'Kokulu & Tasarım Mumlar', emoji: '🕯️' },
        { slug: 'oda-kokulari', name: 'Bambu Çubuklu Oda Kokuları', emoji: '🪵' },
        { slug: 'dekor-objeler', name: 'Alçı/Seramik Objeler', emoji: '🗿' },
        { slug: 'erkek-hediye-setleri', name: 'Erkek Bakım Hediye Setleri', emoji: '🎁' },
        { slug: 'ozel-gun-setleri', name: 'Özel Gün Setleri', emoji: '💝' },
        { slug: 'kisisellestirilmis', name: 'İsim Yazılı Hediye Kutuları', emoji: '📦' }
      ]
    }
  ];

  // ═══════════════════════════════════════════════════════════
  // ÜRÜNLER — Buraya yeni ürün eklemek için aşağıyı kullan
  // ═══════════════════════════════════════════════════════════
  const PRODUCTS = [
    // ════ ERKEK BAKIM (12 ürün) ════
    { id: 1, sku: 'PB-UST-01', slug: 'premium-celik-usturad', name: 'Premium Çelik Usturad', brand: 'PB Barber', category: 'erkek-bakim', subcategory: 'tiras-bicaklari', price: 890, oldPrice: 1190, stock: 28, rating: 4.9, reviews: 342, icon: 'fa-scissors', images: [], shortDescription: 'Klasik berber usturası, paslanmaz çelik', description: 'Klasik berber usturası — paslanmaz çelik gövde, hassas tıraş için ergonomik tasarım. Geleneksel ustalık ve modern dayanıklılık bir arada.', badges: ['bestseller', 'sale'], isActive: true, isFeatured: true },
    { id: 2, sku: 'PB-TM-05', slug: '5-bicakli-tiras-makinesi', name: '5-Bıçaklı Manuel Tıraş Makinesi', brand: 'PB Barber', category: 'erkek-bakim', subcategory: 'tiras-bicaklari', price: 380, oldPrice: null, stock: 45, rating: 4.7, reviews: 189, icon: 'fa-scissors', images: [], shortDescription: '5 esnek bıçak, jel şerit', description: 'Hassas tıraş için 5 esnek bıçak, jel şerit ile kayganlık.', badges: ['bestseller'], isActive: true, isFeatured: false },
    { id: 3, sku: 'PB-AVK-150', slug: 'aloe-vera-tiras-kopugu', name: 'Aloe Vera Tıraş Köpüğü', brand: 'PB Care', category: 'erkek-bakim', subcategory: 'tiras-kopukleri', price: 145, oldPrice: 180, stock: 67, rating: 4.8, reviews: 421, icon: 'fa-spray-can', images: [], shortDescription: 'Aloe vera özlü, yatıştırıcı', description: 'Yumuşak tıraş için yatıştırıcı aloe vera özlü köpük.', badges: ['sale'], isActive: true, isFeatured: true },
    { id: 4, sku: 'PB-MTJ-200', slug: 'mentollu-tiras-jeli', name: 'Mentollü Tıraş Jeli', brand: 'PB Care', category: 'erkek-bakim', subcategory: 'tiras-kopukleri', price: 165, oldPrice: null, stock: 38, rating: 4.6, reviews: 156, icon: 'fa-droplet', images: [], shortDescription: 'Mentollü şeffaf jel', description: 'Ferahlatıcı mentol içerikli şeffaf jel.', badges: [], isActive: true, isFeatured: false },
    { id: 5, sku: 'PB-VTK-200', slug: 'klasik-vetiver-kolonya', name: 'Klasik Vetiver Kolonya', brand: 'PB Heritage', category: 'erkek-bakim', subcategory: 'tiras-sonrasi', price: 320, oldPrice: 420, stock: 22, rating: 4.9, reviews: 287, icon: 'fa-spray-can-sparkles', images: [], shortDescription: '80° kolonya, klasik tasarım', description: 'Geleneksel 80° vetiver kolonya — tıraş sonrası mükemmel ferahlık, uzun ömürlü esans.', badges: ['bestseller', 'sale'], isActive: true, isFeatured: true },
    { id: 6, sku: 'PB-AFB-100', slug: 'aftershave-balsam', name: 'Aftershave Balsam', brand: 'PB Heritage', category: 'erkek-bakim', subcategory: 'tiras-sonrasi', price: 245, oldPrice: null, stock: 31, rating: 4.7, reviews: 134, icon: 'fa-snowflake', images: [], shortDescription: 'Yatıştırıcı tıraş sonrası', description: 'Cilt yatıştırıcı tıraş sonrası balsamı.', badges: ['new'], isActive: true, isFeatured: false },
    { id: 7, sku: 'PB-ASY-50', slug: 'argan-sakal-yagi', name: 'Argan Yağlı Sakal Bakım Yağı', brand: 'PB Beard', category: 'erkek-bakim', subcategory: 'sakal-yagi', price: 285, oldPrice: 360, stock: 18, rating: 4.9, reviews: 512, icon: 'fa-droplet', images: [], shortDescription: 'Argan ve cedarwood, 50ml', description: 'Argan ve cedarwood yağı ile sakalınıza yumuşaklık ve parlaklık veren lüks bakım yağı.', badges: ['bestseller', 'sale'], isActive: true, isFeatured: true },
    { id: 8, sku: 'PB-SAS-300', slug: 'sandal-agaci-sampuan', name: 'Sandal Ağacı Şampuanı', brand: 'PB Care', category: 'erkek-bakim', subcategory: 'sampuanlar', price: 195, oldPrice: null, stock: 52, rating: 4.6, reviews: 89, icon: 'fa-droplet', images: [], shortDescription: 'Sandal ağacı özlü, 300ml', description: 'Erkekler için besleyici sandal ağacı özlü şampuan.', badges: ['new'], isActive: true, isFeatured: false },
    { id: 9, sku: 'PB-MFW-100', slug: 'matt-finish-sac-waxi', name: 'Matt Finish Saç Waxı', brand: 'PB Style', category: 'erkek-bakim', subcategory: 'sac-wax', price: 175, oldPrice: null, stock: 41, rating: 4.7, reviews: 234, icon: 'fa-circle', images: [], shortDescription: 'Güçlü tutuş, mat doku', description: 'Güçlü tutuş + mat doku, doğal görünüm.', badges: ['bestseller'], isActive: true, isFeatured: false },
    { id: 10, sku: 'PB-KEP-100', slug: 'klasik-erkek-pomadi', name: 'Klasik Erkek Pomadı', brand: 'PB Style', category: 'erkek-bakim', subcategory: 'sac-wax', price: 195, oldPrice: 240, stock: 24, rating: 4.8, reviews: 178, icon: 'fa-circle', images: [], shortDescription: 'Parlak finish, klasik', description: 'Parlak finishli geleneksel pomad.', badges: ['sale'], isActive: true, isFeatured: false },
    { id: 11, sku: 'PB-KM-50', slug: 'komur-maskesi', name: 'Aktif Kömür Maskesi', brand: 'PB Skin', category: 'erkek-bakim', subcategory: 'maskeler', price: 135, oldPrice: null, stock: 78, rating: 4.5, reviews: 412, icon: 'fa-spa', images: [], shortDescription: 'Aktif kömür, siyah nokta', description: 'Siyah nokta için aktif kömür maskesi.', badges: ['new'], isActive: true, isFeatured: false },
    { id: 12, sku: 'PB-DDS-100', slug: 'dogal-defne-sabunu', name: 'Doğal Defne Sabunu', brand: 'PB Natural', category: 'erkek-bakim', subcategory: 'dogal-sabunlar', price: 75, oldPrice: 95, stock: 124, rating: 4.9, reviews: 678, icon: 'fa-soap', images: [], shortDescription: 'El yapımı, %100 doğal', description: 'Antalya el yapımı %100 doğal defne sabunu.', badges: ['bestseller', 'sale'], isActive: true, isFeatured: false },

    // ════ TAKI & AKSESUAR (10 ürün) ════
    { id: 13, sku: 'PB-GIK-925', slug: 'gumus-incili-kolye', name: '925 Ayar Gümüş İncili Kolye', brand: 'PB Jewelry', category: 'taki-aksesuar', subcategory: 'kadin-kolye', price: 580, oldPrice: 720, stock: 16, rating: 4.9, reviews: 287, icon: 'fa-gem', images: [], shortDescription: '925 ayar gümüş, hipoalerjenik', description: 'Zarif tasarımıyla her gardırop için vazgeçilmez — 925 ayar gümüş, gerçek inci.', badges: ['bestseller', 'sale'], isActive: true, isFeatured: true },
    { id: 14, sku: 'PB-CMK-001', slug: 'celik-minimal-kolye', name: 'Çelik Minimal Kolye', brand: 'PB Jewelry', category: 'taki-aksesuar', subcategory: 'kadin-kolye', price: 195, oldPrice: null, stock: 42, rating: 4.7, reviews: 156, icon: 'fa-circle', images: [], shortDescription: '316L çelik, hipoalerjenik', description: 'Hipoalerjenik 316L çelik, ince zincir.', badges: ['new'], isActive: true, isFeatured: false },
    { id: 15, sku: 'PB-EYS-003', slug: 'eklem-yuzuk-seti', name: 'Eklem Yüzük Seti (3\'lü)', brand: 'PB Jewelry', category: 'taki-aksesuar', subcategory: 'kadin-yuzuk', price: 145, oldPrice: 195, stock: 38, rating: 4.6, reviews: 234, icon: 'fa-circle', images: [], shortDescription: '3\'lü set, ayarlanabilir', description: 'Ayarlanabilir minimal eklem yüzükleri.', badges: ['sale'], isActive: true, isFeatured: false },
    { id: 16, sku: 'PB-VKS-002', slug: 'vintage-kupe-seti', name: 'Vintage Küpe Seti', brand: 'PB Jewelry', category: 'taki-aksesuar', subcategory: 'kadin-kupe', price: 220, oldPrice: null, stock: 27, rating: 4.8, reviews: 178, icon: 'fa-gem', images: [], shortDescription: 'Antik bronz görünüm', description: 'Antik bronz görünümlü ikonik küpe.', badges: ['new'], isActive: true, isFeatured: false },
    { id: 17, sku: 'PB-PAG-001', slug: 'polarize-aviator-gozluk', name: 'Polarize Aviator Güneş Gözlüğü', brand: 'PB Style', category: 'taki-aksesuar', subcategory: 'erkek-gozluk', price: 485, oldPrice: 640, stock: 19, rating: 4.9, reviews: 312, icon: 'fa-glasses', images: [], shortDescription: 'UV400 polarize, metal çerçeve', description: 'UV400 + polarize cam, metal çerçeve.', badges: ['bestseller', 'sale'], isActive: true, isFeatured: true },
    { id: 18, sku: 'PB-MKS-AUT', slug: 'klasik-mekanik-saat', name: 'Klasik Mekanik Kol Saati', brand: 'PB Heritage', category: 'taki-aksesuar', subcategory: 'erkek-saat', price: 1850, oldPrice: null, stock: 12, rating: 4.9, reviews: 89, icon: 'fa-clock', images: [], shortDescription: 'Otomatik mekanizma, deri kayış', description: 'Otomatik mekanizma, deri kayış — el sanatları ve modern mühendislik.', badges: ['bestseller'], isActive: true, isFeatured: true },
    { id: 19, sku: 'PB-SKS-001', slug: 'spor-kronograf-saat', name: 'Spor Kronograf Saat', brand: 'PB Style', category: 'taki-aksesuar', subcategory: 'erkek-saat', price: 980, oldPrice: 1290, stock: 23, rating: 4.7, reviews: 178, icon: 'fa-clock', images: [], shortDescription: '10ATM, çelik kayış', description: 'Suya dayanıklı 10ATM, çelik kayış.', badges: ['sale'], isActive: true, isFeatured: false },
    { id: 20, sku: 'PB-HDB-001', slug: 'hakiki-deri-bileklik', name: 'Hakiki Deri Bileklik', brand: 'PB Leather', category: 'taki-aksesuar', subcategory: 'erkek-deri', price: 175, oldPrice: null, stock: 56, rating: 4.8, reviews: 234, icon: 'fa-circle', images: [], shortDescription: 'El işçiliği, çelik kapama', description: 'El işçiliği siyah deri, çelik kapama.', badges: ['bestseller'], isActive: true, isFeatured: false },
    { id: 21, sku: 'PB-VTA-001', slug: 'vintage-tasarim-anahtarlik', name: 'Vintage Tasarım Anahtarlık', brand: 'PB Style', category: 'taki-aksesuar', subcategory: 'unisex-anahtarlik', price: 85, oldPrice: 110, stock: 89, rating: 4.6, reviews: 145, icon: 'fa-key', images: [], shortDescription: 'Pirinç + deri', description: 'Pirinç + deri kombinli premium anahtarlık.', badges: ['sale'], isActive: true, isFeatured: false },
    { id: 22, sku: 'PB-DSC-005', slug: 'desenli-soket-corap-seti', name: 'Desenli Soket Çorap Seti (5\'li)', brand: 'PB Style', category: 'taki-aksesuar', subcategory: 'unisex-corap', price: 145, oldPrice: null, stock: 134, rating: 4.7, reviews: 423, icon: 'fa-socks', images: [], shortDescription: '5\'li set, %80 pamuk', description: '5 farklı desen, %80 pamuk.', badges: ['bestseller', 'new'], isActive: true, isFeatured: true },

    // ════ EV & YAŞAM (7 ürün) ════
    { id: 23, sku: 'PB-VSM-200', slug: 'vanilya-sandalagaci-mum', name: 'Vanilya & Sandalağacı Mumu', brand: 'PB Home', category: 'ev-yasam', subcategory: 'mumlar', price: 195, oldPrice: 245, stock: 34, rating: 4.9, reviews: 312, icon: 'fa-fire', images: [], shortDescription: 'Doğal soya, 50 saat yanma', description: 'Doğal soya mumu, vanilya ve sandalağacı esansları — 50 saat yanma süresi.', badges: ['bestseller', 'sale'], isActive: true, isFeatured: true },
    { id: 24, sku: 'PB-GBM-001', slug: 'geometrik-beton-mum', name: 'Geometrik Beton Mum', brand: 'PB Home', category: 'ev-yasam', subcategory: 'mumlar', price: 285, oldPrice: null, stock: 18, rating: 4.7, reviews: 87, icon: 'fa-fire', images: [], shortDescription: 'Beton kap, lavanta', description: 'Modern beton kap + lavanta kokusu.', badges: ['new'], isActive: true, isFeatured: false },
    { id: 25, sku: 'PB-BCK-200', slug: 'bambu-cubuklu-oda-kokusu', name: 'Bambu Çubuklu Oda Kokusu', brand: 'PB Home', category: 'ev-yasam', subcategory: 'oda-kokulari', price: 220, oldPrice: 280, stock: 41, rating: 4.8, reviews: 256, icon: 'fa-spray-can', images: [], shortDescription: 'Amber & Vanilya, 200ml', description: 'Amber & Vanilya, 200ml uzun ömürlü.', badges: ['bestseller', 'sale'], isActive: true, isFeatured: false },
    { id: 26, sku: 'PB-MGM-001', slug: 'mermer-mumaltlik', name: 'Mermer Görünümlü Mumaltlığı', brand: 'PB Home', category: 'ev-yasam', subcategory: 'dekor-objeler', price: 145, oldPrice: null, stock: 52, rating: 4.6, reviews: 134, icon: 'fa-circle', images: [], shortDescription: 'Alçı, el yapımı', description: 'Alçı el yapımı dekor objesi.', badges: ['new'], isActive: true, isFeatured: false },
    { id: 27, sku: 'PB-EHS-LUX', slug: 'erkek-bakim-hediye-seti-lux', name: 'Erkek Bakım Hediye Seti (Lüks)', brand: 'PB Gift', category: 'ev-yasam', subcategory: 'erkek-hediye-setleri', price: 890, oldPrice: 1180, stock: 23, rating: 4.9, reviews: 178, icon: 'fa-gift', images: [], shortDescription: '3 ürün + özel kutu', description: 'Argan sakal yağı + tıraş köpüğü + kolonya — özel kutu, ideal hediye.', badges: ['bestseller', 'sale'], isActive: true, isFeatured: true },
    { id: 28, sku: 'PB-SGH-001', slug: 'sevgililer-gunu-hediye-kutusu', name: 'Sevgililer Günü Hediye Kutusu', brand: 'PB Gift', category: 'ev-yasam', subcategory: 'ozel-gun-setleri', price: 650, oldPrice: null, stock: 28, rating: 4.8, reviews: 234, icon: 'fa-heart', images: [], shortDescription: 'Mum + parfüm + kart', description: 'Mum + parfüm + kart, özel tasarım kutu.', badges: ['new'], isActive: true, isFeatured: false },
    { id: 29, sku: 'PB-IPH-001', slug: 'isim-yazili-hediye-kutusu', name: 'İsim Yazılı Premium Hediye Kutusu', brand: 'PB Gift', category: 'ev-yasam', subcategory: 'kisisellestirilmis', price: 480, oldPrice: null, stock: 19, rating: 4.9, reviews: 145, icon: 'fa-gift', images: [], shortDescription: 'Lazer kazıma isim', description: 'Lazer kazıma isim, kişiye özel ürün seçimi.', badges: ['bestseller', 'new'], isActive: true, isFeatured: false }
  ];

  // ═══════════════════════════════════════════════════════════
  // KUPONLAR
  // ═══════════════════════════════════════════════════════════
  const COUPONS = [
    { code: 'PB15', type: 'percent', value: 15, minPurchase: 0, description: '%15 hoşgeldin indirimi' },
    { code: 'HOSGELDIN', type: 'percent', value: 20, minPurchase: 200, description: 'İlk siparişe özel %20' },
    { code: 'BEAUTY100', type: 'fixed', value: 100, minPurchase: 500, description: '100 TL indirim' },
    { code: 'SEZON', type: 'percent', value: 25, minPurchase: 1000, description: 'Sezon sonu %25 indirim' }
  ];

  // ═══════════════════════════════════════════════════════════
  // HELPER FONKSİYONLAR
  // ═══════════════════════════════════════════════════════════
  function getCategoryBySlug(slug) {
    return CATEGORIES.find(c => c.slug === slug);
  }

  function getProductById(id) {
    return PRODUCTS.find(p => p.id === parseInt(id) && p.isActive);
  }

  function getProductBySlug(slug) {
    return PRODUCTS.find(p => p.slug === slug && p.isActive);
  }

  function getProductsByCategory(categorySlug) {
    return PRODUCTS.filter(p => p.category === categorySlug && p.isActive);
  }

  function getProductsBySubcategory(subSlug) {
    return PRODUCTS.filter(p => p.subcategory === subSlug && p.isActive);
  }

  function getFeaturedProducts() {
    return PRODUCTS.filter(p => p.isFeatured && p.isActive);
  }

  function getProductsByBadge(badge) {
    return PRODUCTS.filter(p => p.badges.includes(badge) && p.isActive);
  }

  function searchProducts(query) {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    return PRODUCTS.filter(p => {
      if (!p.isActive) return false;
      return p.name.toLowerCase().includes(q) ||
             p.brand.toLowerCase().includes(q) ||
             p.shortDescription.toLowerCase().includes(q) ||
             p.sku.toLowerCase().includes(q);
    });
  }

  function filterProducts(options = {}) {
    let result = PRODUCTS.filter(p => p.isActive);

    if (options.category) result = result.filter(p => p.category === options.category);
    if (options.subcategory) result = result.filter(p => p.subcategory === options.subcategory);
    if (options.badge) result = result.filter(p => p.badges.includes(options.badge));
    if (options.brand) result = result.filter(p => p.brand === options.brand);
    if (options.minPrice != null) result = result.filter(p => p.price >= options.minPrice);
    if (options.maxPrice != null) result = result.filter(p => p.price <= options.maxPrice);
    if (options.inStock) result = result.filter(p => p.stock > 0);
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
      );
    }

    // Sıralama
    if (options.sort) {
      const sortMap = {
        'price-asc':  (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        'rating':     (a, b) => b.rating - a.rating,
        'reviews':    (a, b) => b.reviews - a.reviews,
        'newest':     (a, b) => b.id - a.id,
        'oldest':     (a, b) => a.id - b.id,
        'name':       (a, b) => a.name.localeCompare(b.name, 'tr')
      };
      if (sortMap[options.sort]) result.sort(sortMap[options.sort]);
    }

    return result;
  }

  function validateCoupon(code, subtotal) {
    const coupon = COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase().trim());
    if (!coupon) return { valid: false, error: 'Kupon kodu geçersiz' };
    if (subtotal < coupon.minPurchase) {
      return { valid: false, error: `Bu kupon ${coupon.minPurchase} TL üzeri için geçerli` };
    }
    let discount = 0;
    if (coupon.type === 'percent') discount = (subtotal * coupon.value) / 100;
    else if (coupon.type === 'fixed') discount = coupon.value;
    return { valid: true, coupon, discount: Math.min(discount, subtotal) };
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price) + ' TL';
  }

  function calculateDiscount(price, oldPrice) {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round((1 - price / oldPrice) * 100);
  }

  // ═══════════════════════════════════════════════════════════
  // GLOBAL PB.products NAMESPACE
  // ═══════════════════════════════════════════════════════════
  window.PB = window.PB || {};
  window.PB.products = {
    all: PRODUCTS,
    categories: CATEGORIES,
    coupons: COUPONS,
    getCategoryBySlug,
    getProductById,
    getProductBySlug,
    getProductsByCategory,
    getProductsBySubcategory,
    getFeaturedProducts,
    getProductsByBadge,
    searchProducts,
    filterProducts,
    validateCoupon,
    formatPrice,
    calculateDiscount
  };

  console.log(`✓ PB.products yüklendi: ${PRODUCTS.length} ürün, ${CATEGORIES.length} ana kategori`);
})();
