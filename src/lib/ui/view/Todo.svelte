<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';
	import {get, type Readable} from 'svelte/store';

	import type {EntityData} from '$lib/vocab/entity/entityData';
	import TodoItems from '$lib/ui/TodoItems.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Tie} from '$lib/vocab/tie/tie';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {getViewContext} from '$lib/vocab/view/view';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	const {dispatch, socket} = getApp();

	let text = '';
	let list = false;

	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities ? dispatch('QueryEntities', {space_id: $space.space_id}) : null;
	$: tiesResult = shouldLoadEntities ? dispatch('ReadTies', {space_id: $space.space_id}) : null;
	let ties: Tie[] | undefined;
	//TODO move this call to the UI to get arch & caching
	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	$: tiesResult?.then((data) => {
		if (data.ok) {
			ties = data.value.ties;
		}
	});

	$: itemsByEntity = $entities && ties ? toItemsByEntity($entities, ties) : null;

	let entityById: Map<number, Readable<Entity>> | null = null;
	$: entityById = $entities && new Map($entities.map((e) => [get(e).entity_id, e]));

	//TODO do caching here
	const toItemsByEntity = (
		entities: Array<Readable<Entity>>,
		ties: Tie[],
	): Map<Readable<Entity>, Array<Readable<Entity>>> => {
		const map: Map<Readable<Entity>, Array<Readable<Entity>>> = new Map();
		for (const tie of ties) {
			if (tie.type !== 'HasItem') continue;
			const source = entities.find((e) => get(e).entity_id === tie.source_id)!;
			const dest = entities.find((e) => get(e).entity_id === tie.dest_id)!;
			let items = map.get(source);
			if (!items) {
				map.set(source, (items = []));
			}
			items.push(dest);
		}
		return map;
	};

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?

		if (!content) return;

		const data: EntityData = list
			? {type: 'Collection', name: content}
			: {type: 'Note', content, checked: false};

		await dispatch('CreateEntity', {
			space_id: $space.space_id,
			data,
			actor_id: $persona.persona_id,
		});
		text = '';
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await createEntity();
		}
	};
</script>

<div class="room">
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if entities && ties && itemsByEntity && entityById}
			<TodoItems {entities} {ties} {itemsByEntity} {entityById} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
	<!-- TODO replace this checkbox with modal -->
	<input type="checkbox" bind:checked={list} />
	{#if list}
		<input placeholder="> create new list" on:keydown={onKeydown} bind:value={text} />
	{:else}
		<input placeholder="> create new todo" on:keydown={onKeydown} bind:value={text} />
	{/if}
</div>

<style>
	.room {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.entities {
		max-width: var(--column_width);
		overflow: auto;
		flex: 1;
		display: flex;
		/* makes scrolling start at the bottom */
		flex-direction: column-reverse;
	}
	input {
		border-left: none;
		border-right: none;
		border-bottom: none;
		border-radius: 0;
	}
</style>
