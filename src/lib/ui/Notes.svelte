<script lang="ts">
	import {browser} from '$app/env';

	import type {Community} from '$lib/vocab/community/community';
	import type {Space} from '$lib/vocab/space/space.js';
	import NoteItems from '$lib/ui/NotesItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		api,
		ui: {selectedPersonaId, getFilesBySpace},
		socket,
	} = getApp();

	export let community: Community;
	export let space: Space;

	community;

	let text = '';

	$: shouldLoadFiles = browser && $socket.connected; // TODO make this only load if not already cached
	$: shouldLoadFiles && api.loadFiles(space.space_id); // TODO move this to SvelteKit `load` so it works with http clients
	$: shouldLoadFiles && console.log(`fetching files for ${space.space_id}`);
	$: files = getFilesBySpace(space.space_id); // TODO should probably be a query

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

<div class="notes">
	<textarea type="text" placeholder="> note" on:keydown={onKeydown} bind:value={text} />
	<div class="files">
		<NoteItems {files} />
	</div>
</div>

<style>
	.notes {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	textarea {
		border-left: none;
		border-right: none;
		border-top: none;
		border-radius: 0;
	}
	.files {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
