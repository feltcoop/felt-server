<script lang="ts">
	import type {Community} from '$lib/communities/community.js';
	import Modal from '$lib/ui/Modal.svelte';
	import type {Member} from '$lib/members/member.js';
	import {get_api} from '$lib/ui/api';

	const api = get_api();

	export let members: Member[];
	export let selected_community: Community;

	$: invitable_members = selected_community
		? members.filter((x) => !selected_community.members.some((y) => x.account_id == y.account_id))
		: [];

	let new_name = '';

	const on_keydown = async (e: KeyboardEvent, close_modal: () => void) => {
		if (e.key === 'Enter') {
			await api.create_community(new_name);
			new_name = '';
			close_modal();
		}
	};
</script>

<Modal>
	<div slot="trigger" let:open>
		<button aria-label="Create Community" type="button" class="button-emoji" on:click={() => open()}
			>➕</button
		>
	</div>
	<div slot="content" let:close>
		<h1>Create a new community</h1>
		<p>
			<input
				type="text"
				placeholder="> name"
				on:keydown={(e) => on_keydown(e, close)}
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
			{#each invitable_members as member (member.account_id)}
				<p>
					<button
						type="button"
						class="button-join"
						on:click={() => api.invite_member(selected_community.community_id, member.account_id)}
					>
						[[TODO persona name: {member.account_id}]]
					</button>
				</p>
			{/each}
		</div>
	</Modal>
{/if}

<style>
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
