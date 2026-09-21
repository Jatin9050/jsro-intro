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

## Applying migrations

Migrations live in `supabase/migrations/` and run in filename order.

### Option A — dashboard (no credentials needed)

Open the project → SQL Editor → New query → paste the migration file → Run.

### Option B — CLI

Needs two secrets. Set them yourself; do not paste them into a chat or a file
that git can see.

```bash
export SUPABASE_ACCESS_TOKEN=...        # Account → Access Tokens
npx supabase link --project-ref djezyrrnmqqhopamttkb
npx supabase db push                    # prompts for the database password
```

`db push` applies only migrations the remote has not seen, and records them in
the `supabase_migrations` schema.

### Verifying

```sql
select relname, relrowsecurity, relforcerowsecurity
from pg_class
where relname in ('event_registrations','workshop_bookings','join_us_submissions');
```

All three must report `true`. Then an anonymous SELECT must return nothing, and
the site's forms must still submit.
