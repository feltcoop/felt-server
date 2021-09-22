<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	import type {Space} from '$lib/vocab/space/space.js';
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import PersonaInfo from '$lib/ui/PersonaInfo.svelte';
	import SpaceInfo from '$lib/ui/SpaceInfo.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';

	const {ui} = getApp();

	export let community: Community;
	export let space: Space;
	export let memberPersonasById: Map<number, Persona>;

	// TODO refactor to be normalized
	// this will also fix the UX issue where `spaces` aren't available for SSR, so they pop in
	$: spaces = community?.spaces || [];

	$: selectedSpace = ui.selectedSpace;
	$: selectedCommunity = ui.selectedCommunity;
	$: community = $selectedCommunity!; // TODO assert? or is this wrong?

	// TODO cache data better to speed this up!!
	$: personas = Array.from(memberPersonasById.values());
</script>

<Markup>
	<section>
		<h2>members</h2>
		<!-- TODO display other meta info about the community -->
		{#each personas as persona (persona.persona_id)}
			<PersonaInfo {persona} />
		{/each}
	</section>
	<section>
		<!-- TODO this is just a stubbed out idea -->
		<h2>recent spaces</h2>
		{#each spaces as space (space.space_id)}
			<SpaceInfo {space} {community} selected={space === $selectedSpace} />
		{/each}
	</section>
	<section>
		<!-- TODO this is just a stubbed out idea -->
		<h2>activity</h2>
		<code>TODO</code>
	</section>
</Markup>

<style>
	section {
		margin: var(--spacing_xl4) 0;
	}
</style>
