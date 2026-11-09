<script lang="ts">
  // General contractor / custom builder template. Same prospect-site shape as the plumbing,
  // electrical and accounting templates: one page, a content object in, every verifiable fact
  // (licence, rating, named people, finished projects, reviews, prices) optional and absent for
  // a derived prospect. See derive.ts.
  //
  // What is new here is the client portal. The two boards below the services (schedule and
  // budget) run on clearly labelled sample projects from samples.ts, never on anything about the
  // firm, so they are safe to show on a prospect's prototype.

  import type { ContractorContent } from './types';
  import ScheduleBoard from './ScheduleBoard.svelte';
  import BudgetBoard from './BudgetBoard.svelte';
  import { portalSamples } from './samples';
  import { budgetSummary, dateAt, fmtDate, money, scheduleSummary, slipLabel } from './portal';

  let { content }: { content: ContractorContent } = $props();

  const icons = {
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    build:
      'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
    layers:
      'M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z',
    kitchen:
      'M18 2.01L6 2c-1.1 0-2 .89-2 2v16c0 1.11.9 2 2 2h12c1.1 0 2-.89 2-2V4c0-1.11-.9-1.99-2-1.99zM18 20H6v-9.02h12V20zm0-11H6V4h12v5zM8 5h2v3H8zm0 7h2v5H8z',
    heritage:
      'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z',
    doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    shield:
      'M12 1 3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4zm-2 16-4-4 1.4-1.4L10 14.2l6.6-6.6L18 9l-8 8z',
    star: 'M12 17.3 18.2 21l-1.6-7L22 9.2l-7.2-.6L12 2 9.2 8.6 2 9.2 7.5 14l-1.7 7z',
    calendar:
      'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z',
    chart: 'M4 20V4H2v18h20v-2H4zm4-2h2V9H8v9zm4 0h2V5h-2v13zm4 0h2v-6h-2v6z',
    check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z',
    phone:
      'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z',
    mail: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
    pin: 'M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
    arrow: 'M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4z',
    burger: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    close:
      'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z'
  };

  // ── Sample project shown in both portal sections ────────────────────────────
  let sampleId = $state(portalSamples[0].id);
  const sample = $derived(portalSamples.find((p) => p.id === sampleId) ?? portalSamples[0]);
  const sched = $derived(scheduleSummary(sample));
  const budget = $derived(budgetSummary(sample));
  const asOfLabel = $derived(fmtDate(dateAt(sample.start, sample.asOf), true));
  const budgetWord = $derived(
    budget.state === 'on' ? 'On budget' : `${money(budget.variance)} ${budget.state}`
  );
  const scheduleWord = $derived(
    sched.state === 'on' ? 'On plan' : `${slipLabel(Math.abs(sched.slipDays))} ${sched.state === 'behind' ? 'behind' : 'ahead'}`
  );

  // ── Static copy ─────────────────────────────────────────────────────────────
  const services = [
    {
      title: 'Custom new homes',
      desc: 'From survey and permits to occupancy, built to your architect’s plans or ours.',
      icon: icons.home
    },
    {
      title: 'Whole-home renovations',
      desc: 'Open up, rebuild and rewire the house you already own, without leaving the neighbourhood.',
      icon: icons.build
    },
    {
      title: 'Additions & second storeys',
      desc: 'More space that looks like it was always part of the house.',
      icon: icons.layers
    },
    {
      title: 'Kitchens, baths & interiors',
      desc: 'Full-scope interior builds with millwork, stone and tile finished to a high standard.',
      icon: icons.kitchen
    },
    {
      title: 'Heritage & character homes',
      desc: 'Keep the original detail while bringing structure, insulation and systems up to date.',
      icon: icons.heritage
    },
    {
      title: 'Design-build & preconstruction',
      desc: 'Feasibility, an early budget and a permit plan before you commit to a contract.',
      icon: icons.doc
    }
  ];

  const trust = $derived([
    { title: 'Licensed & Insured', sub: content.licenceShort ?? 'Fully insured', icon: icons.shield },
    {
      title: 'Client portal',
      sub: 'Live schedule & budget',
      icon: icons.chart
    },
    ...(content.socialProof
      ? [
          {
            title: `${content.socialProof.ratingValue}★ on Google`,
            sub: `${content.socialProof.ratingCount} reviews`,
            icon: icons.star
          },
          {
            title: `${content.socialProof.yearsBadge} years building`,
            sub: `${content.socialProof.homesBuilt} homes`,
            icon: icons.home
          }
        ]
      : []),
    {
      title: 'Written warranty',
      sub: content.warrantyLine ?? 'On every build',
      icon: icons.check
    }
  ]);

  const scheduleFeatures = [
    {
      t: 'One dated baseline',
      b: 'The schedule you sign is kept beside the live forecast, so a slip is visible, never buried.'
    },
    {
      t: 'The reason, in plain words',
      b: 'Every change to a date carries a note from site: weather, a lead time, a hidden condition.'
    },
    {
      t: 'Inspections & milestones',
      b: 'See each inspection, sign-off and delivery before it happens, with the date we expect it.'
    }
  ];

  const budgetFeatures = [
    {
      t: 'Line by line',
      b: 'Every trade has a budget, what has been paid and what we now expect it to cost.'
    },
    {
      t: 'Change orders you approve',
      b: 'Each one is priced and dated before work starts. Nothing joins your budget without your sign-off.'
    },
    {
      t: 'Allowances, as you choose',
      b: 'See what each selection does to the budget the day you make it, not on the final invoice.'
    }
  ];

  const steps = [
    {
      n: 1,
      title: 'Conversation & site visit',
      body: 'We walk the property, listen to your brief and tell you plainly what is realistic.'
    },
    {
      n: 2,
      title: 'Feasibility & budget',
      body: 'An early budget range and a schedule outline, before you spend on design.'
    },
    {
      n: 3,
      title: 'Design & selections',
      body: 'Drawings, engineering and selections, each choice priced against your allowances.'
    },
    {
      n: 4,
      title: 'Contract & permits',
      body: 'A written contract, a dated baseline and a line-by-line budget. Your portal opens the day you sign.'
    },
    {
      n: 5,
      title: 'Build',
      body: 'Weekly updates, inspections on the schedule and change orders priced before work starts.'
    },
    {
      n: 6,
      title: 'Handover & warranty',
      body: 'A deficiency walk-through, as-built documents and a written warranty.'
    }
  ];

  const contracts = [
    {
      t: 'Fixed price',
      best: 'Best when the plans are complete',
      b: 'You agree a total for a defined scope. Anything outside it is a change order, priced and approved before work begins.'
    },
    {
      t: 'Cost-plus with a cap',
      best: 'Best for renovations',
      b: 'You pay actual costs plus a fixed fee, never above a guaranteed maximum. It suits houses where what is behind the walls is not yet known.'
    }
  ];

  const insuranceSentence = $derived(
    content.insuranceClaim ? ` and ${content.insuranceClaim}` : '.'
  );

  const faqs = $derived([
    {
      q: 'Are you licensed and insured?',
      a: `Yes. ${content.companyName} ${content.licenceFaqClause}${insuranceSentence} Every subcontractor on site is vetted and insured.`
    },
    {
      q: 'What can I see in the client portal?',
      a: 'Your live schedule against the baseline you signed, your line-by-line budget, change orders waiting for your approval, your selections and allowances, and the weekly update from site. It opens the day the contract is signed and works on your phone.'
    },
    {
      q: 'How do change orders work?',
      a: 'When something changes, whether you ask for it or the house surprises us, we price it and date it before any work starts. It shows up in your portal, and nothing moves your budget until you approve it.'
    },
    {
      q: 'Fixed price or cost-plus?',
      a: 'Fixed price suits a build with complete plans. Cost-plus with a guaranteed maximum suits a renovation where we cannot see everything yet. Either way you see the same budget lines in the portal.'
    },
    {
      q: 'How long will my project take?',
      a: 'It depends on size, site and permitting, and a custom home takes well over a year from first sketch to move-in. You see a dated schedule with milestones before you sign, and every change to it is explained.'
    },
    {
      q: 'Can we live in the house during a renovation?',
      a: 'Sometimes, for a kitchen or a phased addition. A whole-home renovation usually means moving out. We tell you honestly at the feasibility stage, before you plan around it.'
    },
    {
      q: 'What does your warranty cover?',
      a: content.warrantyLine
        ? `${content.warrantyLine}, in writing, and handed over with your as-built documents.`
        : 'You receive a written warranty at handover, together with your as-built documents. We walk through exactly what it covers before you sign the contract.'
    },
    {
      q: 'What areas do you serve?',
      a: content.faqAreasAnswer
    }
  ]);

  // ── Hero: what are you planning? ────────────────────────────────────────────
  // Each project type re-words the hero and the first-meeting checklist, and pre-fills the
  // consultation form. null = nothing picked, so the prospect's own headline shows.
  const projectTypes = [
    'New custom home',
    'Whole-home renovation',
    'Addition or second storey',
    'Heritage restoration',
    'Not sure yet'
  ];
  const budgetRanges = ['Under $500K', '$500K – $1M', '$1M – $2M', '$2M +', 'Not sure yet'];
  const startWindows = ['Within 6 months', 'Within a year', 'More than a year away'];

  const situations = $derived([
    {
      label: 'New custom home',
      kind: 'New custom home',
      h1: `Building a custom home in ${content.city}? Watch every week of it.`,
      lead: 'From the first inspection to the keys, your schedule and budget are open to you around the clock.',
      tipsTitle: 'Bring to a first meeting',
      tips: [
        'The survey or lot details, if you have them.',
        'Photos of homes you love, and what you like about them.',
        'A rough budget range and when you hope to move in.'
      ]
    },
    {
      label: 'Whole-home renovation',
      kind: 'Whole-home renovation',
      h1: `Renovating your ${content.city} home? Stay in control of time and cost.`,
      lead: 'Major renovations hide surprises. We show you the cost of each one the day we find it.',
      tipsTitle: 'Bring to a first meeting',
      tips: [
        'The age of the house and any past work you know of.',
        'Your must-haves, and what you would trade away.',
        'Whether you plan to stay in the house or move out.'
      ]
    },
    {
      label: 'Addition or second storey',
      kind: 'Addition or second storey',
      h1: `Adding space to your ${content.city} home? Plan it before you build it.`,
      lead: 'We check structure, permits and cost first, so you know what an addition really takes.',
      tipsTitle: 'Bring to a first meeting',
      tips: [
        'The size or rooms you want to add.',
        'Any drawings, or a sketch on the back of an envelope.',
        'Photos of the area where the addition would go.'
      ]
    },
    {
      label: 'Heritage restoration',
      kind: 'Heritage restoration',
      h1: `Restoring a character home in ${content.city}? Keep what matters.`,
      lead: 'Original trim, new structure. We plan the details worth saving before anything comes apart.',
      tipsTitle: 'Bring to a first meeting',
      tips: [
        'Any heritage designation or covenant on the house.',
        'Photos of details you want kept, inside and out.',
        'Past inspection or renovation records, if you have them.'
      ]
    }
  ]);

  let sit = $state<number | null>(null);
  const current = $derived(sit === null ? null : situations[sit]);
  const heroTitle = $derived(current ? current.h1 : content.heroHeadline);
  const heroLead = $derived(current ? current.lead : content.heroLead);
  const tipsTitle = $derived(current ? current.tipsTitle : 'Not sure where to start?');
  const tips = $derived(
    current
      ? current.tips
      : [
          'Pick what fits above and we’ll tailor what to bring.',
          'Or just call. A builder picks up, not a call centre.',
          'The first conversation is free and has no sales script.'
        ]
  );

  // ── Header & form ───────────────────────────────────────────────────────────
  let scrollY = $state(0);
  let menuOpen = $state(false);
  const scrolled = $derived(scrollY > 8);

  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    type: '',
    budget: '',
    start: '',
    place: '',
    details: ''
  };
  type Errors = { name?: boolean; email?: boolean; phone?: boolean; type?: boolean };

  let form = $state({ ...emptyForm });
  let errs = $state<Errors>({});
  let tried = $state(false);
  let submitted = $state(false);

  const firstName = $derived(form.name.trim().split(' ')[0]);
  const hasErrors = $derived(Object.values(errs).some(Boolean));
  const formStatus = $derived(
    tried && hasErrors
      ? 'Please fix the highlighted fields.'
      : 'Free first conversation · No sales script'
  );

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validate(f: typeof emptyForm): Errors {
    const digits = f.phone.replace(/\D/g, '').length;
    return {
      name: !f.name.trim(),
      email: !EMAIL.test(f.email.trim()),
      // Optional, but a number typed in has to be dialable.
      phone: f.phone.trim() !== '' && digits < 10,
      type: !f.type
    };
  }

  function pick(i: number) {
    sit = i;
    form.type = situations[i].kind;
    if (tried) errs = validate(form);
  }

  // Revalidate on input, not on blur: clearing an error on blur shifts the submit button
  // between mouse-down and mouse-up, so the click misses it.
  function revalidate() {
    if (tried) errs = validate(form);
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
    form = { ...emptyForm };
  }
