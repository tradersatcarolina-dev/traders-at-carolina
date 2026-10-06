import type { APIRoute } from 'astro';
import type { EmailOtpType } from '@supabase/supabase-js';
import { safeNext } from '../../lib/supabase';

export const prerender = false;

const TYPES: EmailOtpType[] = ['invite', 'recovery', 'email_change'];

/** Where to send someone whose link didn't work, based on where it was headed. */
function failure(next: string, type: string | null, reason = 'link-expired') {
  if (type === 'invite' || next === '/setup-account') return '/setup-account?error=link-expired';
  if (type === 'recovery' || next === '/reset-password') return `/forgot-password?error=${reason}`;
  return `/login?error=${reason}`;
}

// Every auth email (invite, password reset, email change) ends
// up here. Verifying on the server sets the session cookies, then we send the
// member on to `next`. Three shapes arrive:
//   ?token_hash=…&type=…  our templates in supabase/templates/
//   ?code=…               Supabase's default templates (reset, email change)
//   #access_token=…       Supabase's default invite email. The browser never
//                         sends the part after #, so the page below reads it
//                         and posts the tokens back here.
export const GET: APIRoute = async ({ url, locals, redirect }) => {
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const code = url.searchParams.get('code');
  const next = safeNext(url.searchParams.get('next'));

  if (tokenHash && type && TYPES.includes(type)) {
    const { error } = await locals.supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    return redirect(error ? failure(next, type) : next);
  }
  if (code) {
    // Codes only work in the browser that asked for the email (it holds the
    // matching secret in a cookie), so that's the likeliest failure.
    const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
    return redirect(error ? failure(next, type, 'other-browser') : next);
  }
  if (url.searchParams.get('error')) return redirect(failure(next, type));

  return new Response(HASH_PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};

// Receives tokens from the page below and turns them into session cookies.
// Astro's origin check rejects posts from other sites.
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const form = await request.formData();
  const next = safeNext(String(form.get('next') ?? ''));
  const access_token = String(form.get('access_token') ?? '');
  const refresh_token = String(form.get('refresh_token') ?? '');
  if (!access_token || !refresh_token) return redirect(failure(next, null));
  const { error } = await locals.supabase.auth.setSession({ access_token, refresh_token });
  return redirect(error ? failure(next, null) : next);
};

const HASH_PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Signing you in · Traders at Carolina</title></head>
<body style="font-family: system-ui, sans-serif; padding: 40px 16px; color: #16181D">
<p>Signing you in…</p>
<form method="post" id="f"><input type="hidden" name="access_token"><input type="hidden" name="refresh_token"><input type="hidden" name="next"></form>
<script>
  var h = new URLSearchParams(location.hash.slice(1));
  var q = new URLSearchParams(location.search);
  var next = q.get('next') || '/portal';
  history.replaceState(null, '', location.pathname + location.search);
  var f = document.getElementById('f');
  if (h.get('access_token') && h.get('refresh_token')) {
    f.access_token.value = h.get('access_token');
    f.refresh_token.value = h.get('refresh_token');
    f.next.value = next;
    f.submit();
  } else if (h.get('message')) {
    // First of two confirmations for an email change.
    location.replace(next);
  } else {
    // Expired or missing link: let the server pick the right page.
    f.next.value = next;
    f.submit();
  }
</script>
<noscript><p>Please turn on JavaScript to finish signing in, or <a href="/login">go to the log-in page</a>.</p></noscript>
</body></html>`;
