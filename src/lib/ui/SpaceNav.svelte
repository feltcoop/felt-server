<script lang="ts">
	import type {Space} from '$lib/vocab/space/space.js';
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import type {Community} from '$lib/vocab/community/community.js';
	import MembershipInput from '$lib/ui/MembershipInput.svelte';
	import type {Readable} from 'svelte/store';
	import {getApp} from '$lib/ui/app';

	const {
		api: {dispatch},
		ui: {mobile, expandMainNav},
	} = getApp();

	export let community: Readable<Community>;
	export let spaces: Space[]; // TODO array of stores?
	export let selectedSpace: Readable<Space>;
</script>

<div class="space-nav">
	<div class="header">
		<SpaceInput {community} />
		<MembershipInput {community} />
	</div>
	<!-- TODO the community url -->
	{#each spaces as space (space.space_id)}
		<a
			href="/{$community.name}{space.url === '/' ? '' : space.url}"
			class:selected={space === $selectedSpace}
			on:click={() => {
				// TODO Should this be a click handler or react to UI system events/changes?
				// Might make more UX sense to make it react to any state changes,
				// no matter the source -- e.g. we'll add commands that don't involve this click handler.
				// That's probably what the user wants,
				// but the problem is that we also want to close the main nav
				// when the user clicks the already-selected space. For now this is fine.
				if ($mobile && $expandMainNav) dispatch('toggle_main_nav');
			}}
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
