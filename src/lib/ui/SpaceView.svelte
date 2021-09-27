<script lang="ts">
	import type {Readable} from 'svelte/store';

	import {spaceViews} from '$lib/ui/spaceViews';
	import type {Space, SpaceViewData} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';

	export let community: Readable<Community>;
	export let space: Readable<Space | null>; // TODO the `| null` is a hack that gets bypassed below, not sure how to make it work with nullable "selected" stores

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

	$: spaceData = toSpaceData($space!);
	$: component = spaceViews[spaceData.type];
</script>

{#if component}
	<svelte:component this={component} {community} {space} {...spaceData.props} />
{:else}
	unknown space type: {spaceData.type}
{/if}
