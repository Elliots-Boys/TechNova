create unique index if not exists event_registrations_event_user_uidx on public.event_registrations(event_id,user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.register_for_event(p_event_id bigint)
returns public.event_registrations
language plpgsql
security invoker
set search_path = public
as $$
declare
  result public.event_registrations;
  current_count integer;
  event_capacity integer;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select capacity into event_capacity from public.events where id = p_event_id for update;
  if event_capacity is null then raise exception 'Event not found'; end if;
  select count(*) into current_count from public.event_registrations where event_id = p_event_id;
  if current_count >= event_capacity then raise exception 'This event is full'; end if;
  insert into public.event_registrations(event_id,user_id)
  values(p_event_id,auth.uid())
  on conflict(event_id,user_id) do nothing
  returning * into result;
  if result.id is null then raise exception 'Already registered for this event'; end if;
  return result;
end;
$$;

grant execute on function public.register_for_event(bigint) to authenticated;
