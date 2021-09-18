<script lang="ts">
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import SpaceView from '$lib/ui/SpaceView.svelte';
	import WorkspaceHeader from '$lib/ui/WorkspaceHeader.svelte';
	import {getApp} from '$lib/ui/app';

	const {ui} = getApp();

	$: selectedCommunity = ui.selectedCommunity;
	$: selectedSpace = ui.selectedSpace;
	$: memberPersonasById = $selectedCommunity?.memberPersonasById;
</script>

<div class="workspace">
	<div class="column">
		<WorkspaceHeader space={$selectedSpace} community={$selectedCommunity} />
		{#if $selectedSpace && memberPersonasById}
			<SpaceView space={$selectedSpace} {memberPersonasById} />
		{:else if $selectedCommunity}
			<SpaceInput community={$selectedCommunity}>Create a new space</SpaceInput>
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
