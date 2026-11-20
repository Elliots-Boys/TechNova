
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

create or replace function public.get_my_tickets()
returns table(
  registration_id bigint,
  event_id bigint,
  registered_at timestamptz,
  title text,
  event_date date,
  event_time time,
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
    er.created_at as registered_at,
    e.title,
    e.event_date,
    e.event_time,
    e.location,
    e.event_type
  from public.event_registrations er
  join public.events e on e.id = er.event_id
  where auth.uid() is not null
    and er.user_id = auth.uid()
  order by er.created_at desc;
$$;

revoke all on function public.get_my_achievement_progress() from public;
revoke all on function public.get_my_achievement_progress() from anon;
grant execute on function public.get_my_achievement_progress() to authenticated;

revoke all on function public.get_leaderboard(integer) from public;
revoke all on function public.get_leaderboard(integer) from anon;
grant execute on function public.get_leaderboard(integer) to authenticated;

revoke all on function public.get_my_tickets() from public;
revoke all on function public.get_my_tickets() from anon;
grant execute on function public.get_my_tickets() to authenticated;
