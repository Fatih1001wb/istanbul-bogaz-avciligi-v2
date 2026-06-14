/* ╔══════════════════════════════════════════════════════════╗
   ║   PB STORE - RENDER HELPERS                               ║
   ║   HTML üretmek için ortak fonksiyonlar                    ║
   ║                                                            ║
   ║   PB.render.productCard(product)  → HTML string           ║
   ║   PB.render.categoryCard(category) → HTML string           ║
   ╚══════════════════════════════════════════════════════════╝
*/

(function() {
  'use strict';

  if (!window.PB || !window.PB.products) {
    console.error('products.js önce yüklenmeli');
    return;
  }

  // ═══════════════════════════════════════════════════════════
  // BAĞLI YOL DETECT (anasayfa vs alt sayfa)
  // ═══════════════════════════════════════════════════════════
  const isSubpage = window.location.pathname.includes('/pages/');
  const prefix = isSubpage ? '' : 'pages/';
  const upPrefix = isSubpage ? '../' : '';

  // Pretty escape
  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  // ═══════════════════════════════════════════════════════════
  // ÜRÜN KARTI (anasayfa & kategori sayfası)
  // ═══════════════════════════════════════════════════════════
  function productCard(p, options = {}) {
    const isFav = PB.favorites.has(p.id);
    const discount = PB.products.calculateDiscount(p.price, p.oldPrice);
    const inStock = p.stock > 0;
    const lowStock = inStock && p.stock < 5;

    // Badges (rozetler)
    const badgeHtml = (p.badges || []).map(b => {
      if (b === 'bestseller') return '<span class="prod-badge prod-badge-bestseller">Çok Satan</span>';
      if (b === 'new') return '<span class="prod-badge prod-badge-new">Yeni</span>';
      if (b === 'sale' && discount > 0) return `<span class="prod-badge prod-badge-sale">%${discount}</span>`;
      return '';
    }).join('');

    // Resim — şimdilik fallback ikon (gerçek resim olunca .images[0] kullanılır)
    const imageHtml = p.images && p.images.length > 0
      ? `<img src="${esc(p.images[0])}" alt="${esc(p.name)}" loading="lazy" />`
      : `<i class="fa-solid ${esc(p.icon || 'fa-box')}" aria-hidden="true"></i>`;

    return `
      <article class="product-card${!inStock ? ' out-of-stock' : ''}" data-product-id="${p.id}">
        <a href="${prefix}urun-detay.html?id=${p.id}" class="product-card-link" aria-label="${esc(p.name)}">
          <div class="product-card-image">
            ${imageHtml}
            ${badgeHtml ? `<div class="product-card-badges">${badgeHtml}</div>` : ''}
            ${!inStock ? '<div class="product-card-stockout">Tükendi</div>' : ''}
          </div>
        </a>

        <button class="product-card-fav${isFav ? ' active' : ''}" data-fav-toggle="${p.id}" aria-label="Favorilere ${isFav ? 'çıkar' : 'ekle'}">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart" aria-hidden="true"></i>
        </button>

        <div class="product-card-body">
          <div class="product-card-brand">${esc(p.brand || 'PB Store')}</div>
          <a href="${prefix}urun-detay.html?id=${p.id}" class="product-card-title">${esc(p.name)}</a>

          <div class="product-card-rating">
            <i class="fa-solid fa-star" aria-hidden="true"></i>
            <strong>${p.rating}</strong>
            <span>(${p.reviews})</span>
          </div>

          <div class="product-card-price">
            ${p.oldPrice ? `<span class="old-price">${PB.products.formatPrice(p.oldPrice)}</span>` : ''}
            <span class="current-price">${PB.products.formatPrice(p.price)}</span>
          </div>

          ${lowStock ? `<div class="product-card-low-stock">⚠️ Son ${p.stock} adet!</div>` : ''}

          <button class="product-card-add" data-add-to-cart="${p.id}" ${!inStock ? 'disabled' : ''}>
            <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
            ${inStock ? 'Sepete Ekle' : 'Stokta Yok'}
          </button>
        </div>
      </article>
    `;
  }

  // ═══════════════════════════════════════════════════════════
  // BOŞ DURUM (no products)
  // ═══════════════════════════════════════════════════════════
  function emptyState(message = 'Ürün bulunamadı', icon = 'fa-box-open') {
    return `
      <div class="empty-state">
        <i class="fa-solid ${esc(icon)}" aria-hidden="true"></i>
        <div class="empty-state-title">${esc(message)}</div>
        <div class="empty-state-sub">Filtreleri değiştirip tekrar deneyin.</div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════
  // ÜRÜN GRID'İ TOPLU RENDER
  // ═══════════════════════════════════════════════════════════
  function renderProductGrid(containerSelector, products, options = {}) {
    const container = typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;
    if (!container) return;

    if (!products || products.length === 0) {
      container.innerHTML = emptyState(options.emptyMessage, options.emptyIcon);
      return;
    }

    container.innerHTML = products.map(p => productCard(p, options)).join('');
    bindCardEvents(container);
  }

  // ═══════════════════════════════════════════════════════════
  // EVENT BINDING (favori, sepete ekle)
  // ═══════════════════════════════════════════════════════════
  function bindCardEvents(container) {
    container = container || document;

    // Favori toggle
    container.querySelectorAll('[data-fav-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.favToggle;
        const result = PB.favorites.toggle(id);
        const icon = btn.querySelector('i');
        if (result.isFavorite) {
          btn.classList.add('active');
          icon.classList.remove('fa-regular');
          icon.classList.add('fa-solid');
          PB.toast('❤️ Favorilere eklendi', 'success');
        } else {
          btn.classList.remove('active');
          icon.classList.add('fa-regular');
          icon.classList.remove('fa-solid');
          PB.toast('Favorilerden çıkarıldı');
        }
      });
    });

    // Sepete ekle
    container.querySelectorAll('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.addToCart;
        const result = PB.cart.add(id, 1);
        if (result.success) {
          PB.toast(`✓ ${result.product.name} sepete eklendi`, 'success');
          // Buton animasyonu
          btn.classList.add('added');
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Eklendi';
          setTimeout(() => {
            btn.classList.remove('added');
            btn.innerHTML = originalHTML;
          }, 1500);
        } else {
          PB.toast(result.error || 'Hata oluştu', 'error');
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // KATEGORİ KARTI
  // ═══════════════════════════════════════════════════════════
  function categoryCard(category, index) {
    const productCount = PB.products.getProductsByCategory(category.slug).length;
    const themes = ['cat-erkek', 'cat-taki', 'cat-ev'];
    return `
      <a href="${prefix}kategori.html?kategori=${category.slug}" class="cat-card-v2 ${themes[index] || 'cat-erkek'}">
        <div class="cat-card-sparkle"></div>
        <div class="cat-card-image">
          <i class="fa-solid ${esc(category.icon)}" aria-hidden="true"></i>
        </div>
        <div class="cat-card-content">
          <div class="cat-card-eyebrow">№ 0${index + 1}</div>
          <h3 class="cat-card-title">${esc(category.name)}</h3>
          <p class="cat-card-desc">${esc(category.description)}</p>
          <div class="cat-card-stats">
            <span class="cat-card-count">${productCount}+ Ürün</span>
            <span class="cat-card-cta">Keşfet <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      </a>
    `;
  }

  // ═══════════════════════════════════════════════════════════
  // SEPET KALEMİ (sepet sayfası)
  // ═══════════════════════════════════════════════════════════
  function cartLineItem(item) {
    const imageHtml = item.images && item.images.length > 0
      ? `<img src="${esc(item.images[0])}" alt="${esc(item.name)}" />`
      : `<i class="fa-solid ${esc(item.icon || 'fa-box')}" aria-hidden="true"></i>`;

    return `
      <div class="cart-item" data-cart-item="${item.id}">
        <div class="cart-item-img">${imageHtml}</div>
        <div class="cart-item-info">
          <div class="cart-item-brand">${esc(item.brand)}</div>
          <a href="urun-detay.html?id=${item.id}" class="cart-item-name">${esc(item.name)}</a>
          <div class="cart-item-meta">SKU: ${esc(item.sku)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-qty-decrease="${item.id}" aria-label="Azalt">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-qty-increase="${item.id}" aria-label="Artır">+</button>
        </div>
        <div class="cart-item-price">
          <div class="line-total">${PB.products.formatPrice(item.lineTotal)}</div>
          <div class="unit-price">${PB.products.formatPrice(item.price)} / adet</div>
        </div>
        <button class="cart-item-remove" data-cart-remove="${item.id}" aria-label="Sil">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════
  // ALT KATEGORİ PILL
  // ═══════════════════════════════════════════════════════════
  function subcategoryPill(sub, count, active) {
    return `
      <a href="?sub=${esc(sub.slug)}" data-sub="${esc(sub.slug)}"
         class="subcat-pill${active ? ' active' : ''}">
        ${esc(sub.name)} <span class="count">(${count})</span>
      </a>
    `;
  }

  // ═══════════════════════════════════════════════════════════
  // GLOBAL EXPORT
  // ═══════════════════════════════════════════════════════════
  window.PB.render = {
    productCard,
    renderProductGrid,
    categoryCard,
    cartLineItem,
    subcategoryPill,
    emptyState,
    bindCardEvents,
    esc
  };

  console.log('✓ PB.render yüklendi');
})();
