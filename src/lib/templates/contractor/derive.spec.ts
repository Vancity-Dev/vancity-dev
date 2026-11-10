import { describe, it, expect } from 'vitest';
import { deriveContractorContent } from './derive';
import type { ReadyProspect } from '$lib/prospects/types';

const prospect: ReadyProspect = {
  slug: 'cedar-builders',
  companyName: 'Cedar Custom Builders',
  industry: 'contractor',
  city: 'Austin',
  region: 'TX',
  phone: '(512) 555-0147',
  nearbyAreas: ['Round Rock', 'Austin', 'Cedar Park'],
  createdAt: 0,
  archived: false
};

describe('deriveContractorContent', () => {
  it('substitutes company, city and phone', () => {
    const c = deriveContractorContent(prospect);
    expect(c.brandLead).toBe('Cedar Custom');
    expect(c.brandTail).toBe('Builders');
    expect(c.heroHeadline).toBe('Custom Homes & Renovations in Austin, TX');
    expect(c.title).toBe('Custom Home Builder & Renovations in Austin, TX | Cedar Custom Builders');
    expect(c.phoneHref).toBe('tel:5125550147');
  });

  it('drops the city from the towns and invents nothing verifiable', () => {
    const c = deriveContractorContent(prospect);
    expect(c.towns).toEqual(['Round Rock', 'Cedar Park']);
    expect(c.servingLine).toBe('Serving Austin, Round Rock & Cedar Park');
    expect(c.licenceShort).toBeNull();
    expect(c.warrantyLine).toBeNull();
    expect(c.socialProof).toBeNull();
    expect(c.principal).toBeNull();
    expect(c.email).toBeNull();
    expect(c.address).toBeNull();
    expect(c.investment).toBeNull();
    expect(c.projects).toEqual([]);
    expect(c.testimonials).toEqual([]);
    // Photographs are a firm's own or nothing: a derived page has none to show.
    expect(c.photography).toBeNull();
    expect(c.heroAccent).toBeNull();
  });

  it('points the call button at the form when the phone has no digits', () => {
    expect(deriveContractorContent({ ...prospect, phone: 'call us' }).phoneHref).toBe('#consult');
  });

  it('handles a one-word company and a missing region', () => {
    const c = deriveContractorContent({ ...prospect, companyName: 'Hartwell', region: null });
    expect(c.brandTail).toBeNull();
    expect(c.brandLead).toBe('Hartwell');
    expect(c.location).toBe('Austin');
  });
});
