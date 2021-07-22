<script lang="ts">
	import Community_Nav from '$lib/ui/Community_Nav.svelte';
	import Space_Nav from '$lib/ui/Space_Nav.svelte';
	import Socket_Connection from '$lib/ui/Socket_Connection.svelte';
	import {get_socket} from '$lib/ui/socket';
	import type {Community} from '$lib/communities/community.js';
	import type {Space} from '$lib/spaces/space.js';
	import {get_data} from '$lib/ui/data';
	import {get_ui} from '$lib/ui/ui';

	const data = get_data();
	const ui = get_ui();

	$: friends = $data.friends;
	$: communities = $data.communities;

	// TODO speed up these lookups, probably with a map of all entities by id
	$: selected_community =
		communities.find((c) => c.community_id === $ui.selected_community_id) || null;
	$: selected_space = selected_community
		? selected_community.spaces.find(
				(s) => s.space_id === $ui.selected_space_id_by_community[selected_community!.community_id!],
		  ) || null
		: null;

	$: console.log('[Main_Nav] $data', $data);
	$: console.log('[Main_Nav] $ui', $ui);
	$: console.log('[Main_Nav] communities', communities);
	$: console.log('[Main_Nav] selected_community', selected_community);
	$: console.log('[Main_Nav] selected_space', selected_space);

	const select_community = (community: Community) => {
		ui.select_community(community.community_id!);
	};
	const select_space = (space: Space) => {
		ui.select_space(selected_community!.community_id!, space.space_id!);
	};

	const socket = get_socket();
</script>

<Socket_Connection {socket} />

<div class="main-nav">
	{#if selected_community}
		<Community_Nav {friends} {communities} {selected_community} {select_community} />
		{#if selected_space}
			<Space_Nav
				community={selected_community}
				spaces={selected_community.spaces}
				{selected_space}
				{select_space}
			/>
		{:else}
			<code>[[TODO handle case where community has no spaces]]</code>
		{/if}
	{:else}
		<code>[[TODO handle case where user has joined no communities, if that's a valid state]]</code>
	{/if}
</div>

<style>
	.main-nav {
		height: 100%;
		display: flex;
	}
</style>
