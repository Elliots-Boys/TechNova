create policy "Admins can view all reports" on public.reports for select to authenticated using ((select private.is_admin()));

create policy "Admins can update reports" on public.reports for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
