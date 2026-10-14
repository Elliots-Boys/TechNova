create table if not exists public.developer_oauth_apps (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  oauth_client_id uuid not null unique,
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 500),
  website_url text,
  logo_url text,
  privacy_url text,
  terms_url text,
  client_type text not null check (client_type in ('public','confidential')),
  token_endpoint_auth_method text not null check (
    token_endpoint_auth_method in ('none','client_secret_basic','client_secret_post')
  ),
  redirect_uris text[] not null check (
    cardinality(redirect_uris) between 1 and 10
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists developer_oauth_apps_owner_idx
  on public.developer_oauth_apps(owner_user_id, created_at desc);

alter table public.developer_oauth_apps enable row level security;

revoke all on table public.developer_oauth_apps from anon;
revoke insert, update, delete on table public.developer_oauth_apps from authenticated;
grant select on table public.developer_oauth_apps to authenticated;

drop policy if exists "Developers can view own OAuth apps"
  on public.developer_oauth_apps;

create policy "Developers can view own OAuth apps"
  on public.developer_oauth_apps
  for select
  to authenticated
  using (auth.uid() = owner_user_id);

comment on table public.developer_oauth_apps is
  'Ownership and public metadata for OAuth clients created through the TechNova Developer Console. OAuth client secrets are never stored here.';
