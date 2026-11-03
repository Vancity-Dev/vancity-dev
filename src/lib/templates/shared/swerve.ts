export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface WireRun {
  d: string;
  node: { x: number; y: number } | null;
}

// A tube stub where the line dives into a conduit or pipe sleeve. `angle` points from the wire toward the
// hidden stretch, in degrees, so the tube's open end faces the content it disappears behind.
export interface WireCap {
  x: number;
  y: number;
  angle: number;
}

export interface Wire {
  runs: WireRun[];
  caps: WireCap[];
}

// The swerve: a long S-curve in a 1000x1020 box that crosses the page left to right.
const BASE =
  'M1080,20 C820,40 760,90 900,130 S1020,200 640,230 S-60,260 90,330 S560,420 860,450 S1060,560 700,600 S-40,640 120,720 S700,780 880,830 S640,930 500,1020';

type Pt = [number, number];

const MIN_RUN = 60;
const NODE_RUN = 220;

function samplePath(width: number, height: number): Pt[] {
  const nums = (BASE.match(/-?\d+\.?\d*/g) ?? []).map(Number);
  const P: Pt[] = [];
  for (let i = 0; i < nums.length; i += 2) {
    // Keep the swerve inside 6%..94% of the page width.
    const x = (0.06 + (0.88 * (nums[i] + 60)) / 1140) * width;
    P.push([x, (nums[i + 1] / 1020) * height]);
  }

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
    const approx = Math.hypot(b[0] - a[0], b[1] - a[1]) + Math.hypot(c[0] - b[0], c[1] - b[1]) + Math.hypot(e[0] - c[0], e[1] - c[1]);
    const n = Math.max(60, Math.ceil(approx / 8));
    for (let k = si ? 1 : 0; k <= n; k++) {
      const t = k / n;
      const u = 1 - t;
      pts.push([
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * e[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * e[1]
      ]);
    }
  });
  return pts;
}

function length(run: Pt[]): number {
  let total = 0;
  for (let i = 1; i < run.length; i++) total += Math.hypot(run[i][0] - run[i - 1][0], run[i][1] - run[i - 1][1]);
  return total;
}

// Walks the swerve and keeps only the stretches that clear every content block. Where the wire
// would cross a block it ends in a conduit tube and re-emerges on the far side, so it never
// runs under text. Pure so it can be tested without a DOM.
export function swerveRuns(width: number, height: number, blocks: Rect[], pad = 10): Wire | null {
  if (!width || !height) return null;
  const pts = samplePath(width, height);
  const inside = pts.map(([x, y]) =>
    blocks.some((b) => x > b.left - pad && x < b.right + pad && y > b.top - pad && y < b.bottom + pad)
  );

  const runs: WireRun[] = [];
  const caps: WireCap[] = [];
  const toward = (from: Pt, to: Pt) => (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;

  let i = 0;
  while (i < pts.length) {
    if (inside[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < pts.length && !inside[j + 1]) j++;
    const run = pts.slice(i, j + 1);
    if (length(run) >= MIN_RUN) {
      const mid = run[Math.floor(run.length / 2)];
      runs.push({
        d: 'M' + run.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L'),
        node: length(run) >= NODE_RUN ? { x: +mid[0].toFixed(1), y: +mid[1].toFixed(1) } : null
      });
      if (i > 0 && inside[i - 1]) caps.push({ x: +run[0][0].toFixed(1), y: +run[0][1].toFixed(1), angle: toward(run[1] ?? run[0], run[0]) });
      if (j < pts.length - 1 && inside[j + 1]) {
        const e = run[run.length - 1];
        caps.push({ x: +e[0].toFixed(1), y: +e[1].toFixed(1), angle: toward(run[run.length - 2] ?? e, e) });
      }
    }
    i = j + 1;
  }
  return { runs, caps };
}
