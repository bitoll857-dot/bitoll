-- Bitoll Platform - base de dados da Bitoll starter schema
-- Run this file in the base de dados da Bitoll SQL editor after creating the project.

create extension if not exists "pgcrypto" with schema extensions;

do $$
begin
  create extension if not exists "vector" with schema extensions;
exception
  when undefined_file or insufficient_privilege then
    raise notice 'pgvector is not available in this base de dados da Bitoll project; embeddings will be skipped.';
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
  must_change_password boolean not null default false,
  temporary_password_set_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists must_change_password boolean not null default false;
alter table public.profiles add column if not exists temporary_password_set_at timestamptz;

create unique index if not exists profiles_phone_unique
on public.profiles (phone)
where phone <> '';

drop index if exists public.profiles_email_unique;

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
  user_id uuid primary key references public.profiles(id) on delete cascade,
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
  image_url text not null default '',
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
  short_name text not null default '',
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
  image_url text not null default '',
  required boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.service_structure_options (
  id uuid primary key default gen_random_uuid(),
  service_slug text not null references public.services(slug) on delete cascade,
  structure text not null default 'basica',
  title text not null,
  description text not null default '',
  image_url text not null default '',
  steps jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  structure_cost_percentage numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(service_slug, structure)
);

create table if not exists public.service_quote_templates (
  id uuid primary key default gen_random_uuid(),
  service_slug text not null references public.services(slug) on delete cascade,
  title text not null,
  structure text not null default 'basica',
  currency text not null default 'MZN',
  labor_unit_price numeric not null default 0,
  labor_quantity_field_key text not null default '',
  labor_product_id uuid references public.service_products(id) on delete set null,
  structure_cost_percentage numeric not null default 0,
  notes text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_quote_template_fields (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.service_quote_templates(id) on delete cascade,
  field_key text not null,
  label text not null,
  input_type text not null default 'number' check (input_type in ('number', 'text', 'select')),
  required boolean not null default true,
  sort_order integer not null default 0,
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(template_id, field_key)
);

create table if not exists public.service_quote_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.service_quote_templates(id) on delete cascade,
  product_id uuid references public.service_products(id) on delete set null,
  name text not null,
  unit text not null default 'Un',
  default_quantity integer not null default 1,
  unit_price numeric not null default 0,
  quantity_field_key text not null default '',
  client_quantity_editable boolean not null default false,
  required boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.service_quote_template_item_rules (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.service_quote_templates(id) on delete cascade,
  source_product_id uuid references public.service_products(id) on delete cascade,
  target_product_id uuid references public.service_products(id) on delete cascade,
  multiplier numeric not null default 1,
  divisor numeric not null default 1,
  formula_steps jsonb not null default '[]'::jsonb,
  min_quantity integer not null default 1,
  rounding text not null default 'ceil' check (rounding in ('ceil', 'floor', 'round')),
  created_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  service_slug text references public.services(slug) on delete set null,
  quote_template_id uuid references public.service_quote_templates(id) on delete set null,
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

create table if not exists public.search_entries (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'service' check (type in ('service', 'promotion', 'request', 'product')),
  title text not null,
  description text not null default '',
  category text not null default '',
  status text not null default '',
  price numeric,
  related_service text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.search_sources (
  id text primary key,
  source_key text not null unique check (source_key in ('services', 'products', 'promotions', 'requests')),
  label text not null,
  description text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  progress numeric,
  next_step text not null default '',
  technician text not null default '',
  technician_id uuid references public.profiles(id) on delete set null,
  estimated_completion date,
  updates jsonb not null default '[]'::jsonb,
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

create table if not exists public.custom_quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  profile_id uuid references public.profiles(id) on delete set null,
  customer_name text not null default '',
  customer_contact text not null default '',
  customer_address text not null default '',
  customer_nuit text not null default '',
  customer_type text not null default 'Cliente temporario',
  service_slug text references public.services(slug) on delete set null,
  structure text,
  source_quote_template_id uuid references public.service_quote_templates(id) on delete set null,
  subtotal numeric not null default 0,
  total numeric not null default 0,
  currency text not null default 'MZN',
  status text not null default 'rascunho',
  notes text not null default '',
  commitment_terms text not null default '',
  selected_items jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_quote_items (
  id uuid primary key default gen_random_uuid(),
  custom_quote_id uuid not null references public.custom_quotes(id) on delete cascade,
  product_id uuid references public.service_products(id) on delete set null,
  name text not null,
  category text not null default 'Produto',
  service_slug text,
  structure text not null default '',
  unit text not null default 'Un',
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  total numeric not null default 0,
  image_url text not null default '',
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

create table if not exists public.photo_prompt_accounts (
  id uuid primary key default gen_random_uuid(),
  whatsapp text not null unique,
  password_hash text not null,
  recovery_code_hash text,
  recovery_requested_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photo_prompt_requests (
  id uuid primary key default gen_random_uuid(),
  whatsapp text not null references public.photo_prompt_accounts(whatsapp) on delete cascade,
  status text not null default 'pendente',
  photo_type text not null default '',
  objective text not null default '',
  form_payload jsonb not null default '{}'::jsonb,
  prompt text not null default '',
  image_name text not null default '',
  image_url text not null default '',
  admin_response text not null default '',
  edited_image_url text not null default '',
  coins_charged integer not null default 0,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photo_prompt_wallet_transfers (
  id uuid primary key default gen_random_uuid(),
  whatsapp text not null references public.photo_prompt_accounts(whatsapp) on delete cascade,
  method text not null check (method in ('E-Mola', 'mKesh', 'M-Pesa')),
  transfer_reference text not null,
  amount numeric not null default 0,
  coins integer not null default 0,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'retido')),
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  alter table public.photo_prompt_wallet_transfers
    drop constraint if exists photo_prompt_wallet_transfers_method_check;

  alter table public.photo_prompt_wallet_transfers
    add constraint photo_prompt_wallet_transfers_method_check
    check (method in ('E-Mola', 'mKesh', 'M-Pesa'));

  update public.photo_prompt_wallet_transfers
  set status = 'retido'
  where status = 'recusado';

  alter table public.photo_prompt_wallet_transfers
    drop constraint if exists photo_prompt_wallet_transfers_status_check;

  alter table public.photo_prompt_wallet_transfers
    add constraint photo_prompt_wallet_transfers_status_check
    check (status in ('pendente', 'aprovado', 'retido'));

  alter table public.photo_prompt_wallet_transfers
    alter column status set default 'pendente';
end;
$$;

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
alter table public.services enable row level security;
alter table public.service_products enable row level security;
alter table public.service_structure_options enable row level security;
alter table public.service_quote_templates enable row level security;
alter table public.service_quote_template_fields enable row level security;
alter table public.service_quote_template_items enable row level security;
alter table public.service_quote_template_item_rules enable row level security;
alter table public.promotions enable row level security;
alter table public.search_entries enable row level security;
alter table public.search_sources enable row level security;
alter table public.projects enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.custom_quotes enable row level security;
alter table public.custom_quote_items enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.photo_prompt_accounts enable row level security;
alter table public.photo_prompt_requests enable row level security;
alter table public.photo_prompt_wallet_transfers enable row level security;

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

create or replace function public.current_admin_role()
returns text
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

create or replace function public.can_manage_content()
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
      and admin_users.role in ('owner', 'admin')
  );
$$;

create or replace function public.normalize_whatsapp(whatsapp_input text)
returns text
language plpgsql
immutable
as $$
declare
  cleaned_input text := regexp_replace(coalesce(whatsapp_input, ''), '[^0-9+]', '', 'g');
  digits_only text := regexp_replace(coalesce(whatsapp_input, ''), '[^0-9]', '', 'g');
begin
  if cleaned_input = '' then
    return '';
  end if;

  if left(cleaned_input, 1) = '+' then
    return '+' || regexp_replace(cleaned_input, '[^0-9]', '', 'g');
  end if;

  if left(digits_only, 2) = '00' then
    return '+' || substring(digits_only from 3);
  end if;

  if left(digits_only, 3) = '258' then
    return '+' || digits_only;
  end if;

  return '+258' || regexp_replace(digits_only, '^0+', '');
end;
$$;

create or replace function public.create_photo_prompt_account(
  whatsapp_input text,
  password_input text
)
returns table(whatsapp text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  normalized_whatsapp text := public.normalize_whatsapp(whatsapp_input);
begin
  if length(normalized_whatsapp) < 8 then
    raise exception 'Numero de WhatsApp invalido.';
  end if;

  if length(coalesce(password_input, '')) < 4 then
    raise exception 'A senha deve ter pelo menos 4 caracteres.';
  end if;

  insert into public.photo_prompt_accounts (
    whatsapp,
    password_hash,
    created_by
  )
  values (
    normalized_whatsapp,
    crypt(password_input, gen_salt('bf')),
    auth.uid()
  )
  on conflict on constraint photo_prompt_accounts_whatsapp_key do update set
    password_hash = excluded.password_hash,
    created_by = coalesce(public.photo_prompt_accounts.created_by, auth.uid()),
    updated_at = now();

  return query select normalized_whatsapp;
end;
$$;

create or replace function public.login_photo_prompt_account(
  whatsapp_input text,
  password_input text
)
returns table(whatsapp text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  normalized_whatsapp text := public.normalize_whatsapp(whatsapp_input);
begin
  return query
  select accounts.whatsapp
  from public.photo_prompt_accounts as accounts
  where accounts.whatsapp = normalized_whatsapp
    and accounts.password_hash = crypt(password_input, accounts.password_hash)
  limit 1;
end;
$$;

create or replace function public.request_photo_prompt_recovery(
  whatsapp_input text,
  recovery_code_input text
)
returns table(whatsapp text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  normalized_whatsapp text := public.normalize_whatsapp(whatsapp_input);
begin
  update public.photo_prompt_accounts
  set
    recovery_code_hash = crypt(recovery_code_input, gen_salt('bf')),
    recovery_requested_at = now(),
    updated_at = now()
  where photo_prompt_accounts.whatsapp = normalized_whatsapp;

  return query
  select accounts.whatsapp
  from public.photo_prompt_accounts as accounts
  where accounts.whatsapp = normalized_whatsapp
  limit 1;
end;
$$;

create or replace function public.reset_photo_prompt_password(
  whatsapp_input text,
  recovery_code_input text,
  password_input text
)
returns table(whatsapp text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  normalized_whatsapp text := public.normalize_whatsapp(whatsapp_input);
begin
  if length(coalesce(password_input, '')) < 4 then
    raise exception 'A senha deve ter pelo menos 4 caracteres.';
  end if;

  update public.photo_prompt_accounts
  set
    password_hash = crypt(password_input, gen_salt('bf')),
    recovery_code_hash = null,
    recovery_requested_at = null,
    updated_at = now()
  where photo_prompt_accounts.whatsapp = normalized_whatsapp
    and photo_prompt_accounts.recovery_code_hash is not null
    and photo_prompt_accounts.recovery_code_hash = crypt(
      recovery_code_input,
      photo_prompt_accounts.recovery_code_hash
    )
    and photo_prompt_accounts.recovery_requested_at > now() - interval '15 minutes';

  return query
  select accounts.whatsapp
  from public.photo_prompt_accounts as accounts
  where accounts.whatsapp = normalized_whatsapp
    and accounts.recovery_code_hash is null
  limit 1;
end;
$$;

create or replace function public.change_photo_prompt_password(
  whatsapp_input text,
  current_password_input text,
  new_password_input text
)
returns table(whatsapp text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  normalized_whatsapp text := public.normalize_whatsapp(whatsapp_input);
begin
  if length(coalesce(new_password_input, '')) < 4 then
    raise exception 'A senha deve ter pelo menos 4 caracteres.';
  end if;

  update public.photo_prompt_accounts
  set
    password_hash = crypt(new_password_input, gen_salt('bf')),
    updated_at = now()
  where photo_prompt_accounts.whatsapp = normalized_whatsapp
    and photo_prompt_accounts.password_hash = crypt(
      current_password_input,
      photo_prompt_accounts.password_hash
    );

  return query
  select accounts.whatsapp
  from public.photo_prompt_accounts as accounts
  where accounts.whatsapp = normalized_whatsapp
    and accounts.password_hash = crypt(new_password_input, accounts.password_hash)
  limit 1;
end;
$$;

drop function if exists public.create_photo_prompt_request(text, jsonb, text, text, text);
drop function if exists public.create_photo_prompt_request(text, jsonb, text, text, text, integer);

create or replace function public.create_photo_prompt_request(
  whatsapp_input text,
  password_input text,
  form_payload_input jsonb,
  prompt_input text,
  image_name_input text default '',
  image_url_input text default '',
  coins_charged_input integer default 0
)
returns table(id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_whatsapp text := public.normalize_whatsapp(whatsapp_input);
  created_request_id uuid;
  requested_coins integer := greatest(coalesce(coins_charged_input, 0), 0);
  active_coins integer := 0;
  spent_coins integer := 0;
begin
  if not exists (
    select 1
    from public.photo_prompt_accounts as accounts
    where accounts.whatsapp = normalized_whatsapp
      and accounts.password_hash = crypt(password_input, accounts.password_hash)
  ) then
    raise exception 'Acesso invalido.';
  end if;

  select coalesce(sum(transfers.coins), 0)::integer
  into active_coins
  from public.photo_prompt_wallet_transfers as transfers
  where transfers.whatsapp = normalized_whatsapp
    and transfers.status in ('aprovado', 'pendente');

  select coalesce(sum(requests.coins_charged), 0)::integer
  into spent_coins
  from public.photo_prompt_requests as requests
  where requests.whatsapp = normalized_whatsapp;

  if (active_coins - spent_coins) < 100 then
    raise exception 'Precisa de pelo menos 100 moedas para iniciar um pedido.';
  end if;

  if requested_coins > (active_coins - spent_coins) then
    raise exception 'Moedas insuficientes para este pedido.';
  end if;

  insert into public.photo_prompt_requests (
    whatsapp,
    status,
    photo_type,
    objective,
    form_payload,
    prompt,
    image_name,
    image_url,
    coins_charged
  )
  values (
    normalized_whatsapp,
    'pendente',
    coalesce(form_payload_input->>'photoType', ''),
    coalesce(form_payload_input->>'objective', ''),
    coalesce(form_payload_input, '{}'::jsonb),
    coalesce(prompt_input, ''),
    coalesce(image_name_input, ''),
    coalesce(image_url_input, ''),
    requested_coins
  )
  returning photo_prompt_requests.id into created_request_id;

  return query
  select created_request_id, 'pendente'::text;
end;
$$;

create or replace function public.list_photo_prompt_requests(
  whatsapp_input text,
  password_input text
)
returns table(
  id uuid,
  whatsapp text,
  status text,
  photo_type text,
  objective text,
  image_name text,
  admin_response text,
  edited_image_url text,
  coins_charged integer,
  created_at timestamptz,
  responded_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  normalized_whatsapp text := public.normalize_whatsapp(whatsapp_input);
begin
  if not exists (
    select 1
    from public.photo_prompt_accounts as accounts
    where accounts.whatsapp = normalized_whatsapp
      and accounts.password_hash = crypt(password_input, accounts.password_hash)
  ) then
    raise exception 'Acesso invalido.';
  end if;

  return query
  select
    requests.id,
    requests.whatsapp,
    requests.status,
    requests.photo_type,
    requests.objective,
    requests.image_name,
    requests.admin_response,
    requests.edited_image_url,
    requests.coins_charged,
    requests.created_at,
    requests.responded_at
  from public.photo_prompt_requests as requests
  where requests.whatsapp = normalized_whatsapp
  order by requests.created_at desc
  limit 100;
end;
$$;

create or replace function public.create_photo_prompt_wallet_transfer(
  whatsapp_input text,
  password_input text,
  method_input text,
  transfer_reference_input text,
  amount_input numeric,
  coins_input integer
)
returns table(id uuid, status text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  normalized_whatsapp text := public.normalize_whatsapp(whatsapp_input);
  calculated_coins integer := floor(greatest(coalesce(amount_input, 0), 0) / 0.1)::integer;
  created_transfer_id uuid;
  local_number text;
  wallet_prefix text;
  detected_method text;
begin
  if not exists (
    select 1
    from public.photo_prompt_accounts as accounts
    where accounts.whatsapp = normalized_whatsapp
      and accounts.password_hash = crypt(password_input, accounts.password_hash)
  ) then
    raise exception 'Acesso invalido.';
  end if;

  if left(normalized_whatsapp, 4) <> '+258' then
    raise exception 'Nao e possivel efectuar a operacao com prefixo estrangeiro. Contacte pelo WhatsApp o admin 00258866136316.';
  end if;

  local_number := regexp_replace(substring(normalized_whatsapp from 5), '^0+', '');
  wallet_prefix := left(local_number, 2);

  if wallet_prefix in ('86', '87', '88') then
    detected_method := 'E-Mola';
  elsif wallet_prefix in ('82', '83') then
    detected_method := 'mKesh';
  elsif wallet_prefix in ('84', '85') then
    detected_method := 'M-Pesa';
  else
    raise exception 'Nao foi possivel reconhecer a carteira pelo prefixo %. Contacte pelo WhatsApp o admin 00258866136316.', wallet_prefix;
  end if;

  if length(trim(coalesce(transfer_reference_input, ''))) < 4 then
    raise exception 'ID da transferencia invalido.';
  end if;

  if greatest(coalesce(amount_input, 0), 0) <= 0 or calculated_coins <= 0 then
    raise exception 'Valor transferido invalido.';
  end if;

  insert into public.photo_prompt_wallet_transfers (
    whatsapp,
    method,
    transfer_reference,
    amount,
    coins,
    status
  )
  values (
    normalized_whatsapp,
    detected_method,
    trim(transfer_reference_input),
    greatest(coalesce(amount_input, 0), 0),
    calculated_coins,
    'pendente'
  )
  returning photo_prompt_wallet_transfers.id into created_transfer_id;

  return query select created_transfer_id, 'pendente'::text;
end;
$$;

create or replace function public.list_photo_prompt_wallet_transfers(
  whatsapp_input text,
  password_input text
)
returns table(
  id uuid,
  whatsapp text,
  method text,
  transfer_reference text,
  amount numeric,
  coins integer,
  status text,
  admin_note text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  normalized_whatsapp text := public.normalize_whatsapp(whatsapp_input);
begin
  if not exists (
    select 1
    from public.photo_prompt_accounts as accounts
    where accounts.whatsapp = normalized_whatsapp
      and accounts.password_hash = crypt(password_input, accounts.password_hash)
  ) then
    raise exception 'Acesso invalido.';
  end if;

  return query
  select
    transfers.id,
    transfers.whatsapp,
    transfers.method,
    transfers.transfer_reference,
    transfers.amount,
    transfers.coins,
    transfers.status,
    transfers.admin_note,
    transfers.created_at,
    transfers.updated_at
  from public.photo_prompt_wallet_transfers as transfers
  where transfers.whatsapp = normalized_whatsapp
  order by transfers.created_at desc
  limit 100;
end;
$$;

grant execute on function public.create_photo_prompt_account(text, text) to anon, authenticated;
grant execute on function public.login_photo_prompt_account(text, text) to anon, authenticated;
grant execute on function public.request_photo_prompt_recovery(text, text) to anon, authenticated;
grant execute on function public.reset_photo_prompt_password(text, text, text) to anon, authenticated;
grant execute on function public.change_photo_prompt_password(text, text, text) to anon, authenticated;
grant execute on function public.create_photo_prompt_request(text, text, jsonb, text, text, text, integer) to anon, authenticated;
grant execute on function public.list_photo_prompt_requests(text, text) to anon, authenticated;
grant execute on function public.create_photo_prompt_wallet_transfer(text, text, text, text, numeric, integer) to anon, authenticated;
grant execute on function public.list_photo_prompt_wallet_transfers(text, text) to anon, authenticated;

drop policy if exists "Admins can view photo prompt accounts" on public.photo_prompt_accounts;
create policy "Admins can view photo prompt accounts"
on public.photo_prompt_accounts for select
using (public.is_admin());

drop policy if exists "Admins can view photo prompt requests" on public.photo_prompt_requests;
create policy "Admins can view photo prompt requests"
on public.photo_prompt_requests for select
using (public.is_admin());

drop policy if exists "Admins can update photo prompt requests" on public.photo_prompt_requests;
create policy "Admins can update photo prompt requests"
on public.photo_prompt_requests for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can view photo prompt wallet transfers" on public.photo_prompt_wallet_transfers;
create policy "Admins can view photo prompt wallet transfers"
on public.photo_prompt_wallet_transfers for select
using (public.is_admin());

drop policy if exists "Admins can update photo prompt wallet transfers" on public.photo_prompt_wallet_transfers;
create policy "Admins can update photo prompt wallet transfers"
on public.photo_prompt_wallet_transfers for update
using (public.is_admin())
with check (public.is_admin());

alter table public.services add column if not exists image_key text not null default '';
alter table public.services add column if not exists image_url text not null default '';
alter table public.services add column if not exists features jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists benefits jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists audience jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists technologies jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists experience text not null default '';
alter table public.services add column if not exists sort_order integer not null default 0;

alter table public.service_products add column if not exists brand text not null default '';
alter table public.service_products add column if not exists short_name text not null default '';
alter table public.service_products add column if not exists model text not null default '';
alter table public.service_products add column if not exists system text not null default '';
alter table public.service_products add column if not exists category text not null default '';
alter table public.service_products add column if not exists description text not null default '';
alter table public.service_products add column if not exists detail text not null default '';
alter table public.service_products add column if not exists image_url text not null default '';
alter table public.service_products add column if not exists required boolean not null default true;
alter table public.service_products add column if not exists active boolean not null default true;

alter table public.service_structure_options add column if not exists title text not null default '';
alter table public.service_structure_options add column if not exists description text not null default '';
alter table public.service_structure_options add column if not exists image_url text not null default '';
alter table public.service_structure_options add column if not exists steps jsonb not null default '[]'::jsonb;
alter table public.service_structure_options add column if not exists sort_order integer not null default 0;
alter table public.service_structure_options add column if not exists structure_cost_percentage numeric not null default 0;
alter table public.service_structure_options add column if not exists active boolean not null default true;
alter table public.service_structure_options add column if not exists updated_at timestamptz not null default now();

alter table public.service_quote_template_items add column if not exists client_quantity_editable boolean not null default false;
alter table public.service_quote_template_items add column if not exists default_quantity integer not null default 1;
alter table public.service_quote_template_item_rules add column if not exists multiplier numeric not null default 1;
alter table public.service_quote_template_item_rules add column if not exists divisor numeric not null default 1;
alter table public.service_quote_template_item_rules add column if not exists formula_steps jsonb not null default '[]'::jsonb;
alter table public.service_quote_template_item_rules add column if not exists min_quantity integer not null default 1;
alter table public.service_quote_template_item_rules add column if not exists rounding text not null default 'ceil' check (rounding in ('ceil', 'floor', 'round'));

alter table public.service_quote_templates add column if not exists notes text not null default '';
alter table public.service_quote_templates add column if not exists labor_unit_price numeric not null default 0;
alter table public.service_quote_templates add column if not exists labor_quantity_field_key text not null default '';
alter table public.service_quote_templates add column if not exists labor_product_id uuid references public.service_products(id) on delete set null;
alter table public.service_quote_templates add column if not exists structure_cost_percentage numeric not null default 0;
alter table public.service_quote_templates add column if not exists updated_at timestamptz not null default now();

alter table public.promotions add column if not exists slug text;
alter table public.promotions add column if not exists quote_template_id uuid references public.service_quote_templates(id) on delete set null;
alter table public.promotions add column if not exists short_description text not null default '';
alter table public.promotions add column if not exists badge text not null default '';
alter table public.promotions add column if not exists image text not null default '';
alter table public.promotions add column if not exists installation_fee numeric not null default 0;
alter table public.promotions add column if not exists technologies jsonb not null default '[]'::jsonb;
alter table public.promotions add column if not exists features jsonb not null default '[]'::jsonb;
alter table public.promotions add column if not exists articles jsonb not null default '[]'::jsonb;

alter table public.search_entries add column if not exists description text not null default '';
alter table public.search_entries add column if not exists category text not null default '';
alter table public.search_entries add column if not exists status text not null default '';
alter table public.search_entries add column if not exists price numeric;
alter table public.search_entries add column if not exists related_service text not null default '';
alter table public.search_entries add column if not exists sort_order integer not null default 0;
alter table public.search_entries add column if not exists active boolean not null default true;
alter table public.search_entries add column if not exists updated_at timestamptz not null default now();

alter table public.search_sources add column if not exists description text not null default '';
alter table public.search_sources add column if not exists sort_order integer not null default 0;
alter table public.search_sources add column if not exists active boolean not null default true;
alter table public.search_sources add column if not exists updated_at timestamptz not null default now();

alter table public.photo_prompt_requests add column if not exists admin_response text not null default '';
alter table public.photo_prompt_requests add column if not exists edited_image_url text not null default '';
alter table public.photo_prompt_requests add column if not exists coins_charged integer not null default 0;
alter table public.photo_prompt_requests add column if not exists responded_at timestamptz;

alter table public.quotes add column if not exists progress numeric;
alter table public.quotes add column if not exists next_step text not null default '';
alter table public.quotes add column if not exists technician text not null default '';
alter table public.quotes add column if not exists technician_id uuid references public.profiles(id) on delete set null;
alter table public.quotes add column if not exists estimated_completion date;
alter table public.quotes add column if not exists updates jsonb not null default '[]'::jsonb;
alter table public.quotes alter column progress drop not null;
alter table public.quotes alter column progress drop default;
alter table public.quotes alter column next_step set default '';
alter table public.quotes alter column technician set default '';

alter table public.custom_quotes add column if not exists source_quote_template_id uuid references public.service_quote_templates(id) on delete set null;
alter table public.custom_quotes add column if not exists commitment_terms text not null default '';
alter table public.custom_quotes add column if not exists structure text;

insert into storage.buckets (id, name, public)
values ('bitoll-images', 'bitoll-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('bitoll-documents', 'bitoll-documents', true)
on conflict (id) do update set public = true;

insert into public.search_sources (
  id,
  source_key,
  label,
  description,
  sort_order,
  active
)
values
  ('services', 'services', 'Servicos', 'Resultados aparecem como servicos encontrados na busca do cliente.', 10, true),
  ('products', 'products', 'Artigos', 'Resultados aparecem como artigos encontrados na busca do cliente.', 20, true),
  ('promotions', 'promotions', 'Promocoes', 'Resultados aparecem como promocoes encontradas na busca do cliente.', 30, true),
  ('requests', 'requests', 'Solicitacoes', 'Resultados aparecem como solicitacoes do proprio cliente.', 40, false)
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = now();

create unique index if not exists promotions_slug_unique
on public.promotions(slug)
where slug is not null;

insert into public.profiles (
  id,
  full_name,
  email,
  avatar_url,
  verified
)
select
  users.id,
  coalesce(users.raw_user_meta_data->>'full_name', users.raw_user_meta_data->>'name', ''),
  coalesce(users.email, ''),
  coalesce(users.raw_user_meta_data->>'avatar_url', ''),
  coalesce(users.email_confirmed_at is not null, false)
from auth.users
where exists (
    select 1
    from public.admin_users
    where admin_users.user_id = users.id
  )
  and not exists (
    select 1
    from public.profiles
    where profiles.id = users.id
  );

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'admin_users'
      and constraint_name = 'admin_users_user_id_fkey'
  ) then
    alter table public.admin_users
      drop constraint admin_users_user_id_fkey;
  end if;

  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'admin_users'
      and constraint_name = 'admin_users_user_id_profiles_fkey'
  ) then
    alter table public.admin_users
      add constraint admin_users_user_id_profiles_fkey
      foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
end;
$$;

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

create or replace function public.get_login_email_by_phone(phone_identifier text)
returns text
language sql
security definer
set search_path = public
as $$
  select auth_users.email
  from public.profiles
  join auth.users as auth_users on auth_users.id = profiles.id
  where regexp_replace(profiles.phone, '\s+', '', 'g') =
    regexp_replace(coalesce(phone_identifier, ''), '\s+', '', 'g')
  limit 1;
$$;

grant execute on function public.get_login_email_by_phone(text) to anon, authenticated;

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
using (public.is_admin() or user_id = auth.uid());

drop policy if exists "Admins can view themselves" on public.admin_users;
create policy "Admins can view themselves"
on public.admin_users for select
using (user_id = auth.uid() and active = true);

drop policy if exists "Admins can view admin users" on public.admin_users;
create policy "Admins can view admin users"
on public.admin_users for select
using (public.is_admin());

drop policy if exists "Owners can create admin users" on public.admin_users;
create policy "Owners can create admin users"
on public.admin_users for insert
with check (public.current_admin_role() = 'owner');

drop policy if exists "Owners can update admin users" on public.admin_users;
create policy "Owners can update admin users"
on public.admin_users for update
using (public.current_admin_role() = 'owner')
with check (public.current_admin_role() = 'owner');

drop policy if exists "Owners can delete admin users" on public.admin_users;
create policy "Owners can delete admin users"
on public.admin_users for delete
using (public.current_admin_role() = 'owner');

drop policy if exists "Active services are public" on public.services;
create policy "Active services are public"
on public.services for select
using (active = true);

drop policy if exists "Admins can view all services" on public.services;
create policy "Admins can view all services"
on public.services for select
using (public.is_admin());

drop policy if exists "Products from active services are public" on public.service_products;
create policy "Products from active services are public"
on public.service_products for select
using (
  exists (
    select 1
    from public.services
    where services.slug = service_products.service_slug
      and services.active = true
      and service_products.active = true
  )
);

drop policy if exists "Admins can view all service products" on public.service_products;
create policy "Admins can view all service products"
on public.service_products for select
using (public.is_admin());

drop policy if exists "Active service structure options are public" on public.service_structure_options;
create policy "Active service structure options are public"
on public.service_structure_options for select
using (
  active = true
  and exists (
    select 1
    from public.services
    where services.slug = service_structure_options.service_slug
      and services.active = true
  )
);

drop policy if exists "Admins can view all service structure options" on public.service_structure_options;
create policy "Admins can view all service structure options"
on public.service_structure_options for select
using (public.is_admin());

drop policy if exists "Active quote templates are public" on public.service_quote_templates;
create policy "Active quote templates are public"
on public.service_quote_templates for select
using (
  active = true
  and exists (
    select 1
    from public.services
    where services.slug = service_quote_templates.service_slug
      and services.active = true
  )
);

drop policy if exists "Admins can view all quote templates" on public.service_quote_templates;
create policy "Admins can view all quote templates"
on public.service_quote_templates for select
using (public.is_admin());

drop policy if exists "Active quote template fields are public" on public.service_quote_template_fields;
create policy "Active quote template fields are public"
on public.service_quote_template_fields for select
using (
  exists (
    select 1
    from public.service_quote_templates
    where service_quote_templates.id = service_quote_template_fields.template_id
      and service_quote_templates.active = true
  )
);

drop policy if exists "Admins can view all quote template fields" on public.service_quote_template_fields;
create policy "Admins can view all quote template fields"
on public.service_quote_template_fields for select
using (public.is_admin());

drop policy if exists "Active quote template items are public" on public.service_quote_template_items;
create policy "Active quote template items are public"
on public.service_quote_template_items for select
using (
  exists (
    select 1
    from public.service_quote_templates
    where service_quote_templates.id = service_quote_template_items.template_id
      and service_quote_templates.active = true
  )
);

drop policy if exists "Admins can view all quote template items" on public.service_quote_template_items;
create policy "Admins can view all quote template items"
on public.service_quote_template_items for select
using (public.is_admin());

drop policy if exists "Active quote template item rules are public" on public.service_quote_template_item_rules;
create policy "Active quote template item rules are public"
on public.service_quote_template_item_rules for select
using (
  exists (
    select 1
    from public.service_quote_templates
    where service_quote_templates.id = service_quote_template_item_rules.template_id
      and service_quote_templates.active = true
  )
);

drop policy if exists "Admins can view all quote template item rules" on public.service_quote_template_item_rules;
create policy "Admins can view all quote template item rules"
on public.service_quote_template_item_rules for select
using (public.is_admin());

drop policy if exists "Active promotions are public" on public.promotions;
create policy "Active promotions are public"
on public.promotions for select
using (active = true);

drop policy if exists "Admins can view all promotions" on public.promotions;
create policy "Admins can view all promotions"
on public.promotions for select
using (public.is_admin());

drop policy if exists "Active search entries are public" on public.search_entries;
create policy "Active search entries are public"
on public.search_entries for select
using (active = true);

drop policy if exists "Admins can view all search entries" on public.search_entries;
create policy "Admins can view all search entries"
on public.search_entries for select
using (public.is_admin());

drop policy if exists "Search sources are public" on public.search_sources;
create policy "Search sources are public"
on public.search_sources for select
using (true);

drop policy if exists "Admins can view all search sources" on public.search_sources;
create policy "Admins can view all search sources"
on public.search_sources for select
using (public.is_admin());

drop policy if exists "Content managers can create services" on public.services;
create policy "Content managers can create services"
on public.services for insert
with check (public.can_manage_content());

drop policy if exists "Content managers can update services" on public.services;
create policy "Content managers can update services"
on public.services for update
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "Content managers can delete services" on public.services;
create policy "Content managers can delete services"
on public.services for delete
using (public.can_manage_content());

drop policy if exists "Content managers can create service products" on public.service_products;
create policy "Content managers can create service products"
on public.service_products for insert
with check (public.can_manage_content());

drop policy if exists "Content managers can update service products" on public.service_products;
create policy "Content managers can update service products"
on public.service_products for update
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "Content managers can delete service products" on public.service_products;
create policy "Content managers can delete service products"
on public.service_products for delete
using (public.can_manage_content());

drop policy if exists "Content managers can create service structure options" on public.service_structure_options;
create policy "Content managers can create service structure options"
on public.service_structure_options for insert
with check (public.can_manage_content());

drop policy if exists "Content managers can update service structure options" on public.service_structure_options;
create policy "Content managers can update service structure options"
on public.service_structure_options for update
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "Content managers can delete service structure options" on public.service_structure_options;
create policy "Content managers can delete service structure options"
on public.service_structure_options for delete
using (public.can_manage_content());

drop policy if exists "Content managers can create quote templates" on public.service_quote_templates;
create policy "Content managers can create quote templates"
on public.service_quote_templates for insert
with check (public.can_manage_content());

drop policy if exists "Content managers can update quote templates" on public.service_quote_templates;
create policy "Content managers can update quote templates"
on public.service_quote_templates for update
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "Content managers can delete quote templates" on public.service_quote_templates;
create policy "Content managers can delete quote templates"
on public.service_quote_templates for delete
using (public.can_manage_content());

drop policy if exists "Content managers can create quote template fields" on public.service_quote_template_fields;
create policy "Content managers can create quote template fields"
on public.service_quote_template_fields for insert
with check (public.can_manage_content());

drop policy if exists "Content managers can update quote template fields" on public.service_quote_template_fields;
create policy "Content managers can update quote template fields"
on public.service_quote_template_fields for update
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "Content managers can delete quote template fields" on public.service_quote_template_fields;
create policy "Content managers can delete quote template fields"
on public.service_quote_template_fields for delete
using (public.can_manage_content());

drop policy if exists "Content managers can create quote template items" on public.service_quote_template_items;
create policy "Content managers can create quote template items"
on public.service_quote_template_items for insert
with check (public.can_manage_content());

drop policy if exists "Content managers can update quote template items" on public.service_quote_template_items;
create policy "Content managers can update quote template items"
on public.service_quote_template_items for update
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "Content managers can delete quote template items" on public.service_quote_template_items;
create policy "Content managers can delete quote template items"
on public.service_quote_template_items for delete
using (public.can_manage_content());

drop policy if exists "Content managers can create quote template item rules" on public.service_quote_template_item_rules;
create policy "Content managers can create quote template item rules"
on public.service_quote_template_item_rules for insert
with check (public.can_manage_content());

drop policy if exists "Content managers can update quote template item rules" on public.service_quote_template_item_rules;
create policy "Content managers can update quote template item rules"
on public.service_quote_template_item_rules for update
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "Content managers can delete quote template item rules" on public.service_quote_template_item_rules;
create policy "Content managers can delete quote template item rules"
on public.service_quote_template_item_rules for delete
using (public.can_manage_content());

drop policy if exists "Content managers can create promotions" on public.promotions;
create policy "Content managers can create promotions"
on public.promotions for insert
with check (public.can_manage_content());

drop policy if exists "Content managers can update promotions" on public.promotions;
create policy "Content managers can update promotions"
on public.promotions for update
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "Content managers can delete promotions" on public.promotions;
create policy "Content managers can delete promotions"
on public.promotions for delete
using (public.can_manage_content());

drop policy if exists "Content managers can create search entries" on public.search_entries;
create policy "Content managers can create search entries"
on public.search_entries for insert
with check (public.can_manage_content());

drop policy if exists "Content managers can update search entries" on public.search_entries;
create policy "Content managers can update search entries"
on public.search_entries for update
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "Content managers can delete search entries" on public.search_entries;
create policy "Content managers can delete search entries"
on public.search_entries for delete
using (public.can_manage_content());

drop policy if exists "Content managers can update search sources" on public.search_sources;
create policy "Content managers can update search sources"
on public.search_sources for update
using (public.can_manage_content())
with check (public.can_manage_content());

drop policy if exists "Bitoll images are public" on storage.objects;
create policy "Bitoll images are public"
on storage.objects for select
using (bucket_id = 'bitoll-images');

drop policy if exists "Content managers can upload bitoll images" on storage.objects;
create policy "Content managers can upload bitoll images"
on storage.objects for insert
with check (
  bucket_id = 'bitoll-images'
  and public.can_manage_content()
);

drop policy if exists "Content managers can update bitoll images" on storage.objects;
create policy "Content managers can update bitoll images"
on storage.objects for update
using (
  bucket_id = 'bitoll-images'
  and public.can_manage_content()
)
with check (
  bucket_id = 'bitoll-images'
  and public.can_manage_content()
);

drop policy if exists "Bitoll documents are public" on storage.objects;
create policy "Bitoll documents are public"
on storage.objects for select
using (bucket_id = 'bitoll-documents');

drop policy if exists "Content managers can upload bitoll documents" on storage.objects;
create policy "Content managers can upload bitoll documents"
on storage.objects for insert
with check (
  bucket_id = 'bitoll-documents'
  and public.can_manage_content()
);

drop policy if exists "Content managers can update bitoll documents" on storage.objects;
create policy "Content managers can update bitoll documents"
on storage.objects for update
using (
  bucket_id = 'bitoll-documents'
  and public.can_manage_content()
)
with check (
  bucket_id = 'bitoll-documents'
  and public.can_manage_content()
);

drop policy if exists "Admins can view profiles" on public.profiles;
create policy "Admins can view profiles"
on public.profiles for select
using (public.is_admin());

drop policy if exists "Admins can view accounts" on public.accounts;
create policy "Admins can view accounts"
on public.accounts for select
using (public.is_admin());

drop policy if exists "Admins can view account members" on public.account_members;
create policy "Admins can view account members"
on public.account_members for select
using (public.is_admin());

drop policy if exists "Projects are visible to account members" on public.projects;
create policy "Projects are visible to account members"
on public.projects for select
using (
  public.is_admin()
  or
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
  public.is_admin()
  or profile_id = auth.uid()
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

drop policy if exists "Admins can create quotes" on public.quotes;
create policy "Admins can create quotes"
on public.quotes for insert
with check (public.is_admin());

drop policy if exists "Admins can update quotes" on public.quotes;
create policy "Admins can update quotes"
on public.quotes for update
using (public.is_admin())
with check (public.is_admin());

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
        public.is_admin()
        or quotes.profile_id = auth.uid()
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

drop policy if exists "Admins can create quote items" on public.quote_items;
create policy "Admins can create quote items"
on public.quote_items for insert
with check (public.is_admin());

drop policy if exists "Admins can manage custom quotes" on public.custom_quotes;
create policy "Admins can manage custom quotes"
on public.custom_quotes for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage custom quote items" on public.custom_quote_items;
create policy "Admins can manage custom quote items"
on public.custom_quote_items for all
using (public.is_admin())
with check (public.is_admin());

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
    verified,
    must_change_password,
    temporary_password_set_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(
      new.raw_user_meta_data->>'contact_email',
      case
        when coalesce(new.raw_user_meta_data->>'uses_phone_login_email', 'false') = 'true'
          then ''
        else new.email
      end,
      ''
    ),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.raw_user_meta_data->>'customer_type', 'Particular'),
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'preferred_contact_method', 'WhatsApp'),
    coalesce(new.email_confirmed_at is not null, false),
    coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false),
    case
      when coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false)
        then now()
      else null
    end
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    avatar_url = excluded.avatar_url,
    must_change_password = excluded.must_change_password,
    temporary_password_set_at = excluded.temporary_password_set_at,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
