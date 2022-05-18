<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';

	import ForumItems from '$lib/ui/ForumItems.svelte';
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';

	const viewContext = getViewContext();
	$: ({persona, space} = $viewContext);

	const {dispatch, socket} = getApp();

	let text = '';

	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities
		? dispatch.QueryEntities({source_id: $space.directory_id})
		: null;

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?

		if (!content) return;
		await dispatch.CreateEntity({
			space_id: $space.space_id,
			data: {type: 'Note', content},
			actor_id: $persona.persona_id,
			source_id: $space.directory_id,
		});
		text = '';
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			await createEntity();
		}
	};
</script>

<div class="forum">
	<textarea placeholder="> new topic" on:keydown={onKeydown} bind:value={text} />
	<div class="entities">
		{#if entities}
			<ForumItems {entities} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
</div>

<style>
	.forum {
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
		flex-direction: column;
	}
	textarea {
		border-left: none;
		border-right: none;
		border-top: none;
		border-radius: 0;
	}
</style>
