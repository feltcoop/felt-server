<script lang="ts">
	import SpaceView from '$lib/ui/SpaceView.svelte';
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import Marquee from '$lib/ui/Marquee.svelte';
	import WorkspaceHeader from '$lib/ui/WorkspaceHeader.svelte';
	import MarqueeButton from '$lib/ui/MarqueeButton.svelte';
	import {getApp} from '$lib/ui/app';
	import SpaceContextmenu from '$lib/app/contextmenu/SpaceContextmenu.svelte';
	import CommunityContextmenu from '$lib/app/contextmenu/CommunityContextmenu.svelte';

	const {
		dispatch,
		ui: {contextmenu, expandMarquee, spaceSelection, personaSelection, communitySelection},
	} = getApp();

	$: selectedPersona = $personaSelection;
	$: selectedCommunity = $communitySelection;
	$: selectedSpace = $spaceSelection;
</script>

<div
	class="workspace"
	use:contextmenu.action={[
		[SpaceContextmenu, selectedSpace ? {space: selectedSpace} : undefined],
		[
			CommunityContextmenu,
			selectedCommunity && selectedPersona
				? {community: selectedCommunity, persona: selectedPersona}
				: undefined,
		],
	]}
>
	{#if $expandMarquee}
		<div
			class="marquee-bg"
			on:click={() => ($expandMarquee ? dispatch('ToggleSecondaryNav') : null)}
		/>
	{/if}
	<div class="column">
		<!-- TODO pass stores here instead of dereferncing -->
		<WorkspaceHeader space={selectedSpace} community={selectedCommunity} />
		{#if selectedPersona && selectedCommunity && selectedSpace}
			<SpaceView persona={selectedPersona} community={selectedCommunity} space={selectedSpace} />
		{:else if selectedPersona && selectedCommunity}
			<!-- TODO this should be the form, not dialog trigger -- fix after refactoring dialogs -->
			<SpaceInput persona={selectedPersona} community={selectedCommunity} />
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
	}
	/* TODO handle properly for mobile */
	/* TODO better name? */
	.marquee {
		position: relative;
		height: 100%;
		width: var(--column_width_sm);
		overflow: auto;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		background-color: var(--tint_light);
	}
	/* TODO abstract with `MainNav` at all? */
	.marquee-bg {
		z-index: 3;
		display: none;
		position: fixed;
		inset: 0;
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
		animation: fade-in var(--transition_duration_3) ease-out;
	}
</style>
