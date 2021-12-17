<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Community} from '$lib/vocab/community/community.js';
	import EntityIcon from '$lib/ui/EntityIcon.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import {toSpaceUrl} from '$lib/ui/url';

	const {
		dispatch,
		ui: {selectedSpaceIdByCommunity, findSpaceById, sessionPersonaIndices},
	} = getApp();

	// TODO should this just use `ui` instead of taking all of these props?
	// could `ui` be more composable, so it could be easily reused e.g. in docs for demonstration purposes?

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let selected: boolean = false;

	$: selectedCommunitySpaceId = $selectedSpaceIdByCommunity[$community.community_id];
	$: selectedCommunitySpace =
		selectedCommunitySpaceId === null ? null : findSpaceById(selectedCommunitySpaceId);

	$: isPersonaHomeCommunity = $community.name === $persona.name;

	$: personaIndex = $sessionPersonaIndices.get(persona)!;
</script>

<!-- TODO can this be well abstracted via the Entity with a `link` prop? -->
<a
	class="community"
	href={toSpaceUrl(personaIndex, $community, selectedCommunitySpace && $selectedCommunitySpace)}
	class:selected
	class:persona={isPersonaHomeCommunity}
	style="--hue: {$community.settings.hue}"
	data-entity="community:{$community.name}"
	on:click={() => dispatch('select_persona', {persona_id: $persona.persona_id})}
>
	<!-- TODO maybe use `Avatar`? does `hue` need to be on the link? -->
	<EntityIcon name={$community.name} type="Community" />
</a>

<style>
	a {
		display: block;
		/* TODO better way to have active state? this makes the community nav wider than the luggage button! */
		padding: var(--spacing_xs);
	}
	/* TODO jucier selected state, maybe scaling up 10ish percent */
	.selected {
		background-color: var(--bg);
	}
	.persona {
		margin-top: var(--spacing_xl5);
		display: flex;
		justify-content: center;
		align-items: center;
		/* TODO do this layout without calculating */
		width: calc(var(--icon_size_md) + var(--spacing_xs) * 2);
		height: calc(var(--icon_size_md) + var(--spacing_xs) * 2);
		--icon_size: var(--icon_size_sm);
	}
	.persona:first-child {
		margin-top: 0;
	}
</style>
