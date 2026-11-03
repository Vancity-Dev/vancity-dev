export interface DefenseResult {
  charge: string;
  type: string; // filter chip label, e.g. 'DUI/DWI'
  outcome: string;
  county: string;
  summary: string;
}

export interface DefenseReview {
  quote: string;
  attribution: string; // first initial + charge type, never a full name
}

export interface DefenseContent {
  title: string;
  metaDescription: string;
  firmName: string;
  monogram: string;
  city: string;
  location: string; // "Austin, TX" or just the city
  heroHeadline: string;
  phoneDisplay: string;
  phoneHref: string; // tel: link, or '#contact' when the number is not dialable
  textHref: string; // sms: link, or '#contact'
  servingLine: string;
  areas: string[]; // empty => area chips hidden
  faqAreasAnswer: string;
  address: string[] | null; // null => address block hidden
  // Real, verifiable credentials only. null => the credentials strip is hidden.
  credentials: { barAdmissions: string; memberships: string; languages: string } | null;
  // null => the proof line and rating are hidden
  proof: { years: string; formerRole: string; rating: string; reviewCount: string } | null;
  // Results and reviews must be real and consented. Empty => the whole section is hidden.
  results: DefenseResult[];
  reviews: DefenseReview[];
  feeModel: string;
  responsibleAttorney: string;
  copyrightLine: string;
}
