create or replace function public.register_for_event(p_event_id bigint)
returns public.event_registrations
language plpgsql
security definer
set search_path = public
as $function$
declare
  result public.event_registrations;
  current_count integer;
  event_capacity integer;
  found_event_id bigint;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select e.id, e.capacity
    into found_event_id, event_capacity
  from public.events e
  where e.id = p_event_id
  for update;

  if not found then
    raise exception 'Event not found (ID: %)', p_event_id;
  end if;

  if exists (
    select 1
    from public.event_registrations er
    where er.event_id = p_event_id
      and er.user_id = auth.uid()
  ) then
    raise exception 'Already registered for this event';
  end if;

  select count(*)
    into current_count
  from public.event_registrations
  where event_id = p_event_id;

  if event_capacity is not null and current_count >= event_capacity then
    raise exception 'This event is full';
  end if;

  insert into public.event_registrations(event_id, user_id)
  values (p_event_id, auth.uid())
  returning * into result;

  return result;
end;
$function$;

revoke all on function public.register_for_event(bigint) from public;
grant execute on function public.register_for_event(bigint) to authenticated;
