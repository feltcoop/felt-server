<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

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
	const toPersonaCommunity = (
		persona: Readable<Persona>,
		$communitiesBySessionPersona: Map<Readable<Persona>, Array<Readable<Community>>>,
	): Readable<Community> =>
		$communitiesBySessionPersona.get(persona)!.find((c) => c.get().type === 'personal')!;

	const toStandardCommunities = (
		persona: Readable<Persona>,
		$communitiesBySessionPersona: Map<Readable<Persona>, Array<Readable<Community>>>,
	): Array<Readable<Community>> =>
		$communitiesBySessionPersona.get(persona)!.filter((c) => c.get().type !== 'personal')!;
</script>

<nav class="community-nav">
	<!-- TODO maybe refactor this to be nested elements instead of a flat list -->
	{#each $sessionPersonas as persona (persona)}
		<div class="persona-group" use:contextmenu.action={[[ActingPersonaContextmenu, {persona}]]}>
			<!-- TODO refactor this hacky usage of `get` -->
			<CommunityNavButton
				community={toPersonaCommunity(persona, $communitiesBySessionPersona)}
				{persona}
				selected={persona === selectedPersona &&
					toPersonaCommunity(persona, $communitiesBySessionPersona) === selectedCommunity}
			/>
			{#each toStandardCommunities(persona, $communitiesBySessionPersona) as community (community)}
				{#if community.get().name !== persona.get().name}
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
		width: 100%;
		margin-bottom: var(--navbar_size);
	}
	.persona-group:last-child {
		margin-bottom: 0;
	}
</style>
