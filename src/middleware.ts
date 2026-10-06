import { defineMiddleware } from 'astro:middleware';
import { createSupabase } from './lib/supabase';

// Public auth pages. Everything under /portal needs a signed-in member.
// The rest of the website (home, programs, members, ...) is prerendered and
// public, so the middleware doesn't run for it at request time.
const AUTH_PAGES = ['/login', '/forgot-password'];

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();

  const supabase = createSupabase(context.request, context.cookies);
  // getUser() checks the session with Supabase Auth (not just the cookie) and
  // refreshes expired tokens, writing new cookies through setAll.
  const { data } = await supabase.auth.getUser();
  context.locals.supabase = supabase;
  context.locals.user = data.user ?? null;

  const path = context.url.pathname.replace(/\/$/, '') || '/';

  if (path === '/portal' || path.startsWith('/portal/')) {
    if (!context.locals.user) {
      const back = context.url.pathname + context.url.search;
      return context.redirect(`/login?next=${encodeURIComponent(back)}`);
    }
    // Having a profile row is what makes someone a member (see the migration).
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, class_year, role')
      .eq('id', context.locals.user.id)
      .maybeSingle();
    if (!profile) {
      await supabase.auth.signOut();
      return context.redirect('/login?error=not-member');
    }
    context.locals.profile = profile;
  } else if (AUTH_PAGES.includes(path) && context.locals.user && context.request.method === 'GET') {
    return context.redirect('/portal');
  }

  const response = await next();
  // Signed-in pages are personal; never let a CDN or the browser share them.
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
});
