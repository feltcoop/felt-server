<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';
	import type {Readable} from 'svelte/store';

	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Community} from '$lib/vocab/community/community';
	import type {Space} from '$lib/vocab/space/space.js';
	import NoteItems from '$lib/ui/NotesItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {dispatch, socket} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	persona; // silence unused prop warning
	community; // silence unused prop warning

	let text = '';

	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities ? dispatch('QueryEntities', {space_id: $space.space_id}) : null;

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?

		if (!content) return;
		await dispatch('CreateEntity', {
			space_id: $space.space_id,
			data: {type: 'Note', content: content},
			actor_id: $persona.persona_id,
		});
		text = '';
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await createEntity();
		}
	};
</script>

<div class="notes">
	<textarea placeholder="> note" on:keydown={onKeydown} bind:value={text} />
	<div class="entities">
		{#if entities}
			<NoteItems {entities} />
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
	.entities {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
