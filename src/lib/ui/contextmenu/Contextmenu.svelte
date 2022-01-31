<script lang="ts">
	import {isEditable} from '@feltcoop/felt/util/dom.js';
	import {type SvelteComponent} from 'svelte';

	import {setContextmenu, type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {onContextmenu} from '$lib/ui/contextmenu/contextmenu';

	// TODO upstream to Felt

	// The `contextmenu` prop cannot be changed because that's a rare corner case and
	// it's easier to put the `contextmenu` directly in the context.
	// If you need to change the contextmenu prop for some reason, use a `{#key contextmenu}` block:
	// https://svelte.dev/docs#template-syntax-key
	export let contextmenu: ContextmenuStore;
	export let LinkContextmenu: typeof SvelteComponent;

	setContextmenu(contextmenu);

	let contextmenuEl: HTMLElement;

	// This handler runs during the event's `capture` phase
	// so that things like the Dialog don't eat the events and prevent the contextmenu from closing.
	const onWindowMousedown = (e: MouseEvent) => {
		if (!contextmenuEl.contains(e.target as any)) {
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

	$: console.log('$contextmenu', $contextmenu);
</script>

<!-- TODO need long-press detection for contextmenu on iOS -->
<!-- TODO ensure `mousedown` works everywhere; might want to add `touchstart` or substitute `pointerdown` -->
<!-- Capture keydown so it can handle the event before any dialogs. -->
<svelte:window
	on:contextmenu|capture={(e) => onContextmenu(e, contextmenu, contextmenuEl, LinkContextmenu)}
	on:mousedown|capture={$contextmenu.open ? onWindowMousedown : undefined}
	on:keydown|capture={$contextmenu.open ? onWindowKeydown : undefined}
/>

<!-- TODO Maybe animate a subtle highlight around the contextmenu as it appears? -->
{#if $contextmenu.open}
	<ul
		class="contextmenu pane"
		role="menu"
		aria-modal
		tabindex="-1"
		bind:this={contextmenuEl}
		style="transform: translate3d({$contextmenu.x}px, {$contextmenu.y}px, 0);"
		on:click={onClickContent}
	>
		{#each $contextmenu.items as [component, props] (component)}
			<section>
				<svelte:component this={component} {...props} />
			</section>
		{/each}
	</ul>
{/if}

<style>
	.contextmenu {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 9;
		width: var(--contextmenu_width);
		border: var(--border);
	}
	section {
		border-bottom: var(--border);
	}
	section:last-child {
		border-bottom: none;
	}
</style>
