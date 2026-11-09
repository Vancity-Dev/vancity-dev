import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProspectBySlug } from '$lib/prospects/db';
import type { Prospect, ReadyProspect } from '$lib/prospects/types';
import { industries } from '$lib/templates';
import { derivePlumbingContent, toTelHref } from '$lib/templates/plumbing/derive';
import { deriveDefenseContent } from '$lib/templates/defense/derive';
import { deriveElectricalContent } from '$lib/templates/electrical/derive';
import { deriveAccountingContent } from '$lib/templates/accounting/derive';
import { deriveContractorContent } from '$lib/templates/contractor/derive';

// ReadyProspect only promises a string at the type level. '', 'call us' and an extension-only
// 'x 123' satisfy it and would render "Call ..." in six places with a dead link. The gate asks
// toTelHref, the same function the page uses, so the two cannot disagree about what a phone is.
function isReady(prospect: Prospect): prospect is ReadyProspect {
  return toTelHref(prospect.phone) !== '';
}

export const load: PageServerLoad = async ({ locals, platform }) => {
  const slug = locals.siteSlug;
  if (!slug) error(404, 'Not found');

  const db = platform?.env?.DB;
  if (!db) error(503, 'Site temporarily unavailable');

  // Only the D1 call is guarded: an error() thrown below must not be re-mapped to a 503.
  let prospect: Prospect | null;
  try {
    prospect = await getProspectBySlug(db, slug);
  } catch {
    error(503, 'Site temporarily unavailable');
  }

  if (!prospect || !isReady(prospect)) error(404, 'Not found');
  // The column is free TEXT, so a row can name an industry this build has no template for.
  if (!Object.hasOwn(industries, prospect.industry)) error(500, 'Unsupported industry');

  if (prospect.industry === 'defense') {
    return { industry: 'defense' as const, content: deriveDefenseContent(prospect) };
  }
  if (prospect.industry === 'electrical') {
    return { industry: 'electrical' as const, content: deriveElectricalContent(prospect) };
  }
  if (prospect.industry === 'accounting') {
    return { industry: 'accounting' as const, content: deriveAccountingContent(prospect) };
  }
  if (prospect.industry === 'contractor') {
    return { industry: 'contractor' as const, content: deriveContractorContent(prospect) };
  }
  return { industry: 'plumbing' as const, content: derivePlumbingContent(prospect) };
};
