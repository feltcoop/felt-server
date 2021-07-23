<script lang="ts">
	import type {Space} from '$lib/spaces/space.js';
	import Space_Input from '$lib/ui/Space_Input.svelte';
	import type {Community_Model} from '$lib/communities/community.js';
	import {get_api} from '$lib/ui/api';

	const api = get_api();

	export let community: Community_Model;
	export let spaces: Space[];
	export let selected_space: Space | null;
</script>

<div class="space-nav">
	<div class="header">
		<Space_Input {community} />
	</div>
	{#each spaces as space (space.space_id)}
		<button
			class:selected={space === selected_space}
			disabled={space === selected_space}
			on:click={() => api.select_space(community.community_id, space.space_id)}
		>
			{space.url}
		</button>
	{/each}
</div>

<style>
	.space-nav {
		height: 100%;
		flex: 1;
		border-top: var(--border);
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
	}

	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
		word-wrap: break-word;
	}
</style>
