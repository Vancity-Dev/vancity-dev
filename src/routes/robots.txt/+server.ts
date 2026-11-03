import type { RequestHandler } from './$types';

const PERMISSIVE = `# allow crawling everything by default, except the unlisted bathroom demo
User-agent: *
Disallow: /demo/bathroom
`;

// Prospect sites are meant to read as the prospect's own finished site, so they must never
// surface in search. Anything that is not the apex or www is a prospect (or demo) subdomain.
const RESTRICTIVE = `User-agent: *
Disallow: /
`;

const PUBLIC_HOSTS = new Set(['vancity.dev', 'www.vancity.dev', 'localhost', 'www.localhost']);

// event.url keeps the original hostname after reroute, so this sees the real host.
export const GET: RequestHandler = ({ url }) =>
  new Response(PUBLIC_HOSTS.has(url.hostname) ? PERMISSIVE : RESTRICTIVE, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
