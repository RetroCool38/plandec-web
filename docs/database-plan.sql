-- PLANdeC campaign database · PostgreSQL / Supabase
-- Run after enabling PostGIS in the `extensions` schema.

create type public.app_role as enum ('admin', 'coordinator', 'leader');
create type public.prior_choice_category as enum ('same_project', 'other_option', 'did_not_vote', 'prefer_not_to_answer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'leader',
  department_code text,
  municipality_code text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.departments (
  code text primary key,
  name text not null,
  geometry extensions.geometry(MultiPolygon, 4326)
);

create table public.municipalities (
  department_code text not null references public.departments(code),
  code text not null,
  name text not null,
  geometry extensions.geometry(MultiPolygon, 4326),
  primary key (department_code, code)
);

create table public.polling_places (
  id bigint generated always as identity primary key,
  department_code text not null,
  municipality_code text not null,
  zone_code text not null,
  place_code text not null,
  name text not null,
  address text,
  location extensions.geography(Point, 4326),
  unique (department_code, municipality_code, zone_code, place_code),
  foreign key (department_code, municipality_code) references public.municipalities(department_code, code)
);

create table public.voting_tables (
  id bigint generated always as identity primary key,
  polling_place_id bigint not null references public.polling_places(id) on delete cascade,
  table_number integer not null check (table_number > 0),
  unique (polling_place_id, table_number)
);

create table public.supporter_records (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  document_number text not null,
  phone text,
  email text,
  polling_place_id bigint not null references public.polling_places(id),
  voting_table_id bigint references public.voting_tables(id),
  leader_id uuid not null references public.profiles(id),
  prior_choice public.prior_choice_category not null default 'prefer_not_to_answer',
  consent_granted boolean not null check (consent_granted),
  consent_at timestamptz not null,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_number)
);

create table public.elections (
  id bigint generated always as identity primary key,
  year integer not null,
  department_code text not null references public.departments(code),
  corporation_code text not null,
  corporation_name text not null,
  unique (year, department_code, corporation_code)
);

create table public.electoral_results (
  election_id bigint not null references public.elections(id) on delete cascade,
  polling_place_id bigint not null references public.polling_places(id),
  voting_table_id bigint references public.voting_tables(id),
  party_code text not null,
  party_name text not null,
  candidate_code text not null,
  candidate_name text not null,
  votes integer not null check (votes >= 0),
  primary key (election_id, polling_place_id, voting_table_id, party_code, candidate_code)
);

create index polling_places_location_idx on public.polling_places using gist (location);
create index supporter_records_place_idx on public.supporter_records (polling_place_id);
create index supporter_records_leader_idx on public.supporter_records (leader_id);
create index electoral_results_place_idx on public.electoral_results (election_id, polling_place_id);

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.municipalities enable row level security;
alter table public.polling_places enable row level security;
alter table public.voting_tables enable row level security;
alter table public.supporter_records enable row level security;
alter table public.elections enable row level security;
alter table public.electoral_results enable row level security;

revoke all on all tables in schema public from anon;
grant select on public.departments, public.municipalities, public.polling_places, public.voting_tables, public.elections, public.electoral_results to authenticated;
grant select, insert, update on public.supporter_records to authenticated;

create policy "authenticated users read electoral catalogs" on public.departments for select to authenticated using (true);
create policy "authenticated users read municipalities" on public.municipalities for select to authenticated using (true);
create policy "authenticated users read polling places" on public.polling_places for select to authenticated using (true);
create policy "authenticated users read voting tables" on public.voting_tables for select to authenticated using (true);
create policy "authenticated users read elections" on public.elections for select to authenticated using (true);
create policy "authenticated users read aggregate results" on public.electoral_results for select to authenticated using (true);
create policy "leaders insert their own records" on public.supporter_records for insert to authenticated with check (created_by = auth.uid() and consent_granted = true);
create policy "leaders read their own records" on public.supporter_records for select to authenticated using (created_by = auth.uid());
create policy "leaders update their own records" on public.supporter_records for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
