-- Traders at Carolina members' area: schema, grants and row level security.
--
-- The hosted project has "Automatically expose new tables" OFF, so every table
-- below gets explicit grants to `authenticated`. Nothing is ever granted to
-- `anon`: signed-out visitors can't read or write anything.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  class_year smallint check (class_year between 1990 and 2100),
  role text not null default 'member' check (role in ('member', 'president')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per club member. Having a row here is what makes someone a member.';

-- A profile row is created for every account a president makes (invite script
-- or dashboard). Accounts that appear through Google sign-up are NOT given a
-- profile, so even if sign-ups were accidentally switched on, a stranger who
-- signs in with Google is not a member and RLS shows them nothing.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_app_meta_data ->> 'provider', 'email') = 'email' then
    insert into public.profiles (id, full_name, class_year)
    values (
      new.id,
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      case
        when (new.raw_user_meta_data ->> 'class_year') ~ '^\d{4}$'
        then (new.raw_user_meta_data ->> 'class_year')::smallint
      end
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers used by the policies. SECURITY DEFINER so they can read profiles
-- without recursing through profiles' own RLS.
create function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()));
$$;

create function public.is_president()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'president'
  );
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_member() from public, anon;
revoke all on function public.is_president() from public, anon;
grant execute on function public.is_member() to authenticated;
grant execute on function public.is_president() to authenticated;

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
-- Column-level grant: members can change their name and class year, never `role`.
grant update (full_name, class_year) on public.profiles to authenticated;
-- The invite script (secret key) fills in names and class years.
grant select, insert, update on public.profiles to service_role;

create policy "Members can read all profiles"
  on public.profiles for select to authenticated
  using (public.is_member());

create policy "Members can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Problem bank
-- ---------------------------------------------------------------------------

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  context text check (char_length(context) <= 4000),
  company text not null check (char_length(trim(company)) between 1 and 80),
  category text not null check (category in (
    'Probability', 'Market making', 'Mental math', 'Brainteaser', 'Estimation', 'Behavioral'
  )),
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  round text not null check (round in ('Online assessment', 'Phone screen', 'Superday', 'Other')),
  solution text check (char_length(solution) <= 8000),
  is_anonymous boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index questions_created_at_idx on public.questions (created_at desc);
create index questions_author_id_idx on public.questions (author_id);

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger questions_touch_updated_at
  before update on public.questions
  for each row execute function public.touch_updated_at();

-- Anonymity. Members never get SELECT on the questions table's columns except
-- `id`, so `author_id` can't be read, filtered on or returned through the API.
-- Everyone reads questions through the `question_feed` view below, which
-- returns the author's name only when the question isn't anonymous.
alter table public.questions enable row level security;
revoke all on public.questions from anon, authenticated;
grant select (id) on public.questions to authenticated;
grant insert (body, context, company, category, difficulty, round, solution, is_anonymous)
  on public.questions to authenticated;
grant update (body, context, company, category, difficulty, round, solution, is_anonymous)
  on public.questions to authenticated;
grant delete on public.questions to authenticated;

-- Direct table access only ever matches your own rows (presidents: any row,
-- for deleting). Combined with the id-only column grant, this reveals nothing.
create policy "Authors can see their own question ids"
  on public.questions for select to authenticated
  using (author_id = (select auth.uid()) or public.is_president());

create policy "Members can post questions as themselves"
  on public.questions for insert to authenticated
  with check (author_id = (select auth.uid()) and public.is_member());

create policy "Authors can edit their own questions"
  on public.questions for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy "Authors and presidents can delete questions"
  on public.questions for delete to authenticated
  using (author_id = (select auth.uid()) or public.is_president());

