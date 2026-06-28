// MissBeybisi — Supabase client & data access layer
// Replaces the static PRODUCTS array and StokTakip's SQLite repositories.
//
// Configuration: set window.SUPABASE_URL and window.SUPABASE_ANON_KEY in a
// <script> block before loading this file, OR update the constants below.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL      = window.SUPABASE_URL      || 'https://yemgdfsrbhijrvkynkby.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWdkZnNyYmhpanJ2a3lua2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODIzODYsImV4cCI6MjA5NzU1ODM4Nn0.pZo1Ua09TdjUfZ8NTZCDNk8TyZ3JURX4ypN_GbLlXr0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Categories ────────────────────────────────────────────────────────────────

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return data;
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function fetchProducts(filters = {}) {
  let q = supabase
    .from('products')
    .select('*')
    .eq('active', true);

  if (filters.category && filters.category !== 'all') q = q.eq('category', filters.category);
  if (filters.ageGroup && filters.ageGroup !== 'all') q = q.eq('age_group', filters.ageGroup);
  if (filters.minPrice != null) q = q.gte('price', filters.minPrice);
  if (filters.maxPrice != null) q = q.lte('price', filters.maxPrice);
  if (filters.featured)         q = q.eq('featured', true);
  if (filters.isNew)            q = q.eq('is_new', true);
  if (filters.search) {
    q = q.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  switch (filters.sortBy) {
    case 'price-asc':  q = q.order('price', { ascending: true });  break;
    case 'price-desc': q = q.order('price', { ascending: false }); break;
    case 'newest':     q = q.order('created_at', { ascending: false }); break;
    default:           q = q.order('created_at', { ascending: false }); break;
  }

  const { data, error } = await q;
  if (error) throw error;

  if (filters.sortBy === 'discount') {
    data.sort((a, b) => {
      const da = a.original_price ? (a.original_price - a.price) / a.original_price : 0;
      const db = b.original_price ? (b.original_price - b.price) / b.original_price : 0;
      return db - da;
    });
  }

  return data;
}

export async function fetchProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchRelatedProducts(product, count = 4) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .neq('id', product.id)
    .or(`category.eq.${product.category},age_group.eq.${product.age_group}`)
    .limit(count);
  if (error) throw error;
  return data;
}

// ── Stock ─────────────────────────────────────────────────────────────────────

export async function fetchStock(productId) {
  const { data, error } = await supabase
    .from('stock')
    .select('*')
    .eq('product_id', productId);
  if (error) throw error;
  return data;
}

export async function fetchStockTotals() {
  const { data, error } = await supabase
    .from('product_stock_totals')
    .select('*');
  if (error) throw error;
  return data;
}

export async function fetchStockByColorSize(productId, color, size) {
  const { data, error } = await supabase
    .from('stock')
    .select('quantity')
    .eq('product_id', productId)
    .eq('color', color)
    .eq('size', size)
    .single();
  if (error) return 0;
  return data?.quantity ?? 0;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function createOrder(orderData, items) {
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();
  if (orderErr) throw orderErr;

  const orderItems = items.map(item => ({ ...item, order_id: order.id }));
  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(orderItems);
  if (itemsErr) throw itemsErr;

  return order;
}

export async function updateOrderPayment(orderId, paymentData) {
  const { error } = await supabase
    .from('orders')
    .update(paymentData)
    .eq('id', orderId);
  if (error) throw error;
}

// ── Admin: Customers ──────────────────────────────────────────────────────────

export async function fetchCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function upsertCustomer(customer) {
  const { data, error } = await supabase
    .from('customers')
    .upsert(customer)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
}

// ── Admin: Suppliers ──────────────────────────────────────────────────────────

export async function fetchSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function upsertSupplier(supplier) {
  const { data, error } = await supabase
    .from('suppliers')
    .upsert(supplier)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSupplier(id) {
  const { error } = await supabase.from('suppliers').delete().eq('id', id);
  if (error) throw error;
}

// ── Admin: Stock ──────────────────────────────────────────────────────────────

export async function fetchAllStock() {
  const { data, error } = await supabase
    .from('stock_summary')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function upsertStock(record) {
  const { data, error } = await supabase
    .from('stock')
    .upsert(record, { onConflict: 'product_id,color,size' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Admin: Sales ──────────────────────────────────────────────────────────────

export async function fetchSales(filters = {}) {
  let q = supabase.from('sales').select('*').order('sell_date', { ascending: false });
  if (filters.customerId) q = q.eq('customer_id', filters.customerId);
  if (filters.from)       q = q.gte('sell_date', filters.from);
  if (filters.to)         q = q.lte('sell_date', filters.to);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function insertSale(sale) {
  const { data, error } = await supabase
    .from('sales')
    .insert(sale)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Admin: Payments ───────────────────────────────────────────────────────────

export async function fetchPayments(filters = {}) {
  let q = supabase.from('payments').select('*, customers(name), suppliers(name)')
    .order('created_at', { ascending: false });
  if (filters.type)       q = q.eq('payment_type', filters.type);
  if (filters.customerId) q = q.eq('customer_id', filters.customerId);
  if (filters.supplierId) q = q.eq('supplier_id', filters.supplierId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function insertPayment(payment) {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePayment(id, fields) {
  const { error } = await supabase.from('payments').update(fields).eq('id', id);
  if (error) throw error;
}

export async function deletePayment(id) {
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) throw error;
}

// ── Admin: Invoices ───────────────────────────────────────────────────────────

export async function fetchInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createInvoice(invoice, items) {
  const { data: inv, error: invErr } = await supabase
    .from('invoices')
    .insert(invoice)
    .select()
    .single();
  if (invErr) throw invErr;

  if (items?.length) {
    const rows = items.map(it => ({ ...it, invoice_id: inv.id }));
    const { error: itErr } = await supabase.from('invoice_items').insert(rows);
    if (itErr) throw itErr;
  }

  return inv;
}

export async function cancelInvoice(id) {
  const { error } = await supabase
    .from('invoices')
    .update({ cancelled: true })
    .eq('id', id);
  if (error) throw error;
}

// ── Admin: Products CRUD ──────────────────────────────────────────────────────

export async function upsertProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .upsert(product)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').update({ active: false }).eq('id', id);
  if (error) throw error;
}
