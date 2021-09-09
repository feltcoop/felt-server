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
	export let members_by_id: Map<number, Member>;

	// TODO types
	const to_space_data = (space: Space): any => {
		switch (space.media_type) {
			case 'application/fuz+json': {
				return JSON.parse(space.content);
			}
			default: {
				return space.content;
			}
		}
	};

	$: space_data = to_space_data(space);
	$: console.log('space_data', space_data);
</script>

<!-- TODO make this a lookup by type and handle generically -->
{#if space_data.type === SpaceTypes.Chat}
	<Chat {space} {members_by_id} />
{:else if space_data.type === SpaceTypes.Board}
	<Board {space} {members_by_id} />
{:else if space_data.type === SpaceTypes.Forum}
	<Forum {space} {members_by_id} />
{:else if space_data.type === SpaceTypes.Notes}
	<Notes {space} />
{:else if space_data.type === SpaceTypes.Voice}
	<Voice {space} />
{:else if space_data.type === SpaceTypes.Iframe}
	<Iframe {space} {...space_data.props} />
{:else}
	unknown space type: {space_data.type}
{/if}
