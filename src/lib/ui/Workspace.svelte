<script lang="ts">
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import SpaceView from '$lib/ui/SpaceView.svelte';
	import WorkspaceHeader from '$lib/ui/WorkspaceHeader.svelte';
	import {get_app} from '$lib/ui/app';

	const {data, ui} = get_app();

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
	<div class="column">
		<WorkspaceHeader space={selected_space} community={selected_community} />
		{#if selected_space && members_by_id}
			<SpaceView space={selected_space} {members_by_id} />
		{:else if selected_community}
			<SpaceInput community={selected_community}>Create a new space</SpaceInput>
		{/if}
	</div>
</div>

<style>
	.workspace {
		height: 100%;
		width: 100%;
		display: flex;
		flex: 1;
		flex-direction: column;
	}
	.column {
		height: 100%;
		display: flex;
		flex-direction: column;
		border-right: var(--border);
	}
</style>
