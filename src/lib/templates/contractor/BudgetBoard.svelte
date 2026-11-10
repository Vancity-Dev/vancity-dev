<script lang="ts">
  // The client-facing budget: approved budget vs forecast at completion, line by line, with the
  // change orders that moved it and the allowances still to be spent. Pending change orders can
  // be approved in the demo, which moves the budget the same way the real portal would.
  // Sample data only; the host page labels it as such.
  import {
    budgetSummary,
    fmtDate,
    dateAt,
    money,
    signedMoney,
    isApproved,
    type PortalProject,
    type VarianceState
  } from './portal';

  let { project, symbol = '$' }: { project: PortalProject; symbol?: string } = $props();

  let approvedIds = $state<string[]>([]);
  let announce = $state('');

  const approvedNow = $derived(new Set(approvedIds));
  const sum = $derived(budgetSummary(project, approvedNow));
  const m = (n: number) => money(n, symbol);
  const sm = (n: number) => signedMoney(n, symbol);

  const WORD: Record<VarianceState, string> = { under: 'Under', on: 'On budget', over: 'Over' };
  const GLYPH: Record<VarianceState, string> = { under: '▼', on: '●', over: '▲' };

  const verdict = $derived(
    sum.state === 'on'
      ? { head: 'On budget', tail: `Forecast is within ${m(Math.max(500, Math.abs(sum.budget) * 0.005))} of your approved budget.` }
      : {
          head: `${m(sum.variance)} ${sum.state}`,
          tail: `${sum.state === 'under' ? 'Under' : 'Over'} your approved budget by ${Math.abs(sum.variancePct).toFixed(1)}%, based on what has been spent and what we expect to spend.`
        }
  );

  // Bars share one scale per project so they compare, with room past 100% for an overrun.
  const scaleMax = $derived(
    Math.max(105, Math.ceil(Math.max(...sum.lines.map((l) => l.forecastPct)) / 5) * 5 + 5)
  );
  const at = (p: number) => `${(p / scaleMax) * 100}%`;

  const spentPct = $derived(sum.budget > 0 ? (sum.spent / sum.budget) * 100 : 0);
  const contWatch = $derived(
    sum.contingency !== null && sum.contingency.usedPct > spentPct + 10
  );

  const orders = $derived(
    project.changeOrders.map((c) => ({ ...c, approved: isApproved(c, approvedNow) }))
  );

  const allowanceRows = $derived(
    project.allowances.map((a) => {
      const diff = a.selected === null ? null : a.allowance - a.selected;
      return {
        ...a,
        diff,
        state: diff === null ? null : varianceOf(diff, a.allowance)
      };
    })
  );
  const allowanceTotal = $derived(project.allowances.reduce((t, a) => t + a.allowance, 0));
  const selectedTotal = $derived(
    project.allowances.reduce((t, a) => t + (a.selected ?? 0), 0)
  );
  const decidedAllowance = $derived(
    project.allowances.reduce((t, a) => t + (a.selected === null ? 0 : a.allowance), 0)
  );

  function varianceOf(diff: number, base: number): VarianceState {
    const tol = Math.max(500, base * 0.005);
    return Math.abs(diff) < tol ? 'on' : diff > 0 ? 'under' : 'over';
  }

  function approve(id: string, title: string) {
    if (!approvedIds.includes(id)) approvedIds = [...approvedIds, id];
    announce = `${title} approved. Your budget is now ${m(budgetSummary(project, new Set([...approvedIds])).budget)}.`;
  }

  function reset() {
    approvedIds = [];
    announce = 'Sample reset to its original state.';
  }
</script>

