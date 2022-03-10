<script lang="ts">
	import type {Readable} from 'svelte/store';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {getApp} from '$lib/ui/app';
	import type {Space} from '$lib/vocab/space/space';
	import SpaceName from '$lib/ui/SpaceName.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import {type Community} from '$lib/vocab/community/community';
	import {type Persona} from '$lib/vocab/persona/persona';

	const {dispatch} = getApp();

	export let space: Readable<Space>;
	export let community: Readable<Community>;
	export let persona: Readable<Persona>;
	export let done: (() => void) | undefined = undefined;

	let errorMessage: string | undefined;

	const deleteSpace = async () => {
		errorMessage = '';
		const result = await dispatch('DeleteSpace', {
			space_id: $space.space_id,
		});
		if (result.ok) {
			done?.();
		} else {
			errorMessage = result.message;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await deleteSpace();
		}
	};
</script>

<div class="markup">
	<h1>Delete Space?</h1>
	<section class="row" style:font-size="var(--font_size_xl)">
		<SpaceName {space} />
	</section>
	<section class="row">
		<span class="spaced">in</span>
		<CommunityAvatar {community} />
	</section>
	<section class="row">
		<span class="spaced">as</span>
		<PersonaAvatar {persona} />
	</section>
	<form>
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
		<button type="button" on:click={deleteSpace} on:keydown={onKeydown}> Delete space </button>
	</form>
</div>
