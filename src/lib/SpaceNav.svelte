<script lang="ts">
	import type {Space} from '../spaces/space.js';

	export let spaces: Space[];
	export let selectedSpace: Space;
	export let selectSpace: (community: Space) => void;
</script>

<div class="sidenav">
	{#each spaces as space (space.space_id)}
		<button type="button" on:click={() => selectSpace(space)}>{space.url}</button>
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