<div class="board">
  <div class="top">
    <div class="verdict {sum.state}">
      <span class="v-label">Forecast vs approved budget</span>
      <span class="v-head">{verdict.head}</span>
      <span class="v-chip chip {sum.state}">
        <span aria-hidden="true">{GLYPH[sum.state]}</span>{WORD[sum.state]}
      </span>
      <p class="v-tail">{verdict.tail}</p>

      <div class="compare" role="img" aria-label="Approved budget {m(sum.budget)}, forecast {m(sum.forecast)}, spent so far {m(sum.spent)}">
        <div class="c-row">
          <span class="c-name">Approved budget</span>
          <span class="c-track"><span class="c-bar budget" style="width:{(sum.budget / Math.max(sum.budget, sum.forecast)) * 100}%"></span></span>
          <span class="c-val">{m(sum.budget)}</span>
        </div>
        <div class="c-row">
          <span class="c-name">Forecast</span>
          <span class="c-track"><span class="c-bar forecast {sum.state}" style="width:{(sum.forecast / Math.max(sum.budget, sum.forecast)) * 100}%"></span></span>
          <span class="c-val">{m(sum.forecast)}</span>
        </div>
        <div class="c-row">
          <span class="c-name">Spent so far</span>
          <span class="c-track"><span class="c-bar spent" style="width:{(sum.spent / Math.max(sum.budget, sum.forecast)) * 100}%"></span></span>
          <span class="c-val">{m(sum.spent)}</span>
        </div>
      </div>
    </div>

    <div class="tiles">
      <div class="tile">
        <span class="t-label">Original contract</span>
        <span class="t-value">{m(sum.original)}</span>
        <span class="t-sub">What you signed</span>
      </div>
      <div class="tile">
        <span class="t-label">Approved changes</span>
        <span class="t-value">{sm(sum.approvedTotal)}</span>
        <span class="t-sub">
          {sum.approvedCount} change order{sum.approvedCount === 1 ? '' : 's'} ·
          {((sum.approvedTotal / sum.original) * 100).toFixed(1)}% of contract
        </span>
      </div>
      <div class="tile">
        <span class="t-label">Paid to date</span>
        <span class="t-value">{Math.round(spentPct)}%</span>
        <span class="t-sub">{m(sum.spent)} of {m(sum.budget)}</span>
      </div>
      <div class="tile" class:attention={sum.pendingCount > 0}>
        <span class="t-label">Awaiting your approval</span>
        <span class="t-value">{sum.pendingCount === 0 ? 'None' : sm(sum.pendingTotal)}</span>
        <span class="t-sub">
          {sum.pendingCount === 0
            ? 'Nothing waiting on you'
            : `${sum.pendingCount} change order${sum.pendingCount === 1 ? '' : 's'}, already in the forecast`}
        </span>
      </div>
    </div>
  </div>

  <p class="note"><strong>In plain words:</strong> {project.budgetNote}</p>

  <section class="card" aria-label="Budget by trade">
    <div class="card-head">
      <h3>Budget by trade</h3>
      <ul class="legend" aria-label="Key">
        <li><span class="sw sw-spent"></span>Spent</li>
        <li><span class="sw sw-forecast"></span>Forecast at completion</li>
        <li><span class="sw sw-budget"></span>Approved budget</li>
      </ul>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Trade</th>
            <th scope="col" class="num">Budget</th>
            <th scope="col" class="num hide-sm">Spent</th>
            <th scope="col" class="num hide-sm">Forecast</th>
            <th scope="col" class="num">Variance</th>
          </tr>
        </thead>
        <tbody>
          {#each sum.lines as l (l.id)}
            <tr>
              <th scope="row">
                <span class="l-name">{l.name}</span>
                <span
                  class="bar"
                  role="img"
                  aria-label="{Math.round(l.spentPct)} percent spent, forecast {Math.round(l.forecastPct)} percent of budget"
                >
                  <span class="b-spent" style="width:{at(l.spentPct)}"></span>
                  <span class="b-forecast {l.state}" style="left:{at(l.forecastPct)}"></span>
                  <span class="b-budget" style="left:{at(100)}"></span>
                </span>
              </th>
              <td class="num">{m(l.budget)}</td>
              <td class="num hide-sm">{l.spent === 0 ? '—' : m(l.spent)}</td>
              <td class="num hide-sm">{m(l.forecast)}</td>
              <td class="num">
                <span class="chip {l.state}">
                  <span aria-hidden="true">{GLYPH[l.state]}</span>
                  {l.state === 'on' ? 'On budget' : `${m(l.variance)} ${l.state}`}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td class="num">{m(sum.budget)}</td>
            <td class="num hide-sm">{m(sum.spent)}</td>
            <td class="num hide-sm">{m(sum.forecast)}</td>
            <td class="num">
              <span class="chip {sum.state}">
                <span aria-hidden="true">{GLYPH[sum.state]}</span>
                {sum.state === 'on' ? 'On budget' : `${m(sum.variance)} ${sum.state}`}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>

  <div class="pair">
    {#if sum.contingency}
      <section class="card" aria-label="Contingency">
        <h3>Contingency</h3>
        <p class="big">{Math.round(sum.contingency.usedPct)}%<span>used</span></p>
        <div
          class="cont"
          role="img"
          aria-label="{Math.round(sum.contingency.usedPct)} percent of contingency used, {Math.round(spentPct)} percent of the budget spent"
        >
          <span class="cont-used {contWatch ? 'over' : 'under'}" style="width:{Math.min(100, sum.contingency.usedPct)}%"></span>
          <span class="cont-pace" style="left:{Math.min(100, spentPct)}%"></span>
        </div>
        <p class="small">
          {m(sum.contingency.spent)} of {m(sum.contingency.budget)} drawn. The tick marks how much of the
          whole budget is spent ({Math.round(spentPct)}%).
        </p>
        <p class="chip {contWatch ? 'over' : 'under'} block">
          <span aria-hidden="true">{contWatch ? '▲' : '▼'}</span>
          {contWatch ? 'Drawing faster than the build is progressing' : 'Drawing slower than the build is progressing'}
        </p>
      </section>
    {/if}

    <section class="card" aria-label="Change orders">
      <div class="card-head">
        <h3>Change orders</h3>
        {#if approvedIds.length > 0}
          <button class="link" onclick={reset}>Reset sample</button>
        {/if}
      </div>
      <ul class="orders">
        {#each orders as c (c.id)}
          <li>
            <span class="o-id">{c.id}</span>
            <span class="o-body">
              <span class="o-title">{c.title}</span>
              <span class="o-meta">Issued {fmtDate(dateAt(project.start, c.day))}</span>
            </span>
            <span class="o-amt" class:credit={c.amount < 0}>{sm(c.amount)}</span>
            {#if c.approved}
              <span class="chip under"><span aria-hidden="true">✓</span>Approved</span>
            {:else}
              <button class="approve" onclick={() => approve(c.id, c.title)}>
                Approve<span class="sr"> {c.id}, {c.title}</span>
              </button>
            {/if}
          </li>
        {/each}
      </ul>
      <p class="small">
        Each change order is priced and dated before any work starts. Nothing moves your budget
        until you approve it.
      </p>
    </section>
  </div>

  <section class="card" aria-label="Selections and allowances">
    <div class="card-head">
      <h3>Selections &amp; allowances</h3>
      <span class="small tight">
        {m(selectedTotal)} chosen against {m(decidedAllowance)} allowed, out of {m(allowanceTotal)} in allowances
      </span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col" class="num hide-sm">Allowance</th>
            <th scope="col" class="num">Your selection</th>
            <th scope="col" class="num">Difference</th>
          </tr>
        </thead>
        <tbody>
          {#each allowanceRows as a (a.item)}
            <tr>
              <th scope="row"><span class="l-name">{a.item}</span></th>
              <td class="num hide-sm">{m(a.allowance)}</td>
              <td class="num">{a.selected === null ? '—' : m(a.selected)}</td>
              <td class="num">
                {#if a.state === null}
                  <span class="chip pending">Awaiting your choice</span>
                {:else}
                  <span class="chip {a.state}">
                    <span aria-hidden="true">{GLYPH[a.state]}</span>
                    {a.state === 'on' ? 'On allowance' : `${m(a.diff ?? 0)} ${a.state}`}
                  </span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <p class="sr" role="status" aria-live="polite">{announce}</p>
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

  .top {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 0.75rem;
  }

  .verdict {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 1.4rem 1.5rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-top: 4px solid var(--gc-muted);
    border-radius: var(--gc-radius);
  }

  .verdict.under {
    border-top-color: var(--gc-good);
  }

  .verdict.over {
    border-top-color: var(--gc-bad);
  }

  .v-label,
  .t-label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  .v-head {
    font-family: var(--gc-display);
    font-size: clamp(2.4rem, 5vw, 3.3rem);
    font-weight: 400;
    line-height: 1;
  }

  .v-tail {
    margin: 0;
    font-size: 0.92rem;
    color: var(--gc-muted);
  }

  .compare {
    display: grid;
    gap: 0.55rem;
    width: 100%;
    margin-top: 0.6rem;
    padding-top: 0.9rem;
    border-top: 1px solid var(--gc-line-soft);
  }

  .c-row {
    display: grid;
    grid-template-columns: 7.5rem minmax(0, 1fr) 6.5rem;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
  }

  .c-name {
    color: var(--gc-muted);
  }

  .c-val {
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  .c-track {
    display: block;
    height: 10px;
    background: var(--gc-track);
    border-radius: 0 5px 5px 0;
  }

  .c-bar {
    display: block;
    height: 100%;
    border-radius: 0 5px 5px 0;
  }

  .c-bar.budget {
    background: var(--gc-primary);
  }

  .c-bar.forecast {
    background: var(--gc-muted);
  }

  .c-bar.forecast.under {
    background: var(--gc-good);
  }

  .c-bar.forecast.over {
    background: var(--gc-bad);
  }

  .c-bar.spent {
    background: var(--gc-primary-soft);
  }

  .tiles {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .tile {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 1rem 1.1rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
  }

  .tile.attention {
    border-color: var(--gc-warn);
    background: var(--gc-warn-bg);
  }

  .t-value {
    font-family: var(--gc-display);
    font-size: 1.85rem;
    font-weight: 400;
    line-height: 1.1;
  }

  .t-sub {
    font-size: 0.8rem;
    line-height: 1.4;
    color: var(--gc-muted);
  }

  .note {
    margin: 0;
    padding: 0.9rem 1.1rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-left: 3px solid var(--gc-accent);
    border-radius: 4px var(--gc-radius) var(--gc-radius) 4px;
    font-size: 0.95rem;
  }

  .card {
    padding: 1.25rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
    min-width: 0;
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem 1rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
  }

  h3 {
    margin: 0;
    font-family: var(--gc-display);
    font-size: 1.5rem;
    font-weight: 400;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 1rem;
    list-style: none;
    margin: 0;
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
  }

  .sw-spent {
    width: 18px;
    height: 8px;
    border-radius: 2px;
    background: var(--gc-primary);
  }

  .sw-forecast {
    width: 3px;
    height: 14px;
    background: var(--gc-ink);
  }

  .sw-budget {
    width: 0;
    height: 14px;
    border-left: 2px dashed var(--gc-muted);
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  thead th {
    padding: 0.4rem 0.6rem;
    text-align: left;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gc-muted);
    border-bottom: 1px solid var(--gc-line);
  }

  tbody th,
  tbody td,
  tfoot th,
  tfoot td {
    padding: 0.6rem;
    border-bottom: 1px solid var(--gc-line-soft);
    vertical-align: middle;
  }

  tbody th {
    text-align: left;
    font-weight: 500;
    min-width: 14rem;
  }

  tfoot th,
  tfoot td {
    border-bottom: none;
    border-top: 2px solid var(--gc-ink);
    font-weight: 700;
    text-align: left;
  }

  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  thead .num {
    text-align: right;
  }

  tfoot .num {
    text-align: right;
  }

  .l-name {
    display: block;
    margin-bottom: 0.35rem;
    font-weight: 600;
  }

  .bar {
    position: relative;
    display: block;
    height: 8px;
    background: var(--gc-track);
    border-radius: 0 4px 4px 0;
  }

  .b-spent {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--gc-primary);
    border-radius: 0 4px 4px 0;
  }

  .b-forecast {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 3px;
    margin-left: -1.5px;
    background: var(--gc-ink);
    border-radius: 1px;
    box-shadow: 0 0 0 2px var(--gc-surface);
  }

  .b-budget {
    position: absolute;
    top: -5px;
    bottom: -5px;
    border-left: 2px dashed var(--gc-muted);
    margin-left: -1px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.1rem 0.55rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.5;
    white-space: nowrap;
  }

  .chip.block {
    display: flex;
    width: fit-content;
    max-width: 100%;
    white-space: normal;
    margin: 0.5rem 0 0;
  }

  .chip.under {
    background: var(--gc-good-bg);
    color: var(--gc-good);
  }

  .chip.over {
    background: var(--gc-bad-bg);
    color: var(--gc-bad);
  }

  .chip.on {
    background: var(--gc-track);
    color: var(--gc-ink);
  }

  .chip.pending {
    background: var(--gc-warn-bg);
    color: var(--gc-warn);
  }

  .pair {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: 1.25rem;
  }

  .big {
    margin: 0.4rem 0 0.7rem;
    font-family: var(--gc-display);
    font-size: 3rem;
    font-weight: 400;
    line-height: 1;
  }

  .big span {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--gc-muted);
    margin-left: 0.3rem;
  }

  .cont {
    position: relative;
    height: 10px;
    background: var(--gc-track);
    border-radius: 5px;
  }

  .cont-used {
    display: block;
    height: 100%;
    border-radius: 5px;
  }

  .cont-used.under {
    background: var(--gc-good);
  }

  .cont-used.over {
    background: var(--gc-bad);
  }

  .cont-pace {
    position: absolute;
    top: -4px;
    bottom: -4px;
    width: 3px;
    margin-left: -1.5px;
    background: var(--gc-ink);
    border-radius: 1px;
  }

  .small {
    margin: 0.75rem 0 0;
    font-size: 0.82rem;
    line-height: 1.5;
    color: var(--gc-muted);
  }

  .small.tight {
    margin: 0;
  }

  .orders {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .orders li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 0.4rem 0.9rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--gc-line-soft);
  }

  .o-id {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--gc-muted);
  }

  .o-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .o-title {
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .o-meta {
    font-size: 0.78rem;
    color: var(--gc-muted);
  }

  .o-amt {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    white-space: nowrap;
  }

  .o-amt.credit {
    color: var(--gc-good);
  }

  .approve {
    padding: 0.35rem 0.9rem;
    border: none;
    border-radius: 999px;
    background: var(--gc-primary);
    color: #fff;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
  }

  .approve:hover {
    background: var(--gc-primary-dark);
  }

  .approve:focus-visible,
  .link:focus-visible {
    outline: 2px solid var(--gc-accent);
    outline-offset: 2px;
  }

  .link {
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--gc-accent);
    text-decoration: underline;
    cursor: pointer;
  }

  @media (max-width: 860px) {
    .top,
    .pair {
      grid-template-columns: 1fr;
    }

    .hide-sm {
      display: none;
    }

    .c-row {
      grid-template-columns: 6.5rem minmax(0, 1fr) 5.5rem;
    }

    tbody th {
      min-width: 0;
    }

    tbody th,
    tbody td,
    tfoot th,
    tfoot td,
    thead th {
      padding-inline: 0.35rem;
    }

    table {
      font-size: 0.85rem;
    }

    /* A two-line chip beats a clipped one: the variance is the column that matters. */
    td .chip {
      display: inline-block;
      max-width: 5.6rem;
      padding: 0.1rem 0.5rem;
      font-size: 0.7rem;
      line-height: 1.3;
      text-align: center;
      white-space: normal;
      border-radius: 10px;
    }

    .orders li {
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .o-id {
      grid-column: 1 / -1;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .c-bar,
    .b-spent,
    .cont-used {
      transition: width 0.4s ease;
    }
  }
</style>
