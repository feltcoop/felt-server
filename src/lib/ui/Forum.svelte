<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';
	import type {Readable} from 'svelte/store';
	import {get} from 'svelte/store';

	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Community} from '$lib/vocab/community/community';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {Entity} from '$lib/vocab/entity/entity.js';
	import ForumItems from '$lib/ui/ForumItems.svelte';
	import ForumMessageItems from '$lib/ui/ForumMessageItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {dispatch, socket} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;

	persona; // silence unused prop warning
	community; // silence unused prop warning

	let text = '';
	let selectedThread: Readable<Entity> | null;

	const selectThread = (thread: Readable<Entity>) => {
		console.log(get(thread).entity_id);
		selectedThread = thread;
	};

	$: shouldLoadEntities = browser && $socket.connected;
	$: threadEntities = shouldLoadEntities
		? dispatch('QueryEntities', {space_id: $space.space_id, entity_ids: [], types: ['Thread']})
		: null;

	//PASS FUNCTION THAT REF THIS, NOT THIS
	$: selectedThread = null;

	$: messages = selectedThread ? JSON.parse($selectedThread.content).messages : null;
	$: postEntities = selectedThread ? readEntities() : null;

	//THIS IS A HACK; need to find a better caching mechanism for QueryEntities
	const readEntities = async () => {
		const result = await dispatch('ReadEntities', {
			space_id: $space.space_id,
			entity_ids: messages,
			types: ['Message'],
		});
		if (result.ok) {
			console.log(result.value.entities);
			return result.value;
		} else {
			console.log('error retrieving messages');
			return null;
		}
	};

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?
		if (!content) return;
		await dispatch('CreateEntity', {
			space_id: $space.space_id,
			content,
			actor_id: $persona.persona_id,
		});
		text = '';
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await createEntity();
		}
	};

	$: {
		if (postEntities) {
			console.log(postEntities);
		}
	}
</script>

<div class="forum">
	<textarea placeholder="> new topic" on:keydown={onKeydown} bind:value={text} />
	<div class="entities">
		{#if postEntities}
			{#await postEntities then value}
				<ForumMessageItems entities={value.entities} {selectedThread} {selectThread} />
			{/await}
		{:else if threadEntities}
			<ForumItems entities={threadEntities} {selectedThread} {selectThread} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
</div>

<style>
	.forum {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden; /* make the content scroll */
	}
	.entities {
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
