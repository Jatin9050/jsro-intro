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

## Security

Row level security is enforced on all three tables. The publishable key in the
browser bundle can **insert only**, and only into the form columns — it cannot
read, update or delete anything, and it cannot set the payment or workflow
flags. Verified against the live project.

The site has no login. All write authority lives in Postgres grants and
policies, never in the browser. Client-side validation is convenience only.

Security headers (CSP, HSTS, nosniff, frame-ancestors, Referrer-Policy,
Permissions-Policy) are set in `vercel.json`.

## Known issues

1. **No rate limiting on the public forms.** Anyone can POST registrations in a
   loop and fill the 500 MB free tier or flood the inbox. Deferred — the fix is
   a captcha (Cloudflare Turnstile or hCaptcha) on the three forms.
2. **Razorpay is not integrated.** Fees are quoted on request until it is. When
   it lands, `payment` / `paid` must be written only by `backend/` using the
   service role key. A flag the browser can set is not a payment record.
3. **28 npm advisories, all from `react-scripts`' build toolchain.** None ship
   in the browser bundle — checked. `npm audit fix --force` would break the
   build for no security gain. The real fix is migrating off Create React App,
   which is unmaintained.
4. `RefundPolicy` shows an effective date of 16th August 2015 — likely a typo.
5. Contact details were unified to `jsro.ai@gmail.com`; the print brochure still
   shows `info@jsro.in`.
