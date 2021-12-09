<script lang="ts">
	import {session} from '$app/stores';
	import {onMount} from 'svelte';
	import {createPopperActions} from 'svelte-popperjs';

	import CommunityNav from '$lib/ui/CommunityNav.svelte';
	import SpaceNav from '$lib/ui/SpaceNav.svelte';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';
	import Avatar from '$lib/ui/Avatar.svelte';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {getApp} from '$lib/ui/app';
	import {randomHue} from '$lib/ui/color';
	import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';
	import {toName, toIcon} from '$lib/vocab/entity/entity';
	import ContextMenu from '$lib/ui/ContextMenu.svelte';

	const {
		api: {dispatch},
		ui: {
			expandMainNav,
			selectedSpace: selectedSpaceStore,
			selectedPersona: selectedPersonaStore,
			selectedCommunity: selectedCommunityStore,
		},
		devmode,
	} = getApp();

	$: selectedPersona = $selectedPersonaStore!; // TODO type?
	$: selectedCommunity = $selectedCommunityStore;
	$: selectedSpace = $selectedSpaceStore;

	// TODO refactor to some client view-model for the account
	$: selectedPersonaName = $selectedPersona?.name || GUEST_PERSONA_NAME;
	$: hue = randomHue(selectedPersonaName);

	const [popperRef, popperContent] = createPopperActions();
	let showContextMenu = false;

	onMount(() => {
		document.body.addEventListener('click', onClickBody);
		return () => {
			document.body.removeEventListener('click', onClickBody);
		};
	});
	const onClickBody = () => {
		// TODO clickOutside action?
		if (showContextMenu) {
			showContextMenu = false;
		}
	};
</script>

{#if $expandMainNav}
	<div class="main-nav-bg" on:click={() => ($expandMainNav ? dispatch('toggle_main_nav') : null)} />
{/if}
<div class="main-nav-panel" class:expanded={$expandMainNav} style="--hue: {hue}">
	<div class="main-nav">
		<div class="header">
			<!-- TODO how to do this? -->
			<div class="icon-button button-placeholder" />
			<button
				class="explorer-button"
				use:popperRef
				on:click|stopPropagation={() => (showContextMenu = !showContextMenu)}
				on:contextmenu={(e) => {
					if (!e.ctrlKey) {
						e.stopPropagation();
						e.preventDefault();
						showContextMenu = !showContextMenu;
					}
				}}
			>
				<Avatar name={toName($selectedPersona)} icon={toIcon($selectedPersona)} />
			</button>
		</div>
		<div class="explorer">
			<CommunityNav />
			{#if selectedPersona && selectedCommunity && selectedSpace}
				<SpaceNav
					{selectedPersona}
					community={selectedCommunity}
					spaces={$selectedCommunity.spaces}
					{selectedSpace}
				/>
			{/if}
		</div>
	</div>
</div>

{#if showContextMenu}
	<div
		class="context-menu-wrapper panel"
		use:popperContent={{placement: 'right-start'}}
		on:click|stopPropagation={() => {}}
	>
		<ContextMenu>
			<div class="markup">
				<AccountForm guest={$session.guest} />
				{#if $devmode}
					<a class="menu-link" href="/docs">/docs</a>
				{/if}
			</div>
			<SocketConnection />
		</ContextMenu>
	</div>
{/if}

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
		background-color: var(--tint_light);
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
	.menu-link {
		padding: var(--spacing_xs) var(--spacing_sm);
	}
	.context-menu-wrapper {
		z-index: 8;
	}
</style>
