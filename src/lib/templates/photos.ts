import type { IndustryKey } from '$lib/prospects/types';

// Every place a template can show a photo. The admin page at /admin/images is generated from
// this, so adding a slot here is all it takes for it to appear there. `key` is stored in
// template_images.slot; renaming one orphans its upload.
export interface PhotoSlot {
  key: string;
  label: string;
  // Where on the page it appears, in words a person can find it by.
  where: string;
  // Shape of the box. The image is cropped to cover it, so shoot or crop for this.
  shape: string;
  // What makes a good photo for this spot.
  suggest: string;
}

export const photoSlots: Record<IndustryKey, PhotoSlot[]> = {
  plumbing: [
    {
      key: 'team',
      label: 'Why choose us: crew photo',
      where:
        'Middle of the page, in the "Why choose us" section: the large panel beside the reasons list, with the years-in-business badge overlapping its bottom-right corner.',
      shape: 'Landscape, about 3:2 on desktop and a little shorter on phones',
      suggest: 'The crew with branded vans, or a plumber at a customer’s door. Keep faces near the middle.'
    },
    {
      key: 'map',
      label: 'Service area: local photo',
      where:
        'Lower on the page, in the "Where we work" section: the panel on the right of the town list, above the FAQ.',
      shape: 'Landscape, about 4:3',
      suggest: 'A recognizable local street, skyline or neighbourhood.'
    }
  ],
  electrical: [
    {
      key: 'team',
      label: 'Why choose us: crew photo',
      where:
        'Middle of the page, in the "Why choose us" section: the large panel beside the reasons list, with the years-in-business badge overlapping its bottom-right corner.',
      shape: 'Landscape, about 3:2 on desktop and a little shorter on phones',
      suggest: 'The crew with branded vans, or an electrician at a customer’s panel. Keep faces near the middle.'
    },
    {
      key: 'map',
      label: 'Service area: local photo',
      where:
        'Lower on the page, in the "Where we work" section: the panel on the right of the town list, above the FAQ.',
      shape: 'Landscape, about 4:3',
      suggest: 'A recognizable local street, skyline or neighbourhood.'
    }
  ],
  accounting: [
    {
      key: 'owner',
      label: 'Meet the team: owner portrait',
      where:
        'The "Meet the team" section: the tall portrait to the left of the owner’s name, credentials and bio. The section only appears when the firm has a named owner.',
      shape: 'Portrait, 4:5',
      suggest: 'A natural-light portrait of the owner at the office. Leave space above the head.'
    }
  ],
  // The defense template has no photo areas.
  defense: []
};

// What a template receives for a slot that has an upload.
export interface SitePhoto {
  src: string;
  alt: string;
}
export type SitePhotos = Partial<Record<string, SitePhoto>>;

export function hasPhotoSlot(industry: string, slot: string): boolean {
  return (
    Object.hasOwn(photoSlots, industry) &&
    photoSlots[industry as IndustryKey].some((s) => s.key === slot)
  );
}

export const MAX_PHOTO_BYTES = 1_500_000;

// SVG is left out on purpose: it can carry script, and these are served from our own origin.
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// The declared type is client-supplied, so the type comes from the bytes.
export function sniffImageType(b: Uint8Array): (typeof PHOTO_TYPES)[number] | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (
    b.length > 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  )
    return 'image/png';
  if (
    b.length > 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  )
    return 'image/webp';
  return null;
}
