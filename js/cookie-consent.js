// MissBeybisi — Cookie consent banner (KVKK / e-ticaret uyumluluğu)

document.addEventListener('DOMContentLoaded', () => {
  const KEY = 'mb_cookie_consent';
  if (localStorage.getItem(KEY)) return;

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = `
    <p>
      Sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz.
      Detaylar için <a href="cerez-politikasi.html">Çerez Politikamızı</a> inceleyebilirsiniz.
    </p>
    <div class="cookie-actions">
      <button class="cookie-decline" id="cookie-decline">Reddet</button>
      <button class="cookie-accept" id="cookie-accept">Kabul Et</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('cookie-accept').addEventListener('click', () => {
    localStorage.setItem(KEY, 'accepted');
    banner.classList.add('hidden');
  });
  document.getElementById('cookie-decline').addEventListener('click', () => {
    localStorage.setItem(KEY, 'declined');
    banner.classList.add('hidden');
  });
});
