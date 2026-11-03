<script lang="ts">
  // Ported from the Claude Design canvas "CPA Firm Site Template" (Evergreen & Brass).
  // The four-page static template collapses to one page here: a prospect site is a single
  // page on its own subdomain, so the nav links are in-page anchors.
  // Every verifiable fact (licence, rating, named people, address) is optional content and
  // absent for a derived prospect — see derive.ts.

  import { onMount } from 'svelte';
  import type { AccountingContent } from './types';
  import { traceRuns, type Rect } from './trace';

  let { content }: { content: AccountingContent } = $props();

  const icons = {
    lock: 'M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9V6z',
    card: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z',
    phone:
      'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z',
    mail: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
    pin: 'M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.5 5H11v6l5.2 3.2.8-1.3-4.5-2.7V7z',
    check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z',
    cross:
      'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z',
    arrow: 'M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4z',
    ledger:
      'M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM8 7h8v2H8V7zm0 4h8v2H8v-2zm5 8H8v-2h5v2z',
    people:
      'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0 2c-3.3 0-6 1.8-6 4v2h12v-2c0-2.2-2.7-4-6-4zm7.5-1.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm.5 2c-.6 0-1.2.1-1.7.2A5.6 5.6 0 0 1 17 19v2h4v-2c0-2-1.8-3.5-4-3.5z',
    doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    calc: 'M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM8 5h8v3H8V5zm1.5 13A1.5 1.5 0 1 1 11 16.5 1.5 1.5 0 0 1 9.5 18zm0-4.5A1.5 1.5 0 1 1 11 12a1.5 1.5 0 0 1-1.5 1.5zm5 4.5A1.5 1.5 0 1 1 16 16.5 1.5 1.5 0 0 1 14.5 18zm0-4.5A1.5 1.5 0 1 1 16 12a1.5 1.5 0 0 1-1.5 1.5z',
    chart: 'M4 20V4H2v18h20v-2H4zm4-2h2V9H8v9zm4 0h2V5h-2v13zm4 0h2v-6h-2v6z',
    scale:
      'M13 4h6v2h-2.6l3.1 7.4A4 4 0 0 1 15 16h-.1l3-7.1-.9-2.2V20h-4V6.7l-.9 2.2 3 7.1H15a4 4 0 0 1-4.5-2.6L13.6 6H11V4h2zM5 6h2.6l3.1 7.4A4 4 0 0 1 7 16a4 4 0 0 1-3.7-2.6L6.4 6H5V4h2v2H5zm2 3.9L5.4 13.6h3.2L7 9.9z',
    shield:
      'M12 1 3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4zm-2 16-4-4 1.4-1.4L10 14.2l6.6-6.6L18 9l-8 8z',
    calendar:
      'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z',
    star: 'M12 17.3 18.2 21l-1.6-7L22 9.2l-7.2-.6L12 2 9.2 8.6 2 9.2 7.5 14l-1.7 7z',
    linkedin:
      'M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3V9zm6 0h3.8v1.7h.05A4.2 4.2 0 0 1 16.6 8.7c3 0 4.4 1.9 4.4 5.2V21h-4v-6.1c0-1.6-.6-2.7-2-2.7-1.2 0-1.9.8-2.2 1.6-.1.3-.1.7-.1 1.1V21H9V9z',
    burger: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    close:
      'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z'
  };

  // Everything that differs between an IRS firm and a CRA firm. Nothing else in this
  // component knows which country it is in.
  const TERMS = {
    US: {
      authority: 'the IRS',
      authorityShort: 'IRS',
      authorityUrl: 'https://www.irs.gov/filing',
      authorityHost: 'IRS.gov',
      personalReturn: 'Individual returns (1040)',
      businessReturn: 'business returns (1120-S, 1065 and 1120)',
      slips: 'W-2s and 1099s',
      sensitiveIds: 'Social Security numbers',
      regionNoun: 'state',
      estimates: 'quarterly estimates',
      salesTax: 'sales tax',
      retirement: 'retirement plan timing',
      entityNote: 'S-corp election and reasonable-salary reviews',
      credentialExplainer:
        'A CPA is state-licensed, bound by continuing education and ethics rules, and can sign returns, represent you before the IRS and advise on structure and strategy.'
    },
    CA: {
      authority: 'the CRA',
      authorityShort: 'CRA',
      authorityUrl: 'https://www.canada.ca/en/revenue-agency.html',
      authorityHost: 'canada.ca',
      personalReturn: 'Personal returns (T1)',
      businessReturn: 'corporate returns (T2)',
      slips: 'T4s and T5s',
      sensitiveIds: 'Social Insurance Numbers',
      regionNoun: 'provincial',
      estimates: 'instalments',
      salesTax: 'GST/HST',
      retirement: 'RRSP and TFSA timing',
      entityNote: 'incorporation, salary vs. dividend and holdco reviews',
      credentialExplainer:
        'A CPA is provincially registered, bound by continuing education and a code of conduct, and can prepare and file returns, deal with the CRA on your behalf and advise on structure and strategy.'
    }
  } as const;

  const t = $derived(TERMS[content.jurisdiction]);

  // UPDATE YEARLY: both tables are for the tax year in content.taxYear, filed the year after.
  // Confirm every date against the revenue agency before a client site goes live; weekend and
  // holiday dates shift to the next business day.
  const DEADLINES = {
    US: [
      {
        date: 'Jan 15, 2027',
        iso: '2027-01-15',
        what: 'Q4 2026 estimated tax payment due',
        who: 'Self-employed, partners, S-corp owners and landlords'
      },
      {
        date: 'Feb 1, 2027',
        iso: '2027-02-01',
        what: 'W-2s and 1099-NEC due to recipients and the IRS',
        who: 'Anyone who paid employees or contractors — Jan 31 falls on a Sunday'
      },
      {
        date: 'Mar 15, 2027',
        iso: '2027-03-15',
        what: 'Partnership (1065) and S-corporation (1120-S) returns due',
        who: 'Or file an extension to Sep 15'
      },
      {
        date: 'Apr 15, 2027',
        iso: '2027-04-15',
        what: 'Individual (1040) and C-corporation (1120) returns · Q1 2027 estimate · IRA and HSA contributions',
        who: 'Everyone. An extension moves the filing date, not the payment date.'
      },
      {
        date: 'Jun 15, 2027',
        iso: '2027-06-15',
        what: 'Q2 2027 estimated tax payment due',
        who: 'Also the filing date for citizens living abroad'
      },
      {
        date: 'Sep 15, 2027',
        iso: '2027-09-15',
        what: 'Q3 2027 estimate · extended 1065 and 1120-S returns due',
        who: 'The final deadline for extended business returns'
      },
      {
        date: 'Oct 15, 2027',
        iso: '2027-10-15',
        what: 'Extended individual and C-corporation returns due',
        who: 'The last call for 2026 personal returns'
      }
    ],
    CA: [
      {
        date: 'Mar 1, 2027',
        iso: '2027-03-01',
        what: 'RRSP contribution deadline for the 2026 tax year',
        who: 'Anyone claiming an RRSP deduction — Feb 28 falls on a Sunday'
      },
      {
        date: 'Mar 1, 2027',
        iso: '2027-03-01',
        what: 'T4 and T5 slips due to recipients and the CRA',
        who: 'Anyone who paid employees or dividends'
      },
      {
        date: 'Mar 15, 2027',
        iso: '2027-03-15',
        what: 'Q1 2027 personal instalment due',
        who: 'Anyone the CRA has asked to pay by instalments'
      },
      {
        date: 'Apr 30, 2027',
        iso: '2027-04-30',
        what: 'T1 personal return and any balance owing due',
        who: 'Everyone. Interest runs from May 1 on anything unpaid.'
      },
      {
        date: 'Jun 15, 2027',
        iso: '2027-06-15',
        what: 'Self-employed T1 filing deadline · Q2 2027 instalment',
        who: 'The balance owing was still due April 30'
      },
      {
        date: 'Sep 15 & Dec 15, 2027',
        iso: '2027-09-15',
        what: 'Q3 and Q4 2027 personal instalments due',
        who: 'Skipping one is what triggers instalment interest'
      },
      {
        date: '6 months after year end',
        iso: null,
        what: 'T2 corporate return due',
        who: 'The balance is due two or three months after year end — earlier than the return'
      }
    ]
  } as const;

  const deadlines = $derived(DEADLINES[content.jurisdiction]);

  const services = $derived([
    {
      title: 'Bookkeeping',
      desc: 'Monthly reconciliation of every account, clean categorisation, and statements you can actually read.',
      price: `From ${content.serviceFrom.bookkeeping}/mo`,
      icon: icons.ledger
    },
    {
      title: 'Payroll',
      desc: `Run payroll, file ${t.regionNoun} and federal returns, handle new hires, contractors and year-end ${t.slips}.`,
      price: `From ${content.serviceFrom.payroll}/mo`,
      icon: icons.people
    },
    {
      title: 'Tax Preparation',
      desc: `${t.personalReturn} and ${t.businessReturn}, filed electronically, with a review call so you understand what changed.`,
      price: `Fixed fee from ${content.returnFrom.personal}`,
      icon: icons.doc
    },
    {
      title: 'Tax Planning',
      desc: `Projections through the year, ${t.entityNote} and ${t.retirement}. No surprises at filing time.`,
      price: `Included from ${content.packages[1].name}`,
      icon: icons.calc
    },
    {
      title: 'Advisory & Fractional CFO',
      desc: 'Cash-flow forecasting, pricing and margin reviews, KPI dashboards and a monthly working session.',
      price: `From ${content.packages[2].monthly}/mo`,
      icon: icons.chart
    },
    {
      title: `${t.authorityShort} Representation`,
      desc: `Notices, audits, back filings, penalty relief and payment arrangements — handled for you, start to finish.`,
      price: 'Fixed fee per matter',
      icon: icons.scale
    }
  ]);

  const wrongWay = [
    'Chasing your accountant for two weeks to get an answer',
    'Surprise hourly invoices after every phone call',
    'A shoebox of receipts dropped off once a year',
    'Reactive filing — you find out what you owe at the deadline',
    "Books so far behind you can't get a loan or a clean P&L",
    'Nobody who can tell you whether to buy the truck this year'
  ];

  const ourWay = $derived([
    `A named advisor who replies within ${content.responsePromise}`,
    'One fixed monthly fee, agreed in writing before we start',
    'Receipts and statements flow in through a secure upload',
    'Year-round planning, with a projection before year end',
    'Books closed monthly — P&L and balance sheet by the 15th',
    'Straight answers on hiring, equipment and structure'
  ]);

  const steps = $derived([
    {
      title: 'Book a free call',
      body: 'Twenty minutes on your situation. We tell you honestly whether we are a fit.'
    },
    {
      title: 'Get a fixed-fee proposal',
      body: 'A written scope and one monthly price within two business days. Nothing starts until you approve it.'
    },
    {
      title: 'Secure onboarding',
      body: 'Portal access, multi-factor login and a guided connect for your accounting file and bank feeds. We ask for documents once.'
    },
    {
      title: 'Monthly close & support',
      body: `Books closed by the 15th, planning calls through the year, and a reply within ${content.responsePromise}.`
    }
  ]);

  const reviews = $derived([
    {
      tag: 'Catch-up bookkeeping',
      q: 'We were four months behind and dreading a loan application. They caught the books up, found two years of missed deductions, and now I get a P&L on the 12th every month.',
      name: 'Dana R.',
      business: 'Progressive Electrical'
    },
    {
      tag: 'Business tax',
      q: `I used to wait two weeks for an email back. ${content.brandLead} answers the same day, and the fee is the same every month whether I call once or five times.`,
      name: 'Marcus T.',
      business: 'Tidewater Dental'
    },
    {
      tag: 'Tax planning',
      q: 'The structure review alone saved us more than a year of fees. They walked my wife and me through the whole thing in plain English.',
      name: 'Priya S.',
      business: 'Northgate Lettings'
    }
  ]);

  const cases = $derived([
    {
      head: 'Cleaned up 18 months of books in 6 weeks',
      body: `A ${content.reviewTowns[0]} contractor came to us mid-review with unreconciled accounts going back two years. We rebuilt the ledger, filed the late returns and had penalties reduced.`
    },
    {
      head: 'Turned a five-figure surprise bill into a plan',
      body: 'A design agency with no planning through the year. A structure review, a salary review and a retirement plan turned filing season into a non-event.'
    }
  ]);

  const faqs = $derived([
    {
      q: `Do you work with businesses outside ${content.city}?`,
      a: content.faqAreasAnswer
    },
    {
      q: 'How is pricing set?',
      a: 'We quote a fixed monthly or fixed per-return fee based on scope — transaction volume, number of accounts, payroll headcount, entity type and how far behind the records are. You get it in writing before any work starts, and it does not change unless the scope does. We do not bill by the hour, so a phone call never costs you anything.'
    },
    {
      q: 'Can you catch me up on back taxes or back books?',
      a: `That is a large part of what we do. Catch-up work is quoted separately after a short records review, then you move onto a normal monthly fee. Unfiled returns are usually best handled before ${t.authority} contacts you — the sooner the better for penalty relief.`
    },
    {
      q: 'What is the difference between a CPA and a bookkeeper?',
      a: `A bookkeeper records what happened: categorising transactions, reconciling accounts, closing the month. ${t.credentialExplainer} Most small businesses need both — which is why we do both under one fee.`
    },
    {
      q: 'How do I send documents securely?',
      a: `Through an encrypted upload with multi-factor login and e-signature for returns. Please do not email tax documents, ${t.sensitiveIds} or account numbers, and do not put them in the form on this page — email is not a secure channel.`
    },
    {
      q: `Do you handle ${t.authorityShort} letters?`,
      a: `Yes. Send us the notice and we will tell you what it is, whether it is correct and what it will take to resolve — usually within ${content.responsePromise}. Most notices are routine; a few are not, and the difference matters.`
    }
  ]);

  // Service filter tabs, like sheet tabs along the bottom of a workbook.
  const serviceGroups = $derived<Record<string, string>>({
    Bookkeeping: 'Books',
    Payroll: 'Books',
    'Tax Preparation': 'Tax',
    'Tax Planning': 'Tax',
    [`${t.authorityShort} Representation`]: 'Tax',
    'Advisory & Fractional CFO': 'Advisory'
  });
  const serviceTabs = ['All', 'Books', 'Tax', 'Advisory'];
  let serviceTab = $state('All');
  const shownServices = $derived(
    serviceTab === 'All' ? services : services.filter((s) => serviceGroups[s.title] === serviceTab)
  );

  const clientTypes = ['Business owner', 'Individual or family', 'Existing client'];
  const serviceNeeds = $derived([
    'Bookkeeping',
    'Tax preparation',
    'Tax planning',
    'Payroll',
    'Advisory / CFO',
    `${t.authorityShort} letter or audit`
  ]);

  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    clientType: '',
    needs: [] as string[],
    message: ''
  };

  type Errors = {
    name?: boolean;
    email?: boolean;
    phone?: boolean;
    clientType?: boolean;
    message?: boolean;
  };

  // "Pick a cell" situations: each one re-words the hero and the first steps, and pre-fills the
  // consultation form. General guidance only; nothing here is tax advice.
  const situations = $derived([
    {
      label: 'Books are behind',
      clientType: 'Business owner',
      needs: ['Bookkeeping'],
      h1: `Behind on the books in ${content.city}? Let’s catch them up.`,
      lead: 'Catch-up work is quoted after a short records review, then you move onto a fixed monthly fee.',
      title: 'Gather these first',
      tips: [
        'Bank and card statements for the months missing.',
        'A list of the accounts and payroll you use.',
        'Book the free call. We scope it with you.'
      ]
    },
    {
      label: 'Tax deadline coming',
      clientType: 'Individual or family',
      needs: ['Tax preparation'],
      h1: `Tax deadline coming up in ${content.city}? Get ahead of it.`,
      lead: 'Know what is due, what you need and what it will cost, before the last week.',
      title: 'Before you book',
      tips: [
        `Collect your ${t.slips} and last year’s return.`,
        'Note any big changes: a move, a new job, a sale.',
        'Book the free call and we map the dates.'
      ]
    },
    {
      label: `${t.authorityShort} letter`,
      clientType: '',
      needs: [`${t.authorityShort} letter or audit`],
      h1: `Got a ${t.authorityShort} letter? Send it to us before you reply.`,
      lead: 'We tell you what it is, whether it is correct and what it will take to resolve.',
      title: 'If a notice arrives',
      tips: [
        'Find the response date on the letter.',
        `Don’t email ${t.sensitiveIds} or the full notice. Use the secure portal.`,
        'Book the free call and we take it from there.'
      ]
    },
    {
      label: 'Starting a business',
      clientType: 'Business owner',
      needs: ['Advisory / CFO', 'Bookkeeping'],
      h1: `Starting a business in ${content.city}? Set the numbers up right.`,
      lead: 'Structure, books and payroll set up once, so filing season is not a surprise.',
      title: 'Day-one checklist',
      tips: [
        'Keep business and personal money in separate accounts.',
        'Decide how you will be structured, or ask us.',
        'Book the free call to set up books and payroll.'
      ]
    },
    {
      label: 'Plan to pay less tax',
      clientType: '',
      needs: ['Tax planning'],
      h1: `Want a tax plan before filing season, not after?`,
      lead: 'Planning through the year can surface options. We review structure, pay and retirement timing.',
      title: 'What helps',
      tips: [
        'Last year’s return and this year’s rough income.',
        'Any big purchase, sale or hire coming up.',
        'Book the free call. No obligation.'
      ]
    }
  ]);

  // null = nothing picked yet, so the page shows the prospect's own headline and lead.
  let sit = $state<number | null>(null);
  const current = $derived(sit === null ? null : situations[sit]);
  const heroTitle = $derived(current ? current.h1 : content.heroHeadline);
  const heroLead = $derived(current ? current.lead : content.heroLead);
  const formulaText = $derived(
    current ? `=NEXT_STEPS("${current.label}")` : '=NEXT_STEPS(pick_a_cell)'
  );
  const cardTitle = $derived(current ? current.title : 'Not sure where to start?');
  const cardTips = $derived(
    current
      ? current.tips
      : [
          'Pick the key above that fits and the steps update.',
          'Not sure? The free 20-minute call sorts it out.',
          'Fixed fees, agreed before we start.'
        ]
  );

  // Time-aware badge. Empty on the server, filled on mount, so there is no hydration mismatch.
  let now = $state<Date | null>(null);
  const nowLabel = $derived(
    now ? now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''
  );
  const liveLine = $derived.by(() => {
    if (!now) return `Reply within ${content.responsePromise}.`;
    const d = now.getDay();
    const m = now.getMonth();
    if (d === 0 || d === 6) return 'Weekend: first reply next business day.';
    if (m <= 3) return `Filing season. Reply within ${content.responsePromise}.`;
    return `Reply within ${content.responsePromise}.`;
  });

  // A trend line that swerves across the page. It is measured against the content blocks, so it
  // ends in a spreadsheet cell wherever it would cross text and re-emerges in the gaps.
  let root: HTMLElement | undefined = $state();
  let pageSize = $state({ w: 0, h: 0 });
  let blocks = $state<Rect[]>([]);
  const trace = $derived(traceRuns(pageSize.w, pageSize.h, blocks));
  const nodeGlyphs = ['Σ', '%', '=', 'π', '÷'];
  const cellLabels = ['=SUM', 'B12', 'fx', 'C4', '=AVG', 'A1'];

  function measure() {
    if (!root) return;
    const base = root.getBoundingClientRect();
    const rects: Rect[] = [];
    const bands = root.querySelectorAll(':scope > main > section, :scope > main > div, :scope > footer');
    for (const band of bands) {
      for (const child of band.children) {
        if (child instanceof SVGElement) continue;
        // Containers are walked one level down, so each column or card list is its own block.
        const parts = child.matches('.container, .container-narrow, .hero-inner')
          ? [...child.children]
          : [child];
        for (const el of parts) {
          if (el instanceof SVGElement) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 4 || r.height < 4) continue;
          rects.push({
            left: r.left - base.left,
            top: r.top - base.top,
            right: r.right - base.left,
            bottom: r.bottom - base.top
          });
        }
      }
    }
    blocks = rects;
    pageSize = { w: root.offsetWidth, h: root.offsetHeight };
  }

  onMount(() => {
    const tick = () => (now = new Date());
    tick();
    const timer = setInterval(tick, 30000);
    let ro: ResizeObserver | undefined;
    if (root && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(root);
      measure();
    }
    return () => {
      clearInterval(timer);
      ro?.disconnect();
    };
  });

  let scrollY = $state(0);
  let menuOpen = $state(false);
  let annual = $state(false);
  let form = $state({ ...emptyForm });
  let errs = $state<Errors>({});
  let tried = $state(false);
  let submitted = $state(false);

  const scrolled = $derived(scrollY > 8);
  const firstName = $derived(form.name.trim().split(' ')[0]);
  const hasErrors = $derived(Object.values(errs).some(Boolean));
  const proofLine = $derived(
    content.socialProof
      ? `${content.socialProof.ratingValue} from ${content.socialProof.ratingCount} reviews · ${content.socialProof.yearsBadge} years · ${content.socialProof.clientCount}+ clients`
      : null
  );
  const credentialCheck = $derived(
    content.credentials
      ? `${content.credentials.suffix}-led team, registered in ${content.credentials.licenceRegion}`
      : 'A named advisor on every file — not a call centre'
  );
  const formStatus = $derived(
    tried && hasErrors
      ? 'Please fix the highlighted fields.'
      : `We reply within ${content.responsePromise}. Please do not send ${t.sensitiveIds} or tax documents here.`
  );
  const billingStatus = $derived(annual ? 'Showing annual prices.' : 'Showing monthly prices.');

  function validate(f: typeof emptyForm): Errors {
    return {
      name: !f.name.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()),
      // Optional, but a number that was typed has to be dialable.
      phone: f.phone.trim() !== '' && f.phone.replace(/\D/g, '').length < 10,
      clientType: !f.clientType,
      message: !f.message.trim()
    };
  }

  // On input, not on blur: clearing an error removes its paragraph, and doing that on blur
  // moves the submit button between mouse-down and mouse-up, so the click misses it.
  function revalidate() {
    if (tried) errs = validate(form);
  }

  // Picking a situation also pre-fills the consultation form, so the choice carries through.
  function pick(i: number) {
    sit = i;
    const s = situations[i];
    if (s.clientType) form.clientType = s.clientType;
    form.needs = [...s.needs];
    if (tried) errs = validate(form);
  }

  function toggleNeed(need: string, checked: boolean) {
    form.needs = checked ? [...form.needs, need] : form.needs.filter((n) => n !== need);
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const next = validate(form);
    errs = next;
    tried = true;
    submitted = !Object.values(next).some(Boolean);
  }

  function resetForm() {
    submitted = false;
    tried = false;
    errs = {};
    form = { ...emptyForm, needs: [] };
  }
