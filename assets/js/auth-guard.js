/* ╔══════════════════════════════════════════════════════════╗
   ║   PB STORE - AUTH GUARD                                   ║
   ║   Sayfa erişim kontrolü                                   ║
   ╚══════════════════════════════════════════════════════════╝

   KULLANIM:
   - Admin sayfalar için (admin.html başında):
       <script>PB_AUTH_REQUIRE = 'admin';</script>
   - Sadece üye sayfalar için (hesabim.html başında):
       <script>PB_AUTH_REQUIRE = 'user';</script>

   Sonra:
       <script src="../assets/js/auth-guard.js"></script>
*/

(async function() {
  // Eğer korumalı bir sayfa değilse hiçbir şey yapma
  if (typeof window.PB_AUTH_REQUIRE === 'undefined') return;

  const required = window.PB_AUTH_REQUIRE;

  // PB henüz yüklenmemişse bekle
  let attempts = 0;
  while (!window.PB && attempts < 50) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }
  if (!window.PB) {
    console.error('PB Supabase yüklenemedi');
    return;
  }

  const isLoggedIn = await PB.auth.isLoggedIn();

  // Login gerekli ama giriş yok → giriş sayfasına yönlendir
  if (!isLoggedIn) {
    const currentPath = window.location.pathname + window.location.search;
    const loginUrl = currentPath.includes('/pages/')
      ? `giris-kayit.html?redirect=${encodeURIComponent(currentPath)}`
      : `pages/giris-kayit.html?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
    return;
  }

  // Admin gerekiyorsa admin mi kontrol et
  if (required === 'admin') {
    const isAdmin = await PB.auth.isAdmin();
    if (!isAdmin) {
      alert('Bu sayfaya erişim yetkiniz yok.');
      window.location.href = '../index.html';
      return;
    }
  }

  // Auth değişimini dinle - oturum kapanırsa yönlendir
  PB.auth.onAuthChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      window.location.href = window.location.pathname.includes('/pages/')
        ? 'giris-kayit.html'
        : 'pages/giris-kayit.html';
    }
  });

  console.log('✓ Auth guard aktif:', required);
})();
