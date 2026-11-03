<script lang="ts">
  import PlumbingSite from '$lib/templates/plumbing/PlumbingSite.svelte';
  import DefenseSite from '$lib/templates/defense/DefenseSite.svelte';
  import ElectricalSite from '$lib/templates/electrical/ElectricalSite.svelte';
  import AccountingSite from '$lib/templates/accounting/AccountingSite.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
  <!-- Neutral icon: no Vancity mark, and no /favicon.ico request that the catch-all would answer with the page. -->
  <link rel="icon" href="data:," />
</svelte:head>

{#if data.industry === 'plumbing'}
  <PlumbingSite content={data.content} photos={data.photos} />
{:else if data.industry === 'defense'}
  <DefenseSite content={data.content} />
{:else if data.industry === 'electrical'}
  <ElectricalSite content={data.content} photos={data.photos} />
{:else if data.industry === 'accounting'}
  <AccountingSite content={data.content} photos={data.photos} />
{/if}
