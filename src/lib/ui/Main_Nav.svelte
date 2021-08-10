<script lang="ts">
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	import Community_Nav from '$lib/ui/Community_Nav.svelte';
	import Space_Nav from '$lib/ui/Space_Nav.svelte';
	import Socket_Connection from '$lib/ui/Socket_Connection.svelte';
	import Account_Form from '$lib/ui/Account_Form.svelte';
	import {get_app} from '$lib/ui/app';

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

	// $: console.log('[Main_Nav] $data', $data);
	// $: console.log('[Main_Nav] $ui', $ui);
	// $: console.log('[Main_Nav] communities', communities);
	// $: console.log('[Main_Nav] selected_community', selected_community);
	// $: console.log('[Main_Nav] selected_space', selected_space);
</script>

<div
	class="main-nav-bg"
	class:expanded={$ui.expand_main_nav}
	on:click={() => ($ui.expand_main_nav ? api.toggle_main_nav() : null)}
/>
<div class="main-nav" class:expanded={$ui.expand_main_nav}>
	<div class="header">
		<!-- TODO how to do this? -->
		<div class="icon-button button-placeholder" />
		<button
			on:click={() => ui.set_main_nav_view('explorer')}
			class:selected={$ui.main_nav_view === 'explorer'}
			class="explorer-button"
		>
			<img src="/favicon.png" alt="show explorer" />
		</button>
		<button
			on:click={() => ui.set_main_nav_view('account')}
			class:selected={$ui.main_nav_view === 'account'}
			class="account-button"
		>
			{$data.account.name}
		</button>
	</div>
	{#if $ui.main_nav_view === 'explorer'}
		<div class="explorer">
			{#if selected_community}
				<Community_Nav {members} {communities} {selected_community} />
				<Space_Nav
					community={selected_community}
					spaces={selected_community.spaces}
					{selected_space}
					{members}
				/>
			{/if}
		</div>
	{:else if $ui.main_nav_view === 'account'}
		<Markup>
			<Account_Form />
		</Markup>
		<Socket_Connection />
	{/if}
</div>

<style>
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
	}
	.main-nav.expanded {
		animation: fly-in var(--transition_duration_sm) ease-out;
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
		background-color: rgba(0, 0, 0, 0.6);
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
		}
		.main-nav-bg.expanded {
			animation: fade-in var(--transition_duration_md) linear;
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
		width: var(--navbar_size);
		height: var(--navbar_size);
	}
	.account-button {
		flex: 1;
	}
</style>
