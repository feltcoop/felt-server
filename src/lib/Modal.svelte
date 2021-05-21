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
		<div class="container">
			<slot name="header" />
			<div class="content">
				<slot name="content" />
			</div>
			<slot name="footer" />
		</div>
	</div>
{/if}

<style>
	div.modal {
		--container_padding: 20px;

		position: fixed;
		top: 0;
		left: 0;
		z-index: 1;
		width: 100%;
		height: 100%;
		padding: var(--container_padding);
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
	div.container {
		z-index: 1;
		background-color: #fff;
		border: 1px solid #ccc;
		max-width: calc(100% - var(--container_padding) * 2);
		max-height: calc(100% - var(--container_padding) * 2);
		overflow: hidden;
	}
	div.content {
		max-height: 100%; /* is this neeed? */
		overflow: auto;
	}
</style>