</script>

<svelte:head>
  <title>{content.title}</title>
  <meta name="description" content={content.metaDescription} />
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<svelte:window bind:scrollY />

{#snippet icon(path: string)}
  <svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d={path} /></svg>
{/snippet}

{#snippet sampleTabs()}
  <div class="frame-tabs" role="group" aria-label="Choose a sample project">
    {#each portalSamples as p (p.id)}
      <button
        class="tab"
        aria-pressed={p.id === sampleId}
        onclick={() => (sampleId = p.id)}
      >
        {p.label}
      </button>
    {/each}
    <span class="frame-facts">{sample.facts.join(' · ')}</span>
  </div>
{/snippet}

<div class="gc-root">
  <a href="#main" class="skip">Skip to content</a>

  <div class="utility">
    <div class="utility-inner">
      <span>{content.licenceLine}</span>
      <span class="utility-wide">{content.servingLine}</span>
      <span class="utility-wide">By appointment · Free first conversation</span>
    </div>
  </div>

  <header class="header" class:scrolled>
    <div class="container header-inner">
      <a class="brand" href="#top" aria-label="{content.companyName}, home">
        <span class="brand-mark" aria-hidden="true">{content.brandLead.charAt(0)}</span>
        <span class="brand-text">
          <span class="brand-name">
            {content.brandLead}{#if content.brandTail}{' '}<span class="brand-tail">{content.brandTail}</span>{/if}
          </span>
          <span class="brand-sub">{content.brandSub}</span>
        </span>
      </a>

      <nav class="nav" class:open={menuOpen} aria-label="Main">
        <a href="#services" onclick={() => (menuOpen = false)}>Services</a>
        <a href="#schedule" onclick={() => (menuOpen = false)}>Your schedule</a>
        <a href="#budget" onclick={() => (menuOpen = false)}>Your budget</a>
        <a href="#process" onclick={() => (menuOpen = false)}>Process</a>
        {#if content.projects.length > 0}
          <a href="#work" onclick={() => (menuOpen = false)}>Our work</a>
        {/if}
        <a href="#faq" onclick={() => (menuOpen = false)}>FAQ</a>
        <a class="nav-phone" href={content.phoneHref}>
          {@render icon(icons.phone)}{content.phoneDisplay}
        </a>
        <a class="btn btn-primary" href="#consult" onclick={() => (menuOpen = false)}>
          Book a consultation
        </a>
      </nav>

      <button
        class="menu-btn"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onclick={() => (menuOpen = !menuOpen)}
      >
        {@render icon(menuOpen ? icons.close : icons.burger)}
      </button>
    </div>
  </header>

  <main id="main">
    <!-- HERO -->
    <section id="top" class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <p class="eyebrow">{content.eyebrow}</p>
          <h1>{heroTitle}</h1>
          <p class="lead">{heroLead}</p>

          <div class="picker" role="group" aria-label="What are you planning?">
            <span class="picker-label">What are you planning?</span>
            <div class="picker-chips">
              {#each situations as s, i (s.label)}
                <button class="pick" aria-pressed={sit === i} onclick={() => pick(i)}>
                  {s.label}
                </button>
              {/each}
            </div>
          </div>

          <div class="cta-row">
            <a class="btn btn-primary btn-lg" href="#consult">Book a consultation</a>
            <a class="btn btn-ghost btn-lg" href="#schedule">See the client portal</a>
          </div>

          <div class="tips" aria-live="polite">
            <p class="tips-title">{tipsTitle}</p>
            <ul>
              {#each tips as tip (tip)}
                <li>{@render icon(icons.check)}{tip}</li>
              {/each}
            </ul>
          </div>
        </div>

        <aside class="preview" aria-label="Client portal preview">
          <div class="preview-bar">
            <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="preview-title">Client portal</span>
            <span class="tag">Sample project</span>
          </div>
          <p class="preview-name">{sample.label}</p>
          <div class="preview-row">
            <div class="pv-head">
              {@render icon(icons.calendar)}<span>Schedule</span>
              <span class="pv-chip {sched.state === 'behind' ? 'over' : sched.state === 'ahead' ? 'under' : 'on'}">
                <span aria-hidden="true">{sched.state === 'behind' ? '▲' : sched.state === 'ahead' ? '▼' : '●'}</span>{scheduleWord}
              </span>
            </div>
            <p class="pv-big">{sched.percent}%<span>complete</span></p>
            <span class="pv-meter" role="img" aria-label="{sched.percent} percent complete">
              <span style="width:{sched.percent}%"></span>
            </span>
            <p class="pv-sub">
              Week {sched.week} of {sched.totalWeeks} · finish {fmtDate(sched.forecastFinish, true)}
            </p>
          </div>
          <div class="preview-row">
            <div class="pv-head">
              {@render icon(icons.chart)}<span>Budget</span>
              <span class="pv-chip {budget.state}">
                <span aria-hidden="true">{budget.state === 'under' ? '▼' : budget.state === 'over' ? '▲' : '●'}</span>
                {budget.state === 'on' ? 'On budget' : budget.state === 'under' ? 'Under' : 'Over'}
              </span>
            </div>
            <p class="pv-big">{budgetWord}</p>
            <p class="pv-sub">
              {money(budget.spent)} paid of {money(budget.budget)} approved
            </p>
          </div>
          <a class="preview-link" href="#schedule">
            Explore the portal {@render icon(icons.arrow)}
          </a>
          <p class="preview-foot">Illustrative figures from a sample project, as of {asOfLabel}.</p>
        </aside>
      </div>

      <svg class="skyline" aria-hidden="true" viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice">
        <g class="sk">
          <path pathLength="1" d="M0 200 H1200" />
          <path pathLength="1" d="M80 200 V110 L240 40 L400 110 V200 M310 78 V40 H340 V98 M220 200 V150 H260 V200 M110 130 h50 v40 h-50z M320 130 h50 v40 h-50z M226 92 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0" />
          <path pathLength="1" d="M470 200 V120 H800 V200 M450 120 H820 V108 H450 Z M540 108 V60 H730 V108 M495 138 h100 v62 h-100z M620 138 h150 v62 h-150z M695 138 V200 M570 72 h140 v36 h-140z M640 72 V108" />
          <path pathLength="1" d="M870 200 V120 L990 60 L1110 120 V200 M858 150 H1122 M890 150 V200 M1090 150 V200 M965 200 V160 H1015 V200 M905 120 h40 v22 h-40z M1035 120 h40 v22 h-40z M1050 78 V56 H1074 V90" />
        </g>
      </svg>
    </section>

    <!-- TRUST -->
    <section class="trust" aria-label="Why homeowners trust us">
      <div class="container trust-inner">
        {#each trust as t (t.title)}
          <div class="trust-item">
            <span class="trust-ico">{@render icon(t.icon)}</span>
            <span>
              <strong>{t.title}</strong>
              <small>{t.sub}</small>
            </span>
          </div>
        {/each}
      </div>
    </section>

    <!-- SERVICES -->
    <section id="services" class="section">
      <div class="container">
        <div class="gc-head">
          <p class="eyebrow">What we build</p>
          <h2>One builder for the whole house</h2>
          <p class="sec-lead">
            Single-family homes only, so every project gets a superintendent who is on your site, not
            juggling five.
          </p>
        </div>
        <div class="service-grid">
          {#each services as s (s.title)}
            <a class="service-card" href="#consult">
              <span class="svc-ico">{@render icon(s.icon)}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span class="svc-link">Discuss this project {@render icon(icons.arrow)}</span>
            </a>
          {/each}
        </div>
      </div>
    </section>

    <!-- SCHEDULE -->
    <section id="schedule" class="section section-alt" aria-labelledby="sched-head">
      <div class="container">
        <div class="gc-head">
          <p class="eyebrow">Client portal · Schedule</p>
          <h2 id="sched-head">See your build’s schedule as it really is</h2>
          <p class="sec-lead">
            Every client gets a private portal from the day the contract is signed. The schedule
            below is a sample project. Click a phase to see what is happening on site.
          </p>
        </div>

        <ul class="features">
          {#each scheduleFeatures as f (f.t)}
            <li><strong>{f.t}</strong><span>{f.b}</span></li>
          {/each}
        </ul>

        <div class="frame">
          <div class="frame-bar">
            <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="frame-title">Client portal · Schedule</span>
            <span class="tag">Sample project · illustrative · as of {asOfLabel}</span>
          </div>
          {@render sampleTabs()}
          <div class="frame-body">
            {#key sample.id}<ScheduleBoard project={sample} />{/key}
          </div>
        </div>
      </div>
    </section>

    <!-- BUDGET -->
    <section id="budget" class="section" aria-labelledby="budget-head">
      <div class="container">
        <div class="gc-head">
          <p class="eyebrow">Client portal · Budget</p>
          <h2 id="budget-head">Know whether you’re under or over budget, any day of the week</h2>
          <p class="sec-lead">
            Your budget updates as invoices arrive and as costs are re-forecast. Try approving the
            pending change order in the sample to watch the budget move.
          </p>
        </div>

        <ul class="features">
          {#each budgetFeatures as f (f.t)}
            <li><strong>{f.t}</strong><span>{f.b}</span></li>
          {/each}
        </ul>

        <div class="frame">
          <div class="frame-bar">
            <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="frame-title">Client portal · Budget</span>
            <span class="tag">Sample project · illustrative · as of {asOfLabel}</span>
          </div>
          {@render sampleTabs()}
          <div class="frame-body">
            {#key sample.id}<BudgetBoard project={sample} />{/key}
          </div>
        </div>
      </div>
    </section>

    <!-- PROCESS -->
    <section id="process" class="section section-alt">
      <div class="container">
        <div class="gc-head">
          <p class="eyebrow">How it works</p>
          <h2>Six steps, no surprises you hear about last</h2>
        </div>
        <ol class="steps">
          {#each steps as s (s.n)}
            <li>
              <span class="step-n" aria-hidden="true">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          {/each}
        </ol>
      </div>
    </section>

    <!-- CONTRACT -->
    <section id="pricing" class="section">
      <div class="container">
        <div class="gc-head">
          <p class="eyebrow">How we price</p>
          <h2>Two ways to contract, both fully visible</h2>
          <p class="sec-lead">
            Whichever suits your house, your budget board shows the same lines, the same change
            orders and the same forecast.
          </p>
        </div>
        <div class="contract-grid">
          {#each contracts as c (c.t)}
            <article class="contract">
              <p class="best">{c.best}</p>
              <h3>{c.t}</h3>
              <p>{c.b}</p>
            </article>
          {/each}
        </div>
        {#if content.investment}
          <ul class="invest" aria-label="Typical investment">
            <li>{content.investment.newBuild}</li>
            <li>{content.investment.renovation}</li>
          </ul>
        {/if}
      </div>
    </section>

    <!-- WORK -->
    {#if content.projects.length > 0}
      <section id="work" class="section section-alt" aria-labelledby="work-head">
        <div class="container">
          <div class="gc-head">
            <p class="eyebrow">Recent work</p>
            <h2 id="work-head">Homes we have built and restored</h2>
          </div>
          <div class="work-grid">
            {#each content.projects as p (p.name)}
              <article class="work">
                <div class="work-photo" role="img" aria-label={p.caption}>
                  <span>{p.caption}</span>
                </div>
                <div class="work-body">
                  <p class="work-kind">{p.kind} · {p.place}</p>
                  <h3>{p.name}</h3>
                  <p>{p.blurb}</p>
                  <p class="work-meta">{p.size} · {p.duration}</p>
                </div>
              </article>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    <!-- PRINCIPAL -->
    {#if content.principal}
      <section id="team" class="section" aria-labelledby="team-head">
        <div class="container principal">
          <div class="principal-mark" aria-hidden="true">{content.principal.name.charAt(0)}</div>
          <div>
            <p class="eyebrow">Who builds your home</p>
            <h2 id="team-head">{content.principal.name}</h2>
            <p class="principal-role">{content.principal.role}</p>
            <p class="principal-bio">{content.principal.bio}</p>
          </div>
        </div>
      </section>
    {/if}

    <!-- REVIEWS -->
    {#if content.testimonials.length > 0}
      <section id="reviews" class="section section-alt" aria-labelledby="reviews-head">
        <div class="container">
          <div class="gc-head">
            <p class="eyebrow">In their words</p>
            <h2 id="reviews-head">What clients say about the process</h2>
            {#if content.socialProof}
              <p class="rating">
                <span class="rating-score">{content.socialProof.ratingValue}</span>
                <span aria-hidden="true">★★★★★</span>
                <span>{content.socialProof.ratingCount} Google reviews</span>
              </p>
            {/if}
          </div>
          <div class="quote-grid">
            {#each content.testimonials as t (t.attribution)}
              <figure class="quote">
                <blockquote>{t.quote}</blockquote>
                <figcaption>{t.attribution}</figcaption>
              </figure>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    <!-- AREA -->
    <section id="area" class="section">
      <div class="container area">
        <div>
          <p class="eyebrow">Where we build</p>
          <h2>Building across {content.city} and nearby</h2>
          <p class="sec-lead">{content.serviceAreaIntro}</p>
        </div>
        {#if content.towns.length > 0}
          <ul class="towns" aria-label="Areas we serve">
            {#each content.towns as t (t)}
              <li>{@render icon(icons.pin)}{t}</li>
            {/each}
          </ul>
        {/if}
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="section section-alt" aria-labelledby="faq-head">
      <div class="container container-narrow">
        <div class="gc-head">
          <p class="eyebrow">Questions</p>
          <h2 id="faq-head">What homeowners ask us first</h2>
        </div>
        <div class="faqs">
          {#each faqs as f (f.q)}
            <details>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          {/each}
        </div>
      </div>
    </section>

    <!-- CONSULT -->
    <section id="consult" class="section section-dark" aria-labelledby="consult-head">
      <div class="container consult">
        <div class="consult-copy">
          <p class="eyebrow">Start a conversation</p>
          <h2 id="consult-head">Tell us about the house you have in mind</h2>
          <p class="sec-lead">
            A builder, not a salesperson, replies to every enquiry. We will talk through what is
            realistic, and what it tends to cost, before anyone asks you to commit to anything.
          </p>
          <ul class="consult-points">
            <li>{@render icon(icons.check)}Free first conversation</li>
            <li>{@render icon(icons.check)}Early budget and schedule outline</li>
            <li>{@render icon(icons.check)}Portal access from the day you sign</li>
          </ul>
          <p class="consult-call">
            Prefer to talk? <a href={content.phoneHref}>{content.phoneDisplay}</a>
            {#if content.email}· <a href="mailto:{content.email}">{content.email}</a>{/if}
          </p>
        </div>

        <div class="form-card">
          {#if submitted}
            <div class="thanks" role="status">
              <h3 class="thanks-head">Thanks, {firstName}.</h3>
              <p class="thanks-body">
                We will reply to {form.email.trim()} about your {form.type.toLowerCase()}. If it is
                urgent, call {content.phoneDisplay}.
              </p>
              <button class="btn btn-ghost-dark" onclick={resetForm}>Send another enquiry</button>
            </div>
          {:else}
            <form onsubmit={handleSubmit} novalidate>
              <div class="field" class:invalid={errs.name}>
                <label for="gc-name">Your name</label>
                <input id="gc-name" type="text" autocomplete="name" bind:value={form.name} oninput={revalidate} aria-invalid={errs.name ? 'true' : undefined} aria-describedby={errs.name ? 'gc-name-err' : undefined} />
                {#if errs.name}<span class="field-err" id="gc-name-err">Please enter your name.</span>{/if}
              </div>
              <div class="field-row">
                <div class="field" class:invalid={errs.email}>
                  <label for="gc-email">Email</label>
                  <input id="gc-email" type="email" autocomplete="email" bind:value={form.email} oninput={revalidate} aria-invalid={errs.email ? 'true' : undefined} aria-describedby={errs.email ? 'gc-email-err' : undefined} />
                  {#if errs.email}<span class="field-err" id="gc-email-err">Enter a valid email address.</span>{/if}
                </div>
                <div class="field" class:invalid={errs.phone}>
                  <label for="gc-phone">Phone <span class="opt">(optional)</span></label>
                  <input id="gc-phone" type="tel" autocomplete="tel" bind:value={form.phone} oninput={revalidate} aria-invalid={errs.phone ? 'true' : undefined} aria-describedby={errs.phone ? 'gc-phone-err' : undefined} />
                  {#if errs.phone}<span class="field-err" id="gc-phone-err">Enter a 10-digit phone number.</span>{/if}
                </div>
              </div>
              <div class="field" class:invalid={errs.type}>
                <label for="gc-type">What are you planning?</label>
                <select id="gc-type" bind:value={form.type} onchange={revalidate} aria-invalid={errs.type ? 'true' : undefined} aria-describedby={errs.type ? 'gc-type-err' : undefined}>
                  <option value="" disabled>Choose a project type</option>
                  {#each projectTypes as t (t)}<option value={t}>{t}</option>{/each}
                </select>
                {#if errs.type}<span class="field-err" id="gc-type-err">Choose a project type.</span>{/if}
              </div>
              <div class="field-row">
                <div class="field">
                  <label for="gc-budget">Budget range <span class="opt">(optional)</span></label>
                  <select id="gc-budget" bind:value={form.budget}>
                    <option value="">Not sure yet</option>
                    {#each budgetRanges as t (t)}<option value={t}>{t}</option>{/each}
                  </select>
                </div>
                <div class="field">
                  <label for="gc-start">When to start <span class="opt">(optional)</span></label>
                  <select id="gc-start" bind:value={form.start}>
                    <option value="">Not sure yet</option>
                    {#each startWindows as t (t)}<option value={t}>{t}</option>{/each}
                  </select>
                </div>
              </div>
              <div class="field">
                <label for="gc-place">Property address or neighbourhood <span class="opt">(optional)</span></label>
                <input id="gc-place" type="text" autocomplete="street-address" bind:value={form.place} />
              </div>
              <div class="field">
                <label for="gc-details">Tell us about it <span class="opt">(optional)</span></label>
                <textarea id="gc-details" rows="4" bind:value={form.details}></textarea>
              </div>
              <button class="btn btn-primary btn-lg btn-block" type="submit">Request a consultation</button>
              <p class="form-status" class:is-error={tried && hasErrors} role="status">{formStatus}</p>
            </form>
          {/if}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer-inner">
      <div>
        <p class="footer-brand">
          {content.brandLead}{#if content.brandTail} {content.brandTail}{/if}
        </p>
        <p class="footer-sub">{content.brandSub}</p>
        <p class="footer-note">{content.footerLicenceLine}</p>
      </div>
      <div>
        <p class="footer-head">Contact</p>
        <ul class="footer-list">
          <li><a href={content.phoneHref}>{content.phoneDisplay}</a></li>
          {#if content.email}<li><a href="mailto:{content.email}">{content.email}</a></li>{/if}
          {#if content.address}
            <li>
              <address>
                {#each content.address as line (line)}{line}<br />{/each}
              </address>
            </li>
          {/if}
        </ul>
      </div>
      <div>
        <p class="footer-head">Explore</p>
        <ul class="footer-list">
          <li><a href="#schedule">Your schedule</a></li>
          <li><a href="#budget">Your budget</a></li>
          <li><a href="#process">Process</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer-legal">
      <span>{content.copyrightLine}</span>
      <span>Schedule and budget figures on this page come from sample projects and are illustrative.</span>
    </div>
  </footer>
</div>

<style>
  .gc-root {
    position: relative;
    overflow-x: clip;
    --gc-bg: #f6f3ed;
    --gc-bg-alt: #ece7dc;
    --gc-surface: #ffffff;
    --gc-ink: #1c2022;
    --gc-muted: #5a6163;
    --gc-line: #d8d2c5;
    --gc-line-soft: #e8e3d8;
    --gc-line-strong: #b9b2a2;
    --gc-track: #e6e1d5;
    --gc-primary: #26343b;
    --gc-primary-dark: #172329;
    --gc-primary-soft: #7b929b;
    --gc-accent: #8a5a2b;
    --gc-accent-dark: #6f4620;
    --gc-accent-light: #e0b27a;
    --gc-good: #2a6845;
    --gc-good-bg: #dfeee4;
    --gc-bad: #a3361f;
    --gc-bad-bg: #f6e0da;
    --gc-warn: #7d5600;
    --gc-warn-bg: #f8edcf;
    --gc-radius: 10px;
    --gc-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;

    cursor: auto;
    background: var(--gc-bg);
    color: var(--gc-ink);
    font-family: Inter, system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.65;
  }

  .gc-root :global(*) {
    cursor: inherit;
  }

  .gc-root a,
  .gc-root button,
  .gc-root summary,
  .gc-root label,
  .gc-root select {
    cursor: pointer;
  }

  .gc-root input:not([type='checkbox']),
  .gc-root textarea {
    cursor: text;
  }

  .gc-root :global(*),
  .gc-root :global(*::before),
  .gc-root :global(*::after) {
    box-sizing: border-box;
  }

  /* :where() keeps these resets at zero specificity so a component class can override them. */
  :where(.gc-root) :where(h1, h2, h3) {
    font-family: var(--gc-display);
    font-weight: 600;
    line-height: 1.08;
    letter-spacing: -0.01em;
    margin: 0;
  }

  :where(.gc-root) :where(p) {
    margin: 0;
  }

  .skip {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 100;
    padding: 0.6rem 1rem;
    background: var(--gc-primary);
    color: #fff;
  }

  .skip:focus {
    left: 0.5rem;
    top: 0.5rem;
  }

  .container {
    width: min(1180px, 100% - 2.5rem);
    margin-inline: auto;
  }

  .container-narrow {
    width: min(820px, 100% - 2.5rem);
  }

  .ico {
    width: 1.1em;
    height: 1.1em;
    fill: currentColor;
    flex: none;
  }

  /* ── Utility + header ───────────────────────────────── */
  .utility {
    background: var(--gc-primary-dark);
    color: #d9e0e2;
    font-size: 0.8rem;
  }

  .utility-inner {
    width: min(1180px, 100% - 2.5rem);
    margin-inline: auto;
    display: flex;
    gap: 1.5rem;
    padding: 0.45rem 0;
    flex-wrap: wrap;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(246, 243, 237, 0.94);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .header.scrolled {
    border-bottom-color: var(--gc-line);
    box-shadow: 0 6px 24px rgba(28, 32, 34, 0.06);
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 76px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--gc-ink);
    text-decoration: none;
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 3px;
    background: var(--gc-primary);
    color: var(--gc-accent-light);
    font-family: var(--gc-display);
    font-size: 1.7rem;
    font-weight: 700;
    line-height: 1;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .brand-name {
    font-family: var(--gc-display);
    font-size: 1.45rem;
    font-weight: 700;
  }

  .brand-tail {
    font-weight: 500;
    color: var(--gc-accent);
  }

  .brand-sub {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 1.4rem;
    font-size: 0.92rem;
    font-weight: 500;
  }

  .nav a:not(.btn) {
    color: var(--gc-ink);
    text-decoration: none;
  }

  .nav a:not(.btn):hover {
    color: var(--gc-accent);
  }

  .nav-phone {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 600;
  }

  .menu-btn {
    display: none;
    padding: 0.5rem;
    border: 1px solid var(--gc-line-strong);
    border-radius: 6px;
    background: transparent;
    color: var(--gc-ink);
    font-size: 1.4rem;
  }

  /* ── Buttons ────────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    border: 1.5px solid transparent;
    border-radius: 4px;
    font: inherit;
    font-size: 0.92rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .btn-lg {
    padding: 0.85rem 1.6rem;
    font-size: 1rem;
  }

  .btn-block {
    width: 100%;
  }

  .btn-primary {
    background: var(--gc-accent);
    color: #fff;
  }

  .btn-primary:hover {
    background: var(--gc-accent-dark);
  }

  .btn-ghost {
    border-color: var(--gc-primary);
    color: var(--gc-primary);
    background: transparent;
  }

  .btn-ghost:hover {
    background: var(--gc-primary);
    color: #fff;
  }

  .btn-ghost-dark {
    border-color: var(--gc-primary);
    color: var(--gc-primary);
    background: transparent;
  }

  .btn:focus-visible,
  .pick:focus-visible,
  .tab:focus-visible,
  summary:focus-visible,
  .service-card:focus-visible,
  .nav a:focus-visible,
  .brand:focus-visible,
  .menu-btn:focus-visible {
    outline: 2px solid var(--gc-accent);
    outline-offset: 3px;
  }

  /* ── Hero ───────────────────────────────────────────── */
  .hero {
    position: relative;
    padding: 3.5rem 0 14rem;
    overflow: hidden;
  }

  .hero-inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    gap: 3rem;
    align-items: start;
  }

  .eyebrow {
    margin-bottom: 0.8rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gc-accent);
  }

  .hero h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    line-height: 1.02;
  }

  .lead {
    margin-top: 1.1rem;
    max-width: 38rem;
    font-size: 1.12rem;
    color: var(--gc-muted);
  }

  .picker {
    margin-top: 1.6rem;
  }

  .picker-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  .picker-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .pick,
  .tab {
    padding: 0.45rem 0.95rem;
    border: 1.5px solid var(--gc-line-strong);
    border-radius: 999px;
    background: var(--gc-surface);
    color: var(--gc-ink);
    font: inherit;
    font-size: 0.88rem;
    font-weight: 600;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .pick:hover,
  .tab:hover {
    border-color: var(--gc-primary);
  }

  .pick[aria-pressed='true'],
  .tab[aria-pressed='true'] {
    background: var(--gc-primary);
    border-color: var(--gc-primary);
    color: #fff;
  }

  .cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .tips {
    margin-top: 1.6rem;
    padding: 1rem 1.2rem;
    max-width: 38rem;
    background: #fbf9f5;
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
  }

  .tips-title {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  .tips ul {
    list-style: none;
    margin: 0.5rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.35rem;
    font-size: 0.93rem;
  }

  .tips li {
    display: flex;
    gap: 0.55rem;
    align-items: flex-start;
  }

  .tips .ico {
    margin-top: 0.3em;
    color: var(--gc-good);
  }

  /* Hero portal preview */
  .preview {
    padding: 0 0 1.1rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: 14px;
    box-shadow: 0 24px 60px -24px rgba(23, 35, 41, 0.35);
    overflow: hidden;
  }

  .preview-bar,
  .frame-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 1rem;
    background: var(--gc-bg-alt);
    border-bottom: 1px solid var(--gc-line);
    font-size: 0.8rem;
  }

  .preview-title,
  .frame-title {
    font-weight: 700;
    color: var(--gc-ink);
  }

  .dots {
    display: inline-flex;
    gap: 5px;
  }

  .dots i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--gc-line-strong);
  }

  .tag {
    margin-left: auto;
    padding: 0.1rem 0.6rem;
    border-radius: 999px;
    background: var(--gc-warn-bg);
    color: var(--gc-warn);
    font-size: 0.72rem;
    font-weight: 700;
  }

  .preview-name {
    padding: 1rem 1.2rem 0;
    font-family: var(--gc-display);
    font-size: 1.4rem;
    font-weight: 600;
  }

  .preview-row {
    margin: 0.85rem 1.2rem 0;
    padding-bottom: 0.9rem;
    border-bottom: 1px solid var(--gc-line-soft);
  }

  .pv-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  .pv-chip {
    margin-left: auto;
    display: inline-flex;
    gap: 0.3rem;
    padding: 0.05rem 0.55rem;
    border-radius: 999px;
    font-size: 0.72rem;
    letter-spacing: 0;
    text-transform: none;
    background: var(--gc-track);
    color: var(--gc-ink);
  }

  .pv-chip.under {
    background: var(--gc-good-bg);
    color: var(--gc-good);
  }

  .pv-chip.over {
    background: var(--gc-bad-bg);
    color: var(--gc-bad);
  }

  .pv-big {
    margin-top: 0.4rem;
    font-family: var(--gc-display);
    font-size: 2.3rem;
    font-weight: 600;
    line-height: 1.1;
  }

  .pv-big span {
    margin-left: 0.3rem;
    font-family: Inter, system-ui, sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--gc-muted);
  }

  .pv-meter {
    display: block;
    height: 6px;
    margin-top: 0.4rem;
    border-radius: 3px;
    background: var(--gc-track);
    overflow: hidden;
  }

  .pv-meter span {
    display: block;
    height: 100%;
    background: var(--gc-primary);
  }

  .pv-sub {
    margin-top: 0.4rem;
    font-size: 0.82rem;
    color: var(--gc-muted);
  }

  .preview-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0.9rem 1.2rem 0;
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--gc-accent);
  }

  .preview-foot {
    margin: 0.5rem 1.2rem 0;
    font-size: 0.75rem;
    color: var(--gc-muted);
  }

  /* Skyline: three line-drawn houses that draw themselves in on load. */
  .skyline {
    position: absolute;
    inset: auto 0 0 0;
    width: 100%;
    height: 200px;
    pointer-events: none;
  }

  .sk path {
    fill: none;
    stroke: var(--gc-line-strong);
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  @media (prefers-reduced-motion: no-preference) {
    .sk path {
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      animation: draw 2.4s ease-out forwards;
    }

    .sk path:nth-child(3) {
      animation-delay: 0.3s;
    }

    .sk path:nth-child(4) {
      animation-delay: 0.6s;
    }

    @keyframes draw {
      to {
        stroke-dashoffset: 0;
      }
    }
  }

  /* ── Trust strip ────────────────────────────────────── */
  .trust {
    background: var(--gc-primary);
    color: #eef1f2;
  }

  .trust-inner {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem 2rem;
    padding: 1.2rem 0;
  }

  .trust-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .trust-item strong {
    display: block;
    font-size: 0.92rem;
    line-height: 1.2;
  }

  .trust-item small {
    display: block;
    font-size: 0.78rem;
    color: #b8c4c8;
  }

  .trust-ico {
    display: grid;
    place-items: center;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    background: rgba(224, 178, 122, 0.16);
    color: var(--gc-accent-light);
    font-size: 1.15rem;
  }

  /* ── Sections ───────────────────────────────────────── */
  .section {
    padding: 5.5rem 0;
  }

  .section-alt {
    background: var(--gc-bg-alt);
  }

  .section-dark {
    background: var(--gc-primary-dark);
    color: #eef1f2;
  }

  .gc-head {
    max-width: 46rem;
    margin-bottom: 2.2rem;
  }

  .gc-head h2,
  .area h2,
  .consult h2,
  .principal h2 {
    font-size: clamp(2rem, 3.6vw, 3rem);
  }

  .sec-lead {
    margin-top: 0.9rem;
    color: var(--gc-muted);
  }

  .section-dark .sec-lead {
    color: #b8c4c8;
  }

  .section-dark .eyebrow {
    color: var(--gc-accent-light);
  }

  /* Services */
  .service-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .service-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.5rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
    color: inherit;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }

  .service-card:hover {
    transform: translateY(-3px);
    border-color: var(--gc-accent);
    box-shadow: 0 16px 36px -20px rgba(23, 35, 41, 0.35);
  }

  .svc-ico {
    display: grid;
    place-items: center;
    width: 2.8rem;
    height: 2.8rem;
    border-radius: 8px;
    background: var(--gc-bg-alt);
    color: var(--gc-primary);
    font-size: 1.4rem;
  }

  .service-card h3 {
    margin-top: 0.4rem;
    font-size: 1.55rem;
  }

  .service-card p {
    color: var(--gc-muted);
    font-size: 0.95rem;
  }

  .svc-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: auto;
    padding-top: 0.5rem;
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--gc-accent);
  }

  /* Portal frame */
  .features {
    list-style: none;
    margin: 0 0 1.8rem;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem 2rem;
  }

  .features li {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-left: 1rem;
    border-left: 3px solid var(--gc-accent);
    font-size: 0.93rem;
    color: var(--gc-muted);
  }

  .features strong {
    color: var(--gc-ink);
    font-size: 1rem;
  }

  .frame {
    background: var(--gc-bg);
    border: 1px solid var(--gc-line-strong);
    border-radius: 14px;
    box-shadow: 0 30px 70px -36px rgba(23, 35, 41, 0.4);
    overflow: hidden;
  }

  .section-alt .frame {
    background: var(--gc-bg);
  }

  .frame-tabs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0.9rem 1.25rem 0;
  }

  .frame-facts {
    margin-left: auto;
    font-size: 0.82rem;
    color: var(--gc-muted);
  }

  .frame-body {
    padding: 1.25rem;
  }

  /* Process */
  .steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    counter-reset: none;
  }

  .steps li {
    padding: 1.4rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
  }

  .step-n {
    display: grid;
    place-items: center;
    width: 2.3rem;
    height: 2.3rem;
    margin-bottom: 0.8rem;
    border-radius: 50%;
    background: var(--gc-primary);
    color: var(--gc-accent-light);
    font-family: var(--gc-display);
    font-size: 1.4rem;
    font-weight: 700;
  }

  .steps h3 {
    font-size: 1.45rem;
  }

  .steps p {
    margin-top: 0.4rem;
    font-size: 0.93rem;
    color: var(--gc-muted);
  }

  /* Contract */
  .contract-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .contract {
    padding: 1.8rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-top: 4px solid var(--gc-primary);
    border-radius: var(--gc-radius);
  }

  .best {
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gc-accent);
  }

  .contract h3 {
    margin: 0.3rem 0 0.5rem;
    font-size: 1.9rem;
  }

  .contract p:last-child {
    color: var(--gc-muted);
  }

  .invest {
    list-style: none;
    margin: 1.2rem 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .invest li::before {
    content: '·';
    margin-right: 0.5rem;
    color: var(--gc-accent);
    font-weight: 700;
  }

  /* Work */
  .work-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }

  .work {
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
    overflow: hidden;
  }

  .work-photo {
    display: grid;
    place-items: center;
    aspect-ratio: 3 / 2;
    padding: 1rem;
    background:
      linear-gradient(160deg, rgba(38, 52, 59, 0.08), rgba(138, 90, 43, 0.14)),
      var(--gc-track);
    color: var(--gc-muted);
    font-size: 0.8rem;
    text-align: center;
  }

  .work-body {
    padding: 1.2rem 1.4rem 1.4rem;
  }

  .work-kind {
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gc-accent);
  }

  .work h3 {
    margin: 0.2rem 0 0.4rem;
    font-size: 1.7rem;
  }

  .work-body p:not(.work-kind):not(.work-meta) {
    color: var(--gc-muted);
    font-size: 0.95rem;
  }

  .work-meta {
    margin-top: 0.6rem;
    font-size: 0.82rem;
    font-weight: 600;
  }

  /* Principal */
  .principal {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 2.5rem;
    align-items: center;
    max-width: 960px;
  }

  .principal-mark {
    display: grid;
    place-items: center;
    width: 9rem;
    height: 9rem;
    border-radius: 50%;
    background: var(--gc-primary);
    color: var(--gc-accent-light);
    font-family: var(--gc-display);
    font-size: 5rem;
    font-weight: 600;
  }

  .principal-role {
    margin-top: 0.3rem;
    font-weight: 600;
    color: var(--gc-accent);
  }

  .principal-bio {
    margin-top: 0.9rem;
    color: var(--gc-muted);
  }

  /* Reviews */
  .rating {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 0.9rem;
    font-size: 0.92rem;
    color: var(--gc-muted);
  }

  .rating-score {
    font-family: var(--gc-display);
    font-size: 2.2rem;
    font-weight: 600;
    color: var(--gc-ink);
  }

  .rating [aria-hidden] {
    color: var(--gc-accent);
    letter-spacing: 0.1em;
  }

  .quote-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .quote {
    margin: 0;
    padding: 1.6rem;
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
  }

  .quote blockquote {
    margin: 0;
    font-family: var(--gc-display);
    font-size: 1.25rem;
    line-height: 1.4;
  }

  .quote figcaption {
    margin-top: 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--gc-muted);
  }

  /* Area */
  .area {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 3rem;
    align-items: center;
  }

  .towns {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .towns li {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.9rem;
    border: 1px solid var(--gc-line-strong);
    border-radius: 999px;
    background: var(--gc-surface);
    font-size: 0.9rem;
    font-weight: 500;
  }

  .towns .ico {
    color: var(--gc-accent);
  }

  /* FAQ */
  .faqs {
    display: grid;
    gap: 0.6rem;
  }

  .faqs details {
    background: var(--gc-surface);
    border: 1px solid var(--gc-line);
    border-radius: var(--gc-radius);
  }

  .faqs summary {
    padding: 1.05rem 1.3rem;
    font-weight: 600;
    list-style: none;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .faqs summary::-webkit-details-marker {
    display: none;
  }

  .faqs summary::after {
    content: '+';
    font-size: 1.4rem;
    line-height: 1;
    color: var(--gc-accent);
  }

  .faqs details[open] summary::after {
    content: '−';
  }

  .faqs details p {
    padding: 0 1.3rem 1.2rem;
    color: var(--gc-muted);
  }

  /* Consult */
  .consult {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 3.5rem;
    align-items: start;
  }

  .consult-points {
    list-style: none;
    margin: 1.4rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  }

  .consult-points li {
    display: flex;
    gap: 0.6rem;
    align-items: center;
  }

  .consult-points .ico {
    color: var(--gc-accent-light);
  }

  .consult-call {
    margin-top: 1.6rem;
    color: #b8c4c8;
  }

  .consult-call a {
    color: var(--gc-accent-light);
    font-weight: 600;
  }

  .form-card {
    padding: 1.8rem;
    background: var(--gc-surface);
    color: var(--gc-ink);
    border-radius: 14px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: 1rem;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 1rem;
  }

  .field label {
    font-size: 0.85rem;
    font-weight: 600;
  }

  .opt {
    font-weight: 400;
    color: var(--gc-muted);
  }

  .field input,
  .field select,
  .field textarea {
    width: 100%;
    padding: 0.65rem 0.8rem;
    border: 1.5px solid var(--gc-line-strong);
    border-radius: 6px;
    background: #fff;
    color: var(--gc-ink);
    font: inherit;
    font-size: 0.95rem;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    outline: 2px solid var(--gc-accent);
    outline-offset: 1px;
    border-color: var(--gc-accent);
  }

  .field.invalid input,
  .field.invalid select {
    border-color: var(--gc-bad);
  }

  .field-err {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--gc-bad);
  }

  .form-status {
    margin-top: 0.8rem;
    font-size: 0.82rem;
    text-align: center;
    color: var(--gc-muted);
  }

  .form-status.is-error {
    color: var(--gc-bad);
    font-weight: 600;
  }

  .thanks {
    display: grid;
    gap: 0.9rem;
    justify-items: start;
    padding: 1rem 0;
  }

  .thanks-head {
    font-size: 2.2rem;
  }

  .thanks-body {
    color: var(--gc-muted);
  }

  /* Footer */
  .footer {
    background: var(--gc-primary-dark);
    color: #b8c4c8;
    font-size: 0.9rem;
  }

  .footer-inner {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 2rem;
    padding: 3rem 0 2rem;
  }

  .footer-brand {
    font-family: var(--gc-display);
    font-size: 1.7rem;
    font-weight: 700;
    color: #fff;
  }

  .footer-sub {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .footer-note {
    margin-top: 0.8rem;
  }

  .footer-head {
    margin-bottom: 0.6rem;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #fff;
  }

  .footer-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.4rem;
  }

  .footer a {
    color: #d9e0e2;
  }

  .footer address {
    font-style: normal;
  }

  .footer-legal {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem 2rem;
    padding: 1.2rem 0 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    font-size: 0.8rem;
  }

  /* ── Responsive ─────────────────────────────────────── */
  @media (max-width: 980px) {
    .hero-inner,
    .consult,
    .area {
      grid-template-columns: 1fr;
    }

    .service-grid,
    .steps,
    .quote-grid,
    .features {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .footer-inner {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 820px) {
    .menu-btn {
      display: inline-flex;
    }

    .nav {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: stretch;
      gap: 0;
      padding: 0.5rem 1.25rem 1.25rem;
      background: var(--gc-bg);
      border-bottom: 1px solid var(--gc-line);
      box-shadow: 0 20px 30px -20px rgba(23, 35, 41, 0.3);
    }

    .nav.open {
      display: flex;
    }

    .nav a:not(.btn) {
      padding: 0.8rem 0;
      border-bottom: 1px solid var(--gc-line-soft);
    }

    .nav .btn {
      margin-top: 0.8rem;
    }

    .utility-wide {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .section {
      padding: 3.75rem 0;
    }

    .hero {
      padding-bottom: 11rem;
    }

    .service-grid,
    .steps,
    .quote-grid,
    .features,
    .contract-grid,
    .work-grid,
    .field-row,
    .footer-inner {
      grid-template-columns: 1fr;
    }

    .principal {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .principal-mark {
      width: 6rem;
      height: 6rem;
      font-size: 3.4rem;
    }

    .frame-body {
      padding: 0.75rem;
    }

    .frame-bar .tag {
      display: none;
    }

    .frame-facts {
      margin-left: 0;
      width: 100%;
    }

    .trust-inner {
      justify-content: flex-start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .service-card,
    .header {
      transition: none;
    }
  }
</style>
