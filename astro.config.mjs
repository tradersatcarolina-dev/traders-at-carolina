import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Set `site` to the final domain once you have one (used for canonical URLs).
// The public pages are prerendered (static). The members' area (/login,
// /portal, ...) opts out with `export const prerender = false` and runs as a
// Vercel function.
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  site: 'https://tradersatcarolina.org',
  build: { format: 'directory' },
});
