<script lang="ts">
	import {onMount} from 'svelte';

	import type {SocketStore} from './socketStore.js';

	export let url = 'ws://localhost:3000/ws';
	export let socket: SocketStore;

	let connectEl: HTMLButtonElement;

	onMount(() => {
		socket.connect(url);
	});
</script>

<div class="SocketConnection">
	{#if $socket.connected}
		<form>
			<input bind:value={url} type="text" disabled />
			<button
				type="button"
				on:click={() => socket.disconnect()}
				bind:this={connectEl}
				disabled={$socket.status === 'pending'}
			>
				disconnect
			</button>
		</form>
	{:else}
		<form>
			<input bind:value={url} type="text" disabled={$socket.status === 'pending'} />
			<button
				type="button"
				on:click={() => socket.connect(url)}
				bind:this={connectEl}
				disabled={$socket.status === 'pending'}
			>
				connect
			</button>
		</form>
	{/if}
	<h2>status: <code>'{$socket.status}'</code></h2>
	{#if $socket.error}
		<h2 class="error">error: <code>'{$socket.error}'</code></h2>
	{/if}
</div>

<style>
	.SocketConnection {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	button {
		font-size: 32px;
	}
	input {
		font-size: 20px;
	}
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.error {
		/* TODO maybe `color: var(--error_text_color);` */
		color: red;
	}
	h2 {
		margin: 0;
	}
</style>
