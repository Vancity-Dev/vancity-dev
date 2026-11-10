<script lang="ts">
  // The client-facing schedule: what the portal shows a homeowner. A Gantt of every phase with
  // the signed baseline under the live forecast, a "today" line, a detail panel per phase and the
  // milestones that matter. Sample data only; the host page labels it as such.
  import {
    dateAt,
    fmtDate,
    monthTicks,
    phaseSlip,
    phaseStatus,
    scheduleSummary,
    slipLabel,
    type PortalProject
  } from './portal';

  let { project }: { project: PortalProject } = $props();

  const sum = $derived(scheduleSummary(project));
  const ticks = $derived(monthTicks(project.start, sum.totalDays));
  const todayPct = $derived((project.asOf / sum.totalDays) * 100);
  const pct = (day: number) => (day / sum.totalDays) * 100;
  const iso = (day: number) => dateAt(project.start, day);
  const range = (a: number, b: number) => `${fmtDate(iso(a))} – ${fmtDate(iso(b))}`;

  let showPlan = $state(true);
  let picked = $state<string | null>(null);

  const rows = $derived(
    project.phases.map((p) => ({
      ...p,
      status: phaseStatus(p, project.asOf),
      slip: phaseSlip(p)
    }))
  );
  const selected = $derived(
    rows.find((r) => r.id === picked) ??
      rows.find((r) => r.status === 'active') ??
      rows[rows.length - 1]
  );
  const following = $derived(rows[rows.findIndex((r) => r.id === selected.id) + 1] ?? null);

  const STATUS_WORD = { done: 'Complete', active: 'In progress', next: 'Upcoming' } as const;
  const slipTone = (days: number) => (days > 3 ? 'late' : days < -3 ? 'early' : 'plan');

  const nextIn = $derived(
    sum.nextMilestone
      ? sum.nextMilestone.inDays <= 0
        ? 'due now'
        : sum.nextMilestone.inDays < 14
          ? `in ${sum.nextMilestone.inDays} days`
          : `in ${Math.round(sum.nextMilestone.inDays / 7)} weeks`
      : ''
  );

  const milestoneRows = $derived(
    project.milestones.map((m) => ({ ...m, slip: m.forecast - m.planned }))
  );
</script>

