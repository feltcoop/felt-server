<script lang="ts">
	import type {Space} from '$lib/vocab/space/space.js';
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import type {Community} from '$lib/vocab/community/community.js';
	import MembershipInput from '$lib/ui/MembershipInput.svelte';
	import type {Readable} from 'svelte/store';
	import SpaceNavButton from '$lib/ui/SpaceNavButton.svelte';
	import type {Persona} from '$lib/vocab/persona/persona.js';

	export let selectedPersona: Readable<Persona>;
	export let community: Readable<Community>;
	export let spaces: Space[]; // TODO array of stores?
	export let selectedSpace: Readable<Space>;
</script>

<div class="space-nav">
	<div class="header">
		<SpaceInput {community} />
		<MembershipInput {community} />
	</div>
	<!-- TODO the community url -->
	{#each spaces as space (space.space_id)}
		<SpaceNavButton
			persona={selectedPersona}
			{community}
			{space}
			selected={space === $selectedSpace}
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
</style>
