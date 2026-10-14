-- ============================================================================
-- Project submissions and the PDF upload behind them.
--
-- Threats this has to answer, and how:
--   Submitting as someone else    -> needs registration code AND matching email
--   Probing for valid codes       -> generic error; no helper exposed via REST
--   Reading others' files         -> private bucket, no anon select policy
--   Overwriting others' files     -> no update/delete policy at all
--   Uploading non-PDFs            -> bucket MIME allow-list + .pdf extension
--   Filling free-tier storage     -> 10 MB per file, 3 files per registration
--   Pointing at another's file    -> path must sit in the caller's own folder
--   javascript: links in admin UI -> video URL must be https://
-- ============================================================================

-- ---------------------------------------------------------------- table
create table if not exists public.project_submissions (
  id                uuid primary key default gen_random_uuid(),
  registration_id   uuid not null unique
                    references public.event_registrations (id) on delete cascade,
  project_title     text not null check (length(project_title) between 3 and 160),
  category          text not null check (category in (
                      'robotics-automation', 'artificial-intelligence',
                      'iot-smart-systems', 'space-aerospace',
                      'sustainability-environment', 'healthcare-technology',
                      'smart-city', 'energy-electronics')),
  team_members      text check (length(team_members) <= 600),
  problem_statement text not null check (length(problem_statement) between 20 and 3000),
  proposed_solution text not null check (length(proposed_solution) between 20 and 3000),
  innovation        text check (length(innovation) <= 2000),
  technology        text check (length(technology) <= 2000),
  methodology       text check (length(methodology) <= 2000),
  expected_impact   text check (length(expected_impact) <= 2000),
  document_path     text not null,
  video_url         text check (video_url is null or (length(video_url) <= 500 and video_url ~ '^https://')),
  submitted_at      timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.project_submissions enable row level security;
alter table public.project_submissions force row level security;
revoke all on public.project_submissions from anon, authenticated;
grant select on public.project_submissions to authenticated;
create policy "admins can read project submissions"
  on public.project_submissions for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------- bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 10485760, array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = 10485760,
      allowed_mime_types = array['application/pdf'];

-- Private helper used by the storage policy. Living in `private` keeps it off
-- the REST API, so it cannot be called as a yes/no oracle for valid codes.
create or replace function private.registration_can_upload(p_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.event_registrations r
    join public.event_settings s on s.slug = r.event_slug
    where r.registration_code = p_code
      and s.submissions_open
  )
  and (
    select count(*) from storage.objects o
    where o.bucket_id = 'submissions'
      and (storage.foldername(o.name))[1] = p_code
  ) < 3;
$$;
revoke all on function private.registration_can_upload(text) from public;
grant execute on function private.registration_can_upload(text) to anon, authenticated;

drop policy if exists "registrants can upload a submission document" on storage.objects;
create policy "registrants can upload a submission document"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'submissions'
    and lower(storage.extension(name)) = 'pdf'
    and private.registration_can_upload((storage.foldername(name))[1])
  );

drop policy if exists "admins can read submission documents" on storage.objects;
create policy "admins can read submission documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'submissions' and public.is_admin());
-- No update or delete policy exists for anyone but the service role: an
-- uploaded file can never be replaced or removed through the API.

-- ------------------------------------------------------------ submit RPC
create or replace function public.submit_project(
  p_code          text,
  p_email         text,
  p_title         text,
  p_category      text,
  p_team_members  text,
  p_problem       text,
  p_solution      text,
  p_innovation    text,
  p_technology    text,
  p_methodology   text,
  p_impact        text,
  p_document_path text,
  p_video_url     text
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_reg  public.event_registrations%rowtype;
  v_open boolean;
  v_id   uuid;
  v_code text := upper(trim(coalesce(p_code, '')));
  v_path text := trim(coalesce(p_document_path, ''));
  v_video text := nullif(trim(coalesce(p_video_url, '')), '');
begin
  select * into v_reg
  from public.event_registrations
  where registration_code = v_code
    and lower(email) = lower(trim(coalesce(p_email, '')));

  -- One message for both "no such code" and "wrong email", so the response
  -- never confirms that a code exists.
  if not found then
    raise exception 'That registration code and email do not match.' using errcode = 'P0001';
  end if;

  select submissions_open into v_open from public.event_settings where slug = v_reg.event_slug;
  if not coalesce(v_open, false) then
    raise exception 'Submissions for this event are not open yet.' using errcode = 'P0001';
  end if;

  if v_path not like v_code || '/%.pdf' or v_path like '%..%' then
    raise exception 'Upload your project document again.' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from storage.objects
    where bucket_id = 'submissions' and name = v_path
  ) then
    raise exception 'Upload your project document again.' using errcode = 'P0001';
  end if;

  if v_video is not null and v_video !~ '^https://' then
    raise exception 'The video link must start with https://' using errcode = 'P0001';
  end if;

  insert into public.project_submissions (
    registration_id, project_title, category, team_members,
    problem_statement, proposed_solution, innovation, technology,
    methodology, expected_impact, document_path, video_url
  ) values (
    v_reg.id, trim(p_title), p_category, nullif(trim(coalesce(p_team_members, '')), ''),
    trim(p_problem), trim(p_solution),
    nullif(trim(coalesce(p_innovation, '')), ''),
    nullif(trim(coalesce(p_technology, '')), ''),
    nullif(trim(coalesce(p_methodology, '')), ''),
    nullif(trim(coalesce(p_impact, '')), ''),
    v_path, v_video
  )
  -- Resubmitting before the deadline replaces the earlier entry.
  on conflict (registration_id) do update set
    project_title     = excluded.project_title,
    category          = excluded.category,
    team_members      = excluded.team_members,
    problem_statement = excluded.problem_statement,
    proposed_solution = excluded.proposed_solution,
    innovation        = excluded.innovation,
    technology        = excluded.technology,
    methodology       = excluded.methodology,
    expected_impact   = excluded.expected_impact,
    document_path     = excluded.document_path,
    video_url         = excluded.video_url,
    updated_at        = now()
  returning id into v_id;

  return v_id;
end;
$$;
revoke all on function public.submit_project(text,text,text,text,text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_project(text,text,text,text,text,text,text,text,text,text,text,text,text) to anon, authenticated;
