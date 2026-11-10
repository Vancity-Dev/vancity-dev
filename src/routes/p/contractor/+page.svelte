<script lang="ts">
  // The contractor template's showcase, alongside /p, /p/defense, /p/electrical and
  // /p/accounting: a fully-filled fictional builder, so every optional block renders.
  import ContractorSite from '$lib/templates/contractor/ContractorSite.svelte';
  import { haldenMossDefaults } from '$lib/templates/contractor/defaults';
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<ContractorSite content={haldenMossDefaults} />
