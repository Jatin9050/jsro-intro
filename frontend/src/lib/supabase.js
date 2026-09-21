import { createClient } from '@supabase/supabase-js';

// One client for the whole app. The URL and the publishable key are safe in the
// bundle — row-level security in Supabase is what protects the tables — but they
// live in env vars so staging and production can differ without a code change.
// Set them in `.env.local`; the fallbacks keep the current deployment working.
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL || 'https://djezyrrnmqqhopamttkb.supabase.co';
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  'sb_publishable_DbgXDjtunz3CeFT2MLTKvQ_EDGFaaeW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table names, so a typo fails in one place instead of silently inserting nothing.
export const TABLES = {
  eventRegistrations: 'event_registrations',
  workshopBookings: 'workshop_bookings',
  joinUs: 'join_us_submissions',
};
