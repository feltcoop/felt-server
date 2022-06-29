<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';

	import BoardItems from '$lib/ui/BoardItems.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {getViewContext} from '$lib/vocab/view/view';
	import EntityInput from '$lib/ui/EntityInput.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	const {dispatch, socket} = getApp();

	//TODO once QueryEntities interface is in place this should initialize a "posts" collection
	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities
		? dispatch.QueryEntities({source_id: $space.directory_id})
		: null;
	let text = '';

	//TODO this should be readable
	let selectedPost: Readable<Entity> | null = null as any;
	const selectPost = (post: Readable<Entity>) => {
		if (post.get().data.type !== 'Collection') return;
		if (selectedPost === post) {
			selectedPost = null;
		} else {
			selectedPost = post;
		}
	};

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content || !selectedPost) return;

		//TODO better error handling
		await dispatch.CreateEntity({
			data: {type: 'Note', content, checked: false},
			persona_id: $persona.persona_id,
			source_id: $selectedPost!.entity_id,
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
</script>

<div class="room">
	<div class="entities">
		<!-- TODO handle failures here-->
		{#if entities}
			<BoardItems {entities} {space} {selectedPost} {selectPost} />
			{#if !selectedPost}
				<button
					on:click={() =>
						dispatch.OpenDialog({
							Component: EntityInput,
							props: {done: () => dispatch.CloseDialog(), entityName: 'Post', contentForm: true},
						})}>Submit a new post</button
				>
			{/if}
			{#if selectedPost}
				<div class="selected-tools">
					<input placeholder="> create new comment" on:keydown={onKeydown} bind:value={text} />
				</div>
			{/if}
		{:else}
			<PendingAnimation />
		{/if}
	</div>
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
