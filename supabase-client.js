// ════════════════════════════════════════════════════════
// supabase-client.js
// Bu dosyayı index.html'e <script> ile ekle
// ════════════════════════════════════════════════════════

// ── SUPABASE BAĞLANTISI ──────────────────────────────────
// Değerleri config.js'ten al (config.js'i doldurmayı unutma)
const SUPABASE_URL = 'https://twsfdkircmfnllypzokh.supabase.co';
const SUPABASE_ANON = 'sb_publishable_G0dY-0XBYyNxE2fnse2fog_hFdRKvMs';

// Supabase SDK'sı CDN'den yükleniyor (HTML'e ekle):
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ════════════════════════════════════════════════════════
// AUTH — Giriş / Kayıt / Çıkış
// ════════════════════════════════════════════════════════

const Auth = {

  // Kayıt ol
  async register(email, password, fullName) {
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    return data;
  },

  // Giriş yap
  async login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  // Çıkış yap
  async logout() {
    await sb.auth.signOut();
    // localStorage temizle
    ['bk_cart','bk_favs'].forEach(k => localStorage.removeItem(k));
    goPage('home');
    toast('Çıkış yapıldı', '👋');
  },

  // Şifre sıfırlama e-postası
  async resetPassword(email) {
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '?reset=true'
    });
    if (error) throw error;
  },

  // Oturum dinle — sayfa yüklenince çağır
  onAuthChange(callback) {
    sb.auth.onAuthStateChange((event, session) => {
      callback(event, session?.user || null);
    });
  },

  // Mevcut kullanıcı
  async getCurrentUser() {
    const { data: sessionData, error: sessionError } = await sb.auth.getSession();
    if (!sessionError && sessionData?.session?.user) {
      return sessionData.session.user;
    }

    const { data } = await sb.auth.getUser();
    return data?.user || null;
  }
};

// ════════════════════════════════════════════════════════
// PROFILE — Kullanıcı profili
// ════════════════════════════════════════════════════════

