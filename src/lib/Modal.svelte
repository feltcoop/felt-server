<script lang="ts">
	let isOpen = false;
	function open() {
		isOpen = true;
	}
	function close() {
		isOpen = false;
	}
</script>

<slot name="trigger" {open}>
	<!-- fallback trigger to open the modal -->
	<button on:click={open}>Open</button>
</slot>

{#if isOpen}
	<div class="modal">
		<div class="backdrop" on:click={close} />

		<div class="content-wrapper">
			<slot name="header">
				<!-- fallback -->
				<div>
					<h1>Your Modal Heading Goes Here...<button on:click={close}>close</button></h1>
				</div>
			</slot>

			<div class="content">
				<slot name="content" />
			</div>

			<slot name="footer" {close}>
				<!-- fallback -->
				<div>
					<h1>Your Modal Footer Goes Here...</h1>
				</div>
			</slot>
		</div>
	</div>
{/if}

<style>
	div.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		z-index: 10;

		display: flex;
		justify-content: center;
		align-items: center;
	}
	div.backdrop {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.4);
	}
	div.content-wrapper {
		z-index: 10;
		max-width: 70vw;
		border-radius: 0.3rem;
		background-color: white;
		overflow: hidden;
	}
	div.content {
		max-height: 50vh;
		overflow: auto;
	}
</style>
