<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/vocab/space/space.js';
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import BoardItems from '$lib/ui/BoardItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {api, ui, data, socket} = getApp();

	export let space: Space;
	export let memberPersonasById: Map<number, Persona>;

	let text = '';

	$: browser && $socket.connected && api.loadFiles(space.space_id); // TODO move this to SvelteKit `load` so it works with http clients
	$: console.log(`[Board] fetching files for ${space.space_id}`);
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

<div class="board">
	<textarea placeholder="> file" on:keydown={onKeydown} bind:value={text} />
	<div class="files">
		<BoardItems {files} {memberPersonasById} />
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
