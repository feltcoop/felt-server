<script lang="ts">
	import type {Space} from '../spaces/space.js';

	export let spaces: Space[];
	export let selectedSpace: Space;
	export let selectSpace: (community: Space) => void;

	const createSpace = async () => {
		//Trigger component with input form
		//Needs to collect url(i.e. name for now), type (currently default json/application), & content (hardcoded JSON struct)
		//Finally submit as a JSON package to server
		console.log('create');
	};
</script>

<div class="sidenav">
	<div class="header">
		<button type="button" class="button-emoji" on:click={() => createSpace()}>➕</button>|
		<button type="button" class="button-emoji" on:click={() => console.log('search')}>🔍</button>
	</div>
	{#each spaces as space (space.space_id)}
		<button type="button" class="button-nav" on:click={() => selectSpace(space)}>{space.url}</button
		>
	{/each}
</div>

<style>
	.button-emoji {
		background: none;
		border: none;
		cursor: pointer;
		margin: 0;
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
