-- Repair TechNova gamification against the schema currently deployed.
-- Safe/idempotent: does not drop existing data.

create or replace function public.award_xp(p_amount integer, p_achievement_slug text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  new_xp integer;
  achievement_id_value bigint;
  achievement_xp integer := 0;
  award_amount integer := greatest(0, least(coalesce(p_amount, 0), 1000));
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
    values (uid, achievement_id_value)
    on conflict (user_id, achievement_id) do nothing;

    if not found then
      achievement_xp := 0;
    end if;
  end if;

  insert into public.user_xp(user_id, xp, level, updated_at)
  values (uid, award_amount + achievement_xp, greatest(1, floor((award_amount + achievement_xp) / 100.0)::integer + 1), now())
  on conflict (user_id) do update
    set xp = public.user_xp.xp + award_amount + achievement_xp,
        level = greatest(1, floor((public.user_xp.xp + award_amount + achievement_xp) / 100.0)::integer + 1),
        updated_at = now();

  select xp into new_xp from public.user_xp where user_id = uid;
  return coalesce(new_xp, 0);
end;
$$;

grant execute on function public.award_xp(integer, text) to authenticated;

-- Make sure the full achievement set exists in the deployed schema.
insert into public.achievements (slug, name, description, icon, xp_reward) values
('first-login','Welcome to TechNova','Create your TechNova profile.','👋',25),
('first-event','Event Explorer','Register for your first event.','🎟️',50),
('saved-event','Plan Ahead','Save an event for later.','❤️',25),
('first-comment','Community Voice','Leave your first approved comment.','💬',50),
('first-article','Tech Reader','Read your first technology article.','📰',25),
('ai-chat','AI Curious','Ask TechNova AI your first question.','🤖',50),
('five-events','Event Regular','Register for five events.','🏆',150),
('ten-events','TechNova Veteran','Register for ten events.','🚀',300)
on conflict (slug) do update set name = excluded.name, description = excluded.description, icon = excluded.icon, xp_reward = excluded.xp_reward;

-- Existing users get an XP row and their level is kept consistent with XP.
insert into public.user_xp (user_id, xp, level)
select id, 0, 1 from auth.users
on conflict (user_id) do nothing;

update public.user_xp
set level = greatest(1, floor(xp / 100.0)::integer + 1), updated_at = now();

-- Replace registration function so native TechNova registrations also award XP/achievements.
create or replace function public.register_for_event(p_event_id bigint)
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
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select e.capacity into event_capacity
  from public.events e
  where e.id = p_event_id
  for update;

  if not found then
    raise exception 'Event not found (ID: %)', p_event_id;
  end if;

  if exists (
    select 1 from public.event_registrations er
    where er.event_id = p_event_id and er.user_id = auth.uid()
  ) then
    raise exception 'Already registered for this event';
  end if;

  select count(*) into current_count
  from public.event_registrations
  where event_id = p_event_id;

  if event_capacity is not null and current_count >= event_capacity then
    raise exception 'This event is full';
  end if;

  insert into public.event_registrations(event_id, user_id)
  values (p_event_id, auth.uid())
  returning * into result;

  -- First registration and milestone achievements.
  perform public.award_xp(0, 'first-event');

  if (select count(*) from public.event_registrations where user_id = auth.uid()) >= 5 then
    perform public.award_xp(0, 'five-events');
  end if;

  if (select count(*) from public.event_registrations where user_id = auth.uid()) >= 10 then
    perform public.award_xp(0, 'ten-events');
  end if;

  return result;
end;
$$;

grant execute on function public.register_for_event(bigint) to authenticated;
