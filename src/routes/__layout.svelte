<script lang="ts">
	import '@feltcoop/felt/ui/style.css';
	import '$lib/ui/style.css';
	import {setDevmode} from '@feltcoop/felt/ui/devmode.js';
	import Devmode from '@feltcoop/felt/ui/Devmode.svelte';
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
	import {setApi, toApi} from '$lib/ui/api';
	import {setApp} from '$lib/ui/app';
	import {randomHue} from '$lib/ui/color';
	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {WEBSOCKET_URL} from '$lib/config';
	import {toWebsocketApiClient} from '$lib/ui/WebsocketApiClient';
	// import {toHttpApiClient} from '$lib/ui/HttpApiClient';
	import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';
	import {findService} from '$lib/ui/services';
	import type {Persona} from '$lib/vocab/persona/persona';
	import {goto} from '$app/navigation';
	import {PERSONA_QUERY_KEY, setUrlPersona} from '$lib/ui/url';
	import Contextmenu from '$lib/ui/contextmenu/Contextmenu.svelte';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';
	import {VITE_GIT_HASH} from '$lib/config';
	import {createContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import Avatar from '$lib/ui/Avatar.svelte';
	import {toIcon, toName} from '$lib/vocab/entity/entity';

	let initialMobileValue = false; // TODO this hardcoded value causes mobile view to change on load -- detect for SSR via User-Agent?
	const MOBILE_WIDTH = '50rem'; // treats anything less than 800px width as mobile
	if (browser) {
		// TODO to let the user override with their own preferred mobile setting,
		// which I could see wanting to do for various reasons including in `devmode`,
		// we need to either branch logic here, or have a different derived `media` value
		// that only reads this default value when the user has no override.
		const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_WIDTH})`);
		initialMobileValue = mediaQuery.matches;
		mediaQuery.onchange = (e) => dispatch('set_mobile', e.matches);
	}

	const devmode = setDevmode();
	const socket = setSocket(
		toSocketStore(
			(message) =>
				apiClient.handle(message.data, (broadcastMessage) => {
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
			() => dispatch('ping'),
		),
	);
	const ui = setUi(toUi(session, initialMobileValue));

	const apiClient = toWebsocketApiClient(findService, socket.send);
	// alternative http client:
	// const apiClient = toHttpApiClient(findService);
	const api = setApi(toApi(ui, apiClient));
	const contextmenu = createContextmenuStore();
	const app = setApp({ui, api, devmode, socket, contextmenu});
	if (browser) {
		(window as any).app = app;
		Object.assign(window, app);
		console.log('app', app);
	}
	$: browser && console.log('$session', $session);

	const {dispatch} = api;
	const {
		mobile,
		account,
		sessionPersonas,
		communities,
		selectedPersonaIndex,
		selectedCommunityId,
		selectedSpaceIdByCommunity,
		selectedPersona,
		setSession,
	} = ui;

	$: setSession($session);

	$: guest = $session.guest;
	$: onboarding = !guest && !$sessionPersonas.length;

	$: personaSelection = $selectedPersona; // TODO should these names be reversed?

	// TODO instead of dispatching `select` events on startup, try to initialize with correct values
	// TODO refactor -- where should this logic go?
	$: updateStateFromPageParams($page.params, $page.query);
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
		} else if (personaIndex !== $selectedPersonaIndex) {
			dispatch('select_persona', {persona_id: get(persona).persona_id});
		} // else already selected

		// TODO speed this up with a map of communities by name
		const communityStore = $communities.find((c) => get(c).name === params.community);
		if (!communityStore) return; // occurs when a session routes to a community they can't access
		const community = get(communityStore);
		const {community_id} = community;
		if (community_id !== $selectedCommunityId) {
			dispatch('select_community', {community_id});
		}
		if (community_id) {
			const spaceUrl = '/' + (params.space || '');
			const space = community.spaces.find((s) => s.url === spaceUrl);
			if (!space) throw Error(`TODO Unable to find space: ${spaceUrl}`);
			const {space_id} = space;
			if (space_id !== $selectedSpaceIdByCommunity[community_id]) {
				dispatch('select_space', {community_id, space_id});
			}
		} else {
			// TODO what is this condition?
		}
	};

	let mounted = false;

	onMount(() => {
		// TODO create the API client here -- do we need a `$client.ready` state
		// to abstract away `$socket.connected`? Probably so to support websocketless usage.
		mounted = true;
		return () => {
			// due to how Svelte works, this component's reactive expression that calls `socket.disconnect`
			// will not be called if `mounted = false` is assigned here while
			// the component is being destroyed, so we duplicate `socket.disconnect()`
			if ($socket.status === 'success') {
				socket.disconnect();
			}
		};
	});

	// TODO extract this logic to a websocket module or component
	let connecting = false;
	let connectCount = 0;
	const RECONNECT_DELAY = 1000; // this matches the current Vite/SvelteKit retry rate; we could use the count to increase this
	$: if (mounted) {
		// this expression re-runs when `$socket.status` changes, so we can ignore the `pending` status
		// and do the right thing after it finishes whatever is in progress
		if (guest) {
			if ($socket.status === 'success') {
				socket.disconnect();
			}
		} else {
			if ($socket.status === 'initial' && !connecting) {
				connectCount++;
				connecting = true;
				const connect = () => {
					connecting = false;
					socket.connect(WEBSOCKET_URL);
				};
				if (connectCount === 1) {
					connect();
				} else {
					setTimeout(connect, RECONNECT_DELAY);
				}
			}
		}
	}

	// TODO hacky, but if it sticks, upstream to Felt. maybe check things like `role="button"`?
	export const isInteractive = (el: Element): boolean =>
		el.tagName === 'A' || el.tagName === 'BUTTON' || !!el.closest('button,a');

	const onClickContextmenuWrapper = (e: MouseEvent) => {
		// this seems hacky, but improves the behavior to let us select content on the contextmenu,
		// but automatically closes if e.g. a button is clicked, and the button can `stopPropagation`
		// to keep the contextmenu open, because it'll stop it before this handler runs
		if (isInteractive(e.target as any)) {
			contextmenu.close();
		} else {
			e.stopPropagation();
		}
	};

	$: layoutEntities = ['app', personaSelection ? 'persona:' + $personaSelection.name : '']
		.filter(Boolean)
		.join(',');
	// TODO refactor this: unfortunately need to set on #root because dialog is outside of `.layout`
	$: browser && (document.getElementById('root')!.dataset.entity = layoutEntities);
</script>

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
			<div class="column markup">
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
	<Devmode {devmode} />
	<Contextmenu {contextmenu}>
		<!-- TODO refactor all of this -->
		<!-- TODO maybe ignore Community if there's a Space? So it could combine into one view instead of 2 -->
		<!-- TODO implement this for arbitrary items -- blocks? -->
		<div class="contextmenu-wrapper" on:click={onClickContextmenuWrapper}>
			{#each $contextmenu.entities as entity}
				{#if $devmode}
					<header class="panel-inset">{entity}</header>
				{/if}
				{#if entity === 'app'}
					{#if $devmode}
						<section>
							<ul>
								<li><a href="/docs">/docs</a></li>
							</ul>
						</section>
						<section>
							<SocketConnection />
						</section>
					{/if}
					<section class="markup panel-inset">
						<p>
							<a href="https://github.com/feltcoop/felt-server" target="_blank" rel="noreferrer"
								>felt-server</a
							>
							version 💚
							<a
								href="https://github.com/feltcoop/felt-server/commit/{VITE_GIT_HASH}"
								target="_blank"
							>
								{VITE_GIT_HASH}
							</a>
						</p>
					</section>
				{:else if entity === 'luggage' || entity === 'selectedPersona'}
					<section class="markup panel-outset">
						{#if personaSelection}
							<Avatar name={toName($personaSelection)} icon={toIcon($personaSelection)} />
						{/if}
						<AccountForm guest={$session.guest} />
					</section>
					<!-- TODO refactor -->
				{:else if entity.startsWith('persona:')}
					<section class="markup panel-outset">
						<Avatar name={entity.substring('persona:'.length)} />
					</section>
				{:else if entity.startsWith('community:')}
					<section class="markup panel-outset">
						<Avatar name={entity.substring('community:'.length)} type="Community" />
					</section>
				{:else if entity.startsWith('space:')}
					<section class="markup panel-inset">
						<h3>{entity.substring('space:'.length)}</h3>
					</section>
				{:else if entity.startsWith('file:')}
					<section class="markup panel-inset">
						<p>TODO use file_id: {entity.substring('file:'.length)}</p>
					</section>
				{:else if entity.startsWith('link:')}
					<!-- TODO could do more if we had the original `target` element
							(but it might go stale on $contextmenu?) -->
					<!-- TODO if it's an external link, add target="_blank" -->
					<a href={entity.substring('link:'.length)}>
						<span class="icon">🔗</span>
						{entity.substring('link:'.length)}
					</a>
				{:else}
					<!-- <section class="markup">
						<p>TODO default for entity: {entity}</p>
					</section> -->
				{/if}
			{/each}
		</div>
	</Contextmenu>
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

	.contextmenu-wrapper header {
		text-align: center;
		font-family: var(--font_family_mono);
		font-size: var(--font_size_sm);
		color: var(--text_color_light);
		padding: var(--spacing_xs) 0;
	}

	.contextmenu-wrapper li a {
		padding: var(--spacing_xs) var(--spacing_sm);
		width: 100%;
	}

	.contextmenu-wrapper .markup {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.contextmenu-wrapper > section,
	.contextmenu-wrapper > a {
		border-bottom: var(--border);
	}
	.contextmenu-wrapper > section:last-child,
	.contextmenu-wrapper > a:last-child {
		border-bottom: none;
	}

	.contextmenu-wrapper > a {
		display: flex;
		align-items: center;
		width: 100%;
		word-break: break-word;
	}

	.icon {
		display: flex;
		font-size: var(--icon_size_sm);
		padding: var(--spacing_sm);
	}
</style>
