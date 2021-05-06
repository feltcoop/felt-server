<script lang="ts">
	import CommunityNav from '$lib/CommunityNav.svelte';
	import SpaceNav from '$lib/SpaceNav.svelte';
	import ChatRoom from '$lib/ChatRoom.svelte';
	import type {Community} from 'src/communities/community.js';
	import type {Space} from 'src/spaces/space.js';

	export let communities: Community[];
	let selectedCommunity = communities[0];
	const selectCommunity = (community: Community) => {
		selectedCommunity = community;
	};
	let selectedSpace = selectedCommunity.spaces[0];
	const selectSpace = (space: Space) => {
		selectedSpace = space;
	};
	let selectedSpaceContent: Object;
	if (selectedSpace.media_type == 'application/json') {
		selectedSpaceContent = JSON.parse(selectedSpace.content);
	}
</script>

<div class="workspace">
	<section class="communitynav">
		<CommunityNav {communities} {selectedCommunity} {selectCommunity} />
	</section>
	<section class="spacenav"><SpaceNav spaces={selectedCommunity.spaces} /></section>
	<div class="viewfinder">
		<ChatRoom spaceId={selectedSpace.space_id} props={selectedSpaceContent.props} />
	</div>
</div>

<style>
	.workspace {
		height: 100%;
		display: flex;
	}

	section {
		height: 100%;
		flex: 1;
		border: 1px solid #ccc;
	}

	.viewfinder {
		height: 100%;
		border: 1px solid #ccc;
		width: 80%;
	}
</style>
