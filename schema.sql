-- విద్యా సేవ – వనపర్తి
-- Supabase SQL Editor లో ఈ ఫైల్‌ను అమలు చేయండి.
-- ఈ ప్రాథమిక స్కీమా authenticated users కు మాత్రమే డేటా యాక్సెస్ ఇస్తుంది.
-- టీమ్ స్థాయి/మండల స్థాయి అనుమతులను production కు ముందు మరింత కట్టుదిట్టం చేయాలి.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'field_worker' check (role in ('admin','district_manager','field_worker')),
  assigned_mandal text,
  created_at timestamptz not null default now()
);

create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  institution_name text not null,
  institution_type text not null,
  mandal text not null,
  village text,
  issue_summary text,
  building_condition text not null default 'తెలియదు',
  drinking_water text not null default 'తెలియదు',
  toilets_condition text not null default 'తెలియదు',
  teacher_shortage text not null default 'తెలియదు',
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  reference_code text unique not null default ('VS-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  category text not null,
  mandal text not null,
  institution_name text,
  description text not null,
  status text not null default 'కొత్తది' check (status in ('కొత్తది','పరిశీలనలో','చర్య తీసుకున్నారు','పరిష్కరించబడింది','మూసివేయబడింది')),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.surveys enable row level security;
alter table public.complaints enable row level security;

-- Users can read their own profile. An administrator must provision roles securely.
create policy "profile read own" on public.profiles
  for select to authenticated using (id = auth.uid());

-- Starter policies: authenticated team members can read and create records.
-- Before public launch, replace these with role/mandal-scoped policies and add update policies.
create policy "authenticated read surveys" on public.surveys
  for select to authenticated using (true);
create policy "authenticated insert surveys" on public.surveys
  for insert to authenticated with check (created_by = auth.uid());

create policy "authenticated read complaints" on public.complaints
  for select to authenticated using (true);
create policy "authenticated insert complaints" on public.complaints
  for insert to authenticated with check (created_by = auth.uid());

create index if not exists surveys_mandal_created_idx on public.surveys(mandal, created_at desc);
create index if not exists complaints_mandal_created_idx on public.complaints(mandal, created_at desc);
create index if not exists complaints_status_idx on public.complaints(status);
