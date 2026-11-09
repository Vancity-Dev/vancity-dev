import type { PortalProject } from './portal';

// Two illustrative projects for the portal boards: one new build that is nudging under budget,
// one heritage renovation that has run into the usual surprises. They are samples of what a
// client sees, never a firm's real jobs, and the page labels them that way on every board.
// The figures are whole dollars and tie out (see portal.spec.ts).

const w = (weeks: number) => Math.round(weeks * 7);

const newBuild: PortalProject = {
  id: 'new-build',
  label: 'New custom home',
  name: 'Sample project · New custom home',
  facts: ['3,400 sq ft', '2 storeys + basement', 'Fixed-price contract'],
  start: '2026-02-02',
  asOf: w(39) + 4,
  scheduleNote:
    'One week behind the signed baseline. The permit arrived a week late; framing then ran a week ahead of plan, so the finish date has held at one week out.',
  phases: [
    {
      id: 'precon',
      name: 'Preconstruction & permits',
      plannedStart: w(0),
      plannedEnd: w(10),
      start: w(0),
      end: w(11),
      percent: 100,
      note: 'Design frozen, engineering signed off, building permit issued one week later than planned.'
    },
    {
      id: 'site',
      name: 'Site prep & excavation',
      plannedStart: w(10),
      plannedEnd: w(14),
      start: w(11),
      end: w(15),
      percent: 100,
      note: 'Excavation and shoring complete, footing inspection booked and passed.'
    },
    {
      id: 'foundation',
      name: 'Foundation & slab',
      plannedStart: w(14),
      plannedEnd: w(22),
      start: w(15),
      end: w(23),
      percent: 100,
      note: 'Walls poured and waterproofed, slab poured, backfill done.'
    },
    {
      id: 'framing',
      name: 'Framing & roof structure',
      plannedStart: w(22),
      plannedEnd: w(34),
      start: w(23),
      end: w(34),
      percent: 100,
      note: 'Framing inspection passed. The crew recovered a week against the baseline.'
    },
    {
      id: 'envelope',
      name: 'Roof, windows & cladding',
      plannedStart: w(34),
      plannedEnd: w(42),
      start: w(34),
      end: w(42),
      percent: 70,
      note: 'Roof membrane is on and windows are being set. Cladding starts the week after.'
    },
    {
      id: 'mep',
      name: 'Mechanical, electrical & plumbing rough-in',
      plannedStart: w(38),
      plannedEnd: w(48),
      start: w(38),
      end: w(48),
      percent: 15,
      note: 'Plumbing stack and main electrical service are in. Heating runs start Monday.'
    },
    {
      id: 'drywall',
      name: 'Insulation & drywall',
      plannedStart: w(48),
      plannedEnd: w(56),
      start: w(48),
      end: w(56),
      percent: 0,
      note: 'Starts once the rough-in inspections pass.'
    },
    {
      id: 'finishes',
      name: 'Interior finishes & millwork',
      plannedStart: w(56),
      plannedEnd: w(72),
      start: w(57),
      end: w(73),
      percent: 0,
      note: 'Millwork shop drawings are with you for sign-off before we order.'
    },
    {
      id: 'kitchen',
      name: 'Kitchen, baths & fixtures',
      plannedStart: w(68),
      plannedEnd: w(78),
      start: w(69),
      end: w(79),
      percent: 0,
      note: 'Selections due 12 weeks before install so nothing waits on a lead time.'
    },
    {
      id: 'exterior',
      name: 'Exterior & landscape',
      plannedStart: w(72),
      plannedEnd: w(80),
      start: w(73),
      end: w(81),
      percent: 0,
      note: 'Driveway, snow-melt and planting, weather permitting.'
    },
    {
      id: 'handover',
      name: 'Final inspections & handover',
      plannedStart: w(80),
      plannedEnd: w(84),
      start: w(81),
      end: w(85),
      percent: 0,
      note: 'Deficiency walk-through with you, occupancy permit, keys.'
    }
  ],
  milestones: [
    { name: 'Permit issued', planned: w(10), forecast: w(11), done: true },
    { name: 'Foundation inspection passed', planned: w(22), forecast: w(23), done: true },
    { name: 'Framing complete & inspected', planned: w(34), forecast: w(34), done: true },
    { name: 'Lock-up: windows & doors in', planned: w(42), forecast: w(42), done: false },
    { name: 'Drywall complete', planned: w(56), forecast: w(56), done: false },
    { name: 'Occupancy permit', planned: w(82), forecast: w(83), done: false },
    { name: 'Keys in your hand', planned: w(84), forecast: w(85), done: false }
  ],
  contract: 2_150_000,
  budgetNote:
    'Forecast is $27,400 under the approved budget. $9,200 of that still depends on a change order that is waiting for your approval.',
  lines: [
    { id: 'precon', name: 'Design, engineering & permits', base: 96_000, spent: 98_500, forecast: 98_500 },
    { id: 'site', name: 'Site prep & foundation', base: 248_000, spent: 241_200, forecast: 241_200 },
    { id: 'framing', name: 'Framing & structure', base: 312_000, spent: 327_400, forecast: 327_400 },
    { id: 'envelope', name: 'Roof, windows & cladding', base: 336_000, spent: 198_000, forecast: 338_500 },
    { id: 'mep', name: 'Mechanical, electrical & plumbing', base: 262_000, spent: 84_000, forecast: 268_500 },
    { id: 'drywall', name: 'Insulation & drywall', base: 118_000, spent: 0, forecast: 118_000 },
    { id: 'finishes', name: 'Interior finishes & millwork', base: 238_000, spent: 0, forecast: 233_200 },
    { id: 'kitchen', name: 'Kitchen, baths & fixtures', base: 214_000, spent: 12_000, forecast: 220_500 },
    { id: 'exterior', name: 'Exterior & landscape', base: 128_000, spent: 0, forecast: 154_500 },
    { id: 'fee', name: 'Builder’s fee & site supervision', base: 100_000, spent: 46_000, forecast: 100_000, kind: 'fee' },
    { id: 'contingency', name: 'Contingency', base: 98_000, spent: 24_000, forecast: 62_000, kind: 'contingency' }
  ],
  changeOrders: [
    { id: 'CO-01', line: 'exterior', title: 'Heated driveway and walkway', amount: 26_500, status: 'approved', day: w(30) },
    { id: 'CO-02', line: 'framing', title: 'Framed wine room off the basement', amount: 18_000, status: 'approved', day: w(24) },
    { id: 'CO-03', line: 'finishes', title: 'Simplified stair guard (credit)', amount: -4_800, status: 'approved', day: w(36) },
    { id: 'CO-04', line: 'envelope', title: 'Triple glazing in the primary suite', amount: 9_200, status: 'pending', day: w(38) }
  ],
  allowances: [
    { item: 'Appliance package', allowance: 48_000, selected: 52_400 },
    { item: 'Plumbing fixtures', allowance: 22_000, selected: 24_100 },
    { item: 'Lighting', allowance: 30_000, selected: null },
    { item: 'Tile & stone', allowance: 40_000, selected: null },
    { item: 'Hardwood flooring', allowance: 36_000, selected: null }
  ]
};

