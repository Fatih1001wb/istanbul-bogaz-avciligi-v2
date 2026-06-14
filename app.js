/* ── STORE ── */
const S = {
  get user() {
    return JSON.parse(localStorage.getItem('bk_user') || '{"name":"Misafir","email":"","phone":""}')
  },
  set user(v) {
    localStorage.setItem('bk_user', JSON.stringify(v))
  },
};

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
  if (id === 'account') {
    loadProfile();
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

/* ── FOOTER HTML ── */
function footerHTML() {
  return ''; // Footer kaldırıldı
}

/* ── HOME ── */
function renderHome() {
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

/* ── ACCOUNT ── */
const AC_MAP = { profile: 0, settings: 1 };

function showAcSec(id) {
  document.querySelectorAll('.ac-sec').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.ac-tab').forEach(b => b.classList.remove('active'));
  const sec = document.getElementById('ac-' + id);
  if (sec) sec.classList.add('active');
  const btns = document.querySelectorAll('.ac-tab');
  if (AC_MAP[id] !== undefined) btns[AC_MAP[id]]?.classList.add('active');
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
  const af = document.getElementById('ac-footer');
  if (af && !af.innerHTML) af.innerHTML = footerHTML();
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
  toast('Profil kaydedildi', '✓');
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
      loadProfile();
      toast('Çıkış yapıldı', '👋');
      goPage('home');
    })
    .catch(() => {
      currentUser = null;
      toast('Çıkış yapıldı', '👋');
      goPage('home');
    });
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
    .select('id, user_id, content, created_at, district_id, attachment_url, attachment_name, attachment_type, attachment_size, profiles(full_name)')
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
        .select('id, user_id, content, created_at, district_id, attachment_url, attachment_name, attachment_type, attachment_size, profiles(full_name)')
        .eq('id', payload.new.id)
        .single();
      if(msg && msg.district_id === currentGroupId) appendChatMsg(msg, true);
    })
    .on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'messages'
    }, payload => {
      // Bir mesaj silindi — UI'dan da kaldır
      const el = document.querySelector(`.chat-msg[data-msg-id="${payload.old.id}"]`);
      if(el){
        el.style.opacity = '0';
        el.style.transition = 'opacity .2s';
        setTimeout(() => el.remove(), 200);
      }
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
  // Sahiplik kontrolü artık UUID üzerinden (güvenli)
  const isOwn = currentUser && msg.user_id === currentUser.id;
  const name = msg.profiles?.full_name || 'Anonim';
  const time = new Date(msg.created_at).toLocaleTimeString('tr-TR', {hour:'2-digit',minute:'2-digit'});
  const el = document.createElement('div');
  el.className = 'chat-msg' + (isOwn ? ' own' : '');
  el.dataset.msgId = msg.id;
  const textHTML = msg.content ? `<div class="chat-text">${escapeHtml(msg.content)}</div>` : '';
  const attHTML  = _attachmentHTML(msg);
  // Sadece kendi mesajına sil butonu
  const delBtn = isOwn
    ? `<button class="chat-del-btn" onclick="deleteOwnChatMsg('${msg.id}')" title="Mesajı sil" aria-label="Sil">🗑</button>`
    : '';
  el.innerHTML = `
    <div class="chat-avatar">${name[0].toUpperCase()}</div>
    <div class="chat-bubble">
      ${delBtn}
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

async function deleteOwnChatMsg(messageId){
  if(!currentUser){
    toast('Giriş yapmalısın', '🔒');
    return;
  }
  if(!confirm('Bu mesajı silmek istiyor musun?')) return;
  try {
    const { error } = await window._sb
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', currentUser.id); // ekstra güvenlik: sadece kendi mesajını
    if(error) throw error;
    // UI'dan kaldır
    const el = document.querySelector(`.chat-msg[data-msg-id="${messageId}"]`);
    if(el){
      el.style.opacity = '0';
      el.style.transition = 'opacity .2s';
      setTimeout(() => el.remove(), 200);
    }
    toast('Mesaj silindi', '🗑');
  } catch(e) {
    toast('Silinemedi: ' + (e.message || 'Bilinmeyen hata'), '❌');
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
  // Sayfayı her halükarda göster
  try {
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
        if (document.getElementById('pg-account')?.classList.contains('active')) loadProfile();
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        S.user = { name: '', email: '', phone: '' };
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
