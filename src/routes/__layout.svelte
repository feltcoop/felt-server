<script lang="ts">
	import '../app.css';
	import {setContext} from 'svelte';

	import Socket_Connection from '$lib/ui/Socket_Connection.svelte';
	import {create_socket_store} from '$lib/ui/socket_store';

	const socket = create_socket_store();
	setContext('socket', socket);
</script>

<svelte:head>
	<link rel="shortcut icon" href="favicon.png" />
</svelte:head>

<!-- TODO get this working with port 3000 as the default -
		can't get the right proxy configuration, or something -->
<Socket_Connection {socket} />

<slot />
