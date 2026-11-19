
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
    a.id as achievement_id,
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

revoke all on function public.get_my_achievement_progress() from public;
grant execute on function public.get_my_achievement_progress() to authenticated;

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
  where er.user_id = auth.uid()
  order by e.event_date asc, e.event_time asc, er.created_at asc;
$$;

revoke all on function public.get_my_tickets() from public;
grant execute on function public.get_my_tickets() to authenticated;

revoke all on function public.get_leaderboard(integer) from public;
grant execute on function public.get_leaderboard(integer) to authenticated;

insert into public.user_xp(user_id, xp, level, updated_at)
select p.id, 0, 1, now()
from public.profiles p
where not exists (
  select 1 from public.user_xp ux where ux.user_id = p.id
);
