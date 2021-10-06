<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';

	const {
		api: {dispatch},
		ui: {selectedPersonaId},
	} = getApp();

	let opened = false;
	let name = '';
	let pending = false;
	let errorMessage: string | null = null;

	const create = async (): Promise<void> => {
		if (pending) return;
		errorMessage = null;
		pending = true;
		const result = await dispatch('create_community', {name, persona_id: $selectedPersonaId!});
		pending = false;
		errorMessage = result.ok ? null : result.reason;
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await create();
			name = '';
			opened = false;
		}
	};
</script>

<!--TODO: Make an IconButton component in felt and use it here-->
<button
	aria-label="Create Community"
	type="button"
	class="button-emoji"
	on:click={() => (opened = true)}
>
	➕
</button>
{#if opened}
	<Dialog on:close={() => (opened = false)}>
		<Markup>
			<h1>Create a new community</h1>
			<form>
				<input placeholder="> name" on:keydown={onKeydown} bind:value={name} use:autofocus />
				<PendingButton type="button" on:click={() => create()} {pending}>
					Create community
				</PendingButton>
			</form>
			{#if errorMessage}
				<Message status="error">{errorMessage}</Message>
			{/if}
		</Markup>
	</Dialog>
{/if}

<style>
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
