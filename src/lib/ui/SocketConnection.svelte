<script lang="ts">
	import {onDestroy} from 'svelte';
	import {session} from '$app/stores';
	import {browser} from '$app/env';

	import type {SocketStore} from '$lib/ui/socket';

	export let socket: SocketStore;
	export let url: string;

	$: ({guest} = $session);

	onDestroy(() => {
		socket.disconnect();
	});

	// Keep the socket connected when logged in, and disconnect when logged out.
	$: if (browser) {
		if (guest) {
			socket.disconnect();
		} else {
			socket.connect(url);
		}
	}
</script>
