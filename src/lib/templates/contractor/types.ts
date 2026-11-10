export type ProjectKind = 'New build' | 'Renovation' | 'Addition' | 'Heritage';

export interface Photo {
  src: string; // a path under /static, e.g. "/builder/cove-road.jpg"
  alt: string; // describes the picture for a screen reader; never empty
  focus?: string; // CSS object-position, for a portrait frame cropped to landscape
}

export interface ContractorProject {
  name: string;
  kind: ProjectKind;
  place: string;
  year: string; // "2025"
  size: string; // "3,400 sq ft"
  duration: string; // "14 months"
  blurb: string;
  // The first photo leads; a second, if given, sits offset beside the write-up.
  photos: [Photo] | [Photo, Photo];
}

export interface ContractorTestimonial {
  quote: string;
  attribution: string; // first name + initial and the kind of project, never a full name
}

// Photography for the editorial blocks. Only a firm's own, consented photographs belong here, so a
// derived prospect gets null and the page falls back to a typographic hero and no image blocks.
export interface ContractorPhotography {
  hero: Photo & { caption: string }; // full-bleed; the caption names the project in frame
  craft: { label: string; note: string; photo: Photo }[]; // the details strip
  build: Photo; // quiet backdrop to the "building in plain sight" band
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
  heroAccent: string | null; // a phrase inside heroHeadline set in italics; null => no accent
  heroLead: string;
  photography: ContractorPhotography | null;
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
