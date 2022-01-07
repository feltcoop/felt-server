<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
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

	let opened = false;
	let name = '';
	let pending = false;
	let errorMessage: string | null = null;

	const create = async (): Promise<void> => {
		if (pending) return;
		errorMessage = null;
		pending = true;
		const result = await dispatch('CreateCommunity', {name, persona_id: $persona.persona_id});
		pending = false;
		errorMessage = result.ok ? null : result.message;
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
		<div class="markup">
			<h1>Create a new community</h1>
			<section>
				<!-- TODO likely make this a `select` or picker -->
				<Avatar name={toName($persona)} icon={toIcon($persona)} />
			</section>
			<form>
				<input placeholder="> name" on:keydown={onKeydown} bind:value={name} use:autofocus />
				<PendingButton type="button" on:click={() => create()} {pending}>
					Create community
				</PendingButton>
			</form>
			{#if errorMessage}
				<Message status="error">{errorMessage}</Message>
			{/if}
		</div>
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
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
