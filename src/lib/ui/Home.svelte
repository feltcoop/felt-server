<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	import type {Space} from '$lib/vocab/space/space.js';
	import Avatar from '$lib/ui/Avatar.svelte';
	import SpaceInfo from '$lib/ui/SpaceInfo.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import {toName, toIcon} from '$lib/vocab/entity/entity';

	const {
		ui: {selectedSpace},
	} = getApp();

	export let community: Community;
	export let space: Space;

	space; // TODO we're ignoring the space, but should probably mount its `content` as markup

	// TODO refactor to be normalized
	// this will also fix the UX issue where `spaces` aren't available for SSR, so they pop in
	$: spaces = community?.spaces || [];
</script>

<Markup>
	<section>
		<h2>members</h2>
		<!-- TODO display other meta info about the community -->
		{#each community.memberPersonas as persona (persona.persona_id)}
			<Avatar name={toName(persona)} icon={toIcon(persona)} />
		{/each}
	</section>
	<section>
		<!-- TODO this is just a stubbed out idea -->
		<h2>recent spaces</h2>
		{#each spaces as space (space.space_id)}
			<SpaceInfo {space} {community} selected={space === $selectedSpace} />
		{/each}
	</section>
	<section>
		<!-- TODO this is just a stubbed out idea -->
		<h2>activity</h2>
		<code>TODO</code>
	</section>
</Markup>

<style>
	section {
		margin: var(--spacing_xl4) 0;
	}
</style>
