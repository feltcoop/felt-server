<script lang="ts">
	import type {Community} from '../communities/community.js';

	export let communities: Community[];
	const submitName = async (name: string) => {
		console.log(name);
	};
</script>

<div class="sidenav">
	{#each communities as {name} (name)}
		<button type="button" on:click={() => submitName(name)}>{name} </button>
	{/each}
</div>

<style>
	button {
		border: 1px outset grey;
		background-color: lightGreen;
		height: 75px;
		width: 90%;
		cursor: pointer;
		margin: 5%;
	}

	button:active {
		background-color: grey;
	}

	.sidenav {
		width: 5%;
		height: 100%;
		border: 2px outset black;
		position: fixed;
	}
</style>
