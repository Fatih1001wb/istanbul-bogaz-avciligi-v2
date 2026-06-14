/* ╔══════════════════════════════════════════════════════════╗
   ║   PB STORE - SEPET & FAVORİ YÖNETİMİ                      ║
   ║   LocalStorage tabanlı — Supabase'e geçerken kolayca      ║
   ║   API çağrılarıyla değiştirilebilir.                      ║
   ║                                                            ║
   ║   KULLANIM:                                                 ║
   ║   PB.cart.add(productId, quantity)                         ║
   ║   PB.cart.list()  // tüm sepet                             ║
   ║   PB.cart.total() // {subtotal, count, ...}                ║
   ╚══════════════════════════════════════════════════════════╝
*/

(function() {
  'use strict';

  if (!window.PB || !window.PB.products) {
    console.error('PB.products yüklenmemiş - products.js önce yüklenmeli');
    return;
  }

  // ═══════════════════════════════════════════════════════════
  // STORAGE KEYS
  // ═══════════════════════════════════════════════════════════
  const KEYS = {
    CART: 'pb_cart',
    FAVORITES: 'pb_favorites',
    COUPON: 'pb_active_coupon',
    RECENT: 'pb_recent_products',
    GUEST_USER: 'pb_guest_user'
  };

  const SHIPPING_THRESHOLD = 500;  // 500 TL üzeri kargo bedava
  const SHIPPING_COST = 49.90;

  // ═══════════════════════════════════════════════════════════
  // LOW-LEVEL HELPERS
  // ═══════════════════════════════════════════════════════════
  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Storage okuma hatası:', e);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage yazma hatası:', e);
      return false;
    }
  }

  function emitEvent(name, detail) {
    window.dispatchEvent(new CustomEvent('pb:' + name, { detail }));
  }

  // ═══════════════════════════════════════════════════════════
  // SEPET (CART)
  // ═══════════════════════════════════════════════════════════
  const cart = {
    // Tüm sepet öğelerini ürün detayıyla birlikte döndür
    list() {
      const items = readStorage(KEYS.CART, []);
      return items
        .map(item => {
          const product = PB.products.getProductById(item.id);
          if (!product) return null;  // ürün silinmiş olabilir
          return {
            ...product,
            quantity: item.quantity,
            lineTotal: product.price * item.quantity
          };
        })
        .filter(Boolean);
    },

    // Ham veriyi al (sadece id + quantity)
    raw() {
      return readStorage(KEYS.CART, []);
    },

    // Toplam ürün adedi (badge için)
    count() {
      const items = readStorage(KEYS.CART, []);
      return items.reduce((sum, item) => sum + item.quantity, 0);
    },

    // Bir ürün sepette var mı?
    has(productId) {
      const items = readStorage(KEYS.CART, []);
      return items.some(i => i.id === parseInt(productId));
    },

    // Bir ürünün sepetteki adedi
    quantityOf(productId) {
      const items = readStorage(KEYS.CART, []);
      const item = items.find(i => i.id === parseInt(productId));
      return item ? item.quantity : 0;
    },

    // Sepete ürün ekle (varsa adedi artır)
    add(productId, quantity = 1) {
      const product = PB.products.getProductById(productId);
      if (!product) return { success: false, error: 'Ürün bulunamadı' };
      if (product.stock < quantity) {
        return { success: false, error: 'Stokta yeterli ürün yok' };
      }

      const items = readStorage(KEYS.CART, []);
      const existing = items.find(i => i.id === product.id);

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          return { success: false, error: 'Stokta yeterli ürün yok' };
        }
        existing.quantity = newQty;
      } else {
        items.push({ id: product.id, quantity, addedAt: new Date().toISOString() });
      }

      writeStorage(KEYS.CART, items);
      emitEvent('cart:changed', { action: 'add', productId: product.id, quantity });
      return { success: true, product, totalCount: this.count() };
    },

    // Sepetteki bir ürünün adedini değiştir
    update(productId, quantity) {
      if (quantity <= 0) return this.remove(productId);

      const product = PB.products.getProductById(productId);
      if (!product) return { success: false, error: 'Ürün bulunamadı' };
      if (quantity > product.stock) {
        return { success: false, error: 'Stokta yeterli ürün yok' };
      }

      const items = readStorage(KEYS.CART, []);
      const item = items.find(i => i.id === parseInt(productId));
      if (!item) return { success: false, error: 'Ürün sepette değil' };

      item.quantity = quantity;
      writeStorage(KEYS.CART, items);
      emitEvent('cart:changed', { action: 'update', productId: parseInt(productId), quantity });
      return { success: true };
    },

    // Sepetten ürün çıkar
    remove(productId) {
      let items = readStorage(KEYS.CART, []);
      const before = items.length;
      items = items.filter(i => i.id !== parseInt(productId));
      writeStorage(KEYS.CART, items);
      emitEvent('cart:changed', { action: 'remove', productId: parseInt(productId) });
      return { success: before > items.length };
    },

    // Sepeti temizle
    clear() {
      writeStorage(KEYS.CART, []);
      writeStorage(KEYS.COUPON, null);
      emitEvent('cart:changed', { action: 'clear' });
      return { success: true };
    },

    // Toplamlar
    total() {
      const items = this.list();
      const subtotal = items.reduce((s, item) => s + item.lineTotal, 0);
      const count = items.reduce((s, item) => s + item.quantity, 0);

      // Kupon
      let discount = 0;
      let coupon = null;
      const activeCoupon = readStorage(KEYS.COUPON, null);
      if (activeCoupon && subtotal > 0) {
        const result = PB.products.validateCoupon(activeCoupon, subtotal);
        if (result.valid) {
          discount = result.discount;
          coupon = result.coupon;
        }
      }

      // Kargo
      const afterDiscount = subtotal - discount;
      const shipping = afterDiscount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      const total = afterDiscount + shipping;

      return {
        items, count, subtotal, discount, coupon, shipping, total,
        freeShippingRemaining: Math.max(0, SHIPPING_THRESHOLD - afterDiscount)
      };
    }
  };

  // ═══════════════════════════════════════════════════════════
  // FAVORİLER
  // ═══════════════════════════════════════════════════════════
  const favorites = {
    list() {
      const ids = readStorage(KEYS.FAVORITES, []);
      return ids
        .map(id => PB.products.getProductById(id))
        .filter(Boolean);
    },

    ids() {
      return readStorage(KEYS.FAVORITES, []);
    },

    count() {
      return readStorage(KEYS.FAVORITES, []).length;
    },

    has(productId) {
      const ids = readStorage(KEYS.FAVORITES, []);
      return ids.includes(parseInt(productId));
    },

    add(productId) {
      const id = parseInt(productId);
      const product = PB.products.getProductById(id);
      if (!product) return { success: false };
      const ids = readStorage(KEYS.FAVORITES, []);
      if (ids.includes(id)) return { success: true, already: true };
      ids.push(id);
      writeStorage(KEYS.FAVORITES, ids);
      emitEvent('favorites:changed', { action: 'add', productId: id });
      return { success: true };
    },

    remove(productId) {
      const id = parseInt(productId);
      let ids = readStorage(KEYS.FAVORITES, []);
      const before = ids.length;
      ids = ids.filter(x => x !== id);
      writeStorage(KEYS.FAVORITES, ids);
      emitEvent('favorites:changed', { action: 'remove', productId: id });
      return { success: before > ids.length };
    },

    toggle(productId) {
      if (this.has(productId)) {
        this.remove(productId);
        return { isFavorite: false };
      } else {
        this.add(productId);
        return { isFavorite: true };
      }
    },

    clear() {
      writeStorage(KEYS.FAVORITES, []);
      emitEvent('favorites:changed', { action: 'clear' });
    }
  };

  // ═══════════════════════════════════════════════════════════
  // KUPON
  // ═══════════════════════════════════════════════════════════
  const coupon = {
    get() {
      return readStorage(KEYS.COUPON, null);
    },

    apply(code) {
      const t = cart.total();
      const result = PB.products.validateCoupon(code, t.subtotal);
      if (!result.valid) return result;
      writeStorage(KEYS.COUPON, result.coupon.code);
      emitEvent('cart:changed', { action: 'coupon-applied', code: result.coupon.code });
      return result;
    },

    remove() {
      writeStorage(KEYS.COUPON, null);
      emitEvent('cart:changed', { action: 'coupon-removed' });
    }
  };

  // ═══════════════════════════════════════════════════════════
  // SON GÖRÜNTÜLENEN ÜRÜNLER
  // ═══════════════════════════════════════════════════════════
  const recent = {
    list(limit = 6) {
      const ids = readStorage(KEYS.RECENT, []);
      return ids.slice(0, limit)
        .map(id => PB.products.getProductById(id))
        .filter(Boolean);
    },

    track(productId) {
      const id = parseInt(productId);
      let ids = readStorage(KEYS.RECENT, []);
      ids = ids.filter(x => x !== id);
      ids.unshift(id);
      ids = ids.slice(0, 20);
      writeStorage(KEYS.RECENT, ids);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // BİLDİRİM (toast)
  // ═══════════════════════════════════════════════════════════
  function toast(message, type = 'info') {
    const existing = document.querySelector('.pb-toast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = `pb-toast pb-toast-${type}`;
    el.textContent = message;
    el.style.cssText = `
      position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: ${type === 'error' ? '#791F1F' : type === 'success' ? '#1F6638' : '#3D0A14'};
      color: ${type === 'error' ? '#FCEBEB' : '#EAF3DE'};
      padding: 14px 28px; border-radius: 12px;
      font-family: Manrope, system-ui, sans-serif; font-size: 14px; font-weight: 500;
      box-shadow: 0 8px 32px rgba(0,0,0,.25);
      z-index: 10000; opacity: 0; transition: all .3s ease;
      max-width: 90vw; text-align: center;
    `;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  // ═══════════════════════════════════════════════════════════
  // NAVBAR BADGE GÜNCELLEME (her sayfada)
  // ═══════════════════════════════════════════════════════════
  function updateBadges() {
    const cartCount = cart.count();
    const favCount = favorites.count();

    // Sepet badge
    document.querySelectorAll('[data-cart-badge], .nav-action [class*="badge"]').forEach(el => {
      const parent = el.closest('[href*="sepet"]') || el.closest('.nav-action');
      if (parent && (parent.href?.includes('sepet') || parent.querySelector('.fa-bag-shopping, .fa-shopping-bag, .fa-shopping-cart'))) {
        const badge = el.classList.contains('badge') ? el : parent.querySelector('.badge');
        if (badge) {
          badge.textContent = cartCount;
          badge.style.display = cartCount > 0 ? '' : 'none';
        }
      }
    });

    // Favori badge
    document.querySelectorAll('[data-favorites-badge]').forEach(el => {
      el.textContent = favCount;
      el.style.display = favCount > 0 ? '' : 'none';
    });

    // Daha jenerik: tüm bag/cart linklerinde badge güncelle
    document.querySelectorAll('a[href*="sepet"], a[href*="cart"]').forEach(link => {
      const badge = link.querySelector('.badge');
      if (badge) {
        badge.textContent = cartCount;
        badge.style.display = cartCount > 0 ? 'flex' : 'none';
      }
    });

    document.querySelectorAll('a[href*="favoriler"], a[href*="hesabim#favoriler"]').forEach(link => {
      const badge = link.querySelector('.badge');
      if (badge) {
        badge.textContent = favCount;
        badge.style.display = favCount > 0 ? 'flex' : 'none';
      }
    });
  }

  // Olayları dinle ve badge'leri otomatik güncelle
  window.addEventListener('pb:cart:changed', updateBadges);
  window.addEventListener('pb:favorites:changed', updateBadges);
  document.addEventListener('DOMContentLoaded', updateBadges);

  // ═══════════════════════════════════════════════════════════
  // GLOBAL NAMESPACE
  // ═══════════════════════════════════════════════════════════
  window.PB.cart = cart;
  window.PB.favorites = favorites;
  window.PB.coupon = coupon;
  window.PB.recent = recent;
  window.PB.toast = toast;
  window.PB.updateBadges = updateBadges;

  console.log(`✓ PB.cart yüklendi (${cart.count()} ürün sepette, ${favorites.count()} favori)`);
})();
