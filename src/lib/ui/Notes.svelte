<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/vocab/space/space.js';
	import NoteItems from '$lib/ui/NotesItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {api, ui, data, socket} = getApp();

	export let space: Space;

	let text = '';

	$: browser && $socket.connected && api.loadFiles(space.space_id); // TODO move this to SvelteKit `load` so it works with http clients
	$: console.log(`[Notes] fetching files for ${space.space_id}`);
	$: selectedPersonaId = $ui.selectedPersonaId;

	const createFile = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content) return;
		await api.createFile({
			space_id: space.space_id,
			content,
			actor_id: selectedPersonaId!,
		});
		text = '';
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await createFile();
		}
	};

	$: files = $data.filesBySpace[space.space_id] || [];
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
