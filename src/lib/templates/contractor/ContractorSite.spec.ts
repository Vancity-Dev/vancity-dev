import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import ContractorSite from './ContractorSite.svelte';
import { deriveContractorContent } from './derive';
import { haldenMossDefaults } from './defaults';

// Anything from the Halden & Moss showcase must never reach a prospect page. The fabricated
// categories (licence, rating, named people, photographs, reviews, projects, prices) are the
// liability.
const LEAK_STRINGS = [
  'Halden',
  'Moss',
  'North Vancouver',
  'West Vancouver',
  'Deep Cove',
  '604',
  '00000',
  'Elena',
  'Priya',
  'Lonsdale',
  'Capilano',
  'Cove Road',
  'Kerr Street',
  'Ridgeview',
  '/builder/',
  'stock imagery',
  '$5M',
  'WorkSafe',
  'per sq ft',
  'Google reviews',
  '★ on',
  'Northline',
  'Octopus',
  'Fraser',
  'Vancity'
];

const norm = (s: string) => s.replace(/\sd="[^"]*"/g, '');

const derived = (() => {
  const content = deriveContractorContent({
    slug: 'cedar-builders',
    companyName: 'Cedar Custom Builders',
    industry: 'contractor',
    city: 'Austin',
    region: 'TX',
    phone: '(512) 555-0147',
    nearbyAreas: ['Round Rock', 'Cedar Park'],
    createdAt: 0,
    archived: false
  });
  const { body, head } = render(ContractorSite, { props: { content } });
  return norm(head + body);
})();

describe('ContractorSite for a derived prospect', () => {
  it('renders the prospect company, phone and headline', () => {
    expect(derived).toContain('Cedar Custom');
    expect(derived).toContain('(512) 555-0147');
    expect(derived).toContain('Custom Homes &amp; Renovations in Austin, TX');
  });

  for (const label of LEAK_STRINGS) {
    it(`leaks no "${label}"`, () => {
      expect(derived.toLowerCase()).not.toContain(label.toLowerCase());
    });
  }

  it('shows no photograph at all, and falls back to a typographic hero', () => {
    expect(derived).not.toContain('<img');
    expect(derived).not.toContain('hero-img');
    expect(derived).not.toContain('rel="preload"');
    expect(derived).toContain('class="skyline');
  });

  it('hides every block that needs a verifiable fact or a photograph', () => {
    expect(derived).not.toContain('mailto:');
    for (const id of ['work', 'craft', 'team', 'reviews'])
      expect(derived).not.toContain(`id="${id}"`);
    expect(derived).not.toContain('aria-label="Typical investment"');
    expect(derived).not.toContain('class="rating');
    expect(derived).not.toContain('class="figures');
  });

  it('keeps the portal, labelled as a sample, with both boards', () => {
    expect(derived).toContain('id="portal"');
    expect(derived).toContain('id="schedule"');
    expect(derived).toContain('id="budget"');
    expect(derived.match(/sample project/gi)!.length).toBeGreaterThanOrEqual(3);
    expect(derived).toContain('Budget by trade');
    expect(derived).toContain('Build schedule');
  });

  it('renders six services, six steps and eight questions', () => {
    expect(derived.match(/<a class="svc /g)?.length).toBe(6);
    expect(derived.match(/class="step-n/g)?.length).toBe(6);
    expect(derived.match(/<details/g)?.length).toBe(8);
  });
});

describe('ContractorSite showcase', () => {
  const html = norm(render(ContractorSite, { props: { content: haldenMossDefaults } }).body);

  it('fills every optional block', () => {
    for (const id of ['work', 'craft', 'team', 'reviews'])
      expect(html).toContain(`id="${id}"`);
    expect(html).toContain('Elena Halden');
    expect(html.match(/<article class="proj/g)?.length).toBe(5);
    expect(html.match(/class="craft-label/g)?.length).toBe(4);
    expect(html.match(/<figure class="quote/g)?.length).toBe(3);
    expect(html).toContain('Typical investment');
    expect(html).toContain('mailto:build@haldenmoss.example');
    expect(html).toContain('class="figures');
  });

  it('leads with the hero photograph and italicises the accent phrase', () => {
    expect(html).toContain('hero-img');
    expect(html).toContain('src="/builder/cove-road.jpg"');
    expect(html).toMatch(/<em class="[^"]*">plain sight<\/em>/);
    expect(html).toContain('Cove Road Residence · Deep Cove');
  });

  it('gives every informative photograph alt text, and only the backdrop is decorative', () => {
    const imgs = html.match(/<img[^>]*>/g) ?? [];
    // hero + 5 leads + 5 asides + 4 craft + 1 backdrop
    expect(imgs.length).toBe(16);
    const empty = imgs.filter((i) => /alt=""/.test(i));
    expect(empty.length).toBe(1);
    expect(html).toMatch(/class="band-img[^"]*" aria-hidden="true"/);
    for (const i of imgs.filter((i) => !/alt=""/.test(i))) expect(i).toMatch(/alt="[^"]{12,}"/);
  });

  it('loads only the hero eagerly', () => {
    const imgs = html.match(/<img[^>]*>/g) ?? [];
    expect(imgs.filter((i) => i.includes('loading="eager"')).length).toBe(1);
    expect(imgs.filter((i) => i.includes('loading="lazy"')).length).toBe(15);
  });

  it('opens on the new-build sample with the numbers the specs verify', () => {
    expect(html).toContain('$27,400 under');
    expect(html).toContain('Awaiting your approval');
    expect(html).toContain('CO-04');
  });

  it('offers every project type in the enquiry form as a radio', () => {
    for (const label of [
      'New custom home',
      'Whole-home renovation',
      'Addition or second storey',
      'Heritage restoration'
    ]) {
      expect(html).toContain(`>${label}</span>`);
    }
    expect(html.match(/type="radio"/g)?.length).toBe(5);
  });
});

describe('showcase assets', () => {
  it('points every photograph at a file that exists in static/', async () => {
    const { existsSync } = await import('node:fs');
    const c = haldenMossDefaults;
    const srcs = [
      c.photography!.hero.src,
      c.photography!.build.src,
      ...c.photography!.craft.map((x) => x.photo.src),
      ...c.projects.flatMap((p) => p.photos.map((x) => x.src))
    ];
    expect(srcs.length).toBe(16 - 0);
    for (const src of srcs) expect(existsSync(`static${src}`), src).toBe(true);
  });
});
