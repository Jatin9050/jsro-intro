# Supabase

## Current state (verified against the live project)

Three tables back the public forms:

| Table | Written by | Extra columns not set by the app |
|---|---|---|
| `event_registrations` | event registration form | `payment` (bool), `created_at` |
| `workshop_bookings` | homepage workshop form | `completed`, `agreed`, `paid` (bool), `created_at` |
| `join_us_submissions` | homepage join-us form | `completed`, `agreed`, `paid` (bool), `created_at` |

## Open security issue

Row level security is off, or its policies are permissive. The browser-side
publishable key can read, modify and delete every row. Apply
`001_lock_down_rls.sql` and re-verify before any further data is collected.

Once the payment flow exists, `payment` / `paid` must only ever be written by a
server holding the `service_role` key, never by the browser. A flag the client
can set is not a payment record.
