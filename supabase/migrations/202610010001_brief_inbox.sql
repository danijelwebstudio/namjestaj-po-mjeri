-- One company per Supabase project. Never reuse this project across unrelated firms.
create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.leads (
  id uuid primary key,
  reference text not null,
  created_at timestamptz not null default now(),
  data jsonb not null,
  files jsonb not null default '[]',
  status text not null default 'new' check (status in ('new','contacted','measuring','quoted','accepted','declined')),
  internal_note text not null default '' check (length(internal_note) <= 4000),
  consent_at timestamptz not null default now()
);
create table if not exists public.brief_requests (
  id uuid primary key,
  created_at timestamptz not null default now(),
  ip_hash text not null,
  manifest_hash text not null,
  state text not null default 'processing' check (state in ('processing','complete','failed'))
);
alter table public.staff enable row level security;
alter table public.leads enable row level security;
alter table public.brief_requests enable row level security;
revoke all on public.staff, public.leads, public.brief_requests from anon, authenticated;
grant select on public.staff, public.leads to authenticated;
grant update(status, internal_note) on public.leads to authenticated;
grant all on public.staff, public.leads, public.brief_requests to service_role;
create policy "Staff sees own membership" on public.staff for select to authenticated using (user_id = (select auth.uid()));
create policy "Company staff reads leads" on public.leads for select to authenticated using (exists (select 1 from public.staff where user_id = (select auth.uid())));
create policy "Company staff changes status and note" on public.leads for update to authenticated using (exists (select 1 from public.staff where user_id = (select auth.uid()))) with check (exists (select 1 from public.staff where user_id = (select auth.uid())));

insert into storage.buckets(id, name, public, file_size_limit)
values ('brief-files', 'brief-files', false, 26214400)
on conflict(id) do update set public = false, file_size_limit = 26214400;
create policy "Company staff reads private brief files" on storage.objects for select to authenticated
using (bucket_id = 'brief-files' and exists (select 1 from public.staff where user_id = (select auth.uid())));
-- No anonymous access, no browser upload permission. Only the validated Edge Function writes.

create or replace function public.reserve_brief(request_id uuid, request_ip text, request_hash text)
returns text language plpgsql security definer set search_path = public as $$
declare existing public.brief_requests%rowtype;
begin
  perform pg_advisory_xact_lock(hashtext(request_ip));
  select * into existing from public.brief_requests where id = request_id for update;
  if found then
    if existing.manifest_hash <> request_hash then return 'changed'; end if;
    if existing.state = 'complete' then return 'complete'; end if;
    if existing.state = 'processing' then return 'processing'; end if;
    update public.brief_requests set state = 'processing', created_at = now() where id = request_id;
    return 'reserved';
  end if;
  if (select count(*) from public.brief_requests where ip_hash = request_ip and created_at > now() - interval '1 hour') >= 10 then return 'limited'; end if;
  insert into public.brief_requests(id, ip_hash, manifest_hash) values(request_id, request_ip, request_hash);
  return 'reserved';
end $$;
revoke all on function public.reserve_brief(uuid,text,text) from public, anon, authenticated;
grant execute on function public.reserve_brief(uuid,text,text) to service_role;

create or replace function public.complete_brief(request_id uuid, request_data jsonb, request_files jsonb, request_reference text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform 1 from public.brief_requests where id = request_id and state = 'processing' for update;
  if not found then raise exception 'Missing reservation'; end if;
  insert into public.leads(id, data, files, reference) values (request_id, request_data, request_files, request_reference);
  update public.brief_requests set state = 'complete' where id = request_id;
end $$;
revoke all on function public.complete_brief(uuid,jsonb,jsonb,text) from public, anon, authenticated;
grant execute on function public.complete_brief(uuid,jsonb,jsonb,text) to service_role;
create index if not exists brief_requests_ip_time on public.brief_requests(ip_hash, created_at);
create index if not exists leads_newest on public.leads(created_at desc);
