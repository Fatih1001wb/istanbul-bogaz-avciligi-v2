# Assets

Logo ve görseller buraya gelecek.

## Klasör Yapısı

- `css/` — İleride harici CSS dosyaları
- `js/` — İleride harici JS dosyaları
- `images/` — Logo, ürün görselleri, ikonlar

## Logo Yerleştirme

Logo hazır olduğunda:

1. `assets/images/logo.png` (veya `.svg`) olarak kaydet
2. Tüm HTML dosyalarında bu kısmı:
   ```html
   <div class="logo-circle"><span>PB</span></div>
   ```
3. Şununla değiştir:
   ```html
   <div class="logo-circle">
     <img src="/assets/images/logo.png" alt="PB Store" style="width:100%;height:100%;border-radius:50%;" />
   </div>
   ```

## Önerilen Logo Boyutları

- **Anasayfa karşılama:** 140x140px
- **Navbar:** 64x64px (responsive 56x56)
- **Auth sayfaları:** 100x100px
- **Footer:** 50x50px

Vektörel SVG kullanırsanız tek dosya tüm boyutlara uyar.
