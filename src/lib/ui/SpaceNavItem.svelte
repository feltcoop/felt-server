<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {page} from '$app/stores';

	import type {Persona} from '$lib/vocab/persona/persona.js';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {Community} from '$lib/vocab/community/community.js';
	import {toSpaceUrl} from '$lib/ui/url';
	import {getApp} from '$lib/ui/app';
	import SpaceContextmenu from '$lib/app/contextmenu/SpaceContextmenu.svelte';
	import SpaceName from '$lib/ui/SpaceName.svelte';
	import FreshnessIndicator from '$lib/ui/FreshnessIndicator.svelte';

	const {
		dispatch,
		ui: {contextmenu, mobile, expandMainNav, sessionPersonaIndices, freshnessByDirectoryId},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let space: Readable<Space>;
	export let selected: boolean;

	$: personaIndex = $sessionPersonaIndices.get(persona)!;
	$: fresh = freshnessByDirectoryId.get($space.directory_id)!;
</script>

<a
	href={toSpaceUrl($community, $space, $page.url.searchParams, {persona: personaIndex + ''})}
	class="selectable"
	class:selected
	use:contextmenu.action={[[SpaceContextmenu, {persona, community, space}]]}
	on:click={() => {
		// TODO Should this be a click handler or react to UI system events/changes?
		// Might make more UX sense to make it react to any state changes,
		// no matter the source -- e.g. we'll add commands that don't involve this click handler.
		// That's probably what the user wants,
		// but the problem is that we also want to close the main nav
		// when the user clicks the already-selected space. For now this is fine.
		if ($mobile && $expandMainNav) dispatch.ToggleMainNav();
	}}
>
	{#if $fresh}
		<FreshnessIndicator />
	{/if}
	<SpaceName {space} />
</a>

<style>
	a {
		position: relative;
		display: flex;
		align-items: center;
		text-decoration: none;
	}
</style>
