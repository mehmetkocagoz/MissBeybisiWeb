// MissBeybisi — Shared utilities loaded on every page

function imgSrc(url) {
  return url || '';
}

function formatPrice(n) {
  return '₺' + n.toLocaleString('tr-TR');
}

function discountPct(price, original) {
  if (!original) return 0;
  return Math.round((original - price) / original * 100);
}

// ── Cart Badge ──────────────────────────────────────────────────────────────
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = Cart.getCount();
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ── Cart Drawer ──────────────────────────────────────────────────────────────
function buildCartDrawer() {
  const existing = document.getElementById('cart-drawer');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id = 'cart-overlay';
  overlay.addEventListener('click', closeCartDrawer);

  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.id = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-drawer__header">
      <h3>Sepetim</h3>
      <button class="cart-drawer__close" aria-label="Kapat">✕</button>
    </div>
    <div class="cart-drawer__body" id="cart-body"></div>
    <div class="cart-drawer__footer" id="cart-footer"></div>
  `;
  drawer.querySelector('.cart-drawer__close').addEventListener('click', closeCartDrawer);

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
}

function renderCartDrawer() {
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  if (!body) return;

  const items = Cart.getItems();

  if (items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        <p>Sepetiniz boş</p>
        <a href="products.html" class="btn btn--primary">Alışverişe Başla</a>
      </div>`;
    footer.innerHTML = '';
    return;
  }

  body.innerHTML = items.map(item => `
    <div class="cart-item" data-key="${item.key}">
      <img src="${imgSrc(item.image)}" alt="${item.name}" class="cart-item__img">
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__meta">Renk: ${item.color} · Beden: ${item.size}</p>
        <p class="cart-item__price">${formatPrice(item.price)}</p>
        <div class="cart-item__qty">
          <button class="qty-btn qty-dec" data-key="${item.key}">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn qty-inc" data-key="${item.key}">+</button>
        </div>
      </div>
      <button class="cart-item__remove" data-key="${item.key}" aria-label="Kaldır">✕</button>
    </div>
  `).join('');

  footer.innerHTML = `
    <div class="cart-total">
      <span>Toplam</span>
      <strong>${formatPrice(Cart.getTotal())}</strong>
    </div>
    <p class="cart-shipping-note">Kargo ve vergi hesaplama ödeme adımında yapılır.</p>
    <a class="btn btn--primary btn--full" href="checkout.html">Ödemeye Geç</a>
    <button class="btn btn--ghost btn--full" onclick="Cart.clear(); renderCartDrawer(); updateCartBadge();">Sepeti Temizle</button>
  `;

  // qty / remove events
  body.querySelectorAll('.qty-dec').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = Cart.getItems().find(i => i.key === btn.dataset.key);
      Cart.updateQuantity(btn.dataset.key, (item ? item.quantity : 1) - 1);
      renderCartDrawer(); updateCartBadge();
    });
  });
  body.querySelectorAll('.qty-inc').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = Cart.getItems().find(i => i.key === btn.dataset.key);
      Cart.updateQuantity(btn.dataset.key, (item ? item.quantity : 1) + 1);
      renderCartDrawer(); updateCartBadge();
    });
  });
  body.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      Cart.removeItem(btn.dataset.key);
      renderCartDrawer(); updateCartBadge();
    });
  });
}

function openCartDrawer() {
  buildCartDrawer();
  renderCartDrawer();
  setTimeout(() => {
    document.getElementById('cart-overlay').classList.add('active');
    document.getElementById('cart-drawer').classList.add('active');
    document.body.classList.add('no-scroll');
  }, 10);
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay) overlay.classList.remove('active');
  if (drawer) drawer.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

// ── Mobile Nav ───────────────────────────────────────────────────────────────
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.classList.toggle('active');
  });
}

// ── Toast notification ───────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast--show'));
  setTimeout(() => {
    toast.classList.remove('toast--show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initMobileNav();

  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);

  window.addEventListener('cartUpdated', updateCartBadge);

  // Scroll header shadow
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    });
  }
});
