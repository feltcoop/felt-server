<script lang="ts">
	import type {Space} from '$lib/vocab/space/space.js';
	import type {Community} from '$lib/vocab/community/community.js';
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import {randomHue} from '$lib/ui/color';
	import {toSpaceUrl} from '$lib/vocab/persona/util';

	export let persona: Persona;
	export let community: Community;
	export let space: Space;
	export let selected: boolean = false;

	$: hue = randomHue(space.name); // TODO add custom setting on spaces
</script>

<a
	href={toSpaceUrl(persona, community, space)}
	class:selected
	class="space-info"
	style="--hue: {hue}"
>
	<div class="name">{space.name}</div>
	<div>
		{space.url}
	</div>
</a>

<style>
	.space-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}
	.name {
		font-size: var(--font_size_xl);
	}
</style>
