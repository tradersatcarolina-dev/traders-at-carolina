/** Shared lists and helpers for the members' area. Keep the lists in sync with
 * the check constraints in supabase/migrations. */

export const CATEGORIES = ['Probability', 'Market making', 'Mental math', 'Brainteaser', 'Estimation', 'Behavioral'] as const;
/** Chip labels on the problem bank filter. */
export const CATEGORY_CHIP: Record<string, string> = { Brainteaser: 'Brainteasers' };
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export const ROUNDS = ['Online assessment', 'Phone screen', 'Superday', 'Other'] as const;

export const SORTS = {
  top: 'Most upvoted',
  new: 'Newest',
  asked: 'Most asked',
} as const;
export type SortKey = keyof typeof SORTS;

/** A row of the `question_feed` view. Note there is no author id in it. */
export interface Question {
  id: string;
  body: string;
  context: string | null;
  company: string;
  category: string;
  difficulty: string;
  round: string;
  solution: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  author_name: string | null;
  is_mine: boolean;
  upvotes: number;
  asked_too: number;
  i_upvoted: boolean;
  i_asked_too: boolean;
}

export interface Session {
  id: string;
  title: string;
  session_number: number | null;
  date: string;
  location: string | null;
  slides_url: string | null;
  recording_url: string | null;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
  sort_order: number;
}

const TZ = 'America/New_York';
const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, ...opts });

export const weekdayShort = (iso: string) => fmt({ weekday: 'short' }).format(new Date(iso));
export const monthShort = (iso: string) => fmt({ month: 'short' }).format(new Date(iso));
export const dayOfMonth = (iso: string) => fmt({ day: 'numeric' }).format(new Date(iso));
export const timeOfDay = (iso: string) => fmt({ hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
export const longDate = (iso: string) => fmt({ month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

/** "Fall 2026 recruiting" style label from a post date. */
export function recruitingSeason(iso: string): string {
  const parts = fmt({ year: 'numeric', month: 'numeric' }).formatToParts(new Date(iso));
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  return `${month >= 7 ? 'Fall' : 'Spring'} ${year} recruiting`;
}

export function sessionLabel(s: Pick<Session, 'title' | 'session_number'>): string {
  return s.session_number ? `Session ${s.session_number} · ${s.title}` : s.title;
}

/** What a session offers, e.g. "Slides and recording". */
export function sessionMaterials(s: Pick<Session, 'slides_url' | 'recording_url'>): string {
  if (s.slides_url && s.recording_url) return 'Slides and recording';
  if (s.slides_url) return 'Slides';
  if (s.recording_url) return 'Recording';
  return 'Materials coming soon';
}

/** Strip characters that have meaning in PostgREST filter strings. */
export function cleanSearch(q: string): string {
  return q.replace(/[,()"'\\%*:]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
}

/** Read and validate the question form. Returns the row to save or an error. */
export function parseQuestionForm(form: FormData) {
  const text = (k: string) => String(form.get(k) ?? '').trim();
  const values = {
    body: text('body'),
    context: text('context'),
    company: text('company').replace(/\s+/g, ' '),
    category: text('category'),
    difficulty: text('difficulty'),
    round: text('round'),
    solution: text('solution'),
    is_anonymous: form.get('is_anonymous') === 'on',
  };
  let error = '';
  if (!values.body) error = 'Write the question.';
  else if (!values.company) error = 'Add the company that asked it.';
  else if (values.body.length > 4000 || values.context.length > 4000 || values.solution.length > 8000) error = 'That’s too long. Please shorten it.';
  else if (values.company.length > 80) error = 'Company name is too long.';
  else if (!(CATEGORIES as readonly string[]).includes(values.category)) error = 'Pick a category.';
  else if (!(DIFFICULTIES as readonly string[]).includes(values.difficulty)) error = 'Pick a difficulty.';
  else if (!(ROUNDS as readonly string[]).includes(values.round)) error = 'Pick a round.';
  const row = {
    ...values,
    context: values.context || null,
    solution: values.solution || null,
  };
  return { values, row, error };
}

/** Hostname for display, e.g. "tradermath.org". */
export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
