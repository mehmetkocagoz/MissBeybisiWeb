// MissBeybisi — Checkout flow
// Handles: order summary rendering, customer info form, İyzico payment init,
// bank transfer confirmation, and order creation in Supabase.

import { createOrder, updateOrderPayment } from './supabase.js';

const FREE_SHIPPING_THRESHOLD = 250;

// ── State ─────────────────────────────────────────────────────────────────────

let cart = [];
let customerInfo = {};

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  cart = loadCart();
  if (!cart.length) { window.location.href = 'index.html'; return; }

  renderSummary();
  bindInfoForm();
  bindPaymentToggle();
  bindBackButton();
});

// ── Cart helpers ──────────────────────────────────────────────────────────────

function loadCart() {
  try { return JSON.parse(localStorage.getItem('missbeybisi_cart') || '[]'); }
  catch { return []; }
}

function cartSubtotal() {
  return cart.reduce((s, it) => s + it.price * it.quantity, 0);
}

function shippingCost() {
  return cartSubtotal() >= FREE_SHIPPING_THRESHOLD ? 0 : 39.90;
}

function fmt(n) {
  return '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Order summary rendering ───────────────────────────────────────────────────

function itemImgSrc(image) {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return image;
  return 'photos/' + image.replace(/ /g, '%20');
}

function renderSummary() {
  const container = document.getElementById('summary-items');
  container.innerHTML = cart.map(it => `
    <div class="summary-item">
      <div class="summary-item__img">
        <img src="${itemImgSrc(it.image)}" alt="${it.name}" onerror="this.style.display='none'">
      </div>
      <div class="summary-item__info">
        <p class="summary-item__name">${it.name}</p>
        <p class="summary-item__meta">${it.color} · ${it.size} · ${it.quantity} adet</p>
      </div>
      <p class="summary-item__price">${fmt(it.price * it.quantity)}</p>
    </div>
  `).join('');

  const subtotal = cartSubtotal();
  const shipping = shippingCost();
  document.getElementById('summary-subtotal').textContent = fmt(subtotal);
  document.getElementById('summary-shipping').textContent = shipping === 0 ? 'Ücretsiz' : fmt(shipping);
  document.getElementById('summary-total').textContent    = fmt(subtotal + shipping);
}

// ── Step 1: Customer info form ────────────────────────────────────────────────

function isValidTcKimlikNo(value) {
  if (!/^[1-9][0-9]{10}$/.test(value)) return false;
  const digits = value.split('').map(Number);
  const oddSum  = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = ((oddSum * 7) - evenSum) % 10;
  const digit11 = (digits.slice(0, 10).reduce((s, d) => s + d, 0)) % 10;
  return digit10 === digits[9] && digit11 === digits[10];
}

function bindInfoForm() {
  document.getElementById('info-form').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    customerInfo = Object.fromEntries(fd.entries());

    if (!isValidTcKimlikNo(customerInfo.identityNumber || '')) {
      alert('Lütfen geçerli bir TC Kimlik Numarası girin.');
      return;
    }

    goToPayment();
  });
}

function goToPayment() {
  document.getElementById('step-info').classList.add('hidden');
  document.getElementById('step-pay').classList.remove('hidden');
  document.getElementById('step-pay-label').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  bindIyzicoPayButton();
}

function bindIyzicoPayButton() {
  const btn = document.getElementById('iyzico-pay-btn');
  btn.onclick = () => {
    if (!hasLegalConsent()) return;
    loadIyzicoForm();
  };
}

function bindBackButton() {
  document.getElementById('back-to-info').addEventListener('click', () => {
    document.getElementById('step-pay').classList.add('hidden');
    document.getElementById('step-info').classList.remove('hidden');
    document.getElementById('step-pay-label').classList.remove('active');
  });
}

// ── Step 2: Payment ───────────────────────────────────────────────────────────

function bindPaymentToggle() {
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const method = radio.value;
      document.getElementById('iyzico-checkout-form').classList.toggle('hidden', method !== 'iyzico');
      document.getElementById('iyzico-pay-btn').style.display = method === 'iyzico' ? '' : 'none';
      document.getElementById('bank-transfer-info').classList.toggle('hidden', method !== 'bank_transfer');
      document.getElementById('confirm-bank-btn').style.display = method === 'bank_transfer' ? '' : 'none';
      if (method === 'bank_transfer') bindBankConfirm();
    });
  });
}

