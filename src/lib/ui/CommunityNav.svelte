<script lang="ts">
	import type {Community} from '$lib/vocab/community/community.js';
	import type {Member} from '$lib/vocab/member/member.js';
	import CommunityInput from '$lib/ui/CommunityInput.svelte';
	import ActorIcon from '$lib/ui/ActorIcon.svelte';
	import {randomHue} from '$lib/ui/color';

	export let members: Member[];
	export let selectedPersonaCommunities: Community[];
	export let selectedCommunity: Community;
</script>

<div class="community-nav">
	<div class="header">
		<CommunityInput />
	</div>
	<div>
		{#each selectedPersonaCommunities as community (community.community_id)}
			<!-- TODO make these links <a>...</a> -->
			<a
				href="/{community.name}"
				class:selected={community === selectedCommunity}
				style="--hue: {randomHue(community.name)}"
			>
				<ActorIcon name={community.name} />
			</a>
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

	a {
		display: block;
		/* TODO better way to have active state? this makes the community nav wider than the luggage button! */
		border: 1px solid transparent;
	}
	.selected {
		border-color: var(--active_color);
		background-color: var(--bg);
	}
</style>
