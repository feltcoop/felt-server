<script lang="ts">
	import {spaceViews} from '$lib/ui/spaceViews';
	import type {Space, SpaceViewData} from '$lib/vocab/space/space';
	import type {Member} from '$lib/vocab/member/member';

	export let space: Space;
	export let membersById: Map<number, Member>;

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
	<svelte:component this={component} {space} {membersById} {...spaceData.props} />
{:else}
	unknown space type: {spaceData.type}
{/if}
