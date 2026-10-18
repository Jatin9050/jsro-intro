# jsro-backend

The server half of JSRO: Razorpay payments. Everything the browser must not be
trusted with lives here.

## Why it has to exist

The website talks to Supabase directly with the publishable key, which ships in
the browser bundle. That is fine for inserting a form submission. It is not fine
for anything that decides money or truth:

- Razorpay order creation needs the **key secret**, which cannot go in the bundle.
- The signature Razorpay returns must be verified server-side, or a client can
  forge a successful payment.
- `payments` and `event_registrations.payment` are written only with the
  Supabase **service role** key. A flag the browser can set is not a payment record.

## Routes

| Route | Does |
|---|---|
| `POST /api/create-order` | Body `{ registration_code, email }`. Looks the fee up in the database (never from the request), creates a Razorpay order for it, returns `{ order_id, amount, currency, key_id }`. Reuses an open order; refuses an already-paid registration. |
| `POST /api/verify-payment` | Body `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`. Checks `HMAC-SHA256(order_id + "\|" + payment_id, key_secret)`; only on a match marks the payment paid. Mismatch is a 400 and nothing is recorded. |
| `GET /health` | Liveness (local server only). |
| `POST /api/razorpay-webhook` | Razorpay's server-to-server notice (`payment.captured`, `order.paid`). Checks `X-Razorpay-Signature` (HMAC-SHA256 of the raw body with the webhook secret), then records the payment only if the order is ours and the amount matches. This is what records a payment when the buyer closes the tab before the page reports back. |

The logic is in `src/payments/` and is the same code in both places it runs:

- **Production:** Vercel functions in `/api` (`create-order.mjs`, `verify-payment.mjs`, `razorpay-webhook.mjs`) import it.
- **Local:** `src/index.js` is a plain Node server for the same routes.

## Setup

```bash
cp .env.example .env     # fill it in; never commit it
npm run server           # from the repo root; listens on :8080
npm start                # in another terminal; the frontend proxies /api to :8080
```

| Variable | Where it goes |
|---|---|
| `RAZORPAY_KEY_ID` | `backend/.env` and the Vercel project |
| `RAZORPAY_KEY_SECRET` | `backend/.env` and the Vercel project. **Server only.** |
| `RAZORPAY_WEBHOOK_SECRET` | Vercel project (and `backend/.env` to test locally). The secret you type into Razorpay's webhook form; **not** the API key secret. |
| `SUPABASE_URL` | `backend/.env` and the Vercel project |
| `SUPABASE_SERVICE_ROLE_KEY` | `backend/.env` and the Vercel project. **Server only; bypasses row level security.** |
| `REACT_APP_RAZORPAY_KEY_ID` | Optional (`frontend/.env.local`). The key id is public by design, and the server also returns it with each order, so production does not need it. |

## Turning payment on for an event

Payment is off until all of this is done:

1. Apply the `payments` migration (`supabase/migrations/20261017120000_payments.sql`).
2. Set the fee, in paise: `update public.event_settings set fee_paise = 10000 where slug = 'innovation-challenge';`
   While `fee_paise` is null the API refuses to create an order.
3. Set `paymentsOpen: true` for the event in `packages/shared/events.js` so the thank-you page links to `/events/<slug>/pay`.

## Tests

```bash
npm run test:api     # signature, validation, handlers, HTTP rules, no secret in the frontend
npm run test:db      # includes the payments table and its constraints
```

## Not done yet

- **Admin view of payments.** Rows are in `payments` (readable by admins); the
  dashboard does not show them yet.
- **Refunds, receipts and a confirmation email.**
- **Rate limiting** on the two endpoints.
