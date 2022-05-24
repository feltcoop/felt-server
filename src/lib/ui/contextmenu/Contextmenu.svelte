<script lang="ts">
	import {isEditable, swallow} from '@feltcoop/felt/util/dom.js';
	import type {SvelteComponent} from 'svelte';

	import {
		setContextmenu,
		setContextmenuDimensions,
		type ContextmenuStore,
		onContextmenu,
	} from '$lib/ui/contextmenu/contextmenu';

	// TODO upstream to Felt

	// The `contextmenu` prop cannot be changed because that's a rare corner case and
	// it's easier to put the `contextmenu` directly in the context.
	// If you need to change the contextmenu prop for some reason, use a `{#key contextmenu}` block:
	// https://svelte.dev/docs#template-syntax-key
	export let contextmenu: ContextmenuStore;
	export let LinkContextmenu: typeof SvelteComponent;

	setContextmenu(contextmenu);

	let el: HTMLElement;

	// This handler runs during the event's `capture` phase
	// so that things like the Dialog don't eat the events and prevent the contextmenu from closing.
	const onWindowMousedown = (e: MouseEvent) => {
		if (!el.contains(e.target as any)) {
			contextmenu.close();
		}
	};

	const onWindowKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Escape' && !isEditable(e.target)) {
			contextmenu.close();
			swallow(e);
		} else if (e.key === 'ArrowLeft' && !isEditable(e.target)) {
			contextmenu.collapseSelected();
			swallow(e);
		} else if (e.key === 'ArrowRight' && !isEditable(e.target)) {
			contextmenu.expandSelected();
			swallow(e);
		} else if ((e.key === 'ArrowDown' || e.key === 'PageDown') && !isEditable(e.target)) {
			contextmenu.selectNext();
			swallow(e);
		} else if ((e.key === 'ArrowUp' || e.key === 'PageUp') && !isEditable(e.target)) {
			contextmenu.selectPrevious();
			swallow(e);
		} else if (e.key === 'Home' && !isEditable(e.target)) {
			contextmenu.selectFirst();
			swallow(e);
		} else if (e.key === 'End' && !isEditable(e.target)) {
			contextmenu.selectLast();
			swallow(e);
		} else if ((e.key === ' ' || e.key === 'Enter') && !isEditable(e.target)) {
			await contextmenu.activateSelected();
			swallow(e);
		}
	};

	$: ({layout} = contextmenu);
	$: ({open} = $contextmenu);
	$: contextmenuX = $contextmenu.x; // pull off `contextmenu` to avoid unnecessary recalculations
	$: contextmenuY = $contextmenu.y;
	const dimensions = setContextmenuDimensions();
	$: if (el) updateDimensions();
	const updateDimensions = () => {
		const rect = el.getBoundingClientRect();
		$dimensions = {width: rect.width, height: rect.height};
	};
	$: x = contextmenuX + Math.min(0, $layout.width - (contextmenuX + $dimensions.width));
	$: y = contextmenuY + Math.min(0, $layout.height - (contextmenuY + $dimensions.height));

	const onWindowContextmenu = (e: MouseEvent) => {
		if (e.target instanceof Element && el?.contains(e.target)) {
			if (!e.target.closest('a')) swallow(e);
			return;
		}
		onContextmenu(e, contextmenu, LinkContextmenu);
	};
</script>

<!-- TODO need long-press detection for contextmenu on iOS -->
<!-- TODO ensure `mousedown` works everywhere; might want to add `touchstart` or substitute `pointerdown` -->
<!-- Capture keydown so it can handle the event before any dialogs. -->
<svelte:window
	on:contextmenu|capture={onWindowContextmenu}
	on:mousedown|capture={open ? onWindowMousedown : undefined}
	on:keydown|capture={open ? onWindowKeydown : undefined}
/>

<!-- TODO Maybe animate a subtle highlight around the contextmenu as it appears? -->
{#if open}
	<div
		class="contextmenu pane"
		role="menu"
		aria-modal
		tabindex="-1"
		bind:this={el}
		style:transform="translate3d({x}px, {y}px, 0)"
	>
		{#each $contextmenu.items as [component, props] (component)}
			<ul>
				<svelte:component this={component} {...props} />
			</ul>
		{/each}
	</div>
{/if}

<style>
	.contextmenu {
		--icon_size: var(--icon_size_xs);
		position: fixed;
		left: 0;
		top: 0;
		z-index: 9;
		width: var(--contextmenu_width);
		border: var(--border);
	}
</style>