create table public.question_votes (
  question_id uuid not null references public.questions (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (question_id, user_id)
);

create table public.question_asked_too (
  question_id uuid not null references public.questions (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (question_id, user_id)
);

create index question_votes_user_idx on public.question_votes (user_id);
create index question_asked_too_user_idx on public.question_asked_too (user_id);

alter table public.question_votes enable row level security;
alter table public.question_asked_too enable row level security;
revoke all on public.question_votes, public.question_asked_too from anon, authenticated;
grant select, insert, delete on public.question_votes, public.question_asked_too to authenticated;

create policy "Members can read votes"
  on public.question_votes for select to authenticated using (public.is_member());
create policy "Members can add their own vote"
  on public.question_votes for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_member());
create policy "Members can remove their own vote"
  on public.question_votes for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Members can read asked-too marks"
  on public.question_asked_too for select to authenticated using (public.is_member());
create policy "Members can add their own asked-too mark"
  on public.question_asked_too for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_member());
create policy "Members can remove their own asked-too mark"
  on public.question_asked_too for delete to authenticated
  using (user_id = (select auth.uid()));

-- The view runs with its owner's rights (not security_invoker), which is what
-- lets it read `author_id` and join to profiles while members can't. It
-- filters on is_member() itself, so non-members get no rows.
create view public.question_feed
with (security_barrier = true)
as
select
  q.id,
  q.body,
  q.context,
  q.company,
  q.category,
  q.difficulty,
  q.round,
  q.solution,
  q.is_anonymous,
  q.created_at,
  q.updated_at,
  case when q.is_anonymous then null else p.full_name end as author_name,
  (q.author_id = (select auth.uid())) as is_mine,
  (select count(*) from public.question_votes v where v.question_id = q.id)::int as upvotes,
  (select count(*) from public.question_asked_too a where a.question_id = q.id)::int as asked_too,
  exists (
    select 1 from public.question_votes v
    where v.question_id = q.id and v.user_id = (select auth.uid())
  ) as i_upvoted,
  exists (
    select 1 from public.question_asked_too a
    where a.question_id = q.id and a.user_id = (select auth.uid())
  ) as i_asked_too
from public.questions q
join public.profiles p on p.id = q.author_id
where public.is_member();

revoke all on public.question_feed from anon, authenticated;
grant select on public.question_feed to authenticated;

-- Distinct companies for the filter and the "company" suggestions.
create view public.question_companies
with (security_barrier = true)
as
select distinct company from public.questions where public.is_member();

revoke all on public.question_companies from anon, authenticated;
grant select on public.question_companies to authenticated;

-- ---------------------------------------------------------------------------
-- Resources and sessions (presidents manage, members read)
-- ---------------------------------------------------------------------------

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text not null check (url ~* '^https?://'),
  category text not null default 'Practice tools',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  session_number int,
  date timestamptz not null,
  location text,
  slides_url text check (slides_url ~* '^https?://'),
  recording_url text check (recording_url ~* '^https?://'),
  created_at timestamptz not null default now()
);

create index sessions_date_idx on public.sessions (date desc);

alter table public.resources enable row level security;
alter table public.sessions enable row level security;
revoke all on public.resources, public.sessions from anon, authenticated;
grant select, insert, update, delete on public.resources, public.sessions to authenticated;

create policy "Members can read resources"
  on public.resources for select to authenticated using (public.is_member());
create policy "Presidents can add resources"
  on public.resources for insert to authenticated with check (public.is_president());
create policy "Presidents can edit resources"
  on public.resources for update to authenticated
  using (public.is_president()) with check (public.is_president());
create policy "Presidents can delete resources"
  on public.resources for delete to authenticated using (public.is_president());

create policy "Members can read sessions"
  on public.sessions for select to authenticated using (public.is_member());
create policy "Presidents can add sessions"
  on public.sessions for insert to authenticated with check (public.is_president());
create policy "Presidents can edit sessions"
  on public.sessions for update to authenticated
  using (public.is_president()) with check (public.is_president());
create policy "Presidents can delete sessions"
  on public.sessions for delete to authenticated using (public.is_president());
