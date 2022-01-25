<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;
	export let menuIndex: number; // TODO infer this automatically everywhere it appears
	export let itemIndex: number; // TODO infer this automatically everywhere it appears

	const selectItem = (e: MouseEvent) => {
		e.stopPropagation();
		contextmenu.selectItem(menuIndex, itemIndex);
	};

	$: selected = $contextmenu.selections[menuIndex]?.index === itemIndex;
</script>

<!-- TODO should be <a> ? 
https://www.w3.org/TR/wai-aria-practices/examples/menu-button/menu-button-links.html
how to handle the fact that they shouldn't receive focus? disable `Tab`?
-->
<li class="menu-item" role="menuitem" class:selected on:click on:mousemove={selectItem}>
	<slot />
</li>
