<script lang="ts">
	import type {ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {CONTEXT_MENU_OFFSET_X, CONTEXT_MENU_OFFSET_Y} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;

	const queryContextmenuEntityIds = (target: HTMLElement | SVGElement): string[] => {
		const ids: string[] = [];
		let el: HTMLElement | SVGElement | null = target;
		while ((el = el && el.closest('[data-entity]'))) {
			for (const id of el.dataset.entity!.split(',')) {
				if (!ids.includes(id)) {
					ids.push(id);
				}
			}
			el = el.parentElement;
		}
		return ids;
	};

	const onContextmenu = (e: MouseEvent) => {
		if (e.ctrlKey) return; // defer control!
		const entities = queryContextmenuEntityIds(e.target as any); // TODO improve type to avoid casting?
		console.log('contextmenu entities', entities);
		if (!entities.length) return; // TODO should we close if open?
		e.preventDefault();
		e.stopPropagation(); // TODO maybe don't swallow it?
		// TODO dispatch event
		contextmenu.open(
			entities,
			e.clientX + CONTEXT_MENU_OFFSET_X,
			e.clientY + CONTEXT_MENU_OFFSET_Y,
		);
	};

	const onClickWindow = () => {
		if ($contextmenu.opened) {
			contextmenu.close();
		}
	};
</script>

<svelte:window on:contextmenu={onContextmenu} on:click={onClickWindow} />

<!--
	TODO This originally had an `in:scale` transition, `in:scale={{duration: 50}}`
	but even a 50ms animation makes it feel slow.
	Maybe a better solution is to show the content immediately, but animate the periphery.
-->
{#if $contextmenu.opened}
	<div
		class="contextmenu pane"
		role="menu"
		aria-modal
		tabindex="-1"
		style="transform: translate3d({$contextmenu.x}px, {$contextmenu.y}px, 0);"
	>
		<!-- TODO how much control should this component have over the contents? any? -->
		<!-- {#each $contextmenu.entities as entity (entity.id)}
			<ContextmenuSection {entity} />
		{/each} -->
		<slot />
	</div>
{/if}

<style>
	.contextmenu {
		/* contain: strict; */
		position: fixed;
		left: 0;
		top: 0;
		z-index: 9;
		width: var(--column_width_min);
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
