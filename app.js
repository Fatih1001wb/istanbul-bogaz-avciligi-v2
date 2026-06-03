/* ── STORE ── */
const S = {
  get cart() {
    return JSON.parse(localStorage.getItem('bk_cart') || '[]')
  },
  set cart(v) {
    localStorage.setItem('bk_cart', JSON.stringify(v))
  },
  get favs() {
    return JSON.parse(localStorage.getItem('bk_favs') || '[]')
  },
  set favs(v) {
    localStorage.setItem('bk_favs', JSON.stringify(v))
  },
  get orders() {
    return JSON.parse(localStorage.getItem('bk_orders') || '[]')
  },
  set orders(v) {
    localStorage.setItem('bk_orders', JSON.stringify(v))
  },
  get addresses() {
    return JSON.parse(localStorage.getItem('bk_addrs') || '[{"id":1,"title":"Ev","full":"Atatürk Cad. No:12, Beşiktaş","city":"İstanbul","default":true}]')
  },
  set addresses(v) {
    localStorage.setItem('bk_addrs', JSON.stringify(v))
  },
  get cards() {
    return JSON.parse(localStorage.getItem('bk_cards') || '[{"id":1,"name":"Ahmet Yılmaz","number":"•••• •••• •••• 4521","expiry":"03/27"}]')
  },
  set cards(v) {
    localStorage.setItem('bk_cards', JSON.stringify(v))
  },
  get user() {
    return JSON.parse(localStorage.getItem('bk_user') || '{"name":"Ahmet Yılmaz","email":"ahmet@example.com","phone":"0532 123 45 67"}')
  },
  set user(v) {
    localStorage.setItem('bk_user', JSON.stringify(v))
  },
};

/* ── PRODUCTS (dışarı taşındı: assets/products.json) ── */
let PRODUCTS = [];

async function loadProductsLocal() {
  try {
    const res = await fetch('assets/products.json');
    if (res.ok) PRODUCTS = await res.json();
    else PRODUCTS = [];
  } catch (e) {
    PRODUCTS = [];
  }
}

const DISTRICTS = [
  // Boğaz Avrupa Yakası
  {
    id: 'sariyer',
    name: 'Sarıyer',
    lat: 41.1673,
    lon: 29.0543,
    side: 'Boğaz',
    icon: '🐬'
  }, {
    id: 'besiktas',
    name: 'Beşiktaş',
    lat: 41.0422,
    lon: 29.0069,
    side: 'Boğaz',
    icon: '🌉'
  }, {
    id: 'beyoglu',
    name: 'Beyoğlu (Karaköy)',
    lat: 41.0333,
    lon: 28.9757,
    side: 'Boğaz',
    icon: '⚓'
  }, {
    id: 'fatih',
    name: 'Fatih (Kumkapı)',
    lat: 41.0122,
    lon: 28.9394,
    side: 'Boğaz',
    icon: '🎣'
  },
  // Boğaz Anadolu Yakası
  {
    id: 'uskudar',
    name: 'Üsküdar',
    lat: 41.0231,
    lon: 29.0152,
    side: 'Boğaz',
    icon: '🕌'
  }, {
    id: 'kadikoy',
    name: 'Kadıköy',
    lat: 40.9909,
    lon: 29.0227,
    side: 'Boğaz',
    icon: '⛵'
  },
  // Marmara Avrupa Yakası
  {
    id: 'bakirkoy',
    name: 'Bakırköy',
    lat: 40.9784,
    lon: 28.8772,
    side: 'Marmara',
    icon: '🌊'
  }, {
    id: 'zeytinburnu',
    name: 'Zeytinburnu',
    lat: 40.9986,
    lon: 28.9056,
    side: 'Marmara',
    icon: '🏖️'
  }, {
    id: 'buyukcekmece',
    name: 'Büyükçekmece',
    lat: 41.0183,
    lon: 28.5909,
    side: 'Marmara',
    icon: '🏊'
  }, {
    id: 'silivri',
    name: 'Silivri',
    lat: 41.0736,
    lon: 28.2480,
    side: 'Marmara',
    icon: '🌾'
  },
  // Marmara Anadolu Yakası
  {
    id: 'maltepe',
    name: 'Maltepe',
    lat: 40.9343,
    lon: 29.1335,
    side: 'Marmara',
    icon: '🌅'
  }, {
    id: 'kartal',
    name: 'Kartal',
    lat: 40.9073,
    lon: 29.1845,
    side: 'Marmara',
    icon: '🦅'
  }, {
    id: 'pendik',
    name: 'Pendik',
    lat: 40.8761,
    lon: 29.2351,
    side: 'Marmara',
    icon: '🚢'
  }, {
    id: 'tuzla',
    name: 'Tuzla',
    lat: 40.8167,
    lon: 29.3013,
    side: 'Marmara',
    icon: '🐠'
  },
  // Adalar & Özel
  {
    id: 'adalar',
    name: 'Adalar',
    lat: 40.8752,
    lon: 29.1228,
    side: 'Adalar',
    icon: '🏝️'
  },
];

/* ── ROUTING ── */
let prevPage = 'home';

function goPage(id, extra) {
  if(id==='community'){ showCommunity(); return; }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const pg = document.getElementById('pg-' + id);
  if(!pg) return;
  pg.classList.add('active');
  const nl = document.getElementById('nl-' + id);
  if (nl) nl.classList.add('active');
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  if (id === 'home') renderHome();
  if (id === 'forecast') initForecast();
  if (id === 'shop') {
    renderShopCats();
    shopFilter();
  }
  if (id === 'product') renderProduct(extra);
  if (id === 'cart') renderCart();
  if (id === 'favorites') renderFavorites();
  if (id === 'account') {
    loadProfile();
    renderOrders();
    renderAddrs();
    renderAcCards();
  }
  prevPage = id;
}

/* ── HELPERS ── */
let _tt;

function toast(msg, icon = '✓') {
  const el = document.getElementById('toast');
  el.innerHTML = `<span>${icon}</span>${msg}`;
  el.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => el.classList.remove('show'), 2800);
}

function fp(n) {
  return n.toLocaleString('tr-TR') + '₺'
}

function stars(n) {
  return Array.from({
    length: 5
  }, (_, i) => `<span style="color:${i<Math.round(n)?'#c8860a':'#d0d0d0'};font-size:.88rem">★</span>`).join('')
}

function updateBadges() {
  const cc = S.cart.reduce((s, x) => s + x.qty, 0),
    fc = S.favs.length;
  ['nb-fav', 'nb-fav-b'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = fc
  });
  ['nb-cart', 'nb-cart-b'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = cc
  });
  const nu = document.getElementById('nav-uname');
  if (nu) nu.textContent = currentUser ? S.user.name.split(' ')[0] : 'Giriş Yap';
}

/* ── FOOTER HTML ── */
function footerHTML() {
  return ''; // Footer kaldırıldı
}

