import type { Reroute } from '@sveltejs/kit';
import { demos } from '$lib/demos/index';

export const reroute: Reroute = ({ url }) => {
	const match = url.hostname.match(/^(.+)\.(?:vancity\.dev|localhost)$/);
	if (!match || match[1] === 'www') return;

	const slug = match[1];
	if (Object.hasOwn(demos, slug)) {
		return `/demo/${slug}${url.pathname === '/' ? '' : url.pathname}`;
	}
	// robots.txt must reach its own route, which serves the restrictive body on this host. The
	// catch-all below would render the site HTML for it instead.
	if (url.pathname === '/robots.txt') return;
	// Template photos are embedded by the prospect sites, so they are fetched from the
	// prospect's own host and must reach their route instead of the single-page catch-all.
	if (url.pathname.startsWith('/template-media/')) return;

	// Prospect sites are single-page: every path on the subdomain is the one site. The D1
	// lookup cannot happen here (reroute also runs in the browser, with no platform.env);
	// the /site load does it, keyed on locals.siteSlug.
	return '/site';
};
