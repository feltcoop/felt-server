<script lang="ts">
	import {type Writable} from 'svelte/store';

	import type {ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {contextmenuComponents} from '$lib/app/contextmenu/contextmenuComponents';

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

	$: entities = $contextmenu.entities && Object.entries($contextmenu.entities);
</script>

<!-- TODO refactor all of this -->
<!-- TODO maybe ignore Community if there's a Space? So it could combine into one view instead of 2 -->
<!-- TODO implement this for arbitrary entities? blocks? -->
{#if entities}
	<div class="contextmenu-slot" on:click={onClickContextmenuSlot}>
		{#each entities as [key]}
			{#if $devmode}
				<header class="panel-inset">{key}</header>
			{/if}
			{#if key in contextmenuComponents}
				<svelte:component this={contextmenuComponents[key]} {contextmenu} {entities} />
			{:else}
				<!-- TODO ? -->
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
