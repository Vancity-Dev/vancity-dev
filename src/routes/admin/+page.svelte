<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<svelte:head>
  <title>Admin</title>
</svelte:head>

<h1>Admin</h1>

<nav aria-label="Admin sections">
  <a class="tile" href={resolve('/admin/prospects')}>
    <span class="tile-name">Prospects</span>
    <span class="tile-note">Every demo site you have built, with the link to share.</span>
  </a>
  <a class="tile" href={resolve('/admin/prospects/new')}>
    <span class="tile-name">New prospect</span>
    <span class="tile-note">Build a personalized site for a business in about a minute.</span>
  </a>
  <a class="tile" href={resolve('/admin/images')}>
    <span class="tile-name">Template images</span>
    <span class="tile-note">Upload the photos each template shows, spot by spot.</span>
  </a>
</nav>

<style>
  h1 {
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(2rem, 7vw, 2.75rem);
    letter-spacing: -0.025em;
    line-height: 1.1;
    margin: 0 0 1.5rem;
  }

  nav {
    display: grid;
    gap: 0.75rem;
  }

  .tile {
    display: grid;
    gap: 0.25rem;
    padding: 1.1rem 1.25rem;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--paper);
    transition: border-color 0.15s, background 0.15s;
  }

  .tile:hover,
  .tile:focus-visible {
    border-color: var(--accent);
    background: color-mix(in oklab, var(--paper) 70%, var(--bg));
  }

  .tile-name {
    font-size: 1.05rem;
    font-weight: 600;
  }

  .tile-note {
    font-size: 0.9rem;
    color: var(--ink-soft);
    max-width: 42ch;
  }

  @media (min-width: 760px) {
    nav {
      grid-template-columns: 1fr 1fr;
    }

    .tile {
      padding: 1.5rem;
    }
  }
</style>
