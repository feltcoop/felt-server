<script lang="ts">
	import Space_Input from '$lib/ui/Space_Input.svelte';
	import Space_View from '$lib/ui/Space_View.svelte';
	import Workspace_Header from '$lib/ui/Workspace_Header.svelte';
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
</script>

<div class="workspace">
	<Workspace_Header space={selected_space} />
	{#if selected_space && members_by_id}
		<Space_View space={selected_space} {members_by_id} />
	{:else if selected_community}
		<Space_Input community={selected_community}>Create a new space</Space_Input>
	{/if}
</div>

<style>
	.workspace {
		height: 100%;
		display: flex;
		flex: 1;
		flex-direction: column;
	}
</style>
