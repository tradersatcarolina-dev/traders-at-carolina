-- SAMPLE DATA — safe to delete.
--
-- Starter resources (TraderMath, Zetamac, OpenQuant; already added to the
-- hosted project) and sample sessions so the members' area isn't
-- empty on day one. The local dev database loads this automatically on
-- `supabase db reset`. To load it into the hosted project, paste it into the
-- SQL editor. To remove the samples later, run the two DELETEs at the bottom.

insert into public.resources (title, description, url, category, sort_order) values
  ('TraderMath', 'Timed mental math and sequences', 'https://tradermath.org', 'Practice tools', 10),
  ('Zetamac', 'Arithmetic speed drills', 'https://arithmetic.zetamac.com', 'Practice tools', 20),
  ('OpenQuant', 'Quant interview questions and job listings', 'https://openquant.co', 'Practice tools', 30);

insert into public.sessions (title, session_number, date, location, slides_url, recording_url) values
  ('[Sample] Recruiting timeline', 1, '2026-09-10 19:00:00-04', 'Phillips 332', 'https://example.com/sample-slides-1', null),
  ('[Sample] Expected value', 2, '2026-09-24 19:00:00-04', 'Phillips 332', 'https://example.com/sample-slides-2', 'https://example.com/sample-recording-2'),
  ('[Sample] Market making 101', 3, '2026-12-03 19:00:00-05', 'Phillips 332', null, null);

-- To delete the samples:
--   delete from public.sessions where title like '[Sample]%';
--   delete from public.resources where title in ('TraderMath', 'Zetamac', 'OpenQuant');
