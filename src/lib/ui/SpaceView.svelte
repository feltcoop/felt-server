<script lang="ts">
	import Chat from '$lib/ui/Chat.svelte';
	import Board from '$lib/ui/Board.svelte';
	import Forum from '$lib/ui/Forum.svelte';
	import Notes from '$lib/ui/Notes.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import {SpaceTypes} from '$lib/vocab/space/space';
	import Iframe from '$lib/ui/Iframe.svelte';
	import Voice from '$lib/ui/Voice.svelte';
	import type {Member} from '$lib/vocab/member/member';

	export let space: Space;
	export let membersById: Map<number, Member>;

	// TODO types
	const toSpaceData = (space: Space): any => {
		switch (space.media_type) {
			case 'application/fuz+json': {
				return JSON.parse(space.content);
			}
			default: {
				return space.content;
			}
		}
	};

	$: spaceData = toSpaceData(space);
	$: console.log('spaceData', spaceData);
</script>

<!-- TODO make this a lookup by type and handle generically -->
{#if spaceData.type === SpaceTypes.Chat}
	<Chat {space} {membersById} />
{:else if spaceData.type === SpaceTypes.Board}
	<Board {space} {membersById} />
{:else if spaceData.type === SpaceTypes.Forum}
	<Forum {space} {membersById} />
{:else if spaceData.type === SpaceTypes.Notes}
	<Notes {space} />
{:else if spaceData.type === SpaceTypes.Voice}
	<Voice {space} />
{:else if spaceData.type === SpaceTypes.Iframe}
	<Iframe {space} {...spaceData.props} />
{:else}
	unknown space type: {spaceData.type}
{/if}
