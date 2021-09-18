<script lang="ts">
	import type {CommunityModel} from '$lib/vocab/community/community.js';
	import ActorIcon from '$lib/ui/ActorIcon.svelte';
	import {randomHue} from '$lib/ui/color';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import {toUrl} from '$lib/vocab/persona/constants';

	const {data} = getApp();

	// TODO should this just use `ui` instead of taking all of these props?
	// could `ui` be more composable, so it could be easily reused e.g. in docs for demonstration purposes?

	export let persona: Persona;
	export let community: CommunityModel;
	export let selected: boolean = false;
	// export let communitiesByPersonaId: {
	// 	[persona_id: number]: CommunityModel[];
	// };
	export let selectedSpaceIdByCommunity: {[key: number]: number | null};
	// TODO this is causing a double state change (rendering an invalid in between state)
	// because it's both navigating and setting state internally in the same user action
	// TODO should this be an event?
	export let selectPersona: (persona_id: number) => void;

	// TODO should `$data.spaces` be a prop like the rest?
	// TODO speed this up with better caching data structures
	$: selectedSpace =
		$data.spaces.find((s) => s.space_id === selectedSpaceIdByCommunity[community.community_id]) ||
		null;
</script>

<a
	class="community"
	href="/{community.name}{toUrl(selectedSpace && selectedSpace.url)}"
	class:selected
	class:persona={community.name === persona.name}
	style="--hue: {randomHue(community.name)}"
	on:click={() => selectPersona(persona.persona_id)}
>
	<ActorIcon name={community.name} />
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
