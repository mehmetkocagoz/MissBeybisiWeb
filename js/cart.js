// MissBeybisi — Cart Manager (localStorage)

const Cart = (() => {
  const KEY = 'missbeybisi_cart';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items } }));
  }

  function getItems() { return load(); }

  function addItem(product, color, size, quantity = 1, maxStock = Infinity) {
    const items = load();
    const key = `${product.id}_${color}_${size}`;
    const existing = items.find(i => i.key === key);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, maxStock);
    } else {
      items.push({
        key,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        color,
        size,
        quantity: Math.min(quantity, maxStock),
        image: product.images[0]
      });
    }
    save(items);
  }

  function removeItem(key) {
    const items = load().filter(i => i.key !== key);
    save(items);
  }

  function updateQuantity(key, quantity, maxStock = Infinity) {
    const items = load();
    const item = items.find(i => i.key === key);
    if (item) {
      if (quantity < 1) { removeItem(key); return; }
      item.quantity = Math.min(quantity, maxStock);
      save(items);
    }
  }

  function clear() { save([]); }

  function getCount() {
    return load().reduce((sum, i) => sum + i.quantity, 0);
  }

  function getTotal() {
    return load().reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  return { getItems, addItem, removeItem, updateQuantity, clear, getCount, getTotal };
})();
