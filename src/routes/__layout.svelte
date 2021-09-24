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
	import Onboard from '$lib/ui/Onboard.svelte';
	import {setData} from '$lib/ui/data';
	import {setUi, toUiStore} from '$lib/ui/ui';
	import {setApi, toApi} from '$lib/ui/api';
	import {setApp} from '$lib/ui/app';
	import {randomHue} from '$lib/ui/color';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {WEBSOCKET_URL} from '$lib/config';
	import {toWebsocketApiClient} from '$lib/ui/WebsocketApiClient';
	import {toHttpApiClient} from '$lib/ui/HttpApiClient';
	import type {ServicesParamsMap, ServicesResultMap} from '$lib/server/servicesTypes';
	import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';

	// TODO some of this shouldn't run during SSR, see the `onMount` function below
	const devmode = setDevmode();
	const data = setData($session);
	$: data.updateSession($session);
	const socket = setSocket(toSocketStore((data) => websocketApiClient.handle(data)));
	const ui = setUi(toUiStore(data));
	$: ui.updateData($data); // TODO this or make it an arg to the ui store?
	// TODO create only the websocket client, not the http client
	const websocketApiClient = toWebsocketApiClient<ServicesParamsMap, ServicesResultMap>(
		socket.send,
	);
	const httpApiClient = toHttpApiClient<ServicesParamsMap, ServicesResultMap>();
	const api = setApi(toApi(ui, data, websocketApiClient, httpApiClient));
	const app = setApp({data, ui, api, devmode, socket});
	browser && console.log('app', app);

	$: guest = $session.guest;
	$: onboarding = !$session.guest && !$data.personas.length;

	// TODO refactor -- where should this logic go?
	$: updateStateFromPageParams($page.params);
	const updateStateFromPageParams = (params: {community?: string; space?: string}) => {
		if (!params.community) return;
		const community = $data.communities.find((c) => c.name === params.community);
		if (!community) return; // occurs when a session routes to a community they can't access
		const {community_id} = community;
		if (community_id !== $ui.selectedCommunityId) {
			api.selectCommunity(community_id);
		}
		if (community_id) {
			const spaceUrl = '/' + (params.space || '');
			const space = community.spaces.find((s) => s.url === spaceUrl);
			if (!space) throw Error(`TODO Unable to find space: ${spaceUrl}`);
			const {space_id} = space;
			if (space_id !== $ui.selectedSpaceIdByCommunity[community_id]) {
				api.selectSpace(community_id, space_id);
			}
		} else {
			// TODO what is this condition?
		}
	};

	onMount(() => {
		// TODO create the API client here -- do we need a `$client.ready` state
		// to abstract away `$socket.connected`?
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
	{#if !guest && !onboarding}
		<Luggage />
		<MainNav />
	{/if}
	<main>
		{#if guest}
			<div class="column">
				<Markup>
					<AccountForm {guest} logIn={api.logIn} logOut={api.logOut} />
				</Markup>
			</div>
		{:else if onboarding}
			<div class="column">
				<Onboard />
			</div>
		{:else}
			<slot />
		{/if}
	</main>
	<Devmode {devmode} />
</div>

<FeltWindowHost query={() => ({hue: randomHue($data.account?.name || GUEST_PERSONA_NAME)})} />

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
