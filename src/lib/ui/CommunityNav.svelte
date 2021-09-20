<script lang="ts">
	import type {CommunityModel} from '$lib/vocab/community/community.js';
	import CommunityInput from '$lib/ui/CommunityInput.svelte';
	import CommunityNavButton from '$lib/ui/CommunityNavButton.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';

	const {data, ui} = getApp();

	$: selectedPersona = ui.selectedPersona;
	$: selectedCommunity = ui.selectedCommunity;
	$: communitiesByPersonaId = ui.communitiesByPersonaId;

	$: selectedSpaceIdByCommunity = $ui.selectedSpaceIdByCommunity;

	// TODO improve the efficiency of this with better data structures and caching
	const toPersonaCommunity = (persona: Persona): CommunityModel =>
		$communitiesByPersonaId[persona.persona_id].find((c) => c.name === persona.name)!;
</script>

<div class="community-nav">
	<div class="header">
		<CommunityInput />
	</div>
	<!-- TODO maybe refactor this to be nested elements instead of a flat list -->
	<div>
		{#each $data.personas as persona (persona.persona_id)}
			<CommunityNavButton
				community={toPersonaCommunity(persona)}
				{persona}
				selected={persona === $selectedPersona &&
					toPersonaCommunity(persona) === $selectedCommunity}
				{selectedSpaceIdByCommunity}
				selectPersona={ui.selectPersona}
			/>
			{#each $communitiesByPersonaId[persona.persona_id] as community (community.community_id)}
				{#if community.name !== persona.name}
					<CommunityNavButton
						{community}
						{persona}
						selected={persona === $selectedPersona && community === $selectedCommunity}
						{selectedSpaceIdByCommunity}
						selectPersona={ui.selectPersona}
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
