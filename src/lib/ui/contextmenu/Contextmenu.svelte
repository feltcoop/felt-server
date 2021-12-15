<script lang="ts">
	import type {ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
	import {onContextmenu} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;

	const onClickWindow = () => {
		if ($contextmenu.opened) {
			contextmenu.close();
		}
	};
</script>

<svelte:window on:contextmenu={onContextmenu(contextmenu)} on:click={onClickWindow} />

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
		data-entity={$contextmenu.entities.join(',')}
		data-entity-stop-propagation
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
	}
</style>
