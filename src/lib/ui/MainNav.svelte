<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import {icons} from '@feltcoop/felt';
	import {session} from '$app/stores';

	import ActorIcon from '$lib/ui/ActorIcon.svelte';
	import CommunityNav from '$lib/ui/CommunityNav.svelte';
	import SpaceNav from '$lib/ui/SpaceNav.svelte';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {getApp} from '$lib/ui/app';
	import {randomHue} from '$lib/ui/color';

	const {data, ui, api} = getApp();

	$: members = $data.members;
	$: communities = $data.communities;
	$: personas = $data.personas;

	// TODO speed up these lookups, probably with a map of all entities by id
	$: selectedCommunity =
		communities.find((c) => c.community_id === $ui.selectedCommunityId) || null;
	$: selectedSpace = selectedCommunity
		? selectedCommunity.spaces.find(
				(s) => s.space_id === $ui.selectedSpaceIdByCommunity[selectedCommunity!.community_id],
		  ) || null
		: null;
	$: selectedPersona = personas.find((p) => p.persona_id === $ui.selectedPersonaId) || null;
	$: console.log('selected persona', selectedPersona);
	$: selectedPersonaCommunities = communities.filter((community) =>
		selectedPersona?.community_ids.includes(community.community_id),
	);

	// TODO refactor to some client view-model for the account
	$: hue = randomHue($data.account.name);

	let selectedPersonaId = $ui.selectedPersonaId;
	$: ui.selectPersona(selectedPersonaId!);
</script>

{#if $ui.expandMainNav}
	<div class="main-nav-bg" on:click={() => ($ui.expandMainNav ? api.toggleMainNav() : null)} />
{/if}
<div class="main-nav-panel" class:expanded={$ui.expandMainNav} style="--hue: {hue}">
	<div class="main-nav">
		<div class="header">
			<!-- TODO how to do this? -->
			<div class="icon-button button-placeholder" />
			<select class="persona-selector" bind:value={selectedPersonaId}>
				{#each personas as persona (persona)}
					<option value={persona.persona_id}>{persona.name}</option>
				{/each}
			</select>
			<button
				on:click={() => ui.setMainNavView('explorer')}
				class:selected={$ui.mainNavView === 'explorer'}
				class="explorer-button"
			>
				<ActorIcon name={selectedPersona?.name || 'no name'} />
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
				{#if selectedCommunity}
					<CommunityNav {members} {selectedPersonaCommunities} {selectedCommunity} />
					<SpaceNav
						community={selectedCommunity}
						spaces={selectedCommunity.spaces}
						{selectedSpace}
						{members}
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
	.persona-selector {
		display: flex;
		flex: 2;
		height: var(--navbar_size);
		background: var(--interactive_color);
	}
	.explorer-button {
		justify-content: flex-start;
		height: var(--navbar_size);
		flex: 0.5;
		padding: var(--spacing_xs);
	}

	.account-button {
		height: var(--navbar_size);
		width: var(--navbar_size);
	}
</style>
