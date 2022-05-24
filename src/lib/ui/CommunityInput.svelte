<script lang="ts">
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import HueInput from '@feltcoop/felt/ui/HueInput.svelte';
	import {goto} from '$app/navigation';
	import {page} from '$app/stores';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import Avatar from '$lib/ui/Avatar.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {randomHue} from '$lib/ui/color';
	import {toSpaceUrl} from '$lib/ui/url';

	const {
		dispatch,
		ui: {sessionPersonaIndices},
	} = getApp();

	export let persona: Readable<Persona>;
	export let done: (() => void) | undefined = undefined;

	let name = '';

	let chosenHue: number | undefined;
	$: hue = chosenHue ?? randomHue(name);

	let pending = false;
	let nameEl: HTMLInputElement;
	let errorMessage: string | null = null;

	// TODO formalize this (probably through the schema)
	$: name = name.replace(/[^a-zA-Z0-9-]+/gu, '');

	$: name, (errorMessage = null);

	const create = async (): Promise<void> => {
		if (!name) {
			errorMessage = 'please enter a name for your new community';
			nameEl.focus();
			return;
		}
		if (pending) return;
		pending = true;
		errorMessage = null;
		const result = await dispatch.CreateCommunity({
			name,
			persona_id: $persona.persona_id,
			settings: {hue},
		});
		pending = false;
		if (result.ok) {
			errorMessage = null;
			name = '';
			await goto(
				toSpaceUrl(result.value.community, null, $page.url.searchParams, {
					persona: $sessionPersonaIndices.get(persona) + '',
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

<div class="markup">
	<h1>Create a new Community</h1>
	<section class="row">
		<span class="spaced">as</span>
		<PersonaAvatar {persona} />
	</section>
	<section>
		<form>
			<input
				placeholder="> name"
				bind:value={name}
				bind:this={nameEl}
				use:autofocus
				on:keydown={onKeydown}
			/>
			<PendingButton on:click={create} {pending}>Create community</PendingButton>
			{#if errorMessage}
				<Message status="error">{errorMessage}</Message>
			{/if}
		</form>
	</section>
	{#if name}
		<section>
			<Avatar {name} type="Community" {hue} />
		</section>
		<details>
			<summary>Customize</summary>
			<div>
				<HueInput {hue} on:input={(e) => (chosenHue = e.detail)} />
			</div>
		</details>
	{/if}
</div>

<style>
	details {
		font-size: var(--font_size_lg);
	}
</style>
