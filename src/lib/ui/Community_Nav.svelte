<script lang="ts">
	import type {Community} from '$lib/communities/community.js';
	import type {Member} from '$lib/members/member.js';
	import Community_Input from '$lib/ui/Community_Input.svelte';
	import {get_api} from '$lib/ui/api';

	const api = get_api();

	export let members: Member[];
	export let communities: Community[];
	export let selected_community: Community;
</script>

<div class="community-nav">
	<div class="header">
		<Community_Input />
	</div>
	<div>
		{#each communities as community (community.community_id)}
			<!-- TODO make these links <a>...</a> -->
			<button
				class:selected={community === selected_community}
				on:click={() => api.select_community(community.community_id)}
			>
				{community.name.substring(0, 4)}
			</button>
		{/each}
	</div>
</div>

<style>
	.community-nav {
		height: 100%;
		border-right: var(--border);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}
	.header :global(button) {
		width: 100%;
	}

	button {
		width: var(--icon_size_md);
		height: var(--icon_size_md);
	}
</style>
