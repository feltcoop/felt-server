<script lang="ts">
	import {browser} from '$app/env';

	import type {Community} from '$lib/vocab/community/community';
	import type {Space} from '$lib/vocab/space/space.js';
	import RoomItems from '$lib/ui/RoomItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {api, ui, socket} = getApp();

	export let community: Community;
	export let space: Space;

	community;

	let text = '';

	$: browser && $socket.connected && api.loadFiles(space.space_id); // TODO move this to SvelteKit `load` so it works with http clients
	$: console.log(`[Room] fetching files for ${space.space_id}`);

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

<div class="room">
	<div class="files">
		<RoomItems {files} />
	</div>
	<input type="text" placeholder="> chat" on:keydown={onKeydown} bind:value={text} />
</div>

<style>
	.room {
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
