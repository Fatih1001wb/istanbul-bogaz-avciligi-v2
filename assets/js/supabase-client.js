/* ╔══════════════════════════════════════════════════════════╗
   ║   PB STORE - SUPABASE CLIENT & HELPERS                   ║
   ║   Tüm sayfalarda bu dosya yüklenir                       ║
   ╚══════════════════════════════════════════════════════════╝

   KULLANIM:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="assets/js/supabase-config.js"></script>
   <script src="assets/js/supabase-client.js"></script>

   Sonra:
   const { data, error } = await PB.products.getAll()
*/

// Supabase client'ı oluştur
const _supabase = window.supabase.createClient(
  window.SUPABASE_CONFIG.URL,
  window.SUPABASE_CONFIG.ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// ════════════════════════════════════════════════════════════
// PB - Ana namespace
// ════════════════════════════════════════════════════════════
window.PB = {
  client: _supabase,

  // ============ AUTHENTICATION ============
  auth: {
    // Yeni kayıt
    async signUp(email, password, fullName, phone) {
      const { data, error } = await _supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null
          }
        }
      });
      return { data, error };
    },

    // Giriş yap
    async signIn(email, password) {
      const { data, error } = await _supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    },

    // Google ile giriş
    async signInWithGoogle() {
      const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.SUPABASE_CONFIG.REDIRECT_URL + '/index.html'
        }
      });
      return { data, error };
    },

    // Çıkış yap
    async signOut() {
      const { error } = await _supabase.auth.signOut();
      return { error };
    },

    // Şifre sıfırlama maili gönder
    async resetPassword(email) {
      const { data, error } = await _supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.SUPABASE_CONFIG.REDIRECT_URL + '/pages/sifre-sifirla.html'
      });
      return { data, error };
    },

    // Yeni şifre belirle
    async updatePassword(newPassword) {
      const { data, error } = await _supabase.auth.updateUser({
        password: newPassword
      });
      return { data, error };
    },

    // Mevcut kullanıcıyı al
    async getUser() {
      const { data: { user } } = await _supabase.auth.getUser();
      return user;
    },

    // Kullanıcı oturumu açık mı?
    async isLoggedIn() {
      const { data: { session } } = await _supabase.auth.getSession();
      return !!session;
    },

    // Kullanıcı admin mi?
    async isAdmin() {
      const user = await this.getUser();
      if (!user) return false;
      const { data } = await _supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      return data?.role === 'admin' || data?.role === 'staff';
    },

    // Auth state değişimini dinle (logout vb.)
    onAuthChange(callback) {
      return _supabase.auth.onAuthStateChange(callback);
    }
  },

  // ============ PROFILES ============
  profile: {
    async get() {
      const user = await PB.auth.getUser();
      if (!user) return null;
      const { data, error } = await _supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return { data, error };
    },

    async update(updates) {
      const user = await PB.auth.getUser();
      if (!user) return { error: 'Kullanıcı oturumu yok' };
      const { data, error } = await _supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      return { data, error };
    }
  },

  // ============ ADDRESSES ============
  addresses: {
    async list() {
      const { data, error } = await _supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async add(address) {
      const user = await PB.auth.getUser();
      if (!user) return { error: 'Giriş yapılmamış' };
      const { data, error } = await _supabase
        .from('addresses')
        .insert({ ...address, user_id: user.id })
        .select()
        .single();
      return { data, error };
    },

    async update(id, updates) {
      const { data, error } = await _supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id) {
      const { error } = await _supabase
        .from('addresses')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  // ============ CATEGORIES ============
  categories: {
    async getAll() {
      const { data, error } = await _supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      return { data, error };
    },

    async getMain() {
      const { data, error } = await _supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('sort_order');
      return { data, error };
    },

    async getSubcategories(parentId) {
      const { data, error } = await _supabase
        .from('categories')
        .select('*')
        .eq('parent_id', parentId)
        .eq('is_active', true)
        .order('sort_order');
      return { data, error };
    },

    async getBySlug(slug) {
      const { data, error } = await _supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
      return { data, error };
    }
  },

  // ============ PRODUCTS ============
  products: {
    async list(options = {}) {
      let query = _supabase
        .from('products')
        .select('*, category:category_id(name, slug), subcategory:subcategory_id(name, slug)')
        .eq('is_active', true);

      if (options.categorySlug) {
        const { data: cat } = await PB.categories.getBySlug(options.categorySlug);
        if (cat) query = query.eq('category_id', cat.id);
      }
      if (options.subcategoryId) query = query.eq('subcategory_id', options.subcategoryId);
      if (options.featured) query = query.eq('is_featured', true);
      if (options.search) query = query.textSearch('name', options.search, { type: 'websearch' });
      if (options.minPrice) query = query.gte('price', options.minPrice);
      if (options.maxPrice) query = query.lte('price', options.maxPrice);
      if (options.badges) query = query.contains('badges', options.badges);

      const orderBy = options.orderBy || 'created_at';
      const ascending = options.ascending !== undefined ? options.ascending : false;
      query = query.order(orderBy, { ascending });

      if (options.limit) query = query.limit(options.limit);
      if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

      const { data, error, count } = await query;
      return { data, error, count };
    },

    async getById(id) {
      const { data, error } = await _supabase
        .from('products')
        .select('*, category:category_id(name, slug), subcategory:subcategory_id(name, slug)')
        .eq('id', id)
        .single();
      // Sayaç artır
      if (data) {
        _supabase.rpc('increment_product_views', { product_id: id }).then(() => {});
      }
      return { data, error };
    },

    async getBySlug(slug) {
      const { data, error } = await _supabase
        .from('products')
        .select('*, category:category_id(name, slug), subcategory:subcategory_id(name, slug)')
        .eq('slug', slug)
        .single();
      return { data, error };
    }
  },

  // ============ FAVORITES ============
  favorites: {
    async list() {
      const { data, error } = await _supabase
        .from('favorites')
        .select('*, product:product_id(*)');
      return { data, error };
    },

    async add(productId) {
      const user = await PB.auth.getUser();
      if (!user) return { error: 'Giriş yapılmamış' };
      const { data, error } = await _supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: productId })
        .select()
        .single();
      return { data, error };
    },

    async remove(productId) {
      const user = await PB.auth.getUser();
      if (!user) return { error: 'Giriş yapılmamış' };
      const { error } = await _supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      return { error };
    },

    async isFavorite(productId) {
      const user = await PB.auth.getUser();
      if (!user) return false;
      const { data } = await _supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
      return !!data;
    }
  },

  // ============ CART ============
  cart: {
    async list() {
      const { data, error } = await _supabase
        .from('cart_items')
        .select('*, product:product_id(*)')
        .order('added_at', { ascending: false });
      return { data, error };
    },

    async add(productId, quantity = 1) {
      const user = await PB.auth.getUser();
      if (!user) return { error: 'Giriş yapılmamış' };
      // Önce var mı kontrol
      const { data: existing } = await _supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        // Varsa quantity artır
        return await this.update(existing.id, existing.quantity + quantity);
      }

      const { data, error } = await _supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, quantity })
        .select('*, product:product_id(*)')
        .single();
      return { data, error };
    },

    async update(id, quantity) {
      if (quantity <= 0) return await this.remove(id);
      const { data, error } = await _supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
        .select('*, product:product_id(*)')
        .single();
      return { data, error };
    },

    async remove(id) {
      const { error } = await _supabase
        .from('cart_items')
        .delete()
        .eq('id', id);
      return { error };
    },

    async clear() {
      const user = await PB.auth.getUser();
      if (!user) return { error: 'Giriş yapılmamış' };
      const { error } = await _supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      return { error };
    }
  },

  // ============ ORDERS ============
  orders: {
    async list() {
      const { data, error } = await _supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async getById(id) {
      const { data, error } = await _supabase
        .from('orders')
        .select('*, items:order_items(*, product:product_id(*))')
        .eq('id', id)
        .single();
      return { data, error };
    },

    async create(orderData, items) {
      const user = await PB.auth.getUser();
      if (!user) return { error: 'Giriş yapılmamış' };

      // 1. Önce siparişi oluştur
      const { data: order, error: orderError } = await _supabase
        .from('orders')
        .insert({ ...orderData, user_id: user.id })
        .select()
        .single();

      if (orderError) return { error: orderError };

      // 2. Sonra sipariş kalemlerini ekle
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        unit_price: item.unit_price,
        quantity: item.quantity,
        subtotal: item.unit_price * item.quantity
      }));

      const { error: itemsError } = await _supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) return { error: itemsError };

      // 3. Sepeti temizle
      await PB.cart.clear();

      return { data: order };
    }
  },

  // ============ COUPONS ============
  coupons: {
    async validate(code) {
      const { data, error } = await _supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
        .single();
      return { data, error };
    }
  },

  // ============ REVIEWS ============
  reviews: {
    async list(productId) {
      const { data, error } = await _supabase
        .from('reviews')
        .select('*, user:user_id(full_name, avatar_url)')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async add(review) {
      const user = await PB.auth.getUser();
      if (!user) return { error: 'Giriş yapılmamış' };
      const { data, error } = await _supabase
        .from('reviews')
        .insert({ ...review, user_id: user.id })
        .select()
        .single();
      return { data, error };
    }
  }
};

console.log('✓ PB Store Supabase client yüklendi');
