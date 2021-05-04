<script lang="ts">
	import type {Community} from '../communities/community.js';

	export let communities: Community[];
	export let communityFocus: Community;
	const changeFocus = async (index: number) => {
		$: communityFocus = communities[index];
	};
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
