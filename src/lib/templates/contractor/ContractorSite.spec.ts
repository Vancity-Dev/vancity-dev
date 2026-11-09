import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import ContractorSite from './ContractorSite.svelte';
import { deriveContractorContent } from './derive';
import { haldenMossDefaults } from './defaults';

// Anything from the Halden & Moss showcase must never reach a prospect page. The fabricated
// categories (licence, rating, named people, reviews, projects, prices) are the liability.
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

  it('hides every block that needs a verifiable fact', () => {
    expect(derived).not.toContain('mailto:');
    expect(derived).not.toContain('id="work"');
    expect(derived).not.toContain('id="team"');
    expect(derived).not.toContain('id="reviews"');
    expect(derived).not.toContain('aria-label="Typical investment"');
    expect(derived).not.toContain('class="rating');
  });

  it('keeps the portal, labelled as a sample, with both boards', () => {
    expect(derived).toContain('id="schedule"');
    expect(derived).toContain('id="budget"');
    expect(derived.match(/Sample project/g)!.length).toBeGreaterThanOrEqual(3);
    expect(derived).toContain('Budget by trade');
    expect(derived).toContain('Build schedule');
  });

  it('renders six services, six steps and eight questions', () => {
    expect(derived.match(/class="service-card/g)?.length).toBe(6);
    expect(derived.match(/class="step-n/g)?.length).toBe(6);
    expect(derived.match(/<details/g)?.length).toBe(8);
  });
});

describe('ContractorSite showcase', () => {
  const html = norm(render(ContractorSite, { props: { content: haldenMossDefaults } }).body);

  it('fills every optional block', () => {
    expect(html).toContain('id="work"');
    expect(html).toContain('id="team"');
    expect(html).toContain('id="reviews"');
    expect(html).toContain('Elena Halden');
    expect(html.match(/<article class="work /g)?.length).toBe(4);
    expect(html.match(/<figure class="quote /g)?.length).toBe(3);
    expect(html).toContain('Typical investment');
    expect(html).toContain('mailto:build@haldenmoss.example');
  });

  it('offers every project type as a picker chip and keeps the firm headline by default', () => {
    for (const label of [
      'New custom home',
      'Whole-home renovation',
      'Addition or second storey',
      'Heritage restoration'
    ]) {
      expect(html).toContain(label);
    }
    expect(html).toContain(haldenMossDefaults.heroHeadline);
  });

  it('opens on the new-build sample with the numbers the specs verify', () => {
    expect(html).toContain('$27,400 under');
    expect(html).toContain('Awaiting your approval');
    expect(html).toContain('CO-04');
  });
});
