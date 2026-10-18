create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z]{3}$'),
  name text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.territories (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete restrict,
  parent_id uuid references public.territories(id) on delete restrict,
  name text not null,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  territory_type text not null check (
    territory_type in ('region', 'department', 'state', 'province', 'capital_district', 'municipality', 'district', 'locality')
  ),
  official_code text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);

create unique index if not exists territories_hierarchy_slug_idx
on public.territories(country_id, coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);

create index if not exists territories_country_parent_idx
on public.territories(country_id, parent_id);

alter table public.news
add column if not exists territory_id uuid references public.territories(id) on delete set null;

create index if not exists news_territory_id_idx on public.news(territory_id);

alter table public.countries enable row level security;
alter table public.territories enable row level security;

revoke all on table public.countries from anon, authenticated;
revoke all on table public.territories from anon, authenticated;
grant select on table public.countries to anon, authenticated;
grant select on table public.territories to anon, authenticated;

drop policy if exists "Public reads active countries" on public.countries;
create policy "Public reads active countries"
on public.countries for select to anon, authenticated
using (active = true);

drop policy if exists "Public reads active territories" on public.territories;
create policy "Public reads active territories"
on public.territories for select to anon, authenticated
using (active = true);

insert into public.countries (code, name, slug)
values
  ('COL', 'Colombia', 'colombia'),
  ('PAN', 'Panamá', 'panama'),
  ('NLD', 'Países Bajos', 'paises-bajos')
on conflict (code) do update
set name = excluded.name, slug = excluded.slug, active = true;

insert into public.territories (country_id, name, slug, territory_type, official_code)
select c.id, seed.name, seed.slug, seed.territory_type, seed.official_code
from public.countries c
cross join (
  values
    ('Atlántico', 'atlantico', 'department', '08'),
    ('Norte de Santander', 'norte-de-santander', 'department', '54'),
    ('Bogotá D. C.', 'bogota-dc', 'capital_district', '11'),
    ('Cundinamarca', 'cundinamarca', 'department', '25')
) as seed(name, slug, territory_type, official_code)
where c.code = 'COL'
  and not exists (
    select 1
    from public.territories t
    where t.country_id = c.id and t.parent_id is null and t.slug = seed.slug
  );

update public.news n
set territory_id = t.id
from public.territories t
join public.countries c on c.id = t.country_id
where c.code = 'COL'
  and t.parent_id is null
  and (
    (n.territory = 'barranquilla' and t.slug = 'atlantico')
    or (n.territory = 'norte-de-santander' and t.slug = 'norte-de-santander')
    or (n.territory = 'bogota' and t.slug = 'bogota-dc')
    or (n.territory = 'cundinamarca' and t.slug = 'cundinamarca')
  );
