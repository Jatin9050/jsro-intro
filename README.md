# JSRO

Website for **JSRO — Jatin Space & Robotics Organization**: practical technology
education in robotics, AI, IoT, drones, 3D printing and space sciences.

Live: https://jsro-intro.vercel.app · Founder: Jatin Sangwan

---

## Layout

```
src/
  data/        site.js, events.js      single source of truth — never hard-code facts
  lib/         supabase.js, formErrors.js
  components/  SiteHeader, SiteFooter, EventList, forms
  pages/
    events/    CansatProgram, InnovationChallenge, JrcChallenge
    policies/  privacy, terms, refunds, shipping
  styles/      tokens.css              the graphite design system
jsro-backend/  server scaffold — Razorpay, service-role writes (not deployed)
supabase/      SQL migrations
docs/          source material (brochure, company profile)
```

## Running it

```bash
npm install
npm start          # http://localhost:3000
npm test
npm run build
```

Supabase credentials fall back to the live project. To point elsewhere, copy
`.env.example` to `.env.local`.

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
