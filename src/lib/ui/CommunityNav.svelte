<script lang="ts">
	import {get} from 'svelte/store';
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import CommunityNavButton from '$lib/ui/CommunityNavButton.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import ActingPersonaContextmenu from '$lib/app/contextmenu/ActingPersonaContextmenu.svelte';

	const {
		ui: {
			sessionPersonas,
			personaSelection,
			communitySelection,
			communitiesBySessionPersona,
			contextmenu,
		},
	} = getApp();

	$: selectedPersona = $personaSelection!;
	$: selectedCommunity = $communitySelection;

	// TODO improve the efficiency of this with better data structures and caching --
	// probably `communitiesByPersona` (where the keys are the persona stores)
	const toPersonaCommunity = (persona: Readable<Persona>): Readable<Community> =>
		$communitiesBySessionPersona.get(persona)!.find((c) => get(c).type === 'personal')!;

	const toStandardCommunities = (persona: Readable<Persona>): Readable<Community>[] =>
		$communitiesBySessionPersona.get(persona)!.filter((c) => get(c).type !== 'personal')!;
</script>

<nav class="community-nav">
	<!-- TODO maybe refactor this to be nested elements instead of a flat list -->
	{#each $sessionPersonas as persona (persona)}
		<div class="persona-group" use:contextmenu.action={[[ActingPersonaContextmenu, {persona}]]}>
			<!-- TODO refactor this hacky usage of `get` -->
			<CommunityNavButton
				community={toPersonaCommunity(persona)}
				{persona}
				selected={persona === selectedPersona && toPersonaCommunity(persona) === selectedCommunity}
			/>
			{#each toStandardCommunities(persona) as community (community)}
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
