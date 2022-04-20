<script lang="ts">
	import type {Readable} from 'svelte/store';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {getApp} from '$lib/ui/app';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';

	const {dispatch} = getApp();

	export let community: Readable<Community>;
	export let persona: Readable<Persona>;
	export let done: (() => void) | undefined = undefined;

	let errorMessage: string | undefined;
	let locked = true;
	let lockText = '';

	const deleteCommunity = async () => {
		errorMessage = '';
		const result = await dispatch.DeleteCommunity({
			community_id: $community.community_id,
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
			await deleteCommunity();
		}
	};

	const checkLocked = async () => {
		lockText === $community.name ? (locked = false) : (locked = true);
	};
</script>

<div class="markup">
	<h1>Delete Community?</h1>
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
		<input
			type="text"
			id="name"
			name="name"
			placeholder=">enter name to unlock button"
			on:input={checkLocked}
			bind:value={lockText}
		/>
		<button disabled={locked} type="button" on:click={deleteCommunity} on:keydown={onKeydown}>
			Delete space
		</button>
	</form>
</div>
