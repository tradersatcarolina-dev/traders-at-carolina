import type { APIRoute } from 'astro';

export const prerender = false;

// Members-only files. Drop a PDF in src/files/ and link it as
// /portal/files/<name>.pdf. They're bundled into the server function rather
// than public/, so the middleware's member check guards them.
const files = import.meta.glob<string>('../../../files/*.pdf', { query: '?inline', import: 'default' });

// ?download makes the browser save the file instead of showing it.
export const GET: APIRoute = async ({ params, url }) => {
  const load = files[`../../../files/${params.file}`];
  if (!load) return new Response('Not found', { status: 404 });
  const dataUrl = await load();
  const body = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
  return new Response(body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${url.searchParams.has('download') ? 'attachment' : 'inline'}; filename="${params.file}"`,
    },
  });
};
