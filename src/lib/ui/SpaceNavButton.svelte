<script lang="ts">
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {CommunityModel} from '$lib/vocab/community/community.js';
	import {toSpaceUrl} from '$lib/vocab/persona/util';

	export let persona: Persona;
	export let community: CommunityModel;
	export let space: Space;
	export let selected: boolean;
</script>

<a href={toSpaceUrl(persona, community, space)} class:selected>
	{space.name}
</a>

<style>
	a {
		padding: var(--spacing_xs) var(--spacing_sm);
	}
</style>
