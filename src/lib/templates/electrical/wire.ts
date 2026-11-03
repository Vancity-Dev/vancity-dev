export interface Wire {
  d: string;
  nodes: { x: number; y: number }[];
}

// A conduit run down the page gutter: a vertical wire that jogs sideways at right angles, like a
// circuit trace, with a junction node at every jog. Pure so it can be tested without a DOM.
export function wirePath(height: number, left = 26, right = 54, jogs = 6, radius = 10): Wire | null {
  if (!height || jogs < 1) return null;
  const step = height / (jogs + 1);
  const pts: [number, number][] = [[left, 0]];
  const nodes: Wire['nodes'] = [];
  let x = left;
  for (let i = 1; i <= jogs; i++) {
    const y = Math.round(step * i);
    const next = x === left ? right : left;
    pts.push([x, y], [next, y]);
    nodes.push({ x: Math.round((x + next) / 2), y });
    x = next;
  }
  pts.push([x, height]);

  // Round each corner with a quadratic curve so the trace reads as a wire, not a polyline.
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const r = Math.min(radius, Math.hypot(cx - px, cy - py) / 2, Math.hypot(nx - cx, ny - cy) / 2);
    const ux = Math.sign(cx - px);
    const uy = Math.sign(cy - py);
    const vx = Math.sign(nx - cx);
    const vy = Math.sign(ny - cy);
    d += ` L${cx - ux * r},${cy - uy * r} Q${cx},${cy} ${cx + vx * r},${cy + vy * r}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${last[0]},${last[1]}`;
  return { d, nodes };
}
