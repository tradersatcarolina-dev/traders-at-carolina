import { defineConfig } from 'astro/config';

// Set `site` to the final domain once you have one (used for canonical URLs).
export default defineConfig({
  output: 'static',
  site: 'https://tradersatcarolina.org',
  build: { format: 'directory' },
});
