-- ---------------------------------------------------------------------------
-- Zetamac scores: members post their scores; every member can see them.
-- ---------------------------------------------------------------------------

create table public.zetamac_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  score integer not null check (score between 1 and 500),
  created_at timestamptz not null default now()
);

create index zetamac_scores_score_idx on public.zetamac_scores (score desc);
create index zetamac_scores_user_id_idx on public.zetamac_scores (user_id);

alter table public.zetamac_scores enable row level security;
revoke all on public.zetamac_scores from anon, authenticated;
grant select on public.zetamac_scores to authenticated;
grant insert (score) on public.zetamac_scores to authenticated;
grant delete on public.zetamac_scores to authenticated;

create policy "Members can read zetamac scores"
  on public.zetamac_scores for select to authenticated
  using (public.is_member());

create policy "Members can post their own zetamac scores"
  on public.zetamac_scores for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_member());

create policy "Authors and presidents can delete zetamac scores"
  on public.zetamac_scores for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_president());
