<script lang="ts">
	import {browser} from '$app/env';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';
	import type {Readable} from 'svelte/store';

	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Community} from '$lib/vocab/community/community';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {EntityData} from '$lib/vocab/entity/entityData';
	import TodoItems from '$lib/ui/TodoItems.svelte';
	import {getApp} from '$lib/ui/app';

	const {dispatch, socket} = getApp();

	export let persona: Readable<Persona>;
	export const community: Readable<Community> = undefined as any;
	export let space: Readable<Space>;

	let text = '';
	let list = false;

	$: shouldLoadEntities = browser && $socket.open;
	$: entities = shouldLoadEntities ? dispatch('QueryEntities', {space_id: $space.space_id}) : null;

	const createEntity = async () => {
		const content = text.trim(); // TODO parse to trim? regularize step?

		if (!content) return;

		const data: EntityData = list
			? {type: 'Collection', name: content}
			: {type: 'Note', content, checked: false};

		await dispatch('CreateEntity', {
			space_id: $space.space_id,
			data,
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

<div class="room">
	<div class="entities">
		{#if entities}
			<TodoItems {entities} />
		{:else}
			<PendingAnimation />
		{/if}
	</div>
	<input type="checkbox" bind:checked={list} />
	{#if list}
		<input placeholder="> create new list" on:keydown={onKeydown} bind:value={text} />
	{:else}
		<input placeholder="> create new todo" on:keydown={onKeydown} bind:value={text} />
	{/if}
</div>

<style>
	.room {
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
