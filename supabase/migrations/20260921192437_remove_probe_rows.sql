-- Remove the rows inserted while verifying that public INSERT still works
-- after row level security was enforced.
delete from public.workshop_bookings   where school_name = '__probe2__';
delete from public.event_registrations where name        = '__probe2__';
delete from public.workshop_bookings   where school_name = '__rls_verification__';
