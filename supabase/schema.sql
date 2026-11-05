-- Hoy te Caigo · base de datos del panel de contenido (Supabase)
-- Cómo usarlo: Supabase → SQL Editor → pega todo este archivo → Run. Es seguro volver a ejecutarlo.

-- ========== Tablas ==========
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  color       text not null default '#ff6a13',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.videos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  caption     text,
  src         text not null,          -- URL completa del video (R2, Supabase Storage u otra)
  poster_url  text,                   -- URL de la portada (imagen)
  sort_order  int  not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  category_id  uuid references public.categories(id) on delete restrict,
  event_date   date not null,
  event_time   time,
  zone         text,
  artists      text[] not null default '{}',
  description  text,
  image_url    text,
  video_id     uuid references public.videos(id) on delete set null,
  published    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists events_date_idx on public.events (event_date desc);

-- ========== Seguridad (RLS) ==========
-- Visitantes: solo leen lo publicado. Equipo de marketing (usuarios con sesión): leen y escriben todo.
alter table public.categories enable row level security;
alter table public.videos     enable row level security;
alter table public.events     enable row level security;

drop policy if exists "categorias lectura publica" on public.categories;
drop policy if exists "categorias equipo"          on public.categories;
create policy "categorias lectura publica" on public.categories for select using (true);
create policy "categorias equipo" on public.categories for all to authenticated using (true) with check (true);

drop policy if exists "videos lectura publica" on public.videos;
drop policy if exists "videos equipo"          on public.videos;
create policy "videos lectura publica" on public.videos for select using (published = true);
create policy "videos equipo" on public.videos for all to authenticated using (true) with check (true);

drop policy if exists "eventos lectura publica" on public.events;
drop policy if exists "eventos equipo"          on public.events;
create policy "eventos lectura publica" on public.events for select using (published = true);
create policy "eventos equipo" on public.events for all to authenticated using (true) with check (true);

-- ========== Almacenamiento de fotos y videos ==========
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media lectura publica" on storage.objects;
drop policy if exists "media equipo subir"    on storage.objects;
drop policy if exists "media equipo editar"   on storage.objects;
drop policy if exists "media equipo borrar"   on storage.objects;
create policy "media lectura publica" on storage.objects for select using (bucket_id = 'media');
create policy "media equipo subir"  on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "media equipo editar" on storage.objects for update to authenticated using (bucket_id = 'media');
create policy "media equipo borrar" on storage.objects for delete to authenticated using (bucket_id = 'media');

-- ========== Datos iniciales (los mismos de ejemplo de la página) ==========
insert into public.categories (name, color, sort_order) values
  ('Universitarios', '#ff6a13', 1),
  ('Culturales',     '#ffb347', 2),
  ('Provinciales',   '#ffd21f', 3),
  ('Corporativos',   '#ff6a13', 4)
on conflict (name) do nothing;

-- Videos que ya subiste al bucket de Cloudflare R2 (ajusta títulos desde el panel).
insert into public.videos (title, caption, src, poster_url, sort_order)
select * from (values
  ('Evento 1', 'Video del evento', 'https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/clip-1.mp4', 'https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/poster-1.jpg', 1),
  ('Evento 2', 'Video del evento', 'https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/clip-2.mp4', 'https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/poster-2.jpg', 2),
  ('Evento 3', 'Video del evento', 'https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/clip-3.mp4', 'https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/poster-3.jpg', 3),
  ('Evento 4', 'Video del evento', 'https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/clip-4.mp4', 'https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/poster-4.jpg', 4),
  ('Evento 5', 'Video del evento', 'https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/clip-5.mp4', 'https://pub-618376711601422cada62a8ebf4b0b92.r2.dev/poster-5.jpg', 5)
) as v(title, caption, src, poster_url, sort_order)
where not exists (select 1 from public.videos);

insert into public.events (title, category_id, event_date, event_time, zone, artists, description)
select e.title, (select id from public.categories where name = e.cat), e.d::date, e.t::time, e.zone, e.artists, e.descr
from (values
  ('Festival Cultural de Primavera', 'Culturales',     '2026-10-28', '18:30', 'Quito',      array['Artistas invitados','Presenta: Pame'],          'Jornada de música, poesía y artes en vivo abierta a toda la ciudad.'),
  ('Feria Universitaria',            'Universitarios', '2026-10-23', '10:00', 'Quito',      array['DJ Zaida','MC Quito'],                          'Encuentro de estudiantes de distintas universidades con escenario, stands y activaciones.'),
  ('Gran Concierto Provincial',      'Provinciales',   '2026-10-17', '20:00', 'Cuenca',     array['Kuri','Mateo Ríos','Sol B2B Nico'],             'Producción de gran formato con escenario, sonido e iluminación para miles de asistentes.'),
  ('Lanzamiento de Marca',           'Corporativos',   '2026-10-10', '19:00', 'Guayaquil',  array['Anka','Ro Vega'],                               'Evento de presentación para clientes y medios, con ambientación y show en vivo.'),
  ('Encuentro Cultural',             'Culturales',     '2026-10-09', '19:00', 'Ambato',     array['DJ Pixel','Vale Vinilo'],                       'Noche de música y cultura local en un formato cercano para la comunidad.'),
  ('Bienvenida Universitaria',       'Universitarios', '2026-10-03', '21:00', 'Quito',      array['Trío Sinapsis','DJ Chuta','Invitado sorpresa'], 'Evento de inicio de ciclo para que los estudiantes de distintas universidades se encuentren.')
) as e(title, cat, d, t, zone, artists, descr)
where not exists (select 1 from public.events);

-- ========== Contactos del formulario «Avísame» ==========
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  contact     text not null,
  source      text not null default 'landing',
  consent     boolean not null default false,
  status      text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'descartado')),
  notes       text,
  created_at  timestamptz not null default now(),
  constraint leads_contact_len check (char_length(contact) between 5 and 120),
  constraint leads_name_len    check (name is null or char_length(name) <= 60)
);
create index if not exists leads_created_idx on public.leads (created_at desc);
alter table public.leads enable row level security;
drop policy if exists "contactos insertar publico" on public.leads;
drop policy if exists "contactos equipo"           on public.leads;
create policy "contactos insertar publico" on public.leads
  for insert to anon, authenticated
  with check (consent = true and status = 'nuevo' and notes is null and source = 'landing');
create policy "contactos equipo" on public.leads
  for all to authenticated using (true) with check (true);
