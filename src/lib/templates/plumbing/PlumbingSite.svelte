<script lang="ts">
  // Ported from Claude Design project "Octopus Plumbing Home.dc.html".
  // Palette: Deep Water & Safety Orange. Hero variant: A (split photo).
  // The design's JS width breakpoints (narrow < 900, fullNav >= 1150) are CSS
  // media queries here so the page renders correctly on the server.

  import { onMount } from 'svelte';
  import type { SitePhotos } from '$lib/templates/photos';
  import type { PlumbingContent } from './types';
  import { pipeRuns, type Rect } from './pipe';

  let { content, photos = {} }: { content: PlumbingContent; photos?: SitePhotos } = $props();

  const icons = {
    bolt: 'M7 2v11h3v9l7-12h-4l4-8z',
    drain: 'M12 2.7S5 10.3 5 15a7 7 0 0 0 14 0c0-4.7-7-12.3-7-12.3z',
    fire: 'M13.5.7s.7 2.6.7 4.8c0 2-1.3 3.7-3.4 3.7-2 0-3.5-1.7-3.5-3.7l.03-.4C5.3 7.6 4 10.6 4 14c0 4.4 3.6 8 8 8s8-3.6 8-8C20 8.6 17.4 3.8 13.5.7z',
    search:
      'M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 9.5 16a6.5 6.5 0 0 0 4.2-1.6l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z',
    pipe: 'M2 8h9v3h6V8h5v8h-5v-3h-6v3H2z',
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    wrench:
      'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
    filter:
      'M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A1 1 0 0 0 18.95 4H5.04a1 1 0 0 0-.79 1.61z',
    shield:
      'M12 1 3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4zm-2 16-4-4 1.4-1.4L10 14.2l6.6-6.6L18 9l-8 8z',
    star: 'M12 17.3 18.2 21l-1.6-7L22 9.2l-7.2-.6L12 2 9.2 8.6 2 9.2 7.5 14l-1.7 7z',
    tag: 'M21.4 11.6l-9-9C12.1 2.2 11.6 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .6.2 1.1.6 1.4l9 9c.4.4.9.6 1.4.6s1-.2 1.4-.6l7-7c.4-.4.6-.9.6-1.4s-.2-1-.6-1.4zM5.5 7C4.7 7 4 6.3 4 5.5S4.7 4 5.5 4 7 4.7 7 5.5 6.3 7 5.5 7z',
    check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z',
    phone:
      'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.5 5H11v6l5.2 3.2.8-1.3-4.5-2.7V7z',
    pin: 'M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
    warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
    burger: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'
  };

  type Service = {
    title: string;
    desc: string;
    price: string;
    icon: string;
    featured?: boolean;
  };

  const baseServices: Service[] = [
    {
      title: '24/7 Emergency',
      desc: 'Burst pipes, floods and backups. A plumber on the way in 60 minutes.',
      price: 'Call now',
      icon: icons.bolt,
      featured: true
    },
    {
      title: 'Drain Cleaning',
      desc: 'Slow or clogged drains cleared and camera-checked.',
      price: 'From $189',
      icon: icons.drain
    },
    {
      title: 'Water Heaters',
      desc: 'Same-day repair and replacement, tank or tankless.',
      price: 'From $1,895',
      icon: icons.fire
    },
    {
      title: 'Leak Detection',
      desc: 'Find hidden leaks without tearing out walls.',
      price: 'From $249',
      icon: icons.search
    },
    {
      title: 'Sewer Line',
      desc: 'Camera inspection, repair and trenchless replacement.',
      price: 'From $299',
      icon: icons.pipe
    },
    {
      title: 'Toilets & Fixtures',
      desc: 'Toilets, taps, sinks and showers installed right.',
      price: 'From $159',
      icon: icons.home
    },
    {
      title: 'Repiping',
      desc: 'Replace old poly-B or galvanized pipe in one visit.',
      price: 'Free estimate',
      icon: icons.wrench
    },
    {
      title: 'Water Filtration',
      desc: 'Cleaner, softer water from every tap.',
      price: 'Free estimate',
      icon: icons.filter
    }
  ];

  const services = $derived(
    baseServices.map((s) => ({ ...s, href: content.serviceHrefs[s.title] ?? '#book' }))
  );

  // Service filter chips. The grid is the full list until a visitor narrows it.
  const serviceCats: Record<string, string> = {
    '24/7 Emergency': 'Repairs',
    'Drain Cleaning': 'Repairs',
    'Leak Detection': 'Repairs',
    'Toilets & Fixtures': 'Repairs',
    'Water Heaters': 'Water heaters',
    'Sewer Line': 'Pipes',
    Repiping: 'Pipes',
    'Water Filtration': 'Water quality'
  };
  const serviceFilters = ['All', 'Repairs', 'Water heaters', 'Pipes', 'Water quality'];
  let serviceFilter = $state('All');
  const shownServices = $derived(
    serviceFilter === 'All' ? services : services.filter((s) => serviceCats[s.title] === serviceFilter)
  );

  const serviceNames = [...baseServices.map((s) => s.title), 'Something else'];

  const trust = $derived([
    { title: 'Licensed & Insured', sub: content.licenceShort ?? 'Fully insured', icon: icons.shield },
    ...(content.socialProof
      ? [
          {
            title: `${content.socialProof.ratingValue}★ on Google`,
            sub: `${content.socialProof.ratingCount} reviews`,
            icon: icons.star
          }
        ]
      : []),
    { title: 'Upfront Pricing', sub: 'You approve first', icon: icons.tag },
    {
      title: 'Locally Owned',
      sub: content.socialProof
        ? `${content.socialProof.yearsBadge} years in ${content.city}`
        : `Serving ${content.city}`,
      icon: icons.home
    },
    { title: 'Guaranteed', sub: '2-year written warranty', icon: icons.check }
  ]);

  const steps = [
    {
      n: 1,
      title: 'Call or book',
      body: 'A real person answers 24/7. Book online in a minute for planned work.'
    },
    {
      n: 2,
      title: 'Get an upfront price',
      body: 'Your plumber diagnoses the problem and gives you a flat price. You approve it before we start.'
    },
    {
      n: 3,
      title: 'Fixed right, guaranteed',
      body: 'We clean up, test everything, and back the work with a 2-year written guarantee.'
    }
  ];

  const diffs = [
    { t: 'On-time promise', b: 'Two-hour windows, and a text when we’re on the way.' },
    { t: 'No overtime surprises', b: 'Same flat price nights, weekends and holidays.' },
    { t: 'Background-checked techs', b: 'Every plumber is vetted, trained and certified.' },
    { t: 'Clean-home promise', b: 'Shoe covers, drop cloths and a tidy finish.' },
    { t: 'Stocked trucks', b: 'Most repairs done in one visit.' },
    { t: 'Written guarantee', b: '2 years on workmanship, in writing.' }
  ];

  const prices = [
    { job: 'Service call (waived with repair)', price: '$89' },
    { job: 'Drain cleaning', price: '$189–$349' },
    { job: 'Toilet repair', price: '$159–$289' },
    { job: 'Leak detection', price: '$249–$449' },
    { job: 'Sewer camera inspection', price: '$299' },
    { job: 'Water heater install', price: 'From $1,895' }
  ];

  const promises = [
    { t: 'Upfront price', b: 'The price we quote is the price you pay.' },
    {
      t: 'Same-day service',
      b: 'Call before noon and we’re there today, or the service call is free.'
    },
    { t: '2-year workmanship guarantee', b: 'If our work fails, we fix it at no cost.' },
    { t: '100% satisfaction', b: 'Not happy? We make it right.' }
  ];

  const reviews = $derived([
    {
      tag: 'Emergency',
      q: 'Pipe burst under the sink at 11 p.m. Someone answered on the second ring and a plumber was here in 40 minutes. Fair price, explained before he started.',
      name: 'Priya S.'
    },
    {
      tag: 'Water heater',
      q: `Got three quotes. ${content.brandLead} was the only one who itemized everything, and they had our new tank in the same day.`,
      name: 'Mark T.'
    },
    {
      tag: 'Drain cleaning',
      q: 'Showed me the camera footage of the clog, cleared it, and left the bathroom cleaner than he found it.',
      name: 'Jenny L.'
    }
  ]);

  const insuranceSentence = $derived(
    content.insuranceClaim ? ` and ${content.insuranceClaim}` : '.'
  );

  const faqs = $derived([
    {
      q: 'Are you licensed and insured?',
      a: `Yes. ${content.companyName} ${content.licenceFaqClause}${insuranceSentence} Every plumber is background-checked.`
    },
    {
      q: 'How much will it cost?',
      a: 'Most repairs fall in the ranges shown above. Our service call is $89 and is waived when you go ahead with the repair. You get a flat price and approve it before any work starts.'
    },
    {
      q: 'Do you offer same-day and emergency service?',
      a: 'Yes. We answer 24/7 and usually arrive within 60 minutes for emergencies. Call before noon and we guarantee same-day service.'
    },
    {
      q: 'What does your guarantee cover?',
      a: 'All workmanship is guaranteed for 2 years in writing. If something we fixed fails, we come back and fix it at no cost.'
    },
    {
      q: 'Do you offer financing?',
      a: `Yes, through ${content.financingProvider}, from $79/month on approved credit for larger jobs like water heaters, repipes and sewer lines.`
    },
    {
      q: 'What areas do you serve?',
      a: content.faqAreasAnswer
    }
  ]);

  const urgencyOptions = ['Today', 'This week', 'Flexible'];

  const emptyForm = { name: '', phone: '', zip: '', service: '', urgency: 'Today', details: '' };

  type Errors = { name?: boolean; phone?: boolean; zip?: boolean; service?: boolean };

  // "Turn the valve" situations: each one re-words the hero and the do-this-now steps, and
  // pre-fills the booking form. General guidance only; the plumber confirms on site.
  const situations = $derived([
    {
      label: 'Burst pipe or flooding',
      service: '24/7 Emergency',
      urgency: 'Today',
      h1: `Burst pipe or flooding in ${content.city}? Call a plumber now.`,
      lead: 'Shut off the water if you can and call us. We answer 24/7 and come now.',
      tipsTitle: 'Do this now',
      tips: [
        'Turn off the main water valve, usually near the meter or where the line enters the house.',
        'Move valuables and electronics away from the water.',
        'Call us. Take photos for insurance if it’s safe.'
      ],
      cta: `Call ${content.phoneDisplay} now`,
      href: content.phoneHref
    },
    {
      label: 'Clogged drain',
      service: 'Drain Cleaning',
      urgency: 'Today',
      h1: `Clogged drain in ${content.city}? Get it flowing again.`,
      lead: 'Slow or backed-up drains cleared and camera-checked, with the price set before we start.',
      tipsTitle: 'Before you call',
      tips: [
        'Stop running water and skip the chemical cleaners.',
        'Note which drains are slow or gurgling.',
        'Book online or call. We camera-check if needed.'
      ],
      cta: 'Book a plumber',
      href: '#book'
    },
    {
      label: 'No hot water',
      service: 'Water Heaters',
      urgency: 'Today',
      h1: `No hot water in ${content.city}? Let’s get the heat back.`,
      lead: 'Repair or replace, tank or tankless, with a flat price you approve first.',
      tipsTitle: 'What helps',
      tips: [
        'Check that the pilot light or breaker is on.',
        'Note the tank’s age and any water around it.',
        'Don’t force a stuck valve. Call us.'
      ],
      cta: 'Book a plumber',
      href: '#book'
    },
    {
      label: 'Hidden leak or high bill',
      service: 'Leak Detection',
      urgency: 'This week',
      h1: `Hidden leak or a high water bill in ${content.city}? Find it without tearing out walls.`,
      lead: 'We locate leaks with the right tools first, so you only open what you need to.',
      tipsTitle: 'What to check',
      tips: [
        'Does your water meter move with everything off?',
        'Look for damp spots, stains or musty smells.',
        'Book a leak check. No demolition to find it.'
      ],
      cta: 'Book a plumber',
      href: '#book'
    },
    {
      label: 'Old pipes or a remodel',
      service: 'Repiping',
      urgency: 'Flexible',
      h1: `Old pipes or a remodel in ${content.city}? Get a clear plan and price.`,
      lead: 'Replace aging poly-B or galvanized pipe, or plan new fixtures, with a written estimate.',
      tipsTitle: 'What helps',
      tips: [
        'Note discoloured water or low pressure.',
        'Take a photo of any exposed pipe.',
        'Get a free written estimate. No pressure.'
      ],
      cta: 'Book a plumber',
      href: '#book'
    }
  ]);

  // null = nothing picked yet, so the page shows the prospect's own headline and lead.
  let sit = $state<number | null>(null);
  const current = $derived(sit === null ? null : situations[sit]);
  const heroTitle = $derived(current ? current.h1 : content.heroHeadline);
  const heroLead = $derived(current ? current.lead : content.heroLead);
  const cardTipsTitle = $derived(current ? current.tipsTitle : 'Not sure where to start?');
  const cardTips = $derived(
    current
      ? current.tips
      : [
          'Pick what fits above and we’ll tailor the next steps.',
          'Emergency? Call, don’t fill out a form.',
          'Everything else: a flat price you approve first.'
        ]
  );
  const cardCta = $derived(current ? current.cta : `Call ${content.phoneDisplay} — 24/7`);
  const cardHref = $derived(current ? current.href : content.phoneHref);

  // Time-aware badge. Empty on the server, filled on mount, so there is no hydration mismatch.
  let now = $state<Date | null>(null);
  const nowLabel = $derived(
    now ? now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''
  );
  const liveLine = $derived.by(() => {
    if (!now) return 'A real person picks up.';
    const h = now.getHours();
    const d = now.getDay();
    if (h >= 21 || h < 6) return 'Pipe burst at night? Call anyway.';
    if (d === 0 || d === 6) return 'Weekends too.';
    return 'No hold music.';
  });

  // A PVC run that swerves across the page. It is measured against the content blocks, so it
  // ends in a wall sleeve wherever it would cross text and re-emerges in the gaps between sections.
  let root: HTMLElement | undefined = $state();
  let pageSize = $state({ w: 0, h: 0 });
  let blocks = $state<Rect[]>([]);
  const pipe = $derived(pipeRuns(pageSize.w, pageSize.h, blocks));

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
  let form = $state({ ...emptyForm });
  let errs = $state<Errors>({});
  let tried = $state(false);
  let submitted = $state(false);

  const scrolled = $derived(scrollY > 8);
  const firstName = $derived(form.name.trim().split(' ')[0]);
  const hasErrors = $derived(Object.values(errs).some(Boolean));
  const formStatus = $derived(
    tried && hasErrors
      ? 'Please fix the highlighted fields.'
      : 'Licensed & insured · You approve the price first'
  );

  const postalPattern = $derived.by(() => {
    try {
      return new RegExp(content.postal.pattern);
    } catch {
      return /\S/; // a malformed pattern must not break the form
    }
  });

  function validate(f: typeof emptyForm): Errors {
    return {
      name: !f.name.trim(),
      phone: f.phone.replace(/\D/g, '').length < 10,
      zip: !postalPattern.test(f.zip.trim()),
      service: !f.service
    };
  }

  // Picking a situation also pre-fills the booking form, so the choice carries through.
  function pick(i: number) {
    sit = i;
    form.service = situations[i].service;
    form.urgency = situations[i].urgency;
    if (tried) errs = validate(form);
  }

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
    href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<svelte:window bind:scrollY />

