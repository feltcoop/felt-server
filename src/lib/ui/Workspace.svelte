<script lang="ts">
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import SpaceView from '$lib/ui/SpaceView.svelte';
	import Marquee from '$lib/ui/Marquee.svelte';
	import WorkspaceHeader from '$lib/ui/WorkspaceHeader.svelte';
	import MarqueeButton from '$lib/ui/MarqueeButton.svelte';
	import {getApp} from '$lib/ui/app';

	const {ui, api} = getApp();

	$: selectedCommunity = ui.selectedCommunity;
	$: selectedSpace = ui.selectedSpace;
	// TODO should display just the space's members, not the community's
	$: memberPersonasById = $selectedCommunity?.memberPersonasById;
</script>

<div class="workspace">
	{#if $ui.expandSecondaryNav}
		<div
			class="marquee-bg"
			on:click={() => ($ui.expandSecondaryNav ? api.toggleSecondaryNav() : null)}
		/>
	{/if}
	<div class="column">
		<WorkspaceHeader space={$selectedSpace} community={$selectedCommunity} />
		{#if $selectedCommunity && $selectedSpace && memberPersonasById}
			<SpaceView community={$selectedCommunity} space={$selectedSpace} {memberPersonasById} />
		{:else if $selectedCommunity}
			<SpaceInput community={$selectedCommunity}>Create a new space</SpaceInput>
		{/if}
		<MarqueeButton />
	</div>
	<!-- TODO extract to some shared abstractions with the `Luggage` probably -->
	{#if $ui.expandSecondaryNav && $selectedCommunity && $selectedSpace && memberPersonasById}
		<div class="marquee">
			<Marquee community={$selectedCommunity} space={$selectedSpace} {memberPersonasById} />
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
	} /* `50rem` in media queries is the same as `800px`, which is `--column_width` */
	@media (max-width: 50rem) {
		.marquee {
			z-index: 3;
			position: fixed;
			right: 0;
			top: 0;
		}
		.marquee-bg {
			display: block;
			animation: fade-in var(--transition_duration_xl) ease-out;
		}
		/* remove borders on things when not necessary, makes things look cleaner and crisper */
		.column {
			border-right: none;
			border-left: none;
		}
		.marquee {
			border-right: none;
		}
	}
</style>
