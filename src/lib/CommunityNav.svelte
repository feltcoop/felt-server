<script lang="ts">
	import type {Community} from '../communities/community.js';

	export let communities: Community[];
	export let selectedCommunity: Community;
	export let selectCommunity: (community: Community) => void;
	let selectedCommunityIndex: number | null = null;
	$: selectedCommunity = selectedCommunityIndex ?? communities[selectedCommunityIndex];
	const changeFocus = (index: number) => selectCommunity(communities[index]);
</script>

<div class="sidenav">
	{#each communities as community, i}
		<button type="button" on:click={() => changeFocus(i)}>{community.name} </button>
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
