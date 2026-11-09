import type { IndustryKey } from '$lib/prospects/types';

export const industries: Record<IndustryKey, { label: string }> = {
  plumbing: { label: 'Plumbing' },
  defense: { label: 'Criminal Defense Law' },
  electrical: { label: 'Electrical' },
  accounting: { label: 'Accounting / CPA' },
  contractor: { label: 'General Contractor / Custom Builder' }
};
