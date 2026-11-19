
create table if not exists public.roblox_oauth_demo_chunks (
  part integer primary key,
  data text not null
);

alter table public.roblox_oauth_demo_chunks enable row level security;
