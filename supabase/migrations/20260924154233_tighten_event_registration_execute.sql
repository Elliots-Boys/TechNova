revoke execute on function public.register_for_event(bigint) from public;
revoke execute on function public.register_for_event(bigint) from anon;
grant execute on function public.register_for_event(bigint) to authenticated;
