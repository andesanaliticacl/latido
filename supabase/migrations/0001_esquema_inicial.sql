-- ============================================================
-- LATIDO · Esquema inicial (Fase 1 · MVP demostrable)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ── Dispositivos y personas protegidas ──────────────────────
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- nombre del reloj, ej: "Reloj de Emilia"
  wearer_name text not null,          -- persona (o mascota) protegida
  wearer_age int,
  wearer_group text not null default 'niño',  -- niño | adulto mayor | alzheimer | tea | discapacidad | mascota
  photo_url text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz not null default now()
);

-- ── Telemetría (cada latido de datos del reloj) ─────────────
create table if not exists public.telemetry (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.devices(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  speed_kmh double precision not null default 0,
  heart_rate int not null default 0,
  battery int not null default 100,
  signal int not null default 100,    -- calidad de señal 0-100
  status text not null default 'ok',  -- ok | sos
  recorded_at timestamptz not null default now()
);
create index if not exists telemetry_device_time on public.telemetry (device_id, recorded_at desc);

-- ── Zonas seguras y de riesgo ───────────────────────────────
create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  name text not null,
  kind text not null default 'safe',  -- safe | risk
  icon text not null default '🏠',
  lat double precision not null,
  lng double precision not null,
  radius_m int not null default 150,
  created_at timestamptz not null default now()
);

-- ── Eventos y alertas ───────────────────────────────────────
create table if not exists public.events (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.devices(id) on delete cascade,
  type text not null,                 -- sos | fall | hr_high | hr_low | zone_enter | zone_exit | battery_low | offline | info
  message text not null,
  lat double precision,
  lng double precision,
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists events_device_time on public.events (device_id, created_at desc);

-- ── Realtime: difundir cambios a los paneles conectados ─────
alter publication supabase_realtime add table public.telemetry;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.zones;
alter publication supabase_realtime add table public.devices;

-- ── Seguridad (MVP demo) ────────────────────────────────────
-- RLS queda ACTIVADO con políticas abiertas al rol anon SOLO para la demo.
-- Fase 1.1: reemplazar por políticas por familia con Supabase Auth.
alter table public.devices   enable row level security;
alter table public.telemetry enable row level security;
alter table public.zones     enable row level security;
alter table public.events    enable row level security;

create policy "demo acceso total devices"   on public.devices   for all using (true) with check (true);
create policy "demo acceso total telemetry" on public.telemetry for all using (true) with check (true);
create policy "demo acceso total zones"     on public.zones     for all using (true) with check (true);
create policy "demo acceso total events"    on public.events    for all using (true) with check (true);

-- ── Dispositivo demo (el que usan panel y simulador) ────────
insert into public.devices (id, name, wearer_name, wearer_age, wearer_group,
                            emergency_contact_name, emergency_contact_phone)
values ('00000000-0000-4000-8000-000000000001',
        'LATIDO Watch demo', 'Emilia', 8, 'niño', 'Mamá', '+56 9 1234 5678')
on conflict (id) do nothing;
