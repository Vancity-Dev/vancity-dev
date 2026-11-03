<script lang="ts">
  import { enhance } from '$app/forms';
  import { resolve } from '$app/paths';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const MAX_EDGE = 1800;
  const LIMIT = 1_500_000;

  // Phone photos are 3-8 MB. Shrink in the browser so the upload fits and the sites stay quick.
  // If anything about that fails, the original goes up and the server decides.
  async function shrink(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return;
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
      if (scale === 1 && file.size <= LIMIT) return;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      let blob: Blob | null = null;
      for (const q of [0.85, 0.7, 0.55]) {
        blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', q));
        if (blob && blob.size <= LIMIT) break;
      }
      if (!blob || blob.type !== 'image/webp') return;
      const out = new DataTransfer();
      out.items.add(new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' }));
      input.files = out.files;
    } catch {
      /* keep the original */
    }
  }

  let picked = $state<Record<string, string>>({});
  function onPick(e: Event, id: string) {
    const input = e.currentTarget as HTMLInputElement;
    shrink(input).then(() => {
      const f = input.files?.[0];
      picked[id] = f ? `${f.name} · ${(f.size / 1000).toFixed(0)} KB` : '';
    });
  }

  const total = $derived(data.templates.reduce((n, t) => n + t.slots.length, 0));
  const filled = $derived(
    data.templates.reduce((n, t) => n + t.slots.filter((s) => s.photo).length, 0)
  );
</script>

<svelte:head>
  <title>Template images · Admin</title>
</svelte:head>

<header class="page-head">
  <h1>Template images</h1>
  <p class="summary">{filled} of {total} photo spots filled</p>
</header>
<p class="intro">
  Each template has a few spots that show a photo. Upload one per spot and it appears on that
  template’s showcase page and on every prospect site built from it. Spots with no photo keep
  their plain panel.
</p>

