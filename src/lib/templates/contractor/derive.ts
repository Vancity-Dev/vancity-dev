import type { ReadyProspect } from '$lib/prospects/types';
import type { ContractorContent } from './types';
import { clean, joinAmp, joinAnd, toTelHref, uniqueTowns } from '../plumbing/derive';

// A prospect row knows a name, a city, a phone and some nearby towns, nothing else. Licences,
// ratings, named people, finished projects and testimonials are claims a client or a regulator
// can check, so they are null/empty here and the template hides every block built from them.
// The portal boards use clearly labelled sample projects, not anything about this firm.
export function deriveContractorContent(prospect: ReadyProspect): ContractorContent {
  const companyName = clean(prospect.companyName);
  const city = clean(prospect.city);
  const region = clean(prospect.region) || null;
  const location = region ? `${city}, ${region}` : city;

  const words = companyName.split(' ');
  const brandTail = words.length > 1 ? words[words.length - 1] : null;
  const brandLead = brandTail === null ? companyName : words.slice(0, -1).join(' ');

  // A phone with no digits is not dialable, so the CTA points at the consultation form instead.
  const phoneHref = toTelHref(prospect.phone) || '#consult';
  const towns = uniqueTowns(prospect.nearbyAreas, city, region);

  return {
    title: `Custom Home Builder & Renovations in ${location} | ${companyName}`,
    metaDescription: `${companyName}: custom homes and high-end renovations in ${location}. Every client gets a private portal with a live schedule and a line-by-line budget.`,
    companyName,
    brandLead,
    brandTail,
    brandSub: 'Custom Homes & Renovations',
    city,
    location,
    eyebrow: `Custom homes & renovations · ${city}`,
    heroHeadline: `Custom Homes & Renovations in ${location}`,
    heroAccent: null,
    photography: null,
    heroLead:
      'Every project comes with a private client portal: a live schedule and a line-by-line budget, so you always know where your build stands.',
    phoneDisplay: clean(prospect.phone),
    phoneHref,
    email: null,
    licenceLine: 'Licensed & Insured',
    licenceShort: null,
    licenceFaqClause: 'is licensed',
    insuranceClaim: 'carries liability insurance.',
    warrantyLine: null,
    socialProof: null,
    principal: null,
    projects: [],
    testimonials: [],
    investment: null,
    servingLine: `Serving ${joinAmp([city, ...towns])}`,
    serviceAreaIntro: `Building and renovating single-family homes in ${city} and the surrounding area.`,
    faqAreasAnswer: `${joinAnd([city, ...towns])}. Not sure? Get in touch.`,
    towns,
    address: null,
    copyrightLine: `© ${companyName}`,
    footerLicenceLine: 'Licensed & Insured'
  };
}
