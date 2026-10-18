create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete restrict,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  candidate_name text,
  election_name text,
  status text not null default 'planning' check (status in ('planning', 'active', 'closed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_members (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'coordinator', 'leader', 'analyst')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (campaign_id, user_id)
);

create table if not exists public.campaign_territories (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  territory_id uuid not null references public.territories(id) on delete restrict,
  status text not null default 'preparation' check (status in ('preparation', 'active', 'closed')),
  created_at timestamptz not null default now(),
  primary key (campaign_id, territory_id)
);

create table if not exists public.campaign_leaders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  territory_id uuid references public.territories(id) on delete restrict,
  full_name text not null check (char_length(full_name) between 3 and 140),
  phone text,
  email text,
  active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voter_contacts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  territory_id uuid not null references public.territories(id) on delete restrict,
  leader_id uuid references public.campaign_leaders(id) on delete set null,
  leader_name text not null check (char_length(leader_name) between 3 and 140),
  full_name text not null check (char_length(full_name) between 3 and 160),
  document_number text not null check (document_number ~ '^[0-9]{5,12}$'),
  phone text,
  email text,
  municipality text not null,
  polling_place text not null,
  polling_table text not null,
  prior_vote_choice text,
  support_level text not null default 'interested' check (support_level in ('interested', 'likely', 'confirmed', 'undecided')),
  followup_status text not null default 'pending' check (followup_status in ('pending', 'contacted', 'confirmed', 'self_reported_voted', 'inactive')),
  consent_at timestamptz not null,
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, document_number)
);

create index if not exists campaign_members_user_idx on public.campaign_members(user_id, active);
create index if not exists campaign_territories_territory_idx on public.campaign_territories(territory_id);
create index if not exists campaign_leaders_campaign_idx on public.campaign_leaders(campaign_id, active);
create index if not exists voter_contacts_campaign_territory_idx on public.voter_contacts(campaign_id, territory_id);
create index if not exists voter_contacts_campaign_place_idx on public.voter_contacts(campaign_id, municipality, polling_place);
create index if not exists voter_contacts_created_by_idx on public.voter_contacts(created_by);

drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at before update on public.campaigns
for each row execute function public.set_updated_at();

drop trigger if exists campaign_leaders_set_updated_at on public.campaign_leaders;
create trigger campaign_leaders_set_updated_at before update on public.campaign_leaders
for each row execute function public.set_updated_at();

drop trigger if exists voter_contacts_set_updated_at on public.voter_contacts;
create trigger voter_contacts_set_updated_at before update on public.voter_contacts
for each row execute function public.set_updated_at();

create or replace function public.is_campaign_member(target_campaign uuid, allowed_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.campaign_members cm
    where cm.campaign_id = target_campaign
      and cm.user_id = auth.uid()
      and cm.active
      and (allowed_roles is null or cm.role = any(allowed_roles))
  ) or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_campaign_member(uuid, text[]) from public;
grant execute on function public.is_campaign_member(uuid, text[]) to authenticated;

alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.campaign_territories enable row level security;
alter table public.campaign_leaders enable row level security;
alter table public.voter_contacts enable row level security;

revoke all on public.campaigns, public.campaign_members, public.campaign_territories, public.campaign_leaders, public.voter_contacts from anon, authenticated;
grant select on public.campaigns, public.campaign_members, public.campaign_territories, public.campaign_leaders, public.voter_contacts to authenticated;
grant insert, update, delete on public.campaigns, public.campaign_members, public.campaign_territories, public.campaign_leaders, public.voter_contacts to authenticated;

create policy "Members read campaigns" on public.campaigns for select to authenticated
using (public.is_campaign_member(id));
create policy "Admins manage campaigns" on public.campaigns for all to authenticated
using (public.is_campaign_member(id, array['admin']))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Members read memberships" on public.campaign_members for select to authenticated
using (public.is_campaign_member(campaign_id));
create policy "Admins manage memberships" on public.campaign_members for all to authenticated
using (public.is_campaign_member(campaign_id, array['admin']))
with check (public.is_campaign_member(campaign_id, array['admin']));

create policy "Members read campaign territories" on public.campaign_territories for select to authenticated
using (public.is_campaign_member(campaign_id));
create policy "Admins manage campaign territories" on public.campaign_territories for all to authenticated
using (public.is_campaign_member(campaign_id, array['admin']))
with check (public.is_campaign_member(campaign_id, array['admin']));

create policy "Members read leaders" on public.campaign_leaders for select to authenticated
using (public.is_campaign_member(campaign_id));
create policy "Coordinators manage leaders" on public.campaign_leaders for all to authenticated
using (public.is_campaign_member(campaign_id, array['admin','coordinator']))
with check (public.is_campaign_member(campaign_id, array['admin','coordinator']) and created_by = auth.uid());

create policy "Authorized members read voters" on public.voter_contacts for select to authenticated
using (
  public.is_campaign_member(campaign_id, array['admin','coordinator','analyst'])
  or created_by = auth.uid()
);
create policy "Members create voters" on public.voter_contacts for insert to authenticated
with check (public.is_campaign_member(campaign_id) and created_by = auth.uid() and consent_at is not null);
create policy "Members update permitted voters" on public.voter_contacts for update to authenticated
using (public.is_campaign_member(campaign_id, array['admin','coordinator']) or created_by = auth.uid())
with check (public.is_campaign_member(campaign_id, array['admin','coordinator']) or created_by = auth.uid());
create policy "Admins delete voters" on public.voter_contacts for delete to authenticated
using (public.is_campaign_member(campaign_id, array['admin']));

insert into public.campaigns (country_id, name, slug, election_name, status)
select c.id, 'Piloto territorial PLANdeC', 'piloto-territorial-plandec', 'Campaña territorial 2026', 'active'
from public.countries c
where c.code = 'COL'
on conflict (slug) do update set status = 'active';

insert into public.campaign_members (campaign_id, user_id, role)
select c.id, p.id, 'admin'
from public.campaigns c
join public.profiles p on p.role = 'admin'
where c.slug = 'piloto-territorial-plandec'
on conflict (campaign_id, user_id) do update set role = 'admin', active = true;

insert into public.campaign_territories (campaign_id, territory_id, status)
select c.id, t.id, case when t.slug = 'atlantico' then 'active' else 'preparation' end
from public.campaigns c
join public.territories t on t.slug in ('atlantico','norte-de-santander','bogota-dc','cundinamarca')
where c.slug = 'piloto-territorial-plandec'
on conflict (campaign_id, territory_id) do update set status = excluded.status;
