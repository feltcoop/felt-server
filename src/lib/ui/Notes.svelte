<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/vocab/space/space.js';
	import NoteItems from '$lib/ui/NotesItems.svelte';
	import {get_app} from '$lib/ui/app';

	const {api, ui, data} = get_app();

	export let space: Space;

	let text = '';

	$: browser && api.load_files(space.space_id);
	$: console.log(`[Notes] fetching files for ${space.space_id}`);
	$: selected_persona_id = $ui.selected_persona_id;

	const create_file = async () => {
		if (!text) return;
		await api.create_file(space, text, selected_persona_id!);
		text = '';
	};

	const on_keydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await create_file();
		}
	};

	$: files = $data.files_by_space[space.space_id] || [];
</script>

<div class="notes">
	<textarea type="text" placeholder="> note" on:keydown={on_keydown} bind:value={text} />
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
