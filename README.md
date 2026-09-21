# JSRO

Website for **JSRO — Jatin Space & Robotics Organization**: practical technology
education in robotics, AI, IoT, drones, 3D printing and space sciences.

Live: https://jsro-intro.vercel.app · Founder: Jatin Sangwan

---

## Layout

An npm-workspaces monorepo.

```
frontend/            the website (Create React App)
  src/
    components/      SiteHeader, SiteFooter, EventList, forms
    lib/             supabase.js, formErrors.js
    pages/
      events/        CansatProgram, InnovationChallenge, JrcChallenge
      policies/      privacy, terms, refunds, shipping
    styles/          tokens.css — the graphite design system
backend/             server scaffold: Razorpay, service-role writes (not deployed)
packages/
  shared/            @jsro/shared — facts both sides must agree on
docs/                brochure and company profile
supabase/            SQL migrations
```

`@jsro/shared` holds `site.js` and `events.js`. The frontend renders from them;
the backend will price a Razorpay order from the same event list, so they cannot
drift apart.

## Running it

```bash
npm install          # installs every workspace
npm start            # frontend on http://localhost:3000
npm test
npm run build        # -> frontend/build
npm run server       # backend on :8080
```

One lockfile lives at the repo root; nested ones are ignored on purpose.

Vercel builds with `npm run build --workspace=frontend` and serves
`frontend/build`, configured in `vercel.json`.

## Routes

| Path | Page |
|---|---|
| `/` | Homepage |
| `/events/cansat-program` | CanSat / Near Space Satellite |
| `/events/innovation-challenge` | Innovation Challenge |
| `/events/jrc-2026` | JRC 2026 — IoT & Computer Vision |
| `/events/:slug/register` | Registration |
| `/thank-you`, `/about-us` | |
| `/privacy-policy`, `/terms-and-conditions`, `/refund-policy`, `/shipping-policy` | |

Old URLs (`/ai-robotics-bootcamp`, `/workshop`, `/boochallengetcamp`) redirect to
their current event. Unknown paths reach a 404. `vercel.json` rewrites all paths
to `index.html` so deep links survive a refresh.

## Design

Two visual worlds, documented in [DESIGN.md](DESIGN.md):

- **The graphite fieldbook** — every surface except one. Warm iron ground,
  International Orange signal, Helvetica Neue, 1px rules.
- **The sounding record** — the CanSat programme page only, by explicit
  direction. Chart stock, recorder oxblood, Archivo Narrow + Courier Prime.

Product truth lives in [PRODUCT.md](PRODUCT.md).

## Known issues

1. **Supabase row level security is open.** The browser key can read, modify and
   delete every row in all three tables, including personal data. Fix in
   [supabase/001_lock_down_rls.sql](supabase/001_lock_down_rls.sql) — run it.
2. **A `.env` was committed to this public repo** (`jsro-backend/src/.env`,
   commit `99ba844`). Untracked now, but still in history. Rotate those values.
3. **Razorpay is not integrated.** Fees are quoted on request until it is.
4. `RefundPolicy` shows an effective date of 16th August 2015 — likely a typo.
5. Contact details were unified to `jsro.ai@gmail.com`; the print brochure still
   shows `info@jsro.in`.
