import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import AccountingSite from './AccountingSite.svelte';
import type { AccountingContent } from './types';
import { deriveAccountingContent } from './derive';

// A prospect-shaped fixture. Deliberately NOT spread from fraserRidgeDefaults: every field is
// set here (the type enforces it), so anything showcase-specific in the output can only come
// from a literal left behind in AccountingSite.svelte.
const turk: AccountingContent = {
  title: 'Accountant in Austin, TX | Tax & Bookkeeping | Turk Accounting',
  metaDescription: 'Turk Accounting — bookkeeping and tax in Austin, TX.',
  companyName: 'Turk Accounting',
  brandLead: 'Turk',
  brandTail: 'Accounting',
  brandSub: 'Accounting & Tax',
  city: 'Austin',
  location: 'Austin, TX',
  jurisdiction: 'US',
  taxYear: '2026',
  eyebrow: 'Austin Bookkeeping & Tax Firm',
  heroHeadline: 'Clear books, lower taxes, and an accountant who actually calls back.',
  heroLead: 'Turk Accounting handles the books, payroll and taxes across Austin & Round Rock.',
  phoneDisplay: '(512) 555-0147',
  phoneHref: 'tel:5125550147',
  email: null,
  bookingHref: '#consult',
  portalUrl: null,
  paymentUrl: null,
  googleReviewsUrl: null,
  responsePromise: 'one business day',
  hours: 'Mon–Fri, business hours',
  taxSeasonHours: null,
  credentials: null,
  socialProof: null,
  owner: null,
  team: [],
  photoCaptions: null,
  software: [],
  packages: [
    {
      name: 'Essentials',
      blurb: 'Clean books and a filed return.',
      monthly: '$450',
      annual: '$4,500',
      features: ['Monthly bookkeeping', 'Statements by the 15th', 'Annual business return']
    },
    {
      name: 'Growth',
      blurb: 'Books, payroll and planning.',
      monthly: '$950',
      annual: '$9,500',
      features: ['Everything in Essentials', 'Payroll for up to 10 people', 'Quarterly planning']
    },
    {
      name: 'CFO',
      blurb: 'A finance function without a finance hire.',
      monthly: '$2,400',
      annual: '$24,000',
      features: ['Everything in Growth', 'Monthly advisory session', 'Cash-flow forecast']
    }
  ],
  returnFrom: { personal: '$450', business: '$1,200' },
  serviceFrom: { bookkeeping: '$450', payroll: '$95' },
  priceNote: 'Sample pricing before tax.',
  sampleProof: true,
  reviewTowns: ['Round Rock', 'Cedar Park', 'Pflugerville'],
  servingLine: 'Serving Austin, Round Rock & Cedar Park',
  serviceAreaIntro: 'In-person appointments in Austin, and online anywhere in TX.',
  faqAreasAnswer: 'Austin, Round Rock and Cedar Park. Not sure? Get in touch.',
  towns: ['Round Rock', 'Cedar Park'],
  address: null,
  copyrightLine: '© Turk Accounting',
  footerCredentialLine: null,
  disclaimer: 'This site provides general information, not tax or legal advice.'
};

// The same prospect once the firm has supplied the facts, so the branches that only render
// with credentials, proof, an owner, a portal and an address are swept too.
const turkFilled: AccountingContent = {
  ...turk,
  brandSub: 'CPA & Advisors',
  eyebrow: 'Austin CPA & Bookkeeping Firm',
  email: 'hello@turkaccounting.com',
  portalUrl: 'https://portal.example.com',
  paymentUrl: 'https://pay.example.com',
  googleReviewsUrl: 'https://reviews.example.com',
  taxSeasonHours: 'Mon–Sat 8am–7pm',
  credentials: {
    suffix: 'CPA',
    licenceRegion: 'Texas',
    badges: ['CPA — Texas', 'QuickBooks ProAdvisor']
  },
  socialProof: { ratingValue: '4.8', ratingCount: '52', yearsBadge: '9', clientCount: '130' },
  owner: {
    name: 'Alice Turk',
    role: 'Founder',
    bio: 'Alice started the firm in 2017.',
    linkedinUrl: 'https://www.linkedin.com/in/example'
  },
  team: [{ name: 'Ben Ortiz', title: 'Senior Accountant', credentials: 'EA' }],
  photoCaptions: { hero: '[ photo · owner ]', team: '[ photo · team ]' },
  software: ['QuickBooks Online', 'Gusto'],
  address: ['Turk Accounting', '9 Congress Ave', 'Austin, TX 78701'],
  sampleProof: false,
  footerCredentialLine: 'Alice Turk, CPA — licensed in Texas'
};

// Showcase values that must never appear on a prospect page.
const LEAK_STRINGS = [
  'Fraser Ridge',
  'Vancouver',
  'Burnaby',
  'Richmond',
  'North Shore',
  'New Westminster',
  'Surrey',
  'Sarah Whitcomb',
  'Marcus Reyes',
  'Lena Okafor',
  'Tom Brennan',
  'CAD',
  'Wagepoint',
  'Dext',
  'Main Street',
  'V5T',
  '604',
  '2012',
  'Vancity'
];

function findLeak(html: string, label: string): string | null {
  const index =
    label === 'BC' ? html.search(/\bBC\b/) : html.toLowerCase().indexOf(label.toLowerCase());
  if (index < 0) return null;
  return html.slice(Math.max(0, index - 60), index + 60);
}

function renderedMarkup(content: AccountingContent): string {
  const { body, head } = render(AccountingSite, { props: { content } });
  // SVG path data is numeric noise, not copy.
  return (head + body).replace(/\sd="[^"]*"/g, '');
}

