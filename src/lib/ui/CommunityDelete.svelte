<script lang="ts">
	import type {Readable} from 'svelte/store';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {getApp} from '$lib/ui/app';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';

	const {dispatch} = getApp();

	export let community: Readable<Community>;
	export let persona: Readable<Persona>;
	export let done: (() => void) | undefined = undefined;

	let errorMessage: string | undefined;
	let pending = false;
	let lockText = '';
	$: locked = lockText.toLowerCase().trim() !== $community.name.toLowerCase();

	const deleteCommunity = async () => {
		pending = true;
		errorMessage = '';
		const result = await dispatch.DeleteCommunity({
			community_id: $community.community_id,
		});
		if (result.ok) {
			done?.();
		} else {
			errorMessage = result.message;
		}
		pending = false;
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (!locked) {
				await deleteCommunity();
			}
		}
	};
</script>

<div class="markup">
	<h1>Delete Community?</h1>
	<section class="row">
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
		<input
			type="text"
			name="name"
			placeholder=">enter name to unlock button"
			bind:value={lockText}
			on:keydown={onKeydown}
		/>
		<PendingButton {pending} disabled={locked || pending} on:click={deleteCommunity}>
			Delete community
		</PendingButton>
	</form>
</div>
