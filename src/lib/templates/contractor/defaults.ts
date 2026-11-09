import type { ContractorContent } from './types';

// Showcase content for /p/contractor. A fictional firm with every optional block filled, so the
// whole template renders. Sample business, sample numbers: nothing here is a real licence, a
// real review count or a real project.
export const haldenMossDefaults: ContractorContent = {
  title: 'Custom Home Builder & Renovations in North Vancouver, BC | Halden & Moss Builders',
  metaDescription:
    'Halden & Moss Builders: custom homes and high-end renovations in North Vancouver, BC. Every client gets a private portal with a live schedule and a line-by-line budget.',
  companyName: 'Halden & Moss Builders',
  brandLead: 'Halden & Moss',
  brandTail: 'Builders',
  brandSub: 'Custom Homes & Renovations',
  city: 'North Vancouver',
  location: 'North Vancouver, BC',
  eyebrow: 'Custom homes & renovations · North Shore',
  heroHeadline: 'Custom homes you can watch come together, week by week and dollar by dollar.',
  heroLead:
    'Halden & Moss builds and renovates single-family homes on the North Shore. Every client gets a private portal with a live schedule and a line-by-line budget, so you never have to ask where things stand.',
  phoneDisplay: '(604) 555-0188',
  phoneHref: 'tel:+16045550188',
  email: 'build@haldenmoss.example',
  licenceLine: 'Licensed & Insured · BC Residential Builder Lic. #00000',
  licenceShort: 'Lic. #00000',
  licenceFaqClause: 'holds BC residential builder licence #00000',
  insuranceClaim: 'carries $5M liability insurance and WorkSafeBC coverage.',
  warrantyLine: 'Written structural and envelope warranty',
  socialProof: { ratingValue: '4.9', ratingCount: '64', yearsBadge: '19', homesBuilt: '85+' },
  principal: {
    name: 'Elena Halden',
    role: 'Founder & Principal Builder',
    bio: 'Elena started Halden & Moss after fifteen years as a site superintendent, tired of watching homeowners learn about a delay from an invoice. She still walks every site on Fridays and signs off every change order herself. The portal is the same thing she used to write on a whiteboard in the site trailer, made visible to the people paying for it.'
  },
  projects: [
    {
      name: 'Cove Road Residence',
      kind: 'New build',
      place: 'Deep Cove',
      size: '3,600 sq ft',
      duration: '16 months',
      blurb: 'A cedar-and-glass family home stepping down a sloped lot, with a green roof over the garage.',
      caption: '[ photo · 3:2 · Cove Road Residence, street elevation ]'
    },
    {
      name: 'Lonsdale Heritage Restoration',
      kind: 'Heritage',
      place: 'Lower Lonsdale',
      size: '2,400 sq ft',
      duration: '11 months',
      blurb: 'A 1930s craftsman restored to its original trim, with a new structure, systems and kitchen behind it.',
      caption: '[ photo · 3:2 · Lonsdale craftsman, restored front porch ]'
    },
    {
      name: 'Ridgeview Second Storey',
      kind: 'Addition',
      place: 'Edgemont',
      size: '1,100 sq ft added',
      duration: '8 months',
      blurb: 'A full second storey added to a 1970s bungalow while the family lived next door.',
      caption: '[ photo · 3:2 · Ridgeview, new second storey at dusk ]'
    },
    {
      name: 'Capilano Whole-Home Renovation',
      kind: 'Renovation',
      place: 'Capilano',
      size: '3,100 sq ft',
      duration: '12 months',
      blurb: 'Stripped to the studs and rebuilt around a new open plan, with a north-facing kitchen and a wine cellar.',
      caption: '[ photo · 3:2 · Capilano kitchen, island and pantry ]'
    }
  ],
  testimonials: [
    {
      quote:
        'We were building from another city, and the portal was the reason it worked. I could see the framing inspection pass, see the budget move when we changed the windows, and approve the change order from my phone.',
      attribution: 'Priya & Dev S., custom home'
    },
    {
      quote:
        'They found rot in the sill plates and told us the same day, with a price and a new date on the schedule. That honesty is why we trusted every other number.',
      attribution: 'Mark T., heritage renovation'
    },
    {
      quote:
        'Our allowance for the kitchen went over, and we saw it the day we picked the appliances, not at the end. No surprises, just decisions.',
      attribution: 'Joanne K., whole-home renovation'
    }
  ],
  investment: {
    renovation: 'Whole-home renovations typically start around $400 per sq ft',
    newBuild: 'Custom homes typically start around $650 per sq ft'
  },
  servingLine: 'Serving North Vancouver, West Vancouver & Burnaby',
  serviceAreaIntro: 'Building on the North Shore and across Metro Vancouver, wherever the lot is.',
  faqAreasAnswer:
    'North Vancouver, West Vancouver, Burnaby, Vancouver and Coquitlam. Building outside that? Ask us.',
  towns: ['North Vancouver', 'West Vancouver', 'Burnaby', 'Vancouver', 'Coquitlam', 'Deep Cove'],
  address: ['Halden & Moss Builders', '123 Main Street', 'North Vancouver, BC V7M 1A1'],
  copyrightLine: '© 2026 Halden & Moss Builders',
  footerLicenceLine: 'Lic. #00000 · Licensed, Bonded & Insured'
};
