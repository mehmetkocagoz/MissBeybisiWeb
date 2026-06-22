// MissBeybisi — Product Catalogue (Supabase-backed)
// Replaces the old static PRODUCTS array. Data is fetched once on page load;
// other scripts must `await window.productsReady` before calling the getters below.

let PRODUCTS = [];

let _resolveReady;
window.productsReady = new Promise(resolve => { _resolveReady = resolve; });

const CATEGORY_LABELS = { 'ozel-gun': 'Özel Gün', 'gunluk': 'Günlük' };
const AGE_LABELS = { '0-2-yas': '0–2 Yaş', '2-4-yas': '2–4 Yaş', '4-8-yas': '4–8 Yaş' };

function mapProduct(row, stockByProductId) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    category: row.category,
    categoryLabel: CATEGORY_LABELS[row.category] || row.category,
    ageGroup: row.age_group,
    ageLabel: AGE_LABELS[row.age_group] || row.age_group,
    colors: row.colors || [],
    sizes: row.sizes || [],
    featured: !!row.featured,
    isNew: !!row.is_new,
    images: row.images || [],
    description: row.description || '',
    stock: stockByProductId.get(row.id) ?? 0,
  };
}

async function loadProducts() {
  try {
    const { fetchProducts, fetchStockTotals } = await import('./supabase.js');
    const rows = await fetchProducts();

    let stockByProductId = new Map();
    try {
      const stockTotals = await fetchStockTotals();
      stockByProductId = new Map(stockTotals.map(s => [s.product_id, Number(s.total_quantity)]));
    } catch (stockErr) {
      console.error('Stok toplamları yüklenemedi (product_stock_totals view eksik olabilir):', stockErr);
    }

    PRODUCTS = rows.map(row => mapProduct(row, stockByProductId));
  } catch (err) {
    console.error('Ürünler yüklenemedi:', err);
    PRODUCTS = [];
  }
  _resolveReady();
}

loadProducts();

function imgSrcFromFilename(filename) {
  return imgSrc(filename);
}

function getProductBySlug(slug) {
  return PRODUCTS.find(p => p.slug === slug) || null;
}

function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

function getFeaturedProducts() {
  return PRODUCTS.filter(p => p.featured);
}

function getNewProducts() {
  return PRODUCTS.filter(p => p.isNew);
}

function getRelatedProducts(product, count = 4) {
  return PRODUCTS
    .filter(p => p.id !== product.id && (p.category === product.category || p.ageGroup === product.ageGroup))
    .slice(0, count);
}

function filterProducts({ category, ageGroup, minPrice, maxPrice, search, sortBy } = {}) {
  let results = [...PRODUCTS];

  if (category && category !== 'all') {
    results = results.filter(p => p.category === category);
  }
  if (ageGroup && ageGroup !== 'all') {
    results = results.filter(p => p.ageGroup === ageGroup);
  }
  if (minPrice != null) {
    results = results.filter(p => p.price >= minPrice);
  }
  if (maxPrice != null) {
    results = results.filter(p => p.price <= maxPrice);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  switch (sortBy) {
    case 'price-asc':  results.sort((a, b) => a.price - b.price); break;
    case 'price-desc': results.sort((a, b) => b.price - a.price); break;
    case 'newest':     results.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    case 'discount':
      results.sort((a, b) => {
        const da = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const db = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return db - da;
      });
      break;
    default: break;
  }

  return results;
}
