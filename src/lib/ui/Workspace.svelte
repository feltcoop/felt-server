<script lang="ts">
	import Community_Nav from '$lib/ui/Community_Nav.svelte';
	import Space_Nav from '$lib/ui/Space_Nav.svelte';
	import Chat_Room from '$lib/ui/Chat_Room.svelte';
	import type {Community} from '$lib/communities/community.js';
	import type {Space} from '$lib/spaces/space.js';
	import type {Member} from '$lib/members/member.js';

	export let friends: Member[];
	export let communities: Community[];
	let selected_community = communities[0] || null;

	$: selected_community_spaces = selected_community?.spaces || null;
	const select_community = (community: Community) => {
		selected_community = community;
	};
	let selected_space = selected_community ? selected_community.spaces[0] : null;
	const select_space = (space: Space) => {
		selected_space = space;
		console.log(`[ss] ${selected_space.url}`);
	};
</script>

<div class="workspace">
	<section class="communitynav">
		<Community_Nav {friends} {communities} {selected_community} {select_community} />
	</section>
	<section class="spacenav">
		{#if selected_community}
			<Space_Nav community={selected_community} spaces={selected_community_spaces} {select_space} />
		{/if}
	</section>
	<div class="viewfinder">
		{#if selected_space}
			<Chat_Room space={selected_space} members={selected_community.members} />
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
