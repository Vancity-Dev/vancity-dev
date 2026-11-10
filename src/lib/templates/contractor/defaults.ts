import type { ContractorContent } from './types';

// Showcase content for /p/contractor. A fictional firm with every optional block filled, so the
// whole template renders. Sample business, sample numbers: nothing here is a real licence, a
// real review count or a real project. The photographs are stock images (see
// static/builder/SOURCES.md) standing in for a client's own project photography.
export const haldenMossDefaults: ContractorContent = {
  title: 'Custom Home Builder & Renovations in North Vancouver, BC | Halden & Moss Builders',
  metaDescription:
    'Halden & Moss Builders: custom homes and high-end renovations in North Vancouver, BC. Every client gets a private portal with a live schedule and a line-by-line budget.',
  companyName: 'Halden & Moss Builders',
  brandLead: 'Halden & Moss',
  brandTail: 'Builders',
  brandSub: 'Custom Homes & Restorations',
  city: 'North Vancouver',
  location: 'North Vancouver, BC',
  eyebrow: 'Custom homes & restorations · North Shore',
  heroHeadline: 'Custom homes, built in plain sight.',
  heroAccent: 'plain sight',
  heroLead:
    'Halden & Moss builds and restores single-family homes on the North Shore. From the day you sign, a private portal shows you the live schedule and a line-by-line budget.',
  photography: {
    hero: {
      src: '/builder/cove-road.jpg',
      alt: 'A modern two-storey house with floor-to-ceiling glazing, lit from within at dusk',
      caption: 'Cove Road Residence · Deep Cove',
      focus: '50% 62%'
    },
    craft: [
      {
        label: 'Timber',
        note: 'Heavy timber and glulam, cut and fitted to a tolerance you can see.',
        photo: {
          src: '/builder/craft-timber.jpg',
          alt: 'Exposed timber beams crossing a blue sky'
        }
      },
      {
        label: 'Stair',
        note: 'Steel and oak, made in one shop and set in one day.',
        photo: {
          src: '/builder/craft-stair.jpg',
          alt: 'A staircase with a slim steel balustrade and warm wooden treads'
        }
      },
      {
        label: 'Stone',
        note: 'Slabs book-matched on site before a single cut is made.',
        photo: {
          src: '/builder/craft-stone.jpg',
          alt: 'A bathroom finished in pale stone with a freestanding tub'
        }
      },
      {
        label: 'Light',
        note: 'Rooflines drawn so daylight reaches the middle of the house.',
        photo: {
          src: '/builder/craft-light.jpg',
          alt: 'A timber-lined ceiling with a skylight washing a beam in daylight'
        }
      }
    ],
    build: {
      src: '/builder/build-frame.jpg',
      alt: 'The timber frame of a house under construction, seen down a corridor of studs'
    }
  },
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
      year: '2025',
      size: '3,600 sq ft',
      duration: '16 months',
      blurb:
        'A cedar-and-glass family home stepping down a sloped lot, with a cantilevered upper floor and a green roof over the garage.',
      photos: [
        {
          src: '/builder/cove-road.jpg',
          alt: 'A modern two-storey house with floor-to-ceiling glazing, lit from within at dusk',
          focus: '50% 60%'
        },
        {
          src: '/builder/cove-road-living.jpg',
          alt: 'A double-height living room with a fireplace wall and a view through tall windows'
        }
      ]
    },
    {
      name: 'Lonsdale Heritage Restoration',
      kind: 'Heritage',
      place: 'Lower Lonsdale',
      year: '2024',
      size: '2,400 sq ft',
      duration: '11 months',
      blurb:
        'A 1930s craftsman restored to its original trim, with new structure, systems and kitchen behind it.',
      photos: [
        {
          src: '/builder/lonsdale.jpg',
          alt: 'A cream craftsman house with a deep columned porch and flower baskets'
        },
        {
          src: '/builder/lonsdale-living.jpg',
          alt: 'A living room with a stone fireplace flanked by dark built-in shelving'
        }
      ]
    },
    {
      name: 'Ridgeview Second Storey',
      kind: 'Addition',
      place: 'Edgemont',
      year: '2024',
      size: '1,100 sq ft added',
      duration: '8 months',
      blurb:
        'A full second storey added to a 1970s bungalow, clad in vertical cedar, while the family lived next door.',
      photos: [
        {
          src: '/builder/ridgeview.jpg',
          alt: 'A timber-clad house with wraparound balconies rising out of dense planting',
          focus: '50% 40%'
        },
        {
          src: '/builder/ridgeview-living.jpg',
          alt: 'A quiet, light-filled living room with a low sofa and floor-to-ceiling windows',
          focus: '50% 55%'
        }
      ]
    },
    {
      name: 'Capilano Whole-Home Renovation',
      kind: 'Renovation',
      place: 'Capilano',
      year: '2023',
      size: '3,100 sq ft',
      duration: '12 months',
      blurb:
        'Stripped to the studs and rebuilt around a new open plan, with a stone-clad kitchen island and black steel windows.',
      photos: [
        {
          src: '/builder/capilano-kitchen.jpg',
          alt: 'A kitchen with a waterfall marble island and a wall of book-matched stone'
        },
        {
          src: '/builder/capilano-living.jpg',
          alt: 'A bright living room with black steel windows and a curved sofa'
        }
      ]
    },
    {
      name: 'Kerr Street Infill',
      kind: 'New build',
      place: 'East Vancouver',
      year: '2023',
      size: '2,800 sq ft',
      duration: '14 months',
      blurb:
        'A narrow-lot home in dark steel and cedar that sits quietly beside its heritage neighbour.',
      photos: [
        {
          src: '/builder/kerr-street.jpg',
          alt: 'A modern black-clad house with a cantilevered white frame beside a traditional home',
          focus: '40% 50%'
        },
        {
          src: '/builder/kerr-street-bath.jpg',
          alt: 'A dark marble bathroom with a timber-panelled niche and a recessed tub'
        }
      ]
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
