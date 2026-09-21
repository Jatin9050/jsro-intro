# @jsro/shared

The facts the website and the server must not disagree about.

- `site.js` — organisation name, founder, contact details, legal links
- `events.js` — the three programmes, their slugs, dates, and legacy redirects

Consumed by `frontend` (rendering) and `backend` (pricing a Razorpay order for
an event needs the same event list the page advertised).

Plain ESM with no build step, so both sides import it directly.
