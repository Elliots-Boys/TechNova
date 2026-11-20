
create table if not exists public.event_registration_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id bigint not null references public.events(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  organisation text,
  requirements text,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts >= 0 and attempts <= 10),
  verified_at timestamptz,
  registration_id bigint references public.event_registrations(id) on delete set null,
  email_id text,
  created_at timestamptz not null default now()
);

create index if not exists event_registration_verifications_user_event_idx
  on public.event_registration_verifications(user_id, event_id, created_at desc);

alter table public.event_registration_verifications enable row level security;

revoke all on table public.event_registration_verifications from anon, authenticated;

create or replace function public.confirm_event_registration_for_user(
  p_user_id uuid,
  p_event_id bigint
)
returns public.event_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.event_registrations;
  current_count integer;
  event_capacity integer;
begin
  if p_user_id is null then
    raise exception 'User is required';
  end if;

  select e.capacity
    into event_capacity
  from public.events e
  where e.id = p_event_id
  for update;

  if not found then
    raise exception 'Event not found';
  end if;

  if exists (
    select 1
    from public.event_registrations er
    where er.event_id = p_event_id
      and er.user_id = p_user_id
  ) then
    select *
      into result
    from public.event_registrations er
    where er.event_id = p_event_id
      and er.user_id = p_user_id
    limit 1;

    return result;
  end if;

  select count(*)
    into current_count
  from public.event_registrations
  where event_id = p_event_id;

  if event_capacity is not null and current_count >= event_capacity then
    raise exception 'This event is full';
  end if;

  insert into public.event_registrations(event_id, user_id)
  values (p_event_id, p_user_id)
  returning * into result;

  return result;
end;
$$;

revoke execute on function public.confirm_event_registration_for_user(uuid,bigint) from public;
revoke execute on function public.confirm_event_registration_for_user(uuid,bigint) from anon;
revoke execute on function public.confirm_event_registration_for_user(uuid,bigint) from authenticated;
grant execute on function public.confirm_event_registration_for_user(uuid,bigint) to service_role;
