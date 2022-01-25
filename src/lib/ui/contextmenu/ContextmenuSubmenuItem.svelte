<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;
	export let menuIndex: number; // TODO infer this automatically everywhere it appears
	export let itemIndex: number; // TODO infer this automatically everywhere it appears

	// TODO add toggle action to the button that opens the menu and focuses on the first item
	// TODO add larger transparent cursor hit area
	// TODO fix keyboard nav (is the delay between focus the problem?)

	$: expanded = $contextmenu.selections[menuIndex]?.index === itemIndex;

	const selectItem = (e: MouseEvent) => {
		e.stopPropagation();
		contextmenu.selectSubmenuItem(menuIndex, itemIndex);
	};
</script>

<!-- TODO focusout shouldn't be used because focus blips off while tabbing -->
<ul class="contextmenu-submenu-item" role="menu" on:mousemove={selectItem} aria-expanded={expanded}>
	<li class="menu-item" role="menuitem" on:click|stopPropagation>
		<slot name="button" />
		<div class="chevron" />
	</li>
	{#if expanded}
		<ul class="contextmenu-submenu pane" role="menu" style="transform: translate3d(100%, 0, 0)">
			<slot name="menu">TODO no menu content (make this a Message?)</slot>
		</ul>
	{/if}
</ul>

<style>
	.contextmenu-submenu-item {
		position: relative;
	}
	.chevron {
		padding-left: 5px;
	}
	.contextmenu-submenu {
		position: absolute;
		/* TODO this is a hack to avoid the pixel gap, probably change to 0 after adding transparent bg hitbox */
		left: -1px;
		top: 0;
		width: var(--contextmenu_width);
	}
</style>
