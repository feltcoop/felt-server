<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/vocab/space/space.js';
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import type {CommunityModel} from '$lib/vocab/community/community.js';
	import MembershipInput from '$lib/ui/MembershipInput.svelte';
	import SpaceNavButton from '$lib/ui/SpaceNavButton.svelte';
	import type {Persona} from '$lib/vocab/persona/persona.js';

	export let community: CommunityModel;
	export let spaces: Space[];
	export let selectedSpace: Space | null;
	export let selectedPersona: Persona;
	export let allPersonas: Persona[];
	$: browser && console.log('spaces', spaces);
</script>

<div class="space-nav">
	<div class="header">
		<SpaceInput {community} />
		<MembershipInput {community} {allPersonas} />
	</div>
	<!-- TODO the community url -->
	{#each spaces as space (space.space_id)}
		<SpaceNavButton
			persona={selectedPersona}
			{community}
			{space}
			selected={space === selectedSpace}
		/>
	{/each}
</div>

<style>
	.space-nav {
		height: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
	}

	a {
		padding: var(--spacing_xs) var(--spacing_sm);
	}
</style>
