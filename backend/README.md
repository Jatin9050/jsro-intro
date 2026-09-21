# jsro-backend

The server half of JSRO. **Not deployed yet** — this is a scaffold.

## Why it has to exist

The website talks to Supabase directly with the publishable key, which ships in
the browser bundle. That is fine for inserting a form submission. It is not fine
for anything that decides money or truth:

- Razorpay order creation needs the **key secret**, which cannot go in the bundle.
- The signature Razorpay returns must be verified server-side, or a client can
  forge a successful payment.
- `event_registrations.payment` and the `paid` flags must only ever be written
  with the Supabase **service role** key. A flag the browser can set is not a
  payment record.

## Planned routes

| Route | Does |
|---|---|
| `POST /orders` | Creates a Razorpay order for a registration, returns the order id |
| `POST /verify` | Verifies the signature, then marks the row paid via service role |
| `POST /webhook` | Handles Razorpay's webhook, validated against the webhook secret |
| `GET /health` | Liveness — implemented |

## Setup

```bash
cd jsro-backend
cp .env.example .env    # fill it in; never commit it
npm start
```

## Security note

An earlier `.env` in this folder was committed to a public GitHub repository. It
has been untracked, but it remains in git history. Every value it held must be
treated as leaked and rotated.
