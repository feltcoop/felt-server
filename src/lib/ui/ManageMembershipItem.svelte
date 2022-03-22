<script lang="ts">
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import type {Readable} from 'svelte/store';

	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';

	const {dispatch} = getApp();

	export let community: Readable<Community>;
	export let persona: Readable<Persona>;

	let errorMessage: string | undefined;

	const leaveCommunity = async (community_id: number) => {
		errorMessage = '';
		const result = await dispatch.DeleteMembership({
			persona_id: $persona.persona_id,
			community_id,
		});
		if (!result.ok) {
			errorMessage = result.message;
		}
	};
</script>

<li>
	<div class="row">
		<CommunityAvatar {community} />
		{#if $community.type === 'personal'}
			<button type="button" disabled>🏠</button>
		{:else}
			<button type="button" on:click={() => leaveCommunity($community.community_id)}> 👋 </button>
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
