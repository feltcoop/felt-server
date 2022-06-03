<script lang="ts">
	import type {SocketStore} from '$lib/ui/socket';

	export let socket: SocketStore;

	const connect = () => socket.connect($socket.url!); // TODO maybe make the socket state a union type for connected/disconnected states?
	const disconnect = () => socket.disconnect();
</script>

<form>
	<input value={$socket.url} on:input={(e) => socket.updateUrl(e.currentTarget.value)} />
	<button type="button" on:click={$socket.ws ? disconnect : connect}>
		{#if $socket.ws}disconnect{:else}connect{/if}
	</button>
</form>
<div>status: <code>'{$socket.status}'</code></div>
