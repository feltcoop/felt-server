<script lang="ts">
	import type {Readable} from 'svelte/store';

	import type {Space} from '$lib/vocab/space/space';
	import type {Community} from '$lib/vocab/community/community';
	import MemberItem from '$lib/ui/MemberItem.svelte';
	import MarqueeNav from '$lib/ui/MarqueeNav.svelte';
	import SpaceEditor from '$lib/ui/SpaceEditor.svelte';
	import {getApp} from '$lib/ui/app';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';

	const {
		dispatch,
		ui: {expandMarquee, personasByCommunityId},
		socket,
		devmode,
	} = getApp();

	export let community: Readable<Community>;
	export let space: Readable<Space | null>;

	$: communityPersonas = $personasByCommunityId.get($community.community_id)!;
</script>

<MarqueeNav {communityPersonas} />

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
		{#if $space}
			<section>
				<button on:click={() => dispatch('OpenDialog', {Component: SpaceEditor, props: {space}})}
					>Edit Space</button
				>
			</section>
		{/if}
		<section>
			<SocketConnection {socket} />
		</section>
	{/if}
{/if}
