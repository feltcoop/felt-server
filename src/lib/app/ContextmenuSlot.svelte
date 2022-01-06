<script lang="ts">
	import {session} from '$app/stores';
	import type {Writable} from 'svelte/store';

	import AccountForm from '$lib/ui/AccountForm.svelte';
	import SocketConnection from '$lib/ui/SocketConnection.svelte';
	import {VITE_GIT_HASH} from '$lib/config';
	import Avatar from '$lib/ui/Avatar.svelte';
	import type {ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

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
</script>

<!-- TODO refactor all of this -->
<!-- TODO maybe ignore Community if there's a Space? So it could combine into one view instead of 2 -->
<!-- TODO implement this for arbitrary items? blocks? -->
<div class="contextmenu-slot" on:click={onClickContextmenuSlot}>
	{#each $contextmenu.entities as entity}
		{#if $devmode}
			<header class="panel-inset">{entity}</header>
		{/if}
		{#if entity === 'app'}
			<section class="markup panel-inset">
				<p>
					<a href="https://github.com/feltcoop/felt-server" target="_blank" rel="noreferrer"
						>felt-server</a
					>
					version 💚
					<a href="https://github.com/feltcoop/felt-server/commit/{VITE_GIT_HASH}" target="_blank">
						{VITE_GIT_HASH}
					</a>
				</p>
			</section>
		{:else if entity === 'luggage' || entity === 'selectedPersona'}
			<section class="markup panel-outset">
				<AccountForm guest={$session.guest} />
			</section>
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
		{:else if entity.startsWith('entity:')}
			<section class="markup panel-inset">
				<p>TODO use entity_id: {entity.substring('entity:'.length)}</p>
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
