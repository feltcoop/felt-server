<script lang="ts">
	import type {Readable} from 'svelte/store';
	import {page} from '$app/stores';

	import type {Space} from '$lib/vocab/space/space.js';
	import type {Community} from '$lib/vocab/community/community.js';
	import type {Persona} from '$lib/vocab/persona/persona.js';
	import {randomHue} from '$lib/ui/color';
	import {toSpaceUrl} from '$lib/ui/url';
	import {getApp} from '$lib/ui/app';
	import SpaceContextmenu from '$lib/app/contextmenu/SpaceContextmenu.svelte';
	import SpaceName from '$lib/ui/SpaceName.svelte';

	const {
		ui: {contextmenu, sessionPersonaIndices},
	} = getApp();

	export let persona: Readable<Persona>;
	export let space: Readable<Space>;
	export let community: Readable<Community>;
	export let selected = false;

	$: hue = randomHue($space.name); // TODO add custom setting on spaces

	$: personaIndex = $sessionPersonaIndices.get(persona)!;
</script>

<a
	href={toSpaceUrl($community, $space, $page.url.searchParams, {persona: personaIndex + ''})}
	class:selected
	class="space-info"
	style="--hue: {hue}"
	use:contextmenu.action={[[SpaceContextmenu, {persona, community, space}]]}
>
	<div class="name"><SpaceName {space} /></div>
	<div>
		{$space.url}
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
		display: flex;
		align-items: center;
	}
</style>
