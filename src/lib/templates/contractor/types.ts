export type ProjectKind = 'New build' | 'Renovation' | 'Addition' | 'Heritage';

export interface ContractorProject {
  name: string;
  kind: ProjectKind;
  place: string;
  size: string; // "3,400 sq ft"
  duration: string; // "14 months"
  blurb: string;
  caption: string; // placeholder text inside the photo slot
}

export interface ContractorTestimonial {
  quote: string;
  attribution: string; // first name + initial and the kind of project, never a full name
}

export interface ContractorContent {
  title: string;
  metaDescription: string;
  companyName: string;
  brandLead: string;
  brandTail: string | null;
  brandSub: string; // small line under the logo, e.g. "Custom Homes & Renovations"
  city: string;
  location: string; // "Vancouver, BC", or just the city when no region was given
  eyebrow: string;
  heroHeadline: string;
  heroLead: string;
  phoneDisplay: string;
  phoneHref: string; // tel: link, or '#consult' when the number is not dialable
  email: string | null; // null => mailto links hidden
  licenceLine: string; // utility bar, e.g. "Licensed & Insured · Residential Builder Lic. #123"
  licenceShort: string | null; // trust strip sub-line; null => "Fully insured"
  licenceFaqClause: string; // FAQ clause after the company name, e.g. "holds licence #123"
  insuranceClaim: string; // empty => the FAQ sentence ends after the licence
  warrantyLine: string | null; // e.g. "2-5-10 structural warranty"; null => a generic written warranty
  // Real, verifiable numbers only. null => rating, years and homes-built are hidden everywhere.
  socialProof: {
    ratingValue: string; // "4.9"
    ratingCount: string; // "64"
    yearsBadge: string; // "19"
    homesBuilt: string; // "85+"
  } | null;
  // null => the whole "who builds your home" section is hidden
  principal: { name: string; role: string; bio: string } | null;
  // Portfolio and reviews must be real and consented. Empty => the section is hidden.
  projects: ContractorProject[];
  testimonials: ContractorTestimonial[];
  // Typical investment lines for the contract section. null => the section shows no numbers.
  investment: { renovation: string; newBuild: string } | null;
  servingLine: string;
  serviceAreaIntro: string;
  faqAreasAnswer: string;
  towns: string[]; // empty => town chips hidden
  address: string[] | null; // null => address block hidden
  copyrightLine: string;
  footerLicenceLine: string;
}
