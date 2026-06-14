/* ╔══════════════════════════════════════════════════════════╗
   ║   PB STORE - ADMIN API                                    ║
   ║   Sadece admin sayfalarda yüklenir                        ║
   ║   GÜVENLİK: RLS otomatik blocklar non-admin kullanıcıları ║
   ╚══════════════════════════════════════════════════════════╝
*/

window.PB.admin = {
  // ============ DASHBOARD ============
  dashboard: {
    async getStats() {
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [products, orders, users, todayOrders, monthOrders] = await Promise.all([
        PB.client.from('products').select('id', { count: 'exact', head: true }),
        PB.client.from('orders').select('total', { count: 'exact' }),
        PB.client.from('profiles').select('id', { count: 'exact', head: true }),
        PB.client.from('orders').select('total').gte('created_at', today),
        PB.client.from('orders').select('total').gte('created_at', monthStart.toISOString())
      ]);

      const todayRevenue = (todayOrders.data || []).reduce((s, o) => s + Number(o.total), 0);
      const monthRevenue = (monthOrders.data || []).reduce((s, o) => s + Number(o.total), 0);

      return {
        totalProducts: products.count || 0,
        totalOrders: orders.count || 0,
        totalUsers: users.count || 0,
        todayOrders: todayOrders.data?.length || 0,
        todayRevenue,
        monthRevenue
      };
    },

    async getRecentOrders(limit = 10) {
      const { data, error } = await PB.client
        .from('orders')
        .select('*, user:user_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(limit);
      return { data, error };
    },

    async getLowStockProducts(threshold = 10) {
      const { data, error } = await PB.client
        .from('products')
        .select('*')
        .lt('stock', threshold)
        .eq('is_active', true)
        .order('stock');
      return { data, error };
    }
  },

  // ============ PRODUCTS (Admin) ============
  products: {
    async listAll(options = {}) {
      let query = PB.client
        .from('products')
        .select('*, category:category_id(name)', { count: 'exact' });

      if (options.search) query = query.ilike('name', `%${options.search}%`);
      if (options.isActive !== undefined) query = query.eq('is_active', options.isActive);
      if (options.categoryId) query = query.eq('category_id', options.categoryId);

      query = query.order('created_at', { ascending: false });
      if (options.limit) query = query.limit(options.limit);
      if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

      const { data, error, count } = await query;
      return { data, error, count };
    },

    async create(product) {
      const { data, error } = await PB.client
        .from('products')
        .insert(product)
        .select()
        .single();
      return { data, error };
    },

    async update(id, updates) {
      const { data, error } = await PB.client
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id) {
      const { error } = await PB.client
        .from('products')
        .delete()
        .eq('id', id);
      return { error };
    },

    async toggleActive(id, isActive) {
      return await this.update(id, { is_active: isActive });
    },

    async uploadImage(file, productSku) {
      const fileName = `${productSku}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await PB.client.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      if (error) return { error };

      const { data: { publicUrl } } = PB.client.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return { data: { url: publicUrl, path: data.path } };
    }
  },

  // ============ ORDERS (Admin) ============
  orders: {
    async listAll(options = {}) {
      let query = PB.client
        .from('orders')
        .select('*, user:user_id(full_name, email, phone), items:order_items(*)', { count: 'exact' });

      if (options.status) query = query.eq('status', options.status);
      if (options.search) query = query.ilike('order_number', `%${options.search}%`);

      query = query.order('created_at', { ascending: false });
      if (options.limit) query = query.limit(options.limit);

      const { data, error, count } = await query;
      return { data, error, count };
    },

    async updateStatus(id, status, trackingNumber = null) {
      const updates = { status };
      if (status === 'shipped') {
        updates.shipped_at = new Date().toISOString();
        if (trackingNumber) updates.tracking_number = trackingNumber;
      }
      if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { data, error } = await PB.client
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async addNote(id, note) {
      const { data, error } = await PB.client
        .from('orders')
        .update({ admin_note: note })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    }
  },

  // ============ USERS (Admin) ============
  users: {
    async listAll(options = {}) {
      let query = PB.client
        .from('profiles')
        .select('*', { count: 'exact' });

      if (options.search) query = query.or(`full_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
      if (options.role) query = query.eq('role', options.role);
      if (options.tier) query = query.eq('loyalty_tier', options.tier);

      query = query.order('created_at', { ascending: false });
      if (options.limit) query = query.limit(options.limit);

      const { data, error, count } = await query;
      return { data, error, count };
    },

    async getUserDetail(userId) {
      const [profile, orders, addresses] = await Promise.all([
        PB.client.from('profiles').select('*').eq('id', userId).single(),
        PB.client.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        PB.client.from('addresses').select('*').eq('user_id', userId)
      ]);
      return {
        profile: profile.data,
        orders: orders.data || [],
        addresses: addresses.data || []
      };
    },

    async updateRole(userId, newRole) {
      const { data, error } = await PB.client
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    }
  },

  // ============ CATEGORIES (Admin) ============
  categories: {
    async create(category) {
      const { data, error } = await PB.client
        .from('categories')
        .insert(category)
        .select()
        .single();
      return { data, error };
    },

    async update(id, updates) {
      const { data, error } = await PB.client
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id) {
      const { error } = await PB.client
        .from('categories')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  // ============ COUPONS (Admin) ============
  coupons: {
    async listAll() {
      const { data, error } = await PB.client
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },

    async create(coupon) {
      const { data, error } = await PB.client
        .from('coupons')
        .insert({ ...coupon, code: coupon.code.toUpperCase() })
        .select()
        .single();
      return { data, error };
    },

    async update(id, updates) {
      if (updates.code) updates.code = updates.code.toUpperCase();
      const { data, error } = await PB.client
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id) {
      const { error } = await PB.client
        .from('coupons')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  // ============ AUDIT LOGS ============
  auditLogs: {
    async list(limit = 50) {
      const { data, error } = await PB.client
        .from('audit_logs')
        .select('*, user:user_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(limit);
      return { data, error };
    }
  }
};

console.log('✓ PB Admin API yüklendi');
