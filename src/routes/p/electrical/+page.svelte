<script lang="ts">
  let { data } = $props();
  import ElectricalSite from '$lib/templates/electrical/ElectricalSite.svelte';
  import { northlineDefaults } from '$lib/templates/electrical/defaults';
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<ElectricalSite content={northlineDefaults} photos={data.photos} />
