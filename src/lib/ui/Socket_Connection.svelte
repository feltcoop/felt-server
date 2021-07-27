<script lang="ts">
	import {get_devmode} from '@feltcoop/felt/ui/devmode.js';

	import {get_socket} from '$lib/ui/socket';

	const socket = get_socket();
	const devmode = get_devmode();

	let new_url = $socket.url || '';
	const reset_url = () => (new_url = $socket.url || '');
	$: if ($socket.connected) reset_url();
</script>

{#if $devmode}
	<div class="socket-connection">
		{#if $socket.connected}
			<form>
				<input bind:value={new_url} type="text" disabled />
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
				<input bind:value={new_url} type="text" disabled={$socket.status === 'pending'} />
				<button
					type="button"
					on:click={() => socket.connect(new_url)}
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
