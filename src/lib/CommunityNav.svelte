<script lang="ts">
	import type {Community} from '../communities/community.js';

	export let communities: Community[];
	export let selectedCommunity: Community;
	export let selectCommunity: (community: Community) => void;
</script>

<div class="sidenav">
	{#each communities as community (community.community_id)}
		<button type="button" on:click={() => selectCommunity(community)}>{community.name} </button>
	{/each}
</div>

<style>
	button {
		border: 1px outset grey;
		background-color: lightGreen;
		height: 75px;
		width: 75px;
		cursor: pointer;
		margin: 5%;
		word-wrap: break-word;
	}

	button:active {
		background-color: grey;
	}

	.sidenav {
		width: 85px;
		height: 100%;
		position: fixed;
	}
</style>
