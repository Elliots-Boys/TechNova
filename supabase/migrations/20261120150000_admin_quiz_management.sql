-- Administrator-only quiz question management and aggregate quiz analytics.
-- This migration is committed for review only; it is not applied to the live database.

create or replace function public.admin_list_quiz_questions()
returns table (
  id bigint,
  question text,
  options jsonb,
  correct_answer text,
  category text,
  xp_reward integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  return query
    select q.id, q.question, q.options, q.correct_answer, q.category, q.xp_reward, q.created_at
    from public.quiz_questions as q
    order by q.created_at desc, q.id desc;
end;
$function$;

create or replace function public.admin_save_quiz_question(
  p_id bigint,
  p_question text,
  p_options jsonb,
  p_correct_answer text,
  p_category text,
  p_xp_reward integer
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $function$
declare
  saved_id bigint;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if p_question is null or length(btrim(p_question)) not between 5 and 1000 then
    raise exception 'Question must be between 5 and 1000 characters';
  end if;
  if jsonb_typeof(p_options) is distinct from 'array' then
    raise exception 'Answer options must be a JSON array';
  end if;
  if jsonb_array_length(p_options) not between 2 and 8 then
    raise exception 'Provide between 2 and 8 answer options';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_options) as opts(value)
    where jsonb_typeof(opts.value) is distinct from 'string'
       or length(btrim(opts.value #>> '{}')) = 0
  ) then
    raise exception 'Every answer option must be a non-empty string';
  end if;
  if p_correct_answer is null or not exists (
    select 1 from jsonb_array_elements_text(p_options) as option_value(value)
    where option_value.value = p_correct_answer
  ) then
    raise exception 'The correct answer must match one of the options';
  end if;
  if p_category is null or length(btrim(p_category)) not between 1 and 80 then
    raise exception 'Category must be between 1 and 80 characters';
  end if;
  if p_xp_reward is null or p_xp_reward not between 0 and 1000 then
    raise exception 'XP reward must be between 0 and 1000';
  end if;

  if p_id is null then
    insert into public.quiz_questions(question, options, correct_answer, category, xp_reward)
    values (btrim(p_question), p_options, p_correct_answer, btrim(p_category), p_xp_reward)
    returning id into saved_id;
  else
    update public.quiz_questions
       set question = btrim(p_question),
           options = p_options,
           correct_answer = p_correct_answer,
           category = btrim(p_category),
           xp_reward = p_xp_reward
     where id = p_id
     returning id into saved_id;
    if saved_id is null then
      raise exception 'Quiz question not found';
    end if;
  end if;

  return saved_id;
end;
$function$;

create or replace function public.admin_delete_quiz_question(p_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  delete from public.quiz_questions where id = p_id;
  if not found then
    raise exception 'Quiz question not found';
  end if;
end;
$function$;

create or replace function public.admin_quiz_stats()
returns table (attempts_count bigint, xp_earned_total bigint)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  return query
    select count(*)::bigint, coalesce(sum(a.xp_earned), 0)::bigint
    from public.quiz_attempts as a;
end;
$function$;

revoke all on function public.admin_list_quiz_questions() from public, anon;
revoke all on function public.admin_save_quiz_question(bigint, text, jsonb, text, text, integer) from public, anon;
revoke all on function public.admin_delete_quiz_question(bigint) from public, anon;
revoke all on function public.admin_quiz_stats() from public, anon;
grant execute on function public.admin_list_quiz_questions() to authenticated;
grant execute on function public.admin_save_quiz_question(bigint, text, jsonb, text, text, integer) to authenticated;
grant execute on function public.admin_delete_quiz_question(bigint) to authenticated;
grant execute on function public.admin_quiz_stats() to authenticated;

-- Keep administrator role changes behind a server-side guard.
create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_new_role public.app_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_role public.app_role;
  administrator_count bigint;
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if p_user_id is null or p_new_role is null then
    raise exception 'A user and role are required';
  end if;
  if p_user_id = auth.uid() and p_new_role <> 'admin'::public.app_role then
    raise exception 'You cannot remove your own administrator role';
  end if;

  select role into current_role
  from public.user_roles
  where user_id = p_user_id;

  if p_new_role = 'user'::public.app_role and current_role = 'admin'::public.app_role then
    select count(*) into administrator_count
    from public.user_roles
    where role = 'admin'::public.app_role;
    if administrator_count <= 1 then
      raise exception 'The last administrator cannot be removed';
    end if;
  end if;

  insert into public.user_roles(user_id, role)
  values (p_user_id, p_new_role)
  on conflict (user_id) do update set role = excluded.role;
end;
$function$;

revoke all on function public.admin_set_user_role(uuid, public.app_role) from public, anon;
grant execute on function public.admin_set_user_role(uuid, public.app_role) to authenticated;

-- Privacy-minimised article analytics: daily aggregate counts only, no visitor identifiers.
create table if not exists public.article_daily_views (
  article_id bigint not null references public.articles(id) on delete cascade,
  view_date date not null default current_date,
  view_count bigint not null default 0 check (view_count >= 0),
  primary key (article_id, view_date)
);

alter table public.article_daily_views enable row level security;
revoke all on public.article_daily_views from public, anon, authenticated;
grant all on public.article_daily_views to service_role;

create or replace function public.record_article_view(p_article_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if p_article_id is null or p_article_id < 1 then return; end if;
  if not exists (
    select 1 from public.articles
    where id = p_article_id and published = true
  ) then
    return;
  end if;

  insert into public.article_daily_views(article_id, view_date, view_count)
  values (p_article_id, current_date, 1)
  on conflict (article_id, view_date)
  do update set view_count = public.article_daily_views.view_count + 1;
end;
$function$;

create or replace function public.admin_article_view_stats()
returns table (
  article_id bigint,
  title text,
  total_views bigint,
  views_last_30_days bigint
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  return query
    select a.id, a.title,
           coalesce(sum(v.view_count), 0)::bigint,
           coalesce(sum(v.view_count) filter (where v.view_date >= current_date - 29), 0)::bigint
    from public.articles as a
    left join public.article_daily_views as v on v.article_id = a.id
    where a.published = true
    group by a.id, a.title
    order by coalesce(sum(v.view_count), 0) desc, a.title asc
    limit 10;
end;
$function$;

revoke all on function public.record_article_view(bigint) from public;
grant execute on function public.record_article_view(bigint) to anon, authenticated;
revoke all on function public.admin_article_view_stats() from public, anon;
grant execute on function public.admin_article_view_stats() to authenticated;
