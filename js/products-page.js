// MissBeybisi — Product Listing Page

let currentFilters = {
  category: 'all',
  ageGroup: 'all',
  minPrice: null,
  maxPrice: null,
  search: '',
  sortBy: 'default'
};

function renderGrid(products) {
  const grid = document.getElementById('product-grid');
  const count = document.getElementById('product-count');

  if (count) count.textContent = `${products.length} ürün`;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <p>Bu kriterlere uygun ürün bulunamadı.</p>
        <button class="btn btn--ghost" onclick="resetFilters()">Filtreleri Temizle</button>
      </div>`;
    return;
  }

  grid.innerHTML = products.map(product => {
    const discount = discountPct(product.price, product.originalPrice);
    const outOfStock = product.stock === 0;
    return `
      <article class="product-card${outOfStock ? ' product-card--oos' : ''}">
        <a href="product.html?slug=${product.slug}" class="product-card__img-wrap">
          <img src="${imgSrc(product.images[0])}" alt="${product.name}"
            class="product-card__img product-card__img--main" loading="lazy">
          ${product.images[1] ? `<img src="${imgSrc(product.images[1])}" alt="${product.name}"
            class="product-card__img product-card__img--hover" loading="lazy">` : ''}
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
            <a href="product.html?slug=${product.slug}">${product.name}</a>
          </h3>
          <div class="product-card__price">
            <span class="price-current">${formatPrice(product.price)}</span>
            ${product.originalPrice ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ''}
          </div>
        </div>
      </article>`;
  }).join('');

  // Quick add events
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

function applyFilters() {
  const products = filterProducts(currentFilters);
  renderGrid(products);
}

function resetFilters() {
  currentFilters = { category: 'all', ageGroup: 'all', minPrice: null, maxPrice: null, search: '', sortBy: 'default' };

  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('[data-filter-category]').forEach(el => {
    if (el.dataset.filterCategory === 'all') el.classList.add('active');
  });
  document.querySelectorAll('[data-filter-age]').forEach(el => {
    if (el.dataset.filterAge === 'all') el.classList.add('active');
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');
  if (priceMin) priceMin.value = '';
  if (priceMax) priceMax.value = '';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'default';

  applyFilters();
}

document.addEventListener('DOMContentLoaded', async () => {
  await window.productsReady;

  // Read URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('category')) currentFilters.category = params.get('category');
  if (params.get('age')) currentFilters.ageGroup = params.get('age');
  if (params.get('q')) currentFilters.search = params.get('q');

  // Initial render
  applyFilters();

  // Category filter chips
  document.querySelectorAll('[data-filter-category]').forEach(chip => {
    if (chip.dataset.filterCategory === currentFilters.category) chip.classList.add('active');
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-category]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilters.category = chip.dataset.filterCategory;
      applyFilters();
    });
  });

  // Age group filter chips
  document.querySelectorAll('[data-filter-age]').forEach(chip => {
    if (chip.dataset.filterAge === currentFilters.ageGroup) chip.classList.add('active');
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-age]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilters.ageGroup = chip.dataset.filterAge;
      applyFilters();
    });
  });

  // Price filter
  const priceBtn = document.getElementById('price-apply');
  if (priceBtn) {
    priceBtn.addEventListener('click', () => {
      const min = parseFloat(document.getElementById('price-min').value);
      const max = parseFloat(document.getElementById('price-max').value);
      currentFilters.minPrice = isNaN(min) ? null : min;
      currentFilters.maxPrice = isNaN(max) ? null : max;
      applyFilters();
    });
  }

  // Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    if (currentFilters.search) searchInput.value = currentFilters.search;
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentFilters.search = searchInput.value.trim();
        applyFilters();
      }, 300);
    });
  }

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentFilters.sortBy = sortSelect.value;
      applyFilters();
    });
  }

  // Mobile filter toggle
  const filterToggle = document.getElementById('filter-toggle');
  const filterSidebar = document.getElementById('filter-sidebar');
  if (filterToggle && filterSidebar) {
    filterToggle.addEventListener('click', () => {
      filterSidebar.classList.toggle('open');
      filterToggle.classList.toggle('active');
    });
  }

  // Reset
  const resetBtn = document.getElementById('filter-reset');
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);
});
