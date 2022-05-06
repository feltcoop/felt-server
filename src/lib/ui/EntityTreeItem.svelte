<script lang="ts">
	import {writable, type Readable} from 'svelte/store';
	import {browser} from '$app/env';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {Tie} from '$lib/vocab/tie/tie';
	import {getApp} from '$lib/ui/app';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';

	const {
		dispatch,
		socket,
		ui: {contextmenu, entityById},
	} = getApp();

	// TODO this should possibly be a generic component instead of this named one

	export let entity: Readable<Entity>;
	export let ties: Readable<Array<Readable<Tie>>>; // TODO maybe don't pass these and do lookups instead

	let expanded = false;

	$: hasDestEntities = !!(destEntities && $destEntities.length);
	$: console.log(`hasDestEntities`, hasDestEntities);

	// TODO use pageKey
	let destEntities: Readable<Array<Readable<Entity>>>;
	let destTies: Readable<Array<Readable<Tie>>>;
	$: console.log(`destEntities, ties2`, $destEntities, $destTies);
	$: shouldLoadEntities && loadEntities2();
	const loadEntities2 = async () => {
		const result = await dispatch.ReadEntitiesPaginated({source_id: $entity.entity_id});
		if (result.ok) {
			// TODO refactor using a query interface (with data, status)
			destEntities = writable(result.value.entities.map((e) => entityById.get(e.entity_id)!));
			destTies = writable(result.value.ties.map((t) => writable(t)));
		}
	};

	$: shouldLoadEntities = browser && $socket.open;
</script>

<ul>
	<div class="item" use:contextmenu.action={[[EntityContextmenu, {entity}]]}>
		{#if hasDestEntities}
			<button class="icon-button" on:click={() => (expanded = !expanded)}>
				{#if expanded}–{:else}+{/if}
			</button>
		{:else}
			<div class="icon-button" />
		{/if}
		{$entity.data.name || '(no name)'}: {$entity.data.type}
	</div>
	<!-- TODO key? -->
	{#if expanded && hasDestEntities}
		{#each $destEntities as destEntity (destEntity)}
			<svelte:self entity={destEntity} {ties} />
		{/each}
	{/if}
</ul>

<style>
	.item {
		display: flex;
		align-items: center;
	}
	.icon-button {
		margin-right: var(--spacing_sm);
	}
</style>
