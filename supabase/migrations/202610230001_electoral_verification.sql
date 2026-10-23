create table if not exists public.authorized_electoral_registry (
  id bigint generated always as identity primary key,
  document_hash text not null unique check (document_hash ~ '^[a-f0-9]{64}$'),
  country_code text not null default 'COL',
  election_name text,
  department text not null,
  municipality text not null,
  polling_place text not null,
  polling_place_address text,
  polling_table integer not null check (polling_table > 0),
  source text not null default 'authorized_campaign_registry',
  source_updated_at timestamptz,
  imported_at timestamptz not null default now()
);

comment on table public.authorized_electoral_registry is
  'Ubicaciones electorales recibidas de una fuente autorizada. Las cédulas se almacenan únicamente como SHA-256.';

alter table public.authorized_electoral_registry enable row level security;
revoke all on public.authorized_electoral_registry from anon, authenticated;

create table if not exists public.electoral_verification_audit (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_hash text not null check (document_hash ~ '^[a-f0-9]{64}$'),
  found boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists electoral_verification_audit_user_time_idx
  on public.electoral_verification_audit(user_id, created_at desc);
alter table public.electoral_verification_audit enable row level security;
revoke all on public.electoral_verification_audit from anon, authenticated;

create or replace function public.verify_electoral_registration(lookup_hash text)
returns table (
  election_name text,
  department text,
  municipality text,
  polling_place text,
  polling_place_address text,
  polling_table integer,
  source text,
  source_updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  was_found boolean;
begin
  if current_user_id is null or not exists (
    select 1 from public.campaign_members cm
    where cm.user_id = current_user_id and cm.active
  ) then
    return;
  end if;

  if (select count(*) from public.electoral_verification_audit a
      where a.user_id = current_user_id and a.created_at > now() - interval '1 minute') >= 20 then
    raise exception 'rate_limited';
  end if;

  select exists (
    select 1 from public.authorized_electoral_registry r where r.document_hash = lookup_hash
  ) into was_found;

  insert into public.electoral_verification_audit(user_id, document_hash, found)
  values (current_user_id, lookup_hash, was_found);

  return query
  select r.election_name, r.department, r.municipality, r.polling_place,
         r.polling_place_address, r.polling_table, r.source, r.source_updated_at
  from public.authorized_electoral_registry r
  where r.document_hash = lookup_hash
  limit 1;
end;
$$;

revoke all on function public.verify_electoral_registration(text) from public;
grant execute on function public.verify_electoral_registration(text) to authenticated;

alter table public.voter_contacts
  add column if not exists electoral_verification_status text not null default 'declared'
    check (electoral_verification_status in ('declared', 'verified')),
  add column if not exists electoral_verification_source text,
  add column if not exists electoral_verified_at timestamptz,
  add column if not exists electoral_election_name text,
  add column if not exists polling_place_address text;
