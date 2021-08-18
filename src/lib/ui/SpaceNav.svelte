<script lang="ts">
	import type {Space} from '$lib/spaces/space.js';
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import type {CommunityModel} from '$lib/communities/community.js';
	import MemberInput from '$lib/ui/MemberInput.svelte';
	import type {Member} from '$lib/members/member.js';
	import {get_app} from '$lib/ui/app';

	const {api} = get_app();

	export let community: CommunityModel;
	export let spaces: Space[];
	export let selected_space: Space | null;
	export let members: Member[];
	$: console.log('spaces', spaces);
</script>

<div class="space-nav">
	<div class="header">
		<SpaceInput {community} />
		<MemberInput {community} {members} />
	</div>
	{#each spaces as space (space.space_id)}
		<button
			class:selected={space === selected_space}
			on:click={() => api.select_space(community.community_id, space.space_id)}
		>
			<!-- TODO {space.name} -->
			{space.url}
		</button>
	{/each}
</div>

<style>
	.space-nav {
		height: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
	}
	button {
		justify-content: flex-start;
	}
</style>
