<script lang="ts">
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import type {Readable} from 'svelte/store';

	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';

	const {dispatch} = getApp();

	export let community: Readable<Community>;
	export let persona: Readable<Persona>;

	let errorMessage: string | undefined;

	const leaveCommunity = async (community_id: number) => {
		errorMessage = '';
		const result = await dispatch('DeleteMembership', {
			persona_id: $persona.persona_id,
			community_id,
		});
		if (!result.ok) {
			errorMessage = result.message;
		}
	};
</script>

{#if $community.type !== 'personal' && !($persona.type === 'community' && $persona.community_id === $community.community_id)}
	<li>
		<div class="community-badge">
			<button type="button" on:click={() => leaveCommunity($community.community_id)}> 👋 </button>
			<!-- TODO refactor, probably extract a component -->
			{$community.name}
		</div>
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
	</li>
{/if}

<style>
	.community-badge {
		display: flex;
		font-size: xx-large;
	}
</style>
