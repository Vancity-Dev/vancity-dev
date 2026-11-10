<script lang="ts">
  // General contractor / custom builder template, designed as an architectural monograph rather
  // than a service-business page: a full-bleed photograph, large serif type, hairline rules, an
  // asymmetric spread per project, then a dark band that turns into the client portal (live
  // schedule and budget), the part that is the firm's real difference.
  //
  // Same prospect-site contract as the other templates: one page, a content object in, every
  // verifiable fact (licence, rating, named people, projects, photographs, reviews, prices)
  // optional and absent for a derived prospect (see derive.ts). With no photography the hero
  // becomes typographic and every image block is dropped.
  //
  // The two portal boards run on clearly labelled sample projects from samples.ts, never on
  // anything about the firm.

  import { onMount } from 'svelte';
  import type { ContractorContent, Photo } from './types';
  import ScheduleBoard from './ScheduleBoard.svelte';
  import BudgetBoard from './BudgetBoard.svelte';
  import { portalSamples } from './samples';
  import { budgetSummary, dateAt, fmtDate, money, scheduleSummary, slipLabel } from './portal';

  let { content }: { content: ContractorContent } = $props();

  const icons = {
    arrow: 'M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4z'
  };

  const photo = $derived(content.photography);

  // The accent phrase is set in italics inside the headline.
  const headline = $derived.by(() => {
    const h = content.heroHeadline;
    const a = content.heroAccent;
    const i = a ? h.indexOf(a) : -1;
    return i < 0
      ? { before: h, accent: '', after: '' }
      : { before: h.slice(0, i), accent: a as string, after: h.slice(i + (a as string).length) };
  });

  // ── Sample project behind both portal sections ──────────────────────────────
  let sampleId = $state(portalSamples[0].id);
  const sample = $derived(portalSamples.find((p) => p.id === sampleId) ?? portalSamples[0]);
  const sched = $derived(scheduleSummary(sample));
  const budget = $derived(budgetSummary(sample));
  const asOfLabel = $derived(fmtDate(dateAt(sample.start, sample.asOf), true));
  const budgetWord = $derived(
    budget.state === 'on' ? 'On budget' : `${money(budget.variance)} ${budget.state}`
  );
  const scheduleWord = $derived(
    sched.state === 'on'
      ? 'On plan'
      : `${slipLabel(Math.abs(sched.slipDays))} ${sched.state === 'behind' ? 'behind' : 'ahead'}`
  );

  // ── Static copy ─────────────────────────────────────────────────────────────
  const services = [
    {
      title: 'Custom new homes',
      desc: 'From survey and permits to occupancy, built to your architect’s plans or ours.'
    },
    {
      title: 'Whole-home renovations',
      desc: 'Open up, rebuild and rewire the house you already own, without leaving the neighbourhood.'
    },
    {
      title: 'Additions & second storeys',
      desc: 'More space that looks as though it was always part of the house.'
    },
    {
      title: 'Kitchens, baths & interiors',
      desc: 'Full-scope interior builds, with millwork, stone and tile finished to a high standard.'
    },
    {
      title: 'Heritage & character homes',
      desc: 'Keep the original detail while bringing structure, insulation and systems up to date.'
    },
    {
      title: 'Design-build & preconstruction',
      desc: 'Feasibility, an early budget and a permit plan before you commit to a contract.'
    }
  ];

  const principles = [
    {
      t: 'Open books',
      b: 'Every trade has a budget you can read, and a forecast that says what it will really cost.'
    },
    {
      t: 'Dated plans',
      b: 'The schedule you sign is kept beside the live one, so a slip is visible and explained.'
    },
    {
      t: 'One builder',
      b: 'A single superintendent on your site and a principal who answers the phone.'
    }
  ];

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
      title: 'Conversation & site visit',
      body: 'We walk the property, listen to your brief and tell you plainly what is realistic.'
    },
    {
      title: 'Feasibility & budget',
      body: 'An early budget range and a schedule outline, before you spend on design.'
    },
    {
      title: 'Design & selections',
      body: 'Drawings, engineering and selections, each choice priced against your allowances.'
    },
    {
      title: 'Contract & permits',
      body: 'A written contract, a dated baseline and a line-by-line budget. Your portal opens the day you sign.'
    },
    {
      title: 'Build',
      body: 'Weekly updates, inspections on the schedule and change orders priced before work starts.'
    },
    {
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

  // ── Header ──────────────────────────────────────────────────────────────────
  let scrollY = $state(0);
  let innerHeight = $state(0);
  let menuOpen = $state(false);
  // Over a photographic hero the bar is smoked glass with light type; everywhere else it is paper.
  const overHero = $derived(photo !== null && scrollY < (innerHeight || 800) - 90);

  // ── Scroll reveal ───────────────────────────────────────────────────────────
  // Elements already on screen are marked up front, so nothing flashes; the rest fade in as they
  // arrive. Skipped entirely for reduced motion, and without JS everything simply shows.
  let root: HTMLElement | undefined = $state();

  onMount(() => {
    if (!root || typeof IntersectionObserver === 'undefined') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
    const fold = window.innerHeight;
    for (const el of els) if (el.getBoundingClientRect().top < fold) el.classList.add('in');
    root.classList.add('gc-js');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    for (const el of els) if (!el.classList.contains('in')) io.observe(el);
    return () => io.disconnect();
  });

  // ── Form ────────────────────────────────────────────────────────────────────
  const projectTypes = [
    'New custom home',
    'Whole-home renovation',
    'Addition or second storey',
    'Heritage restoration',
    'Not sure yet'
  ];
  const budgetRanges = ['Under $500K', '$500K – $1M', '$1M – $2M', '$2M +', 'Not sure yet'];
  const startWindows = ['Within 6 months', 'Within a year', 'More than a year away'];

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
      : 'A builder replies, not a salesperson. No obligation.'
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
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap"
    rel="stylesheet"
  />
  {#if photo}
    <link rel="preload" as="image" href={photo.hero.src} fetchpriority="high" />
  {/if}
</svelte:head>

<svelte:window bind:scrollY bind:innerHeight />

{#snippet icon(path: string)}
  <svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d={path} /></svg>
{/snippet}

{#snippet img(p: Photo, eager: boolean, w: number, h: number)}
  <img
    src={p.src}
    alt={p.alt}
    width={w}
    height={h}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    style:object-position={p.focus}
  />
{/snippet}

{#snippet sampleTabs()}
  <div class="frame-tabs" role="group" aria-label="Choose a sample project">
    {#each portalSamples as p (p.id)}
      <button class="tab" aria-pressed={p.id === sampleId} onclick={() => (sampleId = p.id)}>
        {p.label}
      </button>
    {/each}
    <span class="frame-facts">{sample.facts.join(' · ')}</span>
  </div>
{/snippet}

<div class="gc-root" bind:this={root}>
  <a href="#main" class="skip">Skip to content</a>

  <header class="header" class:over={overHero} class:open={menuOpen}>
    <div class="wrap header-inner">
      <a class="wm" href="#top" aria-label="{content.companyName}, home">
        {content.brandLead}{#if content.brandTail}{' '}<em>{content.brandTail}</em>{/if}
      </a>

      <nav class="nav" class:open={menuOpen} aria-label="Main">
        {#if content.projects.length > 0}
          <a href="#work" onclick={() => (menuOpen = false)}>Work</a>
        {/if}
        <a href="#services" onclick={() => (menuOpen = false)}>Services</a>
        <a href="#portal" onclick={() => (menuOpen = false)}>Client portal</a>
        <a href="#process" onclick={() => (menuOpen = false)}>Process</a>
        <a href="#faq" onclick={() => (menuOpen = false)}>FAQ</a>
        <a class="enq" href="#consult" onclick={() => (menuOpen = false)}>Enquire</a>
      </nav>

      <button
        class="menu-btn"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onclick={() => (menuOpen = !menuOpen)}
      >
        <span class="bars" aria-hidden="true"><i></i><i></i></span>
      </button>
    </div>
  </header>

  <main id="main">
    <!-- HERO -->
    <section id="top" class="hero" class:photo={photo !== null}>
      {#if photo}
        <div class="hero-img">{@render img(photo.hero, true, 2000, 1333)}</div>
      {/if}
      <div class="wrap hero-inner">
        <p class="eyebrow">{content.eyebrow}</p>
        <h1>
          {headline.before}{#if headline.accent}<em>{headline.accent}</em>{/if}{headline.after}
        </h1>
        <div class="hero-foot">
          <div class="hero-copy">
            <p class="hero-lead">{content.heroLead}</p>
            <div class="hero-cta">
              <a class="gbtn primary" href="#consult">Enquire about your home</a>
              <a class="gbtn secondary" href="#portal">See the client portal</a>
            </div>
          </div>
          {#if photo}
            <p class="hero-cap">{photo.hero.caption}</p>
          {/if}
        </div>
      </div>
      {#if !photo}
        <svg class="skyline" aria-hidden="true" viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice">
          <g class="sk">
            <path pathLength="1" d="M0 200 H1200" />
            <path pathLength="1" d="M80 200 V110 L240 40 L400 110 V200 M310 78 V40 H340 V98 M220 200 V150 H260 V200 M110 130 h50 v40 h-50z M320 130 h50 v40 h-50z M226 92 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0" />
            <path pathLength="1" d="M470 200 V120 H800 V200 M450 120 H820 V108 H450 Z M540 108 V60 H730 V108 M495 138 h100 v62 h-100z M620 138 h150 v62 h-150z M695 138 V200 M570 72 h140 v36 h-140z M640 72 V108" />
            <path pathLength="1" d="M870 200 V120 L990 60 L1110 120 V200 M858 150 H1122 M890 150 V200 M1090 150 V200 M965 200 V160 H1015 V200 M905 120 h40 v22 h-40z M1035 120 h40 v22 h-40z M1050 78 V56 H1074 V90" />
          </g>
        </svg>
      {/if}
    </section>

    <!-- STUDIO -->
    <section id="studio" class="section studio">
      <div class="wrap studio-grid">
        <p class="label" data-reveal>The studio</p>
        <div>
          <p class="statement" data-reveal>
            Every house we build is one of a kind, and so is how we build it:
            <em>open books, dated plans</em> and a builder you can reach.
          </p>
          {#if content.socialProof}
            <dl class="figures" data-reveal>
              <div>
                <dt>Years building</dt>
                <dd>{content.socialProof.yearsBadge}</dd>
              </div>
              <div>
                <dt>Homes delivered</dt>
                <dd>{content.socialProof.homesBuilt}</dd>
              </div>
              <div>
                <dt>{content.socialProof.ratingCount} Google reviews</dt>
                <dd>{content.socialProof.ratingValue}<small>/5</small></dd>
              </div>
            </dl>
          {/if}
        </div>
      </div>
    </section>

    <!-- WORK -->
    {#if content.projects.length > 0}
      <section id="work" class="section work" aria-labelledby="work-head">
        <div class="wrap">
          <div class="sh" data-reveal>
            <p class="label">Selected work</p>
            <h2 id="work-head">Homes we have <em>built and restored</em></h2>
          </div>

          {#each content.projects as p, i (p.name)}
            <article class="proj" class:flip={i % 2 === 1} data-reveal>
              <figure class="proj-main">{@render img(p.photos[0], false, 1600, 1200)}</figure>
              <div class="proj-meta">
                <p class="proj-n">{String(i + 1).padStart(2, '0')}</p>
                <p class="proj-kind">{p.kind} · {p.place} · {p.year}</p>
                <h3>{p.name}</h3>
                <p class="proj-blurb">{p.blurb}</p>
                <dl class="proj-facts">
                  <div><dt>Size</dt><dd>{p.size}</dd></div>
                  <div><dt>Built in</dt><dd>{p.duration}</dd></div>
                </dl>
              </div>
              {#if p.photos.length > 1}
                <figure class="proj-aside">{@render img(p.photos[1] as Photo, false, 1200, 900)}</figure>
              {/if}
            </article>
          {/each}
        </div>
      </section>
    {/if}

    <!-- CRAFT -->
    {#if photo}
      <section id="craft" class="section craft" aria-labelledby="craft-head">
        <div class="wrap">
          <div class="sh" data-reveal>
            <p class="label">The detail</p>
            <h2 id="craft-head">Decided at <em>the scale of the joint</em></h2>
          </div>
          <ul class="craft-grid">
            {#each photo.craft as c, i (c.label)}
              <li data-reveal style:--d="{i * 70}ms">
                <figure>{@render img(c.photo, false, 800, 1000)}</figure>
                <p class="craft-label">{c.label}</p>
                <p class="craft-note">{c.note}</p>
              </li>
            {/each}
          </ul>
        </div>
      </section>
    {/if}

    <!-- SERVICES -->
    <section id="services" class="section services" aria-labelledby="svc-head">
      <div class="wrap services-grid">
        <div class="sh sticky" data-reveal>
          <p class="label">What we build</p>
          <h2 id="svc-head">One builder for <em>the whole house</em></h2>
          <p class="sh-lead">
            Single-family homes only, so every project gets a superintendent who is on your site,
            not juggling five.
          </p>
        </div>
        <ol class="svc-list">
          {#each services as s, i (s.title)}
            <li data-reveal>
              <a class="svc" href="#consult">
                <span class="svc-n">{String(i + 1).padStart(2, '0')}</span>
                <span class="svc-body">
                  <span class="svc-title">{s.title}</span>
                  <span class="svc-desc">{s.desc}</span>
                </span>
                <span class="svc-go" aria-hidden="true">{@render icon(icons.arrow)}</span>
              </a>
            </li>
          {/each}
        </ol>
      </div>
    </section>

    <!-- PORTAL BAND -->
    <section id="portal" class="band" aria-labelledby="portal-head">
      {#if photo}
        <div class="band-img" aria-hidden="true">{@render img({ ...photo.build, alt: '' }, false, 1200, 1800)}</div>
      {/if}
      <div class="wrap band-inner">
        <p class="label light" data-reveal>The client portal</p>
        <h2 id="portal-head" data-reveal>
          Then the building begins, <em>and you can watch it.</em>
        </h2>
        <p class="band-lead" data-reveal>
          From the day the contract is signed, every client has a private portal with the live
          schedule and a line-by-line budget. Three principles sit behind it.
        </p>
        <ul class="principles" data-reveal>
          {#each principles as p (p.t)}
            <li><strong>{p.t}</strong><span>{p.b}</span></li>
          {/each}
        </ul>
        <div class="stats" data-reveal>
          <a class="stat" href="#schedule">
            <span class="stat-k">Schedule · sample project</span>
            <span class="stat-v">{sched.percent}%<small>complete</small></span>
            <span class="stat-s">{scheduleWord} · week {sched.week} of {sched.totalWeeks}</span>
            <span class="stat-go">See the schedule {@render icon(icons.arrow)}</span>
          </a>
          <a class="stat" href="#budget">
            <span class="stat-k">Budget · sample project</span>
            <span class="stat-v">{budgetWord}</span>
            <span class="stat-s">{money(budget.spent)} paid of {money(budget.budget)} approved</span>
            <span class="stat-go">See the budget {@render icon(icons.arrow)}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- SCHEDULE -->
    <section id="schedule" class="section portal" aria-labelledby="sched-head">
      <div class="wrap">
        <div class="sh wide" data-reveal>
          <p class="label">Client portal · Schedule</p>
          <h2 id="sched-head">See your build’s schedule <em>as it really is</em></h2>
          <p class="sh-lead">
            Every client gets a private portal from the day the contract is signed. The schedule
            below is a sample project. Click a phase to see what is happening on site.
          </p>
        </div>

        <ul class="features" data-reveal>
          {#each scheduleFeatures as f (f.t)}
            <li><strong>{f.t}</strong><span>{f.b}</span></li>
          {/each}
        </ul>

        <div class="frame" data-reveal>
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
    <section id="budget" class="section portal alt" aria-labelledby="budget-head">
      <div class="wrap">
        <div class="sh wide" data-reveal>
          <p class="label">Client portal · Budget</p>
          <h2 id="budget-head">Know whether you’re under or over budget, <em>any day of the week</em></h2>
          <p class="sh-lead">
            Your budget updates as invoices arrive and as costs are re-forecast. Try approving the
            pending change order in the sample to watch the budget move.
          </p>
        </div>

        <ul class="features" data-reveal>
          {#each budgetFeatures as f (f.t)}
            <li><strong>{f.t}</strong><span>{f.b}</span></li>
          {/each}
        </ul>

        <div class="frame" data-reveal>
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
    <section id="process" class="section process" aria-labelledby="proc-head">
      <div class="wrap process-grid">
        <div class="sh sticky" data-reveal>
          <p class="label">How it works</p>
          <h2 id="proc-head">Six steps, and <em>no surprise you hear last</em></h2>
        </div>
        <ol class="steps">
          {#each steps as s, i (s.title)}
            <li data-reveal>
              <span class="step-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          {/each}
        </ol>
      </div>
    </section>

    <!-- CONTRACT -->
    <section id="pricing" class="section contract">
      <div class="wrap">
        <div class="sh wide" data-reveal>
          <p class="label">How we price</p>
          <h2>Two ways to contract, <em>both fully visible</em></h2>
          <p class="sh-lead">
            Whichever suits your house, your budget board shows the same lines, the same change
            orders and the same forecast.
          </p>
        </div>
        <div class="contract-grid">
          {#each contracts as c (c.t)}
            <article data-reveal>
              <p class="best">{c.best}</p>
              <h3>{c.t}</h3>
              <p>{c.b}</p>
            </article>
          {/each}
        </div>
        {#if content.investment}
          <ul class="invest" aria-label="Typical investment" data-reveal>
            <li>{content.investment.newBuild}</li>
            <li>{content.investment.renovation}</li>
          </ul>
        {/if}
      </div>
    </section>

    <!-- PRINCIPAL -->
    {#if content.principal}
      <section id="team" class="section principal" aria-labelledby="team-head">
        <div class="wrap principal-grid">
          <div data-reveal>
            <p class="label">Who builds your home</p>
            <h2 id="team-head">{content.principal.name}</h2>
            <p class="principal-role">{content.principal.role}</p>
          </div>
          <p class="principal-bio" data-reveal>{content.principal.bio}</p>
        </div>
      </section>
    {/if}

    <!-- REVIEWS -->
    {#if content.testimonials.length > 0}
      <section id="reviews" class="section reviews" aria-labelledby="reviews-head">
        <div class="wrap">
          <div class="sh" data-reveal>
            <p class="label">In their words</p>
            <h2 id="reviews-head">What clients say <em>about the process</em></h2>
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
              <figure class="quote" data-reveal>
                <blockquote>{t.quote}</blockquote>
                <figcaption>{t.attribution}</figcaption>
              </figure>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    <!-- AREA -->
    <section id="area" class="section area">
      <div class="wrap area-grid">
        <div data-reveal>
          <p class="label">Where we build</p>
          <h2>Building across {content.city} <em>and nearby</em></h2>
          <p class="sh-lead">{content.serviceAreaIntro}</p>
        </div>
        {#if content.towns.length > 0}
          <ul class="towns" aria-label="Areas we serve" data-reveal>
            {#each content.towns as t (t)}
              <li>{t}</li>
            {/each}
          </ul>
        {/if}
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="section faq" aria-labelledby="faq-head">
      <div class="wrap faq-grid">
        <div class="sh sticky" data-reveal>
          <p class="label">Questions</p>
          <h2 id="faq-head">What homeowners <em>ask us first</em></h2>
        </div>
        <div class="faqs" data-reveal>
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
    <section id="consult" class="consult" aria-labelledby="consult-head">
      <div class="wrap consult-grid">
        <div class="consult-copy" data-reveal>
          <p class="label light">Start a conversation</p>
          <h2 id="consult-head">Tell us about <em>the house you have in mind.</em></h2>
          <p class="consult-lead">
            A builder, not a salesperson, replies to every enquiry. We will talk through what is
            realistic, and what it tends to cost, before anyone asks you to commit.
          </p>
          <ul class="contact">
            <li>
              <span class="contact-k">Call</span>
              <a href={content.phoneHref}>{content.phoneDisplay}</a>
            </li>
            {#if content.email}
              <li>
                <span class="contact-k">Write</span>
                <a href="mailto:{content.email}">{content.email}</a>
              </li>
            {/if}
            {#if content.address}
              <li>
                <span class="contact-k">Visit</span>
                <address>
                  {#each content.address as line (line)}{line}<br />{/each}
                </address>
              </li>
            {/if}
          </ul>
        </div>

        <div class="form-wrap" data-reveal>
          {#if submitted}
            <div class="thanks" role="status">
              <h3 class="thanks-head">Thanks, {firstName}.</h3>
              <p class="thanks-body">
                We will reply to {form.email.trim()} about your {form.type.toLowerCase()}. If it is
                urgent, call {content.phoneDisplay}.
              </p>
              <button class="gbtn outline" onclick={resetForm}>Send another enquiry</button>
            </div>
          {:else}
            <form onsubmit={handleSubmit} novalidate>
              <fieldset class="chips" class:invalid={errs.type}>
                <legend>What are you planning?</legend>
                <div class="chip-row">
                  {#each projectTypes as t (t)}
                    <label class="chip-opt">
                      <input
                        type="radio"
                        name="gc-type"
                        value={t}
                        bind:group={form.type}
                        onchange={revalidate}
                      />
                      <span>{t}</span>
                    </label>
                  {/each}
                </div>
                {#if errs.type}<span class="field-err" id="gc-type-err">Choose a project type.</span>{/if}
              </fieldset>

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
                <textarea id="gc-details" rows="3" bind:value={form.details}></textarea>
              </div>
              <button class="gbtn primary wide" type="submit">Request a consultation</button>
              <p class="form-status" class:is-error={tried && hasErrors} role="status">{formStatus}</p>
            </form>
          {/if}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="wrap">
      <p class="footer-mark" aria-hidden="true">
        {content.brandLead}{#if content.brandTail}{' '}<em>{content.brandTail}</em>{/if}
      </p>
      <div class="footer-cols">
        <div>
          <p class="footer-head">{content.brandSub}</p>
          <p>{content.servingLine}</p>
          <p>{content.footerLicenceLine}</p>
        </div>
        <div>
          <p class="footer-head">Contact</p>
          <p><a href={content.phoneHref}>{content.phoneDisplay}</a></p>
          {#if content.email}<p><a href="mailto:{content.email}">{content.email}</a></p>{/if}
        </div>
        <div>
          <p class="footer-head">Explore</p>
          <p><a href="#schedule">Your schedule</a></p>
          <p><a href="#budget">Your budget</a></p>
          <p><a href="#faq">FAQ</a></p>
        </div>
      </div>
      <div class="footer-legal">
        <span>{content.copyrightLine}</span>
        <span>
          Schedule and budget figures come from sample projects and are illustrative.
          {#if photo}Photography is stock imagery standing in for project photographs.{/if}
        </span>
      </div>
    </div>
  </footer>
</div>

<style>
  .gc-root {
    position: relative;
    overflow-x: clip;
    --gc-bg: #f1ede6;
    --gc-bg-alt: #e8e2d8;
    --gc-surface: #faf8f4;
    --gc-ink: #151412;
    --gc-muted: #5b564e;
    --gc-line: #d6cfc2;
    --gc-line-soft: #e3ddd1;
    --gc-line-strong: #b4ab9b;
    --gc-track: #e2dccf;
    --gc-primary: #1f2321;
    --gc-primary-dark: #121413;
    --gc-primary-soft: #8a9690;
    --gc-accent: #8b5a32;
    --gc-accent-dark: #6a4224;
    --gc-accent-light: #d9ae80;
    --gc-good: #2a6845;
    --gc-good-bg: #dfeee4;
    --gc-bad: #a3361f;
    --gc-bad-bg: #f6e0da;
    --gc-warn: #7d5600;
    --gc-warn-bg: #f8edcf;
    --gc-radius: 10px;
    --gc-display: 'Instrument Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
    --gc-paper: #f6f2ea;
    --gc-dark: #121110;

    cursor: auto;
    background: var(--gc-bg);
    color: var(--gc-ink);
    font-family: Inter, system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
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

  .gc-root input:not([type='radio']):not([type='checkbox']),
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
    margin: 0;
    font-family: var(--gc-display);
    font-weight: 400;
    letter-spacing: -0.02em;
    word-spacing: 0.08em;
  }

  :where(.gc-root) :where(p, ul, ol, dl, dd, figure, blockquote) {
    margin: 0;
  }

  :where(.gc-root) :where(ul, ol) {
    padding: 0;
    list-style: none;
  }

  .gc-root em {
    font-style: italic;
  }

  .ico {
    width: 1.15em;
    height: 1.15em;
    fill: currentColor;
    flex: none;
  }

  .skip {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 100;
    padding: 0.6rem 1rem;
    background: var(--gc-ink);
    color: #fff;
  }

  .skip:focus {
    left: 0.5rem;
    top: 0.5rem;
  }

  .wrap {
    width: min(1280px, 100% - clamp(2.5rem, 7vw, 6rem));
    margin-inline: auto;
  }

  section[id] {
    scroll-margin-top: 72px;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* ── Header ─────────────────────────────────────────── */
  .header {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 50;
    background: rgba(241, 237, 230, 0.94);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--gc-line);
    color: var(--gc-ink);
    transition: background 0.35s, border-color 0.35s, color 0.35s;
  }

  .header.over {
    background: rgba(20, 19, 17, 0.64);
    border-bottom-color: rgba(255, 255, 255, 0.14);
    color: #fff;
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    min-height: 68px;
  }

  .wm {
    font-family: var(--gc-display);
    font-size: 1.65rem;
    line-height: 1;
    letter-spacing: -0.01em;
    color: inherit;
    text-decoration: none;
  }

  .wm em {
    opacity: 0.7;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: clamp(1.1rem, 2.4vw, 2.2rem);
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .nav a {
    color: inherit;
    text-decoration: none;
    background-image: linear-gradient(currentColor, currentColor);
    background-repeat: no-repeat;
    background-position: 0 100%;
    background-size: 0 1px;
    padding-bottom: 3px;
    transition: background-size 0.3s;
  }

  .nav a:hover {
    background-size: 100% 1px;
  }

  .nav .enq {
    padding: 0.55rem 1.2rem;
    border: 1px solid currentColor;
    border-radius: 999px;
    background-image: none;
    transition: background 0.25s, color 0.25s;
  }

  .nav .enq:hover {
    background: var(--gc-ink);
    border-color: var(--gc-ink);
    color: var(--gc-paper);
  }

  .header.over .nav .enq:hover {
    background: var(--gc-paper);
    border-color: var(--gc-paper);
    color: var(--gc-ink);
  }

  .menu-btn {
    display: none;
    width: 44px;
    height: 44px;
    border: none;
    background: transparent;
    color: inherit;
  }

  .bars {
    position: relative;
    display: block;
    width: 24px;
    height: 10px;
    margin: auto;
  }

  .bars i {
    position: absolute;
    left: 0;
    right: 0;
    height: 1.5px;
    background: currentColor;
    transition: transform 0.3s, top 0.3s;
  }

  .bars i:first-child {
    top: 0;
  }

  .bars i:last-child {
    top: 9px;
  }

  .header.open .bars i:first-child {
    top: 4px;
    transform: rotate(45deg);
  }

  .header.open .bars i:last-child {
    top: 4px;
    transform: rotate(-45deg);
  }

  .nav a:focus-visible,
  .wm:focus-visible,
  .menu-btn:focus-visible,
  .gbtn:focus-visible,
  .svc:focus-visible,
  .stat:focus-visible,
  .tab:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--gc-accent-light);
    outline-offset: 3px;
  }

  /* ── Buttons ────────────────────────────────────────── */
  .gbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 0.95rem 1.7rem;
    border: 1px solid transparent;
    border-radius: 999px;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    transition: background 0.25s, color 0.25s, border-color 0.25s, transform 0.25s;
  }

  .gbtn:active {
    transform: translateY(1px);
  }

  .gbtn.wide {
    width: 100%;
  }

  /* Over the photograph: a light pill, and smoked glass. Both are opaque enough to read. */
  .hero.photo .gbtn.primary {
    background: var(--gc-paper);
    color: var(--gc-ink);
  }

  .hero.photo .gbtn.primary:hover {
    background: #fff;
  }

  .hero.photo .gbtn.secondary {
    background: rgba(20, 19, 17, 0.64);
    border-color: rgba(255, 255, 255, 0.35);
    color: #fff;
    backdrop-filter: blur(10px);
  }

  .hero.photo .gbtn.secondary:hover {
    background: rgba(20, 19, 17, 0.82);
  }

  .hero:not(.photo) .gbtn.primary {
    background: var(--gc-accent);
    color: #fff;
  }

  .hero:not(.photo) .gbtn.primary:hover {
    background: var(--gc-accent-dark);
  }

  .consult .gbtn.primary {
    background: var(--gc-paper);
    color: var(--gc-ink);
  }

  .consult .gbtn.primary:hover {
    background: var(--gc-accent-light);
  }

  .hero:not(.photo) .gbtn.secondary {
    border-color: var(--gc-ink);
    color: var(--gc-ink);
  }

  .hero:not(.photo) .gbtn.secondary:hover {
    background: var(--gc-ink);
    color: var(--gc-paper);
  }

  .gbtn.outline {
    border-color: rgba(255, 255, 255, 0.5);
    color: #fff;
  }

  .gbtn.outline:hover {
    background: var(--gc-paper);
    color: var(--gc-ink);
  }

  /* ── Hero ───────────────────────────────────────────── */
  .hero {
    position: relative;
    display: flex;
    min-height: 100svh;
    padding: 9rem 0 4rem;
    overflow: hidden;
  }

  .hero.photo {
    background: var(--gc-dark);
    color: #fff;
  }

  .hero-img {
    position: absolute;
    inset: 0;
  }

  .hero-img::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(10, 9, 8, 0.5) 0%, rgba(10, 9, 8, 0) 28%),
      linear-gradient(0deg, rgba(10, 9, 8, 0.82) 0%, rgba(10, 9, 8, 0.2) 55%, rgba(10, 9, 8, 0) 80%);
  }

  .hero-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 1.4rem;
  }

  .eyebrow {
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: inherit;
    opacity: 0.85;
  }

  .hero:not(.photo) .eyebrow {
    color: var(--gc-accent);
    opacity: 1;
  }

  .hero h1 {
    max-width: 14ch;
    font-size: clamp(3.4rem, 10.5vw, 9.6rem);
    line-height: 0.92;
    letter-spacing: -0.035em;
  }

  .hero:not(.photo) h1 {
    max-width: 18ch;
    font-size: clamp(3rem, 8vw, 7rem);
  }

  .hero h1 em {
    color: var(--gc-accent-light);
  }

  .hero:not(.photo) h1 em {
    color: var(--gc-accent);
  }

  .hero-foot {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    margin-top: 1.2rem;
    padding-top: 1.6rem;
    border-top: 1px solid rgba(255, 255, 255, 0.28);
  }

  .hero:not(.photo) .hero-foot {
    border-top-color: var(--gc-line-strong);
  }

  .hero-copy {
    display: grid;
    gap: 1.6rem;
    max-width: 36rem;
  }

  .hero-lead {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .hero-cta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .hero-cap {
    font-size: 0.74rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.8;
  }

  .skyline {
    position: absolute;
    inset: auto 0 0 0;
    width: 100%;
    height: 200px;
    opacity: 0.7;
    pointer-events: none;
  }

  .sk path {
    fill: none;
    stroke: var(--gc-line-strong);
    stroke-width: 1.4;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }

  /* ── Shared section type ────────────────────────────── */
  .section {
    padding: clamp(5rem, 10vw, 9rem) 0;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  .label::before {
    content: '';
    width: 2.2rem;
    height: 1px;
    background: currentColor;
  }

  .label.light {
    color: #b9b2a4;
  }

  .sh {
    margin-bottom: clamp(2.5rem, 5vw, 4.5rem);
  }

  .sh.wide {
    max-width: 62rem;
  }

  .sh h2,
  .area h2,
  .principal h2,
  .consult h2,
  .band h2 {
    margin-top: 1.1rem;
    font-size: clamp(2.6rem, 5.4vw, 5rem);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .sh h2 em,
  .area h2 em {
    color: var(--gc-accent);
  }

  .band h2 em,
  .consult h2 em {
    color: var(--gc-accent-light);
  }

  .sh-lead {
    margin-top: 1.4rem;
    max-width: 36rem;
    color: var(--gc-muted);
  }

  /* ── Studio ─────────────────────────────────────────── */
  .studio {
    padding-bottom: clamp(3rem, 6vw, 5rem);
  }

  .studio-grid {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 9fr);
    gap: 2rem;
  }

  .studio-grid .label {
    align-self: start;
    padding-top: 0.9rem;
  }

  .statement {
    max-width: 24em;
    font-family: var(--gc-display);
    font-size: clamp(2rem, 4.2vw, 3.8rem);
    line-height: 1.12;
    letter-spacing: -0.025em;
  }

  .statement em {
    color: var(--gc-accent);
  }

  .figures {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
    max-width: 40rem;
    margin-top: 3.5rem;
    padding-top: 1.6rem;
    border-top: 1px solid var(--gc-line-strong);
  }

  .figures dt {
    order: 2;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  .figures div {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .figures dd {
    font-family: var(--gc-display);
    font-size: clamp(2.6rem, 5vw, 4rem);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .figures small {
    font-size: 0.45em;
    color: var(--gc-muted);
  }

  /* ── Selected work ──────────────────────────────────── */
  .work {
    padding-top: clamp(3rem, 6vw, 5rem);
  }

  .proj {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: auto 1fr;
    column-gap: clamp(1rem, 2.4vw, 2.5rem);
    row-gap: 2rem;
    margin-bottom: clamp(4.5rem, 9vw, 8rem);
  }

  .proj:last-child {
    margin-bottom: 0;
  }

  .proj-main {
    grid-column: 1 / 9;
    grid-row: 1 / 3;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--gc-track);
  }

  .proj-meta {
    grid-column: 9 / 13;
    grid-row: 1;
  }

  .proj-aside {
    grid-column: 9 / 13;
    grid-row: 2;
    align-self: end;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--gc-track);
  }

  .proj.flip .proj-main {
    grid-column: 5 / 13;
  }

  .proj.flip .proj-meta,
  .proj.flip .proj-aside {
    grid-column: 1 / 5;
  }

  .proj figure img {
    transition: transform 1.2s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  .proj figure:hover img {
    transform: scale(1.035);
  }

  .proj-n {
    font-family: var(--gc-display);
    font-size: 3.2rem;
    line-height: 1;
    color: var(--gc-accent);
  }

  .proj-kind {
    margin-top: 1.2rem;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  .proj-meta h3 {
    margin: 0.6rem 0 1rem;
    font-size: clamp(2rem, 3.2vw, 3rem);
    line-height: 1.02;
  }

  .proj-blurb {
    color: var(--gc-muted);
    font-size: 0.97rem;
  }

  .proj-facts {
    display: flex;
    gap: 2.2rem;
    margin-top: 1.4rem;
    padding-top: 1.1rem;
    border-top: 1px solid var(--gc-line-strong);
  }

  .proj-facts dt {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  .proj-facts dd {
    font-family: var(--gc-display);
    font-size: 1.5rem;
    line-height: 1.2;
  }

  /* ── Craft ──────────────────────────────────────────── */
  .craft {
    background: var(--gc-bg-alt);
  }

  .craft-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(1rem, 2vw, 2rem);
    align-items: start;
  }

  .craft-grid li:nth-child(even) {
    margin-top: clamp(1.5rem, 4vw, 4rem);
  }

  .craft-grid figure {
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: var(--gc-track);
  }

  .craft-grid figure img {
    transition: transform 1.2s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  .craft-grid li:hover figure img {
    transform: scale(1.04);
  }

  .craft-label {
    margin-top: 1rem;
    font-family: var(--gc-display);
    font-size: 1.9rem;
    line-height: 1;
  }

  .craft-note {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: var(--gc-muted);
  }

  /* ── Services ───────────────────────────────────────── */
  .services-grid,
  .process-grid,
  .faq-grid {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: clamp(2rem, 6vw, 6rem);
    align-items: start;
  }

  .sticky {
    position: sticky;
    top: 110px;
    margin-bottom: 0;
  }

  .svc-list {
    border-top: 1px solid var(--gc-line-strong);
  }

  .svc {
    display: grid;
    grid-template-columns: 3rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 1rem;
    padding: 1.7rem 0;
    border-bottom: 1px solid var(--gc-line-strong);
    color: inherit;
    text-decoration: none;
    transition: padding 0.35s cubic-bezier(0.2, 0.7, 0.2, 1), background 0.35s;
  }

  .svc:hover {
    padding-inline: 1rem;
    background: var(--gc-bg-alt);
  }

  .svc-n {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: var(--gc-accent);
  }

  .svc-body {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .svc-title {
    font-family: var(--gc-display);
    font-size: clamp(1.7rem, 2.8vw, 2.5rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
  }

  .svc-desc {
    max-width: 30rem;
    font-size: 0.93rem;
    color: var(--gc-muted);
  }

  .svc-go {
    font-size: 1.4rem;
    color: var(--gc-accent);
    transition: transform 0.35s;
  }

  .svc:hover .svc-go {
    transform: translateX(6px);
  }

  /* ── Portal band ────────────────────────────────────── */
  .band {
    position: relative;
    padding: clamp(5.5rem, 11vw, 10rem) 0;
    overflow: hidden;
    background: var(--gc-dark);
    color: var(--gc-paper);
  }

  .band-img {
    position: absolute;
    inset: 0;
    opacity: 0.5;
  }

  .band-img::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(18, 17, 16, 0.95) 30%, rgba(18, 17, 16, 0.45) 100%);
  }

  .band-inner {
    position: relative;
    z-index: 1;
  }

  .band h2 {
    max-width: 14em;
    font-size: clamp(2.8rem, 7vw, 6.4rem);
    line-height: 0.96;
  }

  .band-lead {
    max-width: 34rem;
    margin-top: 1.6rem;
    color: #cfc8ba;
  }

  .principles {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2rem;
    margin-top: clamp(2.5rem, 5vw, 4rem);
  }

  .principles li {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding-top: 1.1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.28);
    font-size: 0.93rem;
    color: #cfc8ba;
  }

  .principles strong {
    font-family: var(--gc-display);
    font-size: 1.9rem;
    font-weight: 400;
    line-height: 1;
    color: var(--gc-paper);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
    margin-top: clamp(2.5rem, 5vw, 4.5rem);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.6rem 1.8rem;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 4px;
    color: var(--gc-paper);
    text-decoration: none;
    transition: background 0.3s, border-color 0.3s;
  }

  .stat:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: var(--gc-accent-light);
  }

  .stat-k {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #b9b2a4;
  }

  .stat-v {
    font-family: var(--gc-display);
    font-size: clamp(2.6rem, 5vw, 4.2rem);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .stat-v small {
    margin-left: 0.5rem;
    font-family: Inter, system-ui, sans-serif;
    font-size: 0.9rem;
    letter-spacing: 0;
    color: #b9b2a4;
  }

  .stat-s {
    font-size: 0.88rem;
    color: #cfc8ba;
  }

  .stat-go {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.6rem;
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gc-accent-light);
  }

  /* ── Portal sections ────────────────────────────────── */
  .portal.alt {
    background: var(--gc-bg-alt);
  }

  .features {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem clamp(1.5rem, 3vw, 3rem);
    margin-bottom: 2.5rem;
  }

  .features li {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-top: 1rem;
    border-top: 1px solid var(--gc-line-strong);
    font-size: 0.93rem;
    color: var(--gc-muted);
  }

  .features strong {
    font-family: var(--gc-display);
    font-size: 1.6rem;
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--gc-ink);
  }

  .frame {
    background: var(--gc-bg);
    border: 1px solid var(--gc-line-strong);
    border-radius: 14px;
    box-shadow: 0 40px 80px -48px rgba(21, 20, 18, 0.5);
    overflow: hidden;
  }

  .portal.alt .frame {
    background: var(--gc-surface);
  }

  .frame-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem 1.1rem;
    background: var(--gc-bg-alt);
    border-bottom: 1px solid var(--gc-line);
    font-size: 0.8rem;
  }

  .portal.alt .frame-bar {
    background: var(--gc-bg);
  }

  .frame-title {
    font-weight: 600;
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
    padding: 0.1rem 0.7rem;
    border-radius: 999px;
    background: var(--gc-warn-bg);
    color: var(--gc-warn);
    font-size: 0.72rem;
    font-weight: 700;
  }

  .frame-tabs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.25rem 0;
  }

  .tab {
    padding: 0.45rem 1rem;
    border: 1px solid var(--gc-line-strong);
    border-radius: 999px;
    background: transparent;
    color: var(--gc-ink);
    font: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }

  .tab:hover {
    border-color: var(--gc-ink);
  }

  .tab[aria-pressed='true'] {
    background: var(--gc-ink);
    border-color: var(--gc-ink);
    color: var(--gc-paper);
  }

  .frame-facts {
    margin-left: auto;
    font-size: 0.82rem;
    color: var(--gc-muted);
  }

  .frame-body {
    padding: 1.25rem;
  }

  /* ── Process ────────────────────────────────────────── */
  .steps {
    border-top: 1px solid var(--gc-line-strong);
  }

  .steps li {
    display: grid;
    grid-template-columns: 5.5rem minmax(0, 1fr);
    gap: 1rem;
    padding: 1.8rem 0;
    border-bottom: 1px solid var(--gc-line-strong);
  }

  .step-n {
    font-family: var(--gc-display);
    font-size: 3.2rem;
    line-height: 1;
    color: var(--gc-accent);
  }

  .steps h3 {
    font-size: clamp(1.7rem, 2.6vw, 2.3rem);
    line-height: 1.05;
  }

  .steps p {
    max-width: 30rem;
    margin-top: 0.5rem;
    font-size: 0.95rem;
    color: var(--gc-muted);
  }

  /* ── Contract ───────────────────────────────────────── */
  .contract {
    background: var(--gc-bg-alt);
  }

  .contract-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(1.5rem, 4vw, 4rem);
  }

  .contract-grid article {
    padding-top: 1.4rem;
    border-top: 1px solid var(--gc-ink);
  }

  .best {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gc-accent);
  }

  .contract h3 {
    margin: 0.6rem 0 0.8rem;
    font-size: clamp(2.2rem, 4vw, 3.4rem);
    line-height: 1;
  }

  .contract-grid p:last-child {
    max-width: 30rem;
    color: var(--gc-muted);
  }

  .invest {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 3rem;
    margin-top: 3rem;
    padding-top: 1.4rem;
    border-top: 1px solid var(--gc-line-strong);
    font-family: var(--gc-display);
    font-size: clamp(1.4rem, 2.4vw, 2rem);
    line-height: 1.2;
  }

  /* ── Principal ──────────────────────────────────────── */
  .principal-grid {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: clamp(2rem, 6vw, 6rem);
    align-items: start;
  }

  .principal h2 {
    font-size: clamp(3rem, 7vw, 6.4rem);
    line-height: 0.95;
  }

  .principal-role {
    margin-top: 1rem;
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gc-accent);
  }

  .principal-bio {
    padding-top: 0.5rem;
    font-family: var(--gc-display);
    font-size: clamp(1.4rem, 2.3vw, 2rem);
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  /* ── Reviews ────────────────────────────────────────── */
  .reviews {
    background: var(--gc-bg-alt);
  }

  .rating {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.7rem;
    margin-top: 1.4rem;
    font-size: 0.9rem;
    color: var(--gc-muted);
  }

  .rating-score {
    font-family: var(--gc-display);
    font-size: 2.4rem;
    line-height: 1;
    color: var(--gc-ink);
  }

  .rating [aria-hidden] {
    color: var(--gc-accent);
    letter-spacing: 0.12em;
  }

  .quote-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(1.5rem, 3vw, 3rem);
  }

  .quote {
    padding-top: 1.4rem;
    border-top: 1px solid var(--gc-ink);
  }

  .quote blockquote {
    font-family: var(--gc-display);
    font-size: clamp(1.3rem, 1.9vw, 1.7rem);
    line-height: 1.28;
    letter-spacing: -0.01em;
  }

  .quote figcaption {
    margin-top: 1.4rem;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gc-muted);
  }

  /* ── Area ───────────────────────────────────────────── */
  .area-grid {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: clamp(2rem, 6vw, 6rem);
    align-items: end;
  }

  .towns {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem 0.6rem;
    font-family: var(--gc-display);
    font-size: clamp(1.8rem, 3.6vw, 3.2rem);
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--gc-muted);
  }

  .towns li::after {
    content: '/';
    margin-left: 0.6rem;
    color: var(--gc-line-strong);
  }

  .towns li:last-child::after {
    content: none;
  }

  /* ── FAQ ────────────────────────────────────────────── */
  .faq {
    background: var(--gc-bg-alt);
  }

  .faqs {
    border-top: 1px solid var(--gc-line-strong);
  }

  .faqs details {
    border-bottom: 1px solid var(--gc-line-strong);
  }

  .faqs summary {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.4rem 0;
    font-family: var(--gc-display);
    font-size: clamp(1.4rem, 2.2vw, 1.9rem);
    line-height: 1.15;
    letter-spacing: -0.015em;
    list-style: none;
  }

  .faqs summary::-webkit-details-marker {
    display: none;
  }

  .faqs summary::after {
    content: '+';
    flex: none;
    font-family: Inter, system-ui, sans-serif;
    font-size: 1.5rem;
    font-weight: 300;
    line-height: 1;
    color: var(--gc-accent);
    transition: transform 0.3s;
  }

  .faqs details[open] summary::after {
    transform: rotate(45deg);
  }

  .faqs details p {
    max-width: 38rem;
    padding: 0 0 1.5rem;
    color: var(--gc-muted);
  }

  /* ── Consult ────────────────────────────────────────── */
  .consult {
    padding: clamp(5.5rem, 11vw, 10rem) 0;
    background: var(--gc-dark);
    color: var(--gc-paper);
  }

  .consult-grid {
    display: grid;
    grid-template-columns: minmax(0, 6fr) minmax(0, 6fr);
    gap: clamp(2.5rem, 7vw, 7rem);
    align-items: start;
  }

  .consult h2 {
    font-size: clamp(2.8rem, 6vw, 5.6rem);
  }

  .consult-lead {
    max-width: 30rem;
    margin-top: 1.6rem;
    color: #cfc8ba;
  }

  .contact {
    display: grid;
    gap: 1.5rem;
    margin-top: 3rem;
  }

  .contact li {
    display: grid;
    grid-template-columns: 4.5rem minmax(0, 1fr);
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.22);
  }

  .contact-k {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #b9b2a4;
    padding-top: 0.5rem;
  }

  .contact a,
  .contact address {
    font-family: var(--gc-display);
    font-size: clamp(1.5rem, 2.4vw, 2.1rem);
    font-style: normal;
    line-height: 1.2;
    color: var(--gc-paper);
    text-decoration: none;
    overflow-wrap: anywhere;
  }

  .contact a:hover {
    color: var(--gc-accent-light);
  }

  .form-wrap {
    padding: clamp(1.5rem, 3vw, 2.5rem);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 4px;
  }

  .chips {
    min-width: 0;
    margin: 0 0 1.8rem;
    padding: 0;
    border: none;
  }

  .chips legend,
  .field label {
    padding: 0;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #b9b2a4;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.8rem;
  }

  .chip-opt {
    position: relative;
  }

  .chip-opt input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
  }

  .chip-opt span {
    display: block;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 999px;
    font-size: 0.85rem;
    color: var(--gc-paper);
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }

  .chip-opt:hover span {
    border-color: var(--gc-paper);
  }

  .chip-opt input:checked + span {
    background: var(--gc-paper);
    border-color: var(--gc-paper);
    color: var(--gc-ink);
  }

  .chip-opt input:focus-visible + span {
    outline: 2px solid var(--gc-accent-light);
    outline-offset: 2px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    margin-bottom: 1.4rem;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 1.5rem;
  }

  .opt {
    font-weight: 400;
    letter-spacing: 0.04em;
    text-transform: none;
    color: #9d9588;
  }

  .field input,
  .field select,
  .field textarea {
    width: 100%;
    padding: 0.5rem 0;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 0;
    background: transparent;
    color: var(--gc-paper);
    font: inherit;
    font-size: 1.02rem;
    transition: border-color 0.2s;
  }

  .field select option {
    background: var(--gc-dark);
    color: var(--gc-paper);
  }

  .field textarea {
    resize: vertical;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    outline: none;
    border-bottom-color: var(--gc-accent-light);
  }

  .field.invalid input,
  .chips.invalid .chip-opt span {
    border-color: #ff9d8a;
  }

  .field-err {
    margin-top: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #ffb3a3;
  }

  .form-status {
    margin-top: 1rem;
    font-size: 0.82rem;
    text-align: center;
    color: #b9b2a4;
  }

  .form-status.is-error {
    color: #ffb3a3;
    font-weight: 600;
  }

  .thanks {
    display: grid;
    gap: 1rem;
    justify-items: start;
    padding: 1rem 0;
  }

  .thanks-head {
    font-size: 3rem;
    line-height: 1;
  }

  .thanks-body {
    color: #cfc8ba;
  }

  /* ── Footer ─────────────────────────────────────────── */
  .footer {
    padding: clamp(3rem, 6vw, 5rem) 0 2rem;
    background: var(--gc-dark);
    color: #b9b2a4;
    font-size: 0.9rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .footer-mark {
    margin-bottom: clamp(2rem, 5vw, 4rem);
    font-family: var(--gc-display);
    font-size: clamp(2.6rem, 9.5vw, 8.5rem);
    line-height: 0.95;
    letter-spacing: -0.04em;
    color: var(--gc-paper);
    overflow-wrap: anywhere;
  }

  .footer-mark em {
    opacity: 0.55;
  }

  .footer-cols {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 2rem;
    padding-top: 1.6rem;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }

  .footer-head {
    margin-bottom: 0.6rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gc-paper);
  }

  .footer a {
    color: #d8d1c3;
  }

  .footer-legal {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem 2rem;
    margin-top: 3rem;
    font-size: 0.78rem;
  }

  /* ── Motion (the `gc-js` and `in` classes are added by script, so :global) ─ */
  @media (prefers-reduced-motion: no-preference) {
    .gc-root:global(.gc-js) [data-reveal]:not(:global(.in)) {
      opacity: 0;
      transform: translateY(26px);
    }

    [data-reveal] {
      transition:
        opacity 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) var(--d, 0ms),
        transform 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) var(--d, 0ms);
    }

    .hero-img img {
      animation: settle 2.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
    }

    @keyframes settle {
      from {
        transform: scale(1.09);
      }
      to {
        transform: scale(1);
      }
    }

    .hero h1,
    .hero-foot,
    .eyebrow {
      animation: rise 1.2s cubic-bezier(0.2, 0.7, 0.2, 1) both;
    }

    .hero h1 {
      animation-delay: 0.15s;
    }

    .hero-foot {
      animation-delay: 0.4s;
    }

    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(24px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

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

    /* Photographs drift a little against the scroll in browsers that support view timelines. */
    @supports (animation-timeline: view()) {
      .proj-main img,
      .proj-aside img {
        height: 116%;
        animation: drift linear both;
        animation-timeline: view();
        animation-range: cover 0% cover 100%;
      }

      @keyframes drift {
        from {
          transform: translateY(-7%);
        }
        to {
          transform: translateY(0%);
        }
      }
    }
  }

  /* ── Responsive ─────────────────────────────────────── */
  @media (max-width: 1000px) {
    .studio-grid,
    .services-grid,
    .process-grid,
    .faq-grid,
    .principal-grid,
    .area-grid,
    .consult-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .sticky {
      position: static;
    }

    .proj,
    .proj.flip {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: none;
    }

    .proj-main,
    .proj-meta,
    .proj-aside,
    .proj.flip .proj-main,
    .proj.flip .proj-meta,
    .proj.flip .proj-aside {
      grid-column: 1;
      grid-row: auto;
    }

    .proj-aside {
      align-self: auto;
    }

    .craft-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .quote-grid,
    .features,
    .principles {
      grid-template-columns: minmax(0, 1fr);
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
      padding: 0.5rem clamp(1.25rem, 5vw, 3rem) 1.5rem;
      background: var(--gc-dark);
      color: var(--gc-paper);
      font-size: 0.9rem;
    }

    .nav.open {
      display: flex;
    }

    .nav a:not(.enq) {
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.16);
    }

    .nav .enq {
      margin-top: 1.2rem;
      text-align: center;
      background: var(--gc-paper);
      border-color: var(--gc-paper);
      color: var(--gc-ink);
    }

    .stats {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 640px) {
    .hero {
      padding: 7rem 0 3rem;
    }

    /* The type sits higher on a phone, over the brightest part of the picture. */
    .hero-img::after {
      background:
        linear-gradient(180deg, rgba(10, 9, 8, 0.55) 0%, rgba(10, 9, 8, 0) 22%),
        linear-gradient(0deg, rgba(10, 9, 8, 0.92) 0%, rgba(10, 9, 8, 0.72) 55%, rgba(10, 9, 8, 0.25) 85%);
    }

    .hero-foot {
      flex-direction: column;
      align-items: flex-start;
    }

    .field-row,
    .contract-grid,
    .footer-cols {
      grid-template-columns: minmax(0, 1fr);
    }

    .craft-grid li:nth-child(even) {
      margin-top: 0;
    }

    .svc {
      grid-template-columns: 2.2rem minmax(0, 1fr) auto;
    }

    .steps li {
      grid-template-columns: 3.4rem minmax(0, 1fr);
    }

    .step-n {
      font-size: 2.4rem;
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

    .contact li {
      grid-template-columns: 3.4rem minmax(0, 1fr);
    }
  }
</style>
