import { describe, it, expect } from 'vitest';
import {
  budgetSummary,
  dateAt,
  fmtDate,
  money,
  monthTicks,
  phaseSlip,
  phaseStatus,
  scheduleSummary,
  signedMoney,
  slipLabel,
  varianceState
} from './portal';
import { portalSamples } from './samples';

const [newBuild, renovation] = portalSamples;

describe('formatting', () => {
  it('groups thousands and keeps the sign out of money()', () => {
    expect(money(2189700)).toBe('$2,189,700');
    expect(money(-27400)).toBe('$27,400');
    expect(money(0)).toBe('$0');
  });

  it('prints a real minus for credits and nothing for zero', () => {
    expect(signedMoney(26500)).toBe('+$26,500');
    expect(signedMoney(-4800)).toBe('−$4,800');
    expect(signedMoney(0)).toBe('$0');
  });

  it('computes dates from a day offset, across month and year ends', () => {
    expect(dateAt('2026-02-02', 277)).toBe('2026-11-06');
    expect(dateAt('2026-12-30', 3)).toBe('2027-01-02');
    expect(fmtDate('2026-11-06')).toBe('Nov 6');
    expect(fmtDate('2026-11-06', true)).toBe('Nov 6, 2026');
  });
});

describe('varianceState', () => {
  it('treats half a percent as on budget and never flags a rounding difference', () => {
    expect(varianceState(300, 1_000_000)).toBe('on');
    expect(varianceState(-4_900, 1_000_000)).toBe('on');
    expect(varianceState(5_000, 1_000_000)).toBe('under');
    expect(varianceState(-5_100, 1_000_000)).toBe('over');
  });
});

describe('budgetSummary', () => {
  it('ties each sample contract to its original base lines', () => {
    for (const p of portalSamples) {
      expect(p.lines.reduce((t, l) => t + l.base, 0)).toBe(p.contract);
    }
  });

  it('puts the new build under budget and the renovation over', () => {
    const a = budgetSummary(newBuild);
    expect(a.original).toBe(2_150_000);
    expect(a.approvedTotal).toBe(39_700);
    expect(a.budget).toBe(2_189_700);
    expect(a.forecast).toBe(2_162_300);
    expect(a.variance).toBe(27_400);
    expect(a.state).toBe('under');

    const b = budgetSummary(renovation);
    expect(b.budget).toBe(1_176_400);
    expect(b.forecast).toBe(1_219_400);
    expect(b.variance).toBe(-43_000);
    expect(b.state).toBe('over');
  });

  it('matches the figures quoted in each sample note', () => {
    expect(newBuild.budgetNote).toContain('$27,400');
    expect(renovation.budgetNote).toContain('$43,000');
    const cont = budgetSummary(renovation).contingency!;
    expect(Math.round(cont.usedPct)).toBe(76);
    expect(renovation.budgetNote).toContain('76%');
  });

  it('approving a pending change order raises the budget by exactly its amount', () => {
    const before = budgetSummary(newBuild);
    const after = budgetSummary(newBuild, new Set(['CO-04']));
    expect(before.pendingCount).toBe(1);
    expect(after.pendingCount).toBe(0);
    expect(after.budget - before.budget).toBe(9_200);
    expect(after.forecast).toBe(before.forecast);
    expect(after.variance).toBe(36_600);
    // The line the change order sits on flips from over to under.
    const envelope = (s: typeof before) => s.lines.find((l) => l.id === 'envelope')!;
    expect(envelope(before).state).toBe('over');
    expect(envelope(after).state).toBe('under');
  });

  it('keeps the bars bounded', () => {
    for (const p of portalSamples) {
      for (const l of budgetSummary(p).lines) {
        expect(l.spentPct).toBeGreaterThanOrEqual(0);
        expect(l.spentPct).toBeLessThanOrEqual(100);
        expect(l.forecastPct).toBeLessThanOrEqual(130);
      }
    }
  });

  it('sums line spend to the project spend and finds the contingency', () => {
    const a = budgetSummary(newBuild);
    expect(a.spent).toBe(newBuild.lines.reduce((t, l) => t + l.spent, 0));
    expect(a.contingency).toEqual({ budget: 98_000, spent: 24_000, usedPct: (24_000 / 98_000) * 100 });
  });
});

describe('scheduleSummary', () => {
  it('reports a one-week slip on the new build and three on the renovation', () => {
    const a = scheduleSummary(newBuild);
    expect(a.slipDays).toBe(7);
    expect(a.state).toBe('behind');
    expect(a.asOfIso).toBe('2026-11-06');
    expect(a.week).toBe(40);
    expect(a.plannedFinish).toBe('2027-09-13');
    expect(a.forecastFinish).toBe('2027-09-20');
    expect(a.nextMilestone?.name).toBe('Lock-up: windows & doors in');

    const b = scheduleSummary(renovation);
    expect(b.slipDays).toBe(21);
  });

  it('weights progress by baseline duration and keeps it between 0 and 100', () => {
    for (const p of portalSamples) {
      const s = scheduleSummary(p);
      expect(s.percent).toBeGreaterThan(0);
      expect(s.percent).toBeLessThan(100);
    }
  });

  it('classifies phases from percent and start date', () => {
    const asOf = newBuild.asOf;
    const status = (id: string) => phaseStatus(newBuild.phases.find((p) => p.id === id)!, asOf);
    expect(status('framing')).toBe('done');
    expect(status('envelope')).toBe('active');
    expect(status('mep')).toBe('active');
    expect(status('drywall')).toBe('next');
  });

  it('keeps every phase inside the axis and its dates in order', () => {
    for (const p of portalSamples) {
      const { totalDays } = scheduleSummary(p);
      for (const ph of p.phases) {
        expect(ph.start).toBeLessThan(ph.end);
        expect(ph.plannedStart).toBeLessThan(ph.plannedEnd);
        expect(ph.end).toBeLessThanOrEqual(totalDays);
      }
    }
  });

  it('only marks a milestone done when it is already behind us', () => {
    for (const p of portalSamples) {
      for (const m of p.milestones) {
        if (m.done) expect(m.forecast).toBeLessThanOrEqual(p.asOf);
        else expect(m.forecast).toBeGreaterThan(p.asOf);
      }
    }
  });

  it('words slips the way a client reads them', () => {
    expect(slipLabel(0)).toBe('On plan');
    expect(slipLabel(7)).toBe('+1 wk');
    expect(slipLabel(21)).toBe('+3 wk');
    expect(slipLabel(3)).toBe('+3 days');
    expect(slipLabel(1)).toBe('+1 day');
    expect(slipLabel(-7)).toBe('1 wk early');
    expect(phaseSlip(newBuild.phases[0])).toBe(7);
  });
});

describe('monthTicks', () => {
  it('places month starts as a percentage of the axis', () => {
    const ticks = monthTicks('2026-02-02', 100);
    expect(ticks[0].label).toBe('Mar');
    expect(ticks[0].pct).toBeCloseTo((27 / 100) * 100, 5);
    expect(ticks.every((t) => t.pct >= 0 && t.pct <= 100)).toBe(true);
  });
});
