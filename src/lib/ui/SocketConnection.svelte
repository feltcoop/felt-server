<script lang="ts">
	import {getApp} from '$lib/ui/app';

	const {socket, devmode} = getApp();

	let newUrl = $socket.url || '';
	const resetUrl = () => (newUrl = $socket.url || '');
	$: if ($socket.connected) resetUrl();
</script>

{#if $devmode}
	<div class="socket-connection">
		{#if $socket.connected}
			<form>
				<input bind:value={newUrl} type="text" disabled />
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
				<input bind:value={newUrl} type="text" disabled={$socket.status === 'pending'} />
				<button
					type="button"
					on:click={() => socket.connect(newUrl)}
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
