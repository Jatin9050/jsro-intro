-- ============================================================================
-- Unique registration IDs, and a single validated path into registration.
--
-- The code is later used to authorise a project submission, so it must be
-- unguessable. It is generated here from a CSPRNG — never in the browser,
-- never sequential (a sequential ID leaks the registration count and can be
-- walked). Format: IC26-7K4M-Q9TX, from an alphabet without 0/O, 1/I/L.
--
-- Whether registration is open is enforced HERE. The frontend flag in
-- @jsro/shared/events only controls what the page shows; a client-side flag
-- is not a security boundary, and the RPC is callable directly.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------- event settings
create table if not exists public.event_settings (
  slug              text primary key,
  title             text not null,
  code_prefix       text not null unique check (code_prefix ~ '^[A-Z0-9]{2,6}$'),
  registration_open boolean not null default false,
  submissions_open  boolean not null default false
);
alter table public.event_settings enable row level security;
alter table public.event_settings force row level security;
revoke all on public.event_settings from anon, authenticated;
grant select on public.event_settings to authenticated;
create policy "admins can read event settings"
  on public.event_settings for select to authenticated using (public.is_admin());

-- All closed, matching "Coming soon" on the site.
insert into public.event_settings (slug, title, code_prefix) values
  ('cansat-program',       'CanSat Program',                              'CS26'),
  ('innovation-challenge', 'JSRO Innovation Challenge 2026',              'IC26'),
  ('jrc-2026',             'JRC 2026 — IoT & Computer Vision Challenge',  'JRC26')
on conflict (slug) do nothing;

-- ------------------------------------------------- registration columns
alter table public.event_registrations
  add column if not exists event_slug        text references public.event_settings (slug),
  add column if not exists registration_code text;

create unique index if not exists event_registrations_code_key
  on public.event_registrations (registration_code)
  where registration_code is not null;

-- One registration per email per event. Enforced by the database so two
-- concurrent requests cannot both slip past the application check.
create unique index if not exists event_registrations_one_per_email
  on public.event_registrations (event_slug, lower(email))
  where event_slug is not null;

-- --------------------------------------------------------- code generator
-- Private: never exposed through the API.
create or replace function private.generate_registration_code(p_prefix text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';  -- 31 symbols
  raw   bytea;
  b     int;
  code  text := '';
begin
  -- Rejection sampling: 248 is the largest multiple of 31 below 256, so
  -- discarding bytes >= 248 keeps every symbol equally likely.
  while length(code) < 8 loop
    raw := extensions.gen_random_bytes(16);
    for i in 0..15 loop
      b := get_byte(raw, i);
      if b < 248 then
        code := code || substr(alphabet, (b % 31) + 1, 1);
        exit when length(code) = 8;
      end if;
    end loop;
  end loop;
  return p_prefix || '-' || substr(code, 1, 4) || '-' || substr(code, 5, 4);
end;
$$;
revoke all on function private.generate_registration_code(text) from public;

-- ------------------------------------------------------ registration RPC
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
      -- Either this email is already registered, or (vanishingly rarely) the
      -- code collided. Tell them apart by checking, then retry the latter.
      if exists (
        select 1 from public.event_registrations
        where event_slug = p_event_slug and lower(email) = v_email
      ) then
        -- Never return the existing code: that would hand any registrant's
        -- code to whoever knows their email.
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

-- The function is now the only way in. Direct inserts would skip the
-- open-check, the validation and the code generation.
revoke insert on public.event_registrations from anon, authenticated;
drop policy if exists "public can submit a registration" on public.event_registrations;