{#snippet ripple(fill: string)}
  <svg class="ac" aria-hidden="true" viewBox="0 0 1440 48" preserveAspectRatio="none">
    <path
      d="M0,24 C120,-6 240,54 360,24 S600,-6 720,24 S960,54 1080,24 S1320,-6 1440,24 L1440,48 L0,48Z"
      {fill}
    />
    <path
      class="ac-trace"
      d="M0,24 C120,-6 240,54 360,24 S600,-6 720,24 S960,54 1080,24 S1320,-6 1440,24"
    />
  </svg>
{/snippet}

<div class="op-root" bind:this={root}>
  {#if pipe}
    <svg class="pipe" aria-hidden="true" width={pageSize.w} height={pageSize.h} viewBox="0 0 {pageSize.w} {pageSize.h}">
      {#each pipe.runs as run, i (i)}
        <path d={run.d} class="pipe-edge" />
        <path d={run.d} class="pipe-body" />
        <path d={run.d} class="pipe-stripe" />
        <path d={run.d} class="pipe-flow" pathLength="1000" />
        {#each run.joints as j (j.x + ',' + j.y)}
          <g transform="translate({j.x} {j.y}) rotate({j.angle})">
            <rect x="-6" y="-13" width="12" height="26" rx="2.5" class="pipe-collar" />
            <rect x="-1" y="-13" width="2" height="26" class="pipe-collar-line" />
          </g>
        {/each}
        {#if run.node}
          <!-- Fittings alternate between a gate valve and a pressure gauge, as on a real run. -->
          <g transform="translate({run.node.x} {run.node.y})">
            <g transform="rotate({run.node.angle})">
              <rect x="-16" y="-13" width="9" height="26" rx="2.5" class="pipe-collar" />
              <rect x="7" y="-13" width="9" height="26" rx="2.5" class="pipe-collar" />
              <rect x="-8" y="-11" width="16" height="22" rx="3" class="pipe-body-fitting" />
            </g>
            {#if i % 2 === 0}
              <line x1="0" y1="-10" x2="0" y2="-22" class="pipe-stem" />
              <ellipse cx="0" cy="-25" rx="12" ry="4.5" class="pipe-wheel" />
              <rect x="-2.5" y="-30" width="5" height="9" rx="2" class="pipe-wheel" />
            {:else}
              <line x1="0" y1="-10" x2="0" y2="-19" class="pipe-stem" />
              <circle cx="0" cy="-30" r="12" class="pipe-gauge" />
              <path d="M0 -30 L5 -35" class="pipe-needle" />
            {/if}
          </g>
        {/if}
      {/each}
      {#each pipe.caps as cap, i (i)}
        <g transform="translate({cap.x} {cap.y}) rotate({cap.angle})">
          <rect x="-12" y="-13" width="12" height="26" rx="3" class="pipe-collar" />
          <rect x="-4" y="-16" width="7" height="32" rx="2" class="pipe-flange" />
        </g>
      {/each}
    </svg>
  {/if}

  <a href="#main" class="skip">Skip to content</a>

  <div class="utility">
    <div class="utility-inner">
      <span class="utility-live"><span class="dot" aria-hidden="true"></span>Open 24/7 · answered by
        a real person</span>
      <span class="utility-wide">{content.licenceLine}</span>
      <span class="utility-wide">{content.servingLine}</span>
    </div>
  </div>

  <header class="header" class:scrolled>
    <div class="header-inner">
      <a href="#top" class="brand">
        <span class="brand-mark" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"
            ><path d={icons.drain} /></svg
          >
        </span>
        <span class="brand-name"
          >{content.brandLead}{#if content.brandTail}<span class="brand-sub">{content.brandTail}</span
            >{/if}</span
        >
      </a>

      <nav class="main-nav" aria-label="Main">
        <a href="#services">Services</a>
        <a href="#pricing">Pricing</a>
        <a href="#reviews">Reviews</a>
        <a href="#area">Service Area</a>
        <a href="#faq">FAQ</a>
      </nav>

      <a href={content.phoneHref} class="header-phone">
        <span class="header-phone-label">24/7 Emergency</span>
        <span class="header-phone-number">{content.phoneDisplay}</span>
      </a>
      <a href="#book" class="btn-accent header-book">Book Service</a>

      <a href={content.phoneHref} class="header-call" aria-label="Call {content.companyName}">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
          ><path d={icons.phone} /></svg
        >
      </a>

      <button
        type="button"
        class="burger"
        aria-label="Menu"
        aria-expanded={menuOpen}
        onclick={() => (menuOpen = !menuOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
          ><path d={icons.burger} /></svg
        >
      </button>
    </div>

    {#if menuOpen}
      <nav class="mobile-nav" aria-label="Mobile">
        <a href="#services" onclick={() => (menuOpen = false)}>Services</a>
        <a href="#pricing" onclick={() => (menuOpen = false)}>Pricing</a>
        <a href="#reviews" onclick={() => (menuOpen = false)}>Reviews</a>
        <a href="#area" onclick={() => (menuOpen = false)}>Service Area</a>
        <a href="#faq" onclick={() => (menuOpen = false)}>FAQ</a>
      </nav>
    {/if}
  </header>

  <main id="main">
    <span id="top"></span>

    <section class="hero">
      <svg class="rings" aria-hidden="true" viewBox="0 0 400 400" fill="none">
        <circle cx="200" cy="200" r="190" stroke="#cfe0f0" stroke-width="2.5" />
        <circle cx="200" cy="200" r="150" stroke="#cfe0f0" stroke-width="2.5" />
        <circle cx="200" cy="200" r="110" stroke="#9cc6ea" stroke-width="2.5" />
        <circle cx="200" cy="200" r="70" stroke="#9cc6ea" stroke-width="2.5" />
        <path d="M332 62s-12 15-12 24a12 12 0 0 0 24 0c0-9-12-24-12-24z" fill="#0b4f8a" fill-opacity="0.35" />
      </svg>
      <div class="hero-inner">
        <div>
          <span class="pill"
            ><span class="pill-dot" aria-hidden="true"></span>{content.availabilityPill}</span
          >
          <h1>{heroTitle}</h1>
          <p class="hero-lead">{heroLead}</p>
          <ul class="checklist">
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons.check} /></svg>
              24/7 response, on-site in 60 minutes or less
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons.check} /></svg>
              Licensed, insured and background-checked plumbers
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons.check} /></svg>
              2-year written guarantee on every repair
            </li>
          </ul>
          <div class="hero-ctas">
            <a href={content.phoneHref} class="btn-accent btn-lg btn-raised">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                ><path d={icons.phone} /></svg
              >
              Call {content.phoneDisplay}
            </a>
            <a href="#book" class="btn-outline btn-lg">Request Service</a>
          </div>
          {#if content.socialProof}
            <div class="rating">
              <span class="stars" aria-hidden="true">
                {#each [0, 1, 2, 3, 4] as star (star)}
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d={icons.star} /></svg>
                {/each}
              </span>
              <span
                ><strong>{content.socialProof.ratingValue}/5</strong> from {content.socialProof
                  .ratingCount} Google reviews</span
              >
            </div>
          {/if}
        </div>

        <div class="hero-media">
          <div class="scard">
            <p class="scard-eyebrow">What’s going on? Turn the valve.</p>
            <div class="valves" role="group" aria-label="Your situation">
              {#each situations as s, i (s.label)}
                <button type="button" class="vlv" class:on={sit === i} aria-pressed={sit === i} onclick={() => pick(i)}>
                  <span class="vlv-wheel" aria-hidden="true"><span class="vlv-bar"></span></span>
                  <span>{s.label}</span>
                </button>
              {/each}
            </div>
            <div class="scard-tips">
              <p class="scard-tips-title">{cardTipsTitle}</p>
              {#each cardTips as t, i (t)}
                <div class="scard-tip"><span class="scard-num">{i + 1}</span><span>{t}</span></div>
              {/each}
            </div>
            <a href={cardHref} class="btn-accent btn-lg scard-cta">{cardCta}</a>
            <p class="scard-note">General guidance. If water is near electrical, stay clear and call us.</p>
          </div>
          <div class="float-card float-card-live">
            <span class="float-icon float-icon-green" aria-hidden="true"><span class="live-dot"></span></span>
            <span class="float-text">
              <strong>Answering now{nowLabel ? ` · ${nowLabel}` : ''}</strong>
              <span>{liveLine}</span>
            </span>
          </div>
          <div class="float-card float-card-left">
            <span class="float-icon float-icon-green" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#15803D"
                ><path d={icons.shield} /></svg
              >
            </span>
            <span class="float-text">
              <strong>Licensed &amp; Insured</strong>
              {#if content.licenceShort}<span>{content.licenceShort}</span>{/if}
            </span>
          </div>
          <div class="float-card float-card-right">
            <span class="float-icon float-icon-blue" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--op-primary)"
                ><path d={icons.clock} /></svg
              >
            </span>
            <span class="float-text">
              <strong>On-site in 60 min</strong>
              <span>Day or night</span>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="trust" aria-label="Why homeowners trust us">
      {@render ripple('#0a1f33')}
      <div class="trust-inner">
        {#each trust as t (t.title)}
          <div class="trust-item">
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"
              ><path d={t.icon} /></svg
            >
            <span class="trust-text">
              <strong>{t.title}</strong>
              <span>{t.sub}</span>
            </span>
          </div>
        {/each}
      </div>
    </section>

    <div class="alert-strip">
      <div class="alert-inner">
        <p>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"
            ><path d={icons.warning} /></svg
          >
          <span>
            <strong>Burst pipe or major leak?</strong> Shut off your main water valve, then call us.
            We’ll talk you through it.
          </span>
        </p>
        <a href={content.phoneHref} class="btn-accent">Emergency Line</a>
      </div>
    </div>

    <section id="services" class="section">
      <div class="container">
        <div class="sec-head-split">
          <div>
            <p class="eyebrow">Our services</p>
            <h2>Every plumbing job, one crew you can trust</h2>
            <p class="sec-lead">
              Starting prices are shown so you know where you stand. Your final price is quoted and
              approved before work begins.
            </p>
          </div>
          <a href={content.phoneHref} class="text-link"
            >Not sure what you need? Call {content.phoneDisplay}</a
          >
        </div>

        <div class="valves service-filters" role="group" aria-label="Filter services">
          {#each serviceFilters as f (f)}
            <button type="button" class="vlv" class:on={serviceFilter === f} aria-pressed={serviceFilter === f} onclick={() => (serviceFilter = f)}>
              <span class="vlv-wheel" aria-hidden="true"><span class="vlv-bar"></span></span>
              <span>{f}</span>
            </button>
          {/each}
        </div>

        <div class="service-grid">
          {#each shownServices as s (s.title)}
            <a href={s.href} class="service-card" class:featured={s.featured}>
              <span class="service-icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24"><path d={s.icon} /></svg>
              </span>
              <span class="service-title">{s.title}</span>
              <span class="service-desc">{s.desc}</span>
              <span class="service-foot">
                <span>{s.price}</span>
                <span aria-hidden="true">→</span>
              </span>
            </a>
          {/each}
        </div>

        <div class="service-list">
          {#each shownServices as s (s.title)}
            <a href={s.href} class="service-row" class:featured={s.featured}>
              <span class="service-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24"><path d={s.icon} /></svg>
              </span>
              <span class="service-row-title">{s.title}</span>
              <span class="service-row-price">{s.price}</span>
            </a>
          {/each}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      {@render ripple('#f4f7fb')}
      <div class="container">
        <p class="eyebrow centered">How it works</p>
        <h2 class="centered steps-head">Three steps. No surprises.</h2>
        <ol class="steps">
          {#each steps as st (st.n)}
            <li>
              <span class="step-n">{st.n}</span>
              <h3>{st.title}</h3>
              <p>{st.body}</p>
            </li>
          {/each}
        </ol>
      </div>
    </section>

    <section class="section">
      <div class="container why-inner">
        <div class="why-media">
          <div class="photo-slot why-photo" aria-hidden={photos.team || content.photoCaptions ? undefined : 'true'}
            class:bare={!content.photoCaptions && !photos.team} class:filled={!!photos.team}>
            {#if photos.team}<img src={photos.team.src} alt={photos.team.alt} loading="lazy" decoding="async" />{:else if content.photoCaptions}<span>{content.photoCaptions.team}</span>{/if}
          </div>
          {#if content.socialProof}
            <div class="years-badge">
              <span class="years-n">{content.socialProof.yearsBadge}</span>
              <span>years in {content.city}</span>
            </div>
          {/if}
        </div>
        <div>
          <p class="eyebrow">Why {content.brandLead}</p>
          <h2>A local crew that shows up and owns the job</h2>
          <p class="sec-lead why-lead">{content.whyLead}</p>
          <ul class="diffs">
            {#each diffs as d (d.t)}
              <li>
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                  ><path d={icons.check} /></svg
                >
                <span>
                  <strong>{d.t}</strong>
                  <span>{d.b}</span>
                </span>
              </li>
            {/each}
          </ul>
          {#if content.socialProof}
            <dl class="stats">
              <div>
                <dt>Jobs completed</dt>
                <dd>{content.socialProof.jobsCompleted}</dd>
              </div>
              <div>
                <dt>Average arrival</dt>
                <dd>{content.socialProof.averageArrival}</dd>
              </div>
              <div>
                <dt>Google rating</dt>
                <dd>{content.socialProof.ratingValue}★</dd>
              </div>
            </dl>
          {/if}
        </div>
      </div>
    </section>

    <section id="pricing" class="section section-dark">
      {@render ripple('#0a1f33')}
      <div class="container">
        <p class="eyebrow eyebrow-gold">Pricing, financing &amp; guarantee</p>
        <h2 class="pricing-head">The price we quote is the price you pay</h2>
        <div class="pricing-grid">
          <div class="card">
            <h3>Typical job prices</h3>
            <table class="price-table">
              <tbody>
                {#each prices as pr (pr.job)}
                  <tr>
                    <th scope="row">{pr.job}</th>
                    <td>{pr.price}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
            <p class="fine">
              {content.currencyNote} Every home is different, so your plumber confirms the exact
              price on-site and you approve it before any work starts.
            </p>
          </div>

          <div class="card">
            <h3>Financing</h3>
            <p class="card-sub">For water heaters, repipes and sewer lines</p>
            <p class="price-big">$79<span>/mo</span></p>
            <p class="card-body">
              As low as $79/month through {content.financingProvider}. Apply in minutes, get a decision on the spot.
            </p>
            <a href="#book" class="btn-primary btn-block">Check my options</a>
            <p class="fine">
              On approved credit. Terms and rates vary. Example based on a $3,500 project over 60
              months.
            </p>
          </div>

          <div class="card card-highlight">
            <h3>The {content.companyName} Promise</h3>
            <p class="card-sub">Four guarantees. In writing.</p>
            <ul class="promises">
              {#each promises as g (g.t)}
                <li>
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                    ><path d={icons.shield} /></svg
                  >
                  <span>
                    <strong>{g.t}</strong>
                    <span>{g.b}</span>
                  </span>
                </li>
              {/each}
            </ul>
            <a href={content.phoneHref} class="btn-accent btn-block">Call {content.phoneDisplay}</a>
          </div>
        </div>
      </div>
    </section>

    <section id="reviews" class="section">
      <div class="container">
        <div class="reviews-head">
          <div>
            <p class="eyebrow">Reviews</p>
            <h2>What {content.city} says about us</h2>
          </div>
          {#if content.socialProof}
            <div class="score">
              <span class="score-n">{content.socialProof.ratingValue}</span>
              <span class="score-meta">
                <span class="score-stars" aria-hidden="true">★★★★★</span>
                <span
                  >{content.socialProof.ratingCount} Google reviews ·
                  <a href="#reviews" class="text-link">Read them all</a></span
                >
              </span>
            </div>
          {/if}
        </div>
        <div class="review-grid">
          {#each reviews as r, i (r.name)}
            <figure class="review">
              <div class="review-top">
                <span class="review-stars" aria-label="5 stars">★★★★★</span>
                <span class="review-tag">{r.tag}</span>
              </div>
              <blockquote>“{r.q}”</blockquote>
              <figcaption><strong>{r.name}</strong><span> · {content.reviewTowns[i]}</span></figcaption>
            </figure>
          {/each}
        </div>
      </div>
    </section>

    <section id="area" class="section section-alt">
      {@render ripple('#f4f7fb')}
      <div class="container area-inner">
        <div>
          <p class="eyebrow">Service area</p>
          <h2>{content.serviceAreaHeading}</h2>
          <p class="sec-lead area-lead">{content.serviceAreaIntro}</p>
          {#if content.towns.length > 0}
            <ul class="towns">
              {#each content.towns as tw (tw)}
                <li>
                  <a href="#area">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"
                      ><path d={icons.pin} /></svg
                    >{tw}
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
          <p class="area-foot">
            Not sure if we cover you? <a href={content.phoneHref} class="text-link">Call {content.phoneDisplay}</a>
          </p>
        </div>
        <div class="photo-slot map-photo" aria-hidden={photos.map || content.photoCaptions ? undefined : 'true'}
            class:bare={!content.photoCaptions && !photos.map} class:filled={!!photos.map}>
          {#if photos.map}<img src={photos.map.src} alt={photos.map.alt} loading="lazy" decoding="async" />{:else if content.photoCaptions}<span>{content.photoCaptions.map}</span>{/if}
        </div>
      </div>
    </section>

    <section id="faq" class="section">
      <div class="container-narrow">
        <p class="eyebrow centered">FAQ</p>
        <h2 class="centered faq-head">Common questions</h2>
        <div class="faqs">
          {#each faqs as f (f.q)}
            <details>
              <summary>
                {f.q}
                <span class="faq-plus" aria-hidden="true">+</span>
              </summary>
              <p>{f.a}</p>
            </details>
          {/each}
        </div>
      </div>
    </section>

    <section id="book" class="section section-dark">
      {@render ripple('#0a1f33')}
      <div class="container book-inner">
        <div>
          <p class="eyebrow eyebrow-gold">Book service</p>
          <h2>Get a free quote or book a visit</h2>
          <p class="book-lead">
            Tell us what’s going on. A real person replies within 15 minutes during business hours.
          </p>
          <a href={content.phoneHref} class="book-phone">{content.phoneDisplay}</a>
          <p class="book-hours">Open 24 hours, 7 days a week</p>
          {#if content.email}
            <p class="book-email">
              <a href="mailto:{content.email}">{content.email}</a>
            </p>
          {/if}
          <ul class="book-checks">
            <li>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.check} /></svg
              >{content.bookingLicenceLine}
            </li>
            <li>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.check} /></svg
              >Price approved before work starts
            </li>
            {#if content.socialProof}
            <li>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                ><path d={icons.check} /></svg
              >{content.socialProof.ratingValue}★ from {content.socialProof.ratingCount} Google reviews
            </li>
          {/if}
          </ul>
          <p class="book-note">Emergency? Please call. It’s faster.</p>
        </div>

        <form class="book-form" onsubmit={handleSubmit} novalidate>
          {#if submitted}
            <div class="thanks" role="status">
              <span class="thanks-icon" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="#15803D"
                  ><path d={icons.check} /></svg
                >
              </span>
              <p class="thanks-head">Thanks, {firstName}. Request received.</p>
              <p class="thanks-body">
                We’ll call you at {form.phone} shortly. If water is actively leaking, call us now.
              </p>
              <a href={content.phoneHref} class="btn-accent">Call {content.phoneDisplay}</a>
              <p class="thanks-again">
                <button type="button" onclick={resetForm}>Send another request</button>
              </p>
            </div>
          {:else}
            <div class="field-grid">
              <label class="field">
                Name
                <input
                  name="name"
                  autocomplete="name"
                  bind:value={form.name}
                  oninput={revalidate}
                  class:invalid={errs.name}
                  aria-invalid={errs.name ? 'true' : undefined}
                />
                {#if errs.name}<span class="field-error">Please enter your name.</span>{/if}
              </label>

              <label class="field">
                Phone
                <input
                  name="phone"
                  type="tel"
                  autocomplete="tel"
                  inputmode="tel"
                  bind:value={form.phone}
                  oninput={revalidate}
                  class:invalid={errs.phone}
                  aria-invalid={errs.phone ? 'true' : undefined}
                />
                {#if errs.phone}<span class="field-error">Enter a 10-digit phone number.</span>{/if}
              </label>

              <label class="field">
                {content.postal.label}
                <input
                  name="postal"
                  autocomplete="postal-code"
                  class="upper"
                  bind:value={form.zip}
                  oninput={revalidate}
                  class:invalid={errs.zip}
                  aria-invalid={errs.zip ? 'true' : undefined}
                />
                {#if errs.zip}<span class="field-error">{content.postal.hint}</span>{/if}
              </label>

              <label class="field">
                Service
                <select
                  name="service"
                  bind:value={form.service}
                  onchange={revalidate}
                  class:invalid={errs.service}
                  aria-invalid={errs.service ? 'true' : undefined}
                >
                  <option value="">Choose a service</option>
                  {#each serviceNames as sn (sn)}
                    <option value={sn}>{sn}</option>
                  {/each}
                </select>
                {#if errs.service}<span class="field-error">Pick the closest match.</span>{/if}
              </label>
            </div>

            <fieldset class="urgency">
              <legend>How soon do you need us?</legend>
              <div class="urgency-pills">
                {#each urgencyOptions as u (u)}
                  <label class="urgency-pill" class:active={form.urgency === u}>
                    <input type="radio" name="urgency" value={u} bind:group={form.urgency} />
                    {u}
                  </label>
                {/each}
              </div>
            </fieldset>

            <label class="field field-details">
              Details <span class="field-optional">Optional</span>
              <textarea
                name="details"
                rows="3"
                bind:value={form.details}
                placeholder="e.g. Kitchen sink is draining slowly"
              ></textarea>
            </label>

            <input
              type="text"
              name="company"
              tabindex="-1"
              autocomplete="off"
              aria-hidden="true"
              class="honeypot"
            />

            <button type="submit" class="btn-accent btn-block btn-submit">Request Service</button>
            <p class="form-status" aria-live="polite">{formStatus}</p>
          {/if}
        </form>
      </div>
    </section>

    <section class="cta-band">
      <div class="container cta-inner">
        <div>
          <h2>Plumbing problem? We’re ready now.</h2>
          <p>Licensed &amp; insured · 2-year written guarantee · Price approved first</p>
        </div>
        <div class="cta-buttons">
          <a href={content.phoneHref} class="btn-accent btn-lg">Call {content.phoneDisplay}</a>
          <a href="#book" class="btn-white btn-lg">Book Online</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer-inner">
      <div>
        <div class="footer-brand">
          <span class="brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"
              ><path d={icons.drain} /></svg
            >
          </span>
          <span>{content.companyName}</span>
        </div>
        <p>{content.foundedLine}</p>
        <a href={content.phoneHref} class="footer-phone">{content.phoneDisplay}</a>
        <div class="footer-social">
          <a href="#top">Google</a>
          <a href="#top">Facebook</a>
        </div>
      </div>

      <nav aria-label="Services">
        <p class="footer-head">Services</p>
        <ul>
          {#each services as s (s.title)}
            <li><a href={s.href}>{s.title}</a></li>
          {/each}
        </ul>
      </nav>

      {#if content.towns.length > 0}
        <nav aria-label="Areas">
          <p class="footer-head">Areas we serve</p>
          <ul>
            {#each content.towns as tw (tw)}
              <li><a href="#area">{tw}</a></li>
            {/each}
          </ul>
        </nav>
      {/if}

      <div>
        <p class="footer-head">Contact</p>
        <address>
          {#if content.address}{#each content.address as line (line)}{line}<br />{/each}{/if}
          <a href={content.phoneHref}>{content.phoneDisplay}</a>{#if content.email}<br />
            <a href="mailto:{content.email}">{content.email}</a>{/if}
        </address>
        <p class="footer-hours">Open 24 hours, 7 days a week</p>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <span>{content.copyrightLine}</span>
        <span>{content.footerLicenceLine}</span>
      </div>
    </div>
    <div class="footer-spacer" aria-hidden="true"></div>
  </footer>

  <div class="mobile-bar">
    <a href={content.phoneHref} class="mobile-bar-call">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
        ><path d={icons.phone} /></svg
      >Call Now 24/7
    </a>
    <a href="#book" class="mobile-bar-book">Book</a>
  </div>
</div>

<style>
  /* ---- scoped reset: app.css sets cursor:none, serif stack and link colours ---- */
  .op-root {
    --op-water: #38a1e8;
    --op-primary: #0b4f8a;
    --op-dark: #0a1f33;
    --op-accent: #cf4a0e;
    --op-on-accent: #ffffff;
    --op-bg-alt: #f4f7fb;
    --op-ink: #0f1e2e;
    --op-muted: #475569;
    --op-line: #e3e9f0;
    --op-line-strong: #d5dee8;
    --op-field: #cbd5e1;
    --op-green: #15803d;
    --op-gold: #f5a524;
    --op-danger: #b91c1c;

    position: relative;
    overflow-x: clip;
    cursor: auto;
    background: #fff;
    color: var(--op-ink);
    font-family: Inter, system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.6;
  }

  .op-root :global(*) {
    cursor: inherit;
  }

  .op-root a,
  .op-root button,
  .op-root summary {
    cursor: pointer;
  }

  .op-root input,
  .op-root textarea {
    cursor: text;
  }

  .op-root select {
    cursor: pointer;
  }

  .op-root :global(:focus-visible) {
    outline: 3px solid var(--op-gold);
    outline-offset: 2px;
  }

  .op-root h1,
  .op-root h2,
  .op-root h3 {
    font-family: Archivo, sans-serif;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--op-dark);
  }

  /* :where() keeps this at the specificity of a reset, so the component rules
     below (.btn-accent, .footer-phone, .mobile-bar-book, …) win on source order.
     Without it Svelte compiles this to `.op-root.svelte-x a:where(.svelte-x)`,
     which outranks every single-class colour rule and repaints them brand blue. */
  .op-root :where(a) {
    color: var(--op-primary);
    text-decoration: none;
  }

  .skip {
    position: absolute;
    left: -9999px;
    top: 8px;
    background: #fff;
    color: var(--op-ink);
    padding: 8px 16px;
    border-radius: 8px;
    z-index: 100;
  }

  .skip:focus {
    left: 8px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 32px);
  }

  .container-narrow {
    max-width: 820px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 32px);
  }

  .section {
    position: relative;
    padding: clamp(56px, 8vw, 96px) 0;
  }

  .section-alt {
    background: var(--op-bg-alt);
  }

  .section-dark {
    background: var(--op-dark);
    color: #fff;
  }

  .section-dark h2 {
    color: #fff;
  }

  /* ---- buttons ---- */
  .btn-accent,
  .btn-primary,
  .btn-outline,
  .btn-white {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-weight: 700;
    font-size: 15px;
    padding: 12px 22px;
    border-radius: 999px;
    border: 0;
    font-family: inherit;
    white-space: nowrap;
    text-decoration: none;
    transition: filter 0.2s, background 0.2s, color 0.2s;
  }

  .btn-lg {
    font-size: 17px;
    padding: 16px 28px;
  }

  .btn-block {
    display: flex;
    width: 100%;
  }

  .btn-raised {
    box-shadow: 0 6px 16px rgba(10, 31, 51, 0.18);
  }

  .btn-accent {
    background: var(--op-accent);
    color: var(--op-on-accent);
  }

  .btn-accent:hover {
    filter: brightness(0.92);
    color: var(--op-on-accent);
  }

  .btn-primary {
    background: var(--op-primary);
    color: #fff;
  }

  .btn-primary:hover {
    filter: brightness(1.1);
    color: #fff;
  }

  .btn-outline {
    background: #fff;
    color: var(--op-primary);
    border: 2px solid var(--op-primary);
  }

  .btn-outline:hover {
    background: var(--op-primary);
    color: #fff;
  }

  .btn-white {
    background: #fff;
    color: var(--op-primary);
  }

  .btn-white:hover {
    background: var(--op-bg-alt);
    color: var(--op-primary);
  }

  .text-link {
    font-weight: 700;
  }

  .text-link:hover {
    color: var(--op-dark);
  }

  /* ---- utility bar ---- */
  .utility {
    background: var(--op-dark);
    color: rgba(255, 255, 255, 0.88);
    font-size: 14px;
  }

  .utility-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 8px clamp(16px, 4vw, 32px);
    display: flex;
    flex-wrap: wrap;
    gap: 8px 28px;
    justify-content: space-between;
  }

  .utility-live {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.25);
    flex: none;
  }

  /* ---- header ---- */
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: #fff;
    box-shadow: 0 1px 0 var(--op-line);
    transition: box-shadow 0.2s;
  }

  .header.scrolled {
    box-shadow: 0 4px 16px rgba(10, 31, 51, 0.1);
  }

  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 32px);
    height: 76px;
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--op-dark);
    margin-right: auto;
  }

  .brand-mark {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--op-primary);
    display: grid;
    place-items: center;
    flex: none;
  }

  .brand-name {
    font-family: Archivo, sans-serif;
    font-weight: 800;
    font-size: 21px;
    letter-spacing: -0.01em;
    line-height: 1;
  }

  .brand-sub {
    display: block;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--op-primary);
    margin-top: 3px;
  }

  .main-nav {
    display: flex;
    gap: 4px;
  }

  .main-nav a {
    padding: 10px 12px;
    font-size: 15px;
    font-weight: 600;
    color: var(--op-ink);
    border-radius: 8px;
    white-space: nowrap;
  }

  .main-nav a:hover {
    background: var(--op-bg-alt);
  }

  .header-phone {
    color: var(--op-dark);
    line-height: 1.1;
    text-align: right;
    white-space: nowrap;
  }

  .header-phone-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--op-accent);
  }

  .header-phone-number {
    font-family: Archivo, sans-serif;
    font-weight: 800;
    font-size: 22px;
  }

  .header-call {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--op-accent);
    color: var(--op-on-accent);
    display: none;
    place-items: center;
    flex: none;
  }

  .burger {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    border: 1px solid var(--op-line-strong);
    background: #fff;
    color: var(--op-ink);
    display: none;
    place-items: center;
    flex: none;
  }

  .mobile-nav {
    border-top: 1px solid var(--op-line);
    padding: 8px 16px 16px;
    display: grid;
    gap: 2px;
    background: #fff;
  }

  .mobile-nav a {
    padding: 14px 8px;
    font-weight: 600;
    color: var(--op-ink);
    border-bottom: 1px solid #eef2f6;
  }

  .mobile-nav a:last-child {
    border-bottom: 0;
  }

  @media (max-width: 1149px) {
    .main-nav {
      display: none;
    }

    .burger {
      display: grid;
    }
  }

  @media (min-width: 1150px) {
    .mobile-nav {
      display: none;
    }
  }

  @media (max-width: 899px) {
    .utility-wide,
    .header-phone,
    .header-book {
      display: none;
    }

    .header-call {
      display: grid;
    }
  }

  /* ---- hero ---- */
  .hero {
    position: relative;
    background: var(--op-bg-alt);
    padding: clamp(40px, 6vw, 80px) 0;
  }

  .rings {
    position: absolute;
    right: -140px;
    top: -60px;
    width: 720px;
    height: 720px;
    pointer-events: none;
  }

  .hero-inner {
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 32px);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr));
    gap: clamp(32px, 5vw, 64px);
    align-items: center;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid var(--op-line-strong);
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 14px;
    font-weight: 600;
    max-width: 100%;
    color: var(--op-ink);
  }

  .pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--op-green);
    flex: none;
  }

  .hero h1 {
    font-size: clamp(38px, 5.4vw, 62px);
    line-height: 1.04;
    letter-spacing: -0.02em;
    margin: 20px 0 18px;
    text-wrap: balance;
  }

  .hero-lead {
    font-size: clamp(18px, 1.6vw, 20px);
    color: var(--op-muted);
    margin: 0 0 22px;
    max-width: 34em;
    text-wrap: pretty;
  }

  .checklist {
    list-style: none;
    padding: 0;
    margin: 0 0 28px;
    display: grid;
    gap: 10px;
  }

  .checklist li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-weight: 500;
  }

  .checklist svg {
    width: 22px;
    height: 22px;
    flex: none;
    margin-top: 2px;
    fill: var(--op-green);
  }

  .hero-ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 22px;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    color: var(--op-muted);
  }

  .rating strong {
    color: var(--op-ink);
  }

  .stars {
    display: flex;
    gap: 2px;
  }

  .stars svg {
    fill: var(--op-gold);
  }

  .hero-media {
    position: relative;
    padding: 44px 0 52px;
  }

  .photo-slot {
    border-radius: 14px;
    overflow: hidden;
    background: linear-gradient(135deg, #dce6f0 0%, #eef3f8 100%);
    border: 1px dashed var(--op-line-strong);
    display: grid;
    place-items: center;
    padding: 24px;
    text-align: center;
  }

  /* No caption: a plain tonal panel, so nothing reads as a placeholder. */
  .photo-slot.bare {
    border: 1px solid transparent;
  }

  /* An uploaded photo replaces the placeholder panel entirely. */
  .photo-slot.filled {
    display: block;
    padding: 0;
    border-color: transparent;
  }

  .photo-slot img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo-slot span {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--op-muted);
    max-width: 24em;
  }

  .float-card {
    animation: pl-float 6s ease-in-out infinite;
    position: absolute;
    background: #fff;
    border-radius: 14px;
    padding: 14px 18px;
    box-shadow: 0 10px 28px rgba(10, 31, 51, 0.16);
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .float-card-left {
    left: -12px;
    bottom: 0;
  }

  .float-card-right {
    right: -12px;
    bottom: 0;
    animation-delay: 1s;
  }

  .float-card-live {
    left: -12px;
    top: 0;
    z-index: 2;
    animation-duration: 5s;
  }

  .live-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--op-green);
    animation: pl-pulse 1.8s infinite;
  }

  .float-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex: none;
  }

  .float-icon-green {
    background: #e8f5ec;
  }

  .float-icon-blue {
    background: var(--op-bg-alt);
  }

  .float-text {
    line-height: 1.3;
  }

  .float-text strong {
    display: block;
    font-size: 15px;
  }

  .float-text span {
    font-size: 13px;
    color: var(--op-muted);
  }

  /* ---- trust bar ---- */
  .trust {
    position: relative;
    background: var(--op-dark);
    color: #fff;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .trust-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px clamp(16px, 4vw, 32px);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 20px 28px;
  }

  .trust-item {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .trust-item svg {
    flex: none;
    fill: var(--op-gold);
  }

  .trust-text {
    line-height: 1.3;
  }

  .trust-text strong {
    display: block;
    font-size: 16px;
  }

  .trust-text span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.75);
  }

  /* ---- emergency strip ---- */
  .alert-strip {
    background: #fff4ec;
    border-bottom: 1px solid #f7d9c6;
  }

  .alert-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px clamp(16px, 4vw, 32px);
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
    align-items: center;
    justify-content: space-between;
  }

  .alert-inner p {
    margin: 0;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 16px;
    color: var(--op-ink);
  }

  .alert-inner svg {
    flex: none;
    fill: #b23c08;
  }

  /* ---- section heads ---- */
  .eyebrow {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--op-primary);
  }

  .eyebrow-gold {
    color: var(--op-gold);
  }

  .centered {
    text-align: center;
  }

  .sec-head-split {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 36px;
  }

  .sec-head-split > div {
    max-width: 620px;
  }

  .sec-head-split h2,
  .steps-head,
  .reviews-head h2,
  .area-inner h2,
  .faq-head,
  .why-inner h2 {
    font-size: clamp(30px, 4vw, 42px);
    line-height: 1.12;
    margin: 0 0 10px;
  }

  .sec-lead {
    margin: 0;
    color: var(--op-muted);
  }

  /* ---- services ---- */
  .service-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  .service-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 24px;
    border-radius: 14px;
    background: #fff;
    color: var(--op-ink);
    border: 1px solid var(--op-line);
    box-shadow: 0 1px 2px rgba(10, 31, 51, 0.04);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .service-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 30px rgba(10, 31, 51, 0.12);
    color: var(--op-ink);
  }

  .service-card .service-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--op-bg-alt);
    display: grid;
    place-items: center;
  }

  .service-card .service-icon svg {
    fill: var(--op-primary);
  }

  .service-card.featured {
    background: var(--op-dark);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.14);
  }

  .service-card.featured:hover {
    color: #fff;
  }

  .service-card.featured .service-icon {
    background: var(--op-accent);
  }

  .service-card.featured .service-icon svg {
    fill: var(--op-on-accent);
  }

  .service-title {
    font-family: Archivo, sans-serif;
    font-weight: 700;
    font-size: 20px;
    line-height: 1.2;
    margin-top: 6px;
  }

  .service-desc {
    font-size: 15px;
    line-height: 1.5;
    opacity: 0.85;
    flex: 1;
  }

  .service-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    font-weight: 700;
    padding-top: 12px;
    border-top: 1px solid var(--op-line);
  }

  .service-card.featured .service-foot {
    border-top-color: rgba(255, 255, 255, 0.14);
  }

  .service-list {
    display: none;
    border: 1px solid var(--op-line);
    border-radius: 14px;
    overflow: hidden;
  }

  .service-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    min-height: 64px;
    background: #fff;
    color: var(--op-ink);
    border-bottom: 1px solid var(--op-line);
  }

  .service-row:last-child {
    border-bottom: 0;
  }

  .service-row.featured {
    background: var(--op-dark);
    color: #fff;
  }

  .service-row .service-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--op-bg-alt);
    display: grid;
    place-items: center;
    flex: none;
  }

  .service-row .service-icon svg {
    fill: var(--op-primary);
  }

  .service-row.featured .service-icon {
    background: var(--op-accent);
  }

  .service-row.featured .service-icon svg {
    fill: var(--op-on-accent);
  }

  .service-row-title {
    flex: 1;
    font-weight: 700;
  }

  .service-row-price {
    font-size: 14px;
    font-weight: 600;
    opacity: 0.85;
  }

  @media (max-width: 899px) {
    .service-grid {
      display: none;
    }

    .service-list {
      display: block;
    }
  }

  /* ---- how it works ---- */
  .steps-head {
    margin-bottom: 40px;
  }

  .steps {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }

  .steps li {
    background: #fff;
    border-radius: 14px;
    padding: 28px;
    box-shadow: 0 1px 3px rgba(10, 31, 51, 0.06);
  }

  .step-n {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--op-primary);
    color: #fff;
    display: grid;
    place-items: center;
    font-family: Archivo, sans-serif;
    font-weight: 800;
    font-size: 20px;
  }

  .steps h3 {
    font-weight: 700;
    font-size: 21px;
    margin: 18px 0 8px;
  }

  .steps p {
    margin: 0;
    color: var(--op-muted);
    font-size: 16px;
  }

  /* ---- why us ---- */
  .why-inner {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr));
    gap: clamp(32px, 5vw, 64px);
    align-items: center;
  }

  .why-media {
    position: relative;
  }

  .why-photo {
    height: clamp(300px, 38vw, 500px);
  }

  .years-badge {
    position: absolute;
    right: 20px;
    bottom: -20px;
    background: var(--op-primary);
    color: #fff;
    border-radius: 14px;
    padding: 16px 22px;
    box-shadow: 0 12px 28px rgba(10, 31, 51, 0.22);
    text-align: center;
    line-height: 1.1;
  }

  .years-badge span {
    font-size: 14px;
    font-weight: 600;
  }

  .years-n {
    display: block;
    font-family: Archivo, sans-serif;
    font-weight: 800;
    font-size: 36px;
  }

  .why-lead {
    margin-bottom: 28px;
  }

  .diffs {
    list-style: none;
    padding: 0;
    margin: 0 0 32px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 18px 24px;
  }

  .diffs li {
    display: flex;
    gap: 12px;
  }

  .diffs svg {
    flex: none;
    margin-top: 3px;
    fill: var(--op-green);
  }

  .diffs li > span {
    line-height: 1.4;
  }

  .diffs strong {
    display: block;
  }

  .diffs li > span > span {
    font-size: 15px;
    color: var(--op-muted);
  }

  .stats {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    border-top: 1px solid var(--op-line);
    padding-top: 24px;
  }

  .stats dt {
    font-size: 14px;
    color: var(--op-muted);
  }

  .stats dd {
    margin: 0;
    font-family: Archivo, sans-serif;
    font-weight: 800;
    font-size: clamp(26px, 3vw, 34px);
    color: var(--op-dark);
  }

  /* ---- pricing ---- */
  .pricing-head {
    margin: 0 0 40px;
    max-width: 720px;
    font-size: clamp(30px, 4vw, 42px);
    line-height: 1.12;
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
    gap: 20px;
    align-items: start;
  }

  .card {
    background: #fff;
    color: var(--op-ink);
    border-radius: 14px;
    padding: 28px;
  }

  .card-highlight {
    box-shadow: 0 0 0 3px var(--op-gold);
  }

  .card h3 {
    font-weight: 700;
    font-size: 22px;
    margin: 0 0 16px;
  }

  .card-sub {
    margin: 0 0 4px;
    color: var(--op-muted);
    font-size: 15px;
  }

  .card-highlight h3 {
    margin-bottom: 4px;
  }

  .card-highlight .card-sub {
    margin-bottom: 18px;
  }

  .price-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;
  }

  .price-table tr {
    border-bottom: 1px solid var(--op-line);
  }

  .price-table th {
    text-align: left;
    font-weight: 500;
    padding: 10px 0;
  }

  .price-table td {
    text-align: right;
    font-weight: 700;
    padding: 10px 0;
    white-space: nowrap;
  }

  .fine {
    margin: 14px 0 0;
    font-size: 13px;
    color: var(--op-muted);
    line-height: 1.5;
  }

  .price-big {
    margin: 16px 0;
    font-family: Archivo, sans-serif;
    font-weight: 800;
    font-size: 46px;
    line-height: 1;
    color: var(--op-primary);
  }

  .price-big span {
    font-size: 20px;
    font-weight: 700;
  }

  .card-body {
    margin: 0 0 20px;
    font-size: 15px;
  }

  .promises {
    list-style: none;
    padding: 0;
    margin: 0 0 22px;
    display: grid;
    gap: 14px;
  }

  .promises li {
    display: flex;
    gap: 12px;
  }

  .promises svg {
    flex: none;
    margin-top: 2px;
    fill: var(--op-green);
  }

  .promises li > span {
    line-height: 1.4;
  }

  .promises strong {
    display: block;
    font-size: 16px;
  }

  .promises li > span > span {
    font-size: 14px;
    color: var(--op-muted);
  }

  /* ---- reviews ---- */
  .reviews-head {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 40px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
  }

  .reviews-head h2 {
    margin: 0;
  }

  .score {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .score-n {
    font-family: Archivo, sans-serif;
    font-weight: 800;
    font-size: 60px;
    line-height: 1;
    color: var(--op-dark);
  }

  .score-meta {
    line-height: 1.4;
    font-size: 15px;
    color: var(--op-muted);
  }

  .score-stars {
    display: block;
    color: var(--op-gold);
    font-size: 22px;
    letter-spacing: 2px;
  }

  .review-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
    gap: 20px;
  }

  .review {
    margin: 0;
    background: var(--op-bg-alt);
    border-radius: 14px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .review-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .review-stars {
    color: var(--op-gold);
    letter-spacing: 2px;
  }

  .review-tag {
    font-size: 13px;
    font-weight: 700;
    background: #fff;
    color: var(--op-primary);
    padding: 4px 10px;
    border-radius: 999px;
  }

  .review blockquote {
    margin: 0;
    font-size: 17px;
    line-height: 1.6;
    flex: 1;
  }

  .review figcaption {
    font-size: 15px;
  }

  .review figcaption span {
    color: var(--op-muted);
  }

  /* ---- service area ---- */
  .area-inner {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
    gap: clamp(32px, 5vw, 64px);
    align-items: center;
  }

  .area-lead {
    margin-bottom: 24px;
  }

  .towns {
    list-style: none;
    padding: 0;
    margin: 0 0 24px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px 20px;
  }

  .towns a {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    font-weight: 600;
    color: var(--op-ink);
  }

  .towns a:hover {
    color: var(--op-primary);
  }

  .towns svg {
    flex: none;
    fill: var(--op-primary);
  }

  .area-foot {
    margin: 0;
    font-weight: 500;
  }

  .map-photo {
    height: clamp(280px, 34vw, 440px);
    border: 1px solid var(--op-line-strong);
  }

  /* ---- faq ---- */
  .faq-head {
    margin-bottom: 32px;
  }

  .faqs {
    display: grid;
    gap: 12px;
  }

  .faqs details {
    border: 1px solid var(--op-line);
    border-radius: 14px;
    background: #fff;
  }

  .faqs summary {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    font-weight: 700;
    font-size: 17px;
    min-height: 44px;
    list-style: none;
  }

  .faqs summary::-webkit-details-marker {
    display: none;
  }

  .faq-plus {
    font-size: 26px;
    font-weight: 400;
    line-height: 1;
    color: var(--op-primary);
    transition: transform 0.2s;
    flex: none;
  }

  .faqs details[open] .faq-plus {
    transform: rotate(45deg);
  }

  .faqs p {
    margin: 0;
    padding: 0 24px 22px;
    color: var(--op-muted);
  }

  /* ---- booking ---- */
  .book-inner {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
    gap: clamp(32px, 5vw, 64px);
    align-items: start;
  }

  .book-inner h2 {
    font-size: clamp(30px, 4vw, 42px);
    line-height: 1.12;
    margin: 0 0 16px;
  }

  .book-lead {
    margin: 0 0 28px;
    color: rgba(255, 255, 255, 0.82);
  }

  .book-phone {
    display: block;
    font-family: Archivo, sans-serif;
    font-weight: 800;
    font-size: clamp(28px, 3.4vw, 38px);
    color: #fff;
    margin-bottom: 6px;
  }

  .book-hours {
    margin: 0 0 4px;
    color: rgba(255, 255, 255, 0.82);
  }

  .book-email {
    margin: 0 0 28px;
  }

  .book-email a {
    color: #fff;
  }

  .book-checks {
    list-style: none;
    padding: 0;
    margin: 0 0 28px;
    display: grid;
    gap: 10px;
  }

  .book-checks li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .book-checks svg {
    flex: none;
    fill: #4ade80;
  }

  .book-note {
    margin: 0;
    padding: 16px 18px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.08);
    font-weight: 600;
  }

  .book-form {
    background: #fff;
    color: var(--op-ink);
    border-radius: 14px;
    padding: clamp(22px, 3vw, 36px);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .field {
    display: grid;
    gap: 6px;
    font-size: 15px;
    font-weight: 600;
  }

  .field input,
  .field select,
  .field textarea {
    font: inherit;
    font-weight: 400;
    padding: 13px 14px;
    border-radius: 10px;
    border: 1.5px solid var(--op-field);
    min-height: 48px;
    background: #fff;
    color: var(--op-ink);
  }

  .field textarea {
    resize: vertical;
    min-height: 0;
  }

  .field .invalid {
    border-color: var(--op-danger);
  }

  .field .upper {
    text-transform: uppercase;
  }

  .field-error {
    color: var(--op-danger);
    font-size: 13px;
    font-weight: 500;
  }

  .field-details {
    margin-top: 20px;
  }

  .field-optional {
    font-weight: 400;
    color: var(--op-muted);
    font-size: 14px;
    margin-top: -6px;
  }

  .urgency {
    border: 0;
    padding: 0;
    margin: 20px 0 0;
  }

  .urgency legend {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
    padding: 0;
  }

  .urgency-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .urgency-pill {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 18px;
    border-radius: 999px;
    border: 1.5px solid var(--op-field);
    background: #fff;
    color: var(--op-ink);
    font-size: 15px;
    font-weight: 600;
  }

  .urgency-pill.active {
    background: var(--op-primary);
    border-color: var(--op-primary);
    color: #fff;
  }

  .urgency-pill input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .honeypot {
    position: absolute;
    left: -9999px;
  }

  .btn-submit {
    margin-top: 22px;
    font-size: 17px;
    padding: 16px;
    min-height: 52px;
  }

  .form-status {
    margin: 12px 0 0;
    font-size: 13px;
    color: var(--op-muted);
    text-align: center;
  }

  .thanks {
    text-align: center;
    padding: 40px 8px;
  }

  .thanks-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #e8f5ec;
    display: inline-grid;
    place-items: center;
    margin-bottom: 16px;
  }

  .thanks-head {
    font-family: Archivo, sans-serif;
    font-weight: 800;
    font-size: 26px;
    margin: 0 0 8px;
  }

  .thanks-body {
    margin: 0 0 20px;
    color: var(--op-muted);
  }

  .thanks-again {
    margin: 16px 0 0;
  }

  .thanks-again button {
    background: none;
    border: 0;
    color: var(--op-primary);
    font: inherit;
    font-weight: 600;
    text-decoration: underline;
    min-height: 44px;
  }

  /* ---- cta band ---- */
  .cta-band {
    background: var(--op-primary);
    color: #fff;
    padding: clamp(44px, 6vw, 64px) 0;
  }

  .cta-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 32px;
    align-items: center;
    justify-content: space-between;
  }

  .cta-inner h2 {
    font-size: clamp(28px, 3.6vw, 38px);
    line-height: 1.15;
    margin: 0 0 6px;
    color: #fff;
  }

  .cta-inner p {
    margin: 0;
    color: rgba(255, 255, 255, 0.88);
  }

  .cta-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  /* ---- footer ---- */
  .footer {
    background: var(--op-dark);
    color: rgba(255, 255, 255, 0.8);
    font-size: 15px;
  }

  .footer-inner {
    padding-top: clamp(48px, 6vw, 72px);
    padding-bottom: 32px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 36px;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    font-family: Archivo, sans-serif;
    font-weight: 800;
    font-size: 20px;
    color: #fff;
  }

  .footer-brand .brand-mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .footer-inner p {
    margin: 0 0 14px;
  }

  .footer-phone {
    display: block;
    font-family: Archivo, sans-serif;
    font-weight: 800;
    font-size: 24px;
    color: #fff;
    margin-bottom: 12px;
  }

  .footer-social {
    display: flex;
    gap: 16px;
  }

  .footer-social a {
    color: #fff;
  }

  .footer-head {
    margin: 0 0 12px;
    color: #fff;
    font-weight: 700;
  }

  .footer nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 6px;
  }

  .footer nav a {
    color: rgba(255, 255, 255, 0.8);
  }

  .footer nav a:hover {
    color: #fff;
  }

  .footer address {
    font-style: normal;
    line-height: 1.7;
  }

  .footer address a {
    color: #fff;
  }

  .footer-hours {
    margin: 12px 0 0;
  }

  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .footer-bottom-inner {
    padding-top: 20px;
    padding-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    justify-content: space-between;
    font-size: 14px;
  }

  .footer-spacer {
    display: none;
    height: 76px;
  }

  /* ---- mobile sticky bar ---- */
  .mobile-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 60;
    background: #fff;
    box-shadow: 0 -6px 20px rgba(10, 31, 51, 0.14);
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
    display: none;
    grid-template-columns: 3fr 2fr;
    gap: 10px;
  }

  .mobile-bar-call,
  .mobile-bar-book {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 52px;
    border-radius: 999px;
    font-weight: 700;
  }

  .mobile-bar-call {
    background: var(--op-accent);
    color: var(--op-on-accent);
  }

  .mobile-bar-book {
    background: var(--op-primary);
    color: #fff;
  }

  @media (max-width: 899px) {
    .mobile-bar {
      display: grid;
    }

    .footer-spacer {
      display: block;
    }

    .towns {
      grid-template-columns: 1fr;
    }

    /* Thumb-sized tap targets for the footer link lists, which the desktop
       design packs to ~19px rows. */
    .footer nav ul {
      gap: 0;
    }

    .footer nav a,
    .footer-social a,
    .footer address a,
    .book-email a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }
  }

  /* ---- flair: valve switches, situation card, ripple edges, water-flow header line ---- */
  .scard {
    background: #fff;
    border-radius: 16px;
    padding: 26px;
    box-shadow: 0 24px 50px rgba(10, 31, 51, 0.18);
    border: 1px solid var(--op-line);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .scard-eyebrow {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--op-accent);
  }

  .valves {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .service-filters {
    margin-bottom: 24px;
  }

  .vlv {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 6px 14px 6px 8px;
    border-radius: 999px;
    border: 1.5px solid var(--op-field);
    background: #fff;
    color: var(--op-ink);
    font: 600 14px Inter, system-ui, sans-serif;
    box-sizing: border-box;
    transition: background 0.15s;
  }

  .vlv.on {
    background: var(--op-primary);
    border-color: var(--op-primary);
    color: #fff;
  }

  .vlv-wheel {
    flex: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #94a3b8;
    display: grid;
    place-items: center;
    transition: background 0.15s;
  }

  .vlv.on .vlv-wheel {
    background: var(--op-water);
  }

  /* The handle turns a quarter turn when the valve opens. */
  .vlv-bar {
    width: 16px;
    height: 4px;
    border-radius: 2px;
    background: #fff;
    transition: transform 0.25s;
  }

  .vlv.on .vlv-bar {
    transform: rotate(90deg);
  }

  .scard-tips {
    border-top: 1px solid var(--op-line);
    padding-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .scard-tips-title {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    font-family: Archivo, Inter, sans-serif;
    color: var(--op-primary);
  }

  .scard-tip {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 15px;
    line-height: 1.5;
  }

  .scard-num {
    flex: none;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--op-bg-alt);
    color: var(--op-primary);
    font-weight: 700;
    font-size: 14px;
    display: grid;
    place-items: center;
  }

  .scard-cta {
    align-self: stretch;
    text-align: center;
  }

  .scard-note {
    margin: 0;
    font-size: 13px;
    color: var(--op-muted);
  }

  .ac {
    position: absolute;
    left: 0;
    top: -47px;
    width: 100%;
    height: 48px;
    display: block;
    pointer-events: none;
  }

  .ac-trace {
    fill: none;
    stroke: var(--op-water);
    stroke-width: 2;
    stroke-opacity: 0.8;
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
    background: linear-gradient(90deg, transparent, var(--op-water), transparent) no-repeat;
    background-size: 30% 100%;
    animation: pl-flow 4s linear infinite;
  }

  /* PVC run: a pipe that swerves across the page with water running through it, a drop junction
     on long stretches, and a wall sleeve where it dives behind content. It sits above section
     backgrounds but below content: direct children of each band are lifted above it, and the
     script ends the pipe before any block, so nothing crosses text. Decorative only. */
  .pipe {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    pointer-events: none;
  }

  .op-root :is(.section, .trust, .hero, .alert-strip, .cta-band, .footer) > :not(svg) {
    position: relative;
    z-index: 2;
  }

  .pipe-edge,
  .pipe-body,
  .pipe-stripe,
  .pipe-flow {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Flat, two-tone PVC in light blue with darker couplings, like a plumbing diagram. */
  .pipe-edge {
    stroke: #4fa3cc;
    stroke-width: 20;
  }

  .pipe-body {
    stroke: #7cc6e4;
    stroke-width: 16;
  }

  .pipe-stripe {
    stroke: #b4e3f4;
    stroke-width: 6;
  }

  .pipe-flow {
    stroke: #f2fbff;
    stroke-opacity: 0.9;
    stroke-width: 3;
    stroke-dasharray: 10 90;
    animation: pipe-run 6s linear infinite;
  }

  .pipe-collar {
    fill: #3b8fb8;
  }

  .pipe-collar-line {
    fill: #62b0d4;
  }

  .pipe-flange {
    fill: #2f7ba3;
  }

  .pipe-body-fitting {
    fill: #3b8fb8;
  }

  .pipe-stem {
    stroke: #2f7ba3;
    stroke-width: 4;
    stroke-linecap: round;
  }

  .pipe-wheel {
    fill: #e0483a;
  }

  .pipe-gauge {
    fill: #fff;
    stroke: #e0483a;
    stroke-width: 3.5;
  }

  .pipe-needle {
    stroke: #e0483a;
    stroke-width: 2.5;
    stroke-linecap: round;
  }

  @keyframes pipe-run {
    to {
      stroke-dashoffset: -100;
    }
  }

  @keyframes pl-flow {
    from {
      background-position: -40% 0;
    }
    to {
      background-position: 140% 0;
    }
  }

  @keyframes pl-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes pl-pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(21, 128, 61, 0.5);
    }
    100% {
      box-shadow: 0 0 0 10px rgba(21, 128, 61, 0);
    }
  }

  @media (max-width: 899px) {
    .pipe {
      display: none;
    }
    .rings {
      width: 420px;
      height: 420px;
      right: -160px;
    }
    .float-card-live {
      left: 0;
    }
    .float-card-right {
      right: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .op-root :global(*) {
      transition: none !important;
    }
    .pipe-flow,
    .header::after,
    .float-card,
    .live-dot {
      animation: none;
    }
  }
</style>
