<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import {icons} from '@feltcoop/felt';
	import {session} from '$app/stores';

	import CommunityNav from '$lib/ui/CommunityNav.svelte';
	import SpaceNav from '$lib/ui/SpaceNav.svelte';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';
	import PersonaInfo from '$lib/ui/PersonaInfo.svelte';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {getApp} from '$lib/ui/app';
	import {randomHue} from '$lib/ui/color';
	import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';

	const {data, ui, api} = getApp();

	$: allPersonas = $data.allPersonas;

	$: selectedPersona = ui.selectedPersona;
	$: selectedCommunity = ui.selectedCommunity;
	$: selectedSpace = ui.selectedSpace;

	// TODO refactor to some client view-model for the account
	$: selectedPersonaName = $selectedPersona?.name || GUEST_PERSONA_NAME;
	$: hue = randomHue(selectedPersonaName);
</script>

{#if $ui.expandMainNav}
	<div class="main-nav-bg" on:click={() => ($ui.expandMainNav ? api.toggleMainNav() : null)} />
{/if}
<div class="main-nav-panel" class:expanded={$ui.expandMainNav} style="--hue: {hue}">
	<div class="main-nav">
		<div class="header">
			<!-- TODO how to do this? -->
			<div class="icon-button button-placeholder" />
			<button
				on:click={() => ui.setMainNavView('explorer')}
				class:selected={$ui.mainNavView === 'explorer'}
				class="explorer-button"
			>
				<PersonaInfo persona={$selectedPersona} />
			</button>
			<button
				on:click={() => ui.setMainNavView('account')}
				class:selected={$ui.mainNavView === 'account'}
				class="account-button"
			>
				<!-- TODO `icons.dotDotDot` -->
				{icons.bulletPoint}{icons.bulletPoint}{icons.bulletPoint}
			</button>
		</div>
		{#if $ui.mainNavView === 'explorer'}
			<div class="explorer">
				<CommunityNav />
				{#if $selectedCommunity}
					<SpaceNav
						community={$selectedCommunity}
						spaces={$selectedCommunity.spaces}
						selectedSpace={$selectedSpace}
						{allPersonas}
					/>
				{/if}
			</div>
		{:else if $ui.mainNavView === 'account'}
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
		z-index: 1;
		height: 100%;
		width: var(--column_width_min);
		overflow: auto;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		border-left: var(--border);
		border-right: var(--border);
		transform-origin: top left;
		background-color: hsl(var(--bg_hue), var(--bg_saturation), var(--bg_lightness));
		transform: translate3d(-100%, 0, 0) scale3d(1, 1, 1);
		transition: transform var(--transition_duration_xs) ease-out;
	}
	.expanded .main-nav {
		transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
		transition-duration: var(--transition_duration_sm);
	}
	.main-nav-bg {
		z-index: 1;
		display: none;
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		/* TODO from felt */
		background-color: rgba(0, 0, 0, 0.4);
	}
	/* `50rem` in media queries is the same as `800px`, which is `--column_width` */
	@media (max-width: 50rem) {
		.main-nav {
			z-index: 1;
			position: fixed;
			left: 0;
			top: 0;
		}
		.main-nav-bg {
			display: block;
			animation: fade-in var(--transition_duration_xl) ease-out;
		}
		.main-nav-panel.expanded {
			width: 0;
		}
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
