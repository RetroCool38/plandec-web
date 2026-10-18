create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'viewer' check (role in ('viewer', 'editor', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 8 and 180),
  territory text not null,
  territory_label text not null,
  summary text not null check (char_length(summary) between 20 and 500),
  content text not null check (char_length(content) between 40 and 12000),
  source_name text not null,
  source_url text not null check (source_url ~ '^https://'),
  image_url text check (image_url is null or image_url = '' or image_url ~ '^https://'),
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published')),
  published_at date,
  author_id uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or published_at is not null)
);

create index if not exists news_status_published_at_idx on public.news(status, published_at desc);
create index if not exists news_author_id_idx on public.news(author_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists news_set_updated_at on public.news;
create trigger news_set_updated_at
before update on public.news
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.news enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.news from anon, authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.news to anon, authenticated;
grant insert, update, delete on table public.news to authenticated;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Public reads published news" on public.news;
create policy "Public reads published news"
on public.news for select to anon
using (status = 'published');

drop policy if exists "Authenticated reads published news" on public.news;
create policy "Authenticated reads published news"
on public.news for select to authenticated
using (
  status = 'published'
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('editor', 'admin')
  )
);

drop policy if exists "Editors create news" on public.news;
create policy "Editors create news"
on public.news for insert to authenticated
with check (
  author_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('editor', 'admin')
  )
);

drop policy if exists "Editors update news" on public.news;
create policy "Editors update news"
on public.news for update to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('editor', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('editor', 'admin')
  )
);

drop policy if exists "Admins delete news" on public.news;
create policy "Admins delete news"
on public.news for delete to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  )
);

insert into public.news
  (slug, title, territory, territory_label, summary, content, source_name, source_url, status, published_at)
values
  (
    'barranquilla-operativo-seguridad-movilizacion-octubre-2026',
    'Barranquilla activa un operativo de seguridad para acompañar la movilización ciudadana',
    'barranquilla', 'Barranquilla y Atlántico',
    'El Distrito instaló un Puesto de Mando Unificado y coordinó un dispositivo con Policía, Fuerzas Militares, organismos de salud y autoridades de tránsito.',
    'La Alcaldía de Barranquilla anunció un dispositivo institucional para acompañar la movilización del 14 de octubre y proteger el derecho a la protesta pacífica. La coordinación incluyó un Puesto de Mando Unificado, monitoreo del recorrido, vigilancia de la infraestructura crítica, atención hospitalaria y medidas de movilidad.',
    'Alcaldía de Barranquilla',
    'https://barranquilla.gov.co/seguridad/alcaldia-de-barranquilla-y-fuerza-publica-disponen-operativo-de-seguridad-para-acompanar-marcha-este-14-de-octubre',
    'published', '2026-10-13'
  ),
  (
    'norte-santander-proyectos-plan-nacional-desarrollo-2026-2030',
    'Norte de Santander presenta sus proyectos estratégicos para el Plan Nacional de Desarrollo',
    'norte-de-santander', 'Norte de Santander',
    'La agenda regional prioriza vías, el tren del Catatumbo, hospitales, conectividad y plantas de tratamiento para buscar inversión nacional.',
    'Durante el encuentro regional para la construcción del Plan Nacional de Desarrollo 2026-2030, la Gobernación presentó una agenda de proyectos para Norte de Santander. Las propuestas reúnen infraestructura vial, salud, conectividad, desarrollo ferroviario y saneamiento básico.',
    'Cúcuta es Noticia',
    'https://cucutaesnoticia.com/norte-de-santander-busca-inversiones-millonarias-estas-son-las-obras-que-quiere-incluir-en-el-plan-nacional-de-desarrollo-2026-2030/',
    'published', '2026-10-14'
  ),
  (
    'bogota-intervencion-137-puntos-movilidad-2026',
    'Bogotá interviene 137 puntos de vías, andenes y ciclorrutas',
    'bogota', 'Bogotá D. C.',
    'La alianza entre la UMV y el IDU reportó más de 40.900 metros cuadrados intervenidos en puntos prioritarios de distintas localidades.',
    'Bogotá informó los primeros resultados del convenio entre la Unidad de Mantenimiento Vial y el Instituto de Desarrollo Urbano. Entre noviembre de 2025 y septiembre de 2026, las entidades intervinieron 137 puntos y más de 40.900 metros cuadrados de infraestructura.',
    'Portal Bogotá',
    'https://bogota.gov.co/mi-ciudad/movilidad/2026-10/bogota-mejora-137-puntos-viales-y-recupera-espacios-para-la-movilidad',
    'published', '2026-10-18'
  )
on conflict (slug) do nothing;