function prodCardHTML(p) {
  const f = favHas(p.id);
  const imgInner = p.img ?
    `<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` +
    `<div class="prod-emoji" style="display:none">${p.emoji}</div>` :
    `<div class="prod-emoji">${p.emoji}</div>`;
  const isKursun = p.cat === 'kurşun' && Array.isArray(p.weights) && p.weights.length;
  const cartHandler = isKursun
    ? `event.stopPropagation();openGramPicker(${p.id})`
    : `event.stopPropagation();cartAdd(${p.id})`;
  const cartLabel = isKursun ? '⚖️ Gram Seç' : '+ Sepet';
  return `<div class="prod-card" onclick="goPage('product',${p.id})">
    <div class="prod-img">${imgInner}</div>
    <div class="prod-body">
      <span class="prod-cat">${p.cat}</span>
      <div class="prod-name">${p.name}</div>
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:.4rem;min-height:1.2rem">${p.rating>0?stars(p.rating)+'<span style="font-size:.71rem;color:var(--mist)">('+p.reviews+')</span>':'<span style="font-size:.72rem;color:var(--sand)">Henüz değerlendirme yok</span>'}</div>
      <div class="prod-desc">${p.desc}</div>
      <div class="prod-foot">
        <div class="prod-price">${fp(p.price)}</div>
        <div class="prod-actions">
          <button class="btn-cart" onclick="${cartHandler}">${cartLabel}</button>
          <button class="btn-fav${f?' on':''}" id="fv${p.id}" onclick="event.stopPropagation();favToggle(${p.id});this.classList.toggle('on')">${f?'♥':'♡'}</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ── CART HELPERS ── */
function cartAdd(pid, opts) {
  opts = opts || {};
  const gram = opts.gram || null;
  const qty = opts.qty || 1;
  let c = S.cart;
  // Aynı ürün + aynı gram varsa adet artır
  const ex = c.find(x => x.id === pid && (x.gram || null) === gram);
  if (ex) ex.qty += qty;
  else c.push({
    id: pid,
    qty: qty,
    gram: gram
  });
  S.cart = c;
  updateBadges();
  toast('Sepete eklendi', '🛒');
}

function cartRemove(pid, gram) {
  gram = gram || null;
  S.cart = S.cart.filter(x => !(x.id === pid && (x.gram || null) === gram));
  updateBadges();
}

function cartChangeQty(pid, d, gram) {
  gram = gram || null;
  let c = S.cart;
  const it = c.find(x => x.id === pid && (x.gram || null) === gram);
  if (!it) return;
  it.qty += d;
  if (it.qty <= 0) c = c.filter(x => !(x.id === pid && (x.gram || null) === gram));
  S.cart = c;
  updateBadges();
}

function cartTotal() {
  return S.cart.reduce((s, it) => {
    const p = PRODUCTS.find(x => x.id === it.id);
    return s + (p ? p.price * it.qty : 0);
  }, 0);
}

function favHas(pid) {
  return S.favs.includes(pid);
}

function favToggle(pid) {
  if (favHas(pid)) {
    S.favs = S.favs.filter(x => x !== pid);
    toast('Favorilerden çıkarıldı', '💔');
  } else {
    S.favs = [...S.favs, pid];
    toast('Favorilere eklendi', '❤️');
  }
  updateBadges();
}

/* ── HOME ── */
function renderHome() {
  const grid = document.getElementById('home-prod-grid');
  if (grid) {
    const featured = [...PRODUCTS].slice(0, 8);
    grid.innerHTML = featured.map(p => prodCardHTML(p)).join('');
  }
  const fh = document.getElementById('home-footer');
  if (fh) fh.innerHTML = footerHTML();

  // Balık haritası — hata olursa sayfayı kırma
  try {
    initFishMap();
  } catch(e) {
    console.warn('Harita yüklenemedi:', e.message);
  }
}

/* ════════════════════════════════════════════════════════
   BALIK AVCILIK HARİTASI (Leaflet)
   ════════════════════════════════════════════════════════ */

// Balık türleri — bölge (ilçe id), sezon ayları (1-12)
const FISH_MAP_DATA = [
  {
    id: 'lufer', name: 'Lüfer', emoji: '🐟',
    months: [9,10,11,12,1,2,3],
    spots: ['sariyer','besiktas','beyoglu','fatih','uskudar','kadikoy'],
    note: 'Boğaz akıntılarının kraliçesi. Çinekop, sarıkanat, lüfer — boy dönemleri.',
    gear: '🪶 Hafif kurşun · Sahte yem / jig'
  },
  {
    id: 'palamut', name: 'Palamut', emoji: '🐠',
    months: [9,10,11],
    spots: ['sariyer','besiktas','uskudar','kadikoy','adalar','beyoglu'],
    note: 'Karadeniz\'den Marmara\'ya sürüyle iner. Eylül–Kasım pik aylar.',
    gear: '⚖️ Orta kurşun · Çapari / spin'
  },
  {
    id: 'levrek', name: 'Levrek', emoji: '🐟',
    months: [9,10,11,12,1,2,3],
    spots: ['sariyer','besiktas','fatih','bakirkoy','maltepe','pendik','tuzla','buyukcekmece'],
    note: 'İskeleler, dalga kıranlar ve kayalık kıyıların pusucu avcısı. Yağmurdan sonra çok aktif.',
    gear: '⚖️ Orta kurşun · Boru kurdu / silikon'
  },
  {
    id: 'cupra', name: 'Çupra & Karagöz', emoji: '🐡',
    months: [3,4,5,6],
    spots: ['tuzla','pendik','kartal','maltepe','adalar','silivri'],
    note: 'Kayalık kıyıların hassas avcısı. İnce misina ve sabır ister.',
    gear: '🪶 Hafif kurşun · Karides / midye'
  },
  {
    id: 'mezgit', name: 'Mezgit', emoji: '🐡',
    months: [11,12,1,2],
    spots: ['kadikoy','bakirkoy','fatih','maltepe','zeytinburnu','silivri'],
    note: 'Soğuk sularda derinden vuran sürü balığı. Akşam ve gece daha verimli.',
    gear: '💪 Ağır kurşun · Çapari / hamsi'
  },
  {
    id: 'istavrit', name: 'İstavrit', emoji: '🐟',
    months: [1,2,3,4,5,6,7,8,9,10,11,12],
    spots: ['sariyer','besiktas','beyoglu','fatih','uskudar','kadikoy','bakirkoy','zeytinburnu','maltepe','kartal','pendik','tuzla','adalar','silivri','buyukcekmece'],
    note: 'Yıl boyu boğazın her noktasında. Çapari ile bol kazanç.',
    gear: '🪶 Hafif kurşun · Çapari sistemi'
  },
  {
    id: 'kalamar', name: 'Kalamar', emoji: '🦑',
    months: [9,10,11,12,1,2,3],
    spots: ['sariyer','adalar','tuzla','besiktas','kadikoy'],
    note: 'Karanlıktan sonra yüzeye yaklaşır. Egi ve ışıklı yem en etkili.',
    gear: '🪶 Hafif kurşun · Egi / ışıklı yem'
  },
  {
    id: 'cinekop', name: 'Sarıkanat & Çinekop', emoji: '🐟',
    months: [10,11,12,1,2],
    spots: ['sariyer','beyoglu','besiktas','uskudar','fatih'],
    note: 'Lüferin küçük boy dönemleri. Galata, Sarayburnu ve Bebek hattı en verimli.',
    gear: '🪶 Hafif kurşun · Spin / canlı yem'
  },
  {
    id: 'uskumru', name: 'Uskumru', emoji: '🐟',
    months: [11,12,1],
    spots: ['sariyer','besiktas','fatih','beyoglu'],
    note: 'Kasım ayı en lezzetli dönemi. Boğaz hattında bol sürü geçişi.',
    gear: '⚖️ Orta kurşun · Çapari'
  },
  {
    id: 'kefal', name: 'Kefal', emoji: '🐟',
    months: [1,2,3,4,5,6,7,8,9,10,11,12],
    spots: ['adalar','tuzla','uskudar','kadikoy','beyoglu','fatih','zeytinburnu'],
    note: 'Yıl boyu kıyıya yakın bulunur. Suyun bulanık olduğu yerlerde aktif.',
    gear: '🪶 Hafif kurşun · Ekmek / mısır'
  }
];

let _fishMap = null;            // Leaflet map instance
let _fishMarkers = {};          // { districtId: marker }
let _selectedFish = null;       // o anki seçili balık id
let _selectedDistrict = null;   // o anki seçili ilçe id

function getCurrentMonth(){ return new Date().getMonth() + 1; }

function fishIsInSeason(fish){
  return fish.months.includes(getCurrentMonth());
}

function fishesInDistrict(districtId, onlyInSeason){
  return FISH_MAP_DATA.filter(f => f.spots.includes(districtId) && (!onlyInSeason || fishIsInSeason(f)));
}

function initFishMap(){
  if (typeof L === 'undefined') {
    // Leaflet henüz yüklenmemiş — biraz bekle
    setTimeout(initFishMap, 200);
    return;
  }
  const mapEl = document.getElementById('fish-map');
  if (!mapEl) return;
  if (_fishMap) { 
    // Zaten varsa, sadece görünümü doğrula
    setTimeout(() => _fishMap.invalidateSize(), 80);
    return;
  }

  // Harita kur — İstanbul ortası
  _fishMap = L.map('fish-map', {
    center: [41.05, 29.0],
    zoom: 10,
    scrollWheelZoom: false,    // anasayfada kazara zoom yapmasın
    zoomControl: true
  });

  // OSM kutucukları (light, professional görünüm için CARTO)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap · © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(_fishMap);

  // İlçe pinleri
  DISTRICTS.forEach(d => {
    const fishHere = fishesInDistrict(d.id, true);
    const hot = fishHere.length > 0;
    const marker = L.marker([d.lat, d.lon], { icon: makeFishIcon(d, hot) }).addTo(_fishMap);
    marker.on('click', () => selectDistrict(d.id));
    _fishMarkers[d.id] = marker;
  });

  // Chip filtreleri render
  renderFishChips();

  // Boyut yenile (responsive)
  setTimeout(() => _fishMap.invalidateSize(), 100);
}

function makeFishIcon(district, hot, selected){
  let cls = 'fm-marker';
  if (selected) cls += ' is-selected';
  else if (hot) cls += ' is-hot';
  else cls += ' is-cold';
  return L.divIcon({
    className: '',
    html: `<div class="${cls}"><span>${district.icon}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

function renderFishChips(){
  const wrap = document.getElementById('fm-chips');
  if (!wrap) return;
  // Sezonda olanları başa al
  const sorted = [...FISH_MAP_DATA].sort((a,b) => {
    return (fishIsInSeason(b)?1:0) - (fishIsInSeason(a)?1:0);
  });
  wrap.innerHTML = `<button class="fm-chip${_selectedFish===null?' active':''}" onclick="selectFishFilter(null)">Tümü</button>` +
    sorted.map(f => {
      const live = fishIsInSeason(f);
      const active = _selectedFish === f.id ? ' active' : '';
      const liveBadge = live ? '<span class="fm-chip-live"></span>' : '';
      return `<button class="fm-chip${active}${live?' is-live':''}" onclick="selectFishFilter('${f.id}')">
        ${liveBadge}<span class="fm-chip-emoji">${f.emoji}</span>${f.name}
      </button>`;
    }).join('');
}

function selectFishFilter(fishId){
  // Aynı chip'e tekrar basılırsa seçimi kaldır
  if (_selectedFish === fishId) fishId = null;
  _selectedFish = fishId;
  _selectedDistrict = null; // balık seçilince ilçe paneli temizle
  renderFishChips();
  updateMarkerStyles();
  renderFishInfo();

  // Seçilen balığın spotlarına haritayı zoom et
  if (fishId && _fishMap){
    const fish = FISH_MAP_DATA.find(f => f.id === fishId);
    if (fish && fish.spots.length){
      const coords = fish.spots
        .map(id => DISTRICTS.find(d => d.id === id))
        .filter(Boolean)
        .map(d => [d.lat, d.lon]);
      if (coords.length){
        _fishMap.fitBounds(coords, { padding: [40,40], maxZoom: 11 });
      }
    }
  } else if (_fishMap){
    _fishMap.setView([41.05, 29.0], 10);
  }
}

function selectDistrict(districtId){
  _selectedDistrict = districtId;
  _selectedFish = null;  // ilçeye tıklanınca balık filtresini temizle
  renderFishChips();
  updateMarkerStyles();
  renderFishInfo();
}

function updateMarkerStyles(){
  DISTRICTS.forEach(d => {
    const marker = _fishMarkers[d.id];
    if (!marker) return;
    const hot = fishesInDistrict(d.id, true).length > 0;
    let selected = false;
    if (_selectedFish){
      const fish = FISH_MAP_DATA.find(f => f.id === _selectedFish);
      selected = fish && fish.spots.includes(d.id);
    }
    marker.setIcon(makeFishIcon(d, hot, selected));
  });
}

function renderFishInfo(){
  const wrap = document.getElementById('fm-info');
  if (!wrap) return;

  // Senaryo 1: Balık seçili
  if (_selectedFish){
    const fish = FISH_MAP_DATA.find(f => f.id === _selectedFish);
    if (!fish) return;
    const live = fishIsInSeason(fish);
    const spots = fish.spots
      .map(id => DISTRICTS.find(d => d.id === id))
      .filter(Boolean);
    const monthNames = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    const seasonStr = fish.months.map(m => monthNames[m-1]).join(' · ');
    wrap.innerHTML = `
      <div class="fm-info-card">
        <div class="fm-info-head">
          <div class="fm-info-icon">${fish.emoji}</div>
          <div>
            <h4>${fish.name}</h4>
            <div class="fm-info-season ${live?'is-live':''}">${live?'🟢 Şu an sezonda':'⚪ Sezon dışı'}</div>
          </div>
        </div>
        <div class="fm-info-row"><b>Av sezonu:</b> ${seasonStr}</div>
        <div class="fm-info-note">${fish.note}</div>
        <div class="fm-info-gear">${fish.gear}</div>
        <div class="fm-info-divider"></div>
        <div class="fm-info-sub">📍 Avlanan bölgeler (${spots.length})</div>
        <div class="fm-info-spots">
          ${spots.map(d => `<button class="fm-spot-btn" onclick="zoomToDistrict('${d.id}')">${d.icon} ${d.name}</button>`).join('')}
        </div>
      </div>`;
    return;
  }

  // Senaryo 2: İlçe seçili
  if (_selectedDistrict){
    const d = DISTRICTS.find(x => x.id === _selectedDistrict);
    if (!d) return;
    const inSeason = fishesInDistrict(d.id, true);
    const offSeason = fishesInDistrict(d.id, false).filter(f => !inSeason.includes(f));
    wrap.innerHTML = `
      <div class="fm-info-card">
        <div class="fm-info-head">
          <div class="fm-info-icon">${d.icon}</div>
          <div>
            <h4>${d.name}</h4>
            <div class="fm-info-season">${d.side} hattı</div>
          </div>
        </div>
        <div class="fm-info-sub" style="margin-top:.6rem">🟢 Şu an avlanan (${inSeason.length})</div>
        <div class="fm-info-fishlist">
          ${inSeason.length ? inSeason.map(f => `
            <button class="fm-fish-row is-live" onclick="selectFishFilter('${f.id}')">
              <span class="fm-fish-row-em">${f.emoji}</span>
              <span class="fm-fish-row-name">${f.name}</span>
            </button>`).join('') : '<div class="fm-fish-empty">Bu ay aktif balık yok.</div>'}
        </div>
        ${offSeason.length ? `
          <div class="fm-info-sub" style="margin-top:.9rem">⚪ Sezonu dışı (${offSeason.length})</div>
          <div class="fm-info-fishlist">
            ${offSeason.map(f => `
              <button class="fm-fish-row" onclick="selectFishFilter('${f.id}')">
                <span class="fm-fish-row-em">${f.emoji}</span>
                <span class="fm-fish-row-name">${f.name}</span>
              </button>`).join('')}
          </div>` : ''}
        <div class="fm-info-divider"></div>
        <button class="fm-cta" onclick="wxDistrict=DISTRICTS.find(x=>x.id==='${d.id}');goPage('forecast');wxLoad()">📡 Bu Bölgenin Koşullarını Gör →</button>
      </div>`;
    return;
  }

  // Senaryo 3: Hiçbir şey seçili değil
  wrap.innerHTML = `
    <div class="fm-info-empty">
      <div class="fm-info-emoji">🗺️</div>
      <h4>Bir ilçe veya balık seç</h4>
      <p>Haritadan bir sahil noktasına tıkla ya da yukarıdan balık seç. O bölgede şu an hangi balıkların avlandığını gör.</p>
    </div>`;
}

function zoomToDistrict(districtId){
  const d = DISTRICTS.find(x => x.id === districtId);
  if (!d || !_fishMap) return;
  _fishMap.setView([d.lat, d.lon], 12);
  selectDistrict(districtId);
}

/* ── SHOP ── */
const SHOP_CATS = [{
  id: 'all',
  label: 'Tümü',
  icon: '🎣'
}, {
  id: 'kurşun',
  label: 'Kurşunlar',
  icon: '🔘'
}, {
  id: 'misina',
  label: 'Misinalar',
  icon: '🪡'
}, {
  id: 'olta',
  label: 'Oltalar',
  icon: '🎣'
}, {
  id: 'iğne',
  label: 'İğneler',
  icon: '🪝'
}, {
  id: 'yem',
  label: 'Yapay Yemler',
  icon: '🐟'
}, {
  id: 'aksesuar',
  label: 'Aksesuarlar',
  icon: '🦺'
}, ];
let shopCat = 'all';

function renderShopCats() {
  document.getElementById('shop-cats').innerHTML = SHOP_CATS.map(c => {
    const n = c.id === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c.id).length;
    return `<li class="cat-item${shopCat===c.id?' active':''}" onclick="shopSetCat('${c.id}')">
      <span>${c.icon} ${c.label}</span><span class="cat-count">${n}</span>
    </li>`;
  }).join('');
}

