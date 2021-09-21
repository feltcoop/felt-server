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
		<SpaceMetaButton />
	</div>
	<!-- TODO extract to some shared abstractions with the `Luggage` probably -->
	{#if $ui.expandSecondaryNav && $selectedCommunity && $selectedSpace && memberPersonasById}
		<div class="space-meta">
			<SpaceMeta community={$selectedCommunity} space={$selectedSpace} {memberPersonasById} />
		</div>
	{/if}
</div>

<style>
	.workspace {
		height: 100%;
		width: 100%;
		display: flex;
	}
	.column {
		position: relative;
		height: 100%;
		display: flex;
		flex-direction: column;
		border-right: var(--border);
	}
	/* TODO handle properly for mobile */
	/* TODO better name? */
	.space-meta {
		width: var(--column_width_min);
		border-right: var(--border);
	}
</style>
