import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import ElectricalSite from './ElectricalSite.svelte';
import { deriveElectricalContent } from './derive';
import { northlineDefaults } from './defaults';

// Anything from the Northline showcase must never reach a prospect page.
const LEAK_STRINGS = [
  'Northline',
  'Maple Grove',
  'Plymouth',
  'Osseo',
  '763',
  '0000000',
  '4,800',
  '$2M',
  '2008',
  'Partner Finance',
  'Octopus',
  'Plumb',
  'Vancity'
];

const html = (() => {
  const content = deriveElectricalContent({
    slug: 'volt-electric',
    companyName: 'Volt Electric',
    industry: 'electrical',
    city: 'Austin',
    region: 'TX',
    phone: '(512) 555-0147',
    nearbyAreas: ['Round Rock', 'Cedar Park'],
    createdAt: 0,
    archived: false
  });
  const { body, head } = render(ElectricalSite, { props: { content } });
  return (head + body).replace(/\sd="[^"]*"/g, '');
})();

describe('ElectricalSite for a derived prospect', () => {
  it('renders the prospect company, phone and headline', () => {
    expect(html).toContain('Volt');
    expect(html).toContain('(512) 555-0147');
    expect(html).toContain('Licensed Electricians in Austin, TX');
  });

  for (const label of LEAK_STRINGS) {
    it(`leaks no "${label}"`, () => {
      expect(html.toLowerCase()).not.toContain(label.toLowerCase());
    });
  }

  it('renders no mailto link without an email', () => {
    expect(html).not.toContain('mailto:');
  });

  it('renders eight services and the EV spotlight', () => {
    expect(html.match(/class="service-card/g)?.length).toBe(8);
    expect(html).toContain('Do I need a panel upgrade?');
  });
});

describe('ElectricalSite flair', () => {
  it('offers every situation as a breaker switch and keeps the prospect headline by default', () => {
    const html = render(ElectricalSite, { props: { content: northlineDefaults } }).body.replace(/\s+/g, ' ');
    for (const label of ['Power out or sparks', 'Breaker keeps tripping', 'Adding an EV charger', 'Older home wiring', 'New lights or outlets']) {
      expect(html).toContain(label);
    }
    expect(html).toContain(northlineDefaults.heroHeadline);
    expect(html).toContain('call 911 first');
  });

  it('renders every service until a filter is picked', () => {
    const html = render(ElectricalSite, { props: { content: northlineDefaults } }).body;
    expect(html.match(/class="service-card/g)?.length).toBe(8);
  });
});
