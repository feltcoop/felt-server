<script lang="ts">
	import Community_Nav from '$lib/ui/Community_Nav.svelte';
	import Space_Nav from '$lib/ui/Space_Nav.svelte';
	import Socket_Connection from '$lib/ui/Socket_Connection.svelte';
	import Account_Form from '$lib/ui/Account_Form.svelte';
	import {get_socket} from '$lib/ui/socket';
	import {get_data} from '$lib/ui/data';
	import {get_ui} from '$lib/ui/ui';

	const data = get_data();
	const ui = get_ui();

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

	const socket = get_socket();
</script>

<div class="main-nav">
	<Socket_Connection {socket} />
	<Account_Form />
	<div class="explorer">
		{#if selected_community}
			<Community_Nav {members} {communities} {selected_community} />
			{#if selected_space}
				<Space_Nav
					community={selected_community}
					spaces={selected_community.spaces}
					{selected_space}
				/>
			{:else}
				<code>[[TODO handle case where community has no spaces]]</code>
			{/if}
		{:else}
			<code>[[TODO handle case where user has joined no communities, if that's a valid state]]</code
			>
		{/if}
	</div>
</div>

<style>
	.main-nav {
		height: 100%;
		display: flex;
		flex-direction: column;
		border-left: var(--border);
		border-right: var(--border);
	}
	.explorer {
		display: flex;
		flex: 1;
		width: 32rem;
		max-width: 32rem;
	}
</style>
