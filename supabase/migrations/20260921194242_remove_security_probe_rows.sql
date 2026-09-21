-- Remove rows created while verifying the column grants and check constraints.
delete from public.event_registrations where name in ('__final__','__probe3__','__probe4__','__sec_probe__','x');
delete from public.workshop_bookings   where school_name in ('__final__','__probe2__','__rls_verification__');
delete from public.join_us_submissions where name in ('__final__','__probe2__');
