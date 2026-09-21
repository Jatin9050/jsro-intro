-- The first migration guessed at policy names when dropping, so any
-- pre-existing permissive policy survived and kept granting anon full access.
-- This drops EVERY policy on the three tables by inspection, then recreates
-- only what the public site needs: insert.

do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('event_registrations','workshop_bookings','join_us_submissions')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Enable and force RLS. FORCE also applies it to the table owner.
alter table public.event_registrations  enable row level security;
alter table public.event_registrations  force  row level security;
alter table public.workshop_bookings    enable row level security;
alter table public.workshop_bookings    force  row level security;
alter table public.join_us_submissions  enable row level security;
alter table public.join_us_submissions  force  row level security;

-- Revoke the blanket table grants PostgREST relies on for read/write.
-- anon keeps INSERT only; authenticated keeps SELECT for staff tooling.
revoke all on public.event_registrations  from anon, authenticated;
revoke all on public.workshop_bookings    from anon, authenticated;
revoke all on public.join_us_submissions  from anon, authenticated;

grant insert on public.event_registrations  to anon;
grant insert on public.workshop_bookings    to anon;
grant insert on public.join_us_submissions  to anon;

grant select, insert on public.event_registrations  to authenticated;
grant select, insert on public.workshop_bookings    to authenticated;
grant select, insert on public.join_us_submissions  to authenticated;

-- Sequences the int-keyed table needs in order to accept an insert.
grant usage, select on all sequences in schema public to anon, authenticated;

-- Policies: the public may only add a row.
create policy "public can submit a registration"
  on public.event_registrations for insert to anon with check (true);
create policy "public can request a workshop"
  on public.workshop_bookings for insert to anon with check (true);
create policy "public can submit a project"
  on public.join_us_submissions for insert to anon with check (true);

-- Signed-in staff may read.
create policy "staff can read registrations"
  on public.event_registrations for select to authenticated using (true);
create policy "staff can read workshop bookings"
  on public.workshop_bookings for select to authenticated using (true);
create policy "staff can read submissions"
  on public.join_us_submissions for select to authenticated using (true);

-- Remove the row the verification probe inserted.
delete from public.workshop_bookings where school_name = '__rls_verification__';