const Profile = {

  async get(userId) {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async update(userId, updates) {
    const { data, error } = await sb
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Adresleri getir
  async getAddresses(userId) {
    const { data, error } = await sb
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Adres ekle
  async addAddress(userId, addr) {
    // Eğer yeni adres varsayılan olacaksa, önce diğerlerini kaldır
    if (addr.is_default) {
      await sb.from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }
    const { data, error } = await sb
      .from('addresses')
      .insert({ user_id: userId, ...addr })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Adres sil
  async deleteAddress(addrId) {
    const { error } = await sb
      .from('addresses')
      .delete()
      .eq('id', addrId);
    if (error) throw error;
  },

  // Varsayılan adres yap
  async setDefaultAddress(userId, addrId) {
    await sb.from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
    await sb.from('addresses')
      .update({ is_default: true })
      .eq('id', addrId);
  }
};

// ════════════════════════════════════════════════════════
// PRODUCTS — Ürünler
// ════════════════════════════════════════════════════════

const Products = {

  // Tüm aktif ürünleri getir
  async getAll() {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('id');
    if (error) throw error;
    return data || [];
  },

  // Kategoriye göre
  async getByCategory(category) {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', category);
    if (error) throw error;
    return data || [];
  },

  // Tekil ürün
  async getById(id) {
    const { data, error } = await sb
      .from('products')
      .select(`*, reviews(rating, comment, created_at, profiles(full_name))`)
      .eq('id', id)
      .eq('reviews.is_approved', true)
      .single();
    if (error) throw error;
    return data;
  },

  // Stok güncelle (admin)
  async updateStock(id, newStock) {
    const { error } = await sb
      .from('products')
      .update({ stock: newStock })
      .eq('id', id);
    if (error) throw error;
  }
};

// ════════════════════════════════════════════════════════
// ORDERS — Sipariş oluşturma
// ════════════════════════════════════════════════════════

const Orders = {

  // Sipariş oluştur
  async create(userId, { items, address, subtotal, shippingFee, discount, total, paymentRef, paymentMethod }) {
    // Sipariş no oluştur
    const orderNo = 'SP' + Date.now().toString().slice(-8);

    // 1. Sipariş kaydı
    const { data: order, error: orderErr } = await sb
      .from('orders')
      .insert({
        order_no: orderNo,
        user_id: userId,
        subtotal, shipping_fee: shippingFee,
        discount, total,
        address_snap: address,
        payment_ref: paymentRef,
        payment_method: paymentMethod,
        status: paymentRef ? 'confirmed' : 'pending'
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 2. Sipariş kalemleri
    const orderItems = items.map(it => ({
      order_id:    order.id,
      product_id:  it.id,
      quantity:    it.qty,
      unit_price:  it.price,
      total_price: it.price * it.qty,
      gram:        it.gram || null
    }));

    const { error: itemsErr } = await sb
      .from('order_items')
      .insert(orderItems);

    if (itemsErr) throw itemsErr;

    // 3. Stok düş
    for (const it of items) {
      await sb.rpc('decrement_stock', { product_id: it.id, qty: it.qty });
    }

    return order;
  },

  // Kullanıcının siparişlerini getir
  async getUserOrders(userId) {
    const { data, error } = await sb
      .from('orders')
      .select(`
        *,
        order_items(
          quantity, unit_price, total_price, gram,
          products(id, name, category)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Tekil sipariş
  async getById(orderId) {
    const { data, error } = await sb
      .from('orders')
      .select(`
        *,
        order_items(*, products(*)),
        profiles(full_name)
      `)
      .eq('id', orderId)
      .single();
    if (error) throw error;
    return data;
  }
};

// ════════════════════════════════════════════════════════
// COUPONS — Kupon doğrulama
// ════════════════════════════════════════════════════════

const Coupons = {
  async validate(code, orderTotal) {
    const { data, error } = await sb
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) return { valid: false, message: 'Geçersiz kupon kodu' };
    if (data.expires_at && new Date(data.expires_at) < new Date())
      return { valid: false, message: 'Kupon süresi dolmuş' };
    if (data.max_uses && data.used_count >= data.max_uses)
      return { valid: false, message: 'Kupon kullanım limiti doldu' };
    if (orderTotal < data.min_order)
      return { valid: false, message: `Bu kupon için min. ${data.min_order}₺ sipariş gerekiyor` };

    const discount = data.discount_type === 'percent'
      ? Math.round(orderTotal * data.discount_value / 100)
      : data.discount_value;

    return { valid: true, discount, coupon: data };
  }
};

// ════════════════════════════════════════════════════════
// REVIEWS — Değerlendirme
// ════════════════════════════════════════════════════════

const Reviews = {
  async add(userId, productId, rating, comment) {
    const { data, error } = await sb
      .from('reviews')
      .upsert({ user_id: userId, product_id: productId, rating, comment })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ════════════════════════════════════════════════════════
// STOK DÜŞME RPC (Supabase'de çalıştır)
// ════════════════════════════════════════════════════════
/*
  Supabase SQL Editor'da bu fonksiyonu da çalıştır:

  create or replace function decrement_stock(product_id int, qty int)
  returns void language plpgsql as $$
  begin
    update public.products
    set stock = greatest(0, stock - qty)
    where id = product_id;
  end;
  $$;
*/

// ════════════════════════════════════════════════════════
// REALTIME — Gerçek zamanlı sipariş durumu
// ════════════════════════════════════════════════════════

function watchOrderStatus(orderId, callback) {
  return sb
    .channel('order-' + orderId)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `id=eq.${orderId}`
    }, payload => callback(payload.new))
    .subscribe();
}

// ════════════════════════════════════════════════════════
// RPC WRAPPER (doğrudan Supabase RPC çağrısı)
// ════════════════════════════════════════════════════════

const rpc = (name, params) => sb.rpc(name, params);

// ════════════════════════════════════════════════════════
// EXPORT
// ════════════════════════════════════════════════════════
window._sb = sb;
window.SupaDB = { Auth, Profile, Products, Orders, Coupons, Reviews, watchOrderStatus, sb, rpc };
