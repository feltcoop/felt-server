<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import type {AsyncStatus} from '@feltcoop/felt';

	import type {PersonaParams} from '$lib/vocab/persona/persona';
	import {autofocus} from '$lib/ui/actions';

	export let createPersona: (personaParams: PersonaParams) => Promise<unknown>; // TODO return type?

	let name = '';
	let status: AsyncStatus = 'initial'; // TODO refactor
	let inputEl: HTMLInputElement;

	// TODO add initial hue!

	const create = async () => {
		if (!name) {
			inputEl.focus();
			return;
		}
		status = 'pending';
		await createPersona({name});
		status = 'success'; // TODO handle failure (also refactor to be generic)
		name = '';
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await create();
		}
	};
</script>

<Markup>
	<h2>Create a persona</h2>
	<form>
		<input
			type="text"
			placeholder="> name"
			bind:this={inputEl}
			bind:value={name}
			use:autofocus
			disabled={status === 'pending'}
			on:keydown={onKeydown}
		/>
		<button type="button" on:click={create} disabled={status === 'pending'}> Create </button>
	</form>
</Markup>

<style>
	h2 {
		text-align: center;
	}
</style>
