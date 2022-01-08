<script lang="ts">
	import {session} from '$app/stores';
	import {writable, type Writable} from 'svelte/store';

	import AccountForm from '$lib/ui/AccountForm.svelte';
	import {VITE_GIT_HASH} from '$lib/config';
	import Avatar from '$lib/ui/Avatar.svelte';
	import type {ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {getApp} from '$lib/ui/app';

	const {
		dispatch,
		ui: {personaSelection, spaceSelection},
	} = getApp();

	export let contextmenu: ContextmenuStore;
	export let devmode: Writable<boolean>;

	// TODO hacky, but if it sticks, upstream to Felt. maybe check things like `role="button"`?
	const isInteractive = (el: Element): boolean =>
		el.tagName === 'A' || el.tagName === 'BUTTON' || !!el.closest('button,a');

	const onClickContextmenuSlot = (e: MouseEvent) => {
		// TODO this is hacky, but improves the behavior to let us select content on the contextmenu,
		// but automatically closes if e.g. a button is clicked, and the button can `stopPropagation`
		// to keep the contextmenu open, because it'll stop it before this handler runs
		if (isInteractive(e.target as any)) {
			contextmenu.close();
		} else {
			e.stopPropagation();
		}
	};

	$: selectedPersona = $personaSelection;
	$: selectedSpace = $spaceSelection;

	$: items = $contextmenu.entities && Object.entries($contextmenu.entities);

	const persona = {};
	const community = writable({}) as any;
</script>

<!-- TODO refactor all of this -->
<!-- TODO maybe ignore Community if there's a Space? So it could combine into one view instead of 2 -->
<!-- TODO implement this for arbitrary items? blocks? -->
{#if items}
	<div class="contextmenu-slot" on:click={onClickContextmenuSlot}>
		{#each items as [key, value]}
			{#if $devmode}
				<header class="panel-inset">{key}</header>
			{/if}
			{#if key === 'app'}
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
			{:else if key === 'luggage' || key === 'selectedPersona'}
				<section class="markup panel-outset">
					<AccountForm guest={$session.guest} />
				</section>
				<!-- TODO refactor -->
			{:else if key === 'persona'}
				<section class="markup panel-outset">
					<Avatar name={value} />
					<button
						aria-label="Create Community"
						type="button"
						on:click={() =>
							dispatch('OpenDialog', {
								name: 'CommunityInput',
								props: {persona: selectedPersona, done: () => dispatch('CloseDialog')},
							})}
					>
						➕ Create Community
					</button>
					<button
						type="button"
						on:click={() => dispatch('OpenDialog', {name: 'ManageMembershipForm'})}
					>
						Manage Memberships
					</button>
				</section>
			{:else if key === 'community'}
				<section class="markup panel-outset">
					<Avatar name={value} type="Community" />
					<button
						type="button"
						on:click={() =>
							dispatch('OpenDialog', {
								name: 'SpaceInput',
								props: {persona, community, done: () => dispatch('CloseDialog')},
							})}
					>
						➕ Create Space
					</button>
					<button
						type="button"
						on:click={() =>
							dispatch('OpenDialog', {
								name: 'MembershipInput',
								props: {community},
							})}
					>
						✉️ Invite Members
					</button>
					<button
						type="button"
						on:click={() =>
							dispatch('OpenDialog', {
								name: 'SpaceDelete',
								props: {space: selectedSpace, done: () => dispatch('CloseDialog')},
							})}
					>
						🗑️ Delete Space
					</button>
				</section>
			{:else if key === 'space'}
				<section class="markup panel-inset">
					<h3>{value}</h3>
				</section>
			{:else if key === 'entity'}
				<section class="markup panel-inset">
					<p>TODO use entity_id: {value}</p>
				</section>
			{:else if key === 'link'}
				<!-- TODO could do more if we had the original `target` element
							(but it might go stale on $contextmenu?) -->
				<!-- TODO if it's an external link, add target="_blank" -->
				<a href={value}>
					<span class="icon">🔗</span>
					{value}
				</a>
			{:else}
				<!-- <section class="markup">
						<p>TODO default for entity: {entity}</p>
					</section> -->
			{/if}
		{/each}
	</div>
{/if}

<style>
	.contextmenu-slot header {
		text-align: center;
		font-family: var(--font_family_mono);
		font-size: var(--font_size_sm);
		color: var(--text_color_light);
		padding: var(--spacing_xs) 0;
	}

	.contextmenu-slot li a {
		padding: var(--spacing_xs) var(--spacing_sm);
		width: 100%;
	}

	.contextmenu-slot > section,
	.contextmenu-slot > a {
		border-bottom: var(--border);
	}
	.contextmenu-slot > section:last-child,
	.contextmenu-slot > a:last-child {
		border-bottom: none;
	}

	.contextmenu-slot > a {
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