const renovation: PortalProject = {
  id: 'renovation',
  label: 'Heritage renovation',
  name: 'Sample project · Whole-home renovation',
  facts: ['2,600 sq ft', '1940s character home', 'Cost-plus with a cap'],
  start: '2026-06-01',
  asOf: w(20) + 3,
  scheduleNote:
    'Three weeks behind baseline. An oil tank and rotted sill plates turned up in demolition; both are dealt with and the rest of the schedule has been re-dated to match.',
  phases: [
    {
      id: 'demo',
      name: 'Demolition & hazardous materials',
      plannedStart: w(0),
      plannedEnd: w(4),
      start: w(0),
      end: w(5),
      percent: 100,
      note: 'An abandoned oil tank was found and removed by a licensed contractor.'
    },
    {
      id: 'structure',
      name: 'Structural & foundation repairs',
      plannedStart: w(4),
      plannedEnd: w(10),
      start: w(5),
      end: w(13),
      percent: 100,
      note: 'Rotted sill plates replaced and a new steel beam set to open the main floor.'
    },
    {
      id: 'framing',
      name: 'Framing & addition',
      plannedStart: w(10),
      plannedEnd: w(16),
      start: w(13),
      end: w(21),
      percent: 90,
      note: 'Rear addition is framed and the roof is closing in. Final framing inspection is booked.'
    },
    {
      id: 'mep',
      name: 'Mechanical, electrical & plumbing rough-in',
      plannedStart: w(14),
      plannedEnd: w(22),
      start: w(18),
      end: w(25),
      percent: 30,
      note: 'Plumbing is roughed in upstairs. The service upgrade is waiting on your approval.'
    },
    {
      id: 'drywall',
      name: 'Insulation & drywall',
      plannedStart: w(22),
      plannedEnd: w(26),
      start: w(25),
      end: w(29),
      percent: 0,
      note: 'Follows the rough-in inspections.'
    },
    {
      id: 'finishes',
      name: 'Finishes, tile & millwork',
      plannedStart: w(26),
      plannedEnd: w(36),
      start: w(29),
      end: w(39),
      percent: 0,
      note: 'Original trim is being stripped and matched in the shop.'
    },
    {
      id: 'kitchen',
      name: 'Kitchen, baths & fixtures',
      plannedStart: w(32),
      plannedEnd: w(40),
      start: w(35),
      end: w(43),
      percent: 0,
      note: 'Cabinetry is on a 10-week lead time, so it has already been ordered.'
    },
    {
      id: 'handover',
      name: 'Final clean, landscaping & handover',
      plannedStart: w(40),
      plannedEnd: w(44),
      start: w(43),
      end: w(47),
      percent: 0,
      note: 'Deficiency walk-through, then the keys.'
    }
  ],
  milestones: [
    { name: 'Demolition complete', planned: w(4), forecast: w(5), done: true },
    { name: 'Structural sign-off', planned: w(10), forecast: w(13), done: true },
    { name: 'Framing inspection', planned: w(16), forecast: w(21), done: false },
    { name: 'Rough-in inspections', planned: w(22), forecast: w(25), done: false },
    { name: 'Drywall complete', planned: w(26), forecast: w(29), done: false },
    { name: 'Final inspection', planned: w(42), forecast: w(45), done: false },
    { name: 'Keys in your hand', planned: w(44), forecast: w(47), done: false }
  ],
  contract: 1_120_000,
  budgetNote:
    'Forecast is $43,000 over the approved budget. Hidden conditions are most of it, and 76% of the contingency is already spoken for.',
  lines: [
    { id: 'demo', name: 'Demolition & hazardous materials', base: 64_000, spent: 91_500, forecast: 91_500 },
    { id: 'structure', name: 'Structural & foundation repairs', base: 118_000, spent: 152_900, forecast: 152_900 },
    { id: 'framing', name: 'Framing & addition', base: 142_000, spent: 118_000, forecast: 148_000 },
    { id: 'mep', name: 'Mechanical, electrical & plumbing', base: 156_000, spent: 38_000, forecast: 171_500 },
    { id: 'drywall', name: 'Insulation & drywall', base: 64_000, spent: 0, forecast: 64_000 },
    { id: 'finishes', name: 'Finishes, tile & millwork', base: 150_000, spent: 0, forecast: 156_000 },
    { id: 'kitchen', name: 'Kitchen, baths & fixtures', base: 214_000, spent: 0, forecast: 219_500 },
    { id: 'final', name: 'Final clean & landscaping', base: 42_000, spent: 0, forecast: 42_000 },
    { id: 'fee', name: 'Builder’s fee & site supervision', base: 90_000, spent: 38_000, forecast: 94_000, kind: 'fee' },
    { id: 'contingency', name: 'Contingency', base: 80_000, spent: 61_000, forecast: 80_000, kind: 'contingency' }
  ],
  changeOrders: [
    { id: 'CO-01', line: 'demo', title: 'Oil tank removal and soil testing', amount: 21_800, status: 'approved', day: w(3) },
    { id: 'CO-02', line: 'structure', title: 'Sill plate replacement and steel beam', amount: 34_600, status: 'approved', day: w(8) },
    { id: 'CO-03', line: 'mep', title: 'Upgrade electrical service to 200 A', amount: 11_800, status: 'pending', day: w(19) }
  ],
  allowances: [
    { item: 'Hardwood flooring', allowance: 28_000, selected: 34_000 },
    { item: 'Kitchen appliances', allowance: 36_000, selected: 41_500 },
    { item: 'Tile & stone', allowance: 22_000, selected: null },
    { item: 'Lighting', allowance: 18_000, selected: null }
  ]
};

export const portalSamples: PortalProject[] = [newBuild, renovation];
