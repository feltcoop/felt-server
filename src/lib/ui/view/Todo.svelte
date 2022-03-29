<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';
	import {get, type Readable} from 'svelte/store';

	import TodoItems from '$lib/ui/TodoItems.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Tie} from '$lib/vocab/tie/tie';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {getViewContext} from '$lib/vocab/view/view';
	import EntityInput from '$lib/ui/EntityInput.svelte';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	const {dispatch, socket} = getApp();

	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities ? dispatch.QueryEntities({space_id: $space.space_id}) : null;
	$: tiesResult = shouldLoadEntities ? dispatch.ReadTies({space_id: $space.space_id}) : null;
	let ties: Tie[] | undefined;
	let text = '';

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

	let selectedList: Entity | null = null;
	const selectList = (list: Entity) => {
		if (list.data.type !== 'Collection') return;
		if (selectedList === list) {
			selectedList = null;
		} else {
			selectedList = list;
		}
	};

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
		if (!content || !selectedList) return;

		//TODO better error handling
		//TODO create api call to do this in one step?
		const entityResult = await dispatch.CreateEntity({
			space_id: $space.space_id,
			data: {type: 'Note', content, checked: false},
			actor_id: $persona.persona_id,
		});
		if (entityResult.ok) {
			await dispatch.CreateTie({
				source_id: selectedList.entity_id,
				dest_id: entityResult.value.entity.entity_id,
				type: 'HasItem',
			});
		}
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
			<TodoItems {entities} {ties} {itemsByEntity} {entityById} {selectedList} {selectList} />
			<button
				on:click={() =>
					dispatch.OpenDialog({
						Component: EntityInput,
						props: {done: () => dispatch.CloseDialog()},
					})}>+ ...Create List</button
			>
		{:else}
			<PendingAnimation />
		{/if}
	</div>
	{#if selectedList}
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
		flex-direction: column;
	}
</style>
