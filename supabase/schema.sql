-- Bitoll Platform - Supabase starter schema
-- Run this file in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

do $$
begin
  create extension if not exists "vector" with schema extensions;
exception
  when undefined_file or insufficient_privilege then
    raise notice 'pgvector is not available in this Supabase project; embeddings will be skipped.';
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  avatar_url text not null default '',
  customer_type text not null default 'Particular',
  city text not null default '',
  preferred_contact_method text not null default 'WhatsApp',
  status text not null default 'Conta ativa',
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'Particular',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_members (
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (account_id, user_id)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('owner', 'admin', 'operador')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null default '',
  description text not null default '',
  image_key text not null default '',
  features jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  audience jsonb not null default '[]'::jsonb,
  technologies jsonb not null default '[]'::jsonb,
  experience text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.service_products (
  id uuid primary key default gen_random_uuid(),
  service_slug text not null references public.services(slug) on delete cascade,
  structure text not null default 'media',
  name text not null,
  unit text not null default 'Un',
  quantity_label text not null default '',
  estimated_quantity numeric not null default 0,
  unit_price numeric not null default 0,
  source text not null default 'Bitoll',
  brand text not null default '',
  model text not null default '',
  system text not null default '',
  category text not null default '',
  description text not null default '',
  detail text not null default '',
  required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  service_slug text references public.services(slug) on delete set null,
  title text not null,
  short_description text not null default '',
  description text not null default '',
  badge text not null default '',
  image text not null default '',
  discount_label text not null default '',
  discount_amount numeric not null default 0,
  installation_fee numeric not null default 0,
  technologies jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  articles jsonb not null default '[]'::jsonb,
  currency text not null default 'MZN',
  start_date date,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  service_slug text references public.services(slug) on delete set null,
  title text not null,
  status text not null default 'Em andamento',
  progress numeric not null default 0,
  next_step text not null default '',
  started_at date,
  completed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  quote_number text not null unique,
  service_slug text references public.services(slug) on delete set null,
  customer_snapshot jsonb not null default '{}'::jsonb,
  request_payload jsonb not null default '{}'::jsonb,
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  tax numeric not null default 0,
  labor_total numeric not null default 0,
  total numeric not null default 0,
  currency text not null default 'MZN',
  status text not null default 'rascunho',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  name text not null,
  unit text not null default 'Un',
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  title text not null default 'Chat GBS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_documents (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

do $$
begin
  if to_regtype('vector') is not null then
    alter table public.platform_documents
      add column if not exists embedding vector(1536);
  elsif to_regtype('extensions.vector') is not null then
    alter table public.platform_documents
      add column if not exists embedding extensions.vector(1536);
  else
    raise notice 'platform_documents.embedding was not created because pgvector is unavailable.';
  end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.account_members enable row level security;
alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  );
$$;

create or replace function public.get_admin_access()
returns table(role text)
language sql
security definer
set search_path = public
stable
as $$
  select admin_users.role
  from public.admin_users
  where admin_users.user_id = auth.uid()
    and admin_users.active = true
  limit 1;
$$;

alter table public.services add column if not exists image_key text not null default '';
alter table public.services add column if not exists features jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists benefits jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists audience jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists technologies jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists experience text not null default '';
alter table public.services add column if not exists sort_order integer not null default 0;

alter table public.service_products add column if not exists brand text not null default '';
alter table public.service_products add column if not exists model text not null default '';
alter table public.service_products add column if not exists system text not null default '';
alter table public.service_products add column if not exists category text not null default '';
alter table public.service_products add column if not exists description text not null default '';
alter table public.service_products add column if not exists detail text not null default '';
alter table public.service_products add column if not exists required boolean not null default true;

alter table public.promotions add column if not exists slug text;
alter table public.promotions add column if not exists short_description text not null default '';
alter table public.promotions add column if not exists badge text not null default '';
alter table public.promotions add column if not exists image text not null default '';
alter table public.promotions add column if not exists installation_fee numeric not null default 0;
alter table public.promotions add column if not exists technologies jsonb not null default '[]'::jsonb;
alter table public.promotions add column if not exists features jsonb not null default '[]'::jsonb;
alter table public.promotions add column if not exists articles jsonb not null default '[]'::jsonb;

create unique index if not exists promotions_slug_unique
on public.promotions(slug)
where slug is not null;

drop policy if exists "Profiles are visible to their owner" on public.profiles;
create policy "Profiles are visible to their owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Profiles are editable by their owner" on public.profiles;
create policy "Profiles are editable by their owner"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Profiles can be created by their owner" on public.profiles;
create policy "Profiles can be created by their owner"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Accounts are visible to members" on public.accounts;
create policy "Accounts are visible to members"
on public.accounts for select
using (
  exists (
    select 1 from public.account_members
    where account_members.account_id = accounts.id
      and account_members.user_id = auth.uid()
  )
);

drop policy if exists "Account members are visible to members" on public.account_members;
create policy "Account members are visible to members"
on public.account_members for select
using (
  exists (
    select 1 from public.account_members viewer
    where viewer.account_id = account_members.account_id
      and viewer.user_id = auth.uid()
  )
);

drop policy if exists "Admins can view themselves" on public.admin_users;
create policy "Admins can view themselves"
on public.admin_users for select
using (user_id = auth.uid() and active = true);

drop policy if exists "Admins can view admin users" on public.admin_users;
create policy "Admins can view admin users"
on public.admin_users for select
using (public.is_admin());

drop policy if exists "Projects are visible to account members" on public.projects;
create policy "Projects are visible to account members"
on public.projects for select
using (
  exists (
    select 1 from public.account_members
    where account_members.account_id = projects.account_id
      and account_members.user_id = auth.uid()
  )
);

drop policy if exists "Quotes are visible to account members" on public.quotes;
create policy "Quotes are visible to account members"
on public.quotes for select
using (
  profile_id = auth.uid()
  or account_id is null
  or exists (
    select 1 from public.account_members
    where account_members.account_id = quotes.account_id
      and account_members.user_id = auth.uid()
  )
);

drop policy if exists "Quotes can be created by their owner" on public.quotes;
create policy "Quotes can be created by their owner"
on public.quotes for insert
with check (profile_id = auth.uid());

drop policy if exists "Quote items are visible through their quote" on public.quote_items;
create policy "Quote items are visible through their quote"
on public.quote_items for select
using (
  exists (
    select 1
    from public.quotes
    left join public.account_members
      on account_members.account_id = quotes.account_id
    where quotes.id = quote_items.quote_id
      and (
        quotes.profile_id = auth.uid()
        or quotes.account_id is null
        or account_members.user_id = auth.uid()
      )
  )
);

drop policy if exists "Quote items can be created by quote owner" on public.quote_items;
create policy "Quote items can be created by quote owner"
on public.quote_items for insert
with check (
  exists (
    select 1
    from public.quotes
    where quotes.id = quote_items.quote_id
      and quotes.profile_id = auth.uid()
  )
);

drop policy if exists "Chat threads are visible to owners" on public.chat_threads;
create policy "Chat threads are visible to owners"
on public.chat_threads for select
using (profile_id = auth.uid());

drop policy if exists "Chat messages are visible through their thread" on public.chat_messages;
create policy "Chat messages are visible through their thread"
on public.chat_messages for select
using (
  exists (
    select 1 from public.chat_threads
    where chat_threads.id = chat_messages.thread_id
      and chat_threads.profile_id = auth.uid()
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    phone,
    avatar_url,
    customer_type,
    city,
    preferred_contact_method,
    verified
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.raw_user_meta_data->>'customer_type', 'Particular'),
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'preferred_contact_method', 'WhatsApp'),
    coalesce(new.email_confirmed_at is not null, false)
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
