<script lang="ts">
	import CommunityNav from '$lib/ui/CommunityNav.svelte';
	import SpaceNav from '$lib/ui/SpaceNav.svelte';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {randomHue} from '$lib/ui/color';
	import {toName, toIcon} from '$lib/vocab/entity/entity';
	import {onContextmenu} from '$lib/ui/contextmenu/contextmenu';

	const {
		dispatch,
		ui: {
			expandMainNav,
			contextmenu,
			spaceSelection,
			personaSelection,
			communitySelection,
			spacesByCommunityId,
		},
	} = getApp();

	$: selectedPersona = $personaSelection!;
	$: selectedCommunity = $communitySelection;
	$: selectedSpace = $spaceSelection;

	// TODO refactor once community data is normalized
	$: selectedCommunitySpaces =
		selectedCommunity && $spacesByCommunityId.get($selectedCommunity.community_id);

	// TODO refactor to some client view-model for the account
	$: hue = randomHue(toName($selectedPersona));
</script>

{#if $expandMainNav}
	<div class="main-nav-bg" on:click={() => ($expandMainNav ? dispatch('ToggleMainNav') : null)} />
{/if}
<div class="main-nav-panel" class:expanded={$expandMainNav} style="--hue: {hue}">
	<div class="main-nav">
		<div class="header">
			<!-- TODO how to do this? -->
			<div class="icon-button button-placeholder" />
			<!-- TODO or maybe `selectedPersona.id` ? can't be `$selectedPersona.persona_id` as a serial value -->
			<button
				class="explorer-button"
				use:contextmenu.action={{LuggageContextmenu: null}}
				on:click={(e) => onContextmenu(e, contextmenu)}
			>
				<Avatar name={toName($selectedPersona)} icon={toIcon($selectedPersona)} />
			</button>
		</div>
		<div class="explorer">
			<CommunityNav />
			{#if selectedPersona && selectedCommunity && selectedCommunitySpaces && selectedSpace}
				<SpaceNav
					persona={selectedPersona}
					community={selectedCommunity}
					spaces={selectedCommunitySpaces}
					{selectedSpace}
				/>
			{/if}
		</div>
	</div>
</div>

<style>
	.main-nav-panel {
		width: 0;
	}
	.main-nav-panel.expanded {
		width: var(--column_width_sm);
	}
	.main-nav {
		position: relative;
		z-index: 2;
		height: 100%;
		width: var(--column_width_sm);
		overflow: auto;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		transform-origin: top left;
		background-color: var(--tint_light);
		transform: translate3d(-100%, 0, 0) scale3d(1, 1, 1);
		transition: transform var(--transition_duration_1) ease-out;
	}
	.expanded .main-nav {
		transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
		transition-duration: var(--transition_duration_2);
	}
	.main-nav-bg {
		z-index: 2;
		display: none;
		position: fixed;
		inset: 0;
		/* TODO from felt */
		background-color: rgba(0, 0, 0, 0.4);
	}
	:global(.mobile) .main-nav {
		position: fixed;
		left: 0;
		top: 0;
	}
	:global(.mobile) .main-nav-bg {
		display: block;
		animation: fade-in var(--transition_duration_3) ease-out;
	}
	:global(.mobile) .main-nav-panel.expanded {
		width: 0;
	}
	.header {
		position: sticky;
		top: 0;
		display: flex;
		height: var(--navbar_size);
		width: 100%;
	}
	.explorer {
		display: flex;
		flex: 1;
	}
	.explorer-button {
		justify-content: flex-start;
		height: var(--navbar_size);
		flex: 1;
		padding: 0;
	}
</style>