{#if form && 'message' in form && form.message && !('slot' in form && form.slot)}
  <p class="error" role="alert">{form.message}</p>
{/if}

{#each data.templates as t (t.key)}
  <section class="tpl" aria-labelledby="h-{t.key}">
    <div class="tpl-head">
      <h2 id="h-{t.key}">{t.label}</h2>
      <a href={resolve(t.preview as '/p')} target="_blank" rel="noopener">View showcase</a>
    </div>

    {#if t.slots.length === 0}
      <p class="none">This template has no photo spots.</p>
    {/if}

    {#each t.slots as s (s.key)}
      {@const id = `${t.key}/${s.key}`}
      {@const mine = form && 'slot' in form && form.slot === id ? form : null}
      <article class="slot" data-testid="slot-{t.key}-{s.key}">
        <div class="thumb" class:empty={!s.photo}>
          {#if s.photo}
            <img src={s.photo.src} alt={s.photo.alt} />
          {:else}
            <span>No photo yet</span>
          {/if}
        </div>

        <div class="body">
          <h3>{s.label}</h3>
          <dl>
            <dt>Where</dt>
            <dd>{s.where}</dd>
            <dt>Shape</dt>
            <dd>{s.shape}. The photo is cropped to fill it.</dd>
            <dt>Good for</dt>
            <dd>{s.suggest}</dd>
          </dl>

          <form
            method="POST"
            action="?/upload"
            enctype="multipart/form-data"
            use:enhance={() =>
              async ({ update }) => {
                await update({ reset: true });
                picked[id] = '';
              }}
          >
            <input type="hidden" name="industry" value={t.key} />
            <input type="hidden" name="slot" value={s.key} />
            <label class="file">
              <span class="btn ghost">{s.photo ? 'Replace photo' : 'Choose photo'}</span>
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                required
                onchange={(e) => onPick(e, id)}
              />
              <span class="picked">{picked[id] ?? ''}</span>
            </label>
            <label class="alt">
              <span>Description for screen readers <em>(optional)</em></span>
              <input
                type="text"
                name="alt"
                maxlength="200"
                value={s.photo?.alt ?? ''}
                placeholder="e.g. The crew beside two branded vans"
              />
            </label>
            <div class="row">
              <button class="btn" type="submit">Upload</button>
              {#if s.photo}
                <button class="btn ghost" type="submit" formaction="?/alt" formnovalidate>
                  Save description only
                </button>
                <button class="link danger" type="submit" formaction="?/remove" formnovalidate>
                  Remove
                </button>
              {/if}
            </div>
            {#if mine?.message}<p class="error" role="alert">{mine.message}</p>{/if}
            {#if mine && 'saved' in mine && mine.saved}<p class="ok" role="status">Saved.</p>{/if}
            {#if mine && 'removed' in mine && mine.removed}<p class="ok" role="status">Removed.</p>{/if}
          </form>
        </div>
      </article>
    {/each}
  </section>
{/each}

<style>
  .page-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem 1rem;
    margin-bottom: 0.5rem;
  }
  h1 {
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(2rem, 7vw, 2.75rem);
    letter-spacing: -0.025em;
    line-height: 1.1;
    margin: 0;
  }
  .summary,
  .intro {
    color: var(--ink-soft);
    margin: 0;
  }
  .intro {
    max-width: 62ch;
    margin-bottom: 2rem;
  }
  .tpl {
    margin-bottom: 2.5rem;
  }
  .tpl-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid var(--line);
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
  h2 {
    font-family: var(--serif);
    font-weight: 400;
    font-size: 1.5rem;
    margin: 0;
  }
  .tpl-head a {
    font-size: 0.85rem;
    color: var(--accent);
  }
  .none {
    color: var(--ink-soft);
  }
  .slot {
    display: grid;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--paper);
  }
  .thumb {
    aspect-ratio: 3 / 2;
    border-radius: 8px;
    overflow: hidden;
    background: color-mix(in oklab, var(--bg) 85%, var(--ink));
    display: grid;
    place-items: center;
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .thumb.empty {
    border: 1px dashed var(--line);
    color: var(--ink-soft);
    font-size: 0.85rem;
  }
  h3 {
    margin: 0 0 0.5rem;
    font-size: 1.05rem;
  }
  dl {
    margin: 0 0 1rem;
    display: grid;
    grid-template-columns: 5rem 1fr;
    gap: 0.35rem 0.75rem;
    font-size: 0.9rem;
  }
  dt {
    color: var(--ink-soft);
  }
  dd {
    margin: 0;
  }
  form {
    display: grid;
    gap: 0.75rem;
  }
  .file {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  /* Visually hidden but still focusable, so the keyboard path and the focus ring survive. */
  .file input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    overflow: hidden;
  }
  .file:focus-within .btn {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .picked {
    font-size: 0.85rem;
    color: var(--ink-soft);
  }
  .alt {
    display: grid;
    gap: 0.25rem;
    font-size: 0.85rem;
  }
  .alt em {
    color: var(--ink-soft);
    font-style: normal;
  }
  .alt input {
    padding: 0.55rem 0.7rem;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--bg);
    font: inherit;
    color: var(--ink);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }
  button.btn {
    border: none;
    cursor: pointer;
  }
  button.btn.ghost {
    border: 1px solid var(--line);
  }
  .link {
    background: none;
    border: none;
    padding: 0.4rem;
    font: inherit;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: underline;
  }
  .danger {
    color: #9b2c1f;
  }
  .error {
    color: #9b2c1f;
    margin: 0;
    font-size: 0.9rem;
  }
  .ok {
    color: var(--accent);
    margin: 0;
    font-size: 0.9rem;
  }
  @media (min-width: 760px) {
    .slot {
      grid-template-columns: 16rem 1fr;
      padding: 1.25rem;
    }
    .thumb {
      align-self: start;
    }
  }
</style>
