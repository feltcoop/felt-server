<script lang="ts">
	import {browser} from '$app/env';

	import type {Community} from '$lib/vocab/community/community';
	import type {Space} from '$lib/vocab/space/space.js';
	import BoardItems from '$lib/ui/BoardItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {api, ui, socket} = getApp();

	export let community: Community;
	export let space: Space;

	community;

	let text = '';

	$: browser && $socket.connected && api.loadFiles(space.space_id); // TODO move this to SvelteKit `load` so it works with http clients
	$: console.log(`[Board] fetching files for ${space.space_id}`);

	const createFile = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content) return;
		await api.createFile({
			space_id: space.space_id,
			content,
			actor_id: $ui.selectedPersonaId!,
		});
		text = '';
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await createFile();
		}
	};

	$: files = $ui.filesBySpace[space.space_id] || [];
</script>

<div class="board">
	<textarea placeholder="> file" on:keydown={onKeydown} bind:value={text} />
	<div class="files">
		<BoardItems {files} />
	</div>
</div>

<style>
	.board {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.files {
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
