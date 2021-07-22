<script lang="ts">
	import '$lib/ui/style.css';
	import '@feltcoop/felt/ui/style.css';
	import {set_devmode} from '@feltcoop/felt/ui/devmode.js';
	import Devmode from '@feltcoop/felt/ui/Devmode.svelte';
	import {session} from '$app/stores';

	import {set_socket} from '$lib/ui/socket';
	import Main_Nav from '$lib/ui/Main_Nav.svelte';
	import {set_data} from '$lib/ui/data';
	import {set_ui} from '$lib/ui/ui';

	const devmode = set_devmode();
	set_socket();
	const data = set_data($session);
	$: data.set_session($session);
	const ui = set_ui();
	$: ui.set_data($data);

	console.log('$data', $data);
</script>

<svelte:head>
	<link rel="shortcut icon" href="favicon.png" />
</svelte:head>

<div class="layout">
	{#if !$session.guest}
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
