-- JSRO — row level security for the three public form tables.
--
-- WHY THIS EXISTS
-- The publishable ("anon") key ships inside the browser bundle. Anyone can read
-- it out of the JavaScript and call the REST API with it. Verified on the live
-- project: that key could SELECT, UPDATE and DELETE every row in all three
-- tables — names, emails, phone numbers, schools, and the payment flags.
--
-- The public site only ever needs to INSERT. Reading and editing belongs to
-- JSRO staff, who authenticate, or to a server holding the service_role key.
--
-- Run this in the Supabase SQL editor. Review each statement first.

-- ---------------------------------------------------------------- registrations
alter table public.event_registrations enable row level security;
alter table public.event_registrations force row level security;

drop policy if exists "anon can read registrations"    on public.event_registrations;
drop policy if exists "anon can update registrations"  on public.event_registrations;
drop policy if exists "anon can delete registrations"  on public.event_registrations;
drop policy if exists "public can submit a registration" on public.event_registrations;

create policy "public can submit a registration"
  on public.event_registrations
  for insert
  to anon
  with check (true);

-- Signed-in staff can read. No anon SELECT / UPDATE / DELETE policy exists,
-- so with RLS on, those are denied by default.
create policy "staff can read registrations"
  on public.event_registrations
  for select
  to authenticated
  using (true);

-- ------------------------------------------------------------ workshop bookings
alter table public.workshop_bookings enable row level security;
alter table public.workshop_bookings force row level security;

drop policy if exists "anon can read workshop bookings"   on public.workshop_bookings;
drop policy if exists "anon can update workshop bookings" on public.workshop_bookings;
drop policy if exists "public can request a workshop"     on public.workshop_bookings;

create policy "public can request a workshop"
  on public.workshop_bookings
  for insert
  to anon
  with check (true);

create policy "staff can read workshop bookings"
  on public.workshop_bookings
  for select
  to authenticated
  using (true);

-- ----------------------------------------------------------- join us submissions
alter table public.join_us_submissions enable row level security;
alter table public.join_us_submissions force row level security;

drop policy if exists "anon can read submissions"   on public.join_us_submissions;
drop policy if exists "anon can update submissions" on public.join_us_submissions;
drop policy if exists "public can submit a project" on public.join_us_submissions;

create policy "public can submit a project"
  on public.join_us_submissions
  for insert
  to anon
  with check (true);

create policy "staff can read submissions"
  on public.join_us_submissions
  for select
  to authenticated
  using (true);

-- ------------------------------------------------------------------ verification
-- Every table should report rowsecurity = true.
--   select relname, relrowsecurity, relforcerowsecurity
--   from pg_class
--   where relname in ('event_registrations','workshop_bookings','join_us_submissions');
--
-- Then re-run the probe: an anon SELECT must return [] and an anon DELETE must
-- fail. The site's forms must still submit successfully.
