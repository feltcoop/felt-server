<script lang="ts">
	import type {Result} from '@feltcoop/felt';

	import Community_Nav from '$lib/ui/Community_Nav.svelte';
	import Space_Nav from '$lib/ui/Space_Nav.svelte';
	import Socket_Connection from '$lib/ui/Socket_Connection.svelte';
	import Account_Form from '$lib/ui/Account_Form.svelte';
	import {get_socket} from '$lib/ui/socket';
	import type {Community} from '$lib/communities/community.js';
	import type {Space} from '$lib/spaces/space.js';
	import {get_data} from '$lib/ui/data';
	import {get_ui} from '$lib/ui/ui';

	const data = get_data();
	const ui = get_ui();

	$: friends = $data.friends;
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

	const select_community = (community: Community) => {
		ui.select_community(community.community_id!);
	};
	const select_space = (space: Space) => {
		ui.select_space(selected_community!.community_id!, space.space_id!);
	};
	// TODO refactor this, maybe into `data` or `api`
	const create_community = async (
		name: string,
	): Promise<Result<{value: {community: Community}}, {reason: string}>> => {
		if (!name) return {ok: false, reason: 'invalid name'};
		//Needs to collect name
		const doc = {
			name,
		};
		const res = await fetch(`/api/v1/communities`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(doc),
		});
		try {
			const result: {community: Community} = await res.json(); // TODO api types
			console.log('create community result', result);
			data.add_community(result.community);
			return {ok: true, value: result};
		} catch (err) {
			return {ok: false, reason: err.message};
		}
	};

	const socket = get_socket();
</script>

<Socket_Connection {socket} />

<div class="main-nav">
	<Account_Form />
	<div class="explorer">
		{#if selected_community}
			<Community_Nav
				{friends}
				{communities}
				{selected_community}
				{select_community}
				{create_community}
			/>
			{#if selected_space}
				<Space_Nav
					community={selected_community}
					spaces={selected_community.spaces}
					{selected_space}
					{select_space}
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
		border: var(--border);
	}
	.explorer {
		display: flex;
		flex: 1;
		max-width: 32rem;
	}
</style>
