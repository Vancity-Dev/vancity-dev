<script lang="ts">
  let { data } = $props();
  // The accounting template's showcase, alongside /p, /p/defense and /p/electrical: a
  // fully-filled fictional firm, so every optional block renders.
  import AccountingSite from '$lib/templates/accounting/AccountingSite.svelte';
  import { fraserRidgeDefaults } from '$lib/templates/accounting/defaults';
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<AccountingSite content={fraserRidgeDefaults} photos={data.photos} />
