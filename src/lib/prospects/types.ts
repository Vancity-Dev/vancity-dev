export type IndustryKey = 'plumbing' | 'defense' | 'electrical' | 'accounting' | 'contractor';

export interface Prospect {
  slug: string;
  companyName: string;
  industry: IndustryKey;
  city: string;
  region: string | null;
  phone: string | null;
  nearbyAreas: string[];
  createdAt: number;
  archived: boolean;
}

export type NewProspect = Omit<Prospect, 'slug' | 'createdAt' | 'archived'>;

// A prospect that can be rendered. The D1 column stays nullable; callers must reject a row
// with no phone (404) before deriving content, because the page has no phone-less layout.
export type ReadyProspect = Prospect & { phone: string };
