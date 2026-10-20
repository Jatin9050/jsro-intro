-- ============================================================================
-- A last date to register, and submissions open.
--
-- event_settings.registration_closes_at: once it has passed, both registration
-- routes refuse. NULL means no deadline. The Innovation Challenge's last date
-- is 22 Nov 2026, so registration closes at the end of that day, India time
-- (00:00 on 23 Nov, +05:30).
--
-- The two registration functions are replaced below with that one check added
-- after the "is it open" check; nothing else in them changes.
-- ============================================================================

alter table public.event_settings
  add column if not exists registration_closes_at timestamptz;

update public.event_settings
   set registration_closes_at = '2026-11-23 00:00:00+05:30'
 where slug = 'innovation-challenge';

-- --------------------------------------------- the paid path (service role)
create or replace function public.start_paid_registration(
  p_event_slug text,
  p_name       text,
  p_email      text,
  p_phone      text,
  p_school     text
)
returns table (reg_id uuid, reg_event_slug text, reg_fee_paise integer)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_event  public.event_settings%rowtype;
  v_name   text := trim(coalesce(p_name, ''));
  v_email  text := lower(trim(coalesce(p_email, '')));
  v_phone  text := trim(coalesce(p_phone, ''));
  v_school text := trim(coalesce(p_school, ''));
  v_id     uuid;
  v_tries  int := 0;
begin
  select * into v_event from public.event_settings where slug = p_event_slug;
  if not found then
    raise exception 'That event does not exist.' using errcode = 'P0001';
  end if;
  if not v_event.registration_open then
    raise exception 'Registration for this event is not open yet.' using errcode = 'P0001';
  end if;
  -- The last date to register. Enforced here, so it holds however the page is
  -- cached or the request is made.
  if v_event.registration_closes_at is not null and now() >= v_event.registration_closes_at then
    raise exception 'Registration for this event has closed.' using errcode = 'P0001';
  end if;
  if v_event.fee_paise is null then
    raise exception 'Payment is not open for this event yet.' using errcode = 'P0001';
  end if;

  if length(v_name) < 2 or length(v_name) > 120 then
    raise exception 'Enter your full name.' using errcode = 'P0001';
  end if;
  if length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address.' using errcode = 'P0001';
  end if;
  if length(v_phone) < 7 or length(v_phone) > 20 or v_phone !~ '^[0-9+()\s-]+$' then
    raise exception 'Enter a valid phone number.' using errcode = 'P0001';
  end if;
  if length(v_school) < 2 or length(v_school) > 160 then
    raise exception 'Enter your school, college or organisation.' using errcode = 'P0001';
  end if;

  loop
    -- Someone who registered earlier but did not finish paying picks up where
    -- they left off, with their details updated.
    select r.id into v_id
    from public.event_registrations r
    where r.event_slug = p_event_slug and lower(r.email) = v_email;

    if found then
      if exists (select 1 from public.payments p where p.registration_id = v_id and p.status = 'paid') then
        raise exception 'This email is already registered and paid for this event. Use "Already paid? Get your code" to see your registration code.'
          using errcode = 'P0001';
      end if;
      update public.event_registrations
         set name = v_name, phone = v_phone, school = v_school
       where id = v_id;
      return query select v_id, p_event_slug, v_event.fee_paise;
      return;
    end if;

    begin
      insert into public.event_registrations
        (name, email, phone, school, event, event_slug, registration_code)
      values
        (v_name, v_email, v_phone, v_school, v_event.title, p_event_slug,
         private.generate_registration_code(v_event.code_prefix))
      returning id into v_id;
      return query select v_id, p_event_slug, v_event.fee_paise;
      return;
    exception when unique_violation then
      -- Either two requests raced on the same email (the next pass finds it),
      -- or, vanishingly rarely, the code collided (the next pass draws a new one).
      v_tries := v_tries + 1;
      if v_tries >= 5 then
        raise exception 'Could not create your registration. Try again.' using errcode = 'P0001';
      end if;
    end;
  end loop;
end;
$$;
revoke all on function public.start_paid_registration(text, text, text, text, text) from public;
-- Supabase grants new public functions to anon and authenticated by default;
-- revoking from public does not remove those explicit grants.
revoke execute on function public.start_paid_registration(text, text, text, text, text) from anon, authenticated;
grant execute on function public.start_paid_registration(text, text, text, text, text) to service_role;

-- ------------------------------ the free path is closed for events with a fee
create or replace function public.register_participant(
  p_event_slug text,
  p_name       text,
  p_email      text,
  p_phone      text,
  p_school     text
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_event  public.event_settings%rowtype;
  v_name   text := trim(coalesce(p_name, ''));
  v_email  text := lower(trim(coalesce(p_email, '')));
  v_phone  text := trim(coalesce(p_phone, ''));
  v_school text := trim(coalesce(p_school, ''));
  v_code   text;
  v_tries  int := 0;
begin
  select * into v_event from public.event_settings where slug = p_event_slug;
  if not found then
    raise exception 'That event does not exist.' using errcode = 'P0001';
  end if;
  if not v_event.registration_open then
    raise exception 'Registration for this event is not open yet.' using errcode = 'P0001';
  end if;
  -- The last date to register. Enforced here, so it holds however the page is
  -- cached or the request is made.
  if v_event.registration_closes_at is not null and now() >= v_event.registration_closes_at then
    raise exception 'Registration for this event has closed.' using errcode = 'P0001';
  end if;
  -- An event with a fee is registered for, and paid for, on the registration
  -- page. This route hands out the code immediately, so it must not exist for them.
  if v_event.fee_paise is not null then
    raise exception 'Registration for this event is completed together with payment, on its registration page.'
      using errcode = 'P0001';
  end if;

  if length(v_name) < 2 or length(v_name) > 120 then
    raise exception 'Enter your full name.' using errcode = 'P0001';
  end if;
  if length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address.' using errcode = 'P0001';
  end if;
  if length(v_phone) < 7 or length(v_phone) > 20 or v_phone !~ '^[0-9+()\s-]+$' then
    raise exception 'Enter a valid phone number.' using errcode = 'P0001';
  end if;
  if length(v_school) < 2 or length(v_school) > 160 then
    raise exception 'Enter your school, college or organisation.' using errcode = 'P0001';
  end if;

  loop
    v_code := private.generate_registration_code(v_event.code_prefix);
    begin
      insert into public.event_registrations
        (name, email, phone, school, event, event_slug, registration_code)
      values
        (v_name, v_email, v_phone, v_school, v_event.title, p_event_slug, v_code);
      return v_code;
    exception when unique_violation then
      if exists (
        select 1 from public.event_registrations
        where event_slug = p_event_slug and lower(email) = v_email
      ) then
        raise exception 'This email is already registered for this event. Contact JSRO if you need your registration code.'
          using errcode = 'P0001';
      end if;
      v_tries := v_tries + 1;
      if v_tries >= 5 then
        raise exception 'Could not create a registration code. Try again.' using errcode = 'P0001';
      end if;
    end;
  end loop;
end;
$$;
revoke all on function public.register_participant(text, text, text, text, text) from public;
grant execute on function public.register_participant(text, text, text, text, text) to anon, authenticated;