function hasLegalConsent() {
  const checked = document.getElementById('legal-consent').checked;
  if (!checked) alert('Lütfen Mesafeli Satış Sözleşmesi ve Cayma Hakkı bilgilendirmesini onaylayın.');
  return checked;
}

// ── İyzico Checkout Form ──────────────────────────────────────────────────────
// Redirects to İyzico's hosted payment page (paymentPageUrl) instead of
// embedding their JS widget — avoids sandbox/live bundle mismatches.
// See: https://docs.iyzico.com/checkout-form/initialize

async function loadIyzicoForm() {
  const container = document.getElementById('iyzico-checkout-form');
  const btn = document.getElementById('iyzico-pay-btn');
  container.innerHTML = '<p class="iyzico-loading">Ödeme sayfasına yönlendiriliyorsunuz...</p>';
  btn.disabled = true;

  try {
    const order = buildOrderPayload('iyzico');

    // 1. Create a pending order in Supabase
    const createdOrder = await createOrder(
      {
        customer_name:    `${customerInfo.firstName} ${customerInfo.lastName}`,
        customer_email:   customerInfo.email,
        customer_phone:   customerInfo.phone,
        shipping_address: customerInfo.address,
        city:             customerInfo.city,
        total_amount:     cartSubtotal() + shippingCost(),
        payment_method:   'iyzico',
        payment_status:   'pending',
        notes:            customerInfo.notes || null,
      },
      buildOrderItems()
    );

    // 2. Call the Supabase Edge Function to get an İyzico Checkout Form token
    const { IYZICO_INIT_URL, SUPABASE_ANON_KEY } = await import('./config.js');
    const res = await fetch(IYZICO_INIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ orderId: createdOrder.id, ...order }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const detail = [errBody.error, errBody.errorCode && `kod: ${errBody.errorCode}`, errBody.usedBaseUrl && `endpoint: ${errBody.usedBaseUrl}`]
        .filter(Boolean).join(' | ');
      throw new Error(detail || `İyzico token alınamadı (HTTP ${res.status})`);
    }
    const { paymentPageUrl } = await res.json();
    if (!paymentPageUrl) throw new Error('İyzico ödeme sayfası adresi alınamadı');

    // 3. Redirect to İyzico's hosted payment page
    localStorage.removeItem('missbeybisi_cart');
    window.location.href = paymentPageUrl;

  } catch (err) {
    container.innerHTML = `<p class="error-msg">Ödeme sayfasına yönlendirilemedi: ${err.message}</p>`;
    btn.disabled = false;
    console.error(err);
  }
}

// ── Bank transfer ─────────────────────────────────────────────────────────────

function bindBankConfirm() {
  const btn = document.getElementById('confirm-bank-btn');
  btn.onclick = async () => {
    if (!hasLegalConsent()) return;
    btn.disabled = true;
    btn.textContent = 'Sipariş oluşturuluyor…';
    try {
      const createdOrder = await createOrder(
        {
          customer_name:    `${customerInfo.firstName} ${customerInfo.lastName}`,
          customer_email:   customerInfo.email,
          customer_phone:   customerInfo.phone,
          shipping_address: customerInfo.address,
          city:             customerInfo.city,
          total_amount:     cartSubtotal() + shippingCost(),
          payment_method:   'bank_transfer',
          payment_status:   'pending',
          notes:            customerInfo.notes || null,
        },
        buildOrderItems()
      );
      localStorage.removeItem('missbeybisi_cart');
      window.location.href = `order-success.html?id=${createdOrder.id}&method=bank`;
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Siparişi Onayla';
      alert('Sipariş oluşturulamadı: ' + err.message);
    }
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildOrderItems() {
  return cart.map(it => ({
    product_id:   it.productId,
    product_name: it.name,
    color:        it.color,
    size:         it.size,
    quantity:     it.quantity,
    unit_price:   it.price,
    total:        it.price * it.quantity,
  }));
}

function normalizePhone(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('90') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 11) return `+90${digits.slice(1)}`;
  if (digits.length === 10) return `+90${digits}`;
  return `+90${digits}`;
}

function buildOrderPayload(method) {
  return {
    customer: {
      name:           `${customerInfo.firstName} ${customerInfo.lastName}`,
      email:           customerInfo.email,
      phone:           normalizePhone(customerInfo.phone),
      identityNumber:  customerInfo.identityNumber,
      address:         customerInfo.address,
      city:            customerInfo.city,
    },
    items: buildOrderItems(),
    subtotal: cartSubtotal(),
    shipping: shippingCost(),
    total:    cartSubtotal() + shippingCost(),
    method,
  };
}
