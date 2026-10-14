-- ============================================================================
-- Two findings from verifying the previous migrations against production.
--
-- 1. The 3-file upload cap could be exceeded. registration_can_upload() was
--    STABLE, so its count ran on the snapshot taken when the INSERT began: it
--    could not see rows added earlier in the same statement, nor a parallel
--    upload for the same code that had not yet committed. Through the Storage
--    API that meant simultaneous uploads could all pass the check.
--
--    Fix: make it VOLATILE (each query inside takes a fresh snapshot, which
--    sees rows the calling statement has already written) and take a
--    transaction-scoped advisory lock on the code first, so concurrent uploads
--    for one registration are serialised and each counts what the last left.
--
-- 2. anon could EXECUTE public.is_admin(). Supabase's default privileges grant
--    anon on every new public function, and `revoke ... from public` does not
--    remove that explicit grant. Harmless here (it returns false for anon), but
--    the grant was not intended, so remove it.
-- ============================================================================

create or replace function private.registration_can_upload(p_code text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_open  boolean;
  v_count int;
begin
  -- Serialise uploads for this one registration until the transaction ends.
  perform pg_advisory_xact_lock(hashtextextended('jsro-upload:' || coalesce(p_code, ''), 0));

  select exists (
    select 1
    from public.event_registrations r
    join public.event_settings s on s.slug = r.event_slug
    where r.registration_code = p_code and s.submissions_open
  ) into v_open;
  if not v_open then
    return false;
  end if;

  select count(*) into v_count
  from storage.objects o
  where o.bucket_id = 'submissions'
    and (storage.foldername(o.name))[1] = p_code;

  -- The row being checked is not yet counted, so allow it only while fewer
  -- than three already exist.
  return v_count < 3;
end;
$$;
revoke all on function private.registration_can_upload(text) from public;
grant execute on function private.registration_can_upload(text) to anon, authenticated;

revoke execute on function public.is_admin() from anon;