// Content produced by the real derivation, not a hand-built fixture: the end-to-end check
// that the page a prospect actually receives passes the same deny-list.
const derivedAustin = deriveAccountingContent({
  slug: 'turk-accounting',
  companyName: 'Turk Accounting',
  industry: 'accounting',
  city: 'Austin',
  region: 'TX',
  phone: '(512) 555-0147',
  nearbyAreas: ['Round Rock', 'Cedar Park'],
  createdAt: 0,
  archived: false
});

const fixtures: [string, AccountingContent][] = [
  ['bare prospect', turk],
  ['prospect with the facts filled in', turkFilled],
  ['derived from an Austin prospect', derivedAustin]
];

for (const [name, content] of fixtures) {
  describe(`AccountingSite with a prospect-shaped fixture (${name})`, () => {
    const html = renderedMarkup(content);

    it('renders the prospect company and phone', () => {
      expect(html).toContain('Turk');
      expect(html).toContain('(512) 555-0147');
    });

    for (const label of [...LEAK_STRINGS, 'BC']) {
      it(`leaks no "${label}"`, () => {
        expect(findLeak(html, label), `"${label}" found near this markup`).toBeNull();
      });
    }
  });
}

describe('AccountingSite without credentials, proof or people', () => {
  const html = renderedMarkup(turk);

  it('makes no credential claim about the firm', () => {
    expect(html).not.toContain('-led team');
    expect(html).not.toContain('Registered in');
    expect(html).not.toContain('ProAdvisor');
    expect(html).not.toContain('years in practice');
    expect(html).toContain('A named advisor on every file');
  });

  it('claims no rating, review count or client count', () => {
    expect(html).not.toContain('average from');
    expect(html).not.toContain('rating-score');
    expect(html).not.toMatch(/\d+\+ clients/);
  });

  it('renders no team section, mailto link, portal link or address', () => {
    expect(html).not.toContain('Meet the team');
    expect(html).not.toContain('mailto:');
    expect(html).not.toContain('Client Portal');
    expect(html).not.toContain('Make a Payment');
    expect(html).not.toContain('<address');
  });

  it('marks the sample prices and reviews as samples', () => {
    expect(html).toContain('Sample price, starting at');
    expect(html).toContain('Sample review');
    expect(html).toContain('Sample story');
  });

  it('still explains what a CPA is, as general information', () => {
    // Explaining the profession is not a claim about this firm.
    expect(html).toContain('What is the difference between a CPA and a bookkeeper?');
    expect(html).toContain('state-licensed');
  });

  it('carries the disclaimer', () => {
    expect(html).toContain('not tax or legal advice');
  });
});

describe('AccountingSite with the facts filled in', () => {
  const html = renderedMarkup(turkFilled);

  it('renders the credentials, proof, owner and portal', () => {
    expect(html).toContain('CPA — Texas');
    expect(html).toContain('CPA-led team, registered in Texas');
    expect(html).toContain('Alice Turk');
    expect(html).toContain('Ben Ortiz');
    expect(html).toContain('Client Portal');
    expect(html).toContain('mailto:hello@turkaccounting.com');
    expect(html).toContain('9 Congress Ave');
    expect(html).toContain('Alice Turk, CPA — licensed in Texas');
  });

  it('drops the sample markers once the proof is real', () => {
    expect(html).not.toContain('Sample review');
    expect(html).not.toContain('Sample story');
    expect(html).toContain('Starting at');
  });
});

describe('AccountingSite jurisdiction wording', () => {
  const us = renderedMarkup(turk);
  const ca = renderedMarkup({
    ...turk,
    jurisdiction: 'CA',
    city: 'Kelowna',
    location: 'Kelowna, British Columbia',
    towns: [],
    reviewTowns: ['Kelowna', 'Kelowna', 'Kelowna'],
    servingLine: 'Serving Kelowna',
    serviceAreaIntro: 'In-person appointments in Kelowna.',
    faqAreasAnswer: 'Kelowna. Not sure? Get in touch.'
  });

  it('uses IRS wording and the 1040 calendar in the US', () => {
    expect(us).toContain('IRS Representation');
    expect(us).toContain('Individual (1040) and C-corporation (1120) returns');
    expect(us).toContain('W-2s and 1099-NEC');
    expect(us).toContain('Social Security numbers');
    expect(us).toContain('IRS.gov');
    expect(us).not.toContain('CRA');
    expect(us).not.toContain('RRSP');
    expect(us).not.toContain('T4');
  });

  it('uses CRA wording and the T1 calendar in Canada', () => {
    expect(ca).toContain('CRA Representation');
    expect(ca).toContain('T1 personal return and any balance owing due');
    expect(ca).toContain('RRSP contribution deadline');
    expect(ca).toContain('T4 and T5 slips');
    expect(ca).toContain('Social Insurance Numbers');
    expect(ca).toContain('canada.ca');
    expect(ca).not.toContain('IRS');
    expect(ca).not.toContain('1099');
    expect(ca).not.toContain('Social Security');
  });

  it('names the right level of government for local deadlines', () => {
    expect(us).toContain('State dates usually follow');
    expect(ca).toContain('Provincial dates usually follow');
  });
});

describe('AccountingSite flair', () => {
  const html = render(AccountingSite, { props: { content: turk } }).body.replace(/\s+/g, ' ');

  it('offers every situation as a calculator key and keeps the prospect headline by default', () => {
    for (const label of ['Books are behind', 'Tax deadline coming', 'Starting a business', 'Plan to pay less tax']) {
      expect(html).toContain(label);
    }
    expect(html).toContain(turk.heroHeadline);
    expect(html).toContain('=NEXT_STEPS(pick_a_cell)');
  });

  it('shows every service until a tab is picked', () => {
    expect(html.match(/class="card service/g)?.length).toBe(6);
  });
});
