<script lang="ts">
	import {getApp} from './app.js';
	import ContextMenuSection from './ContextMenuSection.svelte';

	const {
		api: {dispatch},
		entities,
	} = getApp();

	const {contextMenu} = entities;

	let contextMenuEl;

	const queryContextMenuEntityIds = (target: HTMLElement): string[] => {
		const ids: string[] = [];
		let el: HTMLElement | null = target;
		while ((el = el && el.closest('[data-entity]'))) {
			for (const id of el.dataset.entity.split(',')) {
				if (!ids.includes(id)) {
					ids.push(id);
				}
			}
			el = el.parentElement;
		}
		return ids;
	};

	const onContextMenu = (e) => {
		if (e.ctrlKey) return; // defer control!
		const entities = queryContextMenuEntityIds(e.target);
		if (!entities.length) return; // TODO should we close if open?
		e.preventDefault();
		e.stopPropagation();
		dispatch({type: 'contextMenu.open', entities, positionLeft: e.clientX, positionTop: e.clientY});
	};

	const onWindowClickCapture = (e) => {
		if ($contextMenu.isOpen && !contextMenuEl.contains(e.target)) {
			dispatch({type: 'contextMenu.close'});
			// allow the click to continue doing what it was going to do
		}
	};

	const onWindowKeyDownCapture = (e) => {
		if ($contextMenu.isOpen && e.key === 'Escape') {
			dispatch({type: 'contextMenu.close'});
			e.stopImmediatePropagation();
			e.preventDefault();
		}
	};
</script>

<svelte:window
	on:contextmenu={onContextMenu}
	on:click|capture={onWindowClickCapture}
	on:keydown|capture={onWindowKeyDownCapture}
/>

<!--
	TODO This originally had an `in:scale` transition, `in:scale={{duration: 50}}`
	but even a 50ms animation makes it feel slow.
	Maybe a better solution is to show the content immediately, but animate the periphery.
-->
{#if $contextMenu.isOpen}
	<div
		class="context-menu pane"
		role="menu"
		aria-modal
		tabindex="-1"
		bind:this={contextMenuEl}
		style="transform: translate3d({$contextMenu.positionLeft}px, {$contextMenu.positionTop}px, 0);"
	>
		{#each $contextMenu.entities as entity (entity.id)}
			<ContextMenuSection {entity} />
		{/each}
	</div>
{/if}

<style>
	.context-menu {
		position: fixed;
		/* contain: content; // TODO should this be used? */
		left: 0;
		top: 0;
		z-index: 20;
		/* TODO styling */
		background-color: var(--color_bg_content);
		/* box-shadow: 2px 3px 4px rgba(0, 0, 0, 0.3); */
		/* TODO should this be `pane-light` or something?
		The `pane` shadow is too heavy because it's designed
		for contrast against a fullscreen darkened background. */
		--pane_box_shadow: 0px 2px 10px hsla(0, 100%, 0%, 0.2);
		border: var(--border);
		/* outline: 2px solid rgba(0, 0, 0, 0.3); */
		/* transform-origin: left top; */
		/* Like scaling above, making translate animate around the screen just doesn't feel great.  */
		/* transition: transform 0.05s ease-out; */
	}
</style>
