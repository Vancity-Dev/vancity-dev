import { describe, expect, it } from 'vitest';
import { industries } from './index';
import { hasPhotoSlot, photoSlots, sniffImageType } from './photos';

describe('sniffImageType', () => {
  it('recognises the three allowed formats by their bytes', () => {
    expect(sniffImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0]))).toBe('image/jpeg');
    expect(sniffImageType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe('image/png');
    const webp = new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 ');
    expect(sniffImageType(webp)).toBe('image/webp');
  });

  it('refuses SVG, HTML and empty input whatever the filename says', () => {
    const enc = (s: string) => new TextEncoder().encode(s);
    expect(sniffImageType(enc('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
    expect(sniffImageType(enc('<html><script>alert(1)</script>'))).toBeNull();
    expect(sniffImageType(new Uint8Array())).toBeNull();
  });
});

describe('photoSlots', () => {
  it('covers every industry and has unique, documented slots', () => {
    expect(Object.keys(photoSlots).sort()).toEqual(Object.keys(industries).sort());
    for (const slots of Object.values(photoSlots)) {
      expect(new Set(slots.map((s) => s.key)).size).toBe(slots.length);
      for (const s of slots) {
        expect(s.where.length).toBeGreaterThan(30);
        expect(s.label && s.shape && s.suggest).toBeTruthy();
      }
    }
  });

  it('only accepts real slots, including inherited object keys', () => {
    expect(hasPhotoSlot('plumbing', 'team')).toBe(true);
    expect(hasPhotoSlot('plumbing', 'owner')).toBe(false);
    expect(hasPhotoSlot('defense', 'team')).toBe(false);
    expect(hasPhotoSlot('constructor', 'team')).toBe(false);
  });
});
