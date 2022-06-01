<script lang="ts">
	import {onMount} from 'svelte';
	import {session} from '$app/stores';

	import type {SocketStore} from '$lib/ui/socket';

	export let socket: SocketStore;
	export let url: string;

	$: guest = $session.guest;

	let mounted = false;

	onMount(() => {
		mounted = true;
		return () => {
			socket.disconnect();
		};
	});

	// Keep the socket connected when logged in, and disconnect when logged out.
	$: if (mounted) {
		console.log(':CONNECTING');
		if (guest) {
			socket.disconnect();
		} else {
			socket.connect(url);
		}
	} else {
		console.log('NOT YET MOUNTED');
	}
</script>
