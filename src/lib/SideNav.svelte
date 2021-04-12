<script>
	const submitName = async () => {
		console.log('button');
	};
</script>

<div class="sidenav">
	<button type="button" on:click={submitName}> F </button>
	<button type="button"> S </button>
	<button type="button"> D </button>
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
