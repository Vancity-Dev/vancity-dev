export interface RibbonBand {
  color: string;
  width: number;
  d: string;
}

// A smooth S-curve in a 1000x1000 box, scaled to the page, then offset sideways into parallel
// bands. Ported from the Websidy design's ribbon; kept pure so it can be tested without a DOM.
const BASE =
  'M1080,20 C820,40 760,90 900,130 S1020,200 640,230 S-60,260 90,330 S560,420 860,450 S1060,560 700,600 S-40,640 120,720 S700,780 880,830 S640,930 500,1020';

export function ribbonBands(
  width: number,
  height: number,
  colors: string[],
  bandWidth = 56
): RibbonBand[] {
  if (!width || !height || colors.length === 0) return [];
  const nums = (BASE.match(/-?\d+\.?\d*/g) ?? []).map(Number);
  const P: [number, number][] = [];
  for (let i = 0; i < nums.length; i += 2) P.push([(nums[i] * width) / 1000, (nums[i + 1] * height) / 1000]);

  type Pt = [number, number];
  const segs: [Pt, Pt, Pt, Pt][] = [];
  let cur = P[0];
  let prevC2 = P[2];
  segs.push([cur, P[1], P[2], P[3]]);
  cur = P[3];
  for (let i = 4; i + 1 < P.length; i += 2) {
    const c1: Pt = [2 * cur[0] - prevC2[0], 2 * cur[1] - prevC2[1]];
    segs.push([cur, c1, P[i], P[i + 1]]);
    prevC2 = P[i];
    cur = P[i + 1];
  }

  const pts: Pt[] = [];
  segs.forEach(([a, b, c, e], si) => {
    const n = 40;
    for (let k = si ? 1 : 0; k <= n; k++) {
      const t = k / n;
      const u = 1 - t;
      pts.push([
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * e[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * e[1]
      ]);
    }
  });

  const last = pts.length - 1;
  const normals = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(last, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return [-dy / len, dx / len];
  });

  return colors.map((color, k) => {
    const off = (k - (colors.length - 1) / 2) * bandWidth;
    const d =
      'M' +
      pts
        .map((pt, i) => `${(pt[0] + normals[i][0] * off).toFixed(1)},${(pt[1] + normals[i][1] * off).toFixed(1)}`)
        .join(' L');
    return { color, width: bandWidth + 1, d };
  });
}
