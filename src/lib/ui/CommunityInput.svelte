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
	let errorMessage: string | null = null;

	const create = async (): Promise<void> => {
		if (pending) return;
		errorMessage = null;
		pending = true;
		const result = await dispatch('CreateCommunity', {name, persona_id: $persona.persona_id});
		pending = false;
		errorMessage = result.ok ? null : result.message;
		name = '';
		done?.();
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
		<input placeholder="> name" on:keydown={onKeydown} bind:value={name} use:autofocus />
		<PendingButton type="button" on:click={() => create()} {pending}>
			Create community
		</PendingButton>
	</form>
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
	{/if}
</div>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
