// MissBeybisi — Homepage logic

function createProductCard(product, rootPrefix = '') {
  const discount = discountPct(product.price, product.originalPrice);
  const outOfStock = product.stock === 0;
  return `
    <article class="product-card${outOfStock ? ' product-card--oos' : ''}">
      <a href="${rootPrefix}product.html?slug=${product.slug}" class="product-card__img-wrap">
        <img
          src="${imgSrc(product.images[0])}"
          alt="${product.name}"
          class="product-card__img product-card__img--main"
          loading="lazy">
        ${product.images[1] ? `<img
          src="${imgSrc(product.images[1])}"
          alt="${product.name} — görsel 2"
          class="product-card__img product-card__img--hover"
          loading="lazy">` : ''}
        ${discount > 0 ? `<span class="badge badge--sale">-%${discount}</span>` : ''}
        ${product.isNew ? `<span class="badge badge--new">Yeni</span>` : ''}
        ${outOfStock ? `<span class="badge badge--oos">Stokta Yok</span>` : ''}
        <div class="product-card__actions">
          ${outOfStock
            ? `<button class="btn btn--primary btn--sm" disabled>Stokta Yok</button>`
            : `<button class="product-card__quick-add btn btn--primary btn--sm"
                data-id="${product.id}" data-color="${product.colors[0]}" data-size="${product.sizes[0]}">
                Sepete Ekle
              </button>`}
        </div>
      </a>
      <div class="product-card__body">
        <p class="product-card__category">${product.categoryLabel} · ${product.ageLabel}</p>
        <h3 class="product-card__name">
          <a href="${rootPrefix}product.html?slug=${product.slug}">${product.name}</a>
        </h3>
        <div class="product-card__price">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ''}
        </div>
      </div>
    </article>
  `;
}

function bindQuickAdd(grid) {
  grid.querySelectorAll('.product-card__quick-add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const product = getProductById(btn.dataset.id);
      if (product) {
        Cart.addItem(product, btn.dataset.color, btn.dataset.size);
        showToast(`${product.name} sepete eklendi!`);
        updateCartBadge();
      }
    });
  });
}

const CATEGORY_CARD_PHOTOS = [
  'photos/WhatsApp%20Image%202026-06-14%20at%2022.31.56%20(8).jpeg',
  'photos/WhatsApp%20Image%202026-06-14%20at%2022.31.56%20(4).jpeg',
];

document.addEventListener('DOMContentLoaded', async () => {
  await window.productsReady;

  // Category cards (Özel Gün / Günlük / any admin-added category)
  const categoryCardsWrap = document.getElementById('category-cards-dynamic');
  if (categoryCardsWrap) {
    categoryCardsWrap.innerHTML = getCategories().map((cat, i) => {
      const count = getProductsByCategory(cat.slug).length;
      const photo = CATEGORY_CARD_PHOTOS[i % CATEGORY_CARD_PHOTOS.length];
      return `
        <a href="products.html?category=${cat.slug}" class="category-card">
          <img src="${photo}" alt="${cat.name} Elbiseleri" loading="lazy">
          <div class="category-card__overlay"></div>
          <div class="category-card__body">
            <p class="category-card__name">${cat.name}</p>
            <p class="category-card__count">${count} ürün</p>
          </div>
        </a>`;
    }).join('');
  }

  // Featured products
  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid) {
    const featured = getFeaturedProducts().slice(0, 8);
    featuredGrid.innerHTML = featured.map(p => createProductCard(p)).join('');
    bindQuickAdd(featuredGrid);
  }

  // New arrivals ticker
  const newGrid = document.getElementById('new-grid');
  if (newGrid) {
    const newProducts = getNewProducts().slice(0, 4);
    newGrid.innerHTML = newProducts.map(p => createProductCard(p)).join('');
    bindQuickAdd(newGrid);
  }
});
