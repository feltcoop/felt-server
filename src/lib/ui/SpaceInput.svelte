<script lang="ts">
	import type {Readable} from 'svelte/store';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import type {Community} from '$lib/vocab/community/community.js';
	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import {availableViewTypes} from '$lib/vocab/view/view';
	import {toName, toIcon} from '$lib/vocab/entity/entity';
	import Avatar from '$lib/ui/Avatar.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';

	const {dispatch} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let done: (() => void) | undefined = undefined;

	let name = '';
	let type = availableViewTypes[0];

	let pending = false;
	let nameEl: HTMLInputElement;
	let errorMessage: string | null = null;

	// TODO formalize this (probably through the schema)
	$: name = name.replace(/[^a-zA-Z0-9-]+/g, '');

	const create = async () => {
		if (!name) {
			errorMessage = 'please enter a name for your new space';
			nameEl.focus();
			return;
		}
		if (pending) return;
		pending = true;
		errorMessage = null;
		//Needs to collect url(i.e. name for now), type (currently default application/json), & content (hardcoded JSON struct)
		const url = `/${name}`;
		const result = await dispatch('CreateSpace', {
			community_id: $community.community_id,
			name,
			url,
			//TODO : add space type picker
			media_type: 'application/fuz+json',
			content: `{"type": "${type}", "props": {"data": "/entities"}}`,
		});
		pending = false;
		if (result.ok) {
			errorMessage = null;
			name = '';
			done?.();
		} else {
			errorMessage = result.message;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await create();
		}
	};
</script>

<div class="markup">
	<h1>Create a new space</h1>
	<section>
		<!-- TODO likely make these a `select` or picker -->
		<Avatar name={toName($persona)} icon={toIcon($persona)} />
		<Avatar name={$community.name} type="Community" />
	</section>
	<form>
		<input
			placeholder="> name"
			bind:value={name}
			bind:this={nameEl}
			use:autofocus
			on:keydown={onKeydown}
		/>
		<label>
			Select Type:
			<select class="type-selector" bind:value={type}>
				{#each availableViewTypes as type (type)}
					<option value={type}>{type}</option>
				{/each}
			</select>
		</label>
		<PendingButton type="button" on:click={create} {pending}>Create space</PendingButton>
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
	</form>
</div>

<style>
	.type-selector {
		margin-left: var(--spacing_xs);
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
