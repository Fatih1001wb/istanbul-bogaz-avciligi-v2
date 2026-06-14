// ════════════════════════════════════════════════════════
// supabase-client.js
// Sadece kimlik doğrulama ve profil için sadeleştirildi
// ════════════════════════════════════════════════════════

const SUPABASE_URL  = 'https://twsfdkircmfnllypzokh.supabase.co';
const SUPABASE_ANON = 'sb_publishable_G0dY-0XBYyNxE2fnse2fog_hFdRKvMs';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════

const Auth = {

  async register(email, password, fullName) {
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    return data;
  },

  async login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    await sb.auth.signOut();
    if (typeof goPage === 'function') goPage('home');
    if (typeof toast === 'function') toast('Çıkış yapıldı', '👋');
  },

  async resetPassword(email) {
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await sb.auth.getUser();
    return user;
  },

  onAuthStateChange(callback) {
    return sb.auth.onAuthStateChange(callback);
  }
};

// ════════════════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════════════════

const Profile = {

  async get(userId) {
    const { data, error } = await sb.from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async update(userId, updates) {
    const { data, error } = await sb.from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

window._sb = sb;
window.SupaDB = { Auth, Profile, sb };
