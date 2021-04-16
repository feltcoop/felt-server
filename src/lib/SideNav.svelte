<script lang="ts">
	export let communities: {community_id: number; name: string}[];
	console.log(communities)
	const submitName = async () => {
		console.log('button');
	};
</script>

<div class="sidenav">
	<button type="button" on:click={submitName}> F </button>
	<button type="button"> S </button>
	<button type="button"> D </button>
	<!-- {#each communities as {name} (name)}
		<button type="button">{ name } </button>
	{/each} -->
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
