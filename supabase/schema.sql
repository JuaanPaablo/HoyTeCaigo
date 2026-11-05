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
  ('Electrónica',   '#ff6a13', 1),
  ('Urbano',        '#ffd21f', 2),
  ('Universitaria', '#ff6a13', 3),
  ('Social',        '#ffb347', 4)
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
  ('Café y Micro Abierto',     'Social',        '2026-10-28', '18:30', 'La Floresta',      array['Micrófono abierto','Host: Pame'],               'Noche de stand-up, poesía y música en vivo para conocer gente en un ambiente tranquilo.'),
  ('Perreo Pop-Art',           'Urbano',        '2026-10-23', '21:30', 'Cumbayá',          array['DJ Zaida','Lalo Beat','MC Quito'],              'Fiesta urbana con estética pop-art, pista llena y artistas locales.'),
  ('Neón Universitario',       'Electrónica',   '2026-10-17', '22:00', 'La Mariscal',      array['Kuri','Mateo Ríos','Sol B2B Nico'],             'Fiesta temática de neón con DJs de música electrónica y dress code fluorescente.'),
  ('Techno en la Terraza',     'Electrónica',   '2026-10-10', '23:00', 'Cumbayá',          array['Anka','Ro Vega','Lumen'],                       'Noche de techno al aire libre con vista a la ciudad.'),
  ('Retro 2000s',              'Universitaria', '2026-10-09', '21:00', 'La Mariscal',      array['DJ Pixel','Vale Vinilo'],                       'Los hits de los 2000 para cantar a todo pulmón con tu grupo de la universidad.'),
  ('Bienvenida Universitaria', 'Universitaria', '2026-10-03', '21:00', 'González Suárez',  array['Trío Sinapsis','DJ Chuta','Invitado sorpresa'], 'Fiesta de inicio de ciclo para que los estudiantes de distintas universidades se encuentren.')
) as e(title, cat, d, t, zone, artists, descr)
where not exists (select 1 from public.events);
