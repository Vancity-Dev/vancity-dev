export interface Thread {
  d: string;
  dots: { x: number; y: number }[];
}

// A smooth S-curve in a 1000x1000 box, scaled to the page: one dotted hairline with a few node
// markers, like a case timeline. Kept pure so it can be tested without a DOM.
const BASE =
  'M1080,20 C820,40 760,90 900,130 S1020,200 640,230 S-60,260 90,330 S560,420 860,450 S1060,560 700,600 S-40,640 120,720 S700,780 880,830 S640,930 500,1020';

type Pt = [number, number];

export function threadPath(width: number, height: number): Thread | null {
  if (!width || !height) return null;
  const nums = (BASE.match(/-?\d+\.?\d*/g) ?? []).map(Number);
  const P: Pt[] = [];
  for (let i = 0; i < nums.length; i += 2) P.push([(nums[i] * width) / 1000, (nums[i + 1] * height) / 1000]);

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

  const d = 'M' + pts.map((pt) => `${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' L');
  const step = Math.floor(pts.length / 6);
  const dots: Thread['dots'] = [];
  for (let i = Math.floor(pts.length / 12); i < pts.length; i += step) {
    dots.push({ x: +pts[i][0].toFixed(1), y: +pts[i][1].toFixed(1) });
  }
  return { d, dots };
}
