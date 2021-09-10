<script lang="ts">
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import SpaceView from '$lib/ui/SpaceView.svelte';
	import WorkspaceHeader from '$lib/ui/WorkspaceHeader.svelte';
	import {getApp} from '$lib/ui/app';

	const {data, ui} = getApp();

	$: communities = $data.communities;

	// TODO speed up these lookups, probably with a map of all entities by id
	// $: selectedCommunity = data.entities.get($ui.selectedCommunityId);
	$: selectedCommunity =
		communities.find((c) => c.community_id === $ui.selectedCommunityId) || null;
	$: selectedSpace = selectedCommunity
		? selectedCommunity.spaces.find(
				(s) => s.space_id === $ui.selectedSpaceIdByCommunity[selectedCommunity!.community_id],
		  )
		: null;
	$: membersById = selectedCommunity?.membersById;
</script>

<div class="workspace">
	<div class="column">
		<WorkspaceHeader space={selectedSpace} community={selectedCommunity} />
		{#if selectedSpace && membersById}
			<SpaceView space={selectedSpace} {membersById} />
		{:else if selectedCommunity}
			<SpaceInput community={selectedCommunity}>Create a new space</SpaceInput>
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
