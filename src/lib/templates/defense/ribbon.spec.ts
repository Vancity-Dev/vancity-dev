import { describe, expect, it } from 'vitest';
import { ribbonBands } from './ribbon';

describe('ribbonBands', () => {
  it('returns one path per colour, each a long polyline', () => {
    const bands = ribbonBands(1200, 6000, ['#111', '#222', '#333']);
    expect(bands.map((b) => b.color)).toEqual(['#111', '#222', '#333']);
    for (const b of bands) {
      expect(b.d.startsWith('M')).toBe(true);
      expect(b.d.split(' L').length).toBeGreaterThan(200);
      expect(b.width).toBe(57);
    }
  });

  it('is empty until the page has a size', () => {
    expect(ribbonBands(0, 500, ['#111'])).toEqual([]);
    expect(ribbonBands(500, 0, ['#111'])).toEqual([]);
  });
});
