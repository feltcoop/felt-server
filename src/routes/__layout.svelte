<script lang="ts">
	import '@feltcoop/felt/ui/style.css';
	import '$lib/ui/style.css';
	import {setDevmode} from '@feltcoop/felt/ui/devmode.js';
	import DevmodeControls from '@feltcoop/felt/ui/DevmodeControls.svelte';
	import FeltWindowHost from '@feltcoop/felt/ui/FeltWindowHost.svelte';
	import {onMount} from 'svelte';
	import {session} from '$app/stores';
	import {page} from '$app/stores';
	import {browser} from '$app/env';
	import type {Readable} from 'svelte/store';
	import {get} from 'svelte/store';

	import {setSocket, toSocketStore} from '$lib/ui/socket';
	import Luggage from '$lib/ui/Luggage.svelte';
	import MainNav from '$lib/ui/MainNav.svelte';
	import Onboard from '$lib/ui/Onboard.svelte';
	import {setUi, toUi} from '$lib/ui/ui';
	import {toDispatch} from '$lib/app/dispatch';
	import {setApp} from '$lib/ui/app';
	import {randomHue} from '$lib/ui/color';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {WEBSOCKET_URL} from '$lib/config';
	import {toWebsocketApiClient} from '$lib/ui/WebsocketApiClient';
	import {toHttpApiClient} from '$lib/ui/HttpApiClient';
	import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';
	import {findHttpService, findWebsocketService} from '$lib/ui/services';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {goto} from '$app/navigation';
	import {PERSONA_QUERY_KEY, setUrlPersona} from '$lib/ui/url';
	import Contextmenu from '$lib/ui/contextmenu/Contextmenu.svelte';
	import Dialogs from '$lib/ui/dialog/Dialogs.svelte';
	import {components} from '$lib/app/components';
	import AppContextmenu from '$lib/app/contextmenu/AppContextmenu.svelte';
	import ActingPersonaContextmenu from '$lib/app/contextmenu/ActingPersonaContextmenu.svelte';
	import LinkContextmenu from '$lib/app/contextmenu/LinkContextmenu.svelte';

	let initialMobileValue = false; // TODO this hardcoded value causes mobile view to change on load -- detect for SSR via User-Agent?
	const MOBILE_WIDTH = '50rem'; // treats anything less than 800px width as mobile
	if (browser) {
		// TODO to let the user override with their own preferred mobile setting,
		// which I could see wanting to do for various reasons including in `devmode`,
		// we need to either branch logic here, or have a different derived `media` value
		// that only reads this default value when the user has no override.
		const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_WIDTH})`);
		initialMobileValue = mediaQuery.matches;
		mediaQuery.onchange = (e) => dispatch('SetMobile', e.matches);
	}

	const devmode = setDevmode();
	const socket = setSocket(
		toSocketStore(
			(message) =>
				websocketClient.handle(message.data, (broadcastMessage) => {
					// TODO this is a hack to handle arbitrary messages from the server
					// outside of the normal JSON RPC calls -- we'll want to rethink this
					// so it's more structured and type safe
					const handler = (ui as any)[broadcastMessage.method];
					if (handler) {
						handler({
							invoke: () => Promise.resolve(broadcastMessage.result),
						});
					} else {
						console.warn('unhandled broadcast message', broadcastMessage, message.data);
					}
				}),
			() => dispatch('Ping'),
		),
	);
	const ui = setUi(toUi(session, initialMobileValue, components));

	const websocketClient = toWebsocketApiClient(findWebsocketService, socket.send); // TODO expose on `app`?
	const httpClient = toHttpApiClient(findHttpService);
	const dispatch = toDispatch(ui, (e) =>
		websocketClient.find(e) ? websocketClient : httpClient.find(e) ? httpClient : null,
	);
	const app = setApp({ui, dispatch, devmode, socket});
	if (browser) {
		(window as any).app = app;
		Object.assign(window, app);
		console.log('app', app);
	}
	$: browser && console.log('$session', $session);

	const {
		mobile,
		contextmenu,
		dialogs,
		account,
		sessionPersonas,
		communities,
		personaIndexSelection,
		communityIdSelection,
		spacesByCommunityId,
		spaceIdSelectionByCommunityId,
		personaSelection,
	} = ui;

	$: guest = $session.guest;
	$: onboarding = !guest && !$sessionPersonas.length;

	// TODO instead of dispatching `select` events on startup, try to initialize with correct values
	// TODO refactor -- where should this logic go?
	$: updateStateFromPageParams($page.params, $page.query);
	$: selectedPersona = $personaSelection; // must be after `updateStateFromPageParams`
	const updateStateFromPageParams = (
		params: {community?: string; space?: string},
		query: URLSearchParams,
	) => {
		if (!params.community) return;

		const rawPersonaIndex = query.get(PERSONA_QUERY_KEY);
		const personaIndex = rawPersonaIndex === null ? null : Number(rawPersonaIndex);
		const persona: Readable<Persona> | null =
			personaIndex === null ? null : $sessionPersonas[personaIndex];
		if (!persona) {
			if (browser) {
				const fallbackPersonaIndex = 0;
				console.warn(
					`unable to find persona at index ${personaIndex}; falling back to index ${fallbackPersonaIndex}`,
				);
				goto(
					location.pathname +
						'?' +
						setUrlPersona(fallbackPersonaIndex, new URLSearchParams(location.search)),
					{replaceState: true},
				);
				return; // exit early; this function re-runs from the `goto` call with the updated `$page`
			}
		} else if (personaIndex !== $personaIndexSelection) {
			dispatch('SelectPersona', {persona_id: get(persona).persona_id});
		} // else already selected

		// TODO speed this up with a map of communityByName
		const communityStore = $communities.find((c) => get(c).name === params.community);
		if (!communityStore) return; // occurs when a session routes to a community they can't access
		const community = get(communityStore);
		const {community_id} = community;
		if (community_id !== $communityIdSelection) {
			dispatch('SelectCommunity', {community_id});
		}
		if (community_id) {
			const spaceUrl = '/' + (params.space || '');
			//TODO lookup space by url
			const space = $spacesByCommunityId.get(community_id)!.find((s) => get(s).url === spaceUrl);
			if (!space) throw Error(`TODO Unable to find space: ${spaceUrl}`);
			const {space_id} = get(space);
			if (space_id !== $spaceIdSelectionByCommunityId[community_id]) {
				dispatch('SelectSpace', {community_id, space_id});
			}
		} else {
			// TODO what is this condition?
		}
	};

	let mounted = false;

	onMount(() => {
		mounted = true;
		return () => {
			socket.disconnect();
		};
	});

	// Keep the socket connected when logged in, and disconnect when logged out.
	$: if (mounted) {
		if (guest) {
			socket.disconnect();
		} else {
			socket.connect(WEBSOCKET_URL);
		}
	}
</script>

<svelte:body
	use:contextmenu.action={[
		[ActingPersonaContextmenu, selectedPersona ? {persona: selectedPersona} : undefined],
		[AppContextmenu, null],
	]} />

<svelte:head>
	<link rel="shortcut icon" href="/favicon.png" />
</svelte:head>

<div class="layout" class:mobile={$mobile}>
	{#if !guest && !onboarding}
		<Luggage />
		<MainNav />
	{/if}
	<main>
		{#if guest}
			<div class="account column markup">
				<AccountForm {guest} />
			</div>
		{:else if onboarding}
			<div class="column">
				<Onboard />
			</div>
		{:else}
			<slot />
		{/if}
	</main>
	<DevmodeControls {devmode} />
	<Dialogs {dialogs} on:close={() => dispatch('CloseDialog')} />
	<Contextmenu {contextmenu} {LinkContextmenu} />
	<FeltWindowHost query={() => ({hue: randomHue($account?.name || GUEST_PERSONA_NAME)})} />
</div>

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
	.account {
		align-items: center;
	}
</style>
