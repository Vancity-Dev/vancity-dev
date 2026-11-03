<script lang="ts">
  // Ported from Claude Design project "Defense Law Firm Template" (Midnight & Brass), with the
  // flair pass: a colour ribbon, wavy section edges, a "tell us what's going on" card that
  // personalises the hero, a time-aware live badge and a results filter.
  // Credentials, results and reviews render only when the content supplies them, so a
  // derived prospect site never shows an invented claim.

  import { onMount } from 'svelte';
  import type { DefenseContent } from './types';
  import { ribbonBands } from './ribbon';

  let { content }: { content: DefenseContent } = $props();

  const icons = {
    phone:
      'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z'
  };

  // [name, plain-English line, icon path]; tints cycle sand / sage / mist.
  const charges = [
    ['DUI / DWI', 'Impaired-driving arrests, license suspensions and court deadlines.', 'M5 17h14M6 17l1.5-6h9L18 17M7 17v2M17 17v2'],
    ['Drug Crimes', 'Possession, distribution and paraphernalia charges.', 'M10.5 20.5a4.95 4.95 0 0 1-7-7l10-10a4.95 4.95 0 0 1 7 7zM8.5 8.5l7 7'],
    ['Assault & Domestic Violence', 'Accusations of physical harm, often with protective orders.', 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z'],
    ['Theft & Shoplifting', 'Misdemeanor and felony theft, burglary and fraud.', 'M6 8h12l1 12H5zM9 8a3 3 0 0 1 6 0'],
    ['Sex Crimes', 'Discreet, careful defense for serious allegations.', 'M7 3h8l4 4v14H7zM14 3v5h5'],
    ['Weapons', 'Firearm possession and carry charges.', 'M12 3v4M12 17v4M3 12h4M17 12h4M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0'],
    ['Probation Violation', 'Missed check-ins, new arrests or failed tests.', 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4'],
    ['Warrants', 'Resolve an active warrant on your terms.', 'M7 3h10v18H7zM10 8h4M10 12h4M10 16h2'],
    ['Juvenile', 'Protecting a young person’s record and future.', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'],
    ['Expungement & Record Sealing', 'Clear eligible records that hold you back.', 'M4 12a8 8 0 0 1 14-5l2-2v6h-6l2.3-2.3A5.5 5.5 0 1 0 17.5 14'],
    ['White-Collar', 'Fraud, embezzlement and financial investigations.', 'M3 8h18v12H3zM9 8V5h6v3'],
    ['Federal Charges', 'Federal court defense and investigations.', 'M3 10l9-6 9 6M5 10v9M9 10v9M15 10v9M19 10v9M3 21h18']
  ] as const;
  const tints = ['tint-sand', 'tint-sage', 'tint-mist'];

  const steps = [
    { n: 1, when: 'Any hour', title: 'Call or text, 24/7', body: 'Nights, weekends and holidays. A person answers, not a menu.' },
    { n: 2, when: 'Same day', title: 'Free, confidential case review', body: 'We explain the charge, the possible penalties and your options.' },
    { n: 3, when: 'Before we start', title: 'A clear quote and a plan', body: 'You’ll know the cost before we start, and what comes next.' }
  ];

  // Each situation re-words the hero and the "do this now" card. General information only:
  // "may", "in many cases", never a promise.
  const situations = $derived([
    {
      label: 'Just arrested',
      h1a: `Arrested in ${content.city}? Talk to a defense lawyer`,
      h1em: 'tonight',
      h1b: '.',
      lead: 'The sooner you have a lawyer, the more options you have. Free, confidential, and no judgment.',
      tipsTitle: 'Do this now',
      tips: ['Don’t discuss your case with anyone, including on jail calls.', 'Politely say you want a lawyer.', 'Call or text us. We’ll take it from there.'],
      cta2: 'Request a Free Consultation',
      cardCta: `Call ${content.phoneDisplay} now`,
      cardHref: content.phoneHref
    },
    {
      label: 'A loved one was arrested',
      h1a: `Someone you love was arrested in ${content.city}? You’re not`,
      h1em: 'alone',
      h1b: '.',
      lead: 'We know how scary this is. Call any hour and we’ll explain what happens next, in plain English.',
      tipsTitle: 'How to help right now',
      tips: ['Find out where they are held and what the charge is.', 'Remind them not to discuss the case on calls.', 'Call us. You don’t need all the details.'],
      cta2: 'Request a Free Consultation',
      cardCta: `Call ${content.phoneDisplay} now`,
      cardHref: content.phoneHref
    },
    {
      label: 'I have a court date',
      h1a: `Court date coming up in ${content.city}? Know your`,
      h1em: 'options first',
      h1b: '.',
      lead: 'Walking in prepared can change how the day goes. We’ll review your charge and explain what may happen.',
      tipsTitle: 'Before your court date',
      tips: ['Write down the date, time and courthouse.', 'Don’t miss it. A missed date may lead to a warrant.', 'Gather your paperwork and request a free review.'],
      cta2: 'Book a free consultation',
      cardCta: 'Request a free consultation',
      cardHref: '#contact'
    },
    {
      label: 'Police want to talk',
      h1a: 'Contacted by police or under investigation? Don’t answer questions',
      h1em: 'yet',
      h1b: '.',
      lead: 'You may politely decline an interview until you’ve spoken with a lawyer. Call first, in confidence.',
      tipsTitle: 'If police contact you',
      tips: ['Stay calm and polite. Ask if you are free to go.', 'Say you want to speak with a lawyer.', 'Call us before any interview.'],
      cta2: 'Request a Free Consultation',
      cardCta: `Call ${content.phoneDisplay} now`,
      cardHref: content.phoneHref
    },
    {
      label: 'Clear my record',
      h1a: `Ready to move past an old charge in ${content.city}? Let’s check your`,
      h1em: 'eligibility',
      h1b: '.',
      lead: 'In many cases a record may be sealed or expunged, depending on the offense and the time that has passed.',
      tipsTitle: 'What helps',
      tips: ['Note the charge, court and year, if you know them.', 'Tell us what the record is costing you.', 'Request a free review. No pressure.'],
      cta2: 'Check my eligibility',
      cardCta: 'Request a free review',
      cardHref: '#contact'
    }
  ]);

  let sit = $state(0);
  const current = $derived(situations[sit]);

  const faqs = $derived([
    { q: 'Is the consultation really free and confidential?', a: 'Yes. Your first call or meeting is free, and what you tell us in seeking legal help is generally kept confidential.' },
    { q: 'Should I talk to the police?', a: 'In many cases it is wise to say politely that you want a lawyer and then call one before answering questions. What is best depends on your situation.' },
    { q: 'What happens at my first court date?', a: 'It is often a short hearing where the charges are read and next dates may be set. A lawyer can often appear with you and explain each step.' },
    { q: 'Can charges be dropped?', a: 'Sometimes. Charges may be reduced or dismissed depending on the evidence, the law and the facts. No lawyer can promise an outcome.' },
    { q: 'How much does a defense lawyer cost?', a: `It depends on the charge and the court. ${content.feeModel}, and you will know the cost before we start.` },
    { q: 'Can my record be expunged?', a: `In many cases it may be, depending on the offense, how much time has passed and the law. We can review your eligibility. We serve ${content.faqAreasAnswer}` }
  ]);

  // Results filter. Chips only appear when the results span more than one charge type.
  let filter = $state('All');
  const resultTypes = $derived([...new Set(content.results.map((r) => r.type))]);
  const shownResults = $derived(
    filter === 'All' ? content.results : content.results.filter((r) => r.type === filter)
  );

  // Time-aware badge. Rendered empty on the server, filled on mount, so there is no mismatch.
  let now = $state<Date | null>(null);
  const nowLabel = $derived(
    now ? now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''
  );
  const liveLine = $derived.by(() => {
    if (!now) return 'A real person picks up.';
    const h = now.getHours();
    const d = now.getDay();
    if (h >= 21 || h < 6) return 'It’s late. That’s okay.';
    if (d === 0 || d === 6) return 'Weekends too.';
    return 'No hold music.';
  });

  // The ribbon spans the whole page, so it is rebuilt whenever the page resizes.
  let root: HTMLElement | undefined = $state();
  let size = $state({ w: 0, h: 0 });
  const bands = $derived(ribbonBands(size.w, size.h, ['#14233c', '#c9a15a', '#6f8fb0']));

  onMount(() => {
    const tick = () => (now = new Date());
    tick();
    const timer = setInterval(tick, 30000);
    let ro: ResizeObserver | undefined;
    if (root && typeof ResizeObserver !== 'undefined') {
      const el = root;
      const measure = () => (size = { w: el.offsetWidth, h: el.offsetHeight });
      ro = new ResizeObserver(measure);
      ro.observe(el);
      measure();
    }
    return () => {
      clearInterval(timer);
      ro?.disconnect();
    };
  });

  const emptyForm = { name: '', phone: '', time: '', charge: '', who: 'Me', sms: false };
  type Errors = { name?: boolean; phone?: boolean };

  let form = $state({ ...emptyForm });
  let errs = $state<Errors>({});
  let tried = $state(false);
  let submitted = $state(false);

  const firstName = $derived(form.name.trim().split(' ')[0]);

  function validate(f: typeof emptyForm): Errors {
    return { name: !f.name.trim(), phone: f.phone.replace(/\D/g, '').length < 7 };
  }
  function revalidate() {
    if (tried) errs = validate(form);
  }
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errs = validate(form);
    tried = true;
    submitted = !Object.values(errs).some(Boolean);
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
    href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;1,600&family=Manrope:wght@400;500;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

{#snippet wave(fill: string, variant: number)}
  <svg class="wave" aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none">
    {#if variant === 0}
      <path d="M0,50 C240,95 420,0 720,35 C1000,70 1200,5 1440,40 L1440,80 L0,80Z" {fill} />
    {:else if variant === 1}
      <path d="M0,30 C300,0 520,80 820,45 C1100,12 1280,70 1440,30 L1440,80 L0,80Z" {fill} />
    {:else}
      <path d="M0,45 C200,10 460,75 700,40 C960,5 1180,80 1440,35 L1440,80 L0,80Z" {fill} />
    {/if}
  </svg>
{/snippet}

<div class="df-root" bind:this={root}>
  <svg class="ribbon" aria-hidden="true" viewBox="0 0 {size.w || 1} {size.h || 1}">
    <g fill="none" stroke-linejoin="round">
      {#each bands as b (b.color)}
        <path d={b.d} stroke={b.color} stroke-width={b.width} />
      {/each}
    </g>
  </svg>

  <a href="#main" class="skip">Skip to content</a>

  <div class="bar">
    <div class="wrap bar-in">
      <span>Available 24/7 · Nights, weekends &amp; holidays</span>
      <span class="wide">Free, confidential consultation</span>
      <span
        >Call or text <a href={content.phoneHref}><b>{content.phoneDisplay}</b></a> ·
        <a href={content.textHref}><b>Text</b></a></span
      >
    </div>
  </div>

  <header class="head">
    <div class="wrap head-in">
      <a href="#top" class="brand">
        <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
          <circle cx="19" cy="19" r="19" fill="#faf9f6" />
          <path d="M6,16 C11,9 15,22 20,16 S28,9 32,16" stroke="#14233c" stroke-width="4" fill="none" stroke-linecap="round" />
          <path d="M6,23 C11,16 15,29 20,23 S28,16 32,23" stroke="#c9a15a" stroke-width="4" fill="none" stroke-linecap="round" />
        </svg>
        <span class="brand-name">{content.firmName}</span>
      </a>
      <nav class="nav" aria-label="Primary">
        <a href="#charges">Charges</a>
        <a href="#process">How it works</a>
        {#if content.results.length}<a href="#results">Results</a>{/if}
        {#if content.reviews.length}<a href="#reviews">Reviews</a>{/if}
        <a href="#fees">Fees</a>
        <a href="#faq">FAQ</a>
        <a href="#contact">Contact</a>
      </nav>
      <div class="head-cta">
        <a href={content.phoneHref} class="head-phone"
          ><small>24/7</small><span>{content.phoneDisplay}</span></a
        >
        <a href="#contact" class="btn btn-cream wide">Free Consultation</a>
      </div>
    </div>
  </header>

  <main id="main">
    <section class="hero" id="top">
      <svg class="rings" aria-hidden="true" viewBox="0 0 400 400" fill="none">
        <path d="M200,40 C300,30 370,110 360,200 C350,300 270,370 190,360 C90,350 30,280 40,190 C50,100 110,48 200,40Z" stroke="#cfdbe8" stroke-width="3" />
        <path d="M200,75 C280,68 335,130 328,200 C320,280 258,332 192,325 C112,318 70,262 76,192 C82,122 130,80 200,75Z" stroke="#cfdbe8" stroke-width="3" />
        <path d="M200,110 C258,105 300,150 295,200 C290,258 245,295 195,290 C138,285 108,245 112,195 C116,145 150,114 200,110Z" stroke="#e6d2a8" stroke-width="3" />
        <path d="M200,145 C238,142 265,170 262,200 C258,236 230,258 198,255 C162,252 145,228 147,198 C150,168 170,148 200,145Z" stroke="#e6d2a8" stroke-width="3" />
      </svg>
      <div class="in hero-in">
        <div class="hero-copy">
          <span class="pill"><span class="live-dot" aria-hidden="true"></span>{content.city} Criminal Defense Lawyer</span>
          <h1>{current.h1a} <em>{current.h1em}</em>{current.h1b}</h1>
          <p class="lead">{current.lead}</p>
          <div class="btn-row">
            <a class="btn btn-a" href={content.phoneHref}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                ><path d={icons.phone} /></svg
              >
              Call {content.phoneDisplay} — 24/7
            </a>
            <a class="btn btn-o" href="#contact">{current.cta2}</a>
          </div>
          <p class="note">
            Free, confidential consultation. No obligation.
            <a href={content.textHref} class="textlink">Prefer to text?</a>
          </p>
          {#if content.proof}
            <p class="proof">
              {content.proof.years} years · {content.proof.formerRole} · ★ {content.proof.rating} ({content.proof.reviewCount}
              reviews)
            </p>
          {/if}
        </div>

        <div class="scard-wrap">
          <div class="card scard">
            <p class="eyebrow">Tell us what’s going on</p>
            <div class="chips" role="group" aria-label="Your situation">
              {#each situations as s, i (s.label)}
                <button type="button" class="chip" class:on={sit === i} aria-pressed={sit === i} onclick={() => (sit = i)}>{s.label}</button>
              {/each}
            </div>
            <div class="tips">
              <p class="tips-title">{current.tipsTitle}</p>
              {#each current.tips as t, i (t)}
                <div class="tip"><span class="num {tints[i % 3]}">{i + 1}</span><span>{t}</span></div>
              {/each}
            </div>
            <a class="btn btn-a" href={current.cardHref}>{current.cardCta}</a>
            <p class="disc">General information, not legal advice. Every situation is different.</p>
          </div>
          <div class="badge badge-live">
            <span class="live-dot" aria-hidden="true"></span>
            <div>
              <div class="badge-t">Answering now{nowLabel ? ` · ${nowLabel}` : ''}</div>
              <div class="badge-s">{liveLine}</div>
            </div>
          </div>
          {#if content.proof}
            <div class="badge badge-rate">
              <span class="star tint-sand" aria-hidden="true">★</span>
              <div>
                <div class="badge-t">{content.proof.rating} on Google</div>
                <div class="badge-s">{content.proof.reviewCount} reviews</div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </section>

    <section class="now">
      {@render wave('#f6ecd8', 0)}
      <div class="wrap">
        <p>
          <strong>Been arrested or contacted by police?</strong> Don’t discuss your case with anyone,
          including on the phone from jail or on social media. Politely say you want a lawyer, then call
          us at <a href={content.phoneHref}><b>{content.phoneDisplay}</b></a>.
          <span class="disc">General information, not legal advice.</span>
        </p>
      </div>
    </section>

    {#if content.credentials}
      <section class="creds dark">
        <div class="wrap creds-in">
          <div><h2 class="cl">Admitted to</h2><p>{content.credentials.barAdmissions}</p></div>
          <div><h2 class="cl">Memberships</h2><p>{content.credentials.memberships}</p></div>
          <div><h2 class="cl">Languages</h2><p>{content.credentials.languages}</p></div>
        </div>
      </section>
    {/if}

    <section class="sec mist" id="charges">
      {@render wave('#e4ecf4', 1)}
      <div class="in">
        <p class="eyebrow">Charges we defend</p>
        <h2>Find your charge. <em>Know your options.</em></h2>
        <ul class="tiles">
          {#each charges as c, i (c[0])}
            <li>
              <a class="tile lift" href="#contact">
                <span class="ico {tints[i % 3]}">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={c[2]} /></svg>
                </span>
                <h3>{c[0]}</h3>
                <span class="tile-line">{c[1]}</span>
                <b>Ask about this charge →</b>
              </a>
            </li>
          {/each}
        </ul>
        <div class="btn-row">
          <a class="btn btn-a" href={content.phoneHref}>Call {content.phoneDisplay} — 24/7</a>
          <span class="disc">Free, confidential consultation.</span>
        </div>
      </div>
    </section>

    <section class="sec sage" id="process">
      {@render wave('#e3eee6', 2)}
      <div class="in">
        <p class="eyebrow">What happens next</p>
        <h2>Three steps. <em>No surprises.</em></h2>
        <ol class="steps">
          {#each steps as s, i (s.n)}
            <li class="card lift">
              <div class="step-head"><span class="num big {tints[(i + 1) % 3]}">{s.n}</span><span class="when">{s.when}</span></div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          {/each}
        </ol>
        <p class="strong">No pressure. If we’re not the right fit, we’ll tell you.</p>
      </div>
    </section>

    {#if content.results.length}
      <section class="sec sand" id="results">
        {@render wave('#f6ecd8', 0)}
        <div class="in">
          <div class="head-row">
            <div>
              <p class="eyebrow">Case results</p>
              <h2>Outcomes in <em>real cases.</em></h2>
            </div>
            {#if resultTypes.length > 1}
              <div class="chips" role="group" aria-label="Filter results by charge type">
                {#each ['All', ...resultTypes] as t (t)}
                  <button type="button" class="chip" class:on={filter === t} aria-pressed={filter === t} onclick={() => (filter = t)}>{t}</button>
                {/each}
              </div>
            {/if}
          </div>
          <p class="callout">
            Prior results do not guarantee a similar outcome. Every case is different and depends on its
            facts.
          </p>
          <ul class="cards">
            {#each shownResults as r (r.charge + r.county + r.outcome)}
              <li class="card lift">
                <div class="res-top"><span class="eyebrow">{r.county}</span><span class="tag">{r.type}</span></div>
                <h3>{r.charge} → <span class="ok">{r.outcome}</span></h3>
                <p>{r.summary}</p>
              </li>
            {/each}
          </ul>
        </div>
      </section>
    {/if}

    {#if content.reviews.length}
      <section class="sec cream" id="reviews">
        {@render wave('#faf9f6', 2)}
        <div class="in">
          <p class="eyebrow">Reviews</p>
          <h2>What clients <em>say.</em></h2>
          <ul class="cards">
            {#each content.reviews as r, i (r.attribution + r.quote)}
              <li class="card lift bar-{i % 3}">
                <blockquote>“{r.quote}”</blockquote>
                <p class="disc">— {r.attribution}</p>
              </li>
            {/each}
          </ul>
          <p class="disc">
            Testimonials reflect individual experiences. Prior results do not guarantee a similar
            outcome.
          </p>
        </div>
      </section>
    {/if}

    <section class="sec mist" id="fees">
      {@render wave('#e4ecf4', 1)}
      <div class="in two">
        <div>
          <p class="eyebrow">Fees &amp; payment</p>
          <h2>You’ll know the cost <em>before we start.</em></h2>
          <p class="muted">
            Cost depends on the charge, the court and the work involved. We explain it in plain English on
            your free consultation.
          </p>
        </div>
        <div class="card fee-card">
          <p class="fee">{content.feeModel}.</p>
          <ul class="plain">
            <li>Payment plans available</li>
            <li>Major cards accepted</li>
            <li>Free, confidential first consultation</li>
          </ul>
        </div>
      </div>
    </section>

    {#if content.areas.length}
      <section class="sec sage" id="areas">
        {@render wave('#e3eee6', 2)}
        <div class="in">
          <p class="eyebrow">Areas served</p>
          <h2>Local counsel in <em>{content.city}</em> and nearby.</h2>
          <ul class="chips-static">
            {#each content.areas as a (a)}<li class="lift">{a}</li>{/each}
          </ul>
          {#if content.address}
            <address>
              {#each content.address as line (line)}{line}<br />{/each}
            </address>
          {/if}
        </div>
      </section>
    {/if}

    <section class="sec cream" id="faq">
      {@render wave('#faf9f6', 2)}
      <div class="in narrow">
        <p class="eyebrow">Questions</p>
        <h2>Common questions, <em>general answers.</em></h2>
        <div class="faqs">
          {#each faqs as f (f.q)}
            <details><summary>{f.q}</summary><p>{f.a}</p></details>
          {/each}
        </div>
      </div>
    </section>

    <section class="sec contact dark" id="contact">
      {@render wave('#0b1422', 0)}
      <div class="in two">
        <div>
          <p class="eyebrow">Free, confidential consultation</p>
          <h2>Call or text, <em>any hour.</em></h2>
          <a href={content.phoneHref} class="big-phone">{content.phoneDisplay}</a>
          <ul class="plain light">
            <li>Confidential. We never share what you tell us.</li>
            <li>Direct access to your attorney.</li>
            <li>Clear cost before we start.</li>
          </ul>
        </div>
        <form class="form" onsubmit={handleSubmit} novalidate>
          {#if submitted}
            <div class="thanks" role="status" aria-live="polite">
              <span class="check-ico" aria-hidden="true">✓</span>
              <p class="thanks-head">Thank you{firstName ? `, ${firstName}` : ''}. We’ll call you.</p>
              <p>We’ll call you at {form.phone} to discuss confidentially. If it’s urgent, call now.</p>
              <a href={content.phoneHref} class="btn btn-a">Call {content.phoneDisplay}</a>
              <button type="button" class="link" onclick={resetForm}>Send another request</button>
            </div>
          {:else}
            <div>
              <span class="lab" id="whats-going-on">What’s going on?</span>
              <div class="chips" role="group" aria-labelledby="whats-going-on">
                {#each situations as s, i (s.label)}
                  <button type="button" class="chip chip-d" class:on={sit === i} aria-pressed={sit === i} onclick={() => (sit = i)}>{s.label}</button>
                {/each}
              </div>
            </div>
            <label
              >Your name
              <input name="name" autocomplete="name" bind:value={form.name} oninput={revalidate} aria-invalid={errs.name ? 'true' : undefined} />
              {#if errs.name}<span class="err">Please enter your name.</span>{/if}
            </label>
            <label
              >Phone
              <input name="phone" type="tel" autocomplete="tel" inputmode="tel" bind:value={form.phone} oninput={revalidate} aria-invalid={errs.phone ? 'true' : undefined} />
              {#if errs.phone}<span class="err">Please enter a phone number.</span>{/if}
            </label>
            <label
              >Best time to call
              <input name="time" bind:value={form.time} placeholder={nowLabel ? `e.g. after ${nowLabel}` : 'e.g. tonight'} />
            </label>
            <label
              >Charge type
              <select name="charge" bind:value={form.charge}>
                <option value="">Not sure</option>
                {#each charges as c (c[0])}<option>{c[0]}</option>{/each}
              </select>
            </label>
            <label
              >Who is this for?
              <select name="who" bind:value={form.who}>
                <option>Me</option>
                <option>A loved one</option>
              </select>
            </label>
            <p class="fine">
              Please don’t include detailed facts about your case here. Submitting this form does not
              create an attorney-client relationship. We’ll call you to discuss confidentially.
            </p>
            <label class="check"
              ><input type="checkbox" name="sms" bind:checked={form.sms} /> I agree to receive text messages
              about my inquiry. Message and data rates may apply.</label
            >
            <button class="btn btn-a" type="submit">Request my free consultation</button>
          {/if}
        </form>
      </div>
    </section>

    <section class="closing">
      <div class="wrap">
        <h2>Your future is worth <em>a phone call.</em></h2>
        <div class="btn-row center">
          <a class="btn btn-a" href={content.phoneHref}>Call {content.phoneDisplay} — 24/7</a>
          <a class="btn btn-od" href={content.textHref}>Text Us</a>
        </div>
        <p class="small">Free, confidential consultation.</p>
      </div>
    </section>
  </main>

  <footer class="foot">
    <div class="wrap">
      <address>
        <strong>{content.firmName}</strong><br />
        {content.servingLine}<br />
        <a href={content.phoneHref}>{content.phoneDisplay}</a>
      </address>
      <p class="legal">
        <strong>Attorney Advertising.</strong> The information on this website is for general information
        only and is not legal advice. Use of this site or contacting us does not create an attorney-client
        relationship. Prior results do not guarantee a similar outcome. {content.responsibleAttorney} is responsible
        for this website’s content.
      </p>
      <p class="legal">{content.copyrightLine}</p>
    </div>
  </footer>

  <div class="mbar" aria-label="Quick contact">
    <a class="btn btn-a" href={content.phoneHref} style="flex:2">Call 24/7</a>
    <a class="btn btn-od" href={content.textHref} style="flex:1">Text</a>
    <a class="btn btn-od" href="#contact" style="flex:1.3">Free Consult</a>
  </div>
</div>

<style>
  .df-root {
    --color-primary: #14233c;
    --color-dark: #0b1422;
    --color-accent: #8f5a14;
    --color-brass: #c9a15a;
    --color-bg: #faf9f6;
    --color-text: #151b26;
    --color-muted: #4a5262;
    --sand: #f6ecd8;
    --sage: #e3eee6;
    --mist: #e4ecf4;
    position: relative;
    overflow-x: clip;
    font-family: Manrope, system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.65;
    color: var(--color-text);
    background: var(--color-bg);
    cursor: auto;
    scroll-behavior: smooth;
  }
  .df-root :global(*) {
    cursor: auto;
  }
  .df-root :global(a),
  .df-root :global(button),
  .df-root :global(summary),
  .df-root :global(select) {
    cursor: pointer;
  }
  h1,
  h2,
  h3 {
    font-family: Fraunces, Georgia, serif;
    font-weight: 600;
    line-height: 1.1;
    margin: 0;
    color: var(--color-primary);
  }
  h2 {
    font-size: clamp(32px, 4vw, 46px);
    letter-spacing: -0.02em;
    margin: 12px 0 32px;
  }
  h2 em,
  h1 em {
    font-style: italic;
    color: var(--color-accent);
  }
  p {
    margin: 0;
  }
  a {
    color: inherit;
  }
  .wrap {
    max-width: 1160px;
    margin: 0 auto;
    padding: 0 24px;
    box-sizing: border-box;
  }
  .in {
    position: relative;
    z-index: 2;
    max-width: 1160px;
    margin: 0 auto;
  }
  .narrow {
    max-width: 820px;
  }
  .ribbon {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
    opacity: 0.2;
  }
  .skip {
    position: absolute;
    left: -9999px;
  }
  .skip:focus {
    left: 8px;
    top: 8px;
    background: #fff;
    padding: 8px 12px;
    z-index: 50;
  }
  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
  .dark :focus-visible,
  .head :focus-visible {
    outline-color: #fff;
  }
  .bar {
    position: relative;
    z-index: 21;
    background: var(--color-dark);
    color: #fff;
    font-size: 14px;
  }
  .bar-in {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 4px 24px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .head {
    position: sticky;
    top: 0;
    z-index: 20;
    background: var(--color-primary);
    box-shadow: 0 4px 14px rgba(11, 20, 34, 0.3);
  }
  .head-in {
    display: flex;
    align-items: center;
    gap: 20px;
    min-height: 72px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: #fff;
  }
  .brand-name {
    font-family: Fraunces, serif;
    font-weight: 600;
    font-size: 21px;
    white-space: nowrap;
  }
  .nav {
    display: flex;
    gap: 2px;
    margin-left: auto;
  }
  .nav a {
    text-decoration: none;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 8px 12px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.88);
    white-space: nowrap;
  }
  .nav a:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  .head-cta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;
  }
  .nav + .head-cta {
    margin-left: 0;
  }
  .head-phone {
    text-decoration: none;
    line-height: 1.2;
    text-align: right;
    color: #fff;
    white-space: nowrap;
  }
  .head-phone small {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--color-brass);
  }
  .head-phone span {
    font-family: Fraunces, serif;
    font-weight: 600;
    font-size: 22px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 50px;
    padding: 0 24px;
    border-radius: 999px;
    font: 700 16px Manrope, sans-serif;
    text-decoration: none;
    box-sizing: border-box;
    border: 2px solid transparent;
    white-space: nowrap;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }
  .btn:hover {
    transform: translateY(-2px);
  }
  .btn-a {
    background: var(--color-accent);
    color: #fff;
    box-shadow: 0 4px 14px rgba(143, 90, 20, 0.28);
  }
  .btn-o {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: #fff;
  }
  .btn-od {
    border-color: rgba(255, 255, 255, 0.7);
    color: #fff;
  }
  .btn-cream {
    background: var(--color-bg);
    color: var(--color-primary);
    min-height: 44px;
  }
  .btn-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-top: 32px;
  }
  .btn-row.center {
    justify-content: center;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
    background: #fff;
    padding: 6px 14px;
    border-radius: 999px;
    box-shadow: 0 1px 4px rgba(20, 35, 60, 0.12);
    color: var(--color-primary);
  }
  .live-dot {
    flex: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #15803d;
    animation: pulse 1.8s infinite;
  }
  .eyebrow {
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--color-accent);
  }
  .dark .eyebrow,
  .cl {
    color: var(--color-brass);
  }
  .disc,
  .note,
  .small {
    font-size: 14px;
    line-height: 1.55;
    color: var(--color-muted);
  }
  .textlink {
    font-weight: 700;
    color: var(--color-primary);
  }
  .hero {
    position: relative;
    padding: 64px 24px 128px;
  }
  .rings {
    position: absolute;
    right: -140px;
    top: -60px;
    width: 720px;
    height: 720px;
    opacity: 0.9;
    pointer-events: none;
  }
  .hero-in {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr));
    gap: 56px;
    align-items: center;
  }
  .hero-copy {
    display: flex;
    flex-direction: column;
    gap: 22px;
    align-items: flex-start;
  }
  .hero h1 {
    font-size: clamp(38px, 5.4vw, 64px);
    letter-spacing: -0.02em;
    text-wrap: balance;
  }
  .lead {
    font-size: 19px;
    color: var(--color-muted);
    max-width: 540px;
  }
  .hero .btn-row {
    margin-top: 0;
  }
  .proof {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-primary);
    border-top: 1px solid #d9d4c8;
    padding-top: 16px;
  }
  .scard-wrap {
    position: relative;
    padding: 28px 8px;
  }
  .card {
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 2px 10px rgba(20, 35, 60, 0.1);
    padding: 26px;
    box-sizing: border-box;
  }
  .scard {
    transform: rotate(-1.5deg);
    box-shadow: 0 24px 50px rgba(20, 35, 60, 0.2);
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    font: 700 14px Manrope, sans-serif;
    padding: 8px 16px;
    min-height: 44px;
    border-radius: 999px;
    border: 1.5px solid #9aa3b2;
    background: #fff;
    color: var(--color-primary);
    box-sizing: border-box;
    transition: background 0.15s;
  }
  .chip.on {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
  }
  .chip-d {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.55);
    color: #fff;
  }
  .chip-d.on {
    background: var(--color-bg);
    border-color: var(--color-bg);
    color: var(--color-primary);
  }
  .tips {
    border-top: 1px solid #e3dfd6;
    padding-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .tips-title {
    font: 600 20px Fraunces, serif;
    color: var(--color-primary);
  }
  .tip {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 15px;
    line-height: 1.5;
  }
  .num {
    flex: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    color: var(--color-primary);
  }
  .num.big {
    width: 46px;
    height: 46px;
    font-size: 19px;
  }
  .tint-sand {
    background: var(--sand);
  }
  .tint-sage {
    background: var(--sage);
  }
  .tint-mist {
    background: var(--mist);
  }
  .badge {
    position: absolute;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(20, 35, 60, 0.2);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .badge-live {
    right: -4px;
    top: 0;
    animation: float 6s ease-in-out 1s infinite;
  }
  .badge-rate {
    left: -12px;
    bottom: 0;
    animation: float 5s ease-in-out infinite;
  }
  .badge div {
    line-height: 1.3;
  }
  .badge-t {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-primary);
  }
  .badge-s {
    font-size: 12px;
    color: var(--color-muted);
  }
  .star {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: var(--color-accent);
  }
  .now {
    position: relative;
    z-index: 2;
    background: var(--sand);
    padding: 26px 0 28px;
    border-left: 6px solid var(--color-accent);
  }
  .now strong {
    color: var(--color-primary);
  }
  .wave {
    position: absolute;
    left: 0;
    top: -79px;
    width: 100%;
    height: 80px;
    display: block;
  }
  .creds {
    position: relative;
    z-index: 2;
    background: var(--color-dark);
    color: #fff;
  }
  .creds-in {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 40px;
    padding-top: 36px;
    padding-bottom: 36px;
  }
  .creds-in > div {
    flex: 1 1 200px;
    font-size: 15px;
  }
  .cl {
    font: 700 13px Manrope, sans-serif;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .sec {
    position: relative;
    padding: 48px 24px 120px;
  }
  .sec .in {
    padding-top: 24px;
  }
  .mist {
    background: var(--mist);
  }
  .sage {
    background: var(--sage);
  }
  .sand {
    background: var(--sand);
  }
  .cream {
    background: var(--color-bg);
  }
  .lift {
    transition:
      transform 0.25s,
      box-shadow 0.25s;
  }
  .lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 30px rgba(20, 35, 60, 0.16);
  }
  .tiles,
  .cards,
  .steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  .tiles li {
    flex: 1 1 250px;
    max-width: calc(25% - 15px);
    min-width: 230px;
  }
  .tile {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 24px;
    height: 100%;
    box-sizing: border-box;
    background: #fff;
    border-radius: 18px;
    text-decoration: none;
    box-shadow: 0 2px 10px rgba(20, 35, 60, 0.1);
  }
  .tile h3 {
    font-size: 20px;
  }
  .tile-line {
    font-size: 15px;
    color: var(--color-muted);
  }
  .tile b {
    font-size: 14px;
    color: var(--color-accent);
  }
  .ico {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
  }
  .steps li {
    flex: 1 1 280px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .step-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .when {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-muted);
  }
  .steps h3,
  .cards h3 {
    font-size: 22px;
  }
  .steps p,
  .muted,
  .cards p {
    color: var(--color-muted);
  }
  .strong {
    margin-top: 28px;
    font-weight: 700;
    color: var(--color-primary);
  }
  .head-row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .head-row h2 {
    margin-bottom: 0;
  }
  .callout {
    margin-bottom: 26px;
    padding: 14px 18px;
    background: #fff;
    border-radius: 14px;
    font-weight: 700;
    color: var(--color-primary);
  }
  .cards li {
    flex: 1 1 300px;
    max-width: calc(33.3% - 14px);
    min-width: 280px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    list-style: none;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 2px 10px rgba(20, 35, 60, 0.1);
    padding: 26px;
    box-sizing: border-box;
  }
  .res-top {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    align-items: center;
  }
  .tag {
    font-size: 12px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
    background: var(--mist);
    color: var(--color-primary);
  }
  .ok {
    color: #15803d;
  }
  .cards li.bar-0 {
    border-top: 5px solid #c9a15a;
  }
  .cards li.bar-1 {
    border-top: 5px solid #6f8fb0;
  }
  .cards li.bar-2 {
    border-top: 5px solid #7fa88a;
  }
  blockquote {
    margin: 0 0 14px;
  }
  .two {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
    gap: 48px;
    align-items: center;
  }
  .fee-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 14px 34px rgba(20, 35, 60, 0.14);
  }
  .fee {
    font: 600 24px Fraunces, serif;
    color: var(--color-primary);
  }
  .plain {
    margin: 12px 0 0;
    padding-left: 20px;
    color: var(--color-muted);
  }
  .plain.light {
    color: rgba(255, 255, 255, 0.88);
  }
  .chips-static {
    list-style: none;
    margin: 0 0 20px;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chips-static li {
    padding: 8px 16px;
    background: #fff;
    border-radius: 999px;
    font-size: 15px;
    font-weight: 700;
  }
  address {
    font-style: normal;
    color: var(--color-muted);
  }
  details {
    border-top: 1px solid #d9d4c8;
    padding: 14px 0;
  }
  details:last-child {
    border-bottom: 1px solid #d9d4c8;
  }
  summary {
    font-weight: 700;
    color: var(--color-primary);
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  details p {
    color: var(--color-muted);
  }
  .contact {
    background: var(--color-dark);
    color: #fff;
  }
  .contact h2,
  .contact h2 em {
    color: #fff;
  }
  .contact h2 em {
    color: var(--color-brass);
  }
  .big-phone {
    display: block;
    font: 600 42px Fraunces, serif;
    color: #fff;
    text-decoration: none;
    margin-bottom: 18px;
  }
  .form {
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 22px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-sizing: border-box;
  }
  .form label,
  .lab {
    display: block;
    font-size: 14px;
    font-weight: 700;
  }
  .lab {
    margin-bottom: 6px;
  }
  .form input:not([type='checkbox']),
  .form select {
    display: block;
    width: 100%;
    box-sizing: border-box;
    min-height: 48px;
    margin-top: 4px;
    border-radius: 10px;
    border: 1px solid #8892a3;
    padding: 10px 12px;
    font: 400 16px Manrope, sans-serif;
    background: #fff;
    color: var(--color-text);
  }
  .form .check {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-weight: 400;
  }
  .form .check input {
    width: 22px;
    height: 22px;
    margin: 2px 0 0;
  }
  .fine {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.88);
  }
  .err {
    display: block;
    color: #fecaca;
    font-weight: 400;
    margin-top: 4px;
  }
  .thanks {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    text-align: center;
    padding: 24px 0;
  }
  .check-ico {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #bbf7d0;
    color: #14532d;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 700;
  }
  .thanks-head {
    font: 600 26px Fraunces, serif;
  }
  .link {
    background: none;
    border: 0;
    padding: 0;
    color: #fff;
    text-decoration: underline;
    font: inherit;
  }
  .closing {
    position: relative;
    z-index: 2;
    background: var(--color-primary);
    color: #fff;
    text-align: center;
    padding: 72px 0;
  }
  .closing h2 {
    color: #fff;
    margin: 0 0 8px;
  }
  .closing h2 em {
    color: var(--color-brass);
  }
  .closing .small {
    margin-top: 16px;
    color: rgba(255, 255, 255, 0.88);
  }
  .foot {
    position: relative;
    z-index: 2;
    background: var(--color-dark);
    color: rgba(255, 255, 255, 0.88);
    padding: 48px 0 40px;
    font-size: 14px;
  }
  .foot strong {
    color: #fff;
  }
  .foot address {
    color: inherit;
    margin-bottom: 18px;
  }
  .legal {
    line-height: 1.7;
    margin-top: 8px;
  }
  .mbar {
    display: none;
  }
  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(21, 128, 61, 0.5);
    }
    100% {
      box-shadow: 0 0 0 10px rgba(21, 128, 61, 0);
    }
  }
  @media (max-width: 1099px) {
    .nav {
      display: none;
    }
    .head-cta {
      margin-left: auto;
    }
  }
  @media (max-width: 899px) {
    .wide {
      display: none;
    }
    .tiles li {
      max-width: none;
    }
    .rings {
      width: 420px;
      height: 420px;
      right: -160px;
    }
    .hero {
      padding-bottom: 96px;
    }
    .df-root {
      padding-bottom: 72px;
    }
    .badge-live {
      right: 0;
      top: -6px;
    }
    .badge-rate {
      left: 0;
    }
    .mbar {
      display: flex;
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      gap: 8px;
      padding: 10px 12px;
      background: var(--color-dark);
      z-index: 30;
    }
  }
  @media (max-width: 599px) {
    .head-phone {
      display: none;
    }
    .brand-name {
      font-size: 19px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
    .df-root {
      scroll-behavior: auto;
    }
  }
</style>
