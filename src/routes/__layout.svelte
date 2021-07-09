<script lang="ts">
	import '../app.css';
	import {setContext} from 'svelte';

	import SocketConnection from '$lib/ui/Socket_Connection.svelte';
	import {createSocketStore} from '$lib/ui/socket_store';

	const socket = createSocketStore();
	const socketUrl = 'ws://localhost:3002/ws';
	setContext('socket', socket);
</script>

<svelte:head>
	<link rel="shortcut icon" href="favicon.png" />
</svelte:head>

<!-- TODO get this working with port 3000 as the default -
		can't get the right proxy configuration, or something -->
<SocketConnection {socket} url={socketUrl} />

<slot />
