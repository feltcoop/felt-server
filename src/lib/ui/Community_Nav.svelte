<script lang="ts">
	import type {Community} from '$lib/communities/community.js';
	import type {Member} from '$lib/members/member.js';
	import Community_Nav_Input from '$lib/Community_Nav_Input.svelte';
	import {get_api} from '$lib/ui/api';

	const api = get_api();

	export let friends: Member[];
	export let communities: Community[];
	export let selected_community: Community;
</script>

<div class="community-nav">
	<div class="header"><Community_Nav_Input /></div>
	{#each communities as community (community.community_id)}
		<button
			type="button"
			class:selected={community === selected_community}
			disabled={community === selected_community}
			on:click={() => api.select_community(community.community_id)}
		>
			{community.name}
		</button>
	{/each}
</div>

<style>
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
