<script lang="ts">
	import '@feltcoop/felt/ui/style.css';
	import {setContext} from 'svelte';
	import {set_devmode} from '@feltcoop/felt/ui/devmode.js';
	import Devmode from '@feltcoop/felt/ui/Devmode.svelte';

	import '$lib/ui/style.css';
	import Socket_Connection from '$lib/ui/Socket_Connection.svelte';
	import {create_socket_store} from '$lib/ui/socket_store';

	const socket = create_socket_store();
	setContext('socket', socket);

	const devmode = set_devmode();
</script>

<svelte:head>
	<link rel="shortcut icon" href="favicon.png" />
</svelte:head>

<!-- TODO get this working with port 3000 as the default -
		can't get the right proxy configuration, or something -->
<Socket_Connection {socket} />

<slot />

<Devmode {devmode} />
