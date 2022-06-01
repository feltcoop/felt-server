<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {page} from '$app/stores';

	import type {Community} from '$lib/vocab/community/community.js';
	import EntityIcon from '$lib/ui/EntityIcon.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import {toSpaceUrl} from '$lib/ui/url';
	import CommunityContextmenu from '$lib/app/contextmenu/CommunityContextmenu.svelte';

	const {
		dispatch,
		ui: {contextmenu, spaceIdSelectionByCommunityId, spaceById, sessionPersonaIndices},
	} = getApp();

	// TODO should this just use `ui` instead of taking all of these props?
	// could `ui` be more composable, so it could be easily reused e.g. in docs for demonstration purposes?

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export let selected = false;

	$: spaceIdSelection = $spaceIdSelectionByCommunityId.value.get($community.community_id);
	$: selectedSpace = spaceIdSelection ? spaceById.get(spaceIdSelection)! : null;

	$: isPersonaHomeCommunity = $community.name === $persona.name;

	$: personaIndex = $sessionPersonaIndices.get(persona)!;
</script>

<!-- TODO can this be well abstracted via the Entity with a `link` prop? -->
<a
	class="community"
	href={toSpaceUrl($community, selectedSpace && $selectedSpace, $page.url.searchParams, {
		persona: personaIndex + '',
	})}
	class:selected
	class:persona={isPersonaHomeCommunity}
	style="--hue: {$community.settings.hue}"
	use:contextmenu.action={[[CommunityContextmenu, {community, persona}]]}
	on:click={() => dispatch.SelectPersona({persona_id: $persona.persona_id})}
>
	<!-- TODO maybe use `Avatar`? does `hue` need to be on the link? -->
	<EntityIcon name={$community.name} type="Community" />
</a>

<style>
	a {
		display: block;
		/* TODO better way to have active state? this makes the community nav wider than the luggage button! */
		padding: var(--spacing_xs);
		text-decoration: none;
	}
	/* TODO jucier selected state, maybe scaling up 10ish percent */
	.selected {
		background-color: var(--bg);
	}
	.persona {
		display: flex;
		justify-content: center;
		align-items: center;
		height: var(--luggage_size);
		--icon_size: var(--icon_size_sm);
	}
</style>
