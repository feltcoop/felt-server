<script lang="ts">
	import {get} from 'svelte/store';
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import CommunityNavButton from '$lib/ui/CommunityNavButton.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {
			sessionPersonas,
			personaSelection,
			communitySelection,
			communitiesByPersonaId,
			contextmenu,
		},
	} = getApp();

	$: selectedPersona = $personaSelection!;
	$: selectedCommunity = $communitySelection;

	// TODO improve the efficiency of this with better data structures and caching --
	// probably `communitiesByPersona` (where the keys are the persona stores)
	const toPersonaCommunity = (persona: Persona): Readable<Community> =>
		$communitiesByPersonaId[persona.persona_id].find((c) => get(c).name === persona.name)!;
</script>

<nav class="community-nav">
	<!-- TODO maybe refactor this to be nested elements instead of a flat list -->
	{#each $sessionPersonas as persona (persona)}
		<div class="persona-group" use:contextmenu.action={{ActingPersonaContextmenu: persona}}>
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
		</div>
	{/each}
</nav>

<style>
	.community-nav {
		/* height: 100%; */
		width: auto;
		background-color: var(--tint_dark_1);
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}
	.persona-group {
		margin-bottom: var(--spacing_xl5);
	}
	.persona-group:last-child {
		margin-bottom: 0;
	}
</style>
