create table if not exists public.lux_clients (
  phone text primary key,
  first_name text not null,
  last_name text not null,
  notes text default '',
  source text default 'client',
  created_at text default current_date::text
);

create table if not exists public.lux_bookings (
  id uuid primary key,
  barber_id text not null,
  service_id text not null,
  date date not null,
  time text not null,
  name text not null,
  phone text not null,
  note text default '',
  paid_amount integer not null default 0,
  status text not null default 'confirmed',
  created_at timestamptz default now(),
  cancelled_at timestamptz,
  completed_at timestamptz
);

alter table public.lux_clients enable row level security;
alter table public.lux_bookings enable row level security;

drop policy if exists "Lux public clients read" on public.lux_clients;
drop policy if exists "Lux public clients insert" on public.lux_clients;
drop policy if exists "Lux public clients update" on public.lux_clients;
drop policy if exists "Lux public bookings read" on public.lux_bookings;
drop policy if exists "Lux public bookings insert" on public.lux_bookings;
drop policy if exists "Lux public bookings update" on public.lux_bookings;

create policy "Lux public clients read" on public.lux_clients
  for select using (true);

create policy "Lux public clients insert" on public.lux_clients
  for insert with check (true);

create policy "Lux public clients update" on public.lux_clients
  for update using (true) with check (true);

create policy "Lux public bookings read" on public.lux_bookings
  for select using (true);

create policy "Lux public bookings insert" on public.lux_bookings
  for insert with check (true);

create policy "Lux public bookings update" on public.lux_bookings
  for update using (true) with check (true);
