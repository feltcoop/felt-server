<script lang="ts">
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import type {Readable} from 'svelte/store';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import {toName, toIcon} from '$lib/vocab/entity/entity';
	import Avatar from '$lib/ui/Avatar.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';

	const {dispatch} = getApp();

	export let persona: Readable<Persona>;
	export let done: (() => void) | undefined = undefined;

	let name = '';

	let pending = false;
	let nameEl: HTMLInputElement;
	let errorMessage: string | null = null;

	// TODO this has a small bug because of component immutability,
	// where whitespace characters appear in the input until a non-space character is entered,
	// because the local `name` doesn't change, and so Svelte doens't update the input's value
	const updateName = (updated: string) => {
		// TODO formalize this (probably through the schema)
		name = updated.replace(/\W/g, '');
	};

	const create = async (): Promise<void> => {
		if (!name) {
			errorMessage = 'please enter a name for your new community';
			nameEl.focus();
			return;
		}
		if (pending) return;
		pending = true;
		errorMessage = null;
		const result = await dispatch('CreateCommunity', {name, persona_id: $persona.persona_id});
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
	<h1>Create a new community</h1>
	<section>
		<!-- TODO likely make this a `select` or picker -->
		<Avatar name={toName($persona)} icon={toIcon($persona)} />
	</section>
	<form>
		<input
			placeholder="> name"
			value={name}
			on:input={(e) => updateName(e.currentTarget.value)}
			bind:this={nameEl}
			use:autofocus
			on:keydown={onKeydown}
		/>
		<PendingButton type="button" on:click={create} {pending}>Create community</PendingButton>
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
	</form>
</div>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
