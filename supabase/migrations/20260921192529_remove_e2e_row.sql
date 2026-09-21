-- Remove the row created by the end-to-end check that the registration form
-- still submits under row level security.
delete from public.event_registrations where name like 'e2e-%';
