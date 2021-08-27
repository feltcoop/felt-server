<script lang="ts">
	import '$lib/ui/style.css';
	import '@feltcoop/felt/ui/style.css';
	import {set_devmode} from '@feltcoop/felt/ui/devmode.js';
	import Devmode from '@feltcoop/felt/ui/Devmode.svelte';
	import {onMount} from 'svelte';
	import {session} from '$app/stores';
	import {dev} from '$app/env';

	import {set_socket, to_socket_store} from '$lib/ui/socket';
	import Luggage from '$lib/ui/Luggage.svelte';
	import MainNav from '$lib/ui/MainNav.svelte';
	import {set_data} from '$lib/ui/data';
	import {set_ui} from '$lib/ui/ui';
	import {set_api, to_api_store} from '$lib/ui/api';
	import {set_app} from '$lib/ui/app';
	import {random_hue} from '$lib/ui/color';

	const devmode = set_devmode();
	const data = set_data($session);
	$: data.update_session($session);
	const socket = set_socket(to_socket_store(data));
	const ui = set_ui();
	$: ui.update_data($data); // TODO this or make it an arg to the ui store?
	const api = set_api(to_api_store(ui, data, socket));
	const app = set_app({data, ui, api, devmode, socket});
	console.log('app', app);

	onMount(() => {
		const socket_url = dev ? `ws://localhost:3001/ws` : `wss://staging.felt.dev/ws`;
		socket.connect(socket_url);
		return () => {
			socket.disconnect();
		};
	});

	const on_window_message = (e: MessageEvent) => {
		console.log('[window.message]', e);
		// TODO show request modal to user so they can accept/deny
		// the iframe's connection/data/capability request
		if (e.data === 'felt__connect') {
			// TODO security -- pass origin, not '*'
			(e.source as any).postMessage('felt__connected', '*');
		} else if (e.data === 'felt__query') {
			// TODO a real API
			(e.source as any).postMessage(
				JSON.stringify({type: 'Message', payload: {hue: random_hue($data.account.name)}}),
				'*',
			);
		}
	};
</script>

<svelte:head>
	<link rel="shortcut icon" href="favicon.png" />
</svelte:head>

<svelte:window on:message={on_window_message} />

<div class="layout">
	{#if !$session.guest}
		<Luggage />
		<MainNav />
	{/if}
	<slot />
	<Devmode {devmode} />
	<div id="modal-wrapper" />
</div>

<style>
	.layout {
		height: 100%;
		width: 100%;
		display: flex;
		position: relative;
		/* align-items: stretch; */
	}
</style>
