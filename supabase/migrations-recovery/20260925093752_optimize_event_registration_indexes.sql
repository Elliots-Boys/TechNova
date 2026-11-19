drop index if exists public.event_registrations_event_user_uidx; create index if not exists event_registrations_user_id_idx on public.event_registrations(user_id);