function shopSetCat(id) {
  shopCat = id;
  renderShopCats();
  shopFilter();
}

function shopFilter() {
  const q = document.getElementById('shop-search')?.value.toLowerCase() || '';
  const maxP = parseInt(document.getElementById('shop-price')?.value || 9999);
  const sort = document.getElementById('shop-sort')?.value || 'default';
  const minR = parseFloat(document.querySelector('input[name="srating"]:checked')?.value || 0);
  const lbl = document.getElementById('shop-price-lbl');
  if (lbl) lbl.textContent = maxP.toLocaleString('tr-TR') + '₺';
  let items = PRODUCTS.filter(p =>
    (shopCat === 'all' || p.cat === shopCat) &&
    (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) &&
    p.price <= maxP && p.rating >= minR
  );
  if (sort === 'price-asc') items.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') items.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') items.sort((a, b) => b.rating - a.rating);
  else if (sort === 'popular') items.sort((a, b) => b.reviews - a.reviews);
  else items.sort((a, b) => a.id - b.id);
  const cnt = document.getElementById('shop-count');
  if (cnt) cnt.textContent = `${items.length} ürün`;
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  grid.innerHTML = items.length ? items.map(p => prodCardHTML(p)).join('') :
    '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--mist)">Ürün bulunamadı.</div>';
  const sf = document.getElementById('shop-footer');
  if (sf && !sf.innerHTML) sf.innerHTML = footerHTML();
}

/* ── PRODUCT DETAIL ── */
function renderProduct(pid) {
  _pdQty = 1;
  _pdGram = null;
  const p = PRODUCTS.find(x => x.id === pid);
  const backBtn = document.getElementById('pd-back');
  backBtn.onclick = () => goPage(prevPage === 'product' ? 'shop' : prevPage);
  const pf = document.getElementById('pd-footer');
  if (pf && !pf.innerHTML) pf.innerHTML = footerHTML();
  if (!p) {
    document.getElementById('pd-content').innerHTML = '<div style="text-align:center;padding:4rem;color:var(--mist)">Ürün bulunamadı.</div>';
    return;
  }
  document.title = `${p.name} — BalıkAvİstanbul`;
  const f = favHas(p.id);
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  document.getElementById('pd-content').innerHTML = `
    <div class="pd-grid">
      <div class="pd-visual"><div class="pd-img">${
        p.img
          ? `<img src="${p.img}" alt="${p.name}" onerror="this.outerHTML='<span style=font-size:8rem>${p.emoji}</span>'">`
          : p.emoji
      }</div></div>
      <div class="pd-info">
        <span class="pcat">${p.cat}</span>
        <h1>${p.name}</h1>
        <div class="pd-rating">${p.rating>0?stars(p.rating)+'<strong style="color:var(--espresso)">'+p.rating+'</strong><span>('+p.reviews+' değerlendirme)</span>':'<span style="color:var(--sand);font-size:.82rem">Henüz değerlendirme yok</span>'}</div>
        <div class="pd-price">${fp(p.price)}</div>
        <p class="pd-desc">${p.desc}</p>
        ${p.cat==='kurşun' && Array.isArray(p.weights) && p.weights.length ? `
        <div class="pd-grams">
          <div class="pd-grams-label">⚖️ Gram seç</div>
          <div class="pd-grams-grid" id="pd-grams-grid">
            ${p.weights.map((w,i)=>`<button class="gram-chip${i===0?' active':''}" onclick="pdSelectGram(this,${w})">${w}<span>g</span></button>`).join('')}
          </div>
          <div class="pd-grams-hint">Seçili: <strong id="pd-gram-sel">${p.weights[0]}g</strong></div>
        </div>` : ''}
        <div class="qty-row">
          <div class="qty-ctrl">
            <button class="qbtn" onclick="pdQty(-1)">−</button>
            <span class="qnum" id="pd-qty">1</span>
            <button class="qbtn" onclick="pdQty(1)">+</button>
          </div>
          <span style="font-size:.8rem;color:var(--mist)">adet</span>
        </div>
        <div class="buy-row">
          <button class="btn btn-dark btn-lg" onclick="pdAddToCart(${p.id})">🛒 Sepete Ekle</button>
          <button class="btn btn-outline btn-lg${f?' active':''}" id="pd-fav-btn" onclick="favToggle(${p.id});updateFavBtn(${p.id})">
            ${f?'♥ Favoride':'♡ Favori'}
          </button>
        </div>
        <div class="feat-list">
          <div class="feat-row">500₺ üzeri ücretsiz kargo</div>
          <div class="feat-row">30 gün iade garantisi</div>
          <div class="feat-row">Orijinal ürün · Fatura ile</div>
          <div class="feat-row">1–3 iş günü teslimat</div>
        </div>
        <div class="del-grid">
          <div class="del-item"><span class="di">🚚</span><div><h5>Hızlı Kargo</h5><p>1–3 iş günü</p></div></div>
          <div class="del-item"><span class="di">↩️</span><div><h5>Kolay İade</h5><p>30 gün içinde</p></div></div>
          <div class="del-item"><span class="di">🔒</span><div><h5>Güvenli Ödeme</h5><p>256-bit SSL</p></div></div>
          <div class="del-item"><span class="di">📞</span><div><h5>Canlı Destek</h5><p>Hft içi 09–18</p></div></div>
        </div>
      </div>
    </div>
    ${related.length?`
    <div style="border-top:1px solid var(--linen);padding-top:2.5rem">
      <h2 style="font-size:1.6rem;color:var(--espresso);margin-bottom:1.2rem">Benzer Ürünler</h2>
      <div class="prod-grid">${related.map(r=>prodCardHTML(r)).join('')}</div>
    </div>`:''}`;
}
let _pdQty = 1;
let _pdGram = null;

function pdQty(d) {
  _pdQty = Math.max(1, Math.min(99, _pdQty + d));
  const el = document.getElementById('pd-qty');
  if (el) el.textContent = _pdQty;
}

