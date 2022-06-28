<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import MemberItem from '$lib/ui/MemberItem.svelte';
	import MarqueeNav from '$lib/ui/MarqueeNav.svelte';
	import {getApp} from '$lib/ui/app';
	import SocketConnectionControls from '$lib/ui/SocketConnectionControls.svelte';

	const {
		ui: {expandMarquee, personasByCommunityId},
		socket,
		devmode,
	} = getApp();

	export let community: Readable<Community>;
	export let space: Readable<Space | null>;

	$: communityPersonas = $personasByCommunityId.get($community.community_id)!;
</script>

<MarqueeNav {space} {communityPersonas} />

<!-- TODO display other meta info about the community -->
{#if $expandMarquee}
	<section>
		<ul>
			<!-- TODO probably want these to be sorted so the selected persona is always first -->
			{#each communityPersonas as persona (persona)}
				<MemberItem {persona} />
			{/each}
		</ul>
	</section>
	{#if $devmode}
		<section>
			<ul>
				<li><a href="/docs">/docs</a></li>
			</ul>
		</section>
		<section>
			<SocketConnectionControls {socket} />
		</section>
	{/if}
{/if}
