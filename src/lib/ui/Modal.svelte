<script lang="ts">
	let opened = false;
	const open = () => {
		opened = true;
	};
	const close = () => {
		opened = false;
	};
</script>

<slot name="trigger" {open} {close}>
	<button on:click={open}>open</button>
</slot>

{#if opened}
	<div class="modal">
		<div class="backdrop" on:click={close} />
		<div class="content">
			<slot name="content" {open} {close} />
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 3;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.backdrop {
		position: absolute;
		z-index: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.4);
	}
	.content {
		position: relative;
		margin: auto;
		max-width: calc(100% - 40px);
		max-height: calc(100% - 40px);
		background-color: #fff;
		border: 1px solid #ccc;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
