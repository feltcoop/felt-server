<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/vocab/space/space.js';
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import type {Community} from '$lib/vocab/community/community.js';
	import MembershipInput from '$lib/ui/MembershipInput.svelte';

	export let community: Community;
	export let spaces: Space[];
	export let selectedSpace: Space | null;
	$: browser && console.log('spaces', spaces);
</script>

<div class="space-nav">
	<div class="header">
		<SpaceInput {community} />
		<MembershipInput {community} />
	</div>
	<!-- TODO the community url -->
	{#each spaces as space (space.space_id)}
		<a
			href="/{community.name}{space.url === '/' ? '' : space.url}"
			class:selected={space === selectedSpace}
		>
			{space.name}
		</a>
	{/each}
</div>

<style>
	.space-nav {
		height: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
	}

	a {
		padding: var(--spacing_xs) var(--spacing_sm);
	}
	a:hover {
		/* TODO update Felt and use `--tint_light_N` */
		background-color: rgba(255, 255, 255, 50%);
	}
	a.selected {
		background-color: var(--interactive_color_active);
	}
</style>
