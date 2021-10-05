<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import type {Readable} from 'svelte/store';

	import type {Space} from '$lib/vocab/space/space.js';
	import Avatar from '$lib/ui/Avatar.svelte';
	import SpaceInfo from '$lib/ui/SpaceInfo.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import {toName, toIcon} from '$lib/vocab/entity/entity';

	const {
		ui: {selectedSpace, spacesByCommunityId},
	} = getApp();

	export let community: Readable<Community>;
	export let space: Readable<Space>;

	space; // TODO we're ignoring the space, but should probably mount its `content` as markup

	$: communitySpaces = $spacesByCommunityId.get($community.community_id)!;
</script>

<Markup>
	<section>
		<h2>members</h2>
		<!-- TODO display other meta info about the community -->
		{#each $community.memberPersonas as persona (persona.persona_id)}
			<Avatar name={toName(persona)} icon={toIcon(persona)} />
		{/each}
	</section>
	<section>
		<!-- TODO this is just a stubbed out idea -->
		<h2>community spaces</h2>
		{#each communitySpaces as communitySpace (communitySpace)}
			<SpaceInfo
				space={communitySpace}
				{community}
				selected={selectedSpace && communitySpace === $selectedSpace}
			/>
		{/each}
	</section>
	<section>
		<!-- TODO this is just a stubbed out idea -->
		<h2>activity</h2>
		<div>This community was created at {$community.created}</div>
		<code>TODO</code>
	</section>
</Markup>

<style>
	section {
		margin: var(--spacing_xl4) 0;
	}
</style>
