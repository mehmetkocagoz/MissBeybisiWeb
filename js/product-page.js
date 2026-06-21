// MissBeybisi — Product Detail Page

document.addEventListener('DOMContentLoaded', async () => {
  await window.productsReady;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const product = getProductBySlug(slug);

  const container = document.getElementById('product-detail');
  if (!container) return;

  if (!product) {
    container.innerHTML = `
      <div class="not-found">
        <h2>Ürün bulunamadı</h2>
        <p>Aradığınız ürün mevcut değil.</p>
        <a href="products.html" class="btn btn--primary">Tüm Ürünler</a>
      </div>`;
    return;
  }

  document.title = `${product.name} — MissBeybisi`;

  const discount = discountPct(product.price, product.originalPrice);

  container.innerHTML = `
    <div class="product-detail__gallery">
      <div class="gallery-main">
        <img id="gallery-main-img" src="${imgSrc(product.images[0])}" alt="${product.name}" class="gallery-main__img">
        ${discount > 0 ? `<span class="badge badge--sale badge--lg">-%${discount}</span>` : ''}
        ${product.isNew ? `<span class="badge badge--new badge--lg">Yeni</span>` : ''}
      </div>
      <div class="gallery-thumbs" id="gallery-thumbs">
        ${product.images.map((img, i) => `
          <button class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Görsel ${i + 1}">
            <img src="${imgSrc(img)}" alt="${product.name} — görsel ${i + 1}" loading="lazy">
          </button>
        `).join('')}
      </div>
    </div>

    <div class="product-detail__info">
      <nav class="breadcrumb" aria-label="Konum">
        <a href="index.html">Ana Sayfa</a>
        <span>›</span>
        <a href="products.html?category=${product.category}">${product.categoryLabel}</a>
        <span>›</span>
        <span>${product.name}</span>
      </nav>

      <p class="product-detail__age">${product.ageLabel}</p>
      <h1 class="product-detail__name">${product.name}</h1>

      <div class="product-detail__price">
        <span class="price-current price-current--lg">${formatPrice(product.price)}</span>
        ${product.originalPrice ? `
          <span class="price-original price-original--lg">${formatPrice(product.originalPrice)}</span>
          <span class="price-saved">₺${(product.originalPrice - product.price).toLocaleString('tr-TR')} indirim</span>
        ` : ''}
      </div>

      <div class="product-detail__colors">
        <p class="option-label">Renk: <strong id="selected-color">${product.colors[0]}</strong></p>
        <div class="color-options">
          ${product.colors.map((color, i) => `
            <button class="color-btn ${i === 0 ? 'active' : ''}" data-color="${color}"
              aria-label="${color}" title="${color}">
              ${color}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="product-detail__sizes">
        <p class="option-label">Beden: <strong id="selected-size">${product.sizes[0]}</strong></p>
        <div class="size-options">
          ${product.sizes.map((size, i) => `
            <button class="size-btn ${i === 0 ? 'active' : ''}" data-size="${size}">${size}</button>
          `).join('')}
        </div>
      </div>

      <div class="product-detail__qty">
        <p class="option-label">Adet</p>
        <div class="qty-control">
          <button class="qty-btn" id="qty-dec">−</button>
          <input type="number" id="qty-input" value="1" min="1" max="10" readonly>
          <button class="qty-btn" id="qty-inc">+</button>
        </div>
      </div>

      <div class="product-detail__cta">
        <button class="btn btn--primary btn--full btn--lg" id="add-to-cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          Sepete Ekle
        </button>
      </div>

      <div class="product-detail__description">
        <h3>Ürün Açıklaması</h3>
        <p>${product.description}</p>
      </div>

      <div class="product-detail__meta">
        <div class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <span>Ücretsiz kargo (250₺ üzeri)</span>
        </div>
        <div class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span>14 gün iade garantisi</span>
        </div>
        <div class="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          <span>%100 orijinal ürün</span>
        </div>
      </div>
    </div>
  `;

  // Gallery thumbnails
  let currentImage = 0;
  const mainImg = document.getElementById('gallery-main-img');

  document.getElementById('gallery-thumbs').addEventListener('click', e => {
    const btn = e.target.closest('.gallery-thumb');
    if (!btn) return;
    currentImage = parseInt(btn.dataset.index);
    mainImg.src = imgSrc(product.images[currentImage]);
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  });

  // Color selection
  let selectedColor = product.colors[0];
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.color;
      document.getElementById('selected-color').textContent = selectedColor;
    });
  });

  // Size selection
  let selectedSize = product.sizes[0];
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.dataset.size;
      document.getElementById('selected-size').textContent = selectedSize;
    });
  });

  // Quantity control
  const qtyInput = document.getElementById('qty-input');
  document.getElementById('qty-dec').addEventListener('click', () => {
    const v = parseInt(qtyInput.value);
    if (v > 1) qtyInput.value = v - 1;
  });
  document.getElementById('qty-inc').addEventListener('click', () => {
    const v = parseInt(qtyInput.value);
    if (v < 10) qtyInput.value = v + 1;
  });

  // Add to cart
  document.getElementById('add-to-cart').addEventListener('click', () => {
    const qty = parseInt(qtyInput.value) || 1;
    Cart.addItem(product, selectedColor, selectedSize, qty);
    showToast(`${product.name} (${selectedColor}, ${selectedSize}) sepete eklendi!`);
    updateCartBadge();
    openCartDrawer();
  });

  // Related products
  const relatedSection = document.getElementById('related-products');
  if (relatedSection) {
    const related = getRelatedProducts(product, 4);
    if (related.length > 0) {
      relatedSection.innerHTML = `
        <div class="section-header">
          <h2 class="section-title">Benzer Ürünler</h2>
        </div>
        <div class="product-grid product-grid--4">
          ${related.map(p => {
            const d = discountPct(p.price, p.originalPrice);
            return `
              <article class="product-card">
                <a href="product.html?slug=${p.slug}" class="product-card__img-wrap">
                  <img src="${imgSrc(p.images[0])}" alt="${p.name}"
                    class="product-card__img product-card__img--main" loading="lazy">
                  ${p.images[1] ? `<img src="${imgSrc(p.images[1])}" alt="${p.name}"
                    class="product-card__img product-card__img--hover" loading="lazy">` : ''}
                  ${d > 0 ? `<span class="badge badge--sale">-%${d}</span>` : ''}
                  ${p.isNew ? `<span class="badge badge--new">Yeni</span>` : ''}
                </a>
                <div class="product-card__body">
                  <h3 class="product-card__name"><a href="product.html?slug=${p.slug}">${p.name}</a></h3>
                  <div class="product-card__price">
                    <span class="price-current">${formatPrice(p.price)}</span>
                    ${p.originalPrice ? `<span class="price-original">${formatPrice(p.originalPrice)}</span>` : ''}
                  </div>
                </div>
              </article>`;
          }).join('')}
        </div>`;
    }
  }
});
