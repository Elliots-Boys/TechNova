
revoke execute on function public.award_xp(integer,text) from public;
revoke execute on function public.award_xp(integer,text) from anon;
grant execute on function public.award_xp(integer,text) to authenticated;

revoke execute on function public.get_my_achievement_progress() from public;
revoke execute on function public.get_my_achievement_progress() from anon;
grant execute on function public.get_my_achievement_progress() to authenticated;

revoke execute on function public.get_my_tickets() from public;
revoke execute on function public.get_my_tickets() from anon;
grant execute on function public.get_my_tickets() to authenticated;

revoke execute on function public.get_leaderboard(integer) from public;
revoke execute on function public.get_leaderboard(integer) from anon;
grant execute on function public.get_leaderboard(integer) to authenticated;
