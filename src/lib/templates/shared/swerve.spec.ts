import { describe, expect, it } from 'vitest';
import { swerveRuns } from './swerve';

describe('swerveRuns', () => {
  it('is one unbroken wire with no tubes when nothing is in the way', () => {
    const w = swerveRuns(1440, 6000, []);
    expect(w?.runs).toHaveLength(1);
    expect(w?.caps).toHaveLength(0);
    expect(w?.runs[0].d.split(' L').length).toBeGreaterThan(300);
  });

  it('dives into a conduit tube on each side of a content block', () => {
    // A full-width band across the middle of the page: the wire must go under it.
    const w = swerveRuns(1440, 6000, [{ left: 0, top: 2500, right: 1440, bottom: 3200 }]);
    expect(w!.runs.length).toBeGreaterThanOrEqual(2);
    expect(w!.caps.length).toBeGreaterThanOrEqual(2);
    for (const run of w!.runs) {
      const ys = run.d
        .slice(1)
        .split(' L')
        .map((p) => Number(p.split(',')[1]));
      // No visible point sits inside the padded block.
      expect(ys.every((y) => y <= 2490 || y >= 3210)).toBe(true);
    }
  });

  it('shows nothing when content covers the whole page', () => {
    const w = swerveRuns(1440, 6000, [{ left: -100, top: -100, right: 2000, bottom: 7000 }]);
    expect(w?.runs).toEqual([]);
  });

  it('is null until the page has a size', () => {
    expect(swerveRuns(0, 500, [])).toBeNull();
    expect(swerveRuns(500, 0, [])).toBeNull();
  });
});

describe('swerveRuns details', () => {
  it('puts couplings along long stretches, clear of the node, and gives the node a direction', () => {
    const w = swerveRuns(1440, 6000, []);
    const run = w!.runs[0];
    expect(run.joints.length).toBeGreaterThan(10);
    expect(run.node).not.toBeNull();
    expect(typeof run.node!.angle).toBe('number');
    expect(run.joints.every((j) => Math.hypot(j.x - run.node!.x, j.y - run.node!.y) > 20)).toBe(true);
  });
});
