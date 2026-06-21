// MissBeybisi — Shared header/footer injector for legal/info pages.
// Keeps these lightweight pages consistent with the main site chrome
// without duplicating the full header/footer markup in every file.

function renderSiteHeader() {
  return `
    <header class="site-header" role="banner">
      <div class="container">
        <div class="header-inner">
          <a href="index.html" class="site-logo" aria-label="MissBeybisi Ana Sayfa">Miss<span>Beybisi</span></a>
          <nav class="site-nav" aria-label="Ana menü">
            <a href="index.html">Ana Sayfa</a>
            <a href="products.html">Koleksiyon</a>
          </nav>
          <div class="header-actions">
            <button class="header-btn" id="cart-btn" aria-label="Sepet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span class="cart-badge" aria-live="polite">0</span>
            </button>
          </div>
        </div>
      </div>
    </header>`;
}

function renderSiteFooter() {
  return `
    <footer class="site-footer" role="contentinfo">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="site-logo">Miss<span>Beybisi</span></a>
            <p>Küçük prensesler için özenle tasarlanmış kız çocuk elbiseleri.</p>
            <div class="iyzico-badge">
              <img src="images/iyzico/logo_band_colored.svg" alt="İyzico ile güvenli ödeme">
            </div>
          </div>
          <div>
            <h4 class="footer-heading">Yasal</h4>
            <ul class="footer-links">
              <li><a href="mesafeli-satis-sozlesmesi.html">Mesafeli Satış Sözleşmesi</a></li>
              <li><a href="iade-ve-cayma-hakki.html">İade ve Cayma Hakkı</a></li>
              <li><a href="teslimat-politikasi.html">Teslimat Politikası</a></li>
              <li><a href="gizlilik-politikasi.html">Gizlilik Politikası &amp; KVKK</a></li>
              <li><a href="cerez-politikasi.html">Çerez Politikası</a></li>
              <li><a href="bilgi-toplumu-hizmetleri.html">Bilgi Toplumu Hizmetleri</a></li>
            </ul>
          </div>
          <div>
            <h4 class="footer-heading">Bilgi</h4>
            <ul class="footer-links">
              <li><a href="hakkimizda.html">Hakkımızda</a></li>
              <li><a href="iletisim.html">İletişim</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 MissBeybisi. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const headerSlot = document.getElementById('site-header-slot');
  const footerSlot = document.getElementById('site-footer-slot');
  if (headerSlot) headerSlot.outerHTML = renderSiteHeader();
  if (footerSlot) footerSlot.outerHTML = renderSiteFooter();
});
