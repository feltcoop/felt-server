<script lang="ts">
	import {isEditable} from '@feltcoop/felt/util/dom.js';
	import {type SvelteComponent} from 'svelte';

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

	const onWindowKeydown = (e: KeyboardEvent) => {
		console.log('e.key', e.key);
		if (e.key === 'Escape' && !(e.target instanceof HTMLElement && isEditable(e.target))) {
			contextmenu.close();
			e.stopPropagation();
		} else if (e.key === 'ArrowLeft') {
			contextmenu.collapseSelected();
			e.stopPropagation();
		} else if (e.key === 'ArrowRight') {
			contextmenu.expandSelected();
			e.stopPropagation();
		} else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
			contextmenu.selectNext();
			e.stopPropagation();
		} else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
			contextmenu.selectPrevious();
			e.stopPropagation();
		} else if (e.key === 'Home') {
			contextmenu.selectFirst();
			e.stopPropagation();
		} else if (e.key === 'End') {
			contextmenu.selectLast();
			e.stopPropagation();
		} else if (e.key === ' ' || e.key === 'Enter') {
			contextmenu.activateSelected();
			e.stopPropagation();
		}
	};

	const isInteractive = (el: Element): boolean => !!el.closest('button,a,area,[role=menuitem]');

	const onClickContent = (e: MouseEvent) => {
		if (isInteractive(e.target as any)) {
			contextmenu.close();
		} else {
			e.stopPropagation();
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
</script>

<!-- TODO need long-press detection for contextmenu on iOS -->
<!-- TODO ensure `mousedown` works everywhere; might want to add `touchstart` or substitute `pointerdown` -->
<!-- Capture keydown so it can handle the event before any dialogs. -->
<svelte:window
	on:contextmenu|capture={(e) => onContextmenu(e, contextmenu, el, LinkContextmenu)}
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
		on:click={onClickContent}
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
		--icon_size: var(--icon_size_sm);
		position: fixed;
		left: 0;
		top: 0;
		z-index: 9;
		width: var(--contextmenu_width);
		border: var(--border);
	}
	ul {
		border-bottom: var(--border);
	}
	ul:last-child {
		border-bottom: none;
	}
</style>
