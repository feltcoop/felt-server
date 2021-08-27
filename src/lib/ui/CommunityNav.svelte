<script lang="ts">
	import type {Community} from '$lib/communities/community.js';
	import type {Member} from '$lib/members/member.js';
	import type {Persona} from '$lib/personas/persona.js';
	import CommunityInput from '$lib/ui/CommunityInput.svelte';
	import ActorIcon from '$lib/ui/ActorIcon.svelte';
	import {get_app} from '$lib/ui/app';
	import {random_hue} from '$lib/ui/color';

	const {api} = get_app();

	export let members: Member[];
	export let communities: Community[];
	export let personas: Persona[];
	export let selected_community: Community;
	export let selected_persona: Persona;

	$: communityMap = new Map(communities.map((community) => [community.community_id, community]));
	$: console.log('commap', communityMap);
</script>

<div class="community-nav">
	<div class="header">
		<CommunityInput />
	</div>
	<!-- <div>
		{#each communities as community (community.community_id)}
			 TODO make these links <a>...</a>
			<button
				class:selected={community === selected_community}
				on:click={() => api.select_community(community.community_id)}
				style="--hue: {random_hue(community.name)}"
			>
				<ActorIcon name={community.name} />
			</button>
		{/each}
	</div> -->
	<div>
		{selected_persona.name}
		{#each selected_persona.community_ids as community_id}
			<button
				class:selected={communities.find((c) => c.community_id == community_id) ===
					selected_community}
				on:click={() => api.select_community(community_id)}
			>
				{communityMap.get(community_id)?.name}
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
