<script lang="ts">
	import {browser} from '$app/env';

	import type {Space} from '$lib/vocab/space/space.js';
	import SpaceInput from '$lib/ui/SpaceInput.svelte';
	import type {CommunityModel} from '$lib/vocab/community/community.js';
	import MemberInput from '$lib/ui/MemberInput.svelte';
	import type {Member} from '$lib/vocab/member/member.js';

	export let community: CommunityModel;
	export let spaces: Space[];
	export let selectedSpace: Space | null;
	export let members: Member[];
	$: browser && console.log('spaces', spaces);
</script>

<div class="space-nav">
	<div class="header">
		<SpaceInput {community} />
		<MemberInput {community} {members} />
	</div>
	<!-- TODO the community url -->
	{#each spaces as space (space.space_id)}
		<a href="/{community.name}{space.url}" class:selected={space === selectedSpace}>
			{space.name}
		</a>
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

	a {
		padding: var(--spacing_xs) var(--spacing_sm);
	}
</style>
