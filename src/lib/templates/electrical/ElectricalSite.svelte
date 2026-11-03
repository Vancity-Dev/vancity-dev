<script lang="ts">
  // Ported from Claude Design project "Electrician Website Template" (Home artboard).
  // Palette: Graphite & Voltage. Same prospect-site shape as PlumbingSite: one page, content
  // object in, no photos (slots stay empty unless photoCaptions is set).

  import { onMount } from 'svelte';
  import type { ElectricalContent } from './types';
  import { wireRuns, type Rect } from './wire';

  let { content }: { content: ElectricalContent } = $props();

  const icons = {
    bolt: 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z',
    panel:
      'M4 2h16v20H4V2zm2 2v16h12V4H6zm2 2h3v3H8V6zm5 0h3v3h-3V6zm-5 5h3v3H8v-3zm5 0h3v3h-3v-3zm-5 5h8v2H8v-2z',
    car: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    wire: 'M3 13h4l2-6 4 12 2-6h6v-2h-4.5L14 18 10 6 7.5 11H3z',
    bulb: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z',
    plug: 'M16 7V3h-2v4h-4V3H8v4c-1.1 0-2 .9-2 2v5.5L9.5 18v3h5v-3l3.5-3.5V9c0-1.1-.9-2-2-2z',
    building:
      'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z',
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
      title: 'Emergency Repair',
      desc: 'Power out, tripping breakers, sparking outlets. We come now.',
      price: 'Call now',
      icon: icons.bolt,
      featured: true
    },
    {
      title: 'Panel Upgrades',
      desc: 'Replace outdated panels, including Federal Pacific and Zinsco.',
      price: 'From $2,400',
      icon: icons.panel
    },
    {
      title: 'EV Charger Installation',
      desc: 'Level 2 charging in your garage, load-checked and permitted.',
      price: 'Free estimate',
      icon: icons.car
    },
    {
      title: 'Whole-Home Generators',
      desc: 'Standby power that starts itself when the grid fails.',
      price: 'Free estimate',
      icon: icons.home
    },
    {
      title: 'Rewiring & Older Homes',
      desc: 'Replace aging, ungrounded or aluminum wiring safely.',
      price: 'Free estimate',
      icon: icons.wire
    },
    {
      title: 'Lighting & Recessed',
      desc: 'Brighter rooms with dimmable LED layouts.',
      price: 'From $180',
      icon: icons.bulb
    },
    {
      title: 'Outlets, GFCI & Surge',
      desc: 'Fix dead outlets and protect your electronics.',
      price: 'From $150',
      icon: icons.plug
    },
    {
      title: 'Commercial',
      desc: 'Service and buildouts for shops, offices and properties.',
      price: 'Free estimate',
      icon: icons.building
    }
  ];

  const services = $derived(
    baseServices.map((s) => ({ ...s, href: content.serviceHrefs[s.title] ?? '#book' }))
  );

  // Service filter chips. The grid is the full list until a visitor narrows it.
  const serviceCats: Record<string, string> = {
    'Emergency Repair': 'Repairs',
    'Outlets, GFCI & Surge': 'Repairs',
    'Panel Upgrades': 'Upgrades',
    'Rewiring & Older Homes': 'Upgrades',
    'EV Charger Installation': 'Installs',
    'Whole-Home Generators': 'Installs',
    'Lighting & Recessed': 'Installs',
    Commercial: 'Commercial'
  };
  const serviceFilters = ['All', 'Repairs', 'Upgrades', 'Installs', 'Commercial'];
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
    { title: 'Guaranteed', sub: '2-year workmanship warranty', icon: icons.check }
  ]);

  const evPoints = [
    'Load calculation on your panel',
    'Dedicated circuit and charger mounting',
    'Permit and inspection handled for you'
  ];

  const panelSigns = [
    'Your panel is 100 amps or less',
    'Breakers trip or fuses blow often',
    'You’re adding an EV, heat pump or solar',
    'Federal Pacific or Zinsco on the label'
  ];

  const steps = [
    {
      n: 1,
      title: 'Call or request',
      body: 'Call, text a photo of your panel, or send the short form. We call back fast.'
    },
    {
      n: 2,
      title: 'Get an upfront price',
      body: 'We diagnose the job and give you a written price. You approve it before we start.'
    },
    {
      n: 3,
      title: 'Done right, warrantied',
      body: 'Built to code, permitted and inspected, and backed by a 2-year workmanship warranty.'
    }
  ];

  const diffs = [
    { t: 'We call ahead', b: 'A call or text before every arrival, no all-day waits.' },
    { t: 'Arrive in the window', b: 'On time, every time, or we tell you why.' },
    { t: 'Clean-home promise', b: 'Shoe covers, drop cloths and a tidy finish.' },
    { t: 'Permits pulled', b: 'We handle permits and schedule the inspection.' },
    { t: 'Background-checked techs', b: 'Every electrician is vetted, licensed and trained.' },
    { t: 'Written warranty', b: '2 years on workmanship, in writing.' }
  ];

  const prices = [
    { job: 'Service call (waived with repair)', price: '$89' },
    { job: 'Outlet or GFCI replacement', price: '$150–$300' },
    { job: 'Recessed lighting, per light', price: 'From $180' },
    { job: 'Level 2 EV charger install', price: '$800–$1,800' },
    { job: '200A panel upgrade', price: '$2,400–$4,500' },
    { job: 'Whole-home generator', price: 'From $6,500' }
  ];

  const promises = [
    { t: 'Upfront price', b: 'The price we quote is the price you pay.' },
    {
      t: 'Same-day service',
      b: 'Call before noon and we’re there today, or the service call is free.'
    },
    { t: '2-year workmanship warranty', b: 'If our work fails, we fix it at no cost.' },
    { t: '100% satisfaction', b: 'Not happy? We make it right.' }
  ];

  const reviews = $derived([
    {
      tag: 'Panel upgrade',
      q: `Got three quotes. ${content.brandLead} was the only one who ran a load calculation first, itemized everything, and finished in one day.`,
      name: 'Dana K.'
    },
    {
      tag: 'Emergency',
      q: 'Half the house lost power on a Saturday night. Someone answered right away and an electrician was here within the hour. Fair price, explained before he started.',
      name: 'Marcus T.'
    },
    {
      tag: 'EV charger',
      q: 'Told us honestly that our panel could handle the charger, pulled the permit, and left the garage cleaner than he found it.',
      name: 'Priya S.'
    }
  ]);

  const insuranceSentence = $derived(
    content.insuranceClaim ? ` and ${content.insuranceClaim}` : '.'
  );

  const faqs = $derived([
    {
      q: 'Are you licensed and insured?',
      a: `Yes. ${content.companyName} ${content.licenceFaqClause}${insuranceSentence} Every electrician is background-checked.`
    },
    {
      q: 'How much does a panel upgrade cost?',
      a: 'Most 200-amp upgrades fall in the range shown above. You get an exact written price before any work starts, and you approve it first.'
    },
    {
      q: 'How much does an EV charger cost, and how long does it take?',
      a: 'Typical Level 2 installs fall in the range shown above and take about half a day once the permit is approved. We run a load calculation first.'
    },
    {
      q: 'Do you pull permits?',
      a: 'Yes. We pull permits, schedule inspections and meet the inspector. It is included in your written price.'
    },
    {
      q: 'Do you offer same-day and emergency service?',
      a: 'Yes. We answer 24/7 and offer same-day service. For emergencies, please call rather than fill out the form.'
    },
    {
      q: 'Do you offer financing?',
      a: `Yes, through ${content.financingProvider}, from $89/month on approved credit for larger jobs like panels and generators.`
    },
    {
      q: 'What areas do you serve?',
      a: content.faqAreasAnswer
    }
  ]);

  const urgencyOptions = ['Emergency', 'Repair', 'Project quote'];

  const emptyForm = {
    name: '',
    phone: '',
    zip: '',
    service: '',
    urgency: 'Project quote',
    details: ''
  };

  type Errors = { name?: boolean; phone?: boolean; zip?: boolean; service?: boolean };

  // "Flip the breaker" situations: each one re-words the hero and the do-this-now steps, and
  // pre-fills the estimate form. Safety copy stays general; fire or downed lines always means 911.
  const situations = $derived([
    {
      label: 'Power out or sparks',
      service: 'Emergency Repair',
      urgency: 'Emergency',
      h1: `Power out or sparking in ${content.city}? Call an electrician now.`,
      lead: 'Leave the area if you smell burning or see sparks. We answer 24/7 and come now.',
      tipsTitle: 'Do this now',
      tips: [
        'Burning smell, smoke or fire? Leave and call 911 first.',
        'Stay away from sparking outlets, panels and downed lines.',
        'If it’s safe, switch off the main breaker, then call us.'
      ],
      cta: `Call ${content.phoneDisplay} now`,
      href: content.phoneHref
    },
    {
      label: 'Breaker keeps tripping',
      service: 'Panel Upgrades',
      urgency: 'Repair',
      h1: `Breaker tripping again in ${content.city}? Find out why, safely.`,
      lead: 'A breaker that trips often is telling you something. We check the circuit before we quote.',
      tipsTitle: 'Before you call',
      tips: [
        'Note which breaker trips and what was running.',
        'Unplug heavy appliances on that circuit.',
        'Don’t keep resetting it. Let us take a look.'
      ],
      cta: 'Get a free estimate',
      href: '#book'
    },
    {
      label: 'Adding an EV charger',
      service: 'EV Charger Installation',
      urgency: 'Project quote',
      h1: `Adding an EV charger in ${content.city}? We check your panel first.`,
      lead: 'A load calculation shows whether your panel can take it, before you spend a dollar.',
      tipsTitle: 'What helps',
      tips: [
        'Tell us the car and where you park it.',
        'A photo of your panel label speeds things up.',
        'We handle the permit and inspection.'
      ],
      cta: 'Get a free estimate',
      href: '#book'
    },
    {
      label: 'Older home wiring',
      service: 'Rewiring & Older Homes',
      urgency: 'Project quote',
      h1: `Older home in ${content.city}? Let’s check the wiring.`,
      lead: 'Flickering lights, warm outlets or a buzzing panel are worth a professional look.',
      tipsTitle: 'What to look for',
      tips: [
        'Flickering lights or warm outlets.',
        'Two-prong outlets or aluminum wiring.',
        'A fuse box or an old panel label.'
      ],
      cta: 'Get a free estimate',
      href: '#book'
    },
    {
      label: 'New lights or outlets',
      service: 'Lighting & Recessed',
      urgency: 'Project quote',
      h1: `Planning new lighting or outlets in ${content.city}? Get a clear price.`,
      lead: 'Dimmable recessed layouts, extra outlets and surge protection, priced up front.',
      tipsTitle: 'What helps',
      tips: [
        'Sketch where you want lights or outlets.',
        'Tell us the ceiling type if you know it.',
        'You approve the price before we start.'
      ],
      cta: 'Get a free estimate',
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
          'Everything else: a free written estimate.'
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
    if (h >= 21 || h < 6) return 'Lights out at night? Call anyway.';
    if (d === 0 || d === 6) return 'Weekends too.';
    return 'No hold music.';
  });

  // A conduit run that swerves across the page. It is measured against the content blocks, so it
  // ends in a tube wherever it would cross text and re-emerges in the gaps between sections.
  let root: HTMLElement | undefined = $state();
  let pageSize = $state({ w: 0, h: 0 });
  let blocks = $state<Rect[]>([]);
  const wire = $derived(wireRuns(pageSize.w, pageSize.h, blocks));

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

  // Picking a situation also pre-fills the estimate form, so the choice carries through.
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
    href="https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<svelte:window bind:scrollY />

{#snippet ac(fill: string)}
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

<div class="el-root" bind:this={root}>
  {#if wire}
    <svg class="wire" aria-hidden="true" width={pageSize.w} height={pageSize.h} viewBox="0 0 {pageSize.w} {pageSize.h}">
      {#each wire.runs as run, i (i)}
        <path d={run.d} class="wire-line" />
        <path d={run.d} class="wire-current" pathLength="1000" />
        {#if run.node}
          <g transform="translate({run.node.x - 11} {run.node.y - 11})">
            <circle cx="11" cy="11" r="11" class="wire-node" />
            <path d={icons.bolt} class="wire-bolt" transform="translate(4 4) scale(0.58)" />
          </g>
        {/if}
      {/each}
      {#each wire.caps as cap, i (i)}
        <g transform="translate({cap.x} {cap.y}) rotate({cap.angle})">
          <rect x="-26" y="-7" width="26" height="14" rx="4" class="wire-tube" />
          <rect x="-5" y="-10" width="6" height="20" rx="2" class="wire-collar" />
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
            ><path d={icons.bolt} /></svg
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
      <a href="#book" class="btn-accent header-book">Free Estimate</a>

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
        <circle cx="200" cy="200" r="190" stroke="#cdd8e4" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" />
        <circle cx="200" cy="200" r="150" stroke="#cdd8e4" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" />
        <circle cx="200" cy="200" r="110" stroke="#f1c978" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" />
        <circle cx="200" cy="200" r="70" stroke="#f1c978" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" />
        <circle cx="332" cy="82" r="9" fill="#f5a524" />
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
              Same-day service, 7 days a week
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons.check} /></svg>
              Written price before any work starts
            </li>
            <li>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons.check} /></svg>
              2-year workmanship warranty
            </li>
          </ul>
          <div class="hero-ctas">
            <a href={content.phoneHref} class="btn-emergency btn-lg btn-raised">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                ><path d={icons.phone} /></svg
              >
              Emergency? Call {content.phoneDisplay}
            </a>
            <a href="#book" class="btn-outline btn-lg">Get a Free Estimate</a>
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
            <p class="scard-eyebrow">What’s going on? Flip the breaker.</p>
            <div class="breakers" role="group" aria-label="Your situation">
              {#each situations as s, i (s.label)}
                <button type="button" class="brk" class:on={sit === i} aria-pressed={sit === i} onclick={() => pick(i)}>
                  <span class="brk-switch" aria-hidden="true"><span class="brk-knob"></span></span>
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
            <p class="scard-note">General information. For fire or downed lines, call 911 first.</p>
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--el-primary)"
                ><path d={icons.clock} /></svg
              >
            </span>
            <span class="float-text">
              <strong>Same-day service</strong>
              <span>7 days a week</span>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="trust" aria-label="Why homeowners trust us">
      {@render ac('#0f172a')}
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
            <strong>Burning smell, sparks, or a hot panel?</strong> Leave the area, shut off the main breaker
            if it’s safe, and call us. If you see fire or downed lines, call 911 or your utility first.
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
            <h2>Electrical work done to code, by a crew you can trust</h2>
            <p class="sec-lead">
              Starting prices are shown so you know where you stand. Your final price is quoted and
              approved before work begins.
            </p>
          </div>
          <a href={content.phoneHref} class="text-link"
            >Not sure what you need? Call {content.phoneDisplay}</a
          >
        </div>

        <div class="breakers service-filters" role="group" aria-label="Filter services">
          {#each serviceFilters as f (f)}
            <button type="button" class="brk" class:on={serviceFilter === f} aria-pressed={serviceFilter === f} onclick={() => (serviceFilter = f)}>
              <span class="brk-switch" aria-hidden="true"><span class="brk-knob"></span></span>
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

    <section id="ev" class="section section-alt">
      {@render ac('#f5f7fa')}
      <div class="container ev-inner">
        <div>
          <p class="eyebrow">EV &amp; panel spotlight</p>
          <h2>Getting an EV? We’ll tell you if your panel can handle it.</h2>
          <p class="sec-lead ev-lead">Every Level 2 install starts with a real load calculation, not a guess.</p>
          <ul class="ev-list">
            {#each evPoints as pt (pt)}
              <li>
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                  ><path d={icons.check} /></svg
                >{pt}
              </li>
            {/each}
          </ul>
          <a href="#book" class="btn-accent btn-lg">Get an EV/Panel Estimate</a>
        </div>
        <div class="ev-card">
          <h3>Do I need a panel upgrade?</h3>
          <p class="ev-card-sub">Any of these is a good reason to have us take a look:</p>
          <ul class="ev-list">
            {#each panelSigns as sg (sg)}
              <li>
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
                  ><path d={icons.check} /></svg
                >{sg}
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </section>

    <section class="section section-alt">
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
          <div class="photo-slot why-photo" aria-hidden={content.photoCaptions ? undefined : 'true'}
            class:bare={!content.photoCaptions}>
            {#if content.photoCaptions}<span>{content.photoCaptions.team}</span>{/if}
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
          <h2>Six promises we put in writing</h2>
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
      {@render ac('#0f172a')}
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
              {content.currencyNote} Every home is different, so your electrician confirms the exact
              price on-site and you approve it before any work starts.
            </p>
          </div>

          <div class="card">
            <h3>Financing</h3>
            <p class="card-sub">For panel upgrades and generators</p>
            <p class="price-big">$89<span>/mo</span></p>
            <p class="card-body">
              As low as $89/month through {content.financingProvider}. Apply in minutes, get a decision on the spot.
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
      {@render ac('#f5f7fa')}
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
        <div class="photo-slot map-photo" aria-hidden={content.photoCaptions ? undefined : 'true'}
            class:bare={!content.photoCaptions}>
          {#if content.photoCaptions}<span>{content.photoCaptions.map}</span>{/if}
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
      {@render ac('#0f172a')}
      <div class="container book-inner">
        <div>
          <p class="eyebrow eyebrow-gold">Free estimate</p>
          <h2>Get a free estimate</h2>
          <p class="book-lead">
            Tell us what’s going on. A real person replies within 15 minutes during business hours.
          </p>
          <a href={content.phoneHref} class="book-phone">{content.phoneDisplay}</a>
          <p class="book-hours">Emergency line open 24/7</p>
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
          <p class="book-note">Emergencies: please call, it’s faster.</p>
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
                We’ll call you at {form.phone} shortly. If you see fire, sparks or smell burning, leave the area and call 911 first.
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
                placeholder="e.g. The kitchen breaker keeps tripping"
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

            <button type="submit" class="btn-accent btn-block btn-submit">Get My Free Estimate</button>
            <p class="form-status" aria-live="polite">{formStatus}</p>
          {/if}
        </form>
      </div>
    </section>

    <section class="cta-band">
      <div class="container cta-inner">
        <div>
          <h2>Power problem or project? Call now.</h2>
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
              ><path d={icons.bolt} /></svg
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
    <a href="#book" class="mobile-bar-book">Estimate</a>
  </div>
</div>

<style>
  /* ---- scoped reset: app.css sets cursor:none, serif stack and link colours ---- */
  .el-root {
    --el-primary: #123a6b;
    --el-dark: #0f172a;
    --el-accent: #b45309;
    --el-emergency: #b3261e;
    --el-on-accent: #ffffff;
    --el-bg-alt: #f5f7fa;
    --el-ink: #0f1e2e;
    --el-muted: #475569;
    --el-line: #e3e9f0;
    --el-line-strong: #d5dee8;
    --el-field: #cbd5e1;
    --el-green: #15803d;
    --el-gold: #f5a524;
    --el-danger: #b91c1c;

    position: relative;
    overflow-x: clip;
    cursor: auto;
    background: #fff;
    color: var(--el-ink);
    font-family: Inter, system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.6;
  }

  .el-root :global(*) {
    cursor: inherit;
  }

  .el-root a,
  .el-root button,
  .el-root summary {
    cursor: pointer;
  }

  .el-root input,
  .el-root textarea {
    cursor: text;
  }

  .el-root select {
    cursor: pointer;
  }

  .el-root :global(:focus-visible) {
    outline: 3px solid var(--el-gold);
    outline-offset: 2px;
  }

  .el-root h1,
  .el-root h2,
  .el-root h3 {
    font-family: Oswald, sans-serif;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--el-dark);
  }

  /* :where() keeps this at the specificity of a reset, so the component rules
     below (.btn-accent, .footer-phone, .mobile-bar-book, …) win on source order.
     Without it Svelte compiles this to `.el-root.svelte-x a:where(.svelte-x)`,
     which outranks every single-class colour rule and repaints them brand blue. */
  .el-root :where(a) {
    color: var(--el-primary);
    text-decoration: none;
  }

  .skip {
    position: absolute;
    left: -9999px;
    top: 8px;
    background: #fff;
    color: var(--el-ink);
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
    background: var(--el-bg-alt);
  }

  .section-dark {
    background: var(--el-dark);
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
    background: var(--el-accent);
    color: var(--el-on-accent);
  }

  .btn-accent:hover {
    filter: brightness(0.92);
    color: var(--el-on-accent);
  }

  .btn-primary {
    background: var(--el-primary);
    color: #fff;
  }

  .btn-primary:hover {
    filter: brightness(1.1);
    color: #fff;
  }

  .btn-outline {
    background: #fff;
    color: var(--el-primary);
    border: 2px solid var(--el-primary);
  }

  .btn-outline:hover {
    background: var(--el-primary);
    color: #fff;
  }

  .btn-white {
    background: #fff;
    color: var(--el-primary);
  }

  .btn-white:hover {
    background: var(--el-bg-alt);
    color: var(--el-primary);
  }

  .text-link {
    font-weight: 700;
  }

  .text-link:hover {
    color: var(--el-dark);
  }

  /* ---- utility bar ---- */
  .utility {
    background: var(--el-dark);
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
    box-shadow: 0 1px 0 var(--el-line);
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
    color: var(--el-dark);
    margin-right: auto;
  }

  .brand-mark {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--el-primary);
    display: grid;
    place-items: center;
    flex: none;
  }

  .brand-name {
    font-family: Oswald, sans-serif;
    font-weight: 700;
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
    color: var(--el-primary);
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
    color: var(--el-ink);
    border-radius: 8px;
    white-space: nowrap;
  }

  .main-nav a:hover {
    background: var(--el-bg-alt);
  }

  .header-phone {
    color: var(--el-dark);
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
    color: var(--el-accent);
  }

  .header-phone-number {
    font-family: Oswald, sans-serif;
    font-weight: 700;
    font-size: 22px;
  }

  .header-call {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--el-accent);
    color: var(--el-on-accent);
    display: none;
    place-items: center;
    flex: none;
  }

  .burger {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    border: 1px solid var(--el-line-strong);
    background: #fff;
    color: var(--el-ink);
    display: none;
    place-items: center;
    flex: none;
  }

  .mobile-nav {
    border-top: 1px solid var(--el-line);
    padding: 8px 16px 16px;
    display: grid;
    gap: 2px;
    background: #fff;
  }

  .mobile-nav a {
    padding: 14px 8px;
    font-weight: 600;
    color: var(--el-ink);
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
    background: var(--el-bg-alt);
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
    border: 1px solid var(--el-line-strong);
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 14px;
    font-weight: 600;
    max-width: 100%;
    color: var(--el-ink);
  }

  .pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--el-green);
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
    color: var(--el-muted);
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
    fill: var(--el-green);
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
    color: var(--el-muted);
  }

  .rating strong {
    color: var(--el-ink);
  }

  .stars {
    display: flex;
    gap: 2px;
  }

  .stars svg {
    fill: var(--el-gold);
  }

  .hero-media {
    position: relative;
    padding: 44px 0 52px;
  }

  .photo-slot {
    border-radius: 14px;
    overflow: hidden;
    background: linear-gradient(135deg, #dce6f0 0%, #eef3f8 100%);
    border: 1px dashed var(--el-line-strong);
    display: grid;
    place-items: center;
    padding: 24px;
    text-align: center;
  }

  /* No caption: a plain tonal panel, so nothing reads as a placeholder. */
  .photo-slot.bare {
    border: 1px solid transparent;
  }

  .photo-slot span {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--el-muted);
    max-width: 24em;
  }

  .float-card {
    animation: el-float 6s ease-in-out infinite;
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
    background: var(--el-green);
    animation: el-pulse 1.8s infinite;
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
    background: var(--el-bg-alt);
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
    color: var(--el-muted);
  }

  /* ---- trust bar ---- */
  .trust {
    position: relative;
    background: var(--el-dark);
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
    fill: var(--el-gold);
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
    color: var(--el-ink);
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
    color: var(--el-primary);
  }

  .eyebrow-gold {
    color: var(--el-gold);
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
    color: var(--el-muted);
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
    color: var(--el-ink);
    border: 1px solid var(--el-line);
    box-shadow: 0 1px 2px rgba(10, 31, 51, 0.04);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .service-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 30px rgba(10, 31, 51, 0.12);
    color: var(--el-ink);
  }

  .service-card .service-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--el-bg-alt);
    display: grid;
    place-items: center;
  }

  .service-card .service-icon svg {
    fill: var(--el-primary);
  }

  .service-card.featured {
    background: var(--el-dark);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.14);
  }

  .service-card.featured:hover {
    color: #fff;
  }

  .service-card.featured .service-icon {
    background: var(--el-accent);
  }

  .service-card.featured .service-icon svg {
    fill: var(--el-on-accent);
  }

  .service-title {
    font-family: Oswald, sans-serif;
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
    border-top: 1px solid var(--el-line);
  }

  .service-card.featured .service-foot {
    border-top-color: rgba(255, 255, 255, 0.14);
  }

  .service-list {
    display: none;
    border: 1px solid var(--el-line);
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
    color: var(--el-ink);
    border-bottom: 1px solid var(--el-line);
  }

  .service-row:last-child {
    border-bottom: 0;
  }

  .service-row.featured {
    background: var(--el-dark);
    color: #fff;
  }

  .service-row .service-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--el-bg-alt);
    display: grid;
    place-items: center;
    flex: none;
  }

  .service-row .service-icon svg {
    fill: var(--el-primary);
  }

  .service-row.featured .service-icon {
    background: var(--el-accent);
  }

  .service-row.featured .service-icon svg {
    fill: var(--el-on-accent);
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
    background: var(--el-primary);
    color: #fff;
    display: grid;
    place-items: center;
    font-family: Oswald, sans-serif;
    font-weight: 700;
    font-size: 20px;
  }

  .steps h3 {
    font-weight: 700;
    font-size: 21px;
    margin: 18px 0 8px;
  }

  .steps p {
    margin: 0;
    color: var(--el-muted);
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
    background: var(--el-primary);
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
    font-family: Oswald, sans-serif;
    font-weight: 700;
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
    fill: var(--el-green);
  }

  .diffs li > span {
    line-height: 1.4;
  }

  .diffs strong {
    display: block;
  }

  .diffs li > span > span {
    font-size: 15px;
    color: var(--el-muted);
  }

  .stats {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    border-top: 1px solid var(--el-line);
    padding-top: 24px;
  }

  .stats dt {
    font-size: 14px;
    color: var(--el-muted);
  }

  .stats dd {
    margin: 0;
    font-family: Oswald, sans-serif;
    font-weight: 700;
    font-size: clamp(26px, 3vw, 34px);
    color: var(--el-dark);
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
    color: var(--el-ink);
    border-radius: 14px;
    padding: 28px;
  }

  .card-highlight {
    box-shadow: 0 0 0 3px var(--el-gold);
  }

  .card h3 {
    font-weight: 700;
    font-size: 22px;
    margin: 0 0 16px;
  }

  .card-sub {
    margin: 0 0 4px;
    color: var(--el-muted);
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
    border-bottom: 1px solid var(--el-line);
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
    color: var(--el-muted);
    line-height: 1.5;
  }

  .price-big {
    margin: 16px 0;
    font-family: Oswald, sans-serif;
    font-weight: 700;
    font-size: 46px;
    line-height: 1;
    color: var(--el-primary);
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
    fill: var(--el-green);
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
    color: var(--el-muted);
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
    font-family: Oswald, sans-serif;
    font-weight: 700;
    font-size: 60px;
    line-height: 1;
    color: var(--el-dark);
  }

  .score-meta {
    line-height: 1.4;
    font-size: 15px;
    color: var(--el-muted);
  }

  .score-stars {
    display: block;
    color: var(--el-gold);
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
    background: var(--el-bg-alt);
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
    color: var(--el-gold);
    letter-spacing: 2px;
  }

  .review-tag {
    font-size: 13px;
    font-weight: 700;
    background: #fff;
    color: var(--el-primary);
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
    color: var(--el-muted);
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
    color: var(--el-ink);
  }

  .towns a:hover {
    color: var(--el-primary);
  }

  .towns svg {
    flex: none;
    fill: var(--el-primary);
  }

  .area-foot {
    margin: 0;
    font-weight: 500;
  }

  .map-photo {
    height: clamp(280px, 34vw, 440px);
    border: 1px solid var(--el-line-strong);
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
    border: 1px solid var(--el-line);
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
    color: var(--el-primary);
    transition: transform 0.2s;
    flex: none;
  }

  .faqs details[open] .faq-plus {
    transform: rotate(45deg);
  }

  .faqs p {
    margin: 0;
    padding: 0 24px 22px;
    color: var(--el-muted);
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
    font-family: Oswald, sans-serif;
    font-weight: 700;
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
    color: var(--el-ink);
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
    border: 1.5px solid var(--el-field);
    min-height: 48px;
    background: #fff;
    color: var(--el-ink);
  }

  .field textarea {
    resize: vertical;
    min-height: 0;
  }

  .field .invalid {
    border-color: var(--el-danger);
  }

  .field .upper {
    text-transform: uppercase;
  }

  .field-error {
    color: var(--el-danger);
    font-size: 13px;
    font-weight: 500;
  }

  .field-details {
    margin-top: 20px;
  }

  .field-optional {
    font-weight: 400;
    color: var(--el-muted);
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
    border: 1.5px solid var(--el-field);
    background: #fff;
    color: var(--el-ink);
    font-size: 15px;
    font-weight: 600;
  }

  .urgency-pill.active {
    background: var(--el-primary);
    border-color: var(--el-primary);
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
    color: var(--el-muted);
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
    font-family: Oswald, sans-serif;
    font-weight: 700;
    font-size: 26px;
    margin: 0 0 8px;
  }

  .thanks-body {
    margin: 0 0 20px;
    color: var(--el-muted);
  }

  .thanks-again {
    margin: 16px 0 0;
  }

  .thanks-again button {
    background: none;
    border: 0;
    color: var(--el-primary);
    font: inherit;
    font-weight: 600;
    text-decoration: underline;
    min-height: 44px;
  }

  /* ---- cta band ---- */
  .cta-band {
    background: var(--el-primary);
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
    background: var(--el-dark);
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
    font-family: Oswald, sans-serif;
    font-weight: 700;
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
    font-family: Oswald, sans-serif;
    font-weight: 700;
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
    background: var(--el-accent);
    color: var(--el-on-accent);
  }

  .mobile-bar-book {
    background: var(--el-primary);
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

  /* ---- flair: breaker switches, situation card, AC-wave edges, header current ---- */
  .scard {
    background: #fff;
    border-radius: 16px;
    padding: 26px;
    box-shadow: 0 24px 50px rgba(10, 31, 51, 0.18);
    border: 1px solid var(--el-line);
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
    color: var(--el-accent);
  }

  .breakers {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .brk {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 6px 14px 6px 8px;
    border-radius: 10px;
    border: 1.5px solid var(--el-field);
    background: #fff;
    color: var(--el-ink);
    font: 600 14px Inter, system-ui, sans-serif;
    box-sizing: border-box;
    transition: background 0.15s;
  }

  .brk.on {
    background: var(--el-primary);
    border-color: var(--el-primary);
    color: #fff;
  }

  .brk-switch {
    flex: none;
    width: 34px;
    height: 20px;
    border-radius: 6px;
    background: #94a3b8;
    position: relative;
    transition: background 0.15s;
  }

  .brk.on .brk-switch {
    background: var(--el-gold);
  }

  .brk-knob {
    position: absolute;
    left: 2px;
    top: 2px;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.4);
    transition: transform 0.15s;
  }

  .brk.on .brk-knob {
    transform: translateX(14px);
  }

  .service-filters {
    margin-bottom: 24px;
  }

  .scard-tips {
    border-top: 1px solid var(--el-line);
    padding-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .scard-tips-title {
    margin: 0;
    font: 700 20px Oswald, Inter, sans-serif;
    color: var(--el-primary);
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
    background: var(--el-bg-alt);
    color: var(--el-primary);
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
    color: var(--el-muted);
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
    stroke: var(--el-gold);
    stroke-width: 2;
    stroke-opacity: 0.7;
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
    background: linear-gradient(90deg, transparent, var(--el-gold), transparent) no-repeat;
    background-size: 30% 100%;
    animation: el-current 4s linear infinite;
  }

  @keyframes el-current {
    from {
      background-position: -40% 0;
    }
    to {
      background-position: 140% 0;
    }
  }

  @keyframes el-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes el-pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(21, 128, 61, 0.5);
    }
    100% {
      box-shadow: 0 0 0 10px rgba(21, 128, 61, 0);
    }
  }

  @media (max-width: 899px) {
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

  /* Conduit run: a thin wire that swerves across the page with a gold pulse travelling along it,
     a bolt junction on long stretches, and a tube where it dives behind content. It sits above
     section backgrounds but below content: direct children of each band are lifted above it, and
     the script ends the wire before any block, so nothing crosses text. Decorative only. */
  .wire {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    pointer-events: none;
  }

  .el-root :is(.section, .trust, .hero, .alert-strip, .cta-band, .footer) > :not(svg) {
    position: relative;
    z-index: 2;
  }

  .wire-tube {
    fill: #94a3b8;
    fill-opacity: 0.7;
  }

  .wire-collar {
    fill: #64748b;
    fill-opacity: 0.8;
  }

  .wire-line {
    fill: none;
    stroke: #8b9bb0;
    stroke-opacity: 0.3;
    stroke-width: 2;
    stroke-linecap: round;
  }
  .wire-current {
    fill: none;
    stroke: var(--el-gold);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 14 86;
    stroke-opacity: 0.55;
    animation: wire-flow 7s linear infinite;
  }
  .wire-node {
    fill: #fff;
    fill-opacity: 0.85;
    stroke: #8b9bb0;
    stroke-opacity: 0.5;
    stroke-width: 2;
  }
  .wire-bolt {
    fill: var(--el-gold);
    fill-opacity: 0.8;
    stroke: #8a5a00;
    stroke-opacity: 0.6;
    stroke-width: 1;
  }
  @keyframes wire-flow {
    to {
      stroke-dashoffset: -100;
    }
  }
  @media (max-width: 899px) {
    .wire {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .el-root :global(*) {
      transition: none !important;
    }
    .wire-current,
    .header::after,
    .float-card,
    .live-dot {
      animation: none;
    }
  }

  .btn-emergency {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 44px;
    padding: 0 24px;
    border-radius: 999px;
    border: 2px solid transparent;
    background: var(--el-emergency);
    color: #fff;
    font-weight: 700;
  }

  .ev-inner {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 56px;
    align-items: center;
  }

  .ev-lead {
    margin-bottom: 24px;
  }

  .ev-list {
    list-style: none;
    margin: 0 0 24px;
    padding: 0;
    display: grid;
    gap: 12px;
  }

  .ev-list li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .ev-list svg {
    flex: none;
    margin-top: 2px;
    fill: var(--el-green);
  }

  .ev-card {
    background: #fff;
    border: 1px solid var(--el-line);
    border-radius: 12px;
    box-shadow: 0 4px 18px rgba(15, 23, 42, 0.06);
    padding: 32px;
  }

  .ev-card h3 {
    margin: 0 0 6px;
  }

  .ev-card-sub {
    color: var(--el-muted);
    margin: 0 0 18px;
  }

  .ev-card .ev-list {
    margin: 0;
  }

  @media (max-width: 899px) {
    .ev-inner {
      grid-template-columns: 1fr;
      gap: 32px;
    }
  }
</style>
