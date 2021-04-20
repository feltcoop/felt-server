<script lang="ts">
	import Chat from '$lib/Chat.svelte';

	import SocketConnection from '$lib/SocketConnection.svelte';
	import {createSocketStore} from '$lib/socketStore';

	const socket = createSocketStore();
	const socketUrl = 'ws://localhost:3002/ws';
</script>

<!-- TODO get this working with port 3000 as the default -
		can't get the right proxy configuration, or something -->
<SocketConnection {socket} url={socketUrl} />

{#if $socket.connected}
	<Chat {socket} />
{/if}

<slot />
