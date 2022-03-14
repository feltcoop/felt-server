<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';

	import EntityItems from '$lib/ui/EntityItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';

	const viewContext = getViewContext();
	$: ({space} = $viewContext);

	const {dispatch, socket} = getApp();

	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities ? dispatch('QueryEntities', {space_id: $space.space_id}) : null;
</script>

<div class="entity-explorer">
	<button type="button" on:click={() => dispatch('ViewSpace', {space, view: null})}>
		Close EntityExplorer
	</button>
	<div class="entities">
		{#if entities}
			<EntityItems {entities} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
</div>

<style>
	.entity-explorer {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.entities {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
