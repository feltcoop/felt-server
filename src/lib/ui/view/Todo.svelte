<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';

	import TodoItems from '$lib/ui/TodoItems.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {getViewContext} from '$lib/vocab/view/view';
	import EntityInput from '$lib/ui/EntityInput.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	const {
		dispatch,
		socket,
		ui: {destTiesBySourceEntityId, entityById},
	} = getApp();

	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities
		? dispatch.QueryEntities({source_id: $space.directory_id})
		: null;
	let text = '';

	//TODO this should be readable
	let selectedList: Readable<Entity> | null = null as any;
	const selectList = (list: Readable<Entity>) => {
		if (list.get().data.type !== 'Collection') return;
		if (selectedList === list) {
			selectedList = null;
		} else {
			selectedList = list;
		}
	};

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content || !selectedList) return;

		//TODO better error handling
		await dispatch.CreateEntity({
			data: {type: 'Note', content, checked: false},
			persona_id: $persona.persona_id,
			source_id: $selectedList!.entity_id,
		});
		await dispatch.UpdateEntity({
			data: null,
			entity_id: $space.directory_id,
		});
		text = '';
	};
	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await createEntity();
		}
	};

	const clearDone = async () => {
		if (!selectedList) return;
		const destTies = $destTiesBySourceEntityId.value.get($selectedList!.entity_id);
		const items = destTies?.get().value.reduce((acc, tie) => {
			if (tie.type === 'HasItem') {
				const entity = entityById.get(tie.dest_id)!;
				if (entity.get().data.checked) {
					acc.push(entity);
				}
			}
			return acc;
		}, [] as Array<Readable<Entity>>);
		if (!items?.length) return;
		const entityIds = items.map((i) => i.get().entity_id);
		await dispatch.DeleteEntities({entityIds});
		await dispatch.UpdateEntity({
			data: null,
			entity_id: $space.directory_id,
		});
	};
</script>

<div class="room">
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if entities}
			<TodoItems {entities} {space} {selectedList} {selectList} />
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
		<div class="selected-tools">
			<input placeholder="> create new todo" on:keydown={onKeydown} bind:value={text} />
			<button on:click={clearDone}>Clear Done</button>
		</div>
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
	.selected-tools {
		display: flex;
	}
</style>
