<script lang="ts">
	import {type SocketStore} from '$lib/ui/socket';

	export let socket: SocketStore;

	const onInput = (e: Event & {currentTarget: EventTarget & HTMLInputElement}) => {
		socket.updateUrl(e.currentTarget.value);
	};

	const connect = () => socket.connect($socket.url!); // TODO maybe make the socket state a union type for connected/disconnected states?
</script>

<div class="socket-connection">
	{#if $socket.open}
		<form>
			<input value={$socket.url} on:input={onInput} disabled />
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
			<input value={$socket.url} on:input={onInput} disabled={$socket.status === 'pending'} />
			<button type="button" on:click={connect} disabled={$socket.status === 'pending'}>
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
