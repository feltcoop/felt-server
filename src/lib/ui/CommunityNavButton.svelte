<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import ActorIcon from '$lib/ui/ActorIcon.svelte';
	import {randomHue} from '$lib/ui/color';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import {toUrl} from '$lib/vocab/persona/constants';

	const {
		ui: {selectedSpaceIdByCommunity, findSpaceById},
	} = getApp();

	// TODO should this just use `ui` instead of taking all of these props?
	// could `ui` be more composable, so it could be easily reused e.g. in docs for demonstration purposes?

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let selected: boolean = false;

	$: selectedCommunitySpaceId = $selectedSpaceIdByCommunity[$community.community_id];
	$: selectedCommunitySpace =
		selectedCommunitySpaceId === null ? null : findSpaceById(selectedCommunitySpaceId);

	// TODO this is causing a double state change (rendering an invalid in between state)
	// because it's both navigating and setting state internally in the same user action
	// TODO should this be an event?
	export let selectPersona: (persona_id: number) => void;
</script>

<!-- TODO can this be well abstracted via the Entity with a `link` prop? -->
<a
	class="community"
	href="/{$community.name}{toUrl(selectedCommunitySpace && $selectedCommunitySpace.url)}"
	class:selected
	class:persona={$community.name === $persona.name}
	style="--hue: {randomHue($community.name)}"
	on:click={() => selectPersona($persona.persona_id)}
>
	<ActorIcon name={$community.name} />
</a>

<style>
	a {
		display: block;
		/* TODO better way to have active state? this makes the community nav wider than the luggage button! */
		border: 1px solid transparent;
	}
	/* TODO jucier selected state, maybe scaling up 10ish percent */
	.selected {
		border-color: var(--active_color);
		background-color: var(--bg);
	}
	.persona {
		margin-top: var(--spacing_xl5);
		display: flex;
		justify-content: center;
		align-items: center;
		width: var(--icon_size_md);
		height: var(--icon_size_md);
		--icon_size: var(--icon_size_sm);
	}
	.persona:first-child {
		margin-top: 0;
	}
</style>
