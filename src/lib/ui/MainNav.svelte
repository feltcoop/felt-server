<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import {icons} from '@feltcoop/felt';
	import {session} from '$app/stores';

	import CommunityNav from '$lib/ui/CommunityNav.svelte';
	import SpaceNav from '$lib/ui/SpaceNav.svelte';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';
	import Avatar from '$lib/ui/Avatar.svelte';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {getApp} from '$lib/ui/app';
	import {randomHue} from '$lib/ui/color';
	import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';
	import {toName, toIcon} from '$lib/vocab/entity/entity';

	const {
		ui: {
			mainNavView,
			expandMainNav,
			setMainNavView,
			selectedSpace: selectedSpaceStore,
			selectedPersona: selectedPersonaStore,
			selectedCommunity: selectedCommunityStore,
		},
		api,
	} = getApp();

	$: selectedPersona = $selectedPersonaStore!; // TODO type?
	$: selectedCommunity = $selectedCommunityStore;
	$: selectedSpace = $selectedSpaceStore;

	// TODO refactor to some client view-model for the account
	$: selectedPersonaName = $selectedPersona?.name || GUEST_PERSONA_NAME;
	$: hue = randomHue(selectedPersonaName);
</script>

{#if $expandMainNav}
	<div class="main-nav-bg" on:click={() => ($expandMainNav ? api.toggleMainNav() : null)} />
{/if}
<div class="main-nav-panel" class:expanded={$expandMainNav} style="--hue: {hue}">
	<div class="main-nav">
		<div class="header">
			<!-- TODO how to do this? -->
			<div class="icon-button button-placeholder" />
			<button
				on:click={() => setMainNavView('explorer')}
				class:selected={$mainNavView === 'explorer'}
				class="explorer-button"
			>
				<Avatar name={toName($selectedPersona)} icon={toIcon($selectedPersona)} />
			</button>
			<button
				on:click={() => setMainNavView('account')}
				class:selected={$mainNavView === 'account'}
				class="account-button"
			>
				<!-- TODO `icons.dotDotDot` -->
				{icons.bulletPoint}{icons.bulletPoint}{icons.bulletPoint}
			</button>
		</div>
		{#if $mainNavView === 'explorer'}
			<div class="explorer">
				<CommunityNav />
				{#if selectedCommunity && selectedSpace}
					<SpaceNav
						community={selectedCommunity}
						spaces={$selectedCommunity.spaces}
						{selectedSpace}
					/>
				{/if}
			</div>
		{:else if $mainNavView === 'account'}
			<Markup>
				<AccountForm guest={$session.guest} logIn={api.logIn} logOut={api.logOut} />
			</Markup>
			<SocketConnection />
		{/if}
	</div>
</div>

<style>
	.main-nav-panel {
		width: 0;
	}
	.main-nav-panel.expanded {
		width: var(--column_width_min);
	}
	.main-nav {
		position: relative;
		z-index: 2;
		height: 100%;
		width: var(--column_width_min);
		overflow: auto;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		transform-origin: top left;
		/* TODO what var is this? */
		background-color: hsl(var(--bg_hue), var(--bg_saturation), var(--bg_lightness));
		transform: translate3d(-100%, 0, 0) scale3d(1, 1, 1);
		transition: transform var(--transition_duration_xs) ease-out;
	}
	.expanded .main-nav {
		transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
		transition-duration: var(--transition_duration_sm);
	}
	.main-nav-bg {
		z-index: 2;
		display: none;
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
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
		animation: fade-in var(--transition_duration_xl) ease-out;
	}
	:global(.mobile) .main-nav-panel.expanded {
		width: 0;
	}
	.header {
		display: flex;
		height: calc(var(--navbar_size) + var(--border_width));
		border-bottom: var(--border);
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
		padding: var(--spacing_xs);
	}
	.account-button {
		height: var(--navbar_size);
		width: var(--navbar_size);
	}
</style>
