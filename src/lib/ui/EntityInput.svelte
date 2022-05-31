<script lang="ts">
	import type {AsyncStatus} from '@feltcoop/felt';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';

	const {
		dispatch,
		ui: {personaSelection, spaceSelection},
	} = getApp();

	export let done: (() => void) | undefined = undefined;

	$: selectedPersona = $personaSelection;
	$: persona_id = $selectedPersona!.persona_id;
	$: selectedSpace = $spaceSelection;
	$: source_id = $selectedSpace!.directory_id;

	let name = '';
	let status: AsyncStatus = 'initial'; // TODO refactor
	let nameEl: HTMLInputElement;
	let errorMessage: string | null = null;

	// TODO add initial hue!

	const create = async () => {
		//TODO validate inputs
		name = name.trim();
		if (!name) {
			errorMessage = 'please enter a name for your new list';
			nameEl.focus();
			return;
		}
		status = 'pending';
		const result = await dispatch.CreateEntity({
			persona_id,
			data: {type: 'Collection', name},
			source_id,
		});
		status = 'success'; // TODO handle failure (also refactor to be generic)
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

<div class="markup padded-xl">
	<h1>New list</h1>
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
		<PendingButton on:click={create} pending={status === 'pending'}>Create entity</PendingButton>
	</form>
</div>

<style>
</style>
