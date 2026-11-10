// The client-portal model behind the schedule and budget boards. Everything here is pure, so the
// numbers the page prints can be asserted in portal.spec.ts rather than eyeballed.
//
// Dates are day offsets from `start`; the display strings are computed, never typed, so a phase
// can't disagree with its own bar. Money is whole dollars.

export interface Phase {
  id: string;
  name: string;
  plannedStart: number; // the baseline the client signed
  plannedEnd: number;
  start: number; // actual start, or the builder's current forecast for a phase not begun
  end: number; // actual finish, or the current forecast
  percent: number; // 0-100
  note: string; // what is happening on site, in the builder's words
}

export interface Milestone {
  name: string;
  planned: number;
  forecast: number;
  done: boolean;
}

export interface BudgetLine {
  id: string;
  name: string;
  base: number; // the original contract figure
  spent: number; // paid or invoiced to date
  forecast: number; // expected total at completion, INCLUDING every change order below
  kind?: 'contingency' | 'fee';
}

export interface ChangeOrder {
  id: string;
  line: string; // BudgetLine.id it adjusts
  title: string;
  amount: number; // negative for a credit
  status: 'approved' | 'pending';
  day: number; // day offset it was issued
}

export interface Allowance {
  item: string;
  allowance: number;
  selected: number | null; // null => the client has not chosen yet
}

export interface PortalProject {
  id: string;
  label: string; // switcher tab
  name: string;
  facts: string[];
  start: string; // ISO date of day 0
  asOf: number; // "today" for this sample, as a day offset
  phases: Phase[];
  milestones: Milestone[];
  scheduleNote: string;
  contract: number;
  lines: BudgetLine[];
  changeOrders: ChangeOrder[];
  allowances: Allowance[];
  budgetNote: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY = 86_400_000;

export function dateAt(startIso: string, day: number): string {
  const [y, m, d] = startIso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + day * DAY).toISOString().slice(0, 10);
}

