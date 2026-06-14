/* ╔══════════════════════════════════════════════════════════╗
   ║   PB STORE - SUPABASE KONFİGÜRASYON                      ║
   ╚══════════════════════════════════════════════════════════╝

   GÜVENLİK ÖNEMLİ:
   - ANON_KEY public bir anahtardır, frontend'de paylaşılması GÜVENLİDİR
   - RLS (Row Level Security) sayesinde anon_key ile sadece izin verilen şeyler yapılabilir
   - SERVICE_ROLE_KEY'i ASLA buraya yazma! O sadece backend için.

   NASIL ALINIR:
   1. https://supabase.com → Yeni proje aç
   2. Settings → API
   3. "Project URL" ve "anon public" anahtarını kopyala
   4. Aşağıya yapıştır
*/

window.SUPABASE_CONFIG = {
  // BURAYA Supabase Dashboard'dan aldığın URL'i yapıştır:
  URL: 'https://YOUR-PROJECT-ID.supabase.co',

  // BURAYA "anon public" anahtarını yapıştır:
  ANON_KEY: 'YOUR-ANON-KEY-HERE',

  // İsteğe bağlı: Custom domain kullanıyorsan
  REDIRECT_URL: window.location.origin
};