</script>

<svelte:head>
  <title>{content.title}</title>
  <meta name="description" content={content.metaDescription} />
  <link
    href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<svelte:window bind:scrollY />

{#snippet edge(fill: string)}
  <svg class="edge" aria-hidden="true" viewBox="0 0 1440 48" preserveAspectRatio="none">
    <path
      d="M0,48 V30 H80 V18 H160 V34 H240 V22 H320 V10 H400 V26 H480 V16 H560 V30 H640 V12 H720 V24 H800 V8 H880 V28 H960 V18 H1040 V32 H1120 V14 H1200 V26 H1280 V10 H1360 V22 H1440 V48Z"
      {fill}
    />
    <path
      class="edge-trace"
      d="M0,30 L80,18 L160,34 L240,22 L320,10 L400,26 L480,16 L560,30 L640,12 L720,24 L800,8 L880,28 L960,18 L1040,32 L1120,14 L1200,26 L1280,10 L1360,22 L1440,22"
    />
  </svg>
{/snippet}

<div class="cpa-root" id="top" bind:this={root}>
  {#if trace}
    <svg class="trace" aria-hidden="true" width={pageSize.w} height={pageSize.h} viewBox="0 0 {pageSize.w} {pageSize.h}">
      {#each trace.runs as run, i (i)}
        <path d={run.d} class="trace-line" />
        <path d={run.d} class="trace-pulse" pathLength="1000" />
        {#each run.joints as j (j.x + ',' + j.y)}
          <circle cx={j.x} cy={j.y} r="5" class="trace-point" />
        {/each}
        {#if run.node}
          <g transform="translate({run.node.x} {run.node.y})">
            <circle r="15" class="trace-node" />
            <text class="trace-glyph" text-anchor="middle" dy="6">{nodeGlyphs[i % nodeGlyphs.length]}</text>
          </g>
        {/if}
      {/each}
      {#each trace.caps as cap, i (i)}
        <g transform="translate({cap.x} {cap.y})">
          <rect x="-22" y="-11" width="44" height="22" rx="3" class="trace-cell" />
          <text class="trace-label" text-anchor="middle" dy="4">{cellLabels[i % cellLabels.length]}</text>
          <rect x="19" y="8" width="6" height="6" class="trace-handle" />
        </g>
      {/each}
    </svg>
  {/if}
  <a href="#main" class="skip">Skip to content</a>

  <!-- Office facts and existing-client links. Deliberately quiet: never a prospect CTA. -->
  <div class="utility">
    <div class="container utility-inner">
      <p class="utility-meta">
        {#if content.address}
          <span>{content.address[content.address.length - 1]}</span>
          <span class="dot" aria-hidden="true">·</span>
        {/if}
        <span>In-person &amp; virtual appointments</span>
        {#if content.taxSeasonHours}
          <span class="dot" aria-hidden="true">·</span>
          <span class="utility-season">Tax season: {content.taxSeasonHours}</span>
        {/if}
      </p>
      {#if content.portalUrl || content.paymentUrl}
        <div class="utility-links">
          {#if content.portalUrl}
            <a class="utility-link" href={content.portalUrl}>
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.lock} /></svg
              >Client Portal
            </a>
          {/if}
          {#if content.paymentUrl}
            <a class="utility-link" href={content.paymentUrl}>
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.card} /></svg
              >Make a Payment
            </a>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <header class="header" class:scrolled>
    <div class="container header-inner">
      <a href="#top" class="brand">
        <span class="brand-mark" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
            <rect
              x="1"
              y="1"
              width="38"
              height="38"
              rx="9"
              fill="var(--cpa-bg-alt)"
              stroke="var(--cpa-primary)"
              stroke-width="1.5"
            />
            <path
              d="M10 13h20M10 19h20M10 25h12"
              stroke="var(--cpa-primary)"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="m22.5 27.5 3.5 3.5 7-8"
              stroke="var(--cpa-accent)"
              stroke-width="2.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="brand-text">
          <span class="brand-name"
            >{content.brandLead}{#if content.brandTail}<span class="brand-tail">
                {content.brandTail}</span
              >{/if}</span
          >
          <span class="brand-sub">{content.brandSub}</span>
        </span>
      </a>

      <nav class="nav" aria-label="Main">
        <a href="#services">Services</a>
        <a href="#pricing">Pricing</a>
        {#if content.owner}<a href="#team">Team</a>{/if}
        <a href="#deadlines">Deadlines</a>
        <a href="#faq">FAQ</a>
        <a href="#consult">Contact</a>
      </nav>

      <a class="header-phone" href={content.phoneHref}>
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"
          ><path d={icons.phone} /></svg
        >{content.phoneDisplay}
      </a>
      <a class="btn-accent btn-sm header-cta" href={content.bookingHref}>Book a Free Consultation</a
      >

      <button
        type="button"
        class="burger"
        aria-expanded={menuOpen}
        aria-controls="cpa-menu"
        onclick={() => (menuOpen = !menuOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"
          ><path d={menuOpen ? icons.close : icons.burger} /></svg
        >Menu
      </button>
    </div>

    {#if menuOpen}
      <div class="menu" id="cpa-menu">
        <div class="container">
          {#if content.portalUrl || content.paymentUrl}
            <div class="menu-portal">
              {#if content.portalUrl}
                <a class="utility-link" href={content.portalUrl}>
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
                    ><path d={icons.lock} /></svg
                  >Client Portal
                </a>
              {/if}
              {#if content.paymentUrl}
                <a class="utility-link" href={content.paymentUrl}>
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
                    ><path d={icons.card} /></svg
                  >Make a Payment
                </a>
              {/if}
            </div>
          {/if}
          <a href="#services" onclick={() => (menuOpen = false)}>Services</a>
          <a href="#pricing" onclick={() => (menuOpen = false)}>Pricing</a>
          {#if content.owner}<a href="#team" onclick={() => (menuOpen = false)}>Team</a>{/if}
          <a href="#deadlines" onclick={() => (menuOpen = false)}>Tax deadlines</a>
          <a href="#faq" onclick={() => (menuOpen = false)}>FAQ</a>
          <a href="#consult" onclick={() => (menuOpen = false)}>Contact</a>
          <a class="menu-phone" href={content.phoneHref}>{content.phoneDisplay}</a>
        </div>
      </div>
    {/if}
  </header>

  <main id="main">
    <!-- ---- hero ---- -->
    <section class="hero">
      <svg class="glyphs" aria-hidden="true" viewBox="0 0 400 400">
        <text x="40" y="90" class="glyph g1">Σ</text>
        <text x="250" y="70" class="glyph g2">%</text>
        <text x="330" y="210" class="glyph g1">π</text>
        <text x="120" y="250" class="glyph g2">=</text>
        <text x="260" y="360" class="glyph g1">÷</text>
        <text x="30" y="370" class="glyph g2">√</text>
      </svg>
      <div class="container hero-inner">
        <div>
          <p class="eyebrow">{content.eyebrow}</p>
          <h1>{heroTitle}</h1>
          <p class="hero-lead">{heroLead}</p>
          <ul class="checks">
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.check} /></svg
              ><span><strong>Fixed monthly pricing</strong> — no hourly surprise bills</span>
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.check} /></svg
              ><span><strong>{content.responsePromise} response</strong> promise, in writing</span>
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.check} /></svg
              ><span>{credentialCheck}</span>
            </li>
          </ul>
          <div class="cta-row">
            <a class="btn-accent" href={content.bookingHref}>Book a Free 20-Minute Consultation</a>
            <a class="btn-outline" href="#pricing">See Pricing</a>
          </div>
          {#if proofLine}
            <p class="proof-line">
              <span class="stars" aria-hidden="true">
                {#each [0, 1, 2, 3, 4] as i (i)}
                  <svg width="15" height="15" viewBox="0 0 24 24"><path d={icons.star} /></svg>
                {/each}
              </span>
              {proofLine}
            </p>
          {/if}
        </div>

        <figure class="hero-media">
          <div class="sheet">
            <div class="sheet-formula"><span class="sheet-fx">fx</span><span class="sheet-expr">{formulaText}</span></div>
            <div class="calc-keys" role="group" aria-label="Your situation">
              {#each situations as s, i (s.label)}
                <button type="button" class="calc-key" class:on={sit === i} aria-pressed={sit === i} onclick={() => pick(i)}>
                  <span class="calc-ref" aria-hidden="true">A{i + 1}</span>
                  <span>{s.label}</span>
                </button>
              {/each}
            </div>
            <div class="sheet-grid">
              <p class="sheet-title">{cardTitle}</p>
              {#each cardTips as tip, i (tip)}
                <div class="sheet-row"><span class="sheet-rownum" aria-hidden="true">{i + 1}</span><span>{tip}</span></div>
              {/each}
            </div>
            <a class="btn-accent sheet-cta" href={content.bookingHref}>= Book a free 20-minute call</a>
            <p class="sheet-note">General guidance, not tax advice. Please don’t send tax documents here.</p>
          </div>
          <div class="fx-badge fx-badge-live">
            <span class="fx-cursor" aria-hidden="true"></span>
            <span class="fx-text">
              <strong>Today{nowLabel ? ` · ${nowLabel}` : ''}</strong>
              <span>{liveLine}</span>
            </span>
          </div>
          <div class="fx-badge fx-badge-sum">
            <span class="fx-sigma" aria-hidden="true">Σ</span>
            <span class="fx-text">
              <strong>Fixed fees</strong>
              <span>Agreed before we start</span>
            </span>
          </div>
          {#if content.owner}
            <figcaption>
              {content.owner.name}{#if content.credentials}, {content.credentials.suffix}{/if} — {content
                .owner.role}. Every client works with a named advisor.
            </figcaption>
          {/if}
        </figure>
      </div>
    </section>

    <!-- ---- who we help ---- -->
    <section class="section section-alt" aria-labelledby="who-head">
      {@render edge('#eef2ec')}
      <div class="container">
        <div class="sec-head center">
          <h2 id="who-head">Who we help</h2>
          <p>Two ways in — three if you are already with us.</p>
        </div>
        <div class="cards cards-3">
          <div class="card router">
            <span class="chip-icon"
              ><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.chart} /></svg
              ></span
            >
            <h3>Small businesses</h3>
            <p>
              Monthly bookkeeping, payroll, {t.businessReturn} and year-round planning for owner-run companies.
            </p>
            <a class="btn-outline btn-sm" href="#services">Business services</a>
          </div>
          <div class="card router">
            <span class="chip-icon"
              ><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.people} /></svg
              ></span
            >
            <h3>Individuals &amp; families</h3>
            <p>
              {t.personalReturn}, rental and investment income, {t.authorityShort} letters, and planning
              around a sale, a move or retirement.
            </p>
            <a class="btn-outline btn-sm" href="#consult">Personal tax help</a>
          </div>
          {#if content.portalUrl}
            <div class="card router is-client">
              <span class="chip-icon"
                ><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                  ><path d={icons.lock} /></svg
                ></span
              >
              <h3>Already a client?</h3>
              <p>
                Upload documents, sign returns, check your books and pay an invoice in the secure
                portal. Documents never go by email.
              </p>
              <a class="btn-light btn-sm" href={content.portalUrl}>Open Client Portal</a>
            </div>
          {:else}
            <div class="card router is-client">
              <span class="chip-icon"
                ><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                  ><path d={icons.shield} /></svg
                ></span
              >
              <h3>Secure by default</h3>
              <p>
                Statements and returns move through an encrypted upload with multi-factor login —
                never email. We will never ask for {t.sensitiveIds} in a web form.
              </p>
              <a class="btn-light btn-sm" href="#consult">How it works</a>
            </div>
          {/if}
        </div>

        {#if content.towns.length > 0}
          <h3 class="sr">Areas we serve</h3>
          <ul class="towns">
            <li>{content.city}</li>
            {#each content.towns as town (town)}
              <li>{town}</li>
            {/each}
          </ul>
        {/if}
      </div>
    </section>

    <!-- ---- wrong way / our way ---- -->
    <section class="section" aria-labelledby="compare-head">
      <div class="container">
        <div class="sec-head">
          <p class="eyebrow">Why clients switch</p>
          <h2 id="compare-head">The wrong way vs. the {content.brandLead} way</h2>
          <p>Most people who call us already have an accountant. This is usually what is wrong.</p>
        </div>
        <div class="compare">
          <div class="compare-col is-wrong">
            <h3>The wrong way</h3>
            <ul class="checks list-x">
              {#each wrongWay as item (item)}
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"
                    ><path d={icons.cross} /></svg
                  ><span>{item}</span>
                </li>
              {/each}
            </ul>
          </div>
          <div class="compare-col is-right">
            <h3>The {content.brandLead} way</h3>
            <ul class="checks">
              {#each ourWay as item (item)}
                <li>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"
                    ><path d={icons.check} /></svg
                  ><span>{item}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ---- services ladder ---- -->
    <section id="services" class="section section-alt" aria-labelledby="svc-head">
      {@render edge('#eef2ec')}
      <div class="container">
        <div class="sec-head">
          <p class="eyebrow">What we do</p>
          <h2 id="svc-head">Services that grow with you</h2>
          <p>Start where it hurts. Add the next rung when the business is ready.</p>
        </div>
        <div class="sheet-tabs" role="group" aria-label="Filter services">
          {#each serviceTabs as tab (tab)}
            <button type="button" class="sheet-tab" class:on={serviceTab === tab} aria-pressed={serviceTab === tab} onclick={() => (serviceTab = tab)}>{tab}</button>
          {/each}
        </div>
        <div class="cards cards-3">
          {#each shownServices as service (service.title)}
            <div class="card service">
              <span class="chip-icon"
                ><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                  ><path d={service.icon} /></svg
                ></span
              >
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <span class="price-tag">{service.price}</span>
              <a class="card-link" href="#consult"
                >Talk to us about {service.title}<svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  aria-hidden="true"><path d={icons.arrow} /></svg
                ></a
              >
            </div>
          {/each}
        </div>
        <p class="ladder-note">
          Most clients start with <strong>bookkeeping + tax</strong> and add planning as they grow.
        </p>
      </div>
    </section>

    <!-- ---- how it works ---- -->
    <section class="section" aria-labelledby="how-head">
      <div class="container">
        <div class="sec-head">
          <p class="eyebrow">Getting started</p>
          <h2 id="how-head">How it works</h2>
          <p>Four steps. Most clients are fully onboarded within two weeks.</p>
        </div>
        <ol class="steps">
          {#each steps as step (step.title)}
            <li>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          {/each}
        </ol>
        <div class="cta-row cta-row-spaced">
          <a class="btn-accent" href={content.bookingHref}>Book a Free Consultation</a>
          <a class="btn-outline" href={content.phoneHref}>
            <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"
              ><path d={icons.phone} /></svg
            >{content.phoneDisplay}
          </a>
        </div>
        <p class="proof-line">
          {#if proofLine}{proofLine} ·
          {/if}Replies within {content.responsePromise}
        </p>
      </div>
    </section>

    <!-- ---- pricing ---- -->
    <section id="pricing" class="section section-alt" aria-labelledby="price-head">
      {@render edge('#eef2ec')}
      <div class="container">
        <div class="sec-head">
          <p class="eyebrow">Fixed-fee packages</p>
          <h2 id="price-head">Pricing you can plan around</h2>
          <p>
            Monthly packages for business clients. Final fee confirmed in your written proposal —
            never an unexpected bill.
          </p>
        </div>

        <fieldset class="toggle">
          <legend class="sr">Billing period</legend>
          <div class="toggle-track">
            <input
              type="radio"
              id="cpa-bill-monthly"
              name="cpa-billing"
              checked={!annual}
              onchange={() => (annual = false)}
            />
            <label for="cpa-bill-monthly">Monthly</label>
            <input
              type="radio"
              id="cpa-bill-annual"
              name="cpa-billing"
              checked={annual}
              onchange={() => (annual = true)}
            />
            <label for="cpa-bill-annual"
              >Annual <span class="toggle-note">2 months free</span></label
            >
          </div>
          <p class="sr" role="status" aria-live="polite">{billingStatus}</p>
        </fieldset>

        <div class="cards cards-3">
          {#each content.packages as pkg, i (pkg.name)}
            <div class="card price" class:popular={i === 1}>
              {#if i === 1}<span class="popular-flag">Most popular</span>{/if}
              <h3>{pkg.name}</h3>
              <p class="pkg-blurb">{pkg.blurb}</p>
              <p class="price-from">
                {#if content.sampleProof}Sample price, starting at{:else}Starting at{/if}
              </p>
              <p class="price-amount">
                <strong>{annual ? pkg.annual : pkg.monthly}</strong><span class="per"
                  >{annual ? '/year' : '/month'}</span
                >
              </p>
              <ul class="checks">
                {#each pkg.features as feature (feature)}
                  <li>
                    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"
                      ><path d={icons.check} /></svg
                    ><span>{feature}</span>
                  </li>
                {/each}
              </ul>
              {#if i === 1}
                <a class="btn-accent btn-block" href={content.bookingHref}>Book a call</a>
              {:else}
                <a class="btn-outline btn-block" href={content.bookingHref}>Book a call</a>
              {/if}
            </div>
          {/each}
        </div>

        <div class="alacarte">
          <h3>One-off work</h3>
          <ul>
            <li>
              <strong>{t.personalReturn}</strong><span
                >from {content.returnFrom.personal}, filed electronically with a review call</span
              >
            </li>
            <li>
              <strong>Business and corporate returns</strong><span
                >from {content.returnFrom.business}, assuming the books are closed</span
              >
            </li>
            <li>
              <strong>Catch-up bookkeeping</strong><span
                >quoted per month of back work, after a short records review</span
              >
            </li>
            <li>
              <strong>{t.authorityShort} notices and audits</strong><span
                >a fixed fee per matter, quoted once we have read the notice</span
              >
            </li>
          </ul>
        </div>

        <p class="price-note">{content.priceNote}</p>
      </div>
    </section>

    <!-- ---- team ---- -->
    {#if content.owner}
      <section id="team" class="section" aria-labelledby="team-head">
        <div class="container">
          <div class="sec-head">
            <p class="eyebrow">Real people, real credentials</p>
            <h2 id="team-head">Meet the team</h2>
            <p>You will know exactly who is doing your work, and you can call them.</p>
          </div>
          <div class="owner">
            <div class="photo photo-owner">
              {#if content.photoCaptions}
                <span class="photo-caption">{content.photoCaptions.team}</span>
              {/if}
            </div>
            <div>
              <h3>
                {content.owner.name}{#if content.credentials}, {content.credentials.suffix}{/if}
              </h3>
              <p class="owner-role">
                {content.owner.role}{#if content.credentials}
                  · Registered in {content.credentials.licenceRegion}{/if}{#if content.socialProof}
                  · {content.socialProof.yearsBadge} years in practice{/if}
              </p>
              <p>{content.owner.bio}</p>
              {#if content.credentials}
                <ul class="badges">
                  {#each content.credentials.badges as badge (badge)}
                    <li>
                      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"
                        ><path d={icons.shield} /></svg
                      >{badge}
                    </li>
                  {/each}
                </ul>
              {/if}
              <div class="cta-row">
                <a class="btn-accent btn-sm" href={content.bookingHref}
                  >Book time with {content.owner.name.split(' ')[0]}</a
                >
                {#if content.owner.linkedinUrl}
                  <a class="btn-light btn-sm" href={content.owner.linkedinUrl}>
                    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"
                      ><path d={icons.linkedin} /></svg
                    >LinkedIn
                  </a>
                {/if}
              </div>
            </div>
          </div>

          {#if content.team.length > 0}
            <div class="cards cards-3 team-grid">
              {#each content.team as member (member.name)}
                <div class="card team-card">
                  <div class="photo photo-team"></div>
                  <h4>{member.name}</h4>
                  <p class="team-title">{member.title}</p>
                  <ul class="badges"><li>{member.credentials}</li></ul>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </section>
    {/if}

    <!-- ---- proof ---- -->
    <section id="reviews" class="section section-alt" aria-labelledby="proof-head">
      {@render edge('#eef2ec')}
      <div class="container">
        <div class="sec-head">
          <p class="eyebrow">Proof</p>
          <h2 id="proof-head">What clients say</h2>
        </div>

        {#if content.socialProof}
          <div class="rating-bar">
            <span class="stars" aria-hidden="true">
              {#each [0, 1, 2, 3, 4] as i (i)}
                <svg width="18" height="18" viewBox="0 0 24 24"><path d={icons.star} /></svg>
              {/each}
            </span>
            <span class="rating-score">{content.socialProof.ratingValue}</span>
            <span>average from <strong>{content.socialProof.ratingCount} reviews</strong></span>
            {#if content.googleReviewsUrl}
              <a class="btn-light btn-sm rating-cta" href={content.googleReviewsUrl}
                >Read the reviews</a
              >
            {/if}
          </div>
        {/if}

        <div class="cards cards-3">
          {#each reviews as review, i (review.name)}
            <blockquote class="card quote">
              {#if content.sampleProof}
                <span class="sample">Sample review — yours go here</span>
              {/if}
              <p class="quote-tag">{review.tag}</p>
              <p>“{review.q}”</p>
              <cite><b>{review.name}</b>{review.business} · {content.reviewTowns[i]}</cite>
            </blockquote>
          {/each}
        </div>

        <div class="cards cards-2 case-grid">
          {#each cases as snapshot (snapshot.head)}
            <div class="card case">
              {#if content.sampleProof}<span class="sample sample-dark">Sample story</span>{/if}
              <h3>{snapshot.head}</h3>
              <p>{snapshot.body}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- ---- tax deadline calendar ---- -->
    <section id="deadlines" class="section" aria-labelledby="dl-head">
      <div class="container">
        <div class="sec-head">
          <p class="eyebrow">Never miss a date</p>
          <h2 id="dl-head">{content.taxYear} tax deadline calendar</h2>
          <p>
            The dates that matter most to our clients. {t.regionNoun === 'state'
              ? 'State'
              : 'Provincial'} dates usually follow, but not always.
          </p>
        </div>
        <div class="deadlines">
          <div>
            <ul class="deadline-list">
              {#each deadlines as d (d.date + d.what)}
                <li>
                  <span class="deadline-date">
                    {#if d.iso}<time datetime={d.iso}>{d.date}</time>{:else}{d.date}{/if}
                  </span>
                  <span class="deadline-what"
                    >{d.what}<span class="deadline-who">{d.who}</span></span
                  >
                </li>
              {/each}
            </ul>
            <p class="deadline-note">
              Dates for {content.taxYear}; confirm with
              <a href={t.authorityUrl} rel="noopener">{t.authorityHost}</a>
              and your {t.regionNoun === 'state' ? 'state' : 'province'}. Weekend and holiday dates
              shift to the next business day.
            </p>
          </div>
          <div class="reminder">
            <span class="chip-icon"
              ><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.calendar} /></svg
              ></span
            >
            <h3>Want a reminder?</h3>
            <p>
              We send clients a short note before each date, with the documents we will need from
              you. Ask for it on your first call.
            </p>
            <a class="btn-accent btn-block" href={content.bookingHref}>Book a free consultation</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ---- security & software ---- -->
    <section class="section section-dark section-tight" aria-labelledby="sec-head">
      {@render edge('#1f4d3a')}
      <div class="container security">
        <div>
          <p class="eyebrow eyebrow-light">Your data</p>
          <h2 id="sec-head">Your documents never go by email</h2>
          <p>
            Statements, returns and ID move through an encrypted upload with multi-factor
            authentication and an access log. We will never ask for {t.sensitiveIds}, a bank login
            or a tax document in a web form or an email reply.
          </p>
          {#if content.portalUrl}
            <a class="btn-light btn-sm" href={content.portalUrl}>
              <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.lock} /></svg
              >Open the secure portal
            </a>
          {/if}
        </div>
        <div>
          <h3 class="software-head">{content.software.length > 0 ? 'We work in' : 'Software'}</h3>
          {#if content.software.length > 0}
            <ul class="software">
              {#each content.software as app (app)}
                <li>{app}</li>
              {/each}
            </ul>
            <p class="software-note">
              Certified in the platforms we recommend. We will migrate you if you are on something
              else.
            </p>
          {:else}
            <p class="software-note">
              We work in whichever accounting platform you already use, and we will tell you plainly
              if moving would save you money.
            </p>
          {/if}
        </div>
      </div>
    </section>

    <!-- ---- faq ---- -->
    <section id="faq" class="section" aria-labelledby="faq-head">
      <div class="container container-narrow">
        <div class="sec-head">
          <p class="eyebrow">Before you book</p>
          <h2 id="faq-head">Frequently asked questions</h2>
        </div>
        <div class="faqs">
          {#each faqs as faq (faq.q)}
            <details>
              <summary>{faq.q}</summary>
              <div class="faq-body"><p>{faq.a}</p></div>
            </details>
          {/each}
        </div>
      </div>
    </section>

    <!-- ---- consultation ---- -->
    <section id="consult" class="section section-alt" aria-labelledby="consult-head">
      {@render edge('#eef2ec')}
      <div class="container">
        <div class="sec-head">
          <p class="eyebrow">Let’s talk</p>
          <h2 id="consult-head">Book a free 20-minute consultation</h2>
          <p>
            No charge, no sales script. We will tell you what we would do and what it would cost —
            or who else to call if we are not the right fit.
          </p>
        </div>

        <div class="consult">
          <div>
            <div class="booking">
              <h3>Prefer to talk?</h3>
              <a class="booking-phone" href={content.phoneHref}>{content.phoneDisplay}</a>
              <p class="booking-hours">{content.hours}</p>
              {#if content.taxSeasonHours}
                <p class="booking-hours">Tax season: {content.taxSeasonHours}</p>
              {/if}
              <ul class="checks">
                <li>
                  <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"
                    ><path d={icons.check} /></svg
                  ><span>{credentialCheck}</span>
                </li>
                <li>
                  <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"
                    ><path d={icons.check} /></svg
                  ><span>Fixed fee in writing before we start</span>
                </li>
                {#if content.socialProof}
                  <li>
                    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"
                      ><path d={icons.check} /></svg
                    ><span
                      >{content.socialProof.ratingValue} from {content.socialProof.ratingCount}
                      reviews</span
                    >
                  </li>
                {/if}
              </ul>
            </div>
            <ul class="contact-lines">
              {#if content.email}
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"
                    ><path d={icons.mail} /></svg
                  ><span
                    ><a href="mailto:{content.email}">{content.email}</a><span class="muted-line"
                      >General questions only — no documents, please.</span
                    ></span
                  >
                </li>
              {/if}
              <li>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"
                  ><path d={icons.clock} /></svg
                ><span
                  >{content.hours}<span class="muted-line">{content.serviceAreaIntro}</span></span
                >
              </li>
              {#if content.address}
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"
                    ><path d={icons.pin} /></svg
                  >
                  <address>
                    {#each content.address as line, i (line)}
                      {#if i > 0}<br />{/if}{line}
                    {/each}
                  </address>
                </li>
              {/if}
            </ul>
          </div>

          <form class="consult-form" onsubmit={handleSubmit} novalidate>
            {#if submitted}
              <div class="thanks" role="status">
                <span class="thanks-icon" aria-hidden="true">
                  <svg width="34" height="34" viewBox="0 0 24 24"><path d={icons.check} /></svg>
                </span>
                <p class="thanks-head">Thanks, {firstName}. Request received.</p>
                <p class="thanks-body">
                  We will reply to {form.email} within {content.responsePromise}. If it is urgent,
                  call us on {content.phoneDisplay}.
                </p>
                <a class="btn-accent" href={content.phoneHref}>Call {content.phoneDisplay}</a>
                <p class="thanks-again">
                  <button type="button" onclick={resetForm}>Send another message</button>
                </p>
              </div>
            {:else}
              <p class="form-note">
                <strong>Please do not include sensitive data.</strong> No {t.sensitiveIds}, tax
                documents, bank or account numbers.{#if content.portalUrl}
                  Existing clients: use the <a href={content.portalUrl}>secure portal</a> for anything
                  confidential.{/if}
              </p>

              <div class="field">
                <label for="cpa-name">Your name</label>
                <input
                  id="cpa-name"
                  type="text"
                  autocomplete="name"
                  bind:value={form.name}
                  oninput={revalidate}
                  aria-invalid={tried && errs.name ? 'true' : undefined}
                  aria-describedby={tried && errs.name ? 'cpa-name-err' : undefined}
                />
                {#if tried && errs.name}
                  <p class="field-err" id="cpa-name-err">Please tell us your name.</p>
                {/if}
              </div>

              <div class="field-grid">
                <div class="field">
                  <label for="cpa-email">Email</label>
                  <input
                    id="cpa-email"
                    type="email"
                    autocomplete="email"
                    bind:value={form.email}
                    oninput={revalidate}
                    aria-invalid={tried && errs.email ? 'true' : undefined}
                    aria-describedby={tried && errs.email ? 'cpa-email-err' : undefined}
                  />
                  {#if tried && errs.email}
                    <p class="field-err" id="cpa-email-err">Enter a valid email address.</p>
                  {/if}
                </div>
                <div class="field">
                  <label for="cpa-phone">Phone <span class="opt">optional</span></label>
                  <input
                    id="cpa-phone"
                    type="tel"
                    autocomplete="tel"
                    bind:value={form.phone}
                    oninput={revalidate}
                    aria-invalid={tried && errs.phone ? 'true' : undefined}
                    aria-describedby={tried && errs.phone ? 'cpa-phone-err' : undefined}
                  />
                  {#if tried && errs.phone}
                    <p class="field-err" id="cpa-phone-err">
                      Enter a number with area code, or leave it blank.
                    </p>
                  {/if}
                </div>
              </div>

              <div class="field">
                <label for="cpa-type">I’m a…</label>
                <select
                  id="cpa-type"
                  bind:value={form.clientType}
                  oninput={revalidate}
                  aria-invalid={tried && errs.clientType ? 'true' : undefined}
                  aria-describedby={tried && errs.clientType ? 'cpa-type-err' : undefined}
                >
                  <option value="">Please choose</option>
                  {#each clientTypes as option (option)}
                    <option value={option}>{option}</option>
                  {/each}
                </select>
                {#if tried && errs.clientType}
                  <p class="field-err" id="cpa-type-err">Choose one so we route you properly.</p>
                {/if}
              </div>

              <fieldset class="needs">
                <legend>What do you need help with? <span class="opt">optional</span></legend>
                <div class="needs-grid">
                  {#each serviceNeeds as need (need)}
                    <label>
                      <input
                        type="checkbox"
                        checked={form.needs.includes(need)}
                        onchange={(e) => toggleNeed(need, e.currentTarget.checked)}
                      />{need}
                    </label>
                  {/each}
                </div>
              </fieldset>

              <div class="field">
                <label for="cpa-message">How can we help?</label>
                <textarea
                  id="cpa-message"
                  rows="4"
                  bind:value={form.message}
                  oninput={revalidate}
                  aria-invalid={tried && errs.message ? 'true' : undefined}
                  aria-describedby={tried && errs.message ? 'cpa-message-err' : undefined}
                ></textarea>
                {#if tried && errs.message}
                  <p class="field-err" id="cpa-message-err">
                    A sentence or two about your situation is plenty.
                  </p>
                {/if}
              </div>

              <button type="submit" class="btn-accent btn-block">Request a consultation</button>
              <p
                class="form-status"
                class:is-error={tried && hasErrors}
                role="status"
                aria-live="polite"
              >
                {formStatus}
              </p>
            {/if}
          </form>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <span class="brand brand-footer">
          <span class="brand-text">
            <span class="brand-name"
              >{content.brandLead}{#if content.brandTail}<span class="brand-tail">
                  {content.brandTail}</span
                >{/if}</span
            >
            <span class="brand-sub">{content.brandSub}</span>
          </span>
        </span>
        <p class="footer-blurb">{content.servingLine}</p>
        {#if content.address}
          <address>
            {#each content.address as line, i (line)}
              {#if i > 0}<br />{/if}{line}
            {/each}
          </address>
        {/if}
        <p class="footer-contact">
          <a href={content.phoneHref}>{content.phoneDisplay}</a>
          {#if content.email}<br /><a href="mailto:{content.email}">{content.email}</a>{/if}
        </p>
        <p class="footer-hours">
          {content.hours}{#if content.taxSeasonHours}<br />Tax season: {content.taxSeasonHours}{/if}
        </p>
        {#if content.portalUrl || content.paymentUrl}
          <div class="footer-portal">
            {#if content.portalUrl}
              <a class="utility-link" href={content.portalUrl}>
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
                  ><path d={icons.lock} /></svg
                >Client Portal
              </a>
            {/if}
            {#if content.paymentUrl}
              <a class="utility-link" href={content.paymentUrl}>
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
                  ><path d={icons.card} /></svg
                >Make a Payment
              </a>
            {/if}
          </div>
        {/if}
      </div>

      <div>
        <h3>Services</h3>
        <ul class="footer-list">
          {#each services as service (service.title)}
            <li><a href="#services">{service.title}</a></li>
          {/each}
          <li><a href="#pricing">Pricing</a></li>
        </ul>
      </div>

      <div>
        <h3>Areas we serve</h3>
        <ul class="footer-list">
          <li>{content.city}</li>
          {#each content.towns as town (town)}
            <li>{town}</li>
          {/each}
        </ul>
      </div>

      <div>
        <h3>This site</h3>
        <ul class="footer-list">
          <li><a href="#services">Services</a></li>
          <li><a href="#pricing">Pricing</a></li>
          {#if content.owner}<li><a href="#team">Team</a></li>{/if}
          <li><a href="#deadlines">Tax deadlines</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#consult">Book a consultation</a></li>
        </ul>
      </div>
    </div>

    <div class="container footer-bottom">
      {#if content.footerCredentialLine}
        <p>{content.footerCredentialLine}</p>
      {/if}
      <p class="disclaimer">{content.disclaimer}</p>
      <p>{content.copyrightLine}</p>
    </div>
  </footer>

  <div class="mobile-bar">
    <a class="btn-accent mobile-bar-book" href={content.bookingHref}>Book a Call</a>
    <a class="btn-outline mobile-bar-call" href={content.phoneHref}>Call</a>
  </div>
</div>

<style>
  /* ---- scoped reset: app.css sets cursor:none, a serif stack and link colours ---- */
  .cpa-root {
    position: relative;
    overflow-x: clip;
    --cpa-grid: rgba(31, 77, 58, 0.1);
    --cpa-primary: #1f4d3a;
    --cpa-primary-dark: #163b2c;
    --cpa-dark: #0f241b;
    --cpa-accent: #a6671b;
    --cpa-accent-dark: #8a5415;
    --cpa-bg: #faf8f3;
    --cpa-bg-alt: #eef2ec;
    --cpa-ink: #16211c;
    --cpa-muted: #4b5a52;
    --cpa-line: #d6dcd3;
    --cpa-line-soft: #e8eae2;
    --cpa-success: #15803d;
    --cpa-danger: #8f2f15;
    --cpa-radius: 12px;

    cursor: auto;
    background: var(--cpa-bg);
    color: var(--cpa-ink);
    font-family: Inter, system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.65;
  }

  .cpa-root :global(*) {
    cursor: inherit;
  }

  .cpa-root a,
  .cpa-root button,
  .cpa-root summary,
  .cpa-root label {
    cursor: pointer;
  }

  .cpa-root input,
  .cpa-root textarea {
    cursor: text;
  }

  .cpa-root select {
    cursor: pointer;
  }

  .cpa-root :global(:focus-visible) {
    outline: 3px solid var(--cpa-accent);
    outline-offset: 2px;
  }

  .cpa-root h1,
  .cpa-root h2,
  .cpa-root h3,
  .cpa-root h4 {
    font-family: Fraunces, Georgia, serif;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.18;
    color: var(--cpa-primary);
    margin: 0 0 0.6em;
  }

  .cpa-root h1 {
    font-size: clamp(2.05rem, 4.6vw, 3.1rem);
  }

  .cpa-root h2 {
    font-size: clamp(1.6rem, 3vw, 2.25rem);
  }

  .cpa-root h3 {
    font-size: clamp(1.12rem, 1.6vw, 1.3rem);
  }

  .cpa-root h4 {
    font-size: 1.02rem;
  }

  .cpa-root p {
    margin: 0 0 1.1em;
  }

  .cpa-root svg {
    fill: currentColor;
  }

  /* :where() keeps this at reset specificity, so the single-class colour rules below
     (.btn-accent, .utility-link, .footer-list a, …) win on source order. */
  .cpa-root :where(a) {
    color: var(--cpa-primary);
    text-decoration: none;
  }

  .cpa-root :where(ul),
  .cpa-root :where(ol) {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .cpa-root :where(address) {
    font-style: normal;
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  .skip {
    position: absolute;
    left: -9999px;
    top: 8px;
    background: #fff;
    color: var(--cpa-ink);
    padding: 8px 16px;
    border-radius: 8px;
    z-index: 200;
  }

  .skip:focus {
    left: 8px;
  }

  .container {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 32px);
  }

  .container-narrow {
    max-width: 840px;
  }

  .section {
    position: relative;
    padding: clamp(48px, 7vw, 88px) 0;
  }

  .section-tight {
    padding: clamp(36px, 5vw, 56px) 0;
  }

  .section-alt {
    background: var(--cpa-bg-alt);
  }

  .section-dark {
    background: var(--cpa-primary);
    color: #e6ede7;
  }

  .section-dark h2,
  .section-dark h3 {
    color: #fff;
  }

  /* ---- buttons: one accent, reserved for the primary action ---- */
  .btn-accent,
  .btn-outline,
  .btn-light {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 12px 20px;
    border-radius: 8px;
    border: 1px solid transparent;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.2;
    text-align: center;
  }

  .btn-accent {
    background: var(--cpa-accent);
    color: #fff;
    border: none;
    font-family: inherit;
  }

  .btn-accent:hover {
    background: var(--cpa-accent-dark);
  }

  .btn-outline {
    color: var(--cpa-primary);
    border-color: var(--cpa-primary);
  }

  .btn-outline:hover {
    background: var(--cpa-primary);
    color: #fff;
  }

  .btn-light {
    background: #fff;
    color: var(--cpa-primary);
    border-color: var(--cpa-line);
  }

  .btn-light:hover {
    background: var(--cpa-bg-alt);
  }

  .btn-sm {
    min-height: 44px;
    padding: 10px 16px;
    font-size: 0.925rem;
  }

  .btn-block {
    width: 100%;
  }

  .cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .cta-row-spaced {
    margin-top: 32px;
  }

  /* ---- utility bar ---- */
  .utility {
    background: var(--cpa-dark);
    color: #d9e2db;
    font-size: 0.8125rem;
  }

  .utility-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 20px;
    align-items: center;
    justify-content: space-between;
    min-height: 42px;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .utility-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    align-items: center;
    margin: 0;
  }

  .dot {
    color: rgba(217, 226, 219, 0.45);
  }

  .utility-season {
    color: #f0d9b5;
    font-weight: 500;
  }

  .utility-links,
  .menu-portal,
  .footer-portal {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .utility-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 4px 12px;
    color: #edf2ee;
    font-weight: 500;
    border: 1px solid rgba(237, 242, 238, 0.32);
    border-radius: 999px;
  }

  .utility-link:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.55);
  }

  .menu-portal .utility-link {
    color: var(--cpa-primary);
    background: var(--cpa-bg-alt);
    border-color: var(--cpa-line);
  }

  .menu-portal .utility-link:hover {
    background: var(--cpa-line-soft);
    color: var(--cpa-primary);
  }

  /* ---- header ---- */
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--cpa-bg);
    border-bottom: 1px solid var(--cpa-line);
  }

  .header.scrolled {
    box-shadow: 0 2px 14px rgba(15, 36, 27, 0.1);
  }

  .header-inner {
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 72px;
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-right: auto;
    line-height: 1.15;
  }

  .brand-mark {
    display: inline-flex;
    flex: none;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-name {
    font-family: Fraunces, Georgia, serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--cpa-primary);
  }

  .brand-tail {
    font-weight: 600;
    color: var(--cpa-accent-dark);
  }

  .brand-sub {
    font-size: 0.66rem;
    font-weight: 500;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--cpa-muted);
  }

  .nav {
    display: none;
    align-items: center;
    gap: 2px;
  }

  .nav a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 10px;
    border-radius: 8px;
    color: var(--cpa-ink);
    font-size: 0.95rem;
    font-weight: 500;
  }

  .nav a:hover {
    color: var(--cpa-primary);
    background: var(--cpa-bg-alt);
  }

  .header-phone {
    display: none;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 8px;
    color: var(--cpa-primary);
    font-weight: 600;
    font-size: 0.95rem;
  }

  .header-phone:hover {
    color: var(--cpa-accent-dark);
  }

  .burger {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 44px;
    padding: 0 12px;
    background: #fff;
    color: var(--cpa-ink);
    border: 1px solid var(--cpa-line);
    border-radius: 8px;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .menu {
    border-top: 1px solid var(--cpa-line-soft);
    background: #fff;
    padding: 12px 0 18px;
    box-shadow: 0 18px 40px rgba(15, 36, 27, 0.1);
  }

  .menu a {
    display: block;
    padding: 10px 2px;
    border-bottom: 1px solid var(--cpa-line-soft);
    color: var(--cpa-ink);
    font-size: 1.02rem;
    font-weight: 500;
  }

  .menu .menu-portal {
    margin-bottom: 12px;
  }

  .menu .menu-portal a {
    border-bottom: none;
    padding: 4px 12px;
  }

  .menu-phone {
    color: var(--cpa-primary) !important;
    font-weight: 600 !important;
    border-bottom: none !important;
  }

  /* ---- hero ---- */
  .hero {
    position: relative;
    padding: clamp(32px, 5vw, 64px) 0 clamp(48px, 7vw, 80px);
    /* Graph-paper grid that fades out toward the lower left. */
    background-image:
      linear-gradient(var(--cpa-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--cpa-grid) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .glyphs {
    position: absolute;
    right: -60px;
    top: -20px;
    width: 560px;
    height: 560px;
    pointer-events: none;
  }

  .glyph {
    font-family: Fraunces, Georgia, serif;
    font-weight: 700;
    font-size: 64px;
  }

  .glyph.g1 {
    fill: #1f4d3a;
    fill-opacity: 0.1;
  }

  .glyph.g2 {
    fill: #a6671b;
    fill-opacity: 0.16;
  }

  .hero-inner {
    display: grid;
    gap: clamp(28px, 4vw, 48px);
    align-items: center;
  }

  .hero h1 {
    margin-bottom: 14px;
  }

  .hero-lead {
    font-size: 1.14rem;
    color: var(--cpa-muted);
    max-width: 62ch;
    margin-bottom: 26px;
  }

  .eyebrow {
    margin: 0 0 12px;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: var(--cpa-accent-dark);
  }

  .eyebrow-light {
    color: #e9c893;
  }

  .checks {
    display: grid;
    gap: 10px;
    margin-bottom: 24px;
  }

  .checks li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 0.98rem;
  }

  .checks svg {
    flex: none;
    margin-top: 3px;
    color: var(--cpa-success);
  }

  .list-x svg {
    color: #9a5b4a;
  }

  .proof-line {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    align-items: center;
    margin: 14px 0 0;
    font-size: 0.9rem;
    color: var(--cpa-muted);
    font-variant-numeric: tabular-nums;
  }

  .stars {
    display: inline-flex;
    gap: 1px;
    color: var(--cpa-accent);
  }

  .photo {
    border-radius: var(--cpa-radius);
    border: 1px solid var(--cpa-line);
    background:
      repeating-linear-gradient(180deg, transparent 0 38px, rgba(31, 77, 58, 0.07) 38px 39px),
      var(--cpa-bg-alt);
    display: flex;
    align-items: flex-end;
    padding: 14px;
  }

  .photo-caption {
    font-size: 0.78rem;
    color: var(--cpa-muted);
  }

  .photo-owner {
    aspect-ratio: 4 / 5;
  }

  .photo-team {
    aspect-ratio: 1 / 1;
    margin-bottom: 14px;
  }

  .hero-media {
    margin: 0;
    position: relative;
    padding: 50px 0 52px;
  }

  .hero-media figcaption {
    margin-top: 10px;
    font-size: 0.8rem;
    color: var(--cpa-muted);
  }

  /* ---- section heads ---- */
  .sec-head {
    max-width: 64ch;
    margin-bottom: 34px;
  }

  .sec-head.center {
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }

  .sec-head p:last-child {
    margin-bottom: 0;
    color: var(--cpa-muted);
    font-size: 1.06rem;
  }

  /* ---- cards ---- */
  .cards {
    display: grid;
    gap: 20px;
  }

  .card {
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: var(--cpa-radius);
    padding: 24px;
  }

  .card h3 {
    margin-bottom: 8px;
  }

  .card p {
    color: var(--cpa-muted);
    margin-bottom: 16px;
  }

  .chip-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-bottom: 16px;
    background: var(--cpa-bg-alt);
    color: var(--cpa-primary);
    border-radius: 8px;
  }

  .router,
  .service,
  .price {
    display: flex;
    flex-direction: column;
  }

  .router .btn-outline,
  .router .btn-light {
    margin-top: auto;
    align-self: flex-start;
  }

  .is-client {
    background: var(--cpa-bg-alt);
  }

  .is-client .chip-icon {
    background: #fff;
  }

  .towns {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 28px;
  }

  .towns li {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 8px 16px;
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: 999px;
    font-size: 0.925rem;
    font-weight: 500;
  }

  /* ---- compare ---- */
  .compare {
    display: grid;
    gap: 20px;
  }

  .compare-col {
    padding: 26px;
    border-radius: var(--cpa-radius);
    border: 1px solid var(--cpa-line);
  }

  .compare-col h3 {
    font-size: 1.18rem;
  }

  .compare-col .checks {
    margin-bottom: 0;
  }

  .is-wrong {
    background: #f6f1ea;
  }

  .is-wrong h3 {
    color: #7a4535;
  }

  .is-right {
    background: #fff;
    border-color: var(--cpa-primary);
  }

  /* ---- services ---- */
  .price-tag {
    display: inline-block;
    align-self: flex-start;
    margin-bottom: 14px;
    padding: 4px 11px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--cpa-primary);
    background: var(--cpa-bg-alt);
    border-radius: 999px;
  }

  .card-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: auto;
    min-height: 44px;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .card-link:hover {
    color: var(--cpa-accent-dark);
  }

  .ladder-note {
    margin: 24px 0 0;
    font-size: 0.95rem;
    color: var(--cpa-muted);
  }

  /* ---- steps ---- */
  .steps {
    counter-reset: step;
    display: grid;
    gap: 20px;
  }

  .steps li {
    counter-increment: step;
    padding-top: 16px;
    border-top: 2px solid var(--cpa-line);
  }

  .steps li::before {
    content: counter(step);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-bottom: 12px;
    background: var(--cpa-primary);
    color: #fff;
    border-radius: 999px;
    font-family: Fraunces, Georgia, serif;
    font-weight: 700;
    font-size: 0.95rem;
    font-variant-numeric: tabular-nums;
  }

  .steps h3 {
    font-size: 1.06rem;
    margin-bottom: 6px;
  }

  .steps p {
    margin: 0;
    color: var(--cpa-muted);
    font-size: 0.95rem;
  }

  /* ---- pricing ---- */
  .toggle {
    border: 0;
    margin: 0 0 28px;
    padding: 0;
  }

  .toggle-track {
    display: inline-flex;
    gap: 4px;
    padding: 4px;
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: 999px;
  }

  .toggle-track input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .toggle-track label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 6px 18px;
    border-radius: 999px;
    font-size: 0.925rem;
    font-weight: 600;
    color: var(--cpa-muted);
  }

  .toggle-track input:checked + label {
    background: var(--cpa-primary);
    color: #fff;
  }

  .toggle-track input:focus-visible + label {
    outline: 3px solid var(--cpa-accent);
    outline-offset: 2px;
  }

  .toggle-note {
    font-weight: 500;
    font-size: 0.8rem;
  }

  .toggle-track input:checked + label .toggle-note {
    color: #f0d9b5;
  }

  .price {
    position: relative;
  }

  .popular {
    border-color: var(--cpa-primary);
    box-shadow: 0 8px 24px rgba(15, 36, 27, 0.08);
  }

  .popular-flag {
    position: absolute;
    top: -13px;
    left: 24px;
    background: var(--cpa-primary);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 11px;
    border-radius: 999px;
  }

  .pkg-blurb {
    font-size: 0.95rem;
    margin-bottom: 14px;
  }

  .price-from {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--cpa-muted);
  }

  .price-amount {
    display: flex;
    align-items: baseline;
    gap: 5px;
    margin: 4px 0 18px;
    font-variant-numeric: tabular-nums;
  }

  .price-amount strong {
    font-family: Fraunces, Georgia, serif;
    font-weight: 700;
    font-size: 2.3rem;
    color: var(--cpa-primary);
    line-height: 1;
  }

  .price-amount .per {
    color: var(--cpa-muted);
    font-size: 0.95rem;
  }

  .price .btn-accent,
  .price .btn-outline {
    margin-top: auto;
  }

  .alacarte {
    margin-top: 32px;
    padding: 24px;
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: var(--cpa-radius);
  }

  .alacarte h3 {
    font-size: 1.1rem;
  }

  .alacarte ul {
    display: grid;
    gap: 12px;
  }

  .alacarte li {
    display: grid;
    gap: 2px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--cpa-line-soft);
  }

  .alacarte li:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .alacarte strong {
    font-family: Fraunces, Georgia, serif;
    font-weight: 600;
    color: var(--cpa-primary);
  }

  .alacarte span {
    color: var(--cpa-muted);
    font-size: 0.94rem;
  }

  .price-note {
    margin: 24px 0 0;
    font-size: 0.9rem;
    color: var(--cpa-muted);
    max-width: 74ch;
  }

  /* ---- team ---- */
  .owner {
    display: grid;
    gap: 26px;
    align-items: start;
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: var(--cpa-radius);
    padding: 26px;
  }

  .owner h3 {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  .owner-role {
    color: var(--cpa-muted);
    font-weight: 500;
    margin-bottom: 16px;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 18px;
  }

  .badges li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 11px;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--cpa-primary);
    background: var(--cpa-bg-alt);
    border: 1px solid var(--cpa-line);
    border-radius: 999px;
  }

  .team-grid {
    margin-top: 20px;
  }

  .team-card h4 {
    margin-bottom: 2px;
    font-family: Fraunces, Georgia, serif;
    color: var(--cpa-primary);
  }

  .team-title {
    font-size: 0.9rem;
    color: var(--cpa-muted);
    margin-bottom: 10px;
  }

  .team-card .badges {
    margin-bottom: 0;
  }

  /* ---- proof ---- */
  .rating-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    align-items: center;
    padding: 18px 20px;
    margin-bottom: 26px;
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: var(--cpa-radius);
  }

  .rating-score {
    font-family: Fraunces, Georgia, serif;
    font-weight: 700;
    font-size: 1.6rem;
    color: var(--cpa-primary);
    font-variant-numeric: tabular-nums;
  }

  .rating-cta {
    margin-left: auto;
  }

  .quote {
    display: flex;
    flex-direction: column;
    margin: 0;
  }

  .quote-tag {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--cpa-accent-dark);
    margin-bottom: 8px;
  }

  .quote cite {
    margin-top: auto;
    font-style: normal;
    font-size: 0.9rem;
    color: var(--cpa-muted);
  }

  .quote cite b {
    display: block;
    color: var(--cpa-ink);
    font-size: 0.95rem;
  }

  .sample {
    display: inline-block;
    align-self: flex-start;
    margin-bottom: 12px;
    padding: 3px 9px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #7a4535;
    background: #f3e6d8;
    border-radius: 999px;
  }

  .sample-dark {
    color: var(--cpa-primary);
    background: #cfe3d5;
  }

  .case-grid {
    margin-top: 20px;
  }

  .case {
    display: flex;
    flex-direction: column;
    background: var(--cpa-primary);
    border-color: var(--cpa-primary);
  }

  .case h3 {
    color: #fff;
    font-size: 1.14rem;
  }

  .case p {
    color: #cfddd4;
    margin-bottom: 0;
  }

  /* ---- deadlines ---- */
  .deadlines {
    display: grid;
    gap: 20px;
    align-items: start;
  }

  .deadline-list {
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: var(--cpa-radius);
  }

  .deadline-list li {
    display: grid;
    gap: 2px 16px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--cpa-line-soft);
  }

  .deadline-list li:last-child {
    border-bottom: 0;
  }

  .deadline-date {
    font-weight: 700;
    color: var(--cpa-primary);
    font-size: 0.95rem;
    font-variant-numeric: tabular-nums;
  }

  .deadline-what {
    color: var(--cpa-ink);
    font-size: 0.96rem;
  }

  .deadline-who {
    display: block;
    color: var(--cpa-muted);
    font-size: 0.86rem;
  }

  .deadline-note {
    margin: 16px 0 0;
    font-size: 0.85rem;
    color: var(--cpa-muted);
  }

  .deadline-note a {
    text-decoration: underline;
  }

  .reminder {
    background: var(--cpa-bg-alt);
    border: 1px solid var(--cpa-line);
    border-radius: var(--cpa-radius);
    padding: 24px;
  }

  .reminder p {
    color: var(--cpa-muted);
  }

  /* ---- security & software ---- */
  .security {
    display: grid;
    gap: 24px;
    align-items: start;
  }

  .security h2 {
    font-size: clamp(1.4rem, 2.4vw, 1.9rem);
  }

  .software-head {
    font-family: Inter, system-ui, sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #fff;
  }

  .software {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .software li {
    padding: 8px 14px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 8px;
  }

  .software-note {
    margin: 16px 0 0;
    font-size: 0.9rem;
    color: #bacfc0;
  }

  /* ---- faq ---- */
  .faqs details {
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: var(--cpa-radius);
    margin-bottom: 12px;
  }

  .faqs summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
    min-height: 44px;
    font-family: Fraunces, Georgia, serif;
    font-weight: 600;
    font-size: 1.04rem;
    color: var(--cpa-primary);
    list-style: none;
  }

  .faqs summary::-webkit-details-marker {
    display: none;
  }

  .faqs summary::after {
    content: '';
    flex: none;
    width: 11px;
    height: 11px;
    border-right: 2px solid var(--cpa-muted);
    border-bottom: 2px solid var(--cpa-muted);
    transform: rotate(45deg);
  }

  .faqs details[open] summary::after {
    transform: rotate(-135deg);
  }

  .faq-body {
    padding: 0 20px 20px;
  }

  .faq-body p {
    margin: 0;
    color: var(--cpa-muted);
  }

  /* ---- consultation ---- */
  .consult {
    display: grid;
    gap: clamp(28px, 4vw, 48px);
    align-items: start;
  }

  .booking {
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: var(--cpa-radius);
    padding: 24px;
    margin-bottom: 20px;
  }

  .booking-phone {
    display: inline-block;
    font-family: Fraunces, Georgia, serif;
    font-weight: 700;
    font-size: 1.8rem;
    color: var(--cpa-primary);
    font-variant-numeric: tabular-nums;
  }

  .booking-phone:hover {
    color: var(--cpa-accent-dark);
  }

  .booking-hours {
    margin: 4px 0 0;
    color: var(--cpa-muted);
    font-size: 0.92rem;
  }

  .booking .checks {
    margin: 18px 0 0;
  }

  .contact-lines {
    display: grid;
    gap: 14px;
  }

  .contact-lines li {
    display: flex;
    gap: 11px;
    align-items: flex-start;
  }

  .contact-lines svg {
    flex: none;
    margin-top: 4px;
    color: var(--cpa-primary);
  }

  .contact-lines a {
    font-weight: 600;
  }

  .muted-line {
    display: block;
    font-size: 0.85rem;
    color: var(--cpa-muted);
    font-weight: 400;
  }

  .consult-form {
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: var(--cpa-radius);
    padding: clamp(20px, 3vw, 28px);
  }

  .form-note {
    font-size: 0.85rem;
    color: var(--cpa-muted);
    background: var(--cpa-bg-alt);
    border-left: 3px solid var(--cpa-primary);
    padding: 12px 16px;
    border-radius: 8px;
  }

  .form-note a {
    text-decoration: underline;
  }

  .field {
    display: grid;
    gap: 5px;
    margin-bottom: 16px;
  }

  .field-grid {
    display: grid;
    gap: 16px;
  }

  .cpa-root label,
  .cpa-root legend {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .opt {
    font-weight: 400;
    color: var(--cpa-muted);
    font-size: 0.82rem;
  }

  .cpa-root input[type='text'],
  .cpa-root input[type='email'],
  .cpa-root input[type='tel'],
  .cpa-root select,
  .cpa-root textarea {
    width: 100%;
    min-height: 48px;
    padding: 11px 13px;
    font: inherit;
    font-size: 1rem;
    color: var(--cpa-ink);
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: 8px;
  }

  .cpa-root textarea {
    min-height: 110px;
    resize: vertical;
  }

  .cpa-root [aria-invalid='true'] {
    border-color: var(--cpa-danger);
    border-width: 2px;
  }

  .field-err {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--cpa-danger);
  }

  .needs {
    border: 1px solid var(--cpa-line);
    border-radius: 8px;
    padding: 14px 16px 16px;
    margin: 0 0 16px;
  }

  .needs-grid {
    display: grid;
    gap: 4px;
    margin-top: 6px;
  }

  .needs-grid label {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 44px;
    font-weight: 400;
    font-size: 0.95rem;
  }

  .needs-grid input {
    width: 20px;
    height: 20px;
    accent-color: var(--cpa-primary);
  }

  .form-status {
    margin: 12px 0 0;
    font-size: 0.85rem;
    color: var(--cpa-muted);
  }

  .form-status.is-error {
    color: var(--cpa-danger);
    font-weight: 600;
  }

  .thanks {
    text-align: center;
    padding: 12px 0;
  }

  .thanks-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 999px;
    background: #e4f2e8;
    color: var(--cpa-success);
    margin-bottom: 14px;
  }

  .thanks-head {
    font-family: Fraunces, Georgia, serif;
    font-weight: 600;
    font-size: 1.3rem;
    color: var(--cpa-primary);
    margin-bottom: 6px;
  }

  .thanks-body {
    color: var(--cpa-muted);
  }

  .thanks-again {
    margin: 14px 0 0;
  }

  .thanks-again button {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: 0.9rem;
    color: var(--cpa-muted);
    text-decoration: underline;
  }

  /* ---- footer ---- */
  .footer {
    background: var(--cpa-dark);
    color: #c7d4ca;
    font-size: 0.94rem;
    padding: clamp(40px, 6vw, 64px) 0 24px;
  }

  .footer h3 {
    color: #fff;
    font-family: Inter, system-ui, sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .footer-grid {
    display: grid;
    gap: 32px;
  }

  .brand-footer {
    margin-bottom: 14px;
  }

  .brand-footer .brand-name {
    color: #fff;
  }

  .brand-footer .brand-tail {
    color: #d9a45b;
  }

  .brand-footer .brand-sub {
    color: #9db3a4;
  }

  .footer-blurb,
  .footer-hours {
    color: #aec0b3;
  }

  .footer address {
    margin-bottom: 12px;
    color: #c7d4ca;
  }

  .footer-contact a {
    color: #dce6de;
  }

  .footer-contact a:hover {
    color: #fff;
    text-decoration: underline;
  }

  .footer-hours {
    font-size: 0.85rem;
  }

  .footer-list {
    display: grid;
    gap: 9px;
  }

  .footer-list a {
    color: #dce6de;
  }

  .footer-list a:hover {
    color: #fff;
    text-decoration: underline;
  }

  .footer-bottom {
    margin-top: 36px;
    padding-top: 22px;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
    display: grid;
    gap: 10px;
    font-size: 0.85rem;
    color: #a9bbae;
  }

  .footer-bottom p {
    margin: 0;
  }

  .disclaimer {
    color: #9db3a4;
    max-width: 80ch;
  }

  /* ---- mobile sticky bar ---- */
  .mobile-bar {
    position: fixed;
    inset: auto 0 0 0;
    z-index: 110;
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 10px;
    padding: 11px 14px calc(11px + env(safe-area-inset-bottom));
    background: var(--cpa-bg);
    border-top: 1px solid var(--cpa-line);
    box-shadow: 0 -2px 14px rgba(15, 36, 27, 0.1);
  }

  .mobile-bar .btn-accent,
  .mobile-bar .btn-outline {
    min-height: 48px;
    font-size: 0.95rem;
    padding: 10px 8px;
  }

  /* The bar covers the end of the page without this. */
  .footer {
    padding-bottom: 96px;
  }

  @media (min-width: 640px) {
    .cards-2,
    .compare,
    .field-grid,
    .needs-grid {
      grid-template-columns: 1fr 1fr;
    }

    .steps {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (min-width: 560px) {
    .deadline-list li {
      grid-template-columns: 9.5rem 1fr;
      align-items: baseline;
    }
  }

  @media (min-width: 900px) {
    .nav,
    .header-phone {
      display: flex;
    }

    .burger {
      display: none;
    }

    .mobile-bar {
      display: none;
    }

    .footer {
      padding-bottom: 24px;
    }

    .hero-inner {
      grid-template-columns: 1.08fr 0.92fr;
    }

    .cards-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .steps {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .deadlines {
      grid-template-columns: 1.6fr 1fr;
    }

    .security {
      grid-template-columns: 1.3fr 1fr;
    }

    .consult {
      grid-template-columns: 1fr 1fr;
    }

    .owner {
      grid-template-columns: 300px 1fr;
    }

    .footer-grid {
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
    }
  }

  /* ---- flair: calculator keys, spreadsheet card, skyline edges, trend-line trace ---- */
  .sheet {
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: 14px;
    box-shadow: 0 24px 50px rgba(15, 36, 27, 0.16);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .sheet-formula {
    display: flex;
    align-items: center;
    background: #f3f5f0;
    border-bottom: 1px solid var(--cpa-line);
    font-family: ui-monospace, 'SFMono-Regular', Consolas, monospace;
    font-size: 0.82rem;
  }

  .sheet-fx {
    padding: 8px 12px;
    border-right: 1px solid var(--cpa-line);
    font-style: italic;
    font-weight: 700;
    color: var(--cpa-primary);
  }

  .sheet-expr {
    padding: 8px 12px;
    color: var(--cpa-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .calc-keys {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 16px 16px 12px;
  }

  .calc-key {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 6px 12px;
    border-radius: 9px;
    border: 1.5px solid var(--cpa-line);
    border-bottom-width: 4px;
    background: #fff;
    color: var(--cpa-ink);
    font: 600 0.85rem Inter, system-ui, sans-serif;
    box-sizing: border-box;
    transition: transform 0.08s;
  }

  .calc-key:active {
    transform: translateY(2px);
    border-bottom-width: 2px;
  }

  .calc-key.on {
    background: var(--cpa-primary);
    border-color: var(--cpa-primary-dark);
    color: #fff;
  }

  .calc-ref {
    font-family: ui-monospace, Consolas, monospace;
    font-size: 0.7rem;
    padding: 2px 5px;
    border-radius: 4px;
    background: var(--cpa-bg-alt);
    color: var(--cpa-primary);
  }

  .calc-key.on .calc-ref {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }

  .sheet-grid {
    margin: 0 16px;
    border: 1px solid var(--cpa-line);
    border-radius: 8px;
    overflow: hidden;
  }

  .sheet-title {
    margin: 0;
    padding: 8px 12px;
    background: #f3f5f0;
    border-bottom: 1px solid var(--cpa-line);
    font-family: Fraunces, Georgia, serif;
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--cpa-primary);
  }

  .sheet-row {
    display: flex;
    align-items: flex-start;
    font-size: 0.92rem;
    line-height: 1.45;
    border-bottom: 1px solid var(--cpa-line-soft);
  }

  .sheet-row:last-child {
    border-bottom: 0;
  }

  .sheet-rownum {
    flex: none;
    width: 32px;
    align-self: stretch;
    background: #f3f5f0;
    border-right: 1px solid var(--cpa-line);
    text-align: center;
    padding-top: 9px;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 0.75rem;
    color: var(--cpa-muted);
  }

  .sheet-row > span:last-child {
    padding: 9px 12px;
  }

  .sheet-cta {
    margin: 14px 16px 0;
    text-align: center;
  }

  .sheet-note {
    margin: 0;
    padding: 10px 16px 14px;
    font-size: 0.78rem;
    color: var(--cpa-muted);
  }

  .fx-badge {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #fff;
    border: 1px solid var(--cpa-line);
    border-radius: 12px;
    padding: 9px 14px;
    box-shadow: 0 10px 26px rgba(15, 36, 27, 0.18);
    animation: cpa-float 6s ease-in-out infinite;
  }

  .fx-badge-live {
    left: -12px;
    top: 0;
    z-index: 2;
    animation-duration: 5s;
  }

  .fx-badge-sum {
    right: -12px;
    bottom: 0;
    animation-delay: 1s;
  }

  .fx-text {
    line-height: 1.3;
  }

  .fx-text strong {
    display: block;
    font-size: 0.88rem;
  }

  .fx-text span {
    font-size: 0.76rem;
    color: var(--cpa-muted);
  }

  .fx-cursor {
    width: 9px;
    height: 20px;
    background: var(--cpa-success);
    animation: cpa-blink 1.1s steps(2, start) infinite;
  }

  .fx-sigma {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: var(--cpa-bg-alt);
    color: var(--cpa-accent-dark);
    font: 700 1.2rem Fraunces, Georgia, serif;
  }

  .sheet-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 22px;
    border-bottom: 2px solid var(--cpa-primary);
  }

  .sheet-tab {
    min-height: 44px;
    padding: 6px 18px;
    border: 1px solid var(--cpa-line);
    border-bottom: 0;
    border-radius: 8px 8px 0 0;
    background: rgba(255, 255, 255, 0.6);
    color: var(--cpa-ink);
    font: 600 0.88rem Inter, system-ui, sans-serif;
  }

  .sheet-tab.on {
    background: var(--cpa-primary);
    border-color: var(--cpa-primary);
    color: #fff;
  }

  .edge {
    position: absolute;
    left: 0;
    top: -47px;
    width: 100%;
    height: 48px;
    display: block;
    pointer-events: none;
  }

  .edge-trace {
    fill: none;
    stroke: var(--cpa-accent);
    stroke-width: 2;
    stroke-opacity: 0.7;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  .header::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    pointer-events: none;
    background: linear-gradient(90deg, transparent, var(--cpa-accent), transparent) no-repeat;
    background-size: 30% 100%;
    animation: cpa-tape 4s linear infinite;
  }

  /* Trend line: a faint line chart that swerves across the page with data points, a calculator
     glyph on long stretches, and a selected spreadsheet cell where it dives behind content. It
     sits above section backgrounds but below content: direct children of each band are lifted
     above it, and the script ends the line before any block, so nothing crosses text. */
  .trace {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    pointer-events: none;
  }

  .cpa-root :is(.section, .hero, .footer) > :not(svg) {
    position: relative;
    z-index: 2;
  }

  .trace-line {
    fill: none;
    stroke: var(--cpa-accent);
    stroke-opacity: 0.55;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .trace-pulse {
    fill: none;
    stroke: var(--cpa-primary);
    stroke-opacity: 0.5;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 12 88;
    animation: cpa-trace 7s linear infinite;
  }

  .trace-point {
    fill: #fff;
    stroke: var(--cpa-accent);
    stroke-opacity: 0.75;
    stroke-width: 2.5;
  }

  .trace-node {
    fill: #fff;
    stroke: var(--cpa-accent);
    stroke-opacity: 0.75;
    stroke-width: 2;
  }

  .trace-glyph {
    font: 700 18px Fraunces, Georgia, serif;
    fill: var(--cpa-primary);
    fill-opacity: 0.85;
  }

  .trace-cell {
    fill: #fff;
    fill-opacity: 0.92;
    stroke: var(--cpa-primary);
    stroke-opacity: 0.8;
    stroke-width: 2;
  }

  .trace-label {
    font: 600 10px ui-monospace, Consolas, monospace;
    fill: var(--cpa-primary);
  }

  .trace-handle {
    fill: var(--cpa-primary);
    stroke: #fff;
    stroke-width: 1.5;
  }

  @keyframes cpa-trace {
    to {
      stroke-dashoffset: -100;
    }
  }

  @keyframes cpa-tape {
    from {
      background-position: -40% 0;
    }
    to {
      background-position: 140% 0;
    }
  }

  @keyframes cpa-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes cpa-blink {
    to {
      visibility: hidden;
    }
  }

  @media (max-width: 899px) {
    .trace {
      display: none;
    }
    .glyphs {
      width: 360px;
      height: 360px;
      right: -120px;
    }
    .fx-badge-live {
      left: 0;
    }
    .fx-badge-sum {
      right: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cpa-root :global(*) {
      transition-duration: 0.001ms !important;
      animation-duration: 0.001ms !important;
    }
  }
</style>
