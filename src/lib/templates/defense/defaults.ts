import type { DefenseContent } from './types';

// Showcase content for /p/defense. Firm, phone and every result below are SAMPLE text for
// layout review only; a real client's results and reviews must be verified and consented to.
export const harbourDefaults: DefenseContent = {
  title: 'Criminal Defense Lawyer in Vancouver, BC | Free Consultation 24/7 | Harbour Defense Law',
  metaDescription:
    'Harbour Defense Law: criminal defense lawyers in Vancouver, BC. Free, confidential consultation, available 24/7. Call (604) 555-0142.',
  firmName: 'Harbour Defense Law',
  monogram: 'H',
  city: 'Vancouver',
  location: 'Vancouver, BC',
  heroHeadline: 'Arrested or charged in Vancouver? Talk to a defense lawyer tonight.',
  phoneDisplay: '(604) 555-0142',
  phoneHref: 'tel:+16045550142',
  textHref: 'sms:+16045550142',
  servingLine: 'Serving Vancouver, Burnaby, Richmond and the North Shore',
  areas: ['Vancouver', 'Burnaby', 'Richmond', 'North Vancouver', 'Surrey', 'Coquitlam'],
  faqAreasAnswer:
    'Vancouver, Burnaby, Richmond, North Vancouver, Surrey and Coquitlam. Not sure whether we cover your court? Call and ask.',
  address: ['Harbour Defense Law', '100 Sample Street', 'Vancouver, BC V6B 1A1'],
  credentials: {
    barAdmissions: 'Sample: Law Society admission, 2008',
    memberships: 'Sample: defense lawyers association',
    languages: 'English'
  },
  proof: { years: '15', formerRole: 'Former prosecutor', rating: '4.9', reviewCount: '120' },
  results: [
    { type: 'DUI/DWI', charge: 'Sample charge A', outcome: 'Dismissed', county: 'Sample County', summary: 'Sample summary. Replace with a verified, consented result.' },
    { type: 'Drug crimes', charge: 'Sample charge B', outcome: 'Reduced', county: 'Sample County', summary: 'Sample summary. Replace with a verified, consented result.' },
    { type: 'DUI/DWI', charge: 'Sample charge C', outcome: 'Not guilty', county: 'Sample County', summary: 'Sample summary. Replace with a verified, consented result.' }
  ],
  reviews: [
    { quote: 'Sample review. Replace with a real, consented testimonial.', attribution: 'M., Sample charge' },
    { quote: 'Sample review. Replace with a real, consented testimonial.', attribution: 'D., Sample charge' }
  ],
  feeModel: 'Flat fee, payment plans available',
  responsibleAttorney: 'Sample Attorney',
  copyrightLine: '© 2026 Harbour Defense Law'
};
