<script lang="ts">
	import CommunityNav from '$lib/CommunityNav.svelte';
	import SpaceNav from '$lib/SpaceNav.svelte';
	import ChatRoom from '$lib/ChatRoom.svelte';
	import type {Community} from 'src/communities/community.js';
	import type {Space} from 'src/spaces/space.js';
	import type {Member} from 'src/members/member.js';

	export let friends: Member[];
	export let communities: Community[];
	let selectedCommunity = communities[0] || null;
	$: selectedCommunitySpaces = selectedCommunity?.spaces || null;
	const selectCommunity = (community: Community) => {
		selectedCommunity = community;
	};
	let selectedSpace = selectedCommunity ? selectedCommunity.spaces[0] : null;
	const selectSpace = (space: Space) => {
		selectedSpace = space;
		console.log(`[ss] ${selectedSpace.url}`);
	};
</script>

<div class="workspace">
	<section class="communitynav">
		<CommunityNav {friends} {communities} {selectedCommunity} {selectCommunity} />
	</section>
	<section class="spacenav">
		{#if selectedCommunity}
			<SpaceNav community={selectedCommunity} spaces={selectedCommunitySpaces} {selectSpace} />
		{/if}
	</section>
	<div class="viewfinder">
		{#if selectedSpace}
			<ChatRoom space={selectedSpace} />
		{/if}
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
