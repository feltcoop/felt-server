<script lang="ts">
	import '$lib/ui/style.css';
	import '@feltcoop/felt/ui/style.css';
	import {set_devmode} from '@feltcoop/felt/ui/devmode.js';
	import Devmode from '@feltcoop/felt/ui/Devmode.svelte';
	import {onMount} from 'svelte';
	import {session} from '$app/stores';
	import {dev} from '$app/env';

	import {set_socket} from '$lib/ui/socket';
	import Main_Nav from '$lib/ui/Main_Nav.svelte';
	import {set_data} from '$lib/ui/data';
	import {set_ui} from '$lib/ui/ui';
	import {set_api, to_api_store} from '$lib/ui/api';

	const devmode = set_devmode();
	const socket = set_socket();
	const data = set_data($session);
	$: data.update_session($session);
	const ui = set_ui();
	$: ui.update_data($data); // TODO this or make it an arg to the ui store?
	set_api(to_api_store(ui, data));
	// TODO consider higher order components instead of linking stores together like this,
	// 	continuing component-level composition:
	// 	<Ui>
	// 		<Data>
	// 			<Api>
	// 				<Main_Nav />
	// 			</Api>
	// 		</Data>
	// 	</Ui>

	console.log('$data', $data);

	onMount(() => {
		const url = dev ? `ws://localhost:3001/ws` : `wss://staging.felt.dev/ws`;
		console.log('created socket store', $socket, url);
		socket.connect(url); // TODO should be reactive to `url` changes
		return () => {
			socket.disconnect();
		};
	});
</script>

<svelte:head>
	<link rel="shortcut icon" href="favicon.png" />
</svelte:head>

<div class="layout">
	{#if !$session.guest && $ui.expand_main_nav}
		<Main_Nav />
	{/if}
	<slot />
	<Devmode {devmode} />
</div>

<style>
	.layout {
		height: 100%;
		width: 100%;
		display: flex;
		/* align-items: stretch; */
	}
</style>
