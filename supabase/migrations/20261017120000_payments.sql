-- ============================================================================
-- Payments (Razorpay).
--
-- The browser never decides what is owed or that something was paid. The
-- payments API (backend/, running with the service role) looks the fee up
-- here, creates the Razorpay order for exactly that amount, and only marks a
-- row paid after checking Razorpay's signature. So:
--
--   * `payments` is closed to anon and authenticated entirely. The service
--     role bypasses row level security; admins get read-only access.
--   * event_settings.fee_paise is the switch. NULL means online payment is off
--     for that event and the API refuses to create an order. To turn it on:
--       update public.event_settings set fee_paise = 10000   -- Rs 100
--       where slug = 'innovation-challenge';
-- ============================================================================

alter table public.event_settings
  add column if not exists fee_paise integer
  check (fee_paise is null or fee_paise >= 100);   -- Razorpay's minimum is 100 paise

create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  registration_id     uuid not null
                      references public.event_registrations (id) on delete restrict,
  razorpay_order_id   text not null unique
                      check (razorpay_order_id ~ '^order_[A-Za-z0-9]{8,40}$'),
  razorpay_payment_id text unique
                      check (razorpay_payment_id is null or razorpay_payment_id ~ '^pay_[A-Za-z0-9]{8,40}$'),
  amount_paise        integer not null check (amount_paise >= 100),
  currency            text not null default 'INR' check (currency = 'INR'),
  status              text not null default 'created' check (status in ('created', 'paid')),
  created_at          timestamptz not null default now(),
  paid_at             timestamptz,
  -- A row is paid exactly when it carries the payment that paid it, and when
  -- it was paid: all three are set together or none of them are.
  constraint payments_paid_has_payment check (
    (status = 'paid') = (razorpay_payment_id is not null)
    and (status = 'paid') = (paid_at is not null)
  )
);

-- A registration can be paid once. The database refuses a second paid row even
-- if two verifications race.
create unique index if not exists payments_one_paid_per_registration
  on public.payments (registration_id) where status = 'paid';
create index if not exists payments_registration_idx on public.payments (registration_id);

alter table public.payments enable row level security;
alter table public.payments force row level security;
revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;
create policy "admins can read payments"
  on public.payments for select to authenticated using ((select public.is_admin()));
-- No insert, update or delete policy exists for anyone but the service role.