// "Nov 6", or "Nov 6, 2026" when the year matters.
export function fmtDate(iso: string, withYear = false): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}${withYear ? `, ${y}` : ''}`;
}

// $1,234,567. Always the magnitude: callers add the words "under" or "over", so a sign is never
// the only thing separating good news from bad.
export function money(n: number, symbol = '$'): string {
  return `${symbol}${Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// "+$2,500" / "−$2,500" for a change order or a line delta. A real minus sign, not a hyphen.
export function signedMoney(n: number, symbol = '$'): string {
  if (Math.round(n) === 0) return money(0, symbol);
  return `${n > 0 ? '+' : '−'}${money(n, symbol)}`;
}

export type VarianceState = 'under' | 'on' | 'over';

// Within half a percent (or $500) of the approved figure reads as on budget: a $90 rounding
// difference should not light up a red flag.
export function varianceState(variance: number, budget: number): VarianceState {
  const tolerance = Math.max(500, Math.abs(budget) * 0.005);
  if (Math.abs(variance) < tolerance) return 'on';
  return variance > 0 ? 'under' : 'over';
}

export interface LineSummary extends BudgetLine {
  budget: number; // base plus approved change orders
  variance: number; // budget - forecast; positive is under
  state: VarianceState;
  spentPct: number; // spent / budget, 0-100 (clamped for the bar)
  forecastPct: number; // forecast / budget, clamped to 0-130 so an overrun is visible but bounded
}

export interface BudgetSummary {
  original: number;
  approvedTotal: number; // net approved change orders
  pendingTotal: number;
  budget: number;
  spent: number;
  forecast: number;
  variance: number;
  variancePct: number;
  state: VarianceState;
  lines: LineSummary[];
  contingency: { budget: number; spent: number; usedPct: number } | null;
  approvedCount: number;
  pendingCount: number;
}

// `approvedNow` is the set of pending change orders the visitor has approved in the demo.
export function isApproved(co: ChangeOrder, approvedNow: ReadonlySet<string>): boolean {
  return co.status === 'approved' || approvedNow.has(co.id);
}

export function budgetSummary(
  project: PortalProject,
  approvedNow: ReadonlySet<string> = new Set()
): BudgetSummary {
  const approved = project.changeOrders.filter((c) => isApproved(c, approvedNow));
  const pending = project.changeOrders.filter((c) => !isApproved(c, approvedNow));
  const sum = (cos: ChangeOrder[]) => cos.reduce((t, c) => t + c.amount, 0);

  const lines: LineSummary[] = project.lines.map((line) => {
    const budget = line.base + sum(approved.filter((c) => c.line === line.id));
    const variance = budget - line.forecast;
    const ratio = (n: number) => (budget > 0 ? (n / budget) * 100 : 0);
    return {
      ...line,
      budget,
      variance,
      state: varianceState(variance, budget),
      spentPct: Math.min(100, ratio(line.spent)),
      forecastPct: Math.min(130, ratio(line.forecast))
    };
  });

  const budget = lines.reduce((t, l) => t + l.budget, 0);
  const forecast = lines.reduce((t, l) => t + l.forecast, 0);
  const spent = lines.reduce((t, l) => t + l.spent, 0);
  const variance = budget - forecast;
  const cont = lines.find((l) => l.kind === 'contingency');

  return {
    original: project.contract,
    approvedTotal: sum(approved),
    pendingTotal: sum(pending),
    budget,
    spent,
    forecast,
    variance,
    variancePct: budget > 0 ? (variance / budget) * 100 : 0,
    state: varianceState(variance, budget),
    lines,
    contingency: cont
      ? {
          budget: cont.budget,
          spent: cont.spent,
          usedPct: cont.budget > 0 ? (cont.spent / cont.budget) * 100 : 0
        }
      : null,
    approvedCount: approved.length,
    pendingCount: pending.length
  };
}

export type PhaseStatus = 'done' | 'active' | 'next';

export function phaseStatus(phase: Phase, asOf: number): PhaseStatus {
  if (phase.percent >= 100) return 'done';
  return phase.start <= asOf ? 'active' : 'next';
}

// Positive = later than the baseline.
export function phaseSlip(phase: Phase): number {
  return phase.end - phase.plannedEnd;
}

export function slipLabel(days: number): string {
  if (days === 0) return 'On plan';
  const abs = Math.abs(days);
  const unit = abs % 7 === 0 ? `${abs / 7} wk` : `${abs} day${abs === 1 ? '' : 's'}`;
  return days > 0 ? `+${unit}` : `${unit} early`;
}

export interface ScheduleSummary {
  totalDays: number; // the axis: day 0 to the later of baseline and forecast finish
  percent: number; // complete, weighted by baseline duration
  plannedFinish: string;
  forecastFinish: string;
  slipDays: number;
  state: 'ahead' | 'on' | 'behind';
  asOfIso: string;
  week: number; // 1-based week of the build as of today
  totalWeeks: number;
  nextMilestone: { name: string; forecastIso: string; inDays: number } | null;
}

export function scheduleSummary(project: PortalProject): ScheduleSummary {
  const { phases, milestones, asOf, start } = project;
  const plannedFinishDay = Math.max(...phases.map((p) => p.plannedEnd));
  const forecastFinishDay = Math.max(...phases.map((p) => p.end));
  const weight = phases.reduce((t, p) => t + (p.plannedEnd - p.plannedStart), 0);
  const done = phases.reduce((t, p) => t + ((p.plannedEnd - p.plannedStart) * p.percent) / 100, 0);
  const slipDays = forecastFinishDay - plannedFinishDay;
  const next = milestones
    .filter((m) => !m.done)
    .sort((a, b) => a.forecast - b.forecast)[0];
  return {
    totalDays: Math.max(plannedFinishDay, forecastFinishDay),
    percent: weight > 0 ? Math.round((done / weight) * 100) : 0,
    plannedFinish: dateAt(start, plannedFinishDay),
    forecastFinish: dateAt(start, forecastFinishDay),
    slipDays,
    state: slipDays > 3 ? 'behind' : slipDays < -3 ? 'ahead' : 'on',
    asOfIso: dateAt(start, asOf),
    week: Math.floor(asOf / 7) + 1,
    totalWeeks: Math.ceil(forecastFinishDay / 7),
    nextMilestone: next
      ? {
          name: next.name,
          forecastIso: dateAt(start, next.forecast),
          inDays: next.forecast - asOf
        }
      : null
  };
}

// First of each month inside the axis, as a percentage position, for the Gantt header.
export function monthTicks(
  startIso: string,
  totalDays: number
): { label: string; year: number; pct: number }[] {
  const out: { label: string; year: number; pct: number }[] = [];
  const [y, m, d] = startIso.split('-').map(Number);
  const first = Date.UTC(y, m - 1, d);
  let cursor = Date.UTC(y, m - 1, 1);
  if (cursor < first) cursor = Date.UTC(y, m, 1);
  const end = first + totalDays * DAY;
  while (cursor <= end) {
    const dt = new Date(cursor);
    out.push({
      label: MONTHS[dt.getUTCMonth()],
      year: dt.getUTCFullYear(),
      pct: ((cursor - first) / DAY / totalDays) * 100
    });
    cursor = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 1);
  }
  return out;
}
