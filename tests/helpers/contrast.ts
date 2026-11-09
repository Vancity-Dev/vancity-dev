export interface ContrastFailure {
  tag: string;
  text: string;
  color: string;
  background: string;
  ratio: number;
}

// Evaluated inside the browser via page.evaluate(contrastSweep), so it must be
// self-contained: no imports, no references to outer scope.
export function contrastSweep(): ContrastFailure[] {
  type RGBA = [number, number, number, number];

  const parse = (value: string): RGBA => {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return [0, 0, 0, 0];
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
  };

  const over = (top: RGBA, bottom: RGBA): RGBA => {
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    const mix = (i: number) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a;
    return [mix(0), mix(1), mix(2), a];
  };

  const luminance = ([r, g, b]: RGBA): number => {
    const lin = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };

  const ratio = (a: RGBA, b: RGBA): number => {
    const l1 = luminance(a);
    const l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  // Composite backgrounds from the element up until an opaque layer is reached.
  const backgroundOf = (el: Element): RGBA => {
    const layers: RGBA[] = [];
    let node: Element | null = el;
    while (node) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg[3] > 0) layers.push(bg);
      if (bg[3] >= 1) break;
      node = node.parentElement;
    }
    let result: RGBA = [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) result = over(layers[i], result);
    return result;
  };

  // One selector per template root. Add the new one when a template is added.
  const ROOTS = '.op-root, .df-root, .el-root, .cpa-root, .gc-root';
  const root = document.querySelector(ROOTS);
  if (!root)
    return [{ tag: 'root', text: `${ROOTS} not found`, color: '', background: '', ratio: 0 }];

  const failures: ContrastFailure[] = [];
  for (const el of Array.from(root.querySelectorAll('a, button'))) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.right <= 0 || rect.bottom + window.scrollY <= 0 || rect.left < -1000) continue;

    const style = getComputedStyle(el);
    const bg = backgroundOf(el);
    const fg = over(parse(style.color), bg);
    const r = ratio(fg, bg);
    if (r < 4.5) {
      failures.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? '').trim().slice(0, 40),
        color: style.color,
        background: `rgb(${Math.round(bg[0])}, ${Math.round(bg[1])}, ${Math.round(bg[2])})`,
        ratio: Math.round(r * 100) / 100
      });
    }
  }
  return failures;
}
