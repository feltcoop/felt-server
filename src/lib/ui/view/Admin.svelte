<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import Avatar from '$lib/ui/Avatar.svelte';

	const {dispatch} = getApp();

	// TODO this is just stubbing out some admin-like UI
	let communities: Community[] | undefined;
	const loadAllCommunities = async () => {
		// TODO need to cache this data in the `ui` somehow -- see comment below
		const result = await dispatch.ReadCommunities({});
		if (!result.ok) throw Error(); // TODO querying helpers
		communities = result.value.communities;
	};
</script>

<div class="markup">
	<h1>admin</h1>
	<h2>communities</h2>
	{#if communities}
		<ul>
			{#each communities as community}
				<!-- TODO `CommunityAvatar` expects a store that's registered with the system for the contextmenu,
        and we probably want that as well, right? So how can we cache the data? See above. -->
				<Avatar name={community.name} type="Community" hue={community.settings.hue} />
			{/each}
		</ul>
	{:else}
		<!-- TODO pending status with query state -->
		<button on:click={loadAllCommunities}>load all communities</button>
	{/if}
</div>

<style>
	.markup {
		min-height: 100%;
	}
</style>
