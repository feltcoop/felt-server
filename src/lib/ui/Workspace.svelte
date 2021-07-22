<script lang="ts">
	import Chat_Room from '$lib/ui/Chat_Room.svelte';
	import {get_data} from '$lib/ui/data';
	import {get_ui} from '$lib/ui/ui';

	const data = get_data();
	const ui = get_ui();

	$: communities = $data.communities;

	// TODO speed up these lookups, probably with a map of all entities by id
	// $: selected_community = data.entities.get($ui.selected_community_id);
	$: selected_community =
		communities.find((c) => c.community_id === $ui.selected_community_id) || null;
	$: selected_space = selected_community
		? selected_community.spaces.find(
				(s) => s.space_id === $ui.selected_space_id_by_community[selected_community!.community_id!],
		  )
		: null;
	$: members_by_id = selected_community?.members_by_id;

	// $: console.log('[Workspace] selected_community', selected_community);
	// $: console.log('[Workspace] selected_space', selected_space);
</script>

<div class="workspace">
	{#if selected_space && members_by_id}
		<Chat_Room space={selected_space} {members_by_id} />
	{:else}
		<code>[[TODO no space selected]]</code>
	{/if}
</div>

<style>
	.workspace {
		height: 100%;
		display: flex;
		flex: 1;
	}
</style>
