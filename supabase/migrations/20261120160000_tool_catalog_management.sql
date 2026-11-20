-- Phase 3: database-backed tool catalogue and aggregate usage statistics.
create table if not exists public.tool_catalog (
 slug text primary key check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check(length(btrim(name)) between 1 and 100),
 description text not null default '' check(length(description)<=300),
 category text not null default 'Everyday' check(length(btrim(category)) between 1 and 60),
 page_path text not null check(page_path ~ '^pages/tool-[a-z0-9-]+\.html$'),
 icon text not null default '🛠️', enabled boolean not null default true,
 featured boolean not null default false, sort_order integer not null default 100,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null
);
alter table public.tool_catalog enable row level security;
revoke all on public.tool_catalog from public,anon,authenticated;
grant select(slug,name,description,category,page_path,icon,featured,sort_order) on public.tool_catalog to anon,authenticated;
drop policy if exists "Public can view enabled tools" on public.tool_catalog;
create policy "Public can view enabled tools" on public.tool_catalog for select to anon,authenticated using(enabled=true);

create table if not exists public.tool_usage_daily (
 tool_slug text not null references public.tool_catalog(slug) on delete cascade,
 usage_date date not null default current_date,
 usage_count bigint not null default 0 check(usage_count>=0),
 primary key(tool_slug,usage_date)
);
alter table public.tool_usage_daily enable row level security;
revoke all on public.tool_usage_daily from public,anon,authenticated;
grant all on public.tool_usage_daily to service_role;

insert into public.tool_catalog(slug,name,description,category,page_path,icon,featured,sort_order) values
('qr-generator','QR Code Generator','Create QR codes for links and text.','Everyday','pages/tool-qr-generator.html','▦',true,10),
('password-checker','Password Strength Checker','Check password strength locally in your browser.','Security','pages/tool-password-checker.html','🔐',true,20),
('unit-converter','Unit Converter','Convert length, weight, temperature and volume.','Everyday','pages/tool-unit-converter.html','↔',true,30),
('file-size-converter','File Size Converter','Convert bytes, KB, MB, GB and TB.','Everyday','pages/tool-file-size-converter.html','💾',false,40),
('colour-palette','Colour Palette Generator','Generate colours and copy HEX values.','Design & Code','pages/tool-colour-palette.html','🎨',true,50),
('html-playground','HTML/CSS Playground','Experiment with HTML and CSS in a sandboxed preview.','Design & Code','pages/tool-html-playground.html','</>',true,60),
('json-formatter','JSON Formatter','Validate, format and minify JSON.','Design & Code','pages/tool-json-formatter.html','{}',false,70),
('ip-information','IP Information Tool','Classify IPv4 and IPv6 addresses locally.','Security','pages/tool-ip-information.html','🌐',false,80),
('pc-planner','PC Component Planner','Check basic PC component compatibility.','Hardware','pages/tool-pc-planner.html','🖥️',true,90),
('text-utilities','Text Utilities','Count words and characters and change text case.','Everyday','pages/tool-text-utilities.html','Aa',false,100)
on conflict(slug) do nothing;

create or replace function public.admin_list_tools()
returns table(slug text,name text,description text,category text,page_path text,icon text,enabled boolean,featured boolean,sort_order integer,created_at timestamptz,updated_at timestamptz)
language plpgsql security definer set search_path=''
as $function$
begin
 if auth.uid() is null or not private.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 return query select t.slug,t.name,t.description,t.category,t.page_path,t.icon,t.enabled,t.featured,t.sort_order,t.created_at,t.updated_at from public.tool_catalog t order by t.sort_order,t.name;
end;
$function$;

create or replace function public.admin_save_tool(p_slug text,p_name text,p_description text,p_category text,p_page_path text,p_icon text,p_featured boolean,p_sort_order integer)
returns text language plpgsql security definer set search_path=''
as $function$
begin
 if auth.uid() is null or not private.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'Use a lowercase URL-safe tool slug'; end if;
 if p_name is null or length(btrim(p_name)) not between 1 and 100 then raise exception 'Tool name must be between 1 and 100 characters'; end if;
 if p_description is null or length(p_description)>300 then raise exception 'Description must be 300 characters or fewer'; end if;
 if p_category is null or length(btrim(p_category)) not between 1 and 60 then raise exception 'Enter a category between 1 and 60 characters'; end if;
 if p_page_path is null or p_page_path !~ '^pages/tool-[a-z0-9-]+\.html$' then raise exception 'Tool page must use a pages/tool-name.html path'; end if;
 insert into public.tool_catalog(slug,name,description,category,page_path,icon,featured,sort_order,updated_at,updated_by)
 values(p_slug,btrim(p_name),p_description,btrim(p_category),p_page_path,coalesce(nullif(p_icon,''),'🛠️'),coalesce(p_featured,false),coalesce(p_sort_order,100),now(),auth.uid())
 on conflict(slug) do update set name=excluded.name,description=excluded.description,category=excluded.category,page_path=excluded.page_path,icon=excluded.icon,featured=excluded.featured,sort_order=excluded.sort_order,updated_at=now(),updated_by=auth.uid();
 return p_slug;
end;
$function$;

create or replace function public.admin_toggle_tool(p_slug text,p_enabled boolean)
returns void language plpgsql security definer set search_path=''
as $function$
begin
 if auth.uid() is null or not private.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 update public.tool_catalog set enabled=coalesce(p_enabled,false),updated_at=now(),updated_by=auth.uid() where slug=p_slug;
 if not found then raise exception 'Tool not found'; end if;
end;
$function$;

create or replace function public.record_tool_usage(p_slug text)
returns void language plpgsql security definer set search_path=''
as $function$
begin
 if p_slug is null or not exists(select 1 from public.tool_catalog where slug=p_slug and enabled=true) then return; end if;
 insert into public.tool_usage_daily(tool_slug,usage_date,usage_count) values(p_slug,current_date,1)
 on conflict(tool_slug,usage_date) do update set usage_count=public.tool_usage_daily.usage_count+1;
end;
$function$;

create or replace function public.admin_tool_usage_stats()
returns table(slug text,name text,total_uses bigint,uses_last_30_days bigint)
language plpgsql security definer set search_path=''
as $function$
begin
 if auth.uid() is null or not private.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 return query select t.slug,t.name,coalesce(sum(u.usage_count),0)::bigint,coalesce(sum(u.usage_count) filter(where u.usage_date>=current_date-29),0)::bigint
 from public.tool_catalog t left join public.tool_usage_daily u on u.tool_slug=t.slug group by t.slug,t.name
 order by coalesce(sum(u.usage_count),0) desc,t.name;
end;
$function$;

revoke all on function public.admin_list_tools() from public,anon;
revoke all on function public.admin_save_tool(text,text,text,text,text,text,boolean,integer) from public,anon;
revoke all on function public.admin_toggle_tool(text,boolean) from public,anon;
revoke all on function public.record_tool_usage(text) from public;
revoke all on function public.admin_tool_usage_stats() from public,anon;
grant execute on function public.admin_list_tools() to authenticated;
grant execute on function public.admin_save_tool(text,text,text,text,text,text,boolean,integer) to authenticated;
grant execute on function public.admin_toggle_tool(text,boolean) to authenticated;
grant execute on function public.record_tool_usage(text) to anon,authenticated;
grant execute on function public.admin_tool_usage_stats() to authenticated;
