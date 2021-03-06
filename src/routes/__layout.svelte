<script lang="ts">
	import '@feltcoop/felt/ui/style.css';
	import '$lib/ui/style.css';
	import {setDevmode} from '@feltcoop/felt/ui/devmode.js';
	import DevmodeControls from '@feltcoop/felt/ui/DevmodeControls.svelte';
	import FeltWindowHost from '@feltcoop/felt/ui/FeltWindowHost.svelte';
	import {session, page} from '$app/stores';
	import {browser} from '$app/env';
	import Dialogs from '@feltcoop/felt/ui/dialog/Dialogs.svelte';
	import {Logger} from '@feltcoop/felt/util/log.js';
	import {isEditable, swallow} from '@feltcoop/felt/util/dom.js';

	import {toSocketStore} from '$lib/ui/socket';
	import Luggage from '$lib/ui/Luggage.svelte';
	import MainNav from '$lib/ui/MainNav.svelte';
	import Onboard from '$lib/ui/Onboard.svelte';
	import {setUi, toUi} from '$lib/ui/ui';
	import {syncUiToUrl} from '$lib/ui/syncUiToUrl';
	import {toDispatch, toDispatchBroadcastMessage} from '$lib/app/dispatch';
	import {setApp} from '$lib/ui/app';
	import {randomHue} from '$lib/ui/color';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {WEBSOCKET_URL} from '$lib/config';
	import {toWebsocketApiClient} from '$lib/ui/WebsocketApiClient';
	import {toHttpApiClient} from '$lib/ui/HttpApiClient';
	import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';
	import {findHttpService, findWebsocketService} from '$lib/ui/services';
	import Contextmenu from '$lib/ui/contextmenu/Contextmenu.svelte';
	import {components} from '$lib/app/components';
	import {mutations} from '$lib/app/mutations';
	import AppContextmenu from '$lib/app/contextmenu/AppContextmenu.svelte';
	import ActingPersonaContextmenu from '$lib/app/contextmenu/ActingPersonaContextmenu.svelte';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';
	import LinkContextmenu from '$lib/app/contextmenu/LinkContextmenu.svelte';
	import ErrorMessage from '$lib/ui/ErrorMessage.svelte';
	import {deserialize, deserializers} from '$lib/util/deserialize';

	const log = new Logger('[layout]');

	let initialMobileValue = false; // TODO this hardcoded value causes mobile view to change on load -- detect for SSR via User-Agent?
	const MOBILE_WIDTH = '50rem'; // treats anything less than 800px width as mobile
	if (browser) {
		// TODO to let the user override with their own preferred mobile setting,
		// which I could see wanting to do for various reasons including in `devmode`,
		// we need to either branch logic here, or have a different derived `media` value
		// that only reads this default value when the user has no override.
		const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_WIDTH})`);
		initialMobileValue = mediaQuery.matches;
		mediaQuery.onchange = (e) => dispatch.SetMobile(e.matches);
	}

	const devmode = setDevmode();
	const socket = toSocketStore(
		(message) => websocketClient.handle(message.data),
		() => dispatch.Ping(),
	);
	const ui = toUi(initialMobileValue, components, (errorMessage) => {
		dispatch.OpenDialog({Component: ErrorMessage, props: {text: errorMessage}});
	});
	setUi(ui);

	const dispatch = toDispatch(ui, mutations, (e) =>
		websocketClient.find(e) ? websocketClient : httpClient.find(e) ? httpClient : null,
	);
	const websocketClient = toWebsocketApiClient(
		findWebsocketService,
		socket.send,
		toDispatchBroadcastMessage(ui, mutations, dispatch),
		async (message) => {
			if (message.status === 401) {
				// this condition occurs when the server fails to parse and validate session cookies
				// TODO maybe display an error on the login screen
				if ($session.guest) {
					await dispatch.Logout();
				} else {
					$session = {guest: true};
				}
			} else {
				log.error('unhandled status message', message);
			}
		},
		deserialize(deserializers),
	);
	const httpClient = toHttpApiClient(findHttpService, deserialize(deserializers));
	const app = setApp({ui, dispatch, devmode, socket});
	if (browser) {
		(window as any).app = app;
		Object.assign(window, app);
		log.trace('app', app);
	}

	// TODO might need to dispatch during initialization:
	// https://github.com/feltcoop/felt-server/pull/397/files#r923790411
	$: dispatch.SetSession({session: $session});

	const {mobile, layout, contextmenu, dialogs, account, sessionPersonas, personaSelection} = ui;

	$: guest = $session.guest;
	$: onboarding = !guest && !$sessionPersonas.length;
	$: selectedPersona = $personaSelection; // must be after `updateStateFromPageParams`

	$: syncUiToUrl(ui, dispatch, $page.params, $page.url);

	let clientWidth: number;
	let clientHeight: number;
	$: $layout = {width: clientWidth, height: clientHeight}; // TODO event? `UpdateLayout`?

	// TODO `ShortcutKeys` or `Hotkeys` component with some interface
	const onWindowKeydown = async (e: KeyboardEvent) => {
		if (e.key === '`' && !e.ctrlKey && !isEditable(e.target)) {
			swallow(e);
			dispatch.ToggleMainNav();
		}
	};
</script>

<svelte:body
	use:contextmenu.action={[
		[ActingPersonaContextmenu, selectedPersona ? {persona: selectedPersona} : undefined],
		[AppContextmenu, null],
	]} />

<svelte:head>
	<link rel="shortcut icon" href="/favicon.png" />
</svelte:head>

<svelte:window on:keydown|capture={onWindowKeydown} />

<SocketConnection {socket} url={WEBSOCKET_URL} />

<div class="layout" class:mobile={$mobile} bind:clientHeight bind:clientWidth>
	{#if !guest && !onboarding}
		<Luggage />
		<MainNav />
	{/if}
	<main>
		{#if guest}
			<div class="account column markup padded-xl">
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
	<Dialogs {dialogs} on:close={() => dispatch.CloseDialog()} />
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
