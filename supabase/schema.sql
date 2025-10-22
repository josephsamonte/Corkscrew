-- Corkscrew Supabase schema for MVP

create extension if not exists "pgcrypto";

create type role_type as enum ('hire', 'work');
create type job_status as enum ('open', 'booked', 'completed', 'cancelled');
create type application_status as enum ('applied', 'accepted', 'declined');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  role role_type not null default 'work',
  full_name text,
  bio text,
  skills text[],
  hourly_rate numeric,
  location text,
  avatar_url text,
  experience_years integer,
  certifications text[],
  availability jsonb
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Users can update their own profile" on public.profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  event_date date not null,
  start_time time,
  end_time time,
  location text not null,
  rate numeric,
  status job_status not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists jobs_event_date_idx on public.jobs (event_date);
create index if not exists jobs_status_idx on public.jobs (status);
create index if not exists jobs_client_idx on public.jobs (client_id);

alter table public.jobs enable row level security;

create policy "Anyone can view open jobs" on public.jobs
  for select using (status = 'open' or auth.uid() = client_id);

create policy "Hosts manage their jobs" on public.jobs
  for all using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  worker_id uuid not null references public.profiles (id) on delete cascade,
  cover_letter text,
  status application_status not null default 'applied',
  created_at timestamptz not null default now(),
  unique (job_id, worker_id)
);

create index if not exists job_applications_job_idx on public.job_applications (job_id);
create index if not exists job_applications_worker_idx on public.job_applications (worker_id);

alter table public.job_applications enable row level security;

create policy "Workers can apply to jobs" on public.job_applications
  for insert with check (auth.uid() = worker_id);

create policy "Workers view their applications" on public.job_applications
  for select using (auth.uid() = worker_id or auth.uid() in (select client_id from public.jobs where id = job_id));

create policy "Hosts update application status" on public.job_applications
  for update using (auth.uid() in (select client_id from public.jobs where id = job_id));

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_job_idx on public.messages (job_id);
create index if not exists messages_participants_idx on public.messages (sender_id, recipient_id);

alter table public.messages enable row level security;

create policy "Participants can view their messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Participants can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (job_id, reviewer_id)
);

create index if not exists reviews_reviewee_idx on public.reviews (reviewee_id);

alter table public.reviews enable row level security;

create policy "Participants can review each other" on public.reviews
  for insert with check (
    auth.uid() = reviewer_id
    and exists (
      select 1
      from public.job_applications ja
      where ja.job_id = job_id
        and (ja.worker_id = reviewer_id or ja.worker_id = reviewee_id)
    )
  );

create policy "Reviews are visible to authenticated users" on public.reviews
  for select using (auth.role() = 'authenticated');
