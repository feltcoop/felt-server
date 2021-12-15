<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';
	import type {Readable} from 'svelte/store';

	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Community} from '$lib/vocab/community/community';
	import type {Space} from '$lib/vocab/space/space.js';
	import RoomItems from '$lib/ui/RoomItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		dispatch,
		ui: {selectedPersonaId},
		socket,
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	persona; // silence unused prop warning
	community; // silence unused prop warning

	let text = '';

	$: shouldLoadFiles = browser && $socket.connected;
	$: files = shouldLoadFiles ? dispatch('query_files', {space_id: $space.space_id}) : null;

	const createFile = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content) return;
		await dispatch('create_file', {
			space_id: $space.space_id,
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

<div class="room">
	<div class="files">
		{#if files}
			<RoomItems {files} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
	<input placeholder="> chat" on:keydown={onKeydown} bind:value={text} />
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
