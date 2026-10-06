/**
 * Server-side Supabase client for the members' area.
 *
 * Every query runs as the signed-in member (their session lives in cookies),
 * so the database's row level security decides what they can see. The secret
 * key is never used here; only scripts/invite-members.ts uses it.
 */
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

/** "Keep me signed in" off → auth cookies last only until the browser closes. */
export const REMEMBER_COOKIE = 'tac-remember';

export function createSupabase(request: Request, cookies: AstroCookies) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill it in.');
  }
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '').map((c) => ({ name: c.name, value: c.value ?? '' }));
      },
      setAll(toSet) {
        // Read at write time: the login form may have just set it.
        const sessionOnly = cookies.get(REMEMBER_COOKIE)?.value === '0';
        for (const { name, value, options } of toSet) {
          const opts = { ...options };
          // Deleting a cookie sets maxAge 0; keep that. Otherwise drop the
          // lifetime so the browser forgets the session when it closes.
          if (sessionOnly && value) {
            delete opts.maxAge;
            delete opts.expires;
          }
          cookies.set(name, value, { ...opts, path: opts.path ?? '/', httpOnly: true, secure: import.meta.env.PROD });
        }
      },
    },
  });
}

export type Supabase = ReturnType<typeof createSupabase>;

/** Only allow same-site relative paths as post-login destinations. */
export function safeNext(next: string | null | undefined, fallback = '/portal'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
