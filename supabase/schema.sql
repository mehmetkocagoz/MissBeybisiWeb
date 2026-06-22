-- MissBeybisi — Supabase / PostgreSQL Schema
-- Run this in the Supabase SQL editor to initialize the database.

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Products ──────────────────────────────────────────────────────────────────
create table if not exists products (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text unique not null,
  price         numeric(10,2) not null,
  original_price numeric(10,2),
  category      text not null check (category in ('ozel-gun','gunluk')),
  age_group     text not null check (age_group in ('0-2-yas','2-4-yas','4-8-yas')),
  colors        text[] not null default '{}',
  sizes         text[] not null default '{}',
  images        text[] not null default '{}',
  description   text,
  featured      boolean not null default false,
  is_new        boolean not null default false,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ── Stock (per product + color + size) ────────────────────────────────────────
create table if not exists stock (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references products(id) on delete cascade,
  color       text not null,
  size        text not null,
  quantity    integer not null default 0 check (quantity >= 0),
  unique (product_id, color, size)
);

-- ── Customers ─────────────────────────────────────────────────────────────────
create table if not exists customers (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  email         text unique,
  phone         text,
  address       text,
  city          text,
  created_at    timestamptz not null default now()
);

-- ── Suppliers ─────────────────────────────────────────────────────────────────
create table if not exists suppliers (
  id            uuid primary key default uuid_generate_v4(),
  name          text unique not null,
  contact_name  text,
  phone         text,
  address       text,
  created_at    timestamptz not null default now()
);

-- ── Orders (online customer orders) ───────────────────────────────────────────
create table if not exists orders (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid references customers(id),
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text,
  shipping_address text not null,
  city            text not null,
  total_amount    numeric(10,2) not null,
  status          text not null default 'pending'
                    check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  payment_method  text not null default 'iyzico'
                    check (payment_method in ('iyzico','bank_transfer','cash_on_delivery')),
  payment_status  text not null default 'pending'
                    check (payment_status in ('pending','paid','failed','refunded')),
  iyzico_token    text,
  iyzico_payment_id text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Order Items ───────────────────────────────────────────────────────────────
create table if not exists order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  uuid not null references products(id),
  product_name text not null,
  color       text not null,
  size        text not null,
  quantity    integer not null check (quantity > 0),
  unit_price  numeric(10,2) not null,
  total       numeric(10,2) not null
);

-- ── Sales (manual sales from admin panel, mirrors StokTakip) ──────────────────
create table if not exists sales (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references products(id),
  product_name  text not null,
  color         text not null,
  size          text,
  quantity      integer not null check (quantity > 0),
  unit_price    numeric(10,2) not null,
  discount      numeric(10,2) not null default 0,
  total         numeric(10,2) not null,
  customer_id   uuid references customers(id),
  customer_name text not null,
  seller        text,
  order_id      uuid references orders(id),
  invoice_id    uuid,
  sell_date     date not null default current_date,
  created_at    timestamptz not null default now()
);

-- ── Payments ──────────────────────────────────────────────────────────────────
create table if not exists payments (
  id              uuid primary key default uuid_generate_v4(),
  payment_type    text not null check (payment_type in ('RECEIVEPAYMENT','MAKEPAYMENT','PURCHASE')),
  amount          numeric(10,2) not null,
  currency        text not null default 'TRY' check (currency in ('TRY','EUR','USD')),
  customer_id     uuid references customers(id),
  supplier_id     uuid references suppliers(id),
  order_id        uuid references orders(id),
  description     text,
  payment_method  text not null default 'CASH'
                    check (payment_method in ('CASH','BANK_TRANSFER','IYZICO','PROMISSORY_NOTE')),
  due_date        date,
  created_at      timestamptz not null default now()
);

-- ── Invoices ──────────────────────────────────────────────────────────────────
create table if not exists invoices (
  id               uuid primary key default uuid_generate_v4(),
  invoice_no       text unique not null,
  customer_id      uuid references customers(id),
  customer_name    text not null,
  customer_address text,
  tc_vd            text,
  issue_date       date not null default current_date,
  ship_date        date,
  delivery_by      text,
  delivery_to      text,
  grand_total      numeric(10,2) not null default 0,
  cancelled        boolean not null default false,
  created_at       timestamptz not null default now()
);

create table if not exists invoice_items (
  id           uuid primary key default uuid_generate_v4(),
  invoice_id   uuid not null references invoices(id) on delete cascade,
  product_id   uuid references products(id),
  product_name text not null,
  color        text,
  size         text,
  quantity     integer not null,
  unit_price   numeric(10,2) not null,
  total        numeric(10,2) not null
);

create table if not exists invoice_returns (
  id            uuid primary key default uuid_generate_v4(),
  invoice_id    uuid not null references invoices(id),
  product_id    uuid references products(id),
  product_name  text not null,
  color         text,
  returned_qty  integer not null,
  unit_price    numeric(10,2) not null,
  return_total  numeric(10,2) not null,
  created_at    timestamptz not null default now()
);

-- ── Add invoice_id FK to sales after invoices table exists ────────────────────
alter table sales
  add constraint sales_invoice_fk
  foreign key (invoice_id) references invoices(id);

-- ── Row-Level Security ────────────────────────────────────────────────────────
-- Public (anon) can only read active products and stock.
alter table products enable row level security;
alter table stock    enable row level security;
alter table customers enable row level security;
alter table orders   enable row level security;
alter table order_items enable row level security;
alter table sales    enable row level security;
alter table payments enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table invoice_returns enable row level security;
alter table suppliers enable row level security;

-- Products: public read of active products
create policy "public read products"  on products for select using (active = true);
create policy "admin all products"    on products for all  using (auth.role() = 'authenticated');

-- Stock: public read
create policy "public read stock"     on stock for select using (true);
create policy "admin all stock"       on stock for all    using (auth.role() = 'authenticated');

-- Orders: customer can insert their own order; admin can read all
create policy "insert own order"      on orders for insert with check (true);
create policy "read own order"        on orders for select using (
  auth.role() = 'authenticated' or customer_email = current_setting('app.customer_email', true)
);
create policy "admin all orders"      on orders for all   using (auth.role() = 'authenticated');

create policy "insert order items"    on order_items for insert with check (true);
create policy "admin all order_items" on order_items for all using (auth.role() = 'authenticated');

-- Admin-only tables
create policy "admin all customers"   on customers   for all using (auth.role() = 'authenticated');
create policy "admin all sales"       on sales       for all using (auth.role() = 'authenticated');
create policy "admin all payments"    on payments    for all using (auth.role() = 'authenticated');
create policy "admin all invoices"    on invoices    for all using (auth.role() = 'authenticated');
create policy "admin all inv_items"   on invoice_items for all using (auth.role() = 'authenticated');
create policy "admin all inv_returns" on invoice_returns for all using (auth.role() = 'authenticated');
create policy "admin all suppliers"   on suppliers   for all using (auth.role() = 'authenticated');

-- ── Helper function: auto-update updated_at ───────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger orders_updated_at
  before update on orders
  for each row execute procedure set_updated_at();

-- ── Storage bucket for product images ─────────────────────────────────────────
-- Create a public bucket so uploaded product photos can be served directly.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "admin upload product-images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "admin delete product-images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ── Useful views ──────────────────────────────────────────────────────────────
create or replace view stock_summary as
select
  p.id as product_id,
  p.name,
  p.slug,
  p.category,
  p.age_group,
  p.price,
  s.color,
  s.size,
  s.quantity
from products p
join stock s on s.product_id = p.id
where p.active = true;

-- One row per product with total stock across all color/size variants.
-- Used by the storefront to show "Stokta Yok" when a product has zero stock.
create or replace view product_stock_totals as
select
  p.id as product_id,
  coalesce(sum(s.quantity), 0) as total_quantity
from products p
left join stock s on s.product_id = p.id
group by p.id;

grant select on stock_summary to anon, authenticated;
grant select on product_stock_totals to anon, authenticated;
