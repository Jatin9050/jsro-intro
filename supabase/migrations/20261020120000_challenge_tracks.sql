-- ============================================================================
-- Innovation Challenge tracks, from the official poster: five tracks replace
-- the eight categories of the first brief. The submission form offers these
-- five, and the database accepts only these five, whatever a client sends.
--
-- Safe to swap because no project has been submitted yet (checked before this
-- was applied); a row with an old slug would make the new rule fail to apply.
-- ============================================================================

alter table public.project_submissions
  drop constraint if exists project_submissions_category_check;

alter table public.project_submissions
  add constraint project_submissions_category_check
  check (category in (
    'robotics-ai',
    'sustainability',
    'space-aerospace',
    'social-impact',
    'open-innovation'
  ));
