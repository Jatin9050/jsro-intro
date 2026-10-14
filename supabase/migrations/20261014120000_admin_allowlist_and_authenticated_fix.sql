-- ============================================================================
-- SECURITY FIX — found in the pre-build review.
--
-- Migration 20260921192355 locked down the `anon` role but left `authenticated`
-- open: three "staff can read" policies used `using (true)`. Supabase email
-- signup is enabled by default, so anyone could create an account, confirm
-- their own address, and read every registration, booking and submission.
--
-- It also granted `authenticated` table-wide INSERT, which bypassed the
-- column-level lock on the payment flags. RLS blocked it only because no insert
-- policy existed for that role — one policy away from payment forgery.
--
-- Replace "any signed-in user" with an explicit admin allow-list.
-- ============================================================================

-- Helpers that must not be callable through the REST API live here. Supabase
-- exposes only the `public` schema by default.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

-- ---------------------------------------------------------------- admins
create table if not exists public.admins (
  email    text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;
alter table public.admins force row level security;
revoke all on public.admins from anon, authenticated;
-- Deliberately no policies: the allow-list is never read through the API.

-- True only for a signed-in user whose CONFIRMED email is on the allow-list.
-- The confirmation check matters: without it, anyone could sign up as an
-- admin's address and inherit the role before proving they own the inbox.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on lower(u.email) = a.email
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

insert into public.admins (email) values ('info@jsro.in') on conflict do nothing;

-- ------------------------------------------- replace the permissive policies
drop policy if exists "staff can read registrations"       on public.event_registrations;
drop policy if exists "staff can read workshop bookings"   on public.workshop_bookings;
drop policy if exists "staff can read submissions"         on public.join_us_submissions;

create policy "admins can read registrations"
  on public.event_registrations for select to authenticated using (public.is_admin());
create policy "admins can read workshop bookings"
  on public.workshop_bookings   for select to authenticated using (public.is_admin());
create policy "admins can read join us submissions"
  on public.join_us_submissions for select to authenticated using (public.is_admin());

-- ------------------------------- close the authenticated insert side door
revoke insert on public.event_registrations from authenticated;
revoke insert on public.workshop_bookings   from authenticated;
revoke insert on public.join_us_submissions from authenticated;

-- A signed-in admin browsing the site must still be able to use the public
-- forms, so give `authenticated` exactly what `anon` has, column for column.
grant insert (school_name, contact_no, school_email)
  on public.workshop_bookings   to authenticated;
grant insert (name, email, phone, school, youtube_link)
  on public.join_us_submissions to authenticated;

drop policy if exists "public can request a workshop" on public.workshop_bookings;
drop policy if exists "public can submit a project"   on public.join_us_submissions;
create policy "public can request a workshop"
  on public.workshop_bookings   for insert to anon, authenticated with check (true);
create policy "public can submit a project"
  on public.join_us_submissions for insert to anon, authenticated with check (true);
