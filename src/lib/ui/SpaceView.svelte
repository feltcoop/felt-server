<script lang="ts">
	import {spaceViews} from '$lib/ui/spaceViews';
	import type {Space, SpaceViewData} from '$lib/vocab/space/space';
	import type {Persona} from '$lib/vocab/persona/persona';

	export let space: Space;
	export let memberPersonasById: Map<number, Persona>;

	const toSpaceData = (space: Space): SpaceViewData => {
		switch (space.media_type) {
			case 'application/fuz+json': {
				return JSON.parse(space.content);
			}
			default: {
				throw Error(`Unhandled space media type ${space.media_type}`);
			}
		}
	};

	$: spaceData = toSpaceData(space);
	$: component = spaceViews[spaceData.type];
</script>

{#if component}
	<svelte:component this={component} {space} {memberPersonasById} {...spaceData.props} />
{:else}
	unknown space type: {spaceData.type}
{/if}
