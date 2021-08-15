<script lang="ts">
	import Chat from '$lib/ui/Chat.svelte';
	import Notes from '$lib/ui/Notes.svelte';
	import type {Space} from '$lib/spaces/space';
	import Iframe from '$lib/ui/Iframe.svelte';
	import type {Member} from '$lib/members/member';

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
{#if space_data.type === 'Chat'}
	<Chat {space} {members_by_id} />
{:else if space_data.type === 'Notes'}
	<Notes {space} />
{:else if space_data.type === 'Iframe'}
	<Iframe {space} {...space_data.props} />
{:else}
	unknown space type: {space_data.type}
{/if}
