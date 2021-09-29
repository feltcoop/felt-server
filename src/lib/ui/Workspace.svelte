<script lang="ts">
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import SpaceView from '$lib/ui/SpaceView.svelte';
	import Marquee from '$lib/ui/Marquee.svelte';
	import WorkspaceHeader from '$lib/ui/WorkspaceHeader.svelte';
	import MarqueeButton from '$lib/ui/MarqueeButton.svelte';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {
			expandMarquee,
			selectedSpace: selectedSpaceStore,
			selectedCommunity: selectedCommunityStore,
		},
		api,
	} = getApp();

	$: selectedCommunity = $selectedCommunityStore;
	$: selectedSpace = $selectedSpaceStore;
</script>

<div class="workspace">
	{#if $expandMarquee}
		<div class="marquee-bg" on:click={() => ($expandMarquee ? api.toggleSecondaryNav() : null)} />
	{/if}
	<div class="column">
		<!-- TODO pass stores here instead of dereferncing -->
		<WorkspaceHeader space={selectedSpace} community={selectedCommunity} />
		{#if selectedCommunity && selectedSpace}
			<SpaceView community={selectedCommunity} space={selectedSpace} />
		{:else if selectedCommunity}
			<SpaceInput community={selectedCommunity}>Create a new space</SpaceInput>
		{/if}
		<MarqueeButton />
	</div>
	<!-- TODO extract to some shared abstractions with the `Luggage` probably -->
	{#if $expandMarquee && selectedCommunity && selectedSpace}
		<div class="marquee">
			<Marquee community={selectedCommunity} space={selectedSpace} />
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
		border-left: var(--border);
		border-right: var(--border);
	}
	/* TODO handle properly for mobile */
	/* TODO better name? */
	.marquee {
		position: relative;
		height: 100%;
		width: var(--column_width_min);
		overflow: auto;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		border-right: var(--border);
		background-color: hsl(var(--bg_hue), var(--bg_saturation), var(--bg_lightness));
	}
	/* TODO abstract with `MainNav` at all? */
	.marquee-bg {
		z-index: 3;
		display: none;
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		/* TODO from felt */
		background-color: rgba(0, 0, 0, 0.4);
	}
	:global(.mobile) .marquee {
		z-index: 3;
		position: fixed;
		right: 0;
		top: 0;
	}
	:global(.mobile) .marquee-bg {
		display: block;
		animation: fade-in var(--transition_duration_xl) ease-out;
	}
	/* remove borders on things when not necessary, makes things look cleaner and crisper */
	:global(.mobile) .column {
		border-right: none;
		border-left: none;
	}
	:global(.mobile) .marquee {
		border-right: none;
	}
</style>
