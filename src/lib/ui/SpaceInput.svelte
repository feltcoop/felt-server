<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import {goto} from '$app/navigation';
	import {page} from '$app/stores';

	import type {Community} from '$lib/vocab/community/community.js';
	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import {viewTemplates} from '$lib/vocab/view/view';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {parseSpaceIcon} from '$lib/vocab/space/spaceHelpers';
	import {toSpaceUrl} from '$lib/ui/url';

	// TODO does this belong in `view`?
	const creatableViewTemplates = viewTemplates.filter((v) => v.creatable !== false);

	const {
		dispatch,
		ui: {sessionPersonaIndices},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let done: (() => void) | undefined = undefined;

	let name = '';
	let selectedViewTemplate = creatableViewTemplates[0];
	$: ({icon} = selectedViewTemplate);

	let pending = false;
	let nameEl: HTMLInputElement;
	let iconEl: HTMLInputElement;
	let errorMessage: string | null = null;

	// TODO formalize this (probably through the schema)
	$: name = name.replace(/[^a-zA-Z0-9-]+/gu, '');

	const create = async () => {
		if (!name) {
			errorMessage = 'please enter a name for your new space';
			nameEl.focus();
			return;
		}
		const iconResult = parseSpaceIcon(icon);
		if (!iconResult.ok) {
			errorMessage = iconResult.message;
			iconEl.focus();
			return;
		}
		if (pending) return;
		pending = true;
		errorMessage = null;
		const result = await dispatch.CreateSpace({
			persona_id: $persona.persona_id,
			community_id: $community.community_id,
			name,
			url: `/${name}`,
			icon: iconResult.value,
			view: selectedViewTemplate.view,
		});
		pending = false;
		if (result.ok) {
			errorMessage = null;
			name = '';
			await goto(
				toSpaceUrl($community, result.value.space, $page.url.searchParams, {
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

<div class="markup padded-xl">
	<h1>Create a new Space</h1>
	<section class="row">
		<span class="spaced">in</span>
		<CommunityAvatar {community} />
	</section>
	<section class="row">
		<span class="spaced">as</span>
		<PersonaAvatar {persona} />
	</section>
	<form>
		<input
			name="name"
			placeholder="> name"
			bind:value={name}
			bind:this={nameEl}
			use:autofocus
			on:keydown={onKeydown}
		/>
		<input placeholder="> icon" bind:this={iconEl} bind:value={icon} on:keydown={onKeydown} />
		<label>
			Select Type:
			<select class="type-selector" bind:value={selectedViewTemplate}>
				{#each creatableViewTemplates as viewTemplate}
					<option value={viewTemplate}>{viewTemplate.name}</option>
				{/each}
			</select>
		</label>
		<PendingButton on:click={create} {pending}>Create space</PendingButton>
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
	</form>
</div>

<style>
	.type-selector {
		margin-left: var(--spacing_xs);
	}
</style>
