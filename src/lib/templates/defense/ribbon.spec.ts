import { describe, expect, it } from 'vitest';
import { threadPath } from './ribbon';

describe('threadPath', () => {
  it('returns a long polyline with a handful of node markers', () => {
    const t = threadPath(1200, 6000);
    expect(t?.d.startsWith('M')).toBe(true);
    expect(t!.d.split(' L').length).toBeGreaterThan(200);
    expect(t!.dots.length).toBeGreaterThanOrEqual(5);
    expect(t!.dots.length).toBeLessThanOrEqual(8);
  });

  it('is null until the page has a size', () => {
    expect(threadPath(0, 500)).toBeNull();
    expect(threadPath(500, 0)).toBeNull();
  });
});
