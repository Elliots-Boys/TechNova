-- Fix quiz scoring JSON alias: answers are stored under the JSON column "value".
-- Keep answer validation and XP awards server-side; do not expose correct_answer.
create or replace function public.submit_quiz_attempt(p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  uid uuid := auth.uid();
  question_count integer;
  matched_count integer;
  correct_count integer;
  earned_xp integer;
  score_percent integer;
begin
  if uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if jsonb_typeof(p_answers) is distinct from 'array'
     or jsonb_array_length(p_answers) < 1
     or jsonb_array_length(p_answers) > 20 then
    raise exception 'Invalid quiz answers';
  end if;

  if exists (
    select 1
    from public.quiz_attempts
    where user_id = uid
      and completed_at > now() - interval '10 minutes'
  ) then
    raise exception 'Please wait 10 minutes before earning XP from another quiz attempt';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_answers) as answer_row(value)
    where jsonb_typeof(answer_row.value) is distinct from 'object'
       or answer_row.value->>'question_id' is null
       or answer_row.value->>'answer' is null
  ) then
    raise exception 'Invalid quiz answers';
  end if;

  select
    count(*)::integer,
    count(*) filter (where q.correct_answer = answer_row.value->>'answer')::integer,
    coalesce(sum(q.xp_reward) filter (where q.correct_answer = answer_row.value->>'answer'), 0)::integer
  into matched_count, correct_count, earned_xp
  from jsonb_array_elements(p_answers) as answer_row(value)
  join public.quiz_questions as q
    on q.id = (answer_row.value->>'question_id')::bigint;

  question_count := jsonb_array_length(p_answers);

  if matched_count <> question_count then
    raise exception 'One or more quiz questions are invalid';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_answers) as answer_row(value)
    group by answer_row.value->>'question_id'
    having count(*) > 1
  ) then
    raise exception 'Duplicate quiz answers are not allowed';
  end if;

  select coalesce(sum(q.xp_reward), 0)::integer
    into score_percent
  from public.quiz_questions as q
  where q.id in (
    select (answer_row.value->>'question_id')::bigint
    from jsonb_array_elements(p_answers) as answer_row(value)
  );

  score_percent := case
    when score_percent > 0
      then round((earned_xp::numeric / score_percent::numeric) * 100)::integer
    else 0
  end;

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
$function$;

revoke all on function public.submit_quiz_attempt(jsonb) from public, anon;
grant execute on function public.submit_quiz_attempt(jsonb) to authenticated;