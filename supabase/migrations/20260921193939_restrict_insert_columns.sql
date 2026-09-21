-- An RLS policy controls WHICH ROWS may be written, not which COLUMNS.
-- With `grant insert` on the whole table, anyone holding the publishable key
-- could post a registration with payment = true and it would be accepted.
-- Verified against the live project: HTTP 201.
--
-- Column-level grants are the fix. anon may write only the form fields; the
-- money and workflow columns fall back to their defaults and can be set only
-- by the service role.

-- Clear rows created by security probing, before any constraint is added.
delete from public.event_registrations
  where name in ('__sec_probe__','__probe3__','__probe4__','__probe2__')
     or event = '__sec_probe__'
     or trim(coalesce(name,'')) = '';
delete from public.workshop_bookings
  where school_name in ('__probe2__','__rls_verification__');

-- Safe defaults before the columns are locked down.
alter table public.event_registrations alter column payment   set default false;
alter table public.workshop_bookings   alter column paid      set default false;
alter table public.workshop_bookings   alter column agreed    set default false;
alter table public.workshop_bookings   alter column completed set default false;
alter table public.join_us_submissions alter column paid      set default false;
alter table public.join_us_submissions alter column agreed    set default false;
alter table public.join_us_submissions alter column completed set default false;

-- Replace the table-wide insert grant with a column-scoped one.
revoke insert on public.event_registrations from anon;
revoke insert on public.workshop_bookings   from anon;
revoke insert on public.join_us_submissions from anon;

grant insert (name, email, phone, school, event)
  on public.event_registrations to anon;
grant insert (school_name, contact_no, school_email)
  on public.workshop_bookings to anon;
grant insert (name, email, phone, school, youtube_link)
  on public.join_us_submissions to anon;

-- Reject blank submissions at the database too. NOT VALID applies the rule to
-- new and updated rows without retroactively rejecting historical data.
alter table public.event_registrations
  add constraint event_registrations_required_fields
  check (length(trim(name)) > 0 and length(trim(email)) > 0 and position('@' in email) > 1)
  not valid;

alter table public.workshop_bookings
  add constraint workshop_bookings_required_fields
  check (length(trim(school_name)) > 0 and length(trim(school_email)) > 0 and position('@' in school_email) > 1)
  not valid;

alter table public.join_us_submissions
  add constraint join_us_submissions_required_fields
  check (length(trim(name)) > 0 and length(trim(email)) > 0 and position('@' in email) > 1)
  not valid;
