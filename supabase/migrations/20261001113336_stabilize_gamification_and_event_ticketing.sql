
create table if not exists public.event_tickets (
  registration_id bigint primary key references public.event_registrations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id bigint not null references public.events(id) on delete cascade,
  ticket_code uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now()
);

alter table public.event_tickets enable row level security;

drop policy if exists "Users can view own event tickets" on public.event_tickets;
create policy "Users can view own event tickets"
on public.event_tickets
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Admins can view all event tickets" on public.event_tickets;
create policy "Admins can view all event tickets"
on public.event_tickets
for select
to authenticated
using ((select private.is_admin()));

create or replace function public.create_event_ticket_for_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.event_tickets(registration_id, user_id, event_id)
  values (new.id, new.user_id, new.event_id)
  on conflict (registration_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_create_event_ticket on public.event_registrations;
create trigger trg_create_event_ticket
after insert on public.event_registrations
for each row
execute function public.create_event_ticket_for_registration();

insert into public.event_tickets(registration_id, user_id, event_id)
select er.id, er.user_id, er.event_id
from public.event_registrations er
on conflict (registration_id) do nothing;

create or replace function public.award_xp(
  p_amount integer,
  p_achievement_slug text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  achievement_id_value bigint;
  achievement_xp integer := 0;
  award_amount integer := greatest(0, least(coalesce(p_amount, 0), 1000));
  new_xp integer;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_achievement_slug is not null then
    select id, xp_reward
      into achievement_id_value, achievement_xp
    from public.achievements
    where slug = p_achievement_slug;

    if achievement_id_value is null then
      raise exception 'Unknown achievement: %', p_achievement_slug;
    end if;

    insert into public.user_achievements(user_id, achievement_id)
    values(uid, achievement_id_value)
    on conflict (user_id, achievement_id) do nothing;

    if not found then
      achievement_xp := 0;
    end if;
  end if;

  insert into public.user_xp(user_id, xp, level, updated_at)
  values(
    uid,
    award_amount + achievement_xp,
    greatest(1, floor((award_amount + achievement_xp) / 100.0)::integer + 1),
    now()
  )
  on conflict (user_id) do update
  set xp = public.user_xp.xp + award_amount + achievement_xp,
      level = greatest(
        1,
        floor((public.user_xp.xp + award_amount + achievement_xp) / 100.0)::integer + 1
      ),
      updated_at = now();

  select xp into new_xp
  from public.user_xp
  where user_id = uid;

  return coalesce(new_xp, 0);
end;
$$;

create or replace function public.get_my_achievement_progress()
returns table(
  achievement_id bigint,
  slug text,
  name text,
  description text,
  icon text,
  xp_reward integer,
  earned boolean,
  earned_at timestamptz,
  user_xp integer,
  user_level integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id,
    a.slug,
    a.name,
    a.description,
    a.icon,
    a.xp_reward,
    (ua.achievement_id is not null) as earned,
    ua.earned_at,
    coalesce(ux.xp, 0) as user_xp,
    coalesce(ux.level, 1) as user_level
  from public.achievements a
  left join public.user_achievements ua
    on ua.achievement_id = a.id
   and ua.user_id = auth.uid()
  left join public.user_xp ux
    on ux.user_id = auth.uid()
  where auth.uid() is not null
  order by a.id;
$$;

create or replace function public.get_leaderboard(limit_count integer default 25)
returns table(
  user_id uuid,
  display_name text,
  avatar_url text,
  xp integer,
  level integer,
  rank bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ux.user_id,
    coalesce(nullif(trim(p.display_name), ''), 'Unnamed user') as display_name,
    p.avatar_url,
    coalesce(ux.xp, 0) as xp,
    coalesce(ux.level, 1) as level,
    row_number() over (
      order by coalesce(ux.xp, 0) desc, ux.updated_at asc, ux.user_id
    ) as rank
  from public.user_xp ux
  left join public.profiles p on p.id = ux.user_id
  where auth.uid() is not null
    and coalesce(p.is_disabled, false) = false
  order by coalesce(ux.xp, 0) desc, ux.updated_at asc, ux.user_id
  limit greatest(1, least(coalesce(limit_count, 25), 100));
$$;

create or replace function public.get_my_event_tickets()
returns table(
  registration_id bigint,
  event_id bigint,
  ticket_code uuid,
  registered_at timestamptz,
  title text,
  event_date date,
  event_time time without time zone,
  location text,
  event_type text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    er.id as registration_id,
    er.event_id,
    et.ticket_code,
    er.created_at as registered_at,
    e.title,
    e.event_date,
    e.event_time,
    e.location,
    e.event_type
  from public.event_registrations er
  join public.events e on e.id = er.event_id
  join public.event_tickets et on et.registration_id = er.id
  where auth.uid() is not null
    and er.user_id = auth.uid()
  order by er.created_at desc;
$$;

revoke execute on function public.award_xp(integer,text) from public, anon;
revoke execute on function public.get_my_achievement_progress() from public, anon;
revoke execute on function public.get_leaderboard(integer) from public, anon;
revoke execute on function public.get_my_event_tickets() from public, anon;

grant execute on function public.award_xp(integer,text) to authenticated;
grant execute on function public.get_my_achievement_progress() to authenticated;
grant execute on function public.get_leaderboard(integer) to authenticated;
grant execute on function public.get_my_event_tickets() to authenticated;
