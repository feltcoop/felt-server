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
	import {browser} from '$app/env';

	import {setSocket, toSocketStore} from '$lib/ui/socket';
	import Luggage from '$lib/ui/Luggage.svelte';
	import MainNav from '$lib/ui/MainNav.svelte';
	import {setData} from '$lib/ui/data';
	import {setUi} from '$lib/ui/ui';
	import {setApi, toApiStore} from '$lib/ui/api';
	import {setApp} from '$lib/ui/app';
	import {randomHue} from '$lib/ui/color';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {WEBSOCKET_URL} from '$lib/constants';
	import {toHandleSocketMessage} from '$lib/ui/handleSocketMessage';

	const devmode = setDevmode();
	const data = setData($session);
	$: data.updateSession($session);
	const socket = setSocket(toSocketStore(toHandleSocketMessage(data)));
	const ui = setUi();
	$: ui.updateData($data); // TODO this or make it an arg to the ui store?
	const api = setApi(toApiStore(ui, data, socket));
	const app = setApp({data, ui, api, devmode, socket});
	browser && console.log('app', app);

	// TODO refactor -- where should this logic go?
	$: updateStateFromPageParams($page.params);
	const updateStateFromPageParams = (params: {community?: string; space?: string}) => {
		if (!params.community) return;
		const community = $data.communities.find((c) => c.name === params.community);
		if (!community) throw Error(`TODO Unable to find community: ${params.community}`);
		const {community_id} = community;
		if (community_id !== $ui.selectedCommunityId) {
			api.selectCommunity(community_id);
		}
		if (community_id && params.space) {
			const spaceUrl = '/' + params.space;
			const space = community.spaces.find((s) => s.url === spaceUrl);
			if (!space) throw Error(`TODO Unable to find space: ${spaceUrl}`);
			const {space_id} = space;
			if (space_id !== $ui.selectedSpaceIdByCommunity[community_id]) {
				api.selectSpace(community_id, space_id);
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
					<AccountForm guest={$session.guest} logIn={api.logIn} logOut={api.logOut} />
				</Markup>
			</div>
		{:else}
			<slot />
		{/if}
	</main>
	<Devmode {devmode} />
</div>

<FeltWindowHost query={() => ({hue: randomHue($data.account.name)})} />

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
