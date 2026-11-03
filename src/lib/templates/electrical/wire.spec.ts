import { describe, expect, it } from 'vitest';
import { wirePath } from './wire';

describe('wirePath', () => {
  it('runs top to bottom with a junction node at every jog', () => {
    const w = wirePath(6000);
    expect(w?.d.startsWith('M26,0')).toBe(true);
    expect(w?.d.endsWith(',6000')).toBe(true);
    expect(w?.nodes).toHaveLength(6);
    expect(w?.nodes.every((n) => n.x > 26 && n.x < 54)).toBe(true);
  });

  it('is null until the page has a height', () => {
    expect(wirePath(0)).toBeNull();
  });
});
