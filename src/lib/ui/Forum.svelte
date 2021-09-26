<script lang="ts">
	import {browser} from '$app/env';

	import type {Community} from '$lib/vocab/community/community';
	import type {Space} from '$lib/vocab/space/space.js';
	import ForumItems from '$lib/ui/ForumItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {api, ui, socket} = getApp();

	export let community: Community;
	export let space: Space;

	community;

	const {selectedPersonaId} = ui;

	let text = '';

	$: shouldLoadFiles = browser && $socket.connected; // TODO make this only load if not already cached
	$: shouldLoadFiles && api.loadFiles(space.space_id); // TODO move this to SvelteKit `load` so it works with http clients
	$: shouldLoadFiles && console.log(`[Board] fetching files for ${space.space_id}\n1\n2\n3`);
	$: files = ui.getFilesBySpace(space.space_id); // TODO should probably be a query

	const createFile = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content) return;
		await api.createFile({
			space_id: space.space_id,
			content,
			actor_id: $selectedPersonaId!, // TODO generic erorr check for no selected persona?
		});
		text = '';
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await createFile();
		}
	};
</script>

<div class="forum">
	<textarea placeholder="> new topic" on:keydown={onKeydown} bind:value={text} />
	<div class="files">
		<ForumItems {files} />
	</div>
</div>

<style>
	.forum {
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
