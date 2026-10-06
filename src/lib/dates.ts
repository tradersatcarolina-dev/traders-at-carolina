/**
 * Date helpers shared by the build (Astro frontmatter) and the browser.
 * All dates in the JSON files are ISO "YYYY-MM-DD" and are interpreted in
 * Chapel Hill time (America/New_York), so a deadline stays visible through
 * the end of that day.
 */
export const TIME_ZONE = 'America/New_York';
export const SOON_DAYS = 7;

/** Today's date in Chapel Hill as "YYYY-MM-DD". */
export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Whole days from `from` to `to` (both "YYYY-MM-DD"). Negative if `to` is in the past. */
export function daysBetween(from: string, to: string): number {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10));
  const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

export const isPast = (iso: string, today = todayISO()) => daysBetween(today, iso) < 0;
export const isSoon = (iso: string, today = todayISO()) => {
  const d = daysBetween(today, iso);
  return d >= 0 && d <= SOON_DAYS;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2026-10-10" → "Oct 10" */
export function shortDate(iso: string): string {
  return `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`;
}
