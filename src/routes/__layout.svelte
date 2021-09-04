<script lang="ts">
	import '@feltcoop/felt/ui/style.css';
	import '$lib/ui/style.css';
	import {setDevmode} from '@feltcoop/felt/ui/devmode.js';
	import Devmode from '@feltcoop/felt/ui/Devmode.svelte';
	import FeltWindowHost from '@feltcoop/felt/ui/FeltWindowHost.svelte';
	import {onMount} from 'svelte';
	import {session} from '$app/stores';
	import Markup from '@feltcoop/felt/ui/Markup.svelte';
	import {page} from '$app/stores';

	import {set_socket, to_socket_store} from '$lib/ui/socket';
	import Luggage from '$lib/ui/Luggage.svelte';
	import MainNav from '$lib/ui/MainNav.svelte';
	import {set_data} from '$lib/ui/data';
	import {set_ui} from '$lib/ui/ui';
	import {set_api, to_api_store} from '$lib/ui/api';
	import {set_app} from '$lib/ui/app';
	import {random_hue} from '$lib/ui/color';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {WEBSOCKET_URL} from '$lib/constants';

	const devmode = setDevmode();
	const data = set_data($session);
	$: data.update_session($session);
	const socket = set_socket(to_socket_store(data));
	const ui = set_ui();
	$: ui.update_data($data); // TODO this or make it an arg to the ui store?
	const api = set_api(to_api_store(ui, data, socket));
	const app = set_app({data, ui, api, devmode, socket});
	console.log('app', app);

	// TODO refactor -- where should this logic go?
	$: update_state_from_page_params($page.params);
	const update_state_from_page_params = (params: {community?: string; space?: string}) => {
		if (!params.community) return;
		const community = $data.communities.find((c) => c.name === params.community);
		if (!community) throw Error(`TODO Unable to find community: ${params.community}`);
		const {community_id} = community;
		if (community_id !== $ui.selected_community_id) {
			api.select_community(community_id);
		}
		if (community_id && params.space) {
			const space_url = '/' + params.space;
			const space = community.spaces.find((s) => s.url === space_url);
			if (!space) throw Error(`TODO Unable to find space: ${space_url}`);
			const {space_id} = space;
			if (space_id !== $ui.selected_space_id_by_community[community_id]) {
				api.select_space(community_id, space_id);
			}
		}
	};

	onMount(() => {
		socket.connect(WEBSOCKET_URL);
		return () => {
			socket.disconnect();
		};
	});
</script>

<svelte:head>
	<link rel="shortcut icon" href="/favicon.png" />
</svelte:head>

<div class="layout">
	{#if !$session.guest}
		<Luggage />
		<MainNav />
	{/if}
	<main>
		{#if $session.guest}
			<div class="column">
				<Markup>
					<AccountForm guest={$session.guest} log_in={api.log_in} log_out={api.log_out} />
				</Markup>
			</div>
		{:else}
			<slot />
		{/if}
	</main>
	<Devmode {devmode} />
	<div id="modal-wrapper" />
</div>

<FeltWindowHost query={() => ({hue: random_hue($data.account.name)})} />

<style>
	.layout {
		height: 100%;
		width: 100%;
		display: flex;
		position: relative;
	}

	main {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
</style>