<div class="board">
  <div class="kpis">
    <div class="kpi">
      <span class="k-label">Overall progress</span>
      <span class="k-value">{sum.percent}%</span>
      <span class="meter" role="img" aria-label="{sum.percent} percent complete">
        <span class="meter-fill" style="width:{sum.percent}%"></span>
      </span>
      <span class="k-sub">Week {sum.week} of {sum.totalWeeks}</span>
    </div>
    <div class="kpi">
      <span class="k-label">Projected finish</span>
      <span class="k-value k-date">{fmtDate(sum.forecastFinish, true)}</span>
      <span class="k-sub">
        <span class="chip {sum.state === 'behind' ? 'late' : sum.state === 'ahead' ? 'early' : 'plan'}">
          <span aria-hidden="true">{sum.state === 'behind' ? '▲' : sum.state === 'ahead' ? '▼' : '●'}</span>
          {sum.state === 'on' ? 'On plan' : `${slipLabel(Math.abs(sum.slipDays))} ${sum.state === 'behind' ? 'behind' : 'ahead'}`}
        </span>
        Baseline {fmtDate(sum.plannedFinish, true)}
      </span>
    </div>
    <div class="kpi">
      <span class="k-label">Next milestone</span>
      <span class="k-value k-name">{sum.nextMilestone?.name ?? 'All complete'}</span>
      {#if sum.nextMilestone}
        <span class="k-sub">{fmtDate(sum.nextMilestone.forecastIso)} · {nextIn}</span>
      {/if}
    </div>
  </div>

  <p class="note"><strong>This week:</strong> {project.scheduleNote}</p>

  <section class="card" aria-label="Build schedule">
    <div class="card-head">
      <h3>Build schedule</h3>
      <label class="toggle">
        <input type="checkbox" bind:checked={showPlan} />
        <span>Show original plan</span>
      </label>
    </div>

    <ul class="legend" aria-label="Key">
      <li><span class="sw sw-done"></span>Complete</li>
      <li><span class="sw sw-active"></span>In progress</li>
      <li><span class="sw sw-next"></span>Upcoming</li>
      {#if showPlan}<li><span class="sw sw-plan"></span>Original plan</li>{/if}
      <li><span class="sw sw-today"></span>Today</li>
    </ul>

    <div class="gantt">
      <div class="axis" aria-hidden="true">
        <span class="axis-spacer"></span>
        <span class="axis-track">
          {#each ticks as t (t.pct)}
            <span class="tick" style="left:{t.pct}%">
              {t.label}
              {#if t.label === 'Jan' || t === ticks[0]}<small>{t.year}</small>{/if}
            </span>
          {/each}
          <span class="today-flag" style="left:{todayPct}%">Today · {fmtDate(sum.asOfIso)}</span>
        </span>
      </div>

      <ul class="rows">
        {#each rows as r (r.id)}
          <li>
            <button
              class="row"
              class:selected={r.id === selected.id}
              aria-pressed={r.id === selected.id}
              onclick={() => (picked = r.id)}
            >
              <span class="label">
                <span class="name">
                  <span class="status-glyph {r.status}" aria-hidden="true">
                    {r.status === 'done' ? '✓' : r.status === 'active' ? '●' : '○'}
                  </span>
                  {r.name}
                </span>
                <span class="when">
                  <span class="sr">{STATUS_WORD[r.status]}, </span>{range(r.start, r.end)}
                  {#if r.slip !== 0}
                    <span class="slip {slipTone(r.slip)}">{slipLabel(r.slip)}</span>
                  {/if}
                </span>
              </span>
              <span class="track" aria-hidden="true">
                {#each ticks as t (t.pct)}<span class="grid" style="left:{t.pct}%"></span>{/each}
                {#if showPlan}
                  <span
                    class="plan"
                    style="left:{pct(r.plannedStart)}%;width:{pct(r.plannedEnd - r.plannedStart)}%"
                  ></span>
                {/if}
                <span
                  class="bar {r.status}"
                  style="left:{pct(r.start)}%;width:{pct(r.end - r.start)}%"
                >
                  <span class="fill" style="width:{r.percent}%"></span>
                </span>
                <span class="today" style="left:{todayPct}%"></span>
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </section>

  <section class="detail" aria-live="polite" aria-label="Selected phase">
    <div class="d-head">
      <h4>{selected.name}</h4>
      <span class="chip {selected.status}">{STATUS_WORD[selected.status]}</span>
    </div>
    <p class="d-note">{selected.note}</p>
    <dl class="d-facts">
      <div>
        <dt>Original plan</dt>
        <dd>{range(selected.plannedStart, selected.plannedEnd)}</dd>
      </div>
      <div>
        <dt>{selected.status === 'done' ? 'Actual' : 'Current forecast'}</dt>
        <dd>
          {range(selected.start, selected.end)}
          <span class="slip {slipTone(selected.slip)}">{slipLabel(selected.slip)}</span>
        </dd>
      </div>
      <div>
        <dt>Complete</dt>
        <dd>
          {selected.percent}%
          <span class="meter small" role="img" aria-label="{selected.percent} percent">
            <span class="meter-fill" style="width:{selected.percent}%"></span>
          </span>
        </dd>
      </div>
      {#if following}
        <div>
          <dt>Up next</dt>
          <dd>{following.name}, from {fmtDate(iso(following.start))}</dd>
        </div>
      {/if}
    </dl>
  </section>

  <section aria-label="Milestones">
    <h3 class="ms-title">Milestones &amp; inspections</h3>
    <ol class="ms">
      {#each milestoneRows as m (m.name)}
        <li class:done={m.done}>
          <span class="ms-mark" aria-hidden="true">{m.done ? '✓' : '◇'}</span>
          <span class="ms-body">
            <span class="ms-name">{m.name}</span>
            <span class="ms-date">
              {m.done ? 'Done' : 'Expected'}
              {fmtDate(iso(m.forecast), true)}
              {#if m.slip !== 0}<span class="slip {slipTone(m.slip)}">{slipLabel(m.slip)}</span>{/if}
            </span>
          </span>
        </li>
      {/each}
    </ol>
  </section>
</div>

<style>
  .board {
    display: grid;
    gap: 1.25rem;
    color: var(--gc-ink);
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .kpis {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .kpi {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1.1rem 1.2rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
  }

  .k-label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  .k-value {
    font-family: var(--gc-display);
    font-size: 2.4rem;
    font-weight: 600;
    line-height: 1;
  }

  .k-date {
    font-size: 1.9rem;
  }

  .k-name {
    font-size: 1.35rem;
    line-height: 1.2;
    padding-block: 0.3rem;
  }

  .k-sub {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--gc-muted);
  }

  .meter {
    display: block;
    height: 6px;
    background: var(--gc-track);
    border-radius: 3px;
    overflow: hidden;
  }

  .meter.small {
    display: inline-block;
    width: 90px;
    vertical-align: middle;
    margin-left: 0.5rem;
  }

  .meter-fill {
    display: block;
    height: 100%;
    background: var(--gc-primary);
    border-radius: 3px;
  }

  .note {
    margin: 0;
    padding: 0.9rem 1.1rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-left: 3px solid var(--gc-accent);
    border-radius: 4px var(--gc-radius) var(--gc-radius) 4px;
    font-size: 0.95rem;
    color: var(--gc-ink);
  }

  .card {
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
    padding: 1.25rem;
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  h3 {
    margin: 0;
    font-family: var(--gc-display);
    font-size: 1.5rem;
    font-weight: 600;
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--gc-muted);
    cursor: pointer;
  }

  .toggle input {
    width: 1.05rem;
    height: 1.05rem;
    accent-color: var(--gc-primary);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.1rem;
    list-style: none;
    margin: 0.9rem 0 1rem;
    padding: 0;
    font-size: 0.8rem;
    color: var(--gc-muted);
  }

  .legend li {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .sw {
    display: inline-block;
    width: 18px;
    height: 8px;
    border-radius: 2px;
  }

  .sw-done {
    background: var(--gc-primary);
  }

  .sw-active {
    background: var(--gc-accent);
  }

  .sw-next {
    background: var(--gc-track);
    box-shadow: inset 0 0 0 1px var(--gc-line-strong);
  }

  .sw-plan {
    height: 3px;
    background: var(--gc-muted);
  }

  .sw-today {
    width: 2px;
    height: 12px;
    background: var(--gc-bad);
  }

  .gantt {
    --label-w: 17rem;
  }

  .axis,
  .row {
    display: grid;
    grid-template-columns: var(--label-w) minmax(0, 1fr);
  }

  .axis {
    height: 3.1rem;
  }

  .axis-track {
    position: relative;
  }

  .tick {
    position: absolute;
    bottom: 0.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.2;
    transform: translateX(-50%);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--gc-muted);
    white-space: nowrap;
  }

  .tick small {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .today-flag {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    padding: 0.1rem 0.45rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: #fff;
    background: var(--gc-bad);
    border-radius: 3px;
    white-space: nowrap;
  }

  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--gc-line);
  }

  .row {
    width: 100%;
    align-items: center;
    padding: 0.5rem 0;
    border: none;
    border-bottom: 1px solid var(--gc-line-soft);
    background: transparent;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .row:hover {
    background: var(--gc-bg-alt);
  }

  .row.selected {
    background: var(--gc-bg-alt);
    box-shadow: inset 3px 0 0 var(--gc-accent);
  }

  .row:focus-visible {
    outline: 2px solid var(--gc-primary);
    outline-offset: -2px;
  }

  .label {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0 1rem 0 0.75rem;
    min-width: 0;
  }

  .name {
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .status-glyph {
    display: inline-block;
    width: 1.1em;
    text-align: center;
    font-size: 0.85em;
  }

  .status-glyph.done {
    color: var(--gc-primary);
  }

  .status-glyph.active {
    color: var(--gc-accent);
  }

  .status-glyph.next {
    color: var(--gc-muted);
  }

  .when {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    padding-left: 1.1em;
    font-size: 0.78rem;
    color: var(--gc-muted);
  }

  .track {
    position: relative;
    height: 34px;
  }

  .grid {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--gc-line-soft);
  }

  .bar {
    position: absolute;
    top: 7px;
    height: 14px;
    background: var(--gc-track);
    box-shadow: inset 0 0 0 1px var(--gc-line-strong);
    border-radius: 4px;
    overflow: hidden;
  }

  .bar .fill {
    display: block;
    height: 100%;
  }

  .bar.done .fill {
    background: var(--gc-primary);
  }

  .bar.active .fill {
    background: var(--gc-accent);
  }

  .plan {
    position: absolute;
    top: 25px;
    height: 3px;
    background: var(--gc-muted);
    border-radius: 2px;
    opacity: 0.55;
  }

  .today {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    margin-left: -1px;
    background: var(--gc-bad);
    z-index: 2;
  }

  .chip,
  .slip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.08rem 0.5rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    line-height: 1.5;
    white-space: nowrap;
  }

  .chip.late,
  .slip.late {
    background: var(--gc-bad-bg);
    color: var(--gc-bad);
  }

  .chip.early,
  .slip.early {
    background: var(--gc-good-bg);
    color: var(--gc-good);
  }

  .chip.plan,
  .slip.plan,
  .chip.next {
    background: var(--gc-track);
    color: var(--gc-ink);
  }

  .chip.done {
    background: var(--gc-good-bg);
    color: var(--gc-good);
  }

  .chip.active {
    background: var(--gc-warn-bg);
    color: var(--gc-warn);
  }

  .detail {
    padding: 1.25rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
  }

  .d-head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  h4 {
    margin: 0;
    font-family: var(--gc-display);
    font-size: 1.35rem;
    font-weight: 600;
  }

  .d-note {
    margin: 0.5rem 0 1rem;
    color: var(--gc-muted);
  }

  .d-facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    gap: 1rem 1.5rem;
    margin: 0;
  }

  .d-facts dt {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  .d-facts dd {
    margin: 0.2rem 0 0;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .ms-title {
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
  }

  .ms {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 0.6rem;
  }

  .ms li {
    display: flex;
    gap: 0.7rem;
    padding: 0.8rem 0.9rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
  }

  .ms li.done {
    background: var(--gc-bg-alt);
  }

  .ms-mark {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    font-size: 0.85rem;
    color: var(--gc-muted);
    box-shadow: inset 0 0 0 1.5px var(--gc-line-strong);
  }

  .ms li.done .ms-mark {
    color: #fff;
    background: var(--gc-primary);
    box-shadow: none;
  }

  .ms-body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .ms-name {
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .ms-date {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: var(--gc-muted);
  }

  @media (max-width: 860px) {
    .kpis {
      grid-template-columns: 1fr;
    }

    .gantt {
      --label-w: 0px;
    }

    .axis-spacer {
      display: none;
    }

    .axis,
    .row {
      grid-template-columns: minmax(0, 1fr);
    }

    .label {
      padding: 0 0.5rem 0.2rem;
    }

    .track {
      margin: 0 0.5rem;
    }

    /* The month labels crowd on a phone, so every other one drops out. */
    .tick:nth-child(even) {
      display: none;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .bar .fill,
    .meter-fill {
      transition: width 0.4s ease;
    }
  }
</style>
