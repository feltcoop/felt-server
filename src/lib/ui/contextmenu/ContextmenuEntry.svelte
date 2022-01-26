<script lang="ts">
	import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

	export let contextmenu: ContextmenuStore;

	const entry = contextmenu.addItem();
	console.log('entry', entry);

	const select = (e: MouseEvent) => {
		e.stopPropagation();
		contextmenu.selectEntry(entry);
	};

	$: selected = $contextmenu.selections[menuIndex]?.index === itemIndex;
</script>

<!-- TODO should be <a> ? 
https://www.w3.org/TR/wai-aria-practices/examples/menu-button/menu-button-links.html
how to handle the fact that they shouldn't receive focus? disable `Tab`?
-->
<li class="menu-item" role="menuitem" class:selected on:click on:mousemove={select}>
	<slot />
</li>
