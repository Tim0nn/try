-- Dragon Toys security hardening
-- Run this in Supabase SQL editor after reviewing each section.

-- Helper: admin role check from public.users
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and lower(coalesce(u.role, '')) = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Helper: purchased product check for reviews
create or replace function public.has_purchased_product(p_user_email text, p_product_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    cross join lateral jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) item
    where lower(coalesce(o.user_email, '')) = lower(coalesce(p_user_email, ''))
      and coalesce(item->>'id', '') = coalesce(p_product_id, '')
  );
$$;

grant execute on function public.has_purchased_product(text, text) to anon, authenticated;

-- Users / roles
alter table if exists public.users enable row level security;

drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin"
on public.users
for select
to authenticated
using (
  auth.uid() = id
  or public.is_admin()
);

drop policy if exists "users_insert_own_or_admin" on public.users;
create policy "users_insert_own_or_admin"
on public.users
for insert
to authenticated
with check (
  auth.uid() = id
  or public.is_admin()
);

drop policy if exists "users_update_own_or_admin" on public.users;
create policy "users_update_own_or_admin"
on public.users
for update
to authenticated
using (
  auth.uid() = id
  or public.is_admin()
)
with check (
  auth.uid() = id
  or public.is_admin()
);

-- Products
alter table if exists public.products enable row level security;

drop policy if exists "products_public_select" on public.products;
create policy "products_public_select"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
on public.products
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
on public.products
for delete
to authenticated
using (public.is_admin());

-- Orders
alter table if exists public.orders enable row level security;

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
on public.orders
for select
to authenticated
using (
  public.is_admin()
  or lower(coalesce(user_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders
for insert
to authenticated
with check (
  lower(coalesce(user_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "orders_update_own_or_admin" on public.orders;
create policy "orders_update_own_or_admin"
on public.orders
for update
to authenticated
using (
  public.is_admin()
  or lower(coalesce(user_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  public.is_admin()
  or lower(coalesce(user_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

-- User carts
alter table if exists public.user_carts enable row level security;

drop policy if exists "user_carts_select_own" on public.user_carts;
create policy "user_carts_select_own"
on public.user_carts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_carts_insert_own" on public.user_carts;
create policy "user_carts_insert_own"
on public.user_carts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_carts_update_own" on public.user_carts;
create policy "user_carts_update_own"
on public.user_carts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_carts_delete_own" on public.user_carts;
create policy "user_carts_delete_own"
on public.user_carts
for delete
to authenticated
using (auth.uid() = user_id);

-- Favorites
create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.user_favorites enable row level security;

drop policy if exists "favorites_select_own" on public.user_favorites;
create policy "favorites_select_own"
on public.user_favorites
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.user_favorites;
create policy "favorites_insert_own"
on public.user_favorites
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.user_favorites;
create policy "favorites_delete_own"
on public.user_favorites
for delete
to authenticated
using (auth.uid() = user_id);

-- Support messages
alter table if exists public.support_messages enable row level security;

drop policy if exists "support_select_own_or_admin" on public.support_messages;
create policy "support_select_own_or_admin"
on public.support_messages
for select
to authenticated
using (
  public.is_admin()
  or lower(coalesce(user_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "support_insert_own" on public.support_messages;
create policy "support_insert_own"
on public.support_messages
for insert
to authenticated
with check (
  lower(coalesce(user_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "support_update_admin" on public.support_messages;
create policy "support_update_admin"
on public.support_messages
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Reviews
create table if not exists public.product_reviews (
  id bigint generated always as identity primary key,
  product_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  user_name text,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.product_reviews enable row level security;

drop policy if exists "reviews_select_approved" on public.product_reviews;
create policy "reviews_select_approved"
on public.product_reviews
for select
to anon, authenticated
using (status = 'approved');

drop policy if exists "reviews_select_own" on public.product_reviews;
create policy "reviews_select_own"
on public.product_reviews
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "reviews_select_admin" on public.product_reviews;
create policy "reviews_select_admin"
on public.product_reviews
for select
to authenticated
using (public.is_admin());

drop policy if exists "reviews_insert_own_purchased" on public.product_reviews;
create policy "reviews_insert_own_purchased"
on public.product_reviews
for insert
to authenticated
with check (
  auth.uid() = user_id
  and lower(coalesce(user_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and status = 'pending'
  and public.has_purchased_product(auth.jwt() ->> 'email', product_id)
);

drop policy if exists "reviews_update_own_pending" on public.product_reviews;
create policy "reviews_update_own_pending"
on public.product_reviews
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and lower(coalesce(user_email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and status = 'pending'
  and public.has_purchased_product(auth.jwt() ->> 'email', product_id)
);

drop policy if exists "reviews_update_admin" on public.product_reviews;
create policy "reviews_update_admin"
on public.product_reviews
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "reviews_delete_admin" on public.product_reviews;
create policy "reviews_delete_admin"
on public.product_reviews
for delete
to authenticated
using (public.is_admin());

-- Optional: realtime cart sync
alter publication supabase_realtime add table public.user_carts;
