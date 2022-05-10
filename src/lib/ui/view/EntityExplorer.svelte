<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';
	import {writable, type Readable} from 'svelte/store';

	import EntityItems from '$lib/ui/EntityItems.svelte';
	import EntityTree from '$lib/ui/EntityTree.svelte';
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import type {Entity} from '$lib/vocab/entity/entity';
	import type {Tie} from '$lib/vocab/tie/tie';

	const viewContext = getViewContext();
	$: ({space} = $viewContext);

	const {
		dispatch,
		socket,
		ui: {entityById},
	} = getApp();

	// TODO use pageKey
	let entities2: Readable<Array<Readable<Entity>>>;
	let ties2: Readable<Array<Readable<Tie>>>;

	$: shouldLoadEntities && loadEntities2();
	const loadEntities2 = async () => {
		const result = await dispatch.ReadEntitiesPaginated({source_id: $space.directory_id});
		if (result.ok) {
			// TODO refactor using a query interface (with data, status)
			entities2 = writable(result.value.entities.map((e) => entityById.get(e.entity_id)!));
			ties2 = writable(result.value.ties.map((t) => writable(t)));
		}
	};

	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities
		? dispatch.QueryEntities({source_id: $space.directory_id})
		: null;
</script>

<div class="entity-explorer">
	<button
		type="button"
		on:click={() => dispatch.ViewSpace({space_id: $space.space_id, view: null})}
	>
		Close EntityExplorer
	</button>
	<div class="tree">
		{#if entities2}
			<ul>
				{#each $entities2 as entity (entity)}
					<EntityTree {entity} ties={ties2} />
				{/each}
			</ul>
		{:else}
			<PendingAnimation />
		{/if}
	</div>
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
	.tree ul {
		display: flex;
	}
</style>
