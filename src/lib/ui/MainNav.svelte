<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import {icons} from '@feltcoop/felt';

	import ActorIcon from '$lib/ui/ActorIcon.svelte';
	import CommunityNav from '$lib/ui/CommunityNav.svelte';
	import SpaceNav from '$lib/ui/SpaceNav.svelte';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {get_app} from '$lib/ui/app';
	import {random_hue} from '$lib/ui/color';

	const {data, ui, api} = get_app();

	$: members = $data.members;
	$: communities = $data.communities;

	// TODO speed up these lookups, probably with a map of all entities by id
	$: selected_community =
		communities.find((c) => c.community_id === $ui.selected_community_id) || null;
	$: selected_space = selected_community
		? selected_community.spaces.find(
				(s) => s.space_id === $ui.selected_space_id_by_community[selected_community!.community_id!],
		  ) || null
		: null;

	// $: console.log('[MainNav] $data', $data);
	// $: console.log('[MainNav] $ui', $ui);
	// $: console.log('[MainNav] communities', communities);
	// $: console.log('[MainNav] selected_community', selected_community);
	// $: console.log('[MainNav] selected_space', selected_space);

	// TODO refactor to some client view-model for the account
	$: hue = random_hue($data.account.name);
</script>

{#if $ui.expand_main_nav}
	<div class="main-nav-bg" on:click={() => ($ui.expand_main_nav ? api.toggle_main_nav() : null)} />
{/if}
<div class="main-nav-panel" class:expanded={$ui.expand_main_nav} style="--hue: {hue}">
	<div class="main-nav">
		<div class="header">
			<!-- TODO how to do this? -->
			<div class="icon-button button-placeholder" />
			<button
				on:click={() => ui.set_main_nav_view('explorer')}
				class:selected={$ui.main_nav_view === 'explorer'}
				class="explorer-button"
			>
				<ActorIcon name={$data.account.name} />
				<div class="explorer-button-text">
					{$data.account.name}
				</div>
			</button>
			<button
				on:click={() => ui.set_main_nav_view('account')}
				class:selected={$ui.main_nav_view === 'account'}
				class="account-button"
			>
				<!-- TODO `icons.dot_dot_dot` -->
				{icons.bullet_point}{icons.bullet_point}{icons.bullet_point}
			</button>
		</div>
		{#if $ui.main_nav_view === 'explorer'}
			<div class="explorer">
				{#if selected_community}
					<CommunityNav {members} {communities} {selected_community} />
					<SpaceNav
						community={selected_community}
						spaces={selected_community.spaces}
						{selected_space}
						{members}
					/>
				{/if}
			</div>
		{:else if $ui.main_nav_view === 'account'}
			<Markup>
				<AccountForm />
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
	.explorer-button-text {
		padding-left: var(--spacing_md);
	}
	.account-button {
		height: var(--navbar_size);
		width: var(--navbar_size);
	}
</style>
