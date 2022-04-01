<script lang="ts">
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import type {Readable} from 'svelte/store';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';

	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';

	const {dispatch} = getApp();

	export let community: Readable<Community>;
	export let persona: Readable<Persona>;

	let errorMessage: string | undefined;
	let pending = false;

	const leaveCommunity = async (community_id: number) => {
		errorMessage = '';
		pending = true;
		const result = await dispatch.DeleteMembership({
			persona_id: $persona.persona_id,
			community_id,
		});
		pending = false;
		if (!result.ok) {
			errorMessage = result.message;
		}
	};
</script>

<li>
	<div class="row">
		<CommunityAvatar {community} />
		{#if $community.type === 'personal'}
			<button disabled>🏠</button>
		{:else}
			<PendingButton {pending} on:click={() => leaveCommunity($community.community_id)}>
				👋
			</PendingButton>
		{/if}
	</div>
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
	{/if}
</li>

<style>
	.row {
		font-size: var(--font_size_xl);
		justify-content: space-between;
	}
</style>
