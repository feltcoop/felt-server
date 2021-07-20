<script lang="ts">
	import {onMount} from 'svelte';
	import {get_devmode} from '@feltcoop/felt/ui/devmode.js';

	import type {Socket_Store} from '$lib/ui/socket_store.js';

	const devmode = get_devmode();

	let url = `ws://localhost:3002/ws`;
	export let socket: Socket_Store;

	onMount(() => {
		const {hostname} = window.location;
		console.log(hostname);
		url = `ws://${hostname}:3002/ws`;
		console.log('created socket store', socket, url);
		socket.connect(url); // TODO should be reactive to `url` changes
	});
</script>

{#if $devmode}
	<div class="socket-connection">
		{#if $socket.connected}
			<form>
				<input bind:value={url} type="text" disabled />
				<button
					type="button"
					on:click={() => socket.disconnect()}
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
{/if}

<style>
	.socket-connection {
		display: flex;
		flex-direction: column;
		align-items: center;
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
