<script lang="ts">
	import type {AsyncStatus} from '@feltcoop/felt';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import {goto} from '$app/navigation';
	import {page} from '$app/stores';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import {toSpaceUrl} from '$lib/ui/url';

	const {
		dispatch,
		ui: {sessionPersonaIndices, personaById},
	} = getApp();

	export let done: (() => void) | undefined = undefined;

	let name = '';
	let status: AsyncStatus = 'initial'; // TODO refactor
	let nameEl: HTMLInputElement;
	let errorMessage: string | null = null;

	// TODO add initial hue!

	const create = async () => {
		//TODO validate inputs
		name = name.trim();
		if (!name) {
			errorMessage = 'please enter a name for your new persona';
			nameEl.focus();
			return;
		}
		status = 'pending';
		const result = await dispatch.CreateAccountPersona({name});
		status = 'success'; // TODO handle failure (also refactor to be generic)
		if (result.ok) {
			errorMessage = null;
			name = '';
			await goto(
				toSpaceUrl(result.value.community, null, $page.url.searchParams, {
					persona:
						$sessionPersonaIndices.get(personaById.get(result.value.persona.persona_id)!) + '',
				}),
			);
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

<div class="markup padded-xl">
	<h1>Create a Persona</h1>
	<form>
		<input
			placeholder="> name"
			bind:this={nameEl}
			bind:value={name}
			use:autofocus
			disabled={status === 'pending'}
			on:keydown={onKeydown}
		/>
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
		<PendingButton on:click={create} pending={status === 'pending'}>Create persona</PendingButton>
	</form>
	<div class="centered-block">
		<Message icon="‼">your persona name is visible to others</Message>
	</div>
</div>

<style>
	.centered-block {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
