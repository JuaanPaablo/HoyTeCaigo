-- Hoy te Caigo · Contactos del formulario «Avísame» (migración para tu base de datos actual)
-- Cómo usarlo: Supabase → SQL Editor → New query → pega todo → Run. Es seguro volver a ejecutarlo.
-- (Si empiezas una base nueva, supabase/schema.sql ya incluye esto.)

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  contact     text not null,                       -- WhatsApp o correo
  source      text not null default 'landing',
  consent     boolean not null default false,      -- aceptó que le escriban
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

-- Cualquier visitante puede ENVIAR un contacto (solo si aceptó y como «nuevo»), pero no puede leer ni cambiar nada.
create policy "contactos insertar publico" on public.leads
  for insert to anon, authenticated
  with check (consent = true and status = 'nuevo' and notes is null and source = 'landing');

-- El equipo de marketing (con sesión) lee, edita y elimina.
create policy "contactos equipo" on public.leads
  for all to authenticated using (true) with check (true);
