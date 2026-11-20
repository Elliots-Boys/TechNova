-- Secure TechNova XP awards and achievement ownership.
create or replace function public.award_xp(p_amount integer, p_achievement_slug text default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  achievement_id_value bigint;
  achievement_xp integer := 0;
  current_xp integer := 0;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Browser clients may only claim the one-time welcome achievement.
  -- All activity XP is calculated by submit_quiz_attempt on the server.
  if coalesce(p_amount, 0) <> 0 or p_achievement_slug is distinct from 'first-login' then
    raise exception 'XP can only be awarded by verified activities';
  end if;

  select id, xp_reward
    into achievement_id_value, achievement_xp
  from public.achievements
  where slug = 'first-login';

  if achievement_id_value is null then
    raise exception 'Welcome achievement is not configured';
  end if;

  insert into public.user_achievements(user_id, achievement_id)
  values (uid, achievement_id_value)
  on conflict (user_id, achievement_id) do nothing;

  if found then
    insert into public.user_xp(user_id, xp, level, updated_at)
    values (uid, achievement_xp, greatest(1, floor(achievement_xp / 100.0)::integer + 1), now())
    on conflict (user_id) do update
      set xp = public.user_xp.xp + achievement_xp,
          level = greatest(1, floor((public.user_xp.xp + achievement_xp) / 100.0)::integer + 1),
          updated_at = now();
  end if;

  select xp into current_xp from public.user_xp where user_id = uid;
  return coalesce(current_xp, 0);
end;
$$;

create or replace function public.submit_quiz_attempt(p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  question_count integer;
  matched_count integer;
  correct_count integer;
  earned_xp integer;
  score_percent integer;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) < 1
     or jsonb_array_length(p_answers) > 20 then
    raise exception 'Invalid quiz answers';
  end if;

  if exists (
    select 1 from public.quiz_attempts
    where user_id = uid and completed_at > now() - interval '10 minutes'
  ) then
    raise exception 'Please wait 10 minutes before earning XP from another quiz attempt';
  end if;

  select count(*),
         count(*) filter (where q.correct_answer = a.answer),
         coalesce(sum(q.xp_reward) filter (where q.correct_answer = a.answer), 0)
    into matched_count, correct_count, earned_xp
  from jsonb_array_elements(p_answers) as a(value)
  join public.quiz_questions q
    on q.id = (a.value->>'question_id')::bigint;

  question_count := jsonb_array_length(p_answers);
  if matched_count <> question_count then
    raise exception 'One or more quiz questions are invalid';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_answers) as a(value)
    group by (a.value->>'question_id')
    having count(*) > 1
  ) then
    raise exception 'Duplicate quiz answers are not allowed';
  end if;

  select coalesce(sum(xp_reward), 0) into score_percent
  from public.quiz_questions q
  where q.id in (
    select (a.value->>'question_id')::bigint
    from jsonb_array_elements(p_answers) as a(value)
  );

  score_percent := case when score_percent > 0
    then round((earned_xp::numeric / score_percent::numeric) * 100)::integer
    else 0 end;

  insert into public.quiz_attempts(user_id, score, total_questions, xp_earned, completed_at)
  values (uid, earned_xp, question_count, earned_xp, now());

  insert into public.user_xp(user_id, xp, level, updated_at)
  values (uid, earned_xp, greatest(1, floor(earned_xp / 100.0)::integer + 1), now())
  on conflict (user_id) do update
    set xp = public.user_xp.xp + earned_xp,
        level = greatest(1, floor((public.user_xp.xp + earned_xp) / 100.0)::integer + 1),
        updated_at = now();

  return jsonb_build_object(
    'score', earned_xp,
    'xp_earned', earned_xp,
    'correct_answers', correct_count,
    'total_questions', question_count,
    'percentage', score_percent
  );
end;
$$;

-- Only the verified quiz RPC can create XP-bearing quiz attempts.
drop policy if exists "Users can create own quiz attempts" on public.quiz_attempts;
drop policy if exists "Users can manage own earned achievements" on public.user_achievements;

-- Prevent direct client reads of answer keys. The quiz only needs these public columns.
revoke select on public.quiz_questions from anon, authenticated;
grant select (id, question, options, category, xp_reward, created_at)
  on public.quiz_questions to authenticated;

revoke all on function public.award_xp(integer, text) from public, anon, authenticated;
grant execute on function public.award_xp(integer, text) to authenticated, service_role;

revoke all on function public.submit_quiz_attempt(jsonb) from public, anon, authenticated;
grant execute on function public.submit_quiz_attempt(jsonb) to authenticated, service_role;

-- This helper is not a public API; keep it unavailable to browser roles.
revoke all on function public.recalculate_user_level(uuid) from public, anon, authenticated;
grant execute on function public.recalculate_user_level(uuid) to service_role;