function pdSelectGram(btn, gram) {
  _pdGram = gram;
  document.querySelectorAll('#pd-grams-grid .gram-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const sel = document.getElementById('pd-gram-sel');
  if (sel) sel.textContent = gram + 'g';
}

function pdAddToCart(pid) {
  const p = PRODUCTS.find(x => x.id === pid);
  if (!p) return;
  const opts = { qty: _pdQty };
  // Eğer ürünün ağırlık seçenekleri varsa ve seçilmemişse, ilkini al
  if (p.cat === 'kurşun' && Array.isArray(p.weights) && p.weights.length) {
    opts.gram = _pdGram || p.weights[0];
  }
  cartAdd(pid, opts);
}

/* ── HIZLI GRAM SEÇİCİ (Mağaza kartı popup) ── */
let _gpProduct = null;
let _gpGram = null;
let _gpQty = 1;

function openGramPicker(pid) {
  const p = PRODUCTS.find(x => x.id === pid);
  if (!p || !Array.isArray(p.weights) || !p.weights.length) {
    cartAdd(pid);
    return;
  }
  _gpProduct = p;
  _gpGram = p.weights[0];
  _gpQty = 1;

  let overlay = document.getElementById('gpOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'gpOverlay';
    overlay.className = 'gp-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) closeGramPicker(); };
    document.body.appendChild(overlay);
  }

  // Esc ile kapatma
  document.addEventListener('keydown', _gpEscHandler);

  overlay.innerHTML = `
    <div class="gp-modal">
      <button class="gp-close" onclick="closeGramPicker()" aria-label="Kapat">✕</button>
      <div class="gp-head">
        <div class="gp-emoji">${p.emoji || '⚖️'}</div>
        <div>
          <div class="gp-cat">${p.cat}</div>
          <div class="gp-name">${p.name}</div>
          <div class="gp-price">${fp(p.price)}</div>
        </div>
      </div>
      <div class="gp-body">
        <div class="gp-section-title">⚖️ Gram seç</div>
        <div class="gp-grams" id="gp-grams">
          ${p.weights.map((w,i)=>`<button class="gram-chip${i===0?' active':''}" onclick="gpSelectGram(this,${w})">${w}<span>g</span></button>`).join('')}
        </div>
        <div class="gp-row">
          <div class="gp-section-title" style="margin:0">Adet</div>
          <div class="qty-ctrl">
            <button class="qbtn" onclick="gpQty(-1)">−</button>
            <span class="qnum" id="gp-qty">1</span>
            <button class="qbtn" onclick="gpQty(1)">+</button>
          </div>
        </div>
      </div>
      <div class="gp-foot">
        <div class="gp-total">
          <span>Toplam</span>
          <strong id="gp-total-price">${fp(p.price)}</strong>
        </div>
        <button class="btn btn-dark btn-lg" onclick="gpConfirm()">🛒 Sepete Ekle</button>
      </div>
    </div>`;

  // küçük gecikme — animasyon için
  requestAnimationFrame(() => overlay.classList.add('open'));
}

function gpSelectGram(btn, gram) {
  _gpGram = gram;
  document.querySelectorAll('#gp-grams .gram-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
}

function gpQty(d) {
  _gpQty = Math.max(1, Math.min(99, _gpQty + d));
  const el = document.getElementById('gp-qty');
  if (el) el.textContent = _gpQty;
  const total = document.getElementById('gp-total-price');
  if (total && _gpProduct) total.textContent = fp(_gpProduct.price * _gpQty);
}

function gpConfirm() {
  if (!_gpProduct) return;
  cartAdd(_gpProduct.id, { qty: _gpQty, gram: _gpGram });
  closeGramPicker();
}

function closeGramPicker() {
  const overlay = document.getElementById('gpOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  setTimeout(() => { overlay.remove(); }, 200);
  document.removeEventListener('keydown', _gpEscHandler);
  _gpProduct = null;
}

function _gpEscHandler(e) {
  if (e.key === 'Escape') closeGramPicker();
}

function updateFavBtn(pid) {
  const b = document.getElementById('pd-fav-btn');
  if (b) b.innerHTML = favHas(pid) ? '♥ Favoride' : '♡ Favori';
}

/* ── CART ── */
let _discount = 0;

function renderCart() {
  const cart = S.cart;
  const empty = document.getElementById('cart-empty');
  const wrap = document.getElementById('cart-wrap');
  const cf = document.getElementById('cart-footer');
  if (cf && !cf.innerHTML) cf.innerHTML = footerHTML();
  if (!cart.length) {
    empty.style.display = 'block';
    wrap.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  wrap.style.display = 'block';
  document.getElementById('cart-items').innerHTML = cart.map(it => {
    const p = PRODUCTS.find(x => x.id === it.id);
    if (!p) return '';
    const g = it.gram ? `<span class="ci-gram">${it.gram}g</span>` : '';
    const gArg = it.gram ? `,'${it.gram}'` : ',null';
    return `<div class="cart-item">
      <div class="ci-em">${p.img
        ? `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:7px" onerror="this.outerHTML='${p.emoji}'">`
        : p.emoji}</div>
      <div class="ci-info"><div class="ci-cat">${p.cat}${g}</div><div class="ci-name">${p.name}</div><div class="ci-price">${fp(p.price*it.qty)}</div></div>
      <div class="ci-qty">
        <button class="cqb" onclick="cartChangeQty(${p.id},-1${gArg});renderCart()">−</button>
        <span class="cqn">${it.qty}</span>
        <button class="cqb" onclick="cartChangeQty(${p.id},1${gArg});renderCart()">+</button>
      </div>
      <button class="ci-del" onclick="cartRemove(${p.id}${gArg});renderCart();toast('Çıkarıldı','✕')">✕</button>
    </div>`;
  }).join('');
  const sub = cartTotal(),
    ship = sub >= 500 ? 0 : 39,
    grand = sub + ship - _discount;
  const addrs = S.addresses;
  document.getElementById('ob-addr').innerHTML = addrs.length ?
    `<div class="ob-addr"><h5>📍 ${addrs[0].title}</h5><p>${addrs[0].full}</p></div>` :
    `<div class="ob-addr" onclick="goPage('account');showAcSec('addresses')"><h5>+ Teslimat adresi ekle</h5></div>`;
  document.getElementById('ob-rows').innerHTML = `
    <div class="ob-row"><span>Ara Toplam</span><span>${fp(sub)}</span></div>
    <div class="ob-row"><span>Kargo</span><span>${ship===0?'<span style="color:#7dc85a">Ücretsiz 🎉</span>':fp(ship)}</span></div>
    ${_discount?`<div class="ob-row disc"><span>İndirim</span><span>−${fp(_discount)}</span></div>`:''}
    <div class="ob-row total"><span>Toplam</span><span>${fp(grand)}</span></div>`;
}

function applyCoupon() {
  const c = document.getElementById('coupon-inp')?.value.trim().toUpperCase();
  if (c === 'BALIK10') {
    _discount = Math.round(cartTotal() * .1);
    renderCart();
    toast('Kupon uygulandı! %10 indirim', '🎉');
  } else toast('Geçersiz kupon', '✕');
}

function placeOrder() {
  placeOrderAsync();
}

// Ödeme verilerini tutmak için
let _pendingOrder = null;

async function placeOrderAsync() {
  if (!S.cart.length) return;
  if (!currentUser) {
    openAuth('login');
    toast('Sipariş için giriş yapmalısınız', '🔒');
    return;
  }

  const cartItems = S.cart.map(it => {
    const p = PRODUCTS.find(x => x.id === it.id);
    return {
      id: it.id,
      qty: it.qty,
      price: p?.price || 0,
      name: p?.name || 'Ürün',
      gram: it.gram || null
    };
  });

  const subtotal = cartTotal();
  const shippingFee = subtotal >= 500 ? 0 : 39;
  const total = subtotal + shippingFee - _discount;

  const addrs = S.addresses;
  const defaultAddr = addrs.find(a => a.default) || addrs[0] || null;
  const address = defaultAddr ? {
    title: defaultAddr.title,
    full: defaultAddr.full,
    city: defaultAddr.city,
    district: defaultAddr.district,
    zip: defaultAddr.zip
  } : null;

  try {
    const order = await SupaDB.Orders.create(currentUser.id, {
      items: cartItems,
      address,
      subtotal,
      shippingFee,
      discount: _discount,
      total,
      paymentMethod: 'online_test'
    });

    // Ödeme modalına geçiş için sipariş verilerini sakla
    _pendingOrder = {
      order,
      items: cartItems,
      subtotal,
      shippingFee,
      discount: _discount,
      total
    };

    // Ödeme modalını aç
    openPaymentModal();
  } catch (e) {
    toast('Sipariş oluşturulamadı: ' + (e.message || 'Bilinmeyen hata'), '❌');
  }
}

function openPaymentModal() {
  if (!_pendingOrder) return;
  const sub = _pendingOrder.subtotal;
  const ship = _pendingOrder.shippingFee;
  const disc = _pendingOrder.discount;
  const total = _pendingOrder.total;

  document.getElementById('paymentAmount').textContent = fp(total);
  document.getElementById('paymentSummary').innerHTML = `
    Ara Toplam: ${fp(sub)}<br>
    Kargo: ${ship === 0 ? '<span style="color:#22c55e">Ücretsiz</span>' : fp(ship)}<br>
    ${disc > 0 ? `İndirim: −${fp(disc)}<br>` : ''}
    <strong style="border-top:1px solid rgba(0,0,0,.1);display:block;padding-top:.4rem;margin-top:.4rem">Ödenecek Toplam: ${fp(total)}</strong>
  `;
  document.getElementById('paymentOverlay').style.display = 'flex';
}

function closePaymentModal() {
  document.getElementById('paymentOverlay').style.display = 'none';
}

async function confirmPayment() {
  if (!_pendingOrder) return;
  const btn = document.getElementById('paymentConfirmBtn');
  btn.disabled = true;
  btn.innerHTML = '<div style="display:inline-block;width:14px;height:14px;border:2px solid rgba(13, 31, 53,.3);border-top-color:#0d1f35;border-radius:50%;animation:spin .6s linear infinite"></div>';

  try {
    // Stok düşür ve sipariş onaylandı olarak işle
    const order = _pendingOrder.order;
    for (const item of _pendingOrder.items) {
      try {
        await SupaDB.sb.rpc('decrement_stock', { product_id: item.id, qty: item.qty });
      } catch(stockErr) {
        // Stok düşme başarısız olsa da siparişe devam et
        console.warn('Stok güncelleme hatası:', stockErr.message);
        // Manuel stok düşme
        const { data: prod } = await SupaDB.sb.from('products').select('stock').eq('id', item.id).single();
        if (prod) {
          await SupaDB.sb.from('products').update({ stock: Math.max(0, prod.stock - item.qty) }).eq('id', item.id);
        }
      }
    }

    // Siparişi confirmed duruma getir
    await SupaDB.sb.from('orders')
      .update({ status: 'confirmed', payment_ref: 'TEST_PAYMENT_' + Date.now() })
      .eq('id', order.id);

    // Verileri temizle
    S.cart = [];
    _discount = 0;
    _pendingOrder = null;

    // Arayüzü güncelle
    await syncUserOrders();
    updateBadges();
    loadProfile();

    closePaymentModal();
    toast('Ödeme başarılı! Siparişiniz onaylandı 🎉', '✓');

    setTimeout(() => {
      goPage('account');
      showAcSec('orders');
    }, 1000);
  } catch (e) {
    toast('Ödeme işlenirken hata: ' + (e.message || 'Bilinmeyen hata'), '❌');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Ödemeyi Onayla';
  }
}

/* ── FAVORITES ── */
function renderFavorites() {
  const favs = S.favs;
  const ff = document.getElementById('fav-footer');
  if (ff && !ff.innerHTML) ff.innerHTML = footerHTML();
  const items = PRODUCTS.filter(p => favs.includes(p.id));
  document.getElementById('fav-content').innerHTML = items.length ?
    `<div class="prod-grid">${items.map(p=>prodCardHTML(p)).join('')}</div>` :
    `<div style="text-align:center;padding:4rem 2rem;border:2px dashed var(--parchment);border-radius:11px;background:var(--ivory)">
        <div style="font-size:2.5rem;margin-bottom:.8rem;opacity:.4">♡</div>
        <h2 style="font-size:1.4rem;color:var(--brown);margin-bottom:.4rem">Henüz Favori Yok</h2>
        <p style="color:var(--mist);margin-bottom:1.2rem;font-size:.88rem">Mağazada beğendiğin ürünleri favorilere ekle.</p>
        <button class="btn btn-dark" onclick="goPage('shop')">Mağazaya Git →</button>
      </div>`;
}

/* ── FORECAST ── */
let wxDistrict = null;
let CURRENT_FORECAST = {};

function initForecast() {
  renderDChips('all');
  const ff = document.getElementById('fc-footer');
  if (ff && !ff.innerHTML) ff.innerHTML = footerHTML();
  document.querySelectorAll('.side-tab').forEach(t => {
    t.onclick = () => {
      document.querySelectorAll('.side-tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      renderDChips(t.dataset.side);
    };
  });
}

function renderDChips(filter) {
  const list = filter === 'all' ? DISTRICTS : DISTRICTS.filter(d => d.side === filter);
  document.getElementById('d-chips').innerHTML = list.map(d => `
    <button class="d-chip${wxDistrict?.id===d.id?' active':''}" onclick="wxSelect('${d.id}')">
      <span class="d-chip-icon">${d.icon}</span>${d.name}
    </button>`).join('');
}
async function wxSelect(id) {
  wxDistrict = DISTRICTS.find(d => d.id === id);
  if (!wxDistrict) return;
  document.querySelectorAll('.d-chip').forEach(c => c.classList.toggle('active', c.textContent.includes(wxDistrict.icon)));
  document.getElementById('fc-empty').style.display = 'none';
  document.getElementById('fc-content').style.display = 'block';
  document.getElementById('wx-district').textContent = `${wxDistrict.icon} ${wxDistrict.name}`;
  document.getElementById('wx-upd').textContent = 'Yükleniyor...';
  document.getElementById('wx-stats').innerHTML = Array(8).fill('<div style="height:104px;border-radius:9px" class="skel"></div>').join('');
  await wxLoad();
}
async function wxLoad() {
  const btn = document.getElementById('wx-refresh');
  btn.classList.add('spin');
  let data, sim = false;
  try {
    data = await wxFetch(wxDistrict.lat, wxDistrict.lon);
  } catch (e) {
    data = wxMock();
    sim = true;
  }
  btn.classList.remove('spin');
  document.getElementById('wx-sim').style.display = sim ? 'inline-flex' : 'none';
  const now = new Date().toLocaleString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'long'
  });
  document.getElementById('wx-upd').textContent = `Son güncelleme: ${now}`;
  wxRenderStats(data.w, data.m);
  wxRenderScore(data.w, data.m);
  wxRenderRecs(data.w, data.m);
}

function wxRefresh() {
  if (wxDistrict) wxLoad();
}
async function wxFetch(lat, lon) {
  const [wR, mR] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,visibility,relative_humidity_2m&timezone=Europe%2FIstanbul`),
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=sea_surface_temperature,ocean_current_velocity,ocean_current_direction,wave_height&timezone=Europe%2FIstanbul`)
  ]);
  const w = await wR.json(),
    m = await mR.json();
  return {
    w: w.current,
    m: m.current
  };
}

function wxMock() {
  return {
    w: {
      temperature_2m: +(14 + Math.random() * 12).toFixed(1),
      wind_speed_10m: +(5 + Math.random() * 30).toFixed(1),
      wind_direction_10m: Math.floor(Math.random() * 360),
      visibility: +(6000 + Math.random() * 14000).toFixed(0),
      relative_humidity_2m: +(50 + Math.random() * 40).toFixed(0)
    },
    m: {
      sea_surface_temperature: +(13 + Math.random() * 9).toFixed(1),
      ocean_current_velocity: +(0.1 + Math.random() * 0.8).toFixed(2),
      ocean_current_direction: Math.floor(Math.random() * 360),
      wave_height: +(0.1 + Math.random() * 1.2).toFixed(2)
    },
    simulated: true
  };
}

function wDir(d) {
  return ['K', 'KKD', 'KD', 'DKD', 'D', 'DGB', 'GD', 'GGB', 'G', 'GGB', 'GB', 'BBG', 'B', 'KBB', 'KB', 'KKB'][Math.round((d || 0) / 22.5) % 16];
}

function wxRenderStats(w, m) {
  const ss = [{
    i: '🌡️',
    l: 'Hava',
    v: w?.temperature_2m != null ? `${Math.round(w.temperature_2m)}°C` : '—',
    s: 'Celsius'
  }, {
    i: '🌊',
    l: 'Deniz',
    v: m?.sea_surface_temperature != null ? `${Math.round(m.sea_surface_temperature)}°C` : '—',
    s: 'Yüzey'
  }, {
    i: '💨',
    l: 'Rüzgar',
    v: w?.wind_speed_10m != null ? `${Math.round(w.wind_speed_10m)} km/s` : '—',
    s: wDir(w?.wind_direction_10m)
  }, {
    i: '🌀',
    l: 'Akıntı',
    v: m?.ocean_current_velocity != null ? `${m.ocean_current_velocity.toFixed(2)} m/s` : '—',
    s: wDir(m?.ocean_current_direction)
  }, {
    i: '〰️',
    l: 'Dalga',
    v: m?.wave_height != null ? `${m.wave_height.toFixed(1)} m` : '—',
    s: 'Yükseklik'
  }, {
    i: '🧭',
    l: 'Yön',
    v: wDir(w?.wind_direction_10m),
    s: `${Math.round(w?.wind_direction_10m||0)}°`
  }, {
    i: '👁️',
    l: 'Görüş',
    v: w?.visibility != null ? `${(w.visibility/1e3).toFixed(1)} km` : '—',
    s: ''
  }, {
    i: '💧',
    l: 'Nem',
    v: w?.relative_humidity_2m != null ? `%${Math.round(w.relative_humidity_2m)}` : '—',
    s: ''
  }, ];
  document.getElementById('wx-stats').innerHTML = ss.map(x => `<div class="stat-card"><div class="stat-icon">${x.i}</div><div class="stat-lbl">${x.l}</div><div class="stat-val">${x.v}</div>${x.s?`<div class="stat-sub">${x.s}</div>`:''}</div>`).join('');
}

function wxFishScore(w, m) {
  let s = 100;
  const ws = w?.wind_speed_10m || 0,
    seaT = m?.sea_surface_temperature || 16,
    curr = m?.ocean_current_velocity || 0.2,
    wave = m?.wave_height || 0.3;
  if (ws > 45) s -= 55;
  else if (ws > 30) s -= 35;
  else if (ws > 20) s -= 18;
  else if (ws > 12) s -= 8;
  if (seaT < 8 || seaT > 30) s -= 25;
  else if (seaT < 12) s -= 12;
  else if (seaT >= 16 && seaT <= 24) s += 5;
  if (curr > 1.5) s -= 30;
  else if (curr > 1.0) s -= 15;
  else if (curr >= 0.2 && curr <= 0.5) s += 5;
  if (wave > 2.0) s -= 35;
  else if (wave > 1.2) s -= 15;
  else if (wave > 0.6) s -= 5;
  s = Math.max(0, Math.min(100, Math.round(s)));
  const lvls = [{
    min: 80,
    label: 'Mükemmel',
    cls: 'sp-green',
    color: '#3d8a2a',
    comment: 'Harika koşullar! Bugün olta atmak için biçilmiş kaftan.'
  }, {
    min: 60,
    label: 'İyi',
    cls: 'sp-blue',
    color: '#2a6a8a',
    comment: 'Koşullar oldukça iyi. Doğru teknikle başarılı bir seans.'
  }, {
    min: 38,
    label: 'Orta',
    cls: 'sp-amber',
    color: '#1a8fd1',
    comment: 'Kabul edilebilir koşullar. Ağır kurşun ve güçlü misina kullanın.'
  }, {
    min: 0,
    label: 'Zayıf',
    cls: 'sp-red',
    color: '#8c2a1a',
    comment: 'Zor koşullar. Korunaklı noktaları tercih edin.'
  }, ];
  return {
    score: s,
    ...lvls.find(l => s >= l.min)
  };
}

function wxRenderScore(w, m) {
  const {
    score,
    label,
    cls,
    color,
    comment
  } = wxFishScore(w, m);
  document.getElementById('sc-num').textContent = score;
  // Conic gradient daire
  const deg = Math.round(score * 3.6);
  const circle = document.getElementById('sc-circle');
  if (circle) {
    circle.style.background = `conic-gradient(${color} 0deg, ${color} ${deg}deg, rgba(250,244,236,.06) ${deg}deg 360deg)`;
  }
  document.getElementById('sc-bar').style.cssText = `width:${score}%;background:${color}`;
  const clsMap = {
    green: 'sp-green',
    blue: 'sp-blue',
    amber: 'sp-amber',
    red: 'sp-red'
  };
  const pill = document.getElementById('sc-pill');
  pill.textContent = label;
  pill.className = `score-pill ${clsMap[cls]||'sp-amber'}`;
  document.getElementById('sc-comment').textContent = comment;
  
  // Score değerini CURRENT_FORECAST'a kaydet
  CURRENT_FORECAST[wxDistrict?.id] = { score };
}

function wxRenderRecs(w, m) {
  const { score } = wxFishScore(w, m);
  const windSpeed = w?.wind_speed_10m || 0;

  // Skora göre koşul kategorisi
  let cat, condLabel;
  if (score >= 66)      { cat = 'hafif'; condLabel = 'Sakin koşullar'; }
  else if (score >= 33) { cat = 'orta';  condLabel = 'Orta koşullar'; }
  else                  { cat = 'ağır';  condLabel = 'Sert koşullar'; }

  // Önerilen ürünler: kategoriye uygun kurşun + misina + olta + ek
  const picks = [];
  const kursun = PRODUCTS.find(p => p.cat === 'kurşun' && p.weightType === cat);
  if (kursun) picks.push(kursun);

  const misinaMono = PRODUCTS.find(p => p.cat === 'misina' && p.forWeights === cat && p.type === 'mono');
  if (misinaMono) picks.push(misinaMono);

  const misinaPE = PRODUCTS.find(p => p.cat === 'misina' && p.forWeights === cat && p.type === 'pe');
  if (misinaPE) picks.push(misinaPE);

  // Olta — rüzgâr 20+ ise surf, değilse spin
  const oltaType = windSpeed > 20 || cat === 'ağır' ? 'surf' : 'spin';
  const olta = PRODUCTS.find(p => p.cat === 'olta' && p.type === oltaType);
  if (olta) picks.push(olta);

  // En fazla 4 ürün
  const items = picks.slice(0, 4);

  const wrap = document.getElementById('wx-recs');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="wx-recs-head">
      <div class="wx-recs-icon">🎯</div>
      <div>
        <h3>Önerilen Ürünler</h3>
        <p>${condLabel} · skoruna göre seçildi</p>
      </div>
    </div>
    <div class="wx-recs-list">
      ${items.map(p => {
        const img = p.img
          ? `<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.outerHTML='<span class=wxrp-emoji>${p.emoji}</span>'">`
          : `<span class="wxrp-emoji">${p.emoji}</span>`;
        const isKursun = p.cat === 'kurşun' && Array.isArray(p.weights) && p.weights.length;
        const btn = isKursun
          ? `<button class="wxrp-btn" onclick="event.stopPropagation();openGramPicker(${p.id})">⚖️ Gram Seç</button>`
          : `<button class="wxrp-btn" onclick="event.stopPropagation();cartAdd(${p.id})">+ Sepete Ekle</button>`;
        return `
          <div class="wxrp" onclick="goPage('product',${p.id})">
            <div class="wxrp-img">${img}</div>
            <div class="wxrp-body">
              <div class="wxrp-cat">${p.cat}</div>
              <div class="wxrp-name">${p.name}</div>
              <div class="wxrp-foot">
                <div class="wxrp-price">${fp(p.price)}</div>
                ${btn}
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>
    <button class="wx-recs-all" onclick="goPage('shop')">Tüm Ürünleri Gör →</button>
  `;
}

/* ── ACCOUNT ── */
const AC_MAP = {
  profile: 0,
  orders: 1,
  addresses: 2,
  cards: 3,
  settings: 4
};
const STATUS_MAP = {
  pending: {
    l: 'Hazırlanıyor',
    c: 'pill-blue'
  },
  confirmed: {
    l: 'Onaylandı',
    c: 'pill-blue'
  },
  shipped: {
    l: 'Kargoda',
    c: 'pill-amber'
  },
  delivered: {
    l: 'Teslim Edildi',
    c: 'pill-green'
  },
  cancelled: {
    l: 'İptal',
    c: 'pill-red'
  }
};

function showAcSec(id) {
  document.querySelectorAll('.ac-sec').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.ac-tab').forEach(b => b.classList.remove('active'));
  const sec = document.getElementById('ac-' + id);
  if (sec) sec.classList.add('active');
  const btns = document.querySelectorAll('.ac-tab');
  if (AC_MAP[id] !== undefined) btns[AC_MAP[id]]?.classList.add('active');
  if (id === 'orders') renderOrders();
  if (id === 'addresses') renderAddrs();
  if (id === 'cards') renderAcCards();
}

function loadProfile() {
  const u = S.user;
  const parts = u.name.split(' ');
  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v || ''
  };
  setVal('pf-fn', parts[0] || '');
  setVal('pf-ln', parts.slice(1).join(' ') || '');
  setVal('pf-email', u.email || '');
  setVal('pf-phone', u.phone || '');
  const setTxt = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v || ''
  };
  setTxt('ac-sidebar-name', u.name);
  setTxt('ac-sidebar-email', u.email);
  setTxt('nav-uname', u.name.split(' ')[0]);
  const setNum = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v
  };
  setNum('st-orders', S.orders.length);
  setNum('st-favs', S.favs.length);
  setNum('st-cart', S.cart.reduce((s, x) => s + x.qty, 0));
  const af = document.getElementById('ac-footer');
  if (af && !af.innerHTML) af.innerHTML = footerHTML();
}

async function syncUserOrders() {
  if (!currentUser) return;
  try {
    const dbOrders = await SupaDB.Orders.getUserOrders(currentUser.id);
    S.orders = (dbOrders || []).map(o => ({
      id: o.order_no,
      items: (o.order_items || []).map(it => ({
        id: it.products?.id || it.product_id,
        qty: it.quantity,
        unit_price: Number(it.unit_price || 0),
        total_price: Number(it.total_price || 0),
        name: it.products?.name || 'Ürün',
        gram: it.gram || null
      })),
      total: Number(o.total || 0),
      date: new Date(o.created_at).toLocaleDateString('tr-TR'),
      status: o.status || 'pending'
    }));
  } catch (e) {
    // Sipariş alanını yerel veride tutmaya devam et.
  }
}

async function syncUserAddresses() {
  if (!currentUser) return;
  try {
    const addrs = await SupaDB.Profile.getAddresses(currentUser.id);
    S.addresses = (addrs || []).map(a => ({
      id: a.id,
      title: a.title,
      full: a.full_addr,
      district: a.district,
      city: a.city,
      zip: a.zip,
      default: !!a.is_default
    }));
  } catch (e) {
    // Adres alanını yerel veride tutmaya devam et.
  }
}

async function saveProfile() {
  const g = id => document.getElementById(id)?.value.trim() || '';
  const name = `${g('pf-fn')} ${g('pf-ln')}`.trim();
  if (!name) {
    toast('Ad alanı zorunludur', '⚠️');
    return;
  }
  const email = g('pf-email');
  if (email && !email.includes('@')) {
    toast('Geçerli bir e-posta girin', '⚠️');
    return;
  }
  const nextUser = {
    ...S.user,
    name,
    email,
    phone: g('pf-phone')
  };
  if (currentUser) {
    try {
      await SupaDB.Profile.update(currentUser.id, {
        full_name: nextUser.name,
        phone: nextUser.phone
      });
    } catch (e) {
      toast('Profil güncellenemedi: ' + (e.message || 'Bilinmeyen hata'), '❌');
      return;
    }
  }
  S.user = nextUser;
  loadProfile();
  updateBadges();
  toast('Profil kaydedildi', '✓');
}

function cargoTrackHTML(o) {
  const steps = [
    { key: 'pending',    icon: '📋', label: 'Sipariş Alındı',    sub: 'Siparişiniz sisteme kaydedildi' },
    { key: 'confirmed',  icon: '✅', label: 'Sipariş Onaylandı', sub: 'Ödemeniz doğrulandı' },
    { key: 'processing', icon: '📦', label: 'Hazırlanıyor',       sub: 'Ürünler paketleniyor' },
    { key: 'shipped',    icon: '🚚', label: 'Kargoya Verildi',    sub: o.cargo_code ? `Takip No: <strong>${o.cargo_code}</strong>` : 'Kargo firmasına teslim edildi' },
    { key: 'delivered',  icon: '🎉', label: 'Teslim Edildi',      sub: 'Ürününüz adresinize ulaştı' },
  ];

  const order_steps = ['pending','confirmed','processing','shipped','delivered'];
  const currentIdx = order_steps.indexOf(o.status);
  const isCancelled = o.status === 'cancelled';

  if(isCancelled) return `
    <div style="margin-top:1rem;padding:.9rem 1rem;background:#fff5f5;border:1px solid #fecaca;border-radius:8px;display:flex;align-items:center;gap:9px">
      <span style="font-size:1.2rem">❌</span>
      <div>
        <div style="font-size:.85rem;font-weight:700;color:#dc2626">Sipariş İptal Edildi</div>
        <div style="font-size:.78rem;color:#ef4444">İade işleminiz başlatılmıştır.</div>
      </div>
    </div>`;

  return `
    <div style="margin-top:1rem;padding:1rem;background:var(--cream);border-radius:8px;border:1px solid var(--linen)">
      <div style="font-size:.78rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--caramel);margin-bottom:.9rem">📡 Kargo Takip</div>
      <div style="position:relative;padding-left:1.8rem">
        <!-- Dikey çizgi -->
        <div style="position:absolute;left:10px;top:8px;bottom:8px;width:2px;background:var(--linen)"></div>
        ${steps.map((s, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return `
          <div style="position:relative;display:flex;align-items:flex-start;gap:.8rem;margin-bottom:${i<steps.length-1?'.9rem':'0'}">
            <div style="position:absolute;left:-1.8rem;width:20px;height:20px;border-radius:50%;background:${done?'var(--caramel)':'var(--linen)'};border:2px solid ${active?'var(--honey)':done?'var(--caramel)':'var(--parchment)'};display:flex;align-items:center;justify-content:center;font-size:.65rem;flex-shrink:0;transition:all .3s;${active?'box-shadow:0 0 0 4px rgba(26,143,209,.15)':''}">
              ${done ? (i === currentIdx ? '●' : '✓') : ''}
            </div>
            <div style="padding-top:1px">
              <div style="font-size:.82rem;font-weight:${active?'700':'500'};color:${done?'var(--espresso)':'var(--sand)'}">${s.icon} ${s.label}</div>
              <div style="font-size:.74rem;color:${done?'var(--mist)':'var(--parchment)'};margin-top:1px">${done ? s.sub : ''}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
      ${o.cargo_code && o.status === 'shipped' ? `
      <div style="margin-top:.9rem;padding:.6rem .9rem;background:rgba(26,143,209,.08);border:1px solid rgba(26,143,209,.2);border-radius:6px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:.72rem;color:var(--mist)">Kargo Takip Numarası</div>
          <div style="font-size:.9rem;font-weight:700;color:var(--caramel)">${o.cargo_code}</div>
        </div>
        <button onclick="navigator.clipboard?.writeText('${o.cargo_code}');toast('Kopyalandı','📋')" style="background:var(--caramel);color:#fff;border:none;border-radius:5px;padding:5px 10px;font-size:.75rem;cursor:pointer">Kopyala</button>
      </div>` : ''}
    </div>`;
}

function renderOrders() {
  const el = document.getElementById('ac-orders-list');
  if (!el) return;
  const list = S.orders;
  if (!list.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:3rem;color:var(--mist);border:2px dashed var(--parchment);border-radius:10px">
        <div style="font-size:2.5rem;margin-bottom:.8rem;opacity:.4">📦</div>
        <div style="font-size:1rem;margin-bottom:.4rem;color:var(--brown);font-family:'Cormorant Garamond',serif">Henüz siparişiniz yok</div>
        <div style="font-size:.85rem;margin-bottom:1.2rem">Mağazamızı keşfedin ve ilk siparişinizi verin.</div>
        <button class="btn btn-dark btn-sm" onclick="goPage('shop')">Mağazaya Git →</button>
      </div>`;
    return;
  }
  el.innerHTML = list.map(o => {
    const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
    const itemRows = (o.items || []).map(it => {
      const p = PRODUCTS.find(x => x.id === it.id);
      const unitPrice = Number(it.unit_price || p?.price || 0);
      if (!p) return '';
      const thumb = p.img ?
        `<img src="${p.img}" style="width:38px;height:38px;border-radius:5px;object-fit:cover;flex-shrink:0">` :
        `<span class="oie">${p.emoji}</span>`;
      const gramBadge = it.gram ? `<span style="background:var(--linen);color:var(--brown);font-size:.7rem;padding:1px 6px;border-radius:6px;margin-left:6px;font-weight:600">${it.gram}g</span>` : '';
      return `<div class="oitem-row">${thumb}<span style="flex:1">${it.name || p.name}${gramBadge}</span><span style="color:var(--mist);white-space:nowrap">${it.qty} × ${fp(unitPrice)}</span></div>`;
    }).join('');
    return `
      <div class="order-card">
        <div class="order-head" onclick="this.nextElementSibling.classList.toggle('open')">
          <span class="order-id">#${o.id}</span>
          <span class="order-date">${o.date}</span>
          <span class="pill ${st.c}">${st.l}</span>
          <span class="order-total">${fp(o.total)}</span>
          <span style="color:var(--sand);font-size:.8rem;margin-left:auto">▾</span>
        </div>
        <div class="order-body">
          ${itemRows}
          ${cargoTrackHTML(o)}
          <div style="display:flex;gap:7px;margin-top:.8rem;padding-top:.8rem;border-top:1px solid var(--linen)">
            <button class="btn btn-outline btn-sm" onclick="toast('Fatura e-posta ile gönderildi','📧')">📄 Fatura</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderAddrs() {
  const el = document.getElementById('ac-addr-grid');
  if (!el) return;
  const addrs = S.addresses;
  if (!addrs.length) {
    el.innerHTML = '<p style="color:var(--mist);font-size:.88rem">Henüz kayıtlı adresiniz yok.</p>';
    return;
  }
  el.innerHTML = addrs.map(a => `
    <div class="icard${a.default?' is-default':''}">
      <h4>${a.title}${a.default?'<span class="def-badge">Varsayılan</span>':''}</h4>
      <p>${a.full}</p>
      <p style="margin-top:2px">${[a.district,a.city].filter(Boolean).join(', ')}${a.zip?' '+a.zip:''}</p>
      <div class="icard-actions">
        ${!a.default?`<button class="defbtn" onclick="setDefaultAddr(${a.id})">⭐ Varsayılan Yap</button>`:''}
        <button class="delbtn" onclick="deleteAddr(${a.id})">✕ Sil</button>
      </div>
    </div>`).join('');
}

async function saveAddress() {
  const g = id => document.getElementById(id)?.value.trim() || '';
  const title = g('af-title'),
    full = g('af-full');
  if (!title) {
    toast('Adres başlığı zorunludur', '⚠️');
    return;
  }
  if (!full) {
    toast('Adres bilgisi zorunludur', '⚠️');
    return;
  }
  const addrs = S.addresses;
  const newAddress = {
    title,
    full,
    district: g('af-district'),
    city: g('af-city') || 'İstanbul',
    zip: g('af-zip'),
    default: addrs.length === 0
  };
  if (currentUser) {
    try {
      await SupaDB.Profile.addAddress(currentUser.id, {
        title: newAddress.title,
        full_addr: newAddress.full,
        district: newAddress.district,
        city: newAddress.city,
        zip: newAddress.zip,
        is_default: newAddress.default
      });
      await syncUserAddresses();
    } catch (e) {
      toast('Adres eklenemedi: ' + (e.message || 'Bilinmeyen hata'), '❌');
      return;
    }
  } else {
    addrs.push({
      id: Date.now(),
      title: newAddress.title,
      full: newAddress.full,
      district: newAddress.district,
      city: newAddress.city,
      zip: newAddress.zip,
      default: newAddress.default
    });
    S.addresses = addrs;
  }
  renderAddrs();
  toggleForm('ac-addr-form');
  ['af-title', 'af-full', 'af-district', 'af-zip'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  toast('Adres eklendi', '📍');
}

async function deleteAddr(id) {
  if (!confirm('Bu adresi silmek istiyor musunuz?')) return;
  if (currentUser) {
    try {
      await SupaDB.Profile.deleteAddress(id);
      await syncUserAddresses();
    } catch (e) {
      toast('Adres silinemedi: ' + (e.message || 'Bilinmeyen hata'), '❌');
      return;
    }
  }
  let addrs = S.addresses.filter(a => a.id !== id);
  if (addrs.length && !addrs.some(a => a.default)) addrs[0].default = true;
  S.addresses = addrs;
  renderAddrs();
  toast('Adres silindi', '🗑️');
}

async function setDefaultAddr(id) {
  if (currentUser) {
    try {
      await SupaDB.Profile.setDefaultAddress(currentUser.id, id);
      await syncUserAddresses();
    } catch (e) {
      toast('Varsayılan adres güncellenemedi', '❌');
      return;
    }
  }
  S.addresses = S.addresses.map(a => ({
    ...a,
    default: a.id === id
  }));
  renderAddrs();
  toast('Varsayılan adres güncellendi', '✓');
}

function renderAcCards() {
  const el = document.getElementById('ac-cards-grid');
  if (!el) return;
  const cards = S.cards;
  if (!cards.length) {
    el.innerHTML = '<p style="color:var(--mist);font-size:.88rem">Henüz kayıtlı kartınız yok.</p>';
    return;
  }
  el.innerHTML = cards.map(c => `
    <div class="icard">
      <div class="cc-vis">
        <div style="font-size:.68rem;color:rgba(250,244,236,.35);letter-spacing:.06em;text-transform:uppercase;margin-bottom:.5rem;position:relative;z-index:1">Kredi / Banka Kartı</div>
        <div class="cc-num">${c.number}</div>
        <div class="cc-holder">${c.name}<span class="cc-exp">${c.expiry}</span></div>
      </div>
      <div class="icard-actions">
        <button class="delbtn" onclick="deleteCard(${c.id})">✕ Kartı Sil</button>
      </div>
    </div>`).join('');
}

function saveCard() {
  const g = id => document.getElementById(id)?.value.trim() || '';
  const name = g('cf-name'),
    number = g('cf-number'),
    expiry = g('cf-exp'),
    cvv = g('cf-cvv');
  if (!name) {
    toast('Kart sahibi adı zorunludur', '⚠️');
    return;
  }
  if (number.replace(/\s/g, '').length < 16) {
    toast('Geçerli kart numarası girin', '⚠️');
    return;
  }
  if (!expiry) {
    toast('Son kullanma tarihi zorunludur', '⚠️');
    return;
  }
  if (!cvv) {
    toast('CVV zorunludur', '⚠️');
    return;
  }
  const masked = '•••• •••• •••• ' + number.replace(/\s/g, '').slice(-4);
  S.cards = [...S.cards, {
    id: Date.now(),
    name,
    number: masked,
    expiry
  }];
  renderAcCards();
  toggleForm('ac-card-form');
  ['cf-name', 'cf-number', 'cf-exp', 'cf-cvv'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  toast('Kart eklendi', '💳');
}

function deleteCard(id) {
  if (!confirm('Bu kartı silmek istiyor musunuz?')) return;
  S.cards = S.cards.filter(c => c.id !== id);
  renderAcCards();
  toast('Kart silindi', '🗑️');
}

/* ── AUTH MODAL ── */
let currentUser = null;

function openAuthOrAccount() {
  if (currentUser) goPage('account');
  else openAuth('login');
}

function openAuth(tab = 'login') {
  document.getElementById('authOverlay').classList.add('open');
  switchTab(tab);
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const el = tab === 'login' ?
      document.getElementById('li-email') :
      document.getElementById('reg-fn');
    el?.focus();
  }, 120);
}

function closeAuth() {
  document.getElementById('authOverlay').classList.remove('open');
  document.body.style.overflow = '';
  clearAuthErrors();
}

function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('form-login').style.display = isLogin ? 'block' : 'none';
  document.getElementById('form-register').style.display = isLogin ? 'none' : 'block';
  document.getElementById('atab-login').classList.toggle('active', isLogin);
  document.getElementById('atab-register').classList.toggle('active', !isLogin);
  clearAuthErrors();
}

function clearAuthErrors() {
  document.getElementById('auth-err').classList.remove('show');
  document.getElementById('auth-success').classList.remove('show');
}

function showAuthErr(msg) {
  document.getElementById('auth-err-txt').textContent = msg;
  document.getElementById('auth-err').classList.add('show');
  document.getElementById('auth-success').classList.remove('show');
}

function showAuthSuccess(msg) {
  document.getElementById('auth-success-txt').textContent = msg;
  document.getElementById('auth-success').classList.add('show');
  document.getElementById('auth-err').classList.remove('show');
}

function setAuthLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

async function doAuthLogin() {
  const email = document.getElementById('li-email').value.trim();
  const pass = document.getElementById('li-pass').value;
  clearAuthErrors();
  if (!email) {
    showAuthErr('E-posta adresi zorunludur.');
    return;
  }
  if (!pass) {
    showAuthErr('Şifre zorunludur.');
    return;
  }
  setAuthLoading('btn-login', true);
  try {
    const { user } = await SupaDB.Auth.login(email, pass);
    currentUser = user;
    const profile = await SupaDB.Profile.get(user.id);
    S.user = {
      name: profile?.full_name || user.email.split('@')[0],
      email: user.email,
      phone: profile?.phone || ''
    };
    await syncUserOrders();
    await syncUserAddresses();
    updateBadges();
    showAuthSuccess('Giriş başarılı! Hoş geldiniz.');
    setTimeout(() => {
      closeAuth();
      goPage('account');
    }, 900);
  } catch (e) {
    showAuthErr(e.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
    document.getElementById('li-pass').value = '';
    document.getElementById('li-pass').focus();
  } finally {
    setAuthLoading('btn-login', false);
  }
}

async function doAuthRegister() {
  const fn = document.getElementById('reg-fn').value.trim();
  const ln = document.getElementById('reg-ln').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const phone = document.getElementById('reg-phone').value.trim();
  clearAuthErrors();
  if (!fn) {
    showAuthErr('Ad alanı zorunludur.');
    return;
  }
  if (!email) {
    showAuthErr('E-posta adresi zorunludur.');
    return;
  }
  if (!email.includes('@')) {
    showAuthErr('Geçerli bir e-posta girin.');
    return;
  }
  if (pass.length < 6) {
    showAuthErr('Şifre en az 6 karakter olmalıdır.');
    return;
  }
  setAuthLoading('btn-register', true);
  try {
    const name = `${fn} ${ln}`.trim();
    const { user } = await SupaDB.Auth.register(email, pass, name);
    currentUser = user || null;
    S.user = {
      name,
      email,
      phone
    };
    updateBadges();
    showAuthSuccess('Hesabınız oluşturuldu. E-posta doğrulamasını tamamlayın.');
    setTimeout(() => {
      closeAuth();
      goPage('home');
    }, 900);
  } catch (e) {
    showAuthErr(e.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
  } finally {
    setAuthLoading('btn-register', false);
  }
}

async function doForgot() {
  const email = document.getElementById('li-email').value.trim();
  if (!email) {
    showAuthErr('Önce e-posta adresinizi girin.');
    return;
  }
  await SupaDB.Auth.resetPassword(email);
  showAuthSuccess(`Şifre sıfırlama linki ${email} adresine gönderildi.`);
}

// ESC ile kapat
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAuth();
});

/* ── UTILS ── */
function doLogout() {
  if (!confirm('Çıkış yapmak istiyor musunuz?')) return;
  SupaDB.Auth.logout()
    .then(() => {
      currentUser = null;
      S.user = {name: 'Misafir', email: '', phone: ''};
      S.orders = [];
      updateBadges();
      loadProfile();
      toast('Çıkış yapıldı', '👋');
      goPage('home');
    })
    .catch(() => {
      currentUser = null;
      updateBadges();
      toast('Çıkış yapıldı', '👋');
      goPage('home');
    });
}

function toggleForm(id) {
  document.getElementById(id)?.classList.toggle('open');
}

function fmtCard(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 16);
  el.value = v.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function fmtExp(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
  el.value = v;
}


/* ── TOPLULUK SOHBET (Supabase Realtime) ── */
let chatChannel = null;
let chatInitialized = false;
let currentGroupId = localStorage.getItem('bk_chat_group') || 'general';

const CHAT_GROUPS = [
  { id: 'general', name: 'Tüm İstanbul', icon: '🌊' },
  ...DISTRICTS.map(d => ({ id: d.id, name: d.name, icon: d.icon }))
];

function showCommunity(){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  const pg = document.getElementById('pg-community');
  const nl = document.getElementById('nl-community');
  if(pg) pg.classList.add('active');
  if(nl) nl.classList.add('active');
  renderChatGroups();
  if(!chatInitialized){ initChat(); chatInitialized=true; }
  updateOnlineCount();
}

function renderChatGroups(){
  const wrap = document.getElementById('chat-groups');
  if(!wrap) return;
  wrap.innerHTML = CHAT_GROUPS.map(g => `
    <button class="chat-group-chip${g.id===currentGroupId?' active':''}" onclick="switchChatGroup('${g.id}')" aria-label="${g.name} grubu">
      <span>${g.icon}</span>${g.name}
    </button>
  `).join('');
  // Aktif chip görünür kalsın
  const active = wrap.querySelector('.chat-group-chip.active');
  if(active && active.scrollIntoView){
    active.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' });
  }
}

async function switchChatGroup(groupId){
  if(groupId === currentGroupId) return;
  currentGroupId = groupId;
  localStorage.setItem('bk_chat_group', groupId);
  renderChatGroups();
  // realtime kanalını yeni grup filtresiyle yeniden bağla
  if(chatChannel){
    try { window._sb.removeChannel(chatChannel); } catch(e){}
    chatChannel = null;
  }
  await initChat();
}

async function initChat(){
  if(!window._sb){ 
    renderChatError('Supabase bağlantısı kurulamadı.');
    return; 
  }

  // Mevcut mesajları yükle (son 50, sadece bu gruba ait)
  const { data: msgs, error } = await window._sb
    .from('messages')
    .select('id, content, created_at, district_id, attachment_url, attachment_name, attachment_type, attachment_size, profiles(full_name)')
    .eq('district_id', currentGroupId)
    .order('created_at', { ascending: true })
    .limit(50);

  if(error){ 
    renderChatError('Mesajlar yüklenemedi: ' + error.message);
    return;
  }
  
  const box = document.getElementById('chat-messages');
  if(!box) return;
  box.innerHTML = '';
  if(!msgs || msgs.length === 0){
    box.innerHTML = `<div style="text-align:center;color:var(--mist);padding:2rem;font-size:.88rem">Bu grupta henüz mesaj yok. İlk mesajı sen at! 🎣</div>`;
  } else {
    msgs.forEach(m => appendChatMsg(m));
  }
  box.scrollTop = box.scrollHeight;

  // Realtime kanalını aç (sadece aktif grup için)
  chatChannel = window._sb
    .channel('chat:' + currentGroupId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `district_id=eq.${currentGroupId}`
    }, async payload => {
      // Yeni mesajı profil bilgisiyle çek
      const { data: msg } = await window._sb
        .from('messages')
        .select('id, content, created_at, district_id, attachment_url, attachment_name, attachment_type, attachment_size, profiles(full_name)')
        .eq('id', payload.new.id)
        .single();
      if(msg && msg.district_id === currentGroupId) appendChatMsg(msg, true);
    })
    .subscribe();
}

/* Mesaj rengini ek tipine göre belirleyen yardımcı */
function _attachmentHTML(msg){
  if(!msg.attachment_url) return '';
  const url  = msg.attachment_url;
  const name = msg.attachment_name || 'dosya';
  const type = msg.attachment_type || '';
  const size = msg.attachment_size || 0;
  const sizeStr = _humanSize(size);

  // Görsel ise resim olarak göster, tıklanınca tam ekran
  if(type.startsWith('image/')){
    return `<div class="chat-att chat-att-img" onclick="openChatImage('${url}')">
      <img src="${url}" alt="${escapeHtml(name)}" loading="lazy">
    </div>`;
  }

  // PDF ise özel ikon
  if(type === 'application/pdf'){
    return `<a class="chat-att chat-att-file" href="${url}" target="_blank" rel="noopener" download="${escapeHtml(name)}">
      <div class="chat-att-icon">📄</div>
      <div class="chat-att-meta">
        <div class="chat-att-name">${escapeHtml(name)}</div>
        <div class="chat-att-size">PDF · ${sizeStr}</div>
      </div>
    </a>`;
  }

  // Diğer dosyalar — uzantıdan ikon türet
  const ext = (name.split('.').pop() || '').toLowerCase();
  const icon = _fileIcon(ext, type);
  const label = ext ? ext.toUpperCase() : 'Dosya';
  return `<a class="chat-att chat-att-file" href="${url}" target="_blank" rel="noopener" download="${escapeHtml(name)}">
    <div class="chat-att-icon">${icon}</div>
    <div class="chat-att-meta">
      <div class="chat-att-name">${escapeHtml(name)}</div>
      <div class="chat-att-size">${label} · ${sizeStr}</div>
    </div>
  </a>`;
}

function _fileIcon(ext, type){
  if(['zip','rar','7z','tar','gz'].includes(ext)) return '🗜️';
  if(['doc','docx'].includes(ext) || type.includes('word')) return '📝';
  if(['xls','xlsx','csv'].includes(ext) || type.includes('sheet') || type.includes('excel')) return '📊';
  if(['txt','md'].includes(ext) || type.startsWith('text/')) return '📃';
  return '📎';
}

function _humanSize(b){
  if(!b) return '0 B';
  const k = 1024, units = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(b)/Math.log(k));
  return (b/Math.pow(k,i)).toFixed(i?1:0) + ' ' + units[i];
}

/* Görsele tıklayınca lightbox aç */
function openChatImage(url){
  let lb = document.getElementById('chatImgLB');
  if(!lb){
    lb = document.createElement('div');
    lb.id = 'chatImgLB';
    lb.className = 'chat-img-lightbox';
    lb.onclick = () => { lb.classList.remove('open'); setTimeout(()=>lb.remove(),200); };
    document.body.appendChild(lb);
  }
  lb.innerHTML = `<img src="${url}" alt=""><button class="chat-img-close">✕</button>`;
  requestAnimationFrame(()=>lb.classList.add('open'));
}

function appendChatMsg(msg, scroll=false){
  const box = document.getElementById('chat-messages');
  if(!box) return;
  // boş placeholder varsa temizle
  const empty = box.querySelector('div[style*="henüz mesaj yok"]');
  if(empty) empty.remove();
  const isOwn = currentUser && msg.profiles?.full_name === S.user?.name;
  const name = msg.profiles?.full_name || 'Anonim';
  const time = new Date(msg.created_at).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'});
  const el = document.createElement('div');
  el.className = 'chat-msg' + (isOwn ? ' own' : '');
  const textHTML = msg.content ? `<div class="chat-text">${escapeHtml(msg.content)}</div>` : '';
  const attHTML  = _attachmentHTML(msg);
  el.innerHTML = `
    <div class="chat-avatar">${name[0].toUpperCase()}</div>
    <div class="chat-bubble">
      <div class="chat-name">${name}</div>
      ${attHTML}
      ${textHTML}
      <div class="chat-time">${time}</div>
    </div>`;
  box.appendChild(el);
  if(scroll || box.scrollTop > box.scrollHeight - box.clientHeight - 100){
    box.scrollTop = box.scrollHeight;
  }
}

function renderChatError(msg){
  const box = document.getElementById('chat-messages');
  if(box) box.innerHTML = `<div style="text-align:center;color:var(--mist);padding:2rem;font-size:.88rem">${msg}</div>`;
}

function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── DOSYA SEÇİMİ / ÖNİZLEME ── */
const CHAT_MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const CHAT_ALLOWED_MIME = [
  'image/jpeg','image/jpg','image/png','image/webp','image/gif',
  'application/pdf',
  'application/zip','application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];

let _chatPendingFile = null;

function onChatFilePick(e){
  const file = e.target.files && e.target.files[0];
  e.target.value = ''; // aynı dosyayı tekrar seçebilmek için
  if(!file) return;
  if(file.size > CHAT_MAX_FILE_BYTES){
    toast(`Dosya çok büyük (max 10 MB)`, '⚠️');
    return;
  }
  if(CHAT_ALLOWED_MIME.length && !CHAT_ALLOWED_MIME.includes(file.type)){
    toast('Bu dosya türü desteklenmiyor', '⚠️');
    return;
  }
  _chatPendingFile = file;
  showChatFilePreview(file);
}

function showChatFilePreview(file){
  const wrap = document.getElementById('chat-file-preview');
  if(!wrap) return;
  const isImg = file.type.startsWith('image/');
  const sizeStr = _humanSize(file.size);
  let inner;
  if(isImg){
    const url = URL.createObjectURL(file);
    inner = `<img src="${url}" alt="" class="chat-fp-img">
      <div class="chat-fp-meta">
        <div class="chat-fp-name">${escapeHtml(file.name)}</div>
        <div class="chat-fp-size">${sizeStr}</div>
      </div>`;
  } else {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const icon = file.type === 'application/pdf' ? '📄' : _fileIcon(ext, file.type);
    inner = `<div class="chat-fp-icon">${icon}</div>
      <div class="chat-fp-meta">
        <div class="chat-fp-name">${escapeHtml(file.name)}</div>
        <div class="chat-fp-size">${sizeStr}</div>
      </div>`;
  }
  wrap.innerHTML = `${inner}<button class="chat-fp-close" onclick="clearChatFile()" aria-label="Kaldır">✕</button>`;
  wrap.classList.add('open');
}

function clearChatFile(){
  _chatPendingFile = null;
  const wrap = document.getElementById('chat-file-preview');
  if(wrap){ wrap.classList.remove('open'); wrap.innerHTML = ''; }
}

async function _uploadChatFile(file){
  // Yol: groupId/userId/timestamp-randomname
  const safeName = file.name.replace(/[^\w.\-]/g, '_').slice(-80);
  const path = `${currentGroupId}/${currentUser.id}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safeName}`;
  const { error } = await window._sb.storage
    .from('chat-uploads')
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
      upsert: false
    });
  if(error) throw error;
  const { data } = window._sb.storage.from('chat-uploads').getPublicUrl(path);
  return data.publicUrl;
}

async function sendChatMsg(){
  const inp = document.getElementById('chat-input');
  const text = inp ? inp.value.trim() : '';
  const file = _chatPendingFile;

  // Boşsa hiçbir şey yapma
  if(!text && !file) return;

  if(!currentUser){
    openAuth('login');
    toast('Sohbet için giriş yapmalısınız','🔒');
    return;
  }

  // UI'yi hemen temizle (optimistic)
  const content = text.slice(0, 500);
  if(inp) inp.value = '';

  // Yükleme göstergesi
  const sendBtn = document.querySelector('.chat-send');
  const attBtn  = document.querySelector('.chat-att-btn');
  if(sendBtn) sendBtn.disabled = true;
  if(attBtn)  attBtn.disabled  = true;

  let attachment = null;
  try {
    if(file){
      const wrap = document.getElementById('chat-file-preview');
      if(wrap) wrap.classList.add('uploading');
      const url = await _uploadChatFile(file);
      attachment = {
        attachment_url:  url,
        attachment_name: file.name,
        attachment_type: file.type || 'application/octet-stream',
        attachment_size: file.size
      };
    }

    const payload = {
      user_id:     currentUser.id,
      content:     content || null,
      district_id: currentGroupId,
      ...(attachment || {})
    };

    const { error } = await window._sb.from('messages').insert(payload);
    if(error) throw error;

    clearChatFile();
  } catch(e){
    toast('Gönderilemedi: ' + (e.message || 'Bilinmeyen hata'), '❌');
    if(inp && content) inp.value = content; // metni geri yükle
  } finally {
    if(sendBtn) sendBtn.disabled = false;
    if(attBtn)  attBtn.disabled  = false;
  }
}

function updateOnlineCount(){
  const count = Math.floor(Math.random()*12)+3;
  const el = document.getElementById('online-count-txt');
  if(el) el.textContent = count + ' kişi çevrimiçi';
}

function toggleContactMenu(){
  const menu = document.getElementById('contactMenu');
  if(menu) menu.classList.toggle('open');
}

document.addEventListener('click', e=>{
  const float = document.getElementById('contactFloat');
  if(float && !float.contains(e.target)){
    document.getElementById('contactMenu')?.classList.remove('open');
  }
});

/* ── NAVBAR SCROLL ── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', scrollY > 20);
  const btn = document.getElementById('scrollTopBtn');
  if(btn) btn.classList.toggle('show', scrollY > 300);
});

/* ── INIT ── */
async function initApp() {
  // Önce ürünleri yükle (hata olursa boş array kalır)
  try {
    await loadProductsLocal();
  } catch(e) {
    console.warn('Ürünler yüklenemedi:', e.message);
  }
  
  // Sayfayı her halükarda göster
  try {
    updateBadges();
    goPage('home');
  } catch(e) {
    console.error('Sayfa başlatma hatası:', e);
  }

  // Supabase oturum kontrolü — bağlantı yoksa sessizce geç
  if (!window.SupaDB || !window.SupaDB.sb) {
    console.warn('Supabase bağlantısı yok, sadece offline işlevler aktif');
    return;
  }

  try {
    // Sayfa yüklenince mevcut oturumu kontrol et
    const { data: { session } } = await SupaDB.sb.auth.getSession();
    if (session?.user) {
      currentUser = session.user;
      try {
        const profile = await SupaDB.Profile.get(session.user.id);
        S.user = {
          id:    session.user.id,
          name:  profile?.full_name || session.user.email.split('@')[0],
          email: session.user.email,
          phone: profile?.phone || ''
        };
      } catch(e) {
        S.user = { id: session.user.id, name: session.user.email.split('@')[0], email: session.user.email, phone: '' };
      }
      updateBadges();
    }

    // Oturum değişikliklerini dinle (giriş/çıkış/yenileme)
    SupaDB.sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        currentUser = session.user;
        try {
          const profile = await SupaDB.Profile.get(session.user.id);
          S.user = {
            id:    session.user.id,
            name:  profile?.full_name || session.user.email.split('@')[0],
            email: session.user.email,
            phone: profile?.phone || ''
          };
        } catch(e) {
          S.user = { id: session.user.id, name: session.user.email.split('@')[0], email: session.user.email, phone: '' };
        }
        updateBadges();
        if (document.getElementById('pg-account')?.classList.contains('active')) loadProfile();
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        S.user = { name: '', email: '', phone: '' };
        updateBadges();
      }
    });
  } catch(e) {
    console.warn('Supabase oturum kontrolü başarısız:', e.message);
  }
}

// DOM hazır olana kadar bekle (script body sonunda olsa bile güvenli)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
