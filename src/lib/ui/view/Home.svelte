<script lang="ts">
	import type {Readable} from 'svelte/store';
	import {format} from 'date-fns';

	import type {Space} from '$lib/vocab/space/space.js';
	import CommunitySettingsHue from '$lib/ui/CommunitySettingsHue.svelte';
	import MemberItem from '$lib/ui/MemberItem.svelte';
	import SpaceInfo from '$lib/ui/SpaceInfo.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';

	const {
		ui: {spaceSelection, spacesByCommunityId, personasByCommunityId},
	} = getApp();

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
	export const space: Readable<Space> = undefined as any;

	$: communitySpaces = $spacesByCommunityId.get($community.community_id)!;

	$: communityPersonas = $personasByCommunityId.get($community.community_id)!;
</script>

<div class="home">
	<section>
		<h2>members</h2>
		<!-- TODO display other meta info about the community -->
		<ul>
			{#each communityPersonas as persona (persona)}
				<MemberItem {persona} />
			{/each}
		</ul>
	</section>
	<section>
		<!-- TODO this is just a stubbed out idea -->
		<h2>community spaces</h2>
		{#each communitySpaces as communitySpace (communitySpace)}
			<SpaceInfo
				{persona}
				space={communitySpace}
				{community}
				selected={spaceSelection && communitySpace === $spaceSelection}
			/>
		{/each}
	</section>
	<section>
		<!-- TODO this is just a stubbed out idea -->
		<h2>activity</h2>
		<div>This community was created on {format(new Date($community.created), 'PPPPp')}</div>
		<code>TODO</code>
	</section>
	<section>
		<h2>settings</h2>
		<CommunitySettingsHue {community} />
	</section>
</div>

<style>
	.home {
		padding: var(--spacing_xl);
	}
	section {
		margin: var(--spacing_xl4) 0;
	}
</style>
