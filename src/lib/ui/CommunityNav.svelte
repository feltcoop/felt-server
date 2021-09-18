<script lang="ts">
	import type {CommunityModel} from '$lib/vocab/community/community.js';
	import CommunityInput from '$lib/ui/CommunityInput.svelte';
	import CommunityNavButton from '$lib/ui/CommunityNavButton.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';

	// TODO should this just use `ui` instead of taking all of these props?
	// could `ui` be more composable, so it could be easily reused e.g. in docs for demonstration purposes?

	export let personas: Persona[];
	export let selectedPersona: Persona | null;
	export let selectedCommunity: CommunityModel | null;
	export let communitiesByPersonaId: {
		[persona_id: number]: CommunityModel[];
	};
	export let selectedSpaceIdByCommunity: {[key: number]: number | null};
	// TODO this is causing a double state change (rendering an invalid in between state)
	// because it's both navigating and setting state internally in the same user action
	// TODO should this be an event?
	export let selectPersona: (persona_id: number) => void;

	// TODO improve the efficiency of this with better
	const toPersonaCommunity = (persona: Persona): CommunityModel =>
		communitiesByPersonaId[persona.persona_id].find((c) => c.name === persona.name)!;
</script>

<div class="community-nav">
	<div class="header">
		<CommunityInput />
	</div>
	<!-- TODO maybe refactor this to be nested elements instead of a flat list -->
	<div>
		{#each personas as persona (persona.persona_id)}
			<CommunityNavButton
				small={true}
				community={toPersonaCommunity(persona)}
				{persona}
				selected={persona === selectedPersona && toPersonaCommunity(persona) === selectedCommunity}
				{selectedSpaceIdByCommunity}
				{selectPersona}
			/>
			{#each communitiesByPersonaId[persona.persona_id] as community (community.community_id)}
				{#if community.name !== persona.name}
					<CommunityNavButton
						{community}
						{persona}
						selected={persona === selectedPersona && community === selectedCommunity}
						{selectedSpaceIdByCommunity}
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
