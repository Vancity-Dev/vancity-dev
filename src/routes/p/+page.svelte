<script lang="ts">
  let { data } = $props();
  import PlumbingSite from '$lib/templates/plumbing/PlumbingSite.svelte';
  import { octopusDefaults } from '$lib/templates/plumbing/defaults';
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<PlumbingSite content={octopusDefaults} photos={data.photos} />
