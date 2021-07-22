<script lang="ts">
	import type {Result} from '@feltcoop/felt';

	import type {Community} from '$lib/communities/community.js';
	import Modal from '$lib/ui/Modal.svelte';
	import type {Member} from '$lib/members/member.js';

	export let friends: Member[];
	export let communities: Community[];
	export let selected_community: Community;
	export let select_community: (community: Community) => void;
	export let create_community: (
		name: string,
	) => Promise<Result<{value: {community: Community}}, {reason: string}>>;

	$: invitable_friends = selected_community
		? friends.filter((x) => !selected_community.members.some((y) => x.account_id == y.account_id))
		: [];

	let new_name = '';

	const on_keydown = async (e: KeyboardEvent, close_modal: () => void) => {
		if (e.key === 'Enter') {
			await create_community(new_name);
			new_name = '';
			close_modal();
		}
	};

	/**
	 * TODO: This implementation is currently non-consensual
	 * and does not give a friend an opportunity to deny an invite.
	 */
	const invite_friend = async (friend: Member) => {
		if (!friend) return;
		const doc = {
			account_id: friend.account_id,
		};

		const res = await fetch(`/api/v1/communities/${selected_community.community_id}/members`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(doc),
		});

		const data = await res.json();
		console.log(data);

		invitable_friends = invitable_friends.filter((x) => x.account_id !== friend.account_id);
	};
</script>

<div class="community-nav">
	<div class="header">
		<Modal let:open={open_modal} let:close={close_modal}>
			<span slot="trigger">
				<button
					aria-label="Create Community"
					type="button"
					class="button-emoji"
					on:click={() => open_modal()}>➕</button
				>
			</span>
			<div slot="header">
				<h1>Create a new community</h1>
			</div>

			<div slot="content">
				<p>
					<input
						type="text"
						placeholder="> name"
						on:keydown={(e) => on_keydown(e, close_modal)}
						bind:value={new_name}
					/>
				</p>
			</div>
		</Modal>

		<!--TODO: Make an IconButton component in felt and use it here-->
		{#if selected_community}
			<Modal let:open={open_modal}>
				<span slot="trigger">
					<button
						aria-label="Invite users to {selected_community.name}"
						type="button"
						class="button-emoji"
						on:click={() => open_modal()}>✉️</button
					>
				</span>
				<div slot="header">
					<h1>Invite users to {selected_community.name}</h1>
				</div>
				<div slot="content">
					{#each invitable_friends as friend (friend.account_id)}
						<p>
							<button type="button" class="button-join" on:click={() => invite_friend(friend)}>
								{friend.name}
							</button>
						</p>
					{/each}
				</div>
			</Modal>
		{/if}
	</div>
	{#each communities as community (community.community_id)}
		<button
			type="button"
			class:selected={community === selected_community}
			disabled={community === selected_community}
			on:click={() => select_community(community)}
		>
			{community.name}
		</button>
	{/each}
</div>

<style>
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}

	.header {
		display: flex;
	}

	.community-nav {
		height: 100%;
		width: 8.5rem;
		border-top: var(--border);
		border-right: var(--border);
		display: flex;
		flex-direction: column;
	}
</style>
