<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';

	import TodoItems from '$lib/ui/TodoItems.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {getViewContext} from '$lib/vocab/view/view';
	import EntityInput from '$lib/ui/EntityInput.svelte';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	const {dispatch, socket} = getApp();

	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities
		? dispatch.QueryEntities({source_id: $space.directory_id})
		: null;
	let text = '';

	//TODO this should be readable
	let selectedList: Entity | null = null;
	const selectList = (list: Entity) => {
		if (list.data.type !== 'Collection') return;
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
			source_id: selectedList.entity_id,
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
		// if (!selectedList) return;
		// const entityList = entityById.get(selectedList.entity_id);
		// const items = itemsByEntity?.get(entityList!);
		// if (items) {
		// 	const doneItems = items.filter((i) => i.get().data.checked === true);
		// 	if (doneItems.length > 0) {
		// 		const entity_ids = doneItems.map((i) => i.get().entity_id);
		// 		await dispatch.DeleteEntities({entity_ids});
		// 		await dispatch.UpdateEntity({
		// 			data: null,
		// 			entity_id: $space.directory_id,
		// 		});
		// 	}
		// }
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
