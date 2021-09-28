<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';

	import type {Community} from '$lib/vocab/community/community';
	import type {Space} from '$lib/vocab/space/space.js';
	import NoteItems from '$lib/ui/NotesItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		api,
		ui: {selectedPersonaId},
		socket,
	} = getApp();

	export let community: Community;
	export let space: Space;

	community; // silence unused prop warning

	let text = '';

	$: shouldLoadFiles = browser && $socket.connected;
	$: files = shouldLoadFiles ? api.getFilesBySpace(space.space_id) : null;

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
		{#if files}
			<NoteItems {files} />
		{:else}
			<PendingAnimation />
		{/if}
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
