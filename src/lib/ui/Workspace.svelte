<script lang="ts">
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import SpaceView from '$lib/ui/SpaceView.svelte';
	import SpaceMeta from '$lib/ui/SpaceMeta.svelte';
	import WorkspaceHeader from '$lib/ui/WorkspaceHeader.svelte';
	import SpaceMetaButton from '$lib/ui/SpaceMetaButton.svelte';
	import {getApp} from '$lib/ui/app';

	const {ui} = getApp();

	$: selectedCommunity = ui.selectedCommunity;
	$: selectedSpace = ui.selectedSpace;
	// TODO should display just the space's members, not the community's
	$: memberPersonasById = $selectedCommunity?.memberPersonasById;
</script>

<div class="workspace">
	<div class="column">
		<WorkspaceHeader space={$selectedSpace} community={$selectedCommunity} />
		{#if $selectedCommunity && $selectedSpace && memberPersonasById}
			<SpaceView community={$selectedCommunity} space={$selectedSpace} {memberPersonasById} />
		{:else if $selectedCommunity}
			<SpaceInput community={$selectedCommunity}>Create a new space</SpaceInput>
		{/if}
	</div>
	<!-- TODO extract to some shared abstractions with the `Luggage` probably -->
	<div class="space-meta">
		{#if $ui.expandSecondaryNav && $selectedCommunity && $selectedSpace && memberPersonasById}
			<div class="space-meta-content">
				<SpaceMeta community={$selectedCommunity} space={$selectedSpace} {memberPersonasById} />
			</div>
		{/if}
		<SpaceMetaButton />
	</div>
</div>

<style>
	.workspace {
		height: 100%;
		width: 100%;
		display: flex;
		flex: 1;
	}
	.column {
		height: 100%;
		display: flex;
		flex-direction: column;
		border-right: var(--border);
	}
	/* TODO handle properly for mobile */
	/* TODO better name? */
	.space-meta {
		position: relative;
	}
	.space-meta-content {
		width: var(--column_width_min);
		border-right: var(--border);
	}
</style>
