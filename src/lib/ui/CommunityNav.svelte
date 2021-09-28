<script lang="ts">
	import {get} from 'svelte/store';
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import CommunityInput from '$lib/ui/CommunityInput.svelte';
	import CommunityNavButton from '$lib/ui/CommunityNavButton.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {
			sessionPersonas,
			selectedPersona,
			selectedCommunity,
			communitiesByPersonaId,
			selectPersona,
		},
	} = getApp();

	// TODO improve the efficiency of this with better data structures and caching
	const toPersonaCommunity = (persona: Persona): Readable<Community> =>
		$communitiesByPersonaId[persona.persona_id].find((c) => get(c).name === persona.name)!;
</script>

<div class="community-nav">
	<div class="header">
		<CommunityInput />
	</div>
	<!-- TODO maybe refactor this to be nested elements instead of a flat list -->
	<div>
		{#each $sessionPersonas as persona (persona)}
			<!-- TODO refactor this hacky usage of `get` -->
			<CommunityNavButton
				community={toPersonaCommunity(get(persona))}
				{persona}
				selected={persona === $selectedPersona &&
					toPersonaCommunity(get(persona)) === $selectedCommunity}
				{selectPersona}
			/>
			{#each $communitiesByPersonaId[get(persona).persona_id] as community (community)}
				{#if get(community).name !== get(persona).name}
					<CommunityNavButton
						{community}
						{persona}
						selected={persona === $selectedPersona && community === $selectedCommunity}
						{selectPersona}
					/>
				{/if}
			{/each}
		{/each}
	</div>
</div>

<style>
	.community-nav {
		height: 100%;
		border-right: var(--border);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}
	.header :global(button) {
		width: 100%;
	}
</style>
