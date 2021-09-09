<script lang="ts">
	import Dialog from '@feltcoop/felt/ui/Dialog.svelte';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';

	import type {Community} from '$lib/vocab/community/community.js';
	import type {Member} from '$lib/vocab/member/member.js';
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();

	export let members: Member[];
	export let community: Community;

	let open = false;

	$: invitable_members = community
		? members.filter((x) => !community.members.some((y) => x.persona_id == y.persona_id))
		: [];
</script>

<!--TODO: Make an IconButton component in felt and use it here-->
<button
	aria-label="Invite users to {community.name}"
	type="button"
	class="button-emoji"
	on:click={() => (open = true)}
>
	✉️
</button>
{#if open}
	<Dialog on:close={() => (open = false)}>
		<Markup>
			<h1>Invite users to {community.name}</h1>
			{#each invitable_members as member (member.persona_id)}
				<p>
					<button
						type="button"
						class="button-join"
						on:click={() => api.invite_member(community.community_id, member.persona_id)}
					>
						{member.name}
					</button>
				</p>
			{:else}
				<p>There's no one new to invite</p>
			{/each}
		</Markup>
	</Dialog>
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
