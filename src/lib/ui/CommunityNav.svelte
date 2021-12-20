<script lang="ts">
	import {get} from 'svelte/store';
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import CommunityInput from '$lib/ui/CommunityInput.svelte';
	import CommunityNavButton from '$lib/ui/CommunityNavButton.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {sessionPersonas, personaSelection, communitySelection, communitiesByPersonaId},
	} = getApp();

	$: selectedPersona = $personaSelection!;
	$: selectedCommunity = $communitySelection;

	// TODO improve the efficiency of this with better data structures and caching
	const toPersonaCommunity = (persona: Persona): Readable<Community> =>
		$communitiesByPersonaId[persona.persona_id].find((c) => get(c).name === persona.name)!;
</script>

<div class="community-nav">
	<div class="header">
		<CommunityInput persona={selectedPersona} />
	</div>
	<!-- TODO maybe refactor this to be nested elements instead of a flat list -->
	<div>
		{#each $sessionPersonas as persona (persona)}
			<!-- TODO refactor this hacky usage of `get` -->
			<CommunityNavButton
				community={toPersonaCommunity(get(persona))}
				{persona}
				selected={persona === selectedPersona &&
					toPersonaCommunity(get(persona)) === selectedCommunity}
			/>
			{#each $communitiesByPersonaId[get(persona).persona_id] as community (community)}
				{#if get(community).name !== get(persona).name}
					<CommunityNavButton
						{community}
						{persona}
						selected={persona === selectedPersona && community === selectedCommunity}
					/>
				{/if}
			{/each}
		{/each}
	</div>
</div>

<style>
	.community-nav {
		height: 100%;
		background-color: var(--tint_dark_1);
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
